// PORTED from flare/reporters/next/lib/flare.ts, by way of the Vite port in
// methods/src/lib/flare.ts — see the canonical file for the full rationale.
// This is a genuine port, not a copy: vroom is a Vite SPA with no server
// runtime, so there is no Node-vs-browser dual context to bridge. Every env
// read is Vite's own `import.meta.env.VITE_*` (Vite only inlines names under
// that exact prefix at build time — never a computed or aliased access), and
// the production gate is Vite's own `import.meta.env.PROD`.
//
// ONE DELIBERATE DIFFERENCE FROM methods: the release reads VITE_COMMIT_REF,
// not VITE_VERCEL_GIT_COMMIT_SHA. vroom is hosted on Netlify, where no Vercel
// variable is ever populated, so methods' name would leave `release` null on
// every event forever and nothing would report the omission. Netlify's own
// build variable is COMMIT_REF; netlify.toml maps it across the VITE_ prefix
// boundary, because Vite inlines nothing without it.
const ENDPOINT = import.meta.env.VITE_FLARE_URL;
const KEY = import.meta.env.VITE_FLARE_KEY;
const RELEASE = import.meta.env.VITE_COMMIT_REF ?? null;

const TIMEOUT_MS = 2_000;
const MAX_CONTEXT_CHARS = 8_000;

export type FlareKind = "server" | "client" | "job" | "soft";

/**
 * Three independent reasons to do nothing, checked on every call rather than
 * once at import: a missing key, a missing endpoint, or a non-production
 * build. Local dev would otherwise flood the queue with noise the auto-fix
 * runner would then try to fix.
 */
export function flareEnabled(): boolean {
  return Boolean(ENDPOINT) && Boolean(KEY) && import.meta.env.PROD === true;
}

/**
 * `context` is the one free-form field, so it is bounded by SERIALIZED length.
 * Over the limit it is dropped and replaced with a marker rather than truncated:
 * a clipped JSON string is unparseable, so a truncated context would be strictly
 * worse than none, and the marker lets triage say "something was discarded"
 * instead of implying the reporter sent nothing.
 */
export function boundContext(context: Record<string, unknown>): Record<string, unknown> | null {
  if (!context || Object.keys(context).length === 0) return null;
  let serialized: string;
  try {
    serialized = JSON.stringify(context);
  } catch {
    return { _flareDiscarded: "context was not serializable" };
  }
  if (typeof serialized !== "string") return { _flareDiscarded: "context was not serializable" };
  if (serialized.length > MAX_CONTEXT_CHARS) {
    return { _flareDiscarded: `context was ${serialized.length} chars, over the ${MAX_CONTEXT_CHARS} limit` };
  }
  return context;
}

export type FlarePayload = {
  kind: FlareKind;
  name: string;
  message: string;
  stack: string | null;
  url: string | null;
  release: string | null;
  environment: "production";
  occurredAt: number;
  context: Record<string, unknown> | null;
};

export function buildPayload(err: unknown, context: Record<string, unknown> = {}): FlarePayload {
  const { kind, url, ...rest } = context;
  const error = err instanceof Error ? err : new Error(typeof err === "string" ? err : "Unknown error");
  return {
    kind: (typeof kind === "string" ? kind : "server") as FlareKind,
    name: error.name || "Error",
    message: error.message || "Unknown error",
    stack: typeof error.stack === "string" ? error.stack : null,
    url: typeof url === "string" ? url : null,
    release: RELEASE,
    environment: "production",
    occurredAt: Date.now(),
    context: boundContext(rest),
  };
}

async function send(body: unknown): Promise<void> {
  if (!flareEnabled()) return;
  try {
    await fetch(ENDPOINT as string, {
      method: "POST",
      headers: { "content-type": "application/json", "x-flare-key": KEY as string },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
      keepalive: true,
    });
  } catch {
    // Swallowed on purpose. A monitoring library that breaks the app it
    // monitors is worse than no monitoring at all.
  }
}

export async function reportError(err: unknown, context: Record<string, unknown> = {}): Promise<void> {
  try {
    await send(buildPayload(err, context));
  } catch {
    // Unreachable in practice; present so no caller can ever receive a throw.
  }
}

export async function reportSoft(message: string, context: Record<string, unknown> = {}): Promise<void> {
  try {
    await send(buildPayload(new Error(message), { kind: "soft", ...context }));
  } catch {
    // As above.
  }
}

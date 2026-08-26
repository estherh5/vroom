import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App";
import { FlareBoundary } from "./components/FlareBoundary";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <FlareBoundary>
        <App />
      </FlareBoundary>
    </StrictMode>,
  );
}

const footer = document.getElementById("footer");
if (footer) {
  createRoot(footer).render(
    <StrictMode>
      <span>
        © Copyright 2017–{new Date().getFullYear()}{" "}
        <a href="https://crystalprism.io" title="Crystal Prism">
          Crystal Prism
        </a>
      </span>
    </StrictMode>,
  );
}

// PORTED from flare/reporters/next/components/FlareClient.tsx, by way of the
// same block in methods/src/main.tsx — a genuine port, not a copy: that
// component runs its buffering inside a `useEffect` so it can register and
// tear down per mount; vroom has roots that live for the whole page, so the
// same buffer/flush logic runs once here at the entry point instead, with no
// unmount to guard against.
//
// Window `error` and `unhandledrejection` fire for errors React's own boundary
// cannot catch — event handlers, timers, non-React script, and anything thrown
// by the footer root above, which is deliberately outside the boundary. So this
// and FlareBoundary are complementary, not redundant.
//
// Release reads VITE_COMMIT_REF for the reason given in lib/flare.ts: vroom is
// on Netlify, where no Vercel variable is ever set.
{
  const endpoint = import.meta.env.VITE_FLARE_URL;
  const key = import.meta.env.VITE_FLARE_KEY;
  if (endpoint && key && import.meta.env.PROD === true) {
    const MAX_BUFFERED = 20;
    const FLUSH_MS = 5_000;
    const release = import.meta.env.VITE_COMMIT_REF ?? null;

    type Buffered = {
      kind: "client";
      name: string;
      message: string;
      stack: string | null;
      url: string | null;
      release: string | null;
      environment: "production";
      occurredAt: number;
      context: null;
    };

    let buffer: Buffered[] = [];
    let dropped = 0;

    const push = (name: string, message: string, stack: string | null) => {
      // A render loop can throw thousands of times per second. Past the cap we
      // stop buffering but keep counting, so the flush can say how many were
      // lost rather than silently under-reporting.
      if (buffer.length >= MAX_BUFFERED) {
        dropped += 1;
        return;
      }
      buffer.push({
        kind: "client",
        name: name || "Error",
        message: message || "Unknown error",
        stack,
        url: window.location.pathname,
        release,
        environment: "production",
        occurredAt: Date.now(),
        context: null,
      });
    };

    const flush = (useBeacon: boolean) => {
      if (buffer.length === 0) return;
      const events = buffer;
      const lost = dropped;
      buffer = [];
      dropped = 0;
      if (lost > 0) {
        events.push({
          kind: "client",
          name: "FlareBufferOverflow",
          message: `${lost} further client errors on this page load were not buffered`,
          stack: null,
          url: window.location.pathname,
          release,
          environment: "production",
          occurredAt: Date.now(),
          context: null,
        });
      }
      const body = JSON.stringify({ events });
      try {
        // sendBeacon survives the page being torn down; fetch does not. It cannot
        // set a custom header, so the key rides as a query parameter on the
        // beacon path only. It is an ingest key, not a user credential.
        if (useBeacon && typeof navigator.sendBeacon === "function") {
          navigator.sendBeacon(
            `${endpoint}?k=${encodeURIComponent(key)}`,
            new Blob([body], { type: "application/json" }),
          );
          return;
        }
        void fetch(endpoint, {
          method: "POST",
          headers: { "content-type": "application/json", "x-flare-key": key },
          body,
          signal: AbortSignal.timeout(2_000),
          keepalive: true,
        }).catch(() => {});
      } catch {
        // Never let reporting break the page.
      }
    };

    window.addEventListener("error", (e: ErrorEvent) =>
      push(e.error?.name ?? "Error", e.message, e.error?.stack ?? null),
    );
    window.addEventListener("unhandledrejection", (e: PromiseRejectionEvent) => {
      const r = e.reason;
      push(r?.name ?? "UnhandledRejection", r?.message ?? String(r), r?.stack ?? null);
    });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush(true);
    });
    window.setInterval(() => flush(false), FLUSH_MS);
  }
}

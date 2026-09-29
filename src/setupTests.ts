import "@testing-library/jest-dom";
import { beforeEach, vi } from "vitest";

// jsdom does not implement matchMedia; provide a minimal stub for components
// that rely on it (e.g. useMediaQuery).
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

/**
 * The real network is out of bounds under test, by default.
 *
 * src/api.ts calls the Booking API on RapidAPI when a key is configured, and
 * src/lib/flare.ts reports errors to flare. "No key is set in tests" is a
 * coincidence, not a guard: a key present in the environment the suite runs
 * under would turn an unstubbed search into a real, billed request, and
 * flare's nightly autofix job runs `npm test` in each app repo with live
 * secrets in its environment. This is the guard: a test reaches the wire only
 * by saying so. A test's own `vi.spyOn(globalThis, "fetch")` or
 * `vi.stubGlobal("fetch", ...)` runs after the hook below and overrides it.
 *
 * IT IS ASSIGNED AT MODULE LOAD, NOT ONLY IN THE HOOK. A guard installed
 * solely with `vi.stubGlobal` records the REAL `fetch` as the value to
 * restore, so the first `vi.unstubAllGlobals()` in any test would hand the
 * wire back to every later test in the same file, with nothing to see.
 * Assigning here makes the guard the baseline a restore lands on — and the
 * value `vi.restoreAllMocks()` puts back after src/api.test.ts's spies.
 * `src/vitest-network-guard.test.ts` pins both halves — the refusal, and the
 * return after an unstub.
 */
const blockNetwork = (async (input: unknown) => {
  const target =
    typeof input === "string" ? input : ((input as { url?: string })?.url ?? String(input));
  throw new Error(
    `Blocked a real network call from a test: ${target}\n` +
      "Nothing under test may reach the wire. Stub it in the test that needs it:\n" +
      '  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }))',
  );
}) as unknown as typeof fetch;

globalThis.fetch = blockNetwork;

// And again between tests, so a suite that stubs `fetch` without unstubbing it
// cannot leave the next test in the same file holding its stub. Assignment
// rather than `vi.stubGlobal`, so vitest's own "original" — the value an
// unstub restores — stays the guard above in every ordering.
beforeEach(() => {
  globalThis.fetch = blockNetwork;
});

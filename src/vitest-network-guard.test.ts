import { describe, it, expect, vi } from "vitest";

/**
 * Pins the guard in src/setupTests.ts.
 *
 * flare's nightly autofix job runs this suite's `npm test` with live secrets
 * in its environment, and src/api.ts makes a real, billed Booking API call
 * whenever a key is present. The guard makes an unstubbed fetch a refusal
 * rather than a request; these cases are what stop it being quietly deleted
 * or configured away.
 */
describe("the test-environment network guard", () => {
  it("refuses an unstubbed fetch, naming the target", async () => {
    await expect(
      fetch("https://booking-com15.p.rapidapi.com/api/v1/cars/searchCarRentals"),
    ).rejects.toThrow(
      /Blocked a real network call from a test: https:\/\/booking-com15\.p\.rapidapi\.com\/api\/v1\/cars\/searchCarRentals/,
    );
  });

  it("tells the reader how to stub it, so the refusal is actionable", async () => {
    await expect(fetch("https://example.com")).rejects.toThrow(/vi\.stubGlobal\("fetch"/);
  });

  it("yields to a test that stubs fetch deliberately", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    await expect(fetch("https://example.com")).resolves.toMatchObject({ ok: true });
  });

  it("is reinstated for the next test, so one stub cannot disarm the suite", async () => {
    await expect(fetch("https://example.com")).rejects.toThrow(/Blocked a real network call/);
  });

  it("comes back after vi.unstubAllGlobals — the restore must land on the guard, not the wire", async () => {
    /**
     * A guard installed only with `vi.stubGlobal` records the REAL `fetch` as
     * the value to restore, so any stub-then-unstub would silently hand the
     * wire back to every later test in the file. The guard lives on
     * `globalThis` from module load, so it IS what a restore restores to.
     *
     * The target is the discard port on loopback rather than a real host:
     * when this assertion is red, it must be red without a packet leaving the
     * machine.
     */
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    vi.unstubAllGlobals();
    await expect(fetch("http://127.0.0.1:9/")).rejects.toThrow(/Blocked a real network call/);
  });
});

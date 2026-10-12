import { describe, expect, it, vi } from "vitest";
import fallback from "./fleet-fallback.json";
import { getFleetApps, shapeFleet, type FleetApp } from "./fleet";

const a = (key: string, status: "live" | "hidden" = "live"): FleetApp => ({
  key, name: key.toUpperCase(), url: `https://${key}.crystalprism.io/`,
  icon: `https://crystalprism.io/images/${key}-icon.png`, tagline: "t", status,
});

describe("shapeFleet", () => {
  it("marks the current app and drops hidden ones", () => {
    const out = shapeFleet([a("giftme"), a("nexus"), a("ration", "hidden")], "giftme");
    expect(out.map((e) => [e.key, e.current])).toEqual([["giftme", true], ["nexus", false]]);
  });
  it("keeps the current app even when hidden", () => {
    const out = shapeFleet([a("ration", "hidden"), a("nexus")], "ration");
    expect(out.map((e) => e.key)).toEqual(["ration", "nexus"]);
  });
  it("skips malformed entries", () => {
    const out = shapeFleet([a("nexus"), { key: "x" }, null, 7], "giftme");
    expect(out.map((e) => e.key)).toEqual(["nexus"]);
  });
  it("falls back to the baked list when raw is not a usable array", () => {
    for (const raw of [null, {}, "x", []]) {
      expect(shapeFleet(raw, "giftme").length).toBe(
        (fallback as FleetApp[]).filter((x) => x.status === "live" || x.key === "giftme").length,
      );
    }
  });
});

describe("getFleetApps", () => {
  const ok = (body: unknown) => async () => new Response(JSON.stringify(body), { status: 200 });
  it("uses the hosted list when it loads", async () => {
    const out = await getFleetApps("giftme", ok([a("giftme"), a("nexus")]) as typeof fetch);
    expect(out.map((e) => e.key)).toEqual(["giftme", "nexus"]);
  });
  it("falls back on non-200", async () => {
    const f = (async () => new Response("no", { status: 500 })) as typeof fetch;
    expect((await getFleetApps("giftme", f)).length).toBeGreaterThan(2);
  });
  it("falls back when fetch throws or JSON is bad", async () => {
    const boom = (async () => { throw new Error("down"); }) as typeof fetch;
    const bad = (async () => new Response("{not json", { status: 200 })) as typeof fetch;
    expect((await getFleetApps("giftme", boom)).length).toBeGreaterThan(2);
    expect((await getFleetApps("giftme", bad)).length).toBeGreaterThan(2);
  });
  it("passes a 3s timeout signal and hourly revalidate", async () => {
    let init: RequestInit & { next?: { revalidate?: number } } = {};
    const spy = (async (_u: unknown, i: typeof init) => { init = i; return new Response("[]"); }) as unknown as typeof fetch;
    const timeout = vi.spyOn(AbortSignal, "timeout");
    await getFleetApps("giftme", spy);
    expect(timeout).toHaveBeenCalledWith(3000);
    timeout.mockRestore();
    expect(init.signal).toBeInstanceOf(AbortSignal);
    expect(init.next?.revalidate).toBe(3600);
  });
});

import fallback from "./fleet-fallback.json";

// Copied byte-identical across the fleet. The list's source of truth is
// https://crystalprism.io/apps.json; the baked copy only covers an outage.
export type FleetApp = {
  key: string; name: string; url: string; icon: string; tagline: string;
  status: "live" | "hidden";
};
export type FleetEntry = FleetApp & { current: boolean };

export const FLEET_URL = "https://crystalprism.io/apps.json";

function isApp(x: unknown): x is FleetApp {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return ["key", "name", "url", "icon", "tagline"].every((k) => typeof o[k] === "string")
    && (o.status === "live" || o.status === "hidden");
}

export function shapeFleet(raw: unknown, currentKey: string): FleetEntry[] {
  const hosted = Array.isArray(raw) ? raw.filter(isApp) : [];
  const list = hosted.length ? hosted : (fallback as unknown[]).filter(isApp);
  return list
    .filter((app) => app.status === "live" || app.key === currentKey)
    .map((app) => ({ ...app, current: app.key === currentKey }));
}

export async function getFleetApps(currentKey: string, fetchImpl: typeof fetch = fetch): Promise<FleetEntry[]> {
  try {
    const res = await fetchImpl(FLEET_URL, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(3000),
    } as RequestInit);
    if (!res.ok) return shapeFleet(null, currentKey);
    return shapeFleet(await res.json(), currentKey);
  } catch {
    return shapeFleet(null, currentKey);
  }
}

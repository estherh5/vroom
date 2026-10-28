import { describe, expect, it } from "vitest";

import { readTrip, writeTrip, type Trip } from "./tripUrl";

const boston = {
  label: "Boston, MA, USA",
  placeId: "ChIJGzE9DS1l44kRoOhiASS_fHg",
  location: { lat: 42.3555, lng: -71.0565 },
};

const trip: Trip = {
  step: "confirm",
  location: boston,
  startDate: new Date(2026, 10, 3),
  endDate: new Date(2026, 10, 6),
  carId: "demo-ccar-42",
};

describe("trip URL", () => {
  it("round-trips a whole trip", () => {
    const search = writeTrip(trip);
    expect(search).toBe(
      "?step=confirm&place=Boston%2C+MA%2C+USA&placeId=ChIJGzE9DS1l44kRoOhiASS_fHg" +
        "&lat=42.3555&lng=-71.0565&from=2026-11-03&to=2026-11-06&car=demo-ccar-42",
    );
    expect(readTrip(search)).toEqual(trip);
  });

  it("writes nothing for an empty pickup", () => {
    expect(writeTrip({ step: "pickup", location: null, startDate: null, endDate: null, carId: null })).toBe("");
  });

  it("keeps a half-picked range as just its start", () => {
    const read = readTrip("?from=2026-11-03");
    expect(read.startDate).toEqual(new Date(2026, 10, 3));
    expect(read.endDate).toBeNull();
    expect(read.step).toBe("pickup");
  });

  it("sends a later step without its inputs back to pickup", () => {
    expect(readTrip("?step=rentals&from=2026-11-03&to=2026-11-06").step).toBe("pickup");
  });

  it("reads confirm without a car as rentals", () => {
    const search = writeTrip({ ...trip, step: "rentals" });
    expect(readTrip(search.replace("step=rentals", "step=confirm")).step).toBe("rentals");
  });

  it("drops malformed values", () => {
    const read = readTrip("?step=nope&place=X&placeId=Y&lat=abc&lng=1&from=2026-13-40&to=2026-11-01");
    expect(read).toEqual({ step: "pickup", location: null, startDate: null, endDate: null, carId: null });
  });

  it("drops a range that ends before it starts", () => {
    const read = readTrip("?from=2026-11-06&to=2026-11-03");
    expect(read.startDate).toBeNull();
    expect(read.endDate).toBeNull();
  });
});

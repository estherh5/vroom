import { afterEach, describe, expect, it, vi } from "vitest";

import { searchBookingCars, searchCars } from "./api";
import type { GeoLocation } from "./types";

const location: GeoLocation = {
  label: "Philadelphia, PA, USA",
  placeId: "philadelphia",
  location: { lat: 39.9526, lng: -75.1652 },
};

describe("searchCars", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns deterministic demo rental options by default", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const cars = await searchCars(
      location,
      new Date("2026-07-01"),
      new Date("2026-07-03"),
    );

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(cars).toHaveLength(6);
    expect(cars[0]).toMatchObject({
      selected: false,
      company: expect.any(String),
      address: {
        name: "Philadelphia Rental Center",
        address: location.label,
      },
    });
    expect(cars.map((car) => car.price)).toEqual(
      cars.map((car) => car.price).sort((a, b) => a - b),
    );
  });

  it("rejects Booking API logical failures returned with HTTP 200", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          status: false,
          message: "Something went wrong.",
        }),
        { status: 200 },
      ),
    );

    await expect(
      searchBookingCars(
        location,
        new Date("2026-07-01"),
        new Date("2026-07-03"),
      ),
    ).rejects.toThrow("Car rental request failed");
  });
});

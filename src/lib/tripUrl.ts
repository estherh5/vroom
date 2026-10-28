import { format, isValid, parse } from "date-fns";

import type { GeoLocation, SectionName } from "../types";

// The trip in progress, as kept in the query string so a refresh resumes it
// and browser Back walks the steps.
export interface Trip {
  step: SectionName;
  location: GeoLocation | null;
  startDate: Date | null;
  endDate: Date | null;
  carId: string | null;
}

const STEPS: SectionName[] = ["pickup", "rentals", "confirm"];
const DATE_FORMAT = "yyyy-MM-dd";

function readDate(value: string | null): Date | null {
  if (!value) {
    return null;
  }
  const date = parse(value, DATE_FORMAT, new Date());
  return isValid(date) ? date : null;
}

function readLocation(params: URLSearchParams): GeoLocation | null {
  const label = params.get("place");
  const placeId = params.get("placeId");
  const lat = Number(params.get("lat"));
  const lng = Number(params.get("lng"));
  if (!label || !placeId || !params.get("lat") || !params.get("lng")) {
    return null;
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }
  return { label, placeId, location: { lat, lng } };
}

// Parse a query string into a trip. Anything missing or malformed reads as
// not chosen yet, and a later step without the inputs it needs is pickup.
export function readTrip(search: string): Trip {
  const params = new URLSearchParams(search);
  const location = readLocation(params);
  let startDate = readDate(params.get("from"));
  let endDate = readDate(params.get("to"));
  if (startDate && endDate && endDate < startDate) {
    startDate = null;
    endDate = null;
  }
  if (!startDate) {
    endDate = null;
  }

  const requested = params.get("step") as SectionName;
  const complete = Boolean(location && startDate && endDate);
  const step = STEPS.includes(requested) && complete ? requested : "pickup";
  const carId = step === "confirm" ? params.get("car") : null;

  return {
    step: step === "confirm" && !carId ? "rentals" : step,
    location,
    startDate,
    endDate,
    carId,
  };
}

// Serialize a trip to a query string (with its leading "?", or "" for none).
export function writeTrip(trip: Trip): string {
  const params = new URLSearchParams();
  if (trip.step !== "pickup") {
    params.set("step", trip.step);
  }
  if (trip.location) {
    params.set("place", trip.location.label);
    params.set("placeId", trip.location.placeId);
    params.set("lat", String(trip.location.location.lat));
    params.set("lng", String(trip.location.location.lng));
  }
  if (trip.startDate) {
    params.set("from", format(trip.startDate, DATE_FORMAT));
  }
  if (trip.endDate) {
    params.set("to", format(trip.endDate, DATE_FORMAT));
  }
  if (trip.step === "confirm" && trip.carId) {
    params.set("car", trip.carId);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

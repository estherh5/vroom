import { format } from "date-fns";

import type { Car, GeoLocation } from "./types";

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const RAPIDAPI_HOST = "booking-com15.p.rapidapi.com";
const SERVER_PATH = import.meta.env.VITE_SERVER_PATH;

const MAX_RESULTS = 20;

// Shape of the fields we read from a RapidAPI car rental search result.
interface RentalResult {
  vehicle_id: string;
  vehicle_info: { v_name: string; image_url: string; group: string };
  supplier_info: {
    name: string;
    logo_url: string;
    latitude: string;
    longitude: string;
  };
  route_info: { pickup: { name: string; address: string } };
  pricing_info: { price: number };
}

// Booking data sent to the back-end server.
export interface BookingPayload {
  car: string;
  company_address: string;
  company_name: string;
  end_date: string;
  location: string;
  price: number;
  start_date: string;
}

// Search RapidAPI for rental cars at the given location and date range,
// returning up to 20 results sorted by price (cheapest first).
export async function searchCars(
  location: GeoLocation,
  startDate: Date,
  endDate: Date,
): Promise<Car[]> {
  const { lat, lng } = location.location;

  const params = new URLSearchParams({
    pick_up_latitude: String(lat),
    pick_up_longitude: String(lng),
    drop_off_latitude: String(lat),
    drop_off_longitude: String(lng),
    pick_up_date: format(startDate, "yyyy-MM-dd"),
    drop_off_date: format(endDate, "yyyy-MM-dd"),
    pick_up_time: "10:00",
    drop_off_time: "10:00",
    currency_code: "USD",
  });

  const response = await fetch(
    `https://${RAPIDAPI_HOST}/api/v1/cars/searchCarRentals?${params}`,
    {
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Car rental request failed");
  }

  const data = await response.json();
  const results: RentalResult[] = data.data.search_results;

  const cars: Car[] = results.slice(0, MAX_RESULTS).map((rental) => ({
    id: rental.vehicle_id,
    type: rental.vehicle_info.v_name,
    selected: false,
    image: rental.vehicle_info.image_url,
    companyLogo: rental.supplier_info.logo_url,
    group: rental.vehicle_info.group,
    company: rental.supplier_info.name,
    // Manhattan distance between the searched location and the supplier.
    distance:
      Math.abs(Number(rental.supplier_info.latitude) - lat) +
      Math.abs(Number(rental.supplier_info.longitude) - lng),
    address: rental.route_info.pickup,
    price: rental.pricing_info.price,
  }));

  cars.sort((a, b) => a.price - b.price);

  return cars;
}

// Post a booking to the back-end server and return its confirmation code.
export async function createBooking(payload: BookingPayload): Promise<string> {
  const response = await fetch(`${SERVER_PATH}api/vroom/booking`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Booking request failed");
  }

  return response.text();
}

import { format } from "date-fns";

import type { Car, GeoLocation } from "./types";

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const RAPIDAPI_HOST = "booking-com15.p.rapidapi.com";
const RENTAL_API_PROVIDER = import.meta.env.VITE_RENTAL_API_PROVIDER ?? "demo";
const SERVER_PATH = import.meta.env.VITE_SERVER_PATH;

const MAX_RESULTS = 20;
const DAY_IN_MS = 86_400_000;
const PRICELINE = "https://www.priceline.com/rc-static/vehicles/domestic_196x116";
const DEMO_COMPANY_LOGO = "/favicon.ico";

interface DemoCarTemplate {
  group: string;
  type: string;
  company: string;
  baseDailyPrice: number;
  baseDistance: number;
}

const DEMO_CARS: DemoCarTemplate[] = [
  {
    group: "ECAR",
    type: "Economy Car",
    company: "Vroom Demo Rentals",
    baseDailyPrice: 38,
    baseDistance: 0.4,
  },
  {
    group: "CCAR",
    type: "Compact Car",
    company: "Crystal Car Co.",
    baseDailyPrice: 43,
    baseDistance: 0.7,
  },
  {
    group: "ICAR",
    type: "Intermediate Car",
    company: "Prism Auto",
    baseDailyPrice: 49,
    baseDistance: 1.1,
  },
  {
    group: "SCAR",
    type: "Standard Car",
    company: "Blue Hour Rentals",
    baseDailyPrice: 56,
    baseDistance: 1.8,
  },
  {
    group: "FCAR",
    type: "Full-size Car",
    company: "Open Road Cars",
    baseDailyPrice: 64,
    baseDistance: 2.3,
  },
  {
    group: "MVAR",
    type: "Minivan",
    company: "Family Trip Rentals",
    baseDailyPrice: 82,
    baseDistance: 2.9,
  },
];

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

interface RentalSearchResponse {
  status?: boolean;
  data?: {
    search_results?: RentalResult[];
  };
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

function hashSearch(
  location: GeoLocation,
  startDate: Date,
  endDate: Date,
): number {
  const searchKey = [
    location.placeId,
    location.label,
    format(startDate, "yyyy-MM-dd"),
    format(endDate, "yyyy-MM-dd"),
  ].join("|");

  return Array.from(searchKey).reduce(
    (hash, char) => (hash * 31 + char.charCodeAt(0)) % 997,
    0,
  );
}

function rentalDays(startDate: Date, endDate: Date): number {
  const duration = endDate.getTime() - startDate.getTime();

  return Math.max(1, Math.ceil(duration / DAY_IN_MS));
}

// Generate stable demo rental options for development and static deployments.
function searchDemoCars(
  location: GeoLocation,
  startDate: Date,
  endDate: Date,
): Car[] {
  const locationName = location.label.split(",")[0] || "Local";
  const days = rentalDays(startDate, endDate);
  const seed = hashSearch(location, startDate, endDate);

  const cars = DEMO_CARS.map((template, index) => {
    const dailyPrice = template.baseDailyPrice + ((seed + index * 7) % 18);
    const distance = template.baseDistance + ((seed + index * 3) % 10) / 10;

    return {
      id: `demo-${template.group.toLowerCase()}-${seed}`,
      type: template.type,
      selected: false,
      image: `${PRICELINE}/${template.group}.png`,
      companyLogo: DEMO_COMPANY_LOGO,
      group: template.group,
      company: template.company,
      distance: Number(distance.toFixed(1)),
      address: {
        name: `${locationName} Rental Center`,
        address: location.label,
      },
      price: dailyPrice * days,
    };
  });

  cars.sort((a, b) => a.price - b.price);

  return cars;
}

// Search RapidAPI for rental cars at the given location and date range.
export async function searchBookingCars(
  location: GeoLocation,
  startDate: Date,
  endDate: Date,
): Promise<Car[]> {
  if (!RAPIDAPI_KEY) {
    throw new Error("Car rental request failed");
  }

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
    driver_age: "30",
    currency_code: "USD",
    location: "US",
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

  const data = (await response.json()) as RentalSearchResponse;
  const results = data.data?.search_results;

  if (data.status === false || !Array.isArray(results)) {
    throw new Error("Car rental request failed");
  }

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

// Search for rental cars at the given location and date range, returning
// results sorted by price (cheapest first).
export async function searchCars(
  location: GeoLocation,
  startDate: Date,
  endDate: Date,
): Promise<Car[]> {
  if (RENTAL_API_PROVIDER === "booking") {
    return searchBookingCars(location, startDate, endDate);
  }

  return searchDemoCars(location, startDate, endDate);
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

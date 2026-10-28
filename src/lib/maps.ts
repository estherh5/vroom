// Google Maps JavaScript API: the one script URL every map and place search
// shares (useScript dedupes by src), and the slice of its types Vroom uses.
import type { GeoLocation } from "../types";

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_KEY;
export const MAPS_SCRIPT = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}&libraries=places`;

interface LatLng {
  lat(): number;
  lng(): number;
}

interface FormattableText {
  text: string;
  // Google omits a startOffset of 0.
  matches: { startOffset?: number; endOffset: number }[];
}

interface Place {
  location?: LatLng | null;
  fetchFields(options: { fields: string[] }): Promise<unknown>;
}

export interface PlacePrediction {
  placeId: string;
  text: FormattableText;
  toPlace(): Place;
}

type SessionToken = object;

interface GoogleMapsApi {
  maps: {
    Map: new (element: HTMLElement, options: Record<string, unknown>) => object;
    places: {
      AutocompleteSessionToken: new () => SessionToken;
      AutocompleteSuggestion: {
        fetchAutocompleteSuggestions(request: {
          input: string;
          sessionToken: SessionToken;
          includedPrimaryTypes: string[];
          includedRegionCodes: string[];
        }): Promise<{ suggestions: { placePrediction: PlacePrediction | null }[] }>;
      };
    };
  };
}

declare global {
  interface Window {
    google?: GoogleMapsApi;
  }
}

// One session per pick: every keystroke's suggestions and the final place
// lookup share a token, which Google bills as a single session.
export function newPlaceSession(): SessionToken | null {
  const places = window.google?.maps.places;
  return places ? new places.AutocompleteSessionToken() : null;
}

// US cities matching what the user has typed, from Places API (New). The
// legacy AutocompleteService is closed to new Google customers.
export async function findCities(
  input: string,
  sessionToken: SessionToken,
): Promise<PlacePrediction[]> {
  const places = window.google?.maps.places;
  if (!places) {
    throw new Error("Google Maps places library is not loaded");
  }
  const { suggestions } = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
    input,
    sessionToken,
    includedPrimaryTypes: ["(cities)"],
    includedRegionCodes: ["us"],
  });
  return suggestions.flatMap((suggestion) =>
    suggestion.placePrediction ? [suggestion.placePrediction] : [],
  );
}

// The pickup location for a chosen suggestion. Fetching the place closes the
// session, and needs no Geocoding API.
export async function resolvePlace(prediction: PlacePrediction): Promise<GeoLocation> {
  const place = prediction.toPlace();
  await place.fetchFields({ fields: ["location"] });
  if (!place.location) {
    throw new Error(`Place ${prediction.placeId} has no location`);
  }
  return {
    label: prediction.text.text,
    placeId: prediction.placeId,
    location: { lat: place.location.lat(), lng: place.location.lng() },
  };
}

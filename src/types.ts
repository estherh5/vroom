// Shared application types.

// A navigable section of the app, represented by a header button.
export type SectionName = "pickup" | "rentals" | "confirm";

export interface SectionButtonData {
  name: SectionName;
  icon: string;
  bgColor: string;
  color: string;
  selected: boolean;
  disabled: boolean;
}

// A pickup location, as produced by react-geosuggest's onSuggestSelect.
export interface GeoLocation {
  label: string;
  placeId: string;
  location: { lat: number; lng: number };
}

// Pickup address for a rental car company.
export interface CarAddress {
  name: string;
  address: string;
}

// A rental car option displayed to the user.
export interface Car {
  id: string;
  type: string;
  selected: boolean;
  image: string;
  companyLogo: string;
  group: string;
  company: string;
  distance: number;
  address: CarAddress;
  price: number;
}

export type SortOption = "price" | "distance" | "type";

export type ServerStatus = "success" | "fail";

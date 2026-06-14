import "./PickupMap.css";

import type { CarAddress } from "../../types";

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_KEY;

interface Props {
  from: string;
  to: CarAddress;
}

// Map that displays directions from the user's location to the rental company.
export default function PickupMap({ from, to }: Props) {
  // Replace spaces with '+' for the Google Maps URL.
  const destination = to.address.split(" ").join("+");

  return (
    <iframe
      frameBorder="0"
      title="Rental car company map"
      src={
        `https://www.google.com/maps/embed/v1/directions?origin=place_id:${from}` +
        `&destination=${destination}&key=${GOOGLE_KEY}`
      }
    ></iframe>
  );
}

import { useEffect, useRef, useState } from "react";
import "./PickupMap.css";

import { useScript } from "../../hooks/useScript";
import type { CarAddress } from "../../types";

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_KEY;
const MAPS_SCRIPT = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}&libraries=places`;

type GoogleMap = object;

interface GoogleMapsApi {
  maps: {
    Map: new (
      element: HTMLElement,
      options: Record<string, unknown>,
    ) => GoogleMap;
  };
}

declare global {
  interface Window {
    google?: GoogleMapsApi;
  }
}

interface Props {
  from: string;
  to: CarAddress;
}

// Map that displays the rental company's pickup location.
export default function PickupMap({ from, to }: Props) {
  const status = useScript(MAPS_SCRIPT);
  const mapRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (status === "error") {
      setLoadError(true);
      return;
    }

    if (status !== "ready" || !mapRef.current) {
      return;
    }

    const google = window.google;
    if (!google || !to.location) {
      setLoadError(true);
      return;
    }

    setLoadError(false);

    new google.maps.Map(mapRef.current, {
      center: to.location,
      disableDefaultUI: true,
      zoom: 14,
      zoomControl: true,
    });
  }, [status, to.location]);

  const directionsUrl =
    `https://www.google.com/maps/dir/?api=1&origin=place_id:${from}` +
    `&destination=${encodeURIComponent(to.address)}`;

  return (
    <div className="pickup-map-container">
      <div
        className={"pickup-map " + (loadError ? "pickup-map-hidden" : "")}
        ref={mapRef}
      ></div>
      {!loadError && <div className="pickup-map-marker" aria-hidden="true" />}

      {loadError && (
        <div className="pickup-map-fallback">
          <div>Directions could not be loaded in-app.</div>
          <a href={directionsUrl} target="_blank" rel="noreferrer">
            Open directions in Google Maps
          </a>
        </div>
      )}
    </div>
  );
}

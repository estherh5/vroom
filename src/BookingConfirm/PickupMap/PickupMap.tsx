import { useEffect, useRef, useState } from "react";
import "./PickupMap.css";

import { useScript } from "../../hooks/useScript";
import type { CarAddress } from "../../types";

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_KEY;
const MAPS_SCRIPT = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}&libraries=places`;

type GoogleMap = object;
type DirectionsResult = object;

interface GoogleMapsApi {
  maps: {
    Map: new (
      element: HTMLElement,
      options: Record<string, unknown>,
    ) => GoogleMap;
    DirectionsRenderer: new (options: { map: GoogleMap }) => {
      setDirections: (result: DirectionsResult) => void;
    };
    DirectionsService: new () => {
      route: (
        request: Record<string, unknown>,
        callback: (result: DirectionsResult | null, status: string) => void,
      ) => void;
    };
    TravelMode: {
      DRIVING: string;
    };
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

// Map that displays directions from the user's location to the rental company.
export default function PickupMap({ from, to }: Props) {
  const status = useScript(MAPS_SCRIPT);
  const mapRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (status !== "ready" || !mapRef.current) {
      return;
    }

    const google = window.google;
    if (!google) {
      setLoadError(true);
      return;
    }

    setLoadError(false);

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 39.9526, lng: -75.1652 },
      disableDefaultUI: true,
      zoom: 11,
      zoomControl: true,
    });
    const directionsRenderer = new google.maps.DirectionsRenderer({ map });
    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin: { placeId: from },
        destination: to.address,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, routeStatus) => {
        if (!result || routeStatus !== "OK") {
          setLoadError(true);
          return;
        }

        directionsRenderer.setDirections(result);
      },
    );
  }, [from, status, to.address]);

  const directionsUrl =
    `https://www.google.com/maps/dir/?api=1&origin=place_id:${from}` +
    `&destination=${encodeURIComponent(to.address)}`;

  return (
    <div className="pickup-map-container">
      <div
        className={"pickup-map " + (loadError ? "pickup-map-hidden" : "")}
        ref={mapRef}
      ></div>

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

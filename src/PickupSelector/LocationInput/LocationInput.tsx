import Geosuggest, { type Suggest } from "react-geosuggest";
import "./LocationInput.css";

import { useScript } from "../../hooks/useScript";
import type { GeoLocation } from "../../types";

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_KEY;
const MAPS_SCRIPT = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}&libraries=places`;

interface Props {
  location: GeoLocation | null;
  setLocation: (location: GeoLocation | null) => void;
  disabled: boolean;
}

// Rental pickup location input, backed by Google Maps Places autocomplete.
export default function LocationInput({
  location,
  setLocation,
  disabled,
}: Props) {
  const status = useScript(MAPS_SCRIPT);

  const handleSuggestSelect = (suggest?: Suggest) => {
    // Only set the location when a real suggestion (object) is chosen.
    if (suggest) {
      setLocation(suggest as unknown as GeoLocation);
    }
  };

  return (
    <div className="d-flex align-items-center input-container">
      <i aria-hidden="true" className="fas fa-map-marker-alt p-2"></i>

      {status === "error" ? (
        <p className="location-status" role="alert">
          Place search didn’t load.
          <button type="button" onClick={() => window.location.reload()}>
            Reload
          </button>
        </p>
      ) : status !== "ready" ? (
        <p className="location-status" role="status">
          Loading place search…
        </p>
      ) : (
        <>
        {/* Geosuggest's own label points at its wrapper, not the input. */}
        <label className="visually-hidden-label" htmlFor="geosuggest__input--location-input">
          Pick-up location
        </label>
        <Geosuggest
          id="location-input"
          initialValue={location ? location.label : ""}
          placeholder="Pick up at..."
          autoComplete="off"
          country="us"
          types={["(cities)"]}
          disabled={disabled}
          onSuggestSelect={handleSuggestSelect}
        />
        </>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import "./PickupSelector.css";

import AdvanceButton from "../AdvanceButton/AdvanceButton";
import DateRangeInput from "./DateRangeInput/DateRangeInput";
import LocationInput from "./LocationInput/LocationInput";
import type { SearchStatus } from "../App";
import type { GeoLocation } from "../types";

interface Props {
  location: GeoLocation | null;
  setLocation: (location: GeoLocation | null) => void;
  startDate: Date | null;
  endDate: Date | null;
  setDates: (startDate: Date | null, endDate: Date | null) => void;
  status: SearchStatus;
  advanceSection: () => void;
}

// Rental pickup specifications (location and date range).
export default function PickupSelector({
  location,
  setLocation,
  startDate,
  endDate,
  setDates,
  status,
  advanceSection,
}: Props) {
  const busy = status === "busy";
  const [allowAdvance, setAllowAdvance] = useState(false);

  // Enable the Advance button only once every input has a value.
  useEffect(() => {
    setAllowAdvance(Boolean(startDate && endDate && location));
  }, [startDate, endDate, location]);

  return (
    <div className="row flex-column flex-nowrap no-gutters w-100 justify-content-start align-items-center pickup-container">
      <h1 className="intro p-4 mx-5">
        Welcome to <span className="brand">Vroom</span>, a speedy rental car booking app
      </h1>

      <div className="d-flex flex-wrap justify-content-center mx-5 pickup-input-container">
        <LocationInput
          location={location}
          setLocation={setLocation}
          disabled={busy}
        />

        <DateRangeInput
          startDate={startDate}
          endDate={endDate}
          setDates={setDates}
          disabled={busy}
        />

        <AdvanceButton
          disabled={!allowAdvance}
          busy={busy}
          label="Find cars"
          advanceSection={advanceSection}
        />
      </div>

      <div className="mx-5 search-outcome" role="alert">
        {status === "failed" ? (
          <>
            <p>We couldn’t search for cars. Check your connection, then try again.</p>
            <button type="button" className="search-retry" onClick={advanceSection}>
              Try again
            </button>
          </>
        ) : status === "empty" ? (
          <p>No cars there for those dates. Try other dates or a nearby city.</p>
        ) : null}
      </div>
    </div>
  );
}

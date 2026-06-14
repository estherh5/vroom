import { useEffect, useState } from "react";
import "./PickupSelector.css";

import AdvanceButton from "../AdvanceButton/AdvanceButton";
import DateRangeInput from "./DateRangeInput/DateRangeInput";
import LocationInput from "./LocationInput/LocationInput";
import type { GeoLocation } from "../types";

interface Props {
  location: GeoLocation | null;
  setLocation: (location: GeoLocation | null) => void;
  startDate: Date | null;
  endDate: Date | null;
  setDates: (startDate: Date | null, endDate: Date | null) => void;
  disabled: boolean;
  advanceSection: () => void;
}

// Rental pickup specifications (location and date range).
export default function PickupSelector({
  location,
  setLocation,
  startDate,
  endDate,
  setDates,
  disabled,
  advanceSection,
}: Props) {
  const [allowAdvance, setAllowAdvance] = useState(false);

  // Enable the Advance button only once every input has a value.
  useEffect(() => {
    setAllowAdvance(Boolean(startDate && endDate && location));
  }, [startDate, endDate, location]);

  return (
    <div className="row flex-column no-gutters w-100 justify-content-start align-items-center pickup-container">
      <div className="intro p-4 mx-5">
        Welcome to <a href=".">Vroom</a>, a speedy rental car booking app
      </div>

      <div className="d-flex flex-wrap justify-content-center mx-5 pickup-input-container">
        <LocationInput
          location={location}
          setLocation={setLocation}
          disabled={disabled}
        />

        <DateRangeInput
          startDate={startDate}
          endDate={endDate}
          setDates={setDates}
          disabled={disabled}
        />

        <AdvanceButton
          disabled={!allowAdvance}
          advanceSection={advanceSection}
        />
      </div>
    </div>
  );
}

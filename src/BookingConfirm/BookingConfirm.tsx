import { differenceInDays, format } from "date-fns";
import { useEffect, useRef } from "react";
import "./BookingConfirm.css";

import type { BookingStatus } from "../App";
import CarRow from "../CarTable/CarRow/CarRow";
import InfoHeader from "../InfoHeader/InfoHeader";
import ConfirmButton from "./ConfirmButton/ConfirmButton";
import PickupMap from "./PickupMap/PickupMap";
import type { Car, GeoLocation } from "../types";

interface Props {
  location: GeoLocation;
  startDate: Date;
  endDate: Date;
  selectedCar: Car;
  status: BookingStatus;
  confirmationCode: string | null;
  confirmBooking: () => void;
  bookAnother: () => void;
}

// Rental car booking confirmation view.
export default function BookingConfirm({
  location,
  startDate,
  endDate,
  selectedCar,
  status,
  confirmationCode,
  confirmBooking,
  bookAnother,
}: Props) {
  // Length of the rental period in days.
  const days = differenceInDays(endDate, startDate);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);

  // Arriving here is a step change: put focus on the step's heading.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  useEffect(() => {
    if (status === "done") doneRef.current?.focus();
  }, [status]);

  return (
    <div className="row no-gutters w-100 align-items-center justify-content-center confirm-container">
      <div className="d-flex flex-column align-items-center confirm-review-container">
        <h1 ref={headingRef} tabIndex={-1} className="step-heading">
          Review your car
        </h1>

        <InfoHeader
          location={location.label}
          startDate={startDate}
          endDate={endDate}
        />

        <div className="w-100">
          <CarRow
              id={selectedCar.id}
              selected={selectedCar.selected}
              days={days}
              group={selectedCar.group}
              company={selectedCar.company}
              companyLogo={selectedCar.companyLogo}
              address={selectedCar.address}
              image={selectedCar.image}
              type={selectedCar.type}
              price={selectedCar.price}
              distance={selectedCar.distance}
              selectCar={null}
            />
        </div>

        <div className="my-4 d-flex flex-column align-items-center booking-outcome">
          {status === "done" ? (
            <div className="booking-done" role="status">
              <h2 ref={doneRef} tabIndex={-1}>
                You’re booked
              </h2>
              <p>
                {selectedCar.type} from {selectedCar.company}, pick up{" "}
                {format(startDate, "MMM d")}.
              </p>
              <p className="booking-code-label">Confirmation code</p>
              <p className="booking-code">{confirmationCode}</p>
              <button type="button" className="book-another" onClick={bookAnother}>
                Book another car
              </button>
            </div>
          ) : (
            <>
              <ConfirmButton
                busy={status === "busy"}
                retry={status === "failed"}
                confirmBooking={confirmBooking}
              />
              <p className="booking-error" role="alert">
                {status === "failed"
                  ? "Your booking didn’t go through. Check your connection, then try again."
                  : ""}
              </p>
            </>
          )}
        </div>

        <PickupMap from={location.placeId} to={selectedCar.address} />
      </div>
    </div>
  );
}

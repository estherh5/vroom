import { differenceInDays } from "date-fns";
import "./BookingConfirm.css";

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
  disabled: boolean;
  confirmBooking: () => void;
}

// Rental car booking confirmation view.
export default function BookingConfirm({
  location,
  startDate,
  endDate,
  selectedCar,
  disabled,
  confirmBooking,
}: Props) {
  // Length of the rental period in days.
  const days = differenceInDays(endDate, startDate);

  return (
    <div className="row no-gutters w-100 align-items-center justify-content-center confirm-container">
      <div className="d-flex flex-column align-items-center confirm-review-container">
        <InfoHeader
          location={location.label}
          startDate={startDate}
          endDate={endDate}
        />

        <table className="w-100">
          <tbody>
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
              selectCar={() => {}}
            />
          </tbody>
        </table>

        <PickupMap from={location.placeId} to={selectedCar.address} />

        <ConfirmButton disabled={disabled} confirmBooking={confirmBooking} />
      </div>
    </div>
  );
}

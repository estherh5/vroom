import { differenceInDays } from "date-fns";
import { useState } from "react";
import "./CarTable.css";

import AdvanceButton from "../AdvanceButton/AdvanceButton";
import InfoHeader from "../InfoHeader/InfoHeader";
import CarRow from "./CarRow/CarRow";
import type { Car, GeoLocation, SortOption } from "../types";

interface Props {
  location: GeoLocation;
  startDate: Date;
  endDate: Date;
  cars: Car[];
  setSort: (option: SortOption) => void;
  selectCar: (carId: string) => void;
  advanceSection: () => void;
}

// Table of rental car options.
export default function CarTable({
  location,
  startDate,
  endDate,
  cars,
  setSort,
  selectCar,
  advanceSection,
}: Props) {
  const [allowAdvance, setAllowAdvance] = useState(() =>
    cars.some((car) => car.selected),
  );

  // Length of the rental period in days.
  const days = differenceInDays(endDate, startDate);

  const handleSort = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(event.currentTarget.value as SortOption);
  };

  // Enable the Advance button once the user selects a car.
  const handleSelectCar = (carId: string) => {
    setAllowAdvance(Boolean(carId));
    selectCar(carId);
  };

  const handleAdvance = () => {
    setAllowAdvance(false);
    advanceSection();
  };

  return (
    <div className="row no-gutters w-100 justify-content-center align-items-center cars-container">
      <InfoHeader
        location={location.label}
        startDate={startDate}
        endDate={endDate}
      />

      <div className="row no-gutters w-100 justify-content-end cars-table-container">
        <div className="sort-menu">
          <span className="sort-title">Sort by...</span>

          <select title="Sort car rental results" onChange={handleSort}>
            <option>price</option>
            <option>distance</option>
            <option>type</option>
          </select>
        </div>

        <div className="cars-table-wrapper">
          <table className="cars-table">
            <tbody>
              {cars.map((car, index) => (
                <CarRow
                  key={car.id + index}
                  id={car.id}
                  selected={car.selected}
                  days={days}
                  group={car.group}
                  company={car.company}
                  companyLogo={car.companyLogo}
                  address={car.address}
                  image={car.image}
                  type={car.type}
                  price={car.price}
                  selectCar={handleSelectCar}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AdvanceButton disabled={!allowAdvance} advanceSection={handleAdvance} />
    </div>
  );
}

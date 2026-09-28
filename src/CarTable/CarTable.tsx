import { differenceInDays } from "date-fns";
import { useState } from "react";
import "./CarTable.css";

import AdvanceButton from "../AdvanceButton/AdvanceButton";
import InfoHeader from "../InfoHeader/InfoHeader";
import CarRow from "./CarRow/CarRow";
import { SelectMenu } from "../SelectMenu/SelectMenu";
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

const SORT_OPTIONS = [
  { value: "price", label: "price" },
  { value: "distance", label: "distance" },
  { value: "type", label: "type" },
] satisfies { value: SortOption; label: string }[];

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

  const [sort, setSortValue] = useState<SortOption>("price");

  // Length of the rental period in days.
  const days = differenceInDays(endDate, startDate);

  // Re-choosing the current option is a no-op, as it was with the native select.
  const handleSort = (value: string) => {
    if (value === sort) return;
    setSortValue(value as SortOption);
    setSort(value as SortOption);
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

          <SelectMenu
            className="selectbox selectbox--auto"
            ariaLabel="Sort car rental results"
            placeholder="price"
            value={sort}
            options={SORT_OPTIONS}
            onChange={handleSort}
          />
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

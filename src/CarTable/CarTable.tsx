import { differenceInDays } from "date-fns";
import { useEffect, useRef, useState } from "react";
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
  const headingRef = useRef<HTMLHeadingElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  // Arriving here is a step change: put focus on the step's heading.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  // The selected car takes Tab focus, or the first car before one is chosen.
  const selectedIndex = cars.findIndex((car) => car.selected);
  const tabbableIndex = selectedIndex === -1 ? 0 : selectedIndex;

  // Arrow keys move focus between cars and select the one they land on, as a
  // native radio group does.
  const moveFocus = (from: number, direction: 1 | -1) => {
    const next = (from + direction + cars.length) % cars.length;
    handleSelectCar(cars[next].id);
    const rows = groupRef.current?.querySelectorAll<HTMLElement>('[role="radio"]');
    rows?.[next]?.focus();
  };

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

      <div className="row no-gutters w-100 justify-content-between align-items-end cars-table-container">
        <h1 ref={headingRef} tabIndex={-1} className="step-heading" id="choose-car">
          Choose a car
        </h1>

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

        <div
          ref={groupRef}
          role="radiogroup"
          aria-labelledby="choose-car"
          className="w-100 cars-list"
        >
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
                  distance={car.distance}
                  selectCar={handleSelectCar}
                  tabbable={index === tabbableIndex}
                  onArrow={(direction) => moveFocus(index, direction)}
                />
              ))}
        </div>
      </div>

      <AdvanceButton
        disabled={!allowAdvance}
        label="Review booking"
        showLabel
        advanceSection={handleAdvance}
      />
    </div>
  );
}

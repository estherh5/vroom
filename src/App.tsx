import { useEffect, useState } from "react";
import { format } from "date-fns";
import "./App.css";

import { createBooking, searchCars } from "./api";
import BookingConfirm from "./BookingConfirm/BookingConfirm";
import CarTable from "./CarTable/CarTable";
import { FleetMenu } from "./components/FleetMenu";
import { getFleetApps, shapeFleet } from "./lib/fleet";
import PageHeader from "./PageHeader/PageHeader";
import PickupSelector from "./PickupSelector/PickupSelector";
import type {
  Car,
  GeoLocation,
  RequestStatus,
  SectionButtonData,
  SectionName,
  SortOption,
} from "./types";

const INITIAL_BUTTONS: SectionButtonData[] = [
  { name: "pickup", icon: "far fa-calendar-alt", bgColor: "#f9c0c0", color: "#ff4f4f", selected: true, disabled: false },
  { name: "rentals", icon: "fas fa-car", bgColor: "#fdf59b", color: "#ffeb00", selected: false, disabled: true },
  { name: "confirm", icon: "fas fa-check", bgColor: "#afffb3", color: "#66ff6d", selected: false, disabled: true },
];

// Each section's title, shown in the browser tab while it is open.
const SECTION_TITLES: Record<SectionName, string> = {
  pickup: "Vroom",
  rentals: "Choose a car · Vroom",
  confirm: "Confirm your car · Vroom",
};

// A search that returns no cars is its own outcome, not a failure: the fix is
// different dates or a different place, not trying the same search again.
export type SearchStatus = RequestStatus | "empty";
export type BookingStatus = RequestStatus | "done";

// Main application component.
export default function App() {
  const [buttons, setButtons] = useState<SectionButtonData[]>(
    structuredClone(INITIAL_BUTTONS),
  );
  // No range until the user picks one: a preset start of today made every
  // later click move only the end, so a trip starting later was unreachable.
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [cars, setCars] = useState<Car[] | null>(null);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>("idle");
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>("idle");
  const [confirmationCode, setConfirmationCode] = useState<string | null>(null);
  // Vroom has no account, so the fleet menu is apps only. The baked list
  // renders at once; crystalprism.io/apps.json replaces it when it arrives
  // (getFleetApps falls back to the same baked list on failure).
  const [fleetApps, setFleetApps] = useState(() => shapeFleet(null, "vroom"));

  useEffect(() => {
    let live = true;
    void getFleetApps("vroom").then((list) => {
      if (live) setFleetApps(list);
    });
    return () => {
      live = false;
    };
  }, []);

  // Set the clicked page header button as selected.
  const setSelectedButton = (buttonName: SectionName) => {
    const updatedButtons = structuredClone(buttons);
    const selectedIndex = updatedButtons.findIndex(
      (button) => button.name === buttonName,
    );

    updatedButtons.forEach((button, index) => {
      button.selected = index === selectedIndex;
      // Disable sections after the selected one so the user can't skip ahead.
      button.disabled = index > selectedIndex;
    });

    // Reset pickup/booking state when toggling to an earlier section.
    if (selectedIndex < 2) {
      setSearchStatus("idle");
      setBookingStatus("idle");
      setConfirmationCode(null);
    }

    setButtons(updatedButtons);
  };

  const setDates = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
    // An outcome message describes the last search, not the new inputs.
    setSearchStatus("idle");
  };

  const changeLocation = (next: GeoLocation | null) => {
    setLocation(next);
    setSearchStatus("idle");
  };

  // Fetch rental cars and, on success, advance to the rentals section.
  const getCars = async (updatedButtons: SectionButtonData[]) => {
    if (!location || !startDate || !endDate) {
      return;
    }

    setSearchStatus("busy");

    try {
      const results = await searchCars(location, startDate, endDate);

      if (results.length === 0) {
        setSearchStatus("empty");
        return;
      }

      setCars(results);
      setButtons(updatedButtons);
      setSearchStatus("idle");
    } catch {
      setSearchStatus("failed");
    }
  };

  const setSort = (option: SortOption) => {
    if (!cars) {
      return;
    }

    const sorted = structuredClone(cars);

    if (option === "price") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (option === "distance") {
      sorted.sort((a, b) => a.distance - b.distance || a.price - b.price);
    } else if (option === "type") {
      sorted.sort((a, b) => a.type.localeCompare(b.type));
    }

    setCars(sorted);
  };

  // Mark the clicked rental car as selected (and all others as unselected).
  const selectCar = (carId: string) => {
    if (!cars) {
      return;
    }

    const updatedCars = structuredClone(cars);
    updatedCars.forEach((car) => {
      car.selected = car.id === carId;
    });
    setCars(updatedCars);
  };

  // Advance to the next section when the user clicks the Advance button.
  const advanceSection = () => {
    const updatedButtons = structuredClone(buttons);
    const selectedIndex = updatedButtons.findIndex((button) => button.selected);

    updatedButtons[selectedIndex].selected = false;
    updatedButtons[selectedIndex + 1].selected = true;
    updatedButtons[selectedIndex + 1].disabled = false;

    // Fetch rental cars when advancing from the pickup section.
    if (selectedIndex === 0) {
      void getCars(updatedButtons);
      return;
    }

    setButtons(updatedButtons);
  };

  // Post the booking to the back-end server.
  const confirmBooking = async () => {
    const selectedCar = cars?.find((car) => car.selected);
    if (!selectedCar || !location || !startDate || !endDate) {
      return;
    }

    setBookingStatus("busy");

    try {
      const confirmationCode = await createBooking({
        car: selectedCar.type,
        company_address: selectedCar.address.address,
        company_name: selectedCar.company,
        end_date: format(endDate, "MM-dd-yyyy"),
        location: location.label,
        price: selectedCar.price,
        start_date: format(startDate, "MM-dd-yyyy"),
      });

      setConfirmationCode(confirmationCode);
      setBookingStatus("done");
    } catch {
      setBookingStatus("failed");
    }
  };

  // Start over from pickup after a booking, keeping the place and dates.
  const bookAnother = () => {
    setCars(null);
    setBookingStatus("idle");
    setConfirmationCode(null);
    setSearchStatus("idle");
    setButtons(structuredClone(INITIAL_BUTTONS));
  };

  const selectedButton = buttons.find((button) => button.selected);
  const selectedCar = cars?.find((car) => car.selected);

  useEffect(() => {
    document.title = SECTION_TITLES[selectedButton?.name ?? "pickup"];
  }, [selectedButton?.name]);

  return (
    <div className="container-fluid p-0">
      <PageHeader
        buttons={buttons}
        onSelectButton={setSelectedButton}
        menu={
          <FleetMenu
            apps={fleetApps}
            user={null}
            settingsHref={null}
            statsHref={null}
            signInHref={null}
            signOutAction={null}
            placement="down-end"
            triggerClassName="vroom-fleet-trigger"
          />
        }
      />

      <main className="row no-gutters align-items-start justify-content-center content-container">
        {selectedButton?.name === "pickup" ? (
          <PickupSelector
            location={location}
            setLocation={changeLocation}
            startDate={startDate}
            endDate={endDate}
            setDates={setDates}
            status={searchStatus}
            advanceSection={advanceSection}
          />
        ) : selectedButton?.name === "rentals" && cars && location && startDate && endDate ? (
          <CarTable
            location={location}
            startDate={startDate}
            endDate={endDate}
            cars={cars}
            setSort={setSort}
            selectCar={selectCar}
            advanceSection={advanceSection}
          />
        ) : selectedButton?.name === "confirm" &&
          selectedCar &&
          location &&
          startDate &&
          endDate ? (
          <BookingConfirm
            location={location}
            startDate={startDate}
            endDate={endDate}
            selectedCar={selectedCar}
            status={bookingStatus}
            confirmationCode={confirmationCode}
            confirmBooking={confirmBooking}
            bookAnother={bookAnother}
          />
        ) : null}
      </main>
    </div>
  );
}

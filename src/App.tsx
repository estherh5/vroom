import { useState } from "react";
import { format } from "date-fns";
import "./App.css";

import { createBooking, searchCars } from "./api";
import BookingConfirm from "./BookingConfirm/BookingConfirm";
import CarTable from "./CarTable/CarTable";
import Modal from "./Modal/Modal";
import PageHeader from "./PageHeader/PageHeader";
import PickupSelector from "./PickupSelector/PickupSelector";
import SiteMenu from "./SiteMenu/SiteMenu";
import type {
  Car,
  GeoLocation,
  SectionButtonData,
  SectionName,
  ServerStatus,
  SortOption,
} from "./types";

const INITIAL_BUTTONS: SectionButtonData[] = [
  { name: "pickup", icon: "far fa-calendar-alt", bgColor: "#f9c0c0", color: "#ff4f4f", selected: true, disabled: false },
  { name: "rentals", icon: "fas fa-car", bgColor: "#fdf59b", color: "#ffeb00", selected: false, disabled: true },
  { name: "confirm", icon: "fas fa-check", bgColor: "#afffb3", color: "#66ff6d", selected: false, disabled: true },
];

const REQUEST_ERROR =
  "Your rental car request could not be processed. Please try again soon.";
const NO_CARS_ERROR =
  "No cars could be found for your location and date range. Please update " +
  "your search criteria.";
const BOOKING_ERROR =
  "Your booking could not be confirmed. Please try again soon.";

// Main application component.
export default function App() {
  const [buttons, setButtons] = useState<SectionButtonData[]>(
    structuredClone(INITIAL_BUTTONS),
  );
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [cars, setCars] = useState<Car[] | null>(null);
  const [displayModal, setDisplayModal] = useState(false);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [pickupSubmitted, setPickupSubmitted] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  const showError = (message: string) => {
    document.body.style.cursor = "default";
    setDisplayModal(true);
    setModalMessage(message);
    setServerStatus("fail");
  };

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
      setPickupSubmitted(false);
      setBookingSubmitted(false);
    }

    document.body.style.cursor = "default";
    setButtons(updatedButtons);
  };

  const setDates = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  // Fetch rental cars and, on success, advance to the rentals section.
  const getCars = async (updatedButtons: SectionButtonData[]) => {
    if (!location || !startDate || !endDate) {
      return;
    }

    setPickupSubmitted(true);

    try {
      const results = await searchCars(location, startDate, endDate);

      document.body.style.cursor = "default";

      if (results.length === 0) {
        setPickupSubmitted(false);
        showError(NO_CARS_ERROR);
        return;
      }

      setCars(results);
      setButtons(updatedButtons);
      setPickupSubmitted(false);
    } catch {
      setPickupSubmitted(false);
      showError(REQUEST_ERROR);
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

    document.body.style.cursor = "default";
    setButtons(updatedButtons);
  };

  // Post the booking to the back-end server.
  const confirmBooking = async () => {
    const selectedCar = cars?.find((car) => car.selected);
    if (!selectedCar || !location || !startDate || !endDate) {
      return;
    }

    setBookingSubmitted(true);

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

      document.body.style.cursor = "default";
      setDisplayModal(true);
      setModalMessage(
        `Your booking is confirmed! Your confirmation code is ${confirmationCode}.`,
      );
      setServerStatus("success");
      setBookingSubmitted(true);
    } catch {
      setBookingSubmitted(false);
      showError(BOOKING_ERROR);
    }
  };

  const selectedButton = buttons.find((button) => button.selected);
  const selectedCar = cars?.find((car) => car.selected);

  return (
    <div className="container-fluid p-0">
      <Modal
        display={displayModal}
        message={modalMessage}
        status={serverStatus}
        onCloseModal={() => setDisplayModal(false)}
      />

      <PageHeader buttons={buttons} onSelectButton={setSelectedButton} />

      <SiteMenu />

      <div className="row align-items-start justify-content-center content-container">
        {selectedButton?.name === "pickup" ? (
          <PickupSelector
            location={location}
            setLocation={setLocation}
            startDate={startDate}
            endDate={endDate}
            setDates={setDates}
            disabled={pickupSubmitted}
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
            disabled={bookingSubmitted}
            confirmBooking={confirmBooking}
          />
        ) : null}
      </div>
    </div>
  );
}

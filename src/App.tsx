import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import "./App.css";

import { createBooking, searchCars } from "./api";
import BookingConfirm from "./BookingConfirm/BookingConfirm";
import CarTable from "./CarTable/CarTable";
import { FleetMenu } from "./components/FleetMenu";
import { getFleetApps, shapeFleet } from "./lib/fleet";
import { readTrip, writeTrip } from "./lib/tripUrl";
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

const SECTIONS: Omit<SectionButtonData, "selected" | "disabled">[] = [
  { name: "pickup", icon: "far fa-calendar-alt", bgColor: "#f9c0c0", color: "#ff4f4f" },
  { name: "rentals", icon: "fas fa-car", bgColor: "#fdf59b", color: "#ffeb00" },
  { name: "confirm", icon: "fas fa-check", bgColor: "#afffb3", color: "#66ff6d" },
];

// Header buttons for the open step: later steps are disabled so the user
// can't skip ahead, and after a booking every step but the open one is.
function buttonsFor(step: SectionName, locked: boolean): SectionButtonData[] {
  const openIndex = SECTIONS.findIndex((section) => section.name === step);
  return SECTIONS.map((section, index) => ({
    ...section,
    selected: index === openIndex,
    disabled: locked ? index !== openIndex : index > openIndex,
  }));
}

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
  // The trip lives in the query string, so a refresh resumes it and browser
  // Back walks the steps. A link into a later step searches again first.
  const [initialTrip] = useState(() => readTrip(window.location.search));
  const [step, setStep] = useState<SectionName>("pickup");
  // No range until the user picks one: a preset start of today made every
  // later click move only the end, so a trip starting later was unreachable.
  const [startDate, setStartDate] = useState<Date | null>(initialTrip.startDate);
  const [endDate, setEndDate] = useState<Date | null>(initialTrip.endDate);
  const [location, setLocation] = useState<GeoLocation | null>(initialTrip.location);
  const [cars, setCars] = useState<Car[] | null>(null);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>(
    initialTrip.step === "pickup" ? "idle" : "busy",
  );
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

  // The step the address bar shows. A step change the user makes adds a
  // history entry; one that comes from history, or input edits, replace it.
  const urlStep = useRef<SectionName>(initialTrip.step);
  // Off until the link's own search settles, so the URL isn't rewritten to
  // pickup while it runs.
  const [urlReady, setUrlReady] = useState(initialTrip.step === "pickup");
  const carsRef = useRef<Car[] | null>(null);
  carsRef.current = cars;

  // Open the step the header button names.
  const goToStep = (name: SectionName) => {
    // A finished booking is left only through Book another car, so its
    // confirmation code can't vanish behind a step change.
    if (bookingStatus === "done") {
      return;
    }

    // Reset pickup/booking state when toggling to an earlier section.
    if (name !== "confirm") {
      setSearchStatus("idle");
      setBookingStatus("idle");
      setConfirmationCode(null);
    }

    setStep(name);
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

  // Fetch rental cars and, on success, open the rentals section, or the
  // confirm section when a car from the URL is among the results. A search
  // restoring a URL (fromHistory) replaces its entry instead of adding one.
  const getCars = async (
    place: GeoLocation | null,
    start: Date | null,
    end: Date | null,
    carId: string | null = null,
    fromHistory = false,
  ) => {
    const open = (opened: SectionName) => {
      if (fromHistory) {
        urlStep.current = opened;
      }
      setStep(opened);
    };

    if (!place || !start || !end) {
      open("pickup");
      return;
    }

    setSearchStatus("busy");

    try {
      const results = await searchCars(place, start, end);

      if (results.length === 0) {
        setSearchStatus("empty");
        open("pickup");
        return;
      }

      const found = results.some((car) => car.id === carId);
      setCars(results.map((car) => ({ ...car, selected: found && car.id === carId })));
      setSearchStatus("idle");
      open(found ? "confirm" : "rentals");
    } catch {
      setSearchStatus("failed");
      open("pickup");
    }
  };

  // A link or refresh into a later step searches again, then resumes there.
  useEffect(() => {
    if (initialTrip.step === "pickup") {
      return;
    }
    const { location: place, startDate: start, endDate: end, carId } = initialTrip;
    void getCars(place, start, end, carId, true).then(() => setUrlReady(true));
    // Runs once, for the URL the page loaded with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    // Fetch rental cars when advancing from the pickup section.
    if (step === "pickup") {
      void getCars(location, startDate, endDate);
      return;
    }

    setStep("confirm");
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
    setStep("pickup");
  };

  const selectedCar = cars?.find((car) => car.selected);
  const selectedCarId = selectedCar?.id ?? null;

  // Mirror the trip into the address bar.
  useEffect(() => {
    if (!urlReady) {
      return;
    }
    const search = writeTrip({ step, location, startDate, endDate, carId: selectedCarId });
    const url = window.location.pathname + search + window.location.hash;
    if (step !== urlStep.current) {
      urlStep.current = step;
      window.history.pushState(null, "", url);
    } else if (search !== window.location.search) {
      window.history.replaceState(null, "", url);
    }
  }, [urlReady, step, location, startDate, endDate, selectedCarId]);

  // Back and Forward restore the trip their entry recorded. Leaving a
  // finished booking this way clears it, like Book another car.
  useEffect(() => {
    const handlePopState = () => {
      const trip = readTrip(window.location.search);
      urlStep.current = trip.step;
      setLocation(trip.location);
      setStartDate(trip.startDate);
      setEndDate(trip.endDate);
      setSearchStatus("idle");
      setBookingStatus("idle");
      setConfirmationCode(null);

      const known = carsRef.current;
      if (trip.step === "pickup") {
        setStep("pickup");
      } else if (known) {
        // Back to rentals keeps the car chosen there.
        const carId = trip.carId ?? known.find((car) => car.selected)?.id;
        const found = known.some((car) => car.id === carId);
        setCars(known.map((car) => ({ ...car, selected: found && car.id === carId })));
        setStep(found || trip.step === "rentals" ? trip.step : "rentals");
        if (!found && trip.step === "confirm") {
          urlStep.current = "rentals";
        }
      } else {
        // Book another car cleared the results, so search again.
        urlStep.current = "pickup";
        setStep("pickup");
        void getCars(trip.location, trip.startDate, trip.endDate, trip.carId, true);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    document.title =
      bookingStatus === "done" ? "Booked · Vroom" : SECTION_TITLES[step];
  }, [step, bookingStatus]);

  const headerButtons = buttonsFor(step, bookingStatus === "done");

  return (
    <div className="container-fluid p-0">
      <PageHeader
        buttons={headerButtons}
        onSelectButton={goToStep}
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
        {step === "pickup" ? (
          <PickupSelector
            location={location}
            setLocation={changeLocation}
            startDate={startDate}
            endDate={endDate}
            setDates={setDates}
            status={searchStatus}
            advanceSection={advanceSection}
          />
        ) : step === "rentals" && cars && location && startDate && endDate ? (
          <CarTable
            location={location}
            startDate={startDate}
            endDate={endDate}
            cars={cars}
            setSort={setSort}
            selectCar={selectCar}
            advanceSection={advanceSection}
          />
        ) : step === "confirm" &&
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

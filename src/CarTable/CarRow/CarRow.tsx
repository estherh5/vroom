import type { KeyboardEvent, SyntheticEvent } from "react";
import "./CarRow.css";

import logo from "../../logo.png";
import type { CarAddress } from "../../types";

// Backup car images keyed by the first character of the ACRISS code, used
// when a rental's own image fails to load.
const PRICELINE = "https://www.priceline.com/rc-static/vehicles/domestic_196x116";
const CAR_IMAGES: Record<string, string> = {
  M: `${PRICELINE}/ECAR.png`,
  N: `${PRICELINE}/ECAR.png`,
  E: `${PRICELINE}/ECAR.png`,
  H: `${PRICELINE}/ECAR.png`,
  C: `${PRICELINE}/CCAR.png`,
  D: `${PRICELINE}/CCAR.png`,
  I: `${PRICELINE}/ICAR.png`,
  J: `${PRICELINE}/ICAR.png`,
  S: `${PRICELINE}/SCAR.png`,
  R: `${PRICELINE}/SCAR.png`,
  F: `${PRICELINE}/FCAR.png`,
  G: `${PRICELINE}/FCAR.png`,
  P: `${PRICELINE}/PCAR.png`,
  U: `${PRICELINE}/PCAR.png`,
  L: `${PRICELINE}/LCAR.png`,
  W: `${PRICELINE}/LCAR.png`,
  O: `${PRICELINE}/MVAR.png`,
  X: `${PRICELINE}/MVAR.png`,
};

interface Props {
  id: string;
  selected: boolean;
  days: number;
  group: string;
  company: string;
  companyLogo: string;
  address: CarAddress;
  image: string;
  type: string;
  price: number;
  distance: number;
  // Null renders a read-only summary (the confirm step).
  selectCar: ((id: string) => void) | null;
  // Roving tabindex: the one row of the group that takes Tab focus.
  tabbable?: boolean;
  // Arrow keys move focus within the group.
  onArrow?: (direction: 1 | -1) => void;
}

// Row that displays a single rental car's information.
export default function CarRow({
  id,
  selected,
  days,
  group,
  company,
  companyLogo,
  address,
  image,
  type,
  price,
  distance,
  selectCar,
  tabbable = false,
  onArrow,
}: Props) {
  // Fall back to an ACRISS-based image if the car image is not found.
  const updateCarImage = (event: SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = CAR_IMAGES[group.charAt(0)];
  };

  // Fall back to the Vroom logo if the company logo is not found.
  const updateLogoImage = (event: SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = logo;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      selectCar?.(id);
    } else if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      onArrow?.(1);
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      onArrow?.(-1);
    }
  };

  const interactive = selectCar !== null;

  return (
    <div
      className={
        "row no-gutters car-row justify-content-center justify-content-md-between" +
        (interactive ? " car-row--choice" : "") +
        (selected && interactive ? " selected" : "")
      }
      data-car-id={id}
      {...(interactive
        ? {
            role: "radio",
            "aria-checked": selected,
            "aria-label": `${type}, $${price}, ${company}`,
            tabIndex: tabbable ? 0 : -1,
            onClick: () => selectCar(id),
            onKeyDown: handleKeyDown,
          }
        : {})}
    >
      {interactive && (
        <i
          aria-hidden="true"
          className={(selected ? "fas fa-check-circle" : "far fa-circle") + " car-check"}
        ></i>
      )}

      <div className="d-flex flex-column justify-content-between align-items-center align-items-md-start mt-3 mx-3 m-sm-3 info-cell">
        <div className="car-name">{type}</div>

        <div className={"price-total-row " + (days > 0 ? "mt-4" : "")}>
          {"$" + price}
        </div>

        {days > 0 ? (
          <div className="price-day-row mb-4">
            {"$" + (price / days).toFixed(2) + "/day"}
          </div>
        ) : null}

        <div className="address-row d-flex align-items-center">
          {address.name.toLowerCase().includes("airport") ? (
            <i
              aria-hidden="true"
              className="fas fa-plane-departure mr-3 location-icon"
            ></i>
          ) : (
            <i aria-hidden="true" className="fas fa-location-arrow mr-3 location-icon"></i>
          )}

          <div className="address">
            {address.name}
            <br />
            {address.address}
            <br />
            <span className="distance">{distance} mi away</span>
          </div>
        </div>
      </div>

      <div className="d-flex flex-column align-items-center justify-content-center m-3 m-lg-2 image-cell">
        <img
          className="mb-3 car-image"
          onError={updateCarImage}
          src={image}
          alt={type}
        />

        <img
          className="company-logo"
          onError={updateLogoImage}
          src={companyLogo}
          alt={company}
        />
      </div>
    </div>
  );
}

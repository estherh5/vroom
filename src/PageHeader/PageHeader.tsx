import type { CSSProperties } from "react";
import "./PageHeader.css";

import SectionButton from "./SectionButton/SectionButton";
import type { SectionButtonData, SectionName } from "../types";

interface Props {
  buttons: SectionButtonData[];
  onSelectButton: (name: SectionName) => void;
}

// Page header with buttons representing each section of the app.
export default function PageHeader({ buttons, onSelectButton }: Props) {
  const selectedButton = buttons.find((button) => button.selected);

  // Set background color of the header based on the selected section.
  const style: CSSProperties = {
    backgroundColor:
      selectedButton?.name === "pickup"
        ? "#ffe4e4"
        : selectedButton?.name === "rentals"
          ? "#fffde0"
          : selectedButton?.name === "confirm"
            ? "#e9f7ea"
            : undefined,
  };

  return (
    <div
      className="row align-items-center w-100 fixed-top no-gutters header"
      style={style}
    >
      <ul className="nav w-100">
        <div className="liner"></div>

        {buttons.map((button) => (
          <SectionButton
            key={button.name}
            {...button}
            onSelectButton={onSelectButton}
          />
        ))}
      </ul>
    </div>
  );
}

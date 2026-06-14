import type { CSSProperties } from "react";
import "./SectionButton.css";

import type { SectionName } from "../../types";

interface Props {
  name: SectionName;
  selected: boolean;
  disabled: boolean;
  icon: string;
  bgColor: string;
  color: string;
  onSelectButton: (name: SectionName) => void;
}

// Button representing a section of the app.
export default function SectionButton({
  name,
  selected,
  disabled,
  icon,
  bgColor,
  color,
  onSelectButton,
}: Props) {
  const selectButton = () => {
    if (disabled) {
      return;
    }
    onSelectButton(name);
  };

  const disabledStyle: CSSProperties = {
    color: "#cacaca",
    border: "5px solid #cacaca",
    backgroundColor: "#efefef",
    cursor: "default",
  };

  const enabledStyle: CSSProperties = {
    color,
    border: "5px solid " + color,
    backgroundColor: selected ? bgColor : "#ffffff",
    cursor: "pointer",
  };

  return (
    <li
      className={
        "col d-flex justify-content-center align-items-center section-button" +
        (selected ? " active" : "")
      }
    >
      <button
        className="d-flex justify-content-center align-items-center round"
        style={disabled ? disabledStyle : enabledStyle}
        data-name={name}
        disabled={disabled}
        onClick={selectButton}
      >
        <i className={icon} data-name={name} onClick={selectButton}></i>
      </button>
    </li>
  );
}

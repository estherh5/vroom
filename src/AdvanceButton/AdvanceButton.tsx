import "./AdvanceButton.css";

interface Props {
  disabled: boolean;
  // A request started by this button is in flight.
  busy?: boolean;
  // What the button does, for its accessible name ("Find cars", "Review booking").
  label: string;
  // Show the label beside the arrow, not only to assistive tech.
  showLabel?: boolean;
  advanceSection: () => void;
}

// Button that advances the user to the next section of the app.
export default function AdvanceButton({
  disabled,
  busy = false,
  label,
  showLabel = false,
  advanceSection,
}: Props) {
  return (
    <div className="d-flex align-items-center justify-content-center button-container">
      <button
        type="button"
        className={"d-flex advance" + (showLabel ? " advance--labeled" : "")}
        aria-label={showLabel ? undefined : busy ? `${label}…` : label}
        aria-busy={busy}
        // Busy is aria-disabled, not disabled, so keyboard focus stays here.
        aria-disabled={busy}
        disabled={disabled}
        onClick={() => {
          if (!busy) advanceSection();
        }}
      >
        {showLabel && <span>{label}</span>}
        <i
          aria-hidden="true"
          className={busy ? "fas fa-circle-notch advance-spinner" : "fas fa-arrow-right"}
        ></i>
      </button>
    </div>
  );
}

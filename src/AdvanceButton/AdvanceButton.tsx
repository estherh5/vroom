import "./AdvanceButton.css";

interface Props {
  disabled: boolean;
  advanceSection: () => void;
}

// Button that advances the user to the next section of the app.
export default function AdvanceButton({ disabled, advanceSection }: Props) {
  const handleClick = () => {
    // Set cursor style to loading.
    document.body.style.cursor = "wait";
    advanceSection();
  };

  return (
    <div className="d-flex align-items-center justify-content-center button-container">
      <button className="d-flex advance" disabled={disabled} onClick={handleClick}>
        <i className="fas fa-arrow-right"></i>
      </button>
    </div>
  );
}

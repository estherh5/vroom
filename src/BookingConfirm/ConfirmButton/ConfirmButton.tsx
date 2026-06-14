import "./ConfirmButton.css";

interface Props {
  disabled: boolean;
  confirmBooking: () => void;
}

// Confirm booking button.
export default function ConfirmButton({ disabled, confirmBooking }: Props) {
  const handleClick = () => {
    // Set cursor style to loading.
    document.body.style.cursor = "wait";
    confirmBooking();
  };

  return (
    <div className="button-container my-5 d-flex align-items-center justify-content-center">
      <button className="d-flex confirm" disabled={disabled} onClick={handleClick}>
        Confirm
      </button>
    </div>
  );
}

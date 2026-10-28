import "./ConfirmButton.css";

interface Props {
  busy: boolean;
  // The last attempt failed, so the button retries it.
  retry: boolean;
  confirmBooking: () => void;
}

// Confirm booking button.
export default function ConfirmButton({ busy, retry, confirmBooking }: Props) {
  return (
    <button
      type="button"
      className="d-flex align-items-center confirm"
      aria-busy={busy}
      disabled={busy}
      onClick={confirmBooking}
    >
      {busy ? (
        <>
          <i aria-hidden="true" className="fas fa-circle-notch confirm-spinner"></i>
          Confirming…
        </>
      ) : retry ? (
        "Try again"
      ) : (
        "Confirm"
      )}
    </button>
  );
}

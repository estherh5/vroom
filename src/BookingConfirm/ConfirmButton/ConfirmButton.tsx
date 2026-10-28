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
      // aria-disabled, not disabled: disabling the focused button would drop
      // keyboard focus to the page while the booking is in flight.
      aria-disabled={busy}
      onClick={() => {
        if (!busy) confirmBooking();
      }}
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

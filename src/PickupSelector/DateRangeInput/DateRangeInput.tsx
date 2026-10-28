import { format, startOfToday } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import "./DateRangeInput.css";

import { useMediaQuery } from "../../hooks/useMediaQuery";

interface Props {
  startDate: Date | null;
  endDate: Date | null;
  setDates: (startDate: Date | null, endDate: Date | null) => void;
  disabled: boolean;
}

// Rental pickup date range input using a pop-out calendar.
export default function DateRangeInput({
  startDate,
  endDate,
  setDates,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  // A phone gets one month in a bottom sheet; wider screens two months side
  // by side in a popover.
  const mobile = useMediaQuery("(max-width: 620px)");
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // On a short window the popover can open below the fold; scroll the
  // pickup page just far enough to show all of it.
  useEffect(() => {
    if (open && !mobile) {
      popoverRef.current?.scrollIntoView({ block: "nearest" });
    }
  }, [open, mobile]);

  // Close the calendar when the user clicks outside of it.
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    // Esc closes the calendar and hands focus back to the button.
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClick, false);
    document.addEventListener("keydown", handleKey, false);
    return () => {
      document.removeEventListener("mousedown", handleClick, false);
      document.removeEventListener("keydown", handleKey, false);
    };
  }, [open]);

  const handleSelect = (range: DateRange | undefined) => {
    setDates(range?.from ?? null, range?.to ?? null);
    // The second click completes the range: close and show it on the button.
    if (range?.from && range.to) {
      setOpen(false);
      buttonRef.current?.focus();
    }
  };

  const selected: DateRange | undefined = startDate
    ? { from: startDate, to: endDate ?? undefined }
    : undefined;

  const label =
    startDate && endDate
      ? `${format(startDate, "M/d/yyyy")}–${format(endDate, "M/d/yyyy")}`
      : "Pick-up and drop-off dates";

  return (
    <div
      ref={containerRef}
      className="d-flex align-items-center justify-content-center input-container date-range-input"
    >
      <i aria-hidden="true" className="far fa-calendar-minus p-2"></i>

      <button
        ref={buttonRef}
        type="button"
        className="date-range-display"
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        {label}
      </button>

      {open && mobile && (
        <div
          className="date-range-scrim"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        ></div>
      )}

      {open && (
        <div ref={popoverRef} className="date-range-popover" role="dialog" aria-label="Choose dates">
          <div className="date-range-head">
            <p className="date-range-hint" aria-live="polite">
              {startDate && !endDate ? "Now pick your drop-off day" : "Pick your pick-up day"}
            </p>
            {mobile && (
              <button
                type="button"
                className="date-range-close"
                aria-label="Close calendar"
                onClick={() => {
                  setOpen(false);
                  buttonRef.current?.focus();
                }}
              >
                <i aria-hidden="true" className="fas fa-times"></i>
              </button>
            )}
          </div>
          <DayPicker
            mode="range"
            resetOnSelect
            numberOfMonths={mobile ? 1 : 2}
            defaultMonth={startDate ?? undefined}
            disabled={{ before: startOfToday() }}
            selected={selected}
            onSelect={handleSelect}
          />
        </div>
      )}
    </div>
  );
}

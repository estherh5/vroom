import { format } from "date-fns";
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
  // Show one month on small screens, two otherwise.
  const mobile = useMediaQuery("(max-width: 620px)");
  const containerRef = useRef<HTMLDivElement>(null);

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

    document.addEventListener("mousedown", handleClick, false);
    return () => document.removeEventListener("mousedown", handleClick, false);
  }, [open]);

  const selected: DateRange | undefined = startDate
    ? { from: startDate, to: endDate ?? undefined }
    : undefined;

  const label =
    startDate && endDate
      ? `${format(startDate, "M/d/yyyy")} – ${format(endDate, "M/d/yyyy")}`
      : "Select dates";

  return (
    <div
      ref={containerRef}
      className="d-flex align-items-center justify-content-center input-container date-range-input"
    >
      <i className="far fa-calendar-minus p-2"></i>

      <button
        type="button"
        className="date-range-display"
        disabled={disabled}
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        {label}
      </button>

      {open && (
        <div className="date-range-popover">
          <DayPicker
            mode="range"
            numberOfMonths={mobile ? 1 : 2}
            selected={selected}
            onSelect={(range) =>
              setDates(range?.from ?? null, range?.to ?? null)
            }
          />
        </div>
      )}
    </div>
  );
}

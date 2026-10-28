import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { BookingStatus } from "../App";
import type { Car } from "../types";
import BookingConfirm from "./BookingConfirm";

const car: Car = {
  id: "c1",
  type: "Toyota Corolla",
  selected: true,
  image: "",
  companyLogo: "",
  group: "C",
  company: "Hertz",
  distance: 1,
  address: { name: "Boston Rental Center", address: "Boston, MA" },
  price: 120,
};

function renderConfirm(status: BookingStatus, code: string | null = null) {
  const confirmBooking = vi.fn();
  const bookAnother = vi.fn();
  render(
    <BookingConfirm
      location={{ label: "Boston, MA", placeId: "x", location: { lat: 0, lng: 0 } }}
      startDate={new Date(2026, 0, 1)}
      endDate={new Date(2026, 0, 4)}
      selectedCar={car}
      status={status}
      confirmationCode={code}
      confirmBooking={confirmBooking}
      bookAnother={bookAnother}
    />,
  );
  return { confirmBooking, bookAnother };
}

describe("BookingConfirm", () => {
  it("shows the car as a summary, not a choice", () => {
    renderConfirm("idle");
    expect(screen.queryByRole("radio")).toBeNull();
    expect(screen.getByRole("heading", { level: 1, name: "Review your car" })).toHaveFocus();
  });

  it("marks the Confirm button itself busy while the booking is in flight", () => {
    renderConfirm("busy");
    const button = screen.getByRole("button", { name: "Confirming…" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("explains a failed booking in place and retries from the same button", async () => {
    const { confirmBooking } = renderConfirm("failed");
    expect(screen.getByRole("alert")).toHaveTextContent("didn’t go through");
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(confirmBooking).toHaveBeenCalledTimes(1);
  });

  it("ends in a booked summary with the code and a way to start over", async () => {
    const { bookAnother } = renderConfirm("done", "k7St-OsDCbkknV1L");
    expect(screen.getByRole("heading", { level: 2, name: "You’re booked" })).toHaveFocus();
    expect(screen.getByText("k7St-OsDCbkknV1L")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /confirm/i })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Book another car" }));
    expect(bookAnother).toHaveBeenCalledTimes(1);
  });
});

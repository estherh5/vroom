import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Modal from "./Modal";

describe("Modal", () => {
  it("shows the message when displayed", () => {
    render(
      <Modal
        display={true}
        message="Booking confirmed"
        status="success"
        onCloseModal={() => {}}
      />,
    );
    expect(screen.getByText("Booking confirmed")).toBeInTheDocument();
  });

  it("calls onCloseModal when the close button is clicked", () => {
    const onCloseModal = vi.fn();
    render(
      <Modal
        display={true}
        message="Booking confirmed"
        status="success"
        onCloseModal={onCloseModal}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Close message" }));
    expect(onCloseModal).toHaveBeenCalled();
  });
});

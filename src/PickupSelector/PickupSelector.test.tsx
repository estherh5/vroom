import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { SearchStatus } from "../App";
import PickupSelector from "./PickupSelector";

function renderPickup(status: SearchStatus) {
  const advanceSection = vi.fn();
  render(
    <PickupSelector
      location={{ label: "Boston, MA", placeId: "x", location: { lat: 0, lng: 0 } }}
      setLocation={vi.fn()}
      startDate={new Date(2099, 0, 1)}
      endDate={new Date(2099, 0, 4)}
      setDates={vi.fn()}
      status={status}
      advanceSection={advanceSection}
    />,
  );
  return advanceSection;
}

describe("PickupSelector", () => {
  it("names the advance button for what it does", () => {
    renderPickup("idle");
    expect(screen.getByRole("button", { name: "Find cars" })).toBeEnabled();
  });

  it("marks Find cars busy and locks the inputs during the search", () => {
    renderPickup("busy");
    const button = screen.getByRole("button", { name: "Find cars…" });
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button", { name: "1/1/2099–1/4/2099" })).toBeDisabled();
  });

  it("offers Try again in place when the search fails", async () => {
    const advanceSection = renderPickup("failed");
    expect(screen.getByRole("alert")).toHaveTextContent("couldn’t search");
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(advanceSection).toHaveBeenCalledTimes(1);
  });

  it("tells an empty search apart from a failure", () => {
    renderPickup("empty");
    expect(screen.getByRole("alert")).toHaveTextContent("No cars there");
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
  });
});

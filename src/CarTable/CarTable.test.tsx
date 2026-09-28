import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CarTable from "./CarTable";

function renderTable(setSort = vi.fn()) {
  render(
    <CarTable
      location={{ label: "Boston, MA", placeId: "x", location: { lat: 0, lng: 0 } }}
      startDate={new Date(2026, 0, 1)}
      endDate={new Date(2026, 0, 4)}
      cars={[]}
      setSort={setSort}
      selectCar={vi.fn()}
      advanceSection={vi.fn()}
    />,
  );
  return setSort;
}

describe("CarTable sort", () => {
  it("names the sort control and starts on price", () => {
    renderTable();
    expect(screen.getByRole("combobox", { name: "Sort car rental results" })).toHaveTextContent("price");
  });

  it("sorts by the chosen option", async () => {
    const setSort = renderTable();
    const trigger = screen.getByRole("combobox", { name: "Sort car rental results" });
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("option", { name: "distance" }));
    expect(setSort).toHaveBeenCalledTimes(1);
    expect(setSort).toHaveBeenCalledWith("distance");
    expect(trigger).toHaveTextContent("distance");

    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("option", { name: /type/ }));
    expect(setSort).toHaveBeenLastCalledWith("type");
  });

  // A native select fires no change when the current option is re-chosen.
  it("does not re-sort when the current option is chosen again", async () => {
    const setSort = renderTable();
    await userEvent.click(screen.getByRole("combobox", { name: "Sort car rental results" }));
    await userEvent.click(screen.getByRole("option", { name: /price/ }));
    expect(setSort).not.toHaveBeenCalled();
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CarTable from "./CarTable";

const cars = ["Corolla", "Civic", "Camry"].map((type, i) => ({
  id: `c${i}`,
  type,
  selected: false,
  image: "",
  companyLogo: "",
  group: "C",
  company: "Hertz",
  distance: 1,
  address: { name: "Boston Rental Center", address: "Boston, MA" },
  price: 100 + i,
}));

function renderTable(setSort = vi.fn(), list: typeof cars = []) {
  const selectCar = vi.fn();
  render(
    <CarTable
      location={{ label: "Boston, MA", placeId: "x", location: { lat: 0, lng: 0 } }}
      startDate={new Date(2026, 0, 1)}
      endDate={new Date(2026, 0, 4)}
      cars={list}
      setSort={setSort}
      selectCar={selectCar}
      advanceSection={vi.fn()}
    />,
  );
  return { setSort, selectCar };
}

describe("CarTable sort", () => {
  it("names the sort control and starts on price", () => {
    renderTable();
    expect(screen.getByRole("combobox", { name: "Sort car rental results" })).toHaveTextContent("price");
  });

  it("sorts by the chosen option", async () => {
    const { setSort } = renderTable();
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
    const { setSort } = renderTable();
    await userEvent.click(screen.getByRole("combobox", { name: "Sort car rental results" }));
    await userEvent.click(screen.getByRole("option", { name: /price/ }));
    expect(setSort).not.toHaveBeenCalled();
  });
});

describe("CarTable choice", () => {
  it("is a keyboard radio group: one Tab stop, Space selects, arrows move", async () => {
    const { selectCar } = renderTable(vi.fn(), cars);
    const radios = screen.getAllByRole("radio");
    expect(screen.getByRole("radiogroup", { name: "Choose a car" })).toBeInTheDocument();
    expect(radios.map((r) => r.tabIndex)).toEqual([0, -1, -1]);

    radios[0].focus();
    await userEvent.keyboard(" ");
    expect(selectCar).toHaveBeenLastCalledWith("c0");

    await userEvent.keyboard("{ArrowDown}");
    expect(selectCar).toHaveBeenLastCalledWith("c1");
    expect(radios[1]).toHaveFocus();

    await userEvent.keyboard("{ArrowUp}{ArrowUp}");
    expect(selectCar).toHaveBeenLastCalledWith("c2");
  });

  it("enables Review booking once a car is chosen", async () => {
    renderTable(vi.fn(), cars);
    expect(screen.getByRole("button", { name: "Review booking" })).toBeDisabled();
    await userEvent.click(screen.getAllByRole("radio")[1]);
    expect(screen.getByRole("button", { name: "Review booking" })).toBeEnabled();
  });
});

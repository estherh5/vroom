import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import App from "./App";
import { searchCars } from "./api";

describe("App", () => {
  it("renders the pickup section by default", () => {
    render(<App />);
    expect(screen.getByText(/Welcome to/)).toBeInTheDocument();
  });

  it("holds the fleet apps menu in the header, apps only, with Vroom current", () => {
    const { container } = render(<App />);
    const trigger = screen.getByRole("button", { name: "Apps and sign in" });
    expect(container.querySelector(".header .header-menu")).toContainElement(trigger);
    fireEvent.click(trigger);
    const panel = screen.getByRole("dialog", { name: "Crystal Prism apps and account" });
    expect(within(panel).getByRole("link", { name: "Vroom" })).toHaveAttribute("aria-current", "page");
    expect(document.querySelector(".fleet-account")).toBeNull();
  });
});

const BOSTON =
  "place=Boston%2C+MA%2C+USA&placeId=ChIJGzE9DS1l44kRoOhiASS_fHg&lat=42.3555&lng=-71.0565" +
  "&from=2030-11-03&to=2030-11-06";

describe("App trip URL", () => {
  afterEach(() => window.history.replaceState(null, "", "/"));

  it("resumes the rentals step from a refreshed URL", async () => {
    window.history.replaceState(null, "", `/?step=rentals&${BOSTON}`);
    render(<App />);
    expect(await screen.findByRole("heading", { level: 1, name: /Choose a car/ })).toBeInTheDocument();
    expect(window.location.search).toBe(`?step=rentals&${BOSTON}`);
  });

  it("resumes the confirm step with the chosen car", async () => {
    const cars = await searchCars(
      { label: "Boston, MA, USA", placeId: "ChIJGzE9DS1l44kRoOhiASS_fHg", location: { lat: 42.3555, lng: -71.0565 } },
      new Date(2030, 10, 3),
      new Date(2030, 10, 6),
    );
    const car = cars[1];
    window.history.replaceState(null, "", `/?step=confirm&${BOSTON}&car=${car.id}`);
    render(<App />);
    expect(await screen.findByRole("heading", { level: 1, name: /Review your car/ })).toBeInTheDocument();
    expect(screen.getAllByText(car.type).length).toBeGreaterThan(0);
  });

  it("walks back a step with browser Back", async () => {
    window.history.replaceState(null, "", `/?${BOSTON}`);
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Find cars" }));
    await screen.findByRole("heading", { level: 1, name: /Choose a car/ });
    expect(window.location.search).toBe(`?step=rentals&${BOSTON}`);

    window.history.back();
    expect(await screen.findByText(/Welcome to/)).toBeInTheDocument();
    expect(window.location.search).toBe(`?${BOSTON}`);
  });
});

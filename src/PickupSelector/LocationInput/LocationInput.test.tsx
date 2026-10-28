import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import LocationInput from "./LocationInput";

vi.mock("../../hooks/useScript", () => ({ useScript: () => "ready" }));

const prediction = (text: string, placeId: string, lat: number) => ({
  placeId,
  text: { text, matches: [{ startOffset: 0, endOffset: 3 }] },
  toPlace: () => {
    const place = {
      location: null as null | { lat: () => number; lng: () => number },
      fetchFields: vi.fn(async () => {
        place.location = { lat: () => lat, lng: () => -71 };
      }),
    };
    return place;
  },
});

const fetchAutocompleteSuggestions = vi.fn();

beforeEach(() => {
  fetchAutocompleteSuggestions.mockResolvedValue({
    suggestions: [
      { placePrediction: prediction("Boston, MA, USA", "p-boston", 42.36) },
      { placePrediction: prediction("Bossier City, LA, USA", "p-bossier", 32.5) },
    ],
  });
  window.google = {
    maps: {
      Map: class {},
      places: {
        AutocompleteSessionToken: class {},
        AutocompleteSuggestion: { fetchAutocompleteSuggestions },
      },
    },
  };
});

afterEach(() => {
  delete window.google;
  fetchAutocompleteSuggestions.mockReset();
});

describe("LocationInput", () => {
  it("suggests US cities and resolves the picked one", async () => {
    const setLocation = vi.fn();
    render(<LocationInput location={null} setLocation={setLocation} disabled={false} />);

    const field = screen.getByRole("combobox", { name: "Pick-up location" });
    await userEvent.type(field, "Bos");
    const options = await screen.findAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual([
      "Boston, MA, USA",
      "Bossier City, LA, USA",
    ]);
    expect(fetchAutocompleteSuggestions).toHaveBeenLastCalledWith(
      expect.objectContaining({ input: "Bos", includedPrimaryTypes: ["(cities)"], includedRegionCodes: ["us"] }),
    );

    await userEvent.click(options[0]);
    expect(setLocation).toHaveBeenLastCalledWith({
      label: "Boston, MA, USA",
      placeId: "p-boston",
      location: { lat: 42.36, lng: -71 },
    });
    expect(field).toHaveValue("Boston, MA, USA");
    expect(field).toHaveAttribute("aria-expanded", "false");
  });

  it("picks with the arrow keys and Enter", async () => {
    const setLocation = vi.fn();
    render(<LocationInput location={null} setLocation={setLocation} disabled={false} />);

    const field = screen.getByRole("combobox", { name: "Pick-up location" });
    await userEvent.type(field, "Bos");
    await screen.findAllByRole("option");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    expect(field).toHaveAttribute("aria-activedescendant", "location-suggestions-1");
    await userEvent.keyboard("{Enter}");
    expect(setLocation).toHaveBeenLastCalledWith(expect.objectContaining({ placeId: "p-bossier" }));
  });

  it("unpicks the place when the field is edited", async () => {
    const setLocation = vi.fn();
    render(
      <LocationInput
        location={{ label: "Boston, MA, USA", placeId: "p-boston", location: { lat: 42.36, lng: -71 } }}
        setLocation={setLocation}
        disabled={false}
      />,
    );
    await userEvent.type(screen.getByRole("combobox", { name: "Pick-up location" }), "x");
    expect(setLocation).toHaveBeenCalledWith(null);
  });

  it("says so when place search fails", async () => {
    fetchAutocompleteSuggestions.mockRejectedValue(new Error("403"));
    render(<LocationInput location={null} setLocation={vi.fn()} disabled={false} />);
    await userEvent.type(screen.getByRole("combobox", { name: "Pick-up location" }), "Bos");
    expect(await screen.findByText(/Place search isn’t responding/)).toBeInTheDocument();
  });
});

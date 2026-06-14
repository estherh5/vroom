import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SiteMenu from "./SiteMenu";

describe("SiteMenu", () => {
  it("opens when the menu toggle is clicked", () => {
    render(<SiteMenu />);

    const toggle = screen.getByRole("button", { name: "Open site menu" });
    fireEvent.click(toggle);

    expect(screen.getByRole("button", { name: "Close site menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByText("Timespace")).toBeVisible();
  });
});

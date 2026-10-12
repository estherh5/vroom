import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import App from "./App";

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

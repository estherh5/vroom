import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SelectMenu } from "./SelectMenu";

// A tap commits on pointerup and unmounts the popup, so the tap's trailing click used to land
// on whatever sat under the option. jsdom has no PointerEvent, so pointerType is set by hand.
function pick(pointerType: string) {
  const under = vi.fn();
  render(
    <>
      <SelectMenu ariaLabel="Pick" placeholder="Choose" value="" options={[{ value: "a", label: "Alpha" }]} onChange={() => {}} />
      <button onClick={under}>under</button>
    </>,
  );
  fireEvent.click(screen.getByRole("combobox", { name: "Pick" }));
  fireEvent(screen.getByRole("option", { name: "Alpha" }), Object.assign(new MouseEvent("pointerup", { bubbles: true }), { pointerType }));
  return { under, button: screen.getByRole("button", { name: "under" }) };
}

describe("SelectMenu ghost click", () => {
  it("a touch pick swallows exactly the one trailing click", () => {
    const { under, button } = pick("touch");
    fireEvent.click(button);
    expect(under).not.toHaveBeenCalled();
    fireEvent.click(button);
    expect(under).toHaveBeenCalledTimes(1);
  });

  it("a mouse pick leaves the next click alone", () => {
    const { under, button } = pick("mouse");
    fireEvent.click(button);
    expect(under).toHaveBeenCalledTimes(1);
  });
});

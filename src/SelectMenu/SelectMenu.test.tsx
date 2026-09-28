import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SelectMenu } from "./SelectMenu";

const OPTIONS = [
  { value: "view", label: "Can view" },
  { value: "comment", label: "Can comment" },
  { value: "edit", label: "Can edit" },
];

function Harness({ initial = "", name, onChange = vi.fn() }: { initial?: string; name?: string; onChange?: (v: string) => void }) {
  const [value, setValue] = useState(initial);
  return (
    <SelectMenu
      name={name}
      ariaLabel="Permission"
      placeholder="Choose…"
      value={value}
      options={OPTIONS}
      onChange={(v) => { setValue(v); onChange(v); }}
    />
  );
}

describe("SelectMenu", () => {
  it("shows the placeholder until a value is chosen, then the chosen label", async () => {
    render(<Harness />);
    const trigger = screen.getByRole("combobox", { name: "Permission" });
    expect(trigger).toHaveTextContent("Choose…");
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("option", { name: "Can edit" }));
    expect(trigger).toHaveTextContent("Can edit");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("marks the current value as the selected option", async () => {
    render(<Harness initial="comment" />);
    await userEvent.click(screen.getByRole("combobox", { name: "Permission" }));
    expect(screen.getByRole("option", { name: /Can comment/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("option", { name: /Can view/ })).toHaveAttribute("aria-selected", "false");
  });

  // Replacing a native <select> means re-earning what it gave for free.
  it("opens and selects with the keyboard, tracking the active option via aria-activedescendant", async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    const trigger = screen.getByRole("combobox", { name: "Permission" });
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{ArrowDown}");
    const active = trigger.getAttribute("aria-activedescendant");
    expect(document.getElementById(active!)).toHaveTextContent("Can comment");
    await userEvent.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith("comment");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("jumps to the last and first options with End and Home", async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    const trigger = screen.getByRole("combobox", { name: "Permission" });
    trigger.focus();
    await userEvent.keyboard("{Enter}{End}{Enter}");
    expect(onChange).toHaveBeenLastCalledWith("edit");
    await userEvent.keyboard("{Enter}{Home}{Enter}");
    expect(onChange).toHaveBeenLastCalledWith("view");
  });

  it("closes on Escape without changing the value", async () => {
    const onChange = vi.fn();
    render(<Harness initial="view" onChange={onChange} />);
    const trigger = screen.getByRole("combobox", { name: "Permission" });
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(onChange).not.toHaveBeenCalled();
    expect(trigger).toHaveTextContent("Can view");
  });

  // Regression: an enclosing dialog (e.g. FeedbackWidget's modal, ComposeDialog's
  // native <dialog>) may also listen for Escape. Without stopPropagation, closing
  // the open popup on Escape would bubble and ALSO close the dialog behind it in
  // the same keystroke.
  it("swallows Escape when the popup is open, so an enclosing dialog does not also close", async () => {
    const onDialogClose = vi.fn();
    render(
      <div onKeyDown={(e) => { if (e.key === "Escape") onDialogClose(); }}>
        <Harness initial="view" />
      </div>,
    );
    const trigger = screen.getByRole("combobox", { name: "Permission" });
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}"); // open the popup
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(onDialogClose).not.toHaveBeenCalled();
  });

  it("submits through a hidden input so it still works inside a form action", async () => {
    render(
      <form aria-label="perm form">
        <Harness name="permission" />
      </form>
    );
    const hidden = document.querySelector('input[name="permission"]') as HTMLInputElement;
    expect(hidden.value).toBe("");
    await userEvent.click(screen.getByRole("combobox", { name: "Permission" }));
    await userEvent.click(screen.getByRole("option", { name: "Can edit" }));
    expect(new FormData(screen.getByRole("form", { name: "perm form" }) as HTMLFormElement).get("permission")).toBe("edit");
  });

  it("does not open when disabled", async () => {
    render(
      <SelectMenu ariaLabel="Permission" placeholder="Choose…" value="" options={OPTIONS} onChange={vi.fn()} disabled />
    );
    const trigger = screen.getByRole("combobox", { name: "Permission" });
    expect(trigger).toBeDisabled();
    await userEvent.click(trigger);
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});

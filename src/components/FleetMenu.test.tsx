import { describe, expect, it } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { FleetMenu } from "./FleetMenu";
import type { FleetEntry } from "../lib/fleet";

const apps: FleetEntry[] = [
  { key: "giftme", name: "GiftMe", url: "https://giftme.crystalprism.io/", icon: "/i.png", tagline: "t", status: "live", current: true },
  { key: "nexus", name: "Nexus", url: "https://nexus.crystalprism.io/", icon: "/i.png", tagline: "t", status: "live", current: false },
];
const signOut = async () => {};
const base = { apps, settingsHref: "/settings", statsHref: null, signInHref: "/login", signOutAction: signOut, placement: "down-end" as const };

describe("FleetMenu", () => {
  it("signed in: prism on trigger, email + Settings + Sign out, no Sign in", () => {
    render(<FleetMenu {...base} user={{ email: "esther@example.com" }} />);
    const trigger = screen.getByRole("button", { name: /apps and account/i });
    expect(trigger.querySelector("svg")).toBeTruthy();
    expect(trigger.textContent).toBe("");
    fireEvent.click(trigger);
    expect(screen.getByText("esther@example.com")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Settings" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Sign out" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Sign in" })).toBeNull();
  });
  it("signed in: account rows precede the app grid in document order", () => {
    render(<FleetMenu {...base} user={{ email: "esther@example.com" }} />);
    fireEvent.click(screen.getByRole("button", { name: /apps and account/i }));
    const settings = screen.getByRole("link", { name: "Settings" });
    const firstApp = screen.getByRole("link", { name: "Nexus" });
    expect(settings.compareDocumentPosition(firstApp) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
  it("signed out: Sign in only, no account rows", () => {
    render(<FleetMenu {...base} user={null} />);
    fireEvent.click(screen.getByRole("button", { name: /apps and sign in/i }));
    expect(screen.getByRole("link", { name: "Sign in" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Settings" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Sign out" })).toBeNull();
  });
  it("Stats appears only with a statsHref", () => {
    const { unmount } = render(<FleetMenu {...base} user={{ email: "e@x.co" }} />);
    fireEvent.click(screen.getByRole("button", { name: /apps and account/i }));
    expect(screen.queryByRole("link", { name: "Stats" })).toBeNull();
    unmount();
    render(<FleetMenu {...base} statsHref="/stats" user={{ email: "e@x.co" }} />);
    fireEvent.click(screen.getByRole("button", { name: /apps and account/i }));
    expect(screen.getByRole("link", { name: "Stats" })).toBeTruthy();
  });
  it("marks the current app and lists all apps", () => {
    render(<FleetMenu {...base} user={null} />);
    fireEvent.click(screen.getByRole("button", { name: /apps and sign in/i }));
    expect(screen.getByRole("link", { name: "GiftMe" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Nexus" }).getAttribute("aria-current")).toBeNull();
  });
  it("Escape closes and returns focus to the trigger", () => {
    render(<FleetMenu {...base} user={null} />);
    const trigger = screen.getByRole("button", { name: /apps and sign in/i });
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
  it("outside pointerdown closes; inside does not", () => {
    render(<FleetMenu {...base} user={null} />);
    const trigger = screen.getByRole("button", { name: /apps and sign in/i });
    fireEvent.click(trigger);
    fireEvent.pointerDown(screen.getByRole("dialog"));
    expect(screen.getByRole("dialog")).toBeTruthy();
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
  it("portals the panel to document.body, outside the trigger's parent", () => {
    const { container } = render(<FleetMenu {...base} user={null} />);
    fireEvent.click(screen.getByRole("button", { name: /apps and sign in/i }));
    expect(container.contains(screen.getByRole("dialog"))).toBe(false);
  });
  it("closes when the page scrolls", () => {
    render(<FleetMenu {...base} user={null} />);
    fireEvent.click(screen.getByRole("button", { name: /apps and sign in/i }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    fireEvent.scroll(window);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
  const rowTexts = () =>
    [...document.querySelectorAll(".fleet-account .fleet-row")].map((n) => n.textContent);

  it("signed in: account rows are Settings, Stats, Sign out, in that order, before every app", () => {
    render(<FleetMenu {...base} statsHref="/stats" user={{ email: "e@x.co" }} />);
    fireEvent.click(screen.getByRole("button", { name: /apps and account/i }));
    expect(rowTexts()).toEqual(["Settings", "Stats", "Sign out"]);
    const last = screen.getByRole("button", { name: "Sign out" });
    const firstApp = screen.getAllByRole("link").find((l) => l.classList.contains("fleet-app"))!;
    expect(last.compareDocumentPosition(firstApp) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
  it("signed out: rows are Stats then Sign in", () => {
    render(<FleetMenu {...base} statsHref="/stats" user={null} />);
    fireEvent.click(screen.getByRole("button", { name: /apps and sign in/i }));
    expect(rowTexts()).toEqual(["Stats", "Sign in"]);
  });
  it("signed out with no signInHref and no statsHref: no account block at all", () => {
    render(<FleetMenu {...base} signInHref={null} user={null} />);
    fireEvent.click(screen.getByRole("button", { name: /apps and sign in/i }));
    expect(document.querySelector(".fleet-account")).toBeNull();
  });
  it("opening focuses the first account row", () => {
    render(<FleetMenu {...base} user={{ email: "e@x.co" }} />);
    fireEvent.click(screen.getByRole("button", { name: /apps and account/i }));
    expect(document.activeElement).toBe(screen.getByRole("link", { name: "Settings" }));
  });
  it("Tab wraps last→first and Shift+Tab wraps first→last", () => {
    render(<FleetMenu {...base} user={{ email: "e@x.co" }} />);
    fireEvent.click(screen.getByRole("button", { name: /apps and account/i }));
    const settings = screen.getByRole("link", { name: "Settings" });
    const lastApp = screen.getByRole("link", { name: "Nexus" });
    lastApp.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(settings);
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(lastApp);
  });
  it("Sign out stays open reading Signing out… until the action lands, then closes", async () => {
    let called = 0;
    let land!: () => void;
    const action = () => { called++; return new Promise<void>((r) => { land = r; }); };
    render(<FleetMenu {...base} signOutAction={action} user={{ email: "e@x.co" }} />);
    const trigger = screen.getByRole("button", { name: /apps and account/i });
    fireEvent.click(trigger);
    const row = screen.getByRole("button", { name: "Sign out" });
    fireEvent.click(row);
    expect(called).toBe(1);
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(row.textContent).toBe("Signing out…");
    expect(row.getAttribute("aria-disabled")).toBe("true");
    expect(row.querySelector(".fleet-spinner")?.getAttribute("aria-hidden")).toBe("true");
    fireEvent.click(row);
    fireEvent.pointerDown(document.body);
    fireEvent.scroll(window);
    expect(called).toBe(1);
    expect(screen.getByRole("dialog")).toBeTruthy();
    await act(async () => { land(); });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
  it("a failed Sign out keeps the menu open with an alert and a retryable row", async () => {
    let calls = 0;
    const action = async () => { calls++; throw new Error("offline"); };
    render(<FleetMenu {...base} signOutAction={action} user={{ email: "e@x.co" }} />);
    const trigger = screen.getByRole("button", { name: /apps and account/i });
    fireEvent.click(trigger);
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Sign out" })); });
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toMatch(/couldn’t sign out/i);
    const row = screen.getByRole("button", { name: "Sign out" });
    expect(row.getAttribute("aria-disabled")).toBeNull();
    await act(async () => { fireEvent.click(row); });
    expect(calls).toBe(2);
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(trigger);
    expect(screen.queryByRole("alert")).toBeNull();
  });
  it("a short window caps the popover height to the room below the trigger", () => {
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 420 });
    render(<FleetMenu {...base} user={null} />);
    const trigger = screen.getByRole("button", { name: /apps and sign in/i });
    trigger.getBoundingClientRect = () => ({ top: 12, bottom: 56, left: 1200, right: 1244, width: 44, height: 44, x: 1200, y: 12, toJSON() {} });
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog").style.maxBlockSize).toBe(`${420 - 56 - 24}px`);
  });
  it("a classic scrollbar is not counted in the popover's right offset", () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1280 });
    Object.defineProperty(document.documentElement, "clientWidth", { configurable: true, value: 1265 });
    render(<FleetMenu {...base} user={null} />);
    const trigger = screen.getByRole("button", { name: /apps and sign in/i });
    trigger.getBoundingClientRect = () => ({ top: 12, bottom: 56, left: 1200, right: 1244, width: 44, height: 44, x: 1200, y: 12, toJSON() {} });
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog").style.right).toBe("21px");
    delete (document.documentElement as { clientWidth?: number }).clientWidth;
  });
  it("a blank email: prism glyph, no email line, no dangling comma, account rows kept", () => {
    render(<FleetMenu {...base} user={{ email: "" }} />);
    const trigger = screen.getByRole("button", { name: "Apps and account" });
    expect(trigger.querySelector("svg")).toBeTruthy();
    expect(trigger.textContent).toBe("");
    fireEvent.click(trigger);
    expect(document.querySelector(".fleet-email")).toBeNull();
    expect(rowTexts()).toEqual(["Settings", "Sign out"]);
  });
  it("a whitespace email reads as blank; a padded one is trimmed", () => {
    const { unmount } = render(<FleetMenu {...base} user={{ email: "   " }} />);
    expect(screen.getByRole("button", { name: "Apps and account" })).toBeTruthy();
    unmount();
    render(<FleetMenu {...base} user={{ email: " esther@example.com " }} />);
    const trigger = screen.getByRole("button", { name: "Apps and account, esther@example.com" });
    expect(trigger.textContent).toBe("");
    fireEvent.click(trigger);
    expect(document.querySelector(".fleet-email")?.textContent).toBe("esther@example.com");
  });
  it("app icons load eagerly and decode off the main thread", () => {
    render(<FleetMenu {...base} user={null} />);
    fireEvent.click(screen.getByRole("button", { name: /apps and sign in/i }));
    for (const img of document.querySelectorAll(".fleet-app img")) {
      expect(img.getAttribute("loading")).toBe("eager");
      expect(img.getAttribute("decoding")).toBe("async");
    }
  });
  it("triggerClassName joins the kit class; without it the kit class stands alone", () => {
    const { unmount } = render(<FleetMenu {...base} user={null} triggerClassName="iconbtn" />);
    expect(screen.getByRole("button", { name: /apps and sign in/i }).className).toBe("fleet-trigger iconbtn");
    unmount();
    render(<FleetMenu {...base} user={null} />);
    expect(screen.getByRole("button", { name: /apps and sign in/i }).className).toBe("fleet-trigger");
  });
});

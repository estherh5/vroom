"use client";

// Copied byte-identical across the fleet (Next and Vite React apps alike); each
// app styles it through the --fleet-* tokens in its globals.
// Spec: ~/Developer/DESIGN.md "Fleet menu + footer".
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { FleetEntry } from "../lib/fleet";
import "./fleet.css";

type Props = {
  apps: FleetEntry[];
  user: { email: string } | null;
  settingsHref: string | null;
  // The Settings row's text, for an app whose only setting is one page (menagerie: "People & invites")
  settingsLabel?: string;
  statsHref: string | null;
  signInHref: string | null;
  signOutAction: (() => void | Promise<void>) | null;
  placement: "down-end" | "up-start";
  // The app's own icon-button class, so the trigger presses, borders and hovers like its
  // neighbors; the kit's .fleet-trigger look is a zero-specificity fallback beneath it
  triggerClassName?: string;
};

const FOCUSABLE = "a[href],button:not([disabled])";

export function FleetMenu({ apps, user, settingsHref, settingsLabel = "Settings", statsHref, signInHref, signOutAction, placement, triggerClassName }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<CSSProperties>({});
  const [signingOut, setSigningOut] = useState(false);
  const [signOutFailed, setSignOutFailed] = useState(false);
  // Read by the document listeners, which are bound once per open
  const signingOutRef = useRef(false);
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function toggle() {
    const r = triggerRef.current?.getBoundingClientRect();
    if (r && !open) {
      // clientWidth/Height, not innerWidth/Height: a fixed panel's offsets are
      // measured from the viewport inside a classic scrollbar (0 where there is no layout)
      const vw = document.documentElement.clientWidth || window.innerWidth;
      const vh = document.documentElement.clientHeight || window.innerHeight;
      setPos(placement === "up-start"
        ? { bottom: vh - r.top + 8, left: Math.max(16, r.left), maxBlockSize: Math.max(160, Math.min(640, r.top - 24)) }
        : { top: r.bottom + 8, right: Math.max(16, vw - r.right), maxBlockSize: Math.max(160, Math.min(640, vh - r.bottom - 24)) });
    }
    if (!open) setSignOutFailed(false);
    setOpen((o) => !o);
  }

  // The row stays mounted and reads "Signing out…" until the action lands; a redirect
  // replaces the page, a resolve closes the menu, a rejection keeps it open with an alert
  async function signOut() {
    if (!signOutAction || signingOutRef.current) return;
    signingOutRef.current = true;
    setSigningOut(true);
    setSignOutFailed(false);
    try {
      await signOutAction();
      close();
    } catch {
      setSignOutFailed(true);
    } finally {
      signingOutRef.current = false;
      setSigningOut(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") return close();
      if (e.key !== "Tab" || !panelRef.current) return;
      const items = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    }
    function onDown(e: PointerEvent) {
      if (signingOutRef.current) return;
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      close();
    }
    function onResize() { if (!signingOutRef.current) setOpen(false); }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, { passive: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize);
    };
  }, [open]);

  const who = user?.email.trim() || null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClassName ? `fleet-trigger ${triggerClassName}` : "fleet-trigger"}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={who ? `Apps and account, ${who}` : user ? "Apps and account" : "Apps and sign in"}
        onClick={toggle}
      >
        <PrismGlyph />
      </button>
      {open && createPortal(
        <>
          <div className="fleet-scrim" aria-hidden="true" />
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label="Crystal Prism apps and account"
            className="fleet-panel"
            style={pos}
          >
            {(user || statsHref || signInHref) && (
              <div className="fleet-account">
                {who && <p className="fleet-email">{who}</p>}
                {user && settingsHref && <a href={settingsHref} className="fleet-row">{settingsLabel}</a>}
                {statsHref && <a href={statsHref} className="fleet-row">Stats</a>}
                {user && signOutAction && (
                  <button type="button" className="fleet-row" aria-disabled={signingOut || undefined} onClick={() => void signOut()}>
                    {signingOut ? <><span className="fleet-spinner" aria-hidden="true" />Signing out…</> : "Sign out"}
                  </button>
                )}
                {signOutFailed && <p role="alert" className="fleet-alert">Couldn’t sign out. Check your connection and try again.</p>}
                {!user && signInHref && <a href={signInHref} className="fleet-row">Sign in</a>}
              </div>
            )}
            <ul className="fleet-apps">
              {apps.map((app) => (
                <li key={app.key}>
                  <a href={app.url} className="fleet-app" aria-current={app.current ? "page" : undefined}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- remote fleet icon, 40px */}
                    <img src={app.icon} alt="" width={40} height={40} loading="eager" decoding="async" />
                    <span>{app.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </>,
        document.body,
      )}
    </>
  );
}

// The Crystal Prism gem (crystalprism.io/favicon.svg): a table, three crown facets, three
// pavilion facets. Stroked in currentColor so it takes the host button's ink.
function PrismGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round">
      <path d="M7 3.5h10l5 5.5-10 12L2 9z" />
      <path d="M2 9h20M9.5 3.5 7.5 9 12 21l4.5-12-2-5.5" />
    </svg>
  );
}

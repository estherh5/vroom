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
  statsHref: string | null;
  signInHref: string | null;
  signOutAction: (() => void | Promise<void>) | null;
  placement: "down-end" | "up-start";
};

const FOCUSABLE = "a[href],button:not([disabled])";

export function FleetMenu({ apps, user, settingsHref, statsHref, signInHref, signOutAction, placement }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<CSSProperties>({});
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
      setPos(placement === "up-start"
        ? { bottom: window.innerHeight - r.top + 8, left: Math.max(16, r.left), maxBlockSize: Math.max(160, Math.min(640, r.top - 24)) }
        : { top: r.bottom + 8, right: Math.max(16, window.innerWidth - r.right), maxBlockSize: Math.max(160, Math.min(640, window.innerHeight - r.bottom - 24)) });
    }
    setOpen((o) => !o);
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
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      close();
    }
    function onResize() { setOpen(false); }
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

  const initial = user?.email.charAt(0).toUpperCase() ?? null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="fleet-trigger"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={user ? `Apps and account, ${user.email}` : "Apps and sign in"}
        onClick={toggle}
      >
        {initial ? <span aria-hidden="true">{initial}</span> : <GridGlyph />}
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
                {user && <p className="fleet-email">{user.email}</p>}
                {user && settingsHref && <a href={settingsHref} className="fleet-row">Settings</a>}
                {statsHref && <a href={statsHref} className="fleet-row">Stats</a>}
                {user && signOutAction && (
                  <button type="button" className="fleet-row" onClick={() => { setOpen(false); void signOutAction(); }}>Sign out</button>
                )}
                {!user && signInHref && <a href={signInHref} className="fleet-row">Sign in</a>}
              </div>
            )}
            <ul className="fleet-apps">
              {apps.map((app) => (
                <li key={app.key}>
                  <a href={app.url} className="fleet-app" aria-current={app.current ? "page" : undefined}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- remote fleet icon, 40px */}
                    <img src={app.icon} alt="" width={40} height={40} loading="lazy" />
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

function GridGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" fill="currentColor">
      {[2, 8, 14].flatMap((y) => [2, 8, 14].map((x) => <circle key={`${x}-${y}`} cx={x + 1} cy={y + 1} r="1.6" />))}
    </svg>
  );
}

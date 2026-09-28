import "./SelectMenu.css";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

export interface SelectOption { value: string; label: string; }

/** The app's one dropdown. Replaces native <select>, whose open option list can't be
 *  restyled cross-browser, while keeping what <select> gave us for free: keyboard
 *  navigation, typeahead, and form submission (via `name`, which renders a hidden input).
 *
 *  Follows the ARIA combobox pattern — focus stays on the trigger and the active option
 *  is tracked with aria-activedescendant, rather than moving focus into the list.
 *
 *  The popup is fixed-positioned off the trigger's rect rather than absolute: native
 *  <dialog> has a default overflow, which clips absolutely-positioned children. It stays
 *  a normal child (not portalled) so it remains in the dialog's top-layer subtree. */
export function SelectMenu({
  id, name, className = "selectbox", ariaLabel, ariaLabelledBy,
  value, placeholder, options, onChange, disabled = false,
}: {
  id?: string; name?: string; className?: string;
  ariaLabel?: string; ariaLabelledBy?: string;
  value: string; placeholder: string; options: SelectOption[];
  onChange: (v: string) => void; disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [pos, setPos] = useState<{ top?: number; bottom?: number; left: number; minWidth: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ query: "", at: 0 });
  const reactId = useId();
  const listId = `${id ?? reactId}-listbox`;

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  function openWith(index: number) {
    if (disabled) return;
    setActiveIndex(index >= 0 ? index : (selectedIndex >= 0 ? selectedIndex : 0));
    setOpen(true);
  }
  function commit(index: number) {
    const opt = options[index];
    if (opt) onChange(opt.value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  // Position off the trigger, flipping above it when the list would run off-screen.
  useLayoutEffect(() => {
    if (!open) return;
    function place() {
      const r = triggerRef.current?.getBoundingClientRect();
      if (!r) return;
      const needed = Math.min(listRef.current?.scrollHeight ?? 0, 260) || 260;
      const below = window.innerHeight - r.bottom - 8;
      const flip = below < needed && r.top - 8 > below;
      setPos({
        ...(flip ? { bottom: window.innerHeight - r.top + 4 } : { top: r.bottom + 4 }),
        left: r.left,
        minWidth: r.width,
      });
    }
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, options.length]);

  // Keep the active option in view while arrowing through a scrolled list.
  // (Guarded: jsdom and other non-layout environments don't implement it.)
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const el = listRef.current?.children[activeIndex];
    if (el instanceof HTMLElement && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ block: "nearest" });
    }
  }, [open, activeIndex]);

  // pointerdown, not mousedown — iOS WebKit delivers pointer events reliably for
  // taps, and this covers mouse, touch and pen with one listener.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      const t = e.target as Node;
      if (!rootRef.current?.contains(t) && !listRef.current?.contains(t)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    const last = options.length - 1;
    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp": {
        e.preventDefault();
        const step = e.key === "ArrowDown" ? 1 : -1;
        if (!open) { openWith(selectedIndex >= 0 ? selectedIndex : (step > 0 ? 0 : last)); return; }
        setActiveIndex((i) => Math.min(last, Math.max(0, (i < 0 ? selectedIndex : i) + step)));
        return;
      }
      case "Home":
      case "End":
        if (!open) return;
        e.preventDefault();
        setActiveIndex(e.key === "Home" ? 0 : last);
        return;
      case "Enter":
      case " ":
        e.preventDefault();
        if (!open) openWith(selectedIndex);
        else commit(activeIndex);
        return;
      case "Escape":
        if (!open) return;
        // Stop here: an enclosing dialog also listens for Escape, and closing
        // the menu should not also close the dialog behind it.
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        return;
      case "Tab":
        setOpen(false);
        return;
    }
    // Typeahead: repeated presses within a second refine the query, matching <select>.
    if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const now = e.timeStamp;
      const t = typeahead.current;
      t.query = now - t.at < 1000 ? t.query + e.key : e.key;
      t.at = now;
      const found = options.findIndex((o) => o.label.toLowerCase().startsWith(t.query.toLowerCase()));
      if (found < 0) return;
      e.preventDefault();
      if (open) setActiveIndex(found);
      else onChange(options[found].value);
    }
  }

  return (
    <div className="selectmenu" ref={rootRef}>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        type="button"
        id={id}
        ref={triggerRef}
        className={className}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        onClick={() => (open ? setOpen(false) : openWith(selectedIndex))}
        onKeyDown={onKeyDown}
      >
        <span className="selectbox-value">{selected ? selected.label : placeholder}</span>
      </button>
      {open && (
        <ul
          className="selectmenu-popup"
          id={listId}
          ref={listRef}
          role="listbox"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          style={pos ? { ...pos, visibility: "visible" } : { visibility: "hidden" }}
        >
          {options.map((o, i) => (
            <li
              key={o.value}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={o.value === value}
              className={i === activeIndex ? "is-active" : undefined}
              onMouseEnter={() => setActiveIndex(i)}
              // onPointerUp, not onClick: iOS WebKit is unreliable about firing
              // synthetic click on non-interactive elements like <li>. Keyboard
              // activation is handled on the trigger, so nothing is lost here.
              onPointerUp={(e) => { if (e.pointerType === "touch") swallowGhostClick(); commit(i); }}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** A tap commits on pointerup, which unmounts the popup; the browser's trailing click then
 *  lands on whatever was under the finger — a button, a link, another dropdown's trigger.
 *  Its target has already left the DOM, so nothing on the option can cancel it. Stop that one
 *  click at the window before anything else hears it; the timeout covers a click that never
 *  comes, so a later real click is never eaten. */
function swallowGhostClick(ms = 600) {
  const stop = (e: Event) => { e.preventDefault(); e.stopPropagation(); done(); };
  const done = () => { window.removeEventListener("click", stop, true); clearTimeout(timer); };
  window.addEventListener("click", stop, true);
  const timer = setTimeout(done, ms);
}

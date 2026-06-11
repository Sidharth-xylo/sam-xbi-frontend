import React, { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

/**
 * Themed, accessible dropdown that fully matches the dark-neon aesthetic, unlike a native
 * <select>, whose option list is painted by the OS (a white popup on Windows). Drop-in for the
 * old selects: `options` is [{ value, label }], `value` is the current value (string|number|""),
 * and `onChange(value)` fires with the chosen raw value ("" for the placeholder row).
 *
 * Keyboard: Enter/Space/ArrowDown opens, ArrowUp/ArrowDown move, Enter selects, Esc closes, type-ahead jumps.
 */
export default function Select({
  value,
  onChange,
  options = [],
  placeholder = "All",
  disabled = false,
  clearable = true,
  accent = "var(--xbi-lime)",
  id,
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [drop, setDrop] = useState("down");
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const typeahead = useRef({ str: "", t: 0 });
  const autoId = useId();
  const listId = id || autoId;

  const opts = options.map((o) => ({ value: String(o.value), label: o.label }));
  const rows = clearable ? [{ value: "", label: placeholder }, ...opts] : opts;
  const current = rows.find((r) => String(r.value) === String(value ?? "")) || { value: "", label: placeholder };

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // Flip the menu upward if there isn't room below; keep the active row in view.
  useLayoutEffect(() => {
    if (!open) return;
    const rect = rootRef.current?.getBoundingClientRect();
    if (rect) setDrop(window.innerHeight - rect.bottom < 280 && rect.top > 280 ? "up" : "down");
    const idx = rows.findIndex((r) => String(r.value) === String(value ?? ""));
    setActive(idx < 0 ? 0 : idx);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open && active >= 0) listRef.current?.querySelectorAll("li")[active]?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function choose(v) { onChange(v); setOpen(false); }

  function onKeyDown(e) {
    if (disabled) return;
    if (!open && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")) { e.preventDefault(); setOpen(true); return; }
    if (!open) return;
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(rows.length - 1, i + 1)); return; }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); return; }
    if (e.key === "Enter") { e.preventDefault(); if (active >= 0) choose(rows[active].value); return; }
    if (e.key === "Tab") { setOpen(false); return; }
    if (e.key.length === 1) {
      const now = Date.now();
      typeahead.current.str = now - typeahead.current.t < 800 ? typeahead.current.str + e.key : e.key;
      typeahead.current.t = now;
      const hit = rows.findIndex((r) => r.label.toLowerCase().startsWith(typeahead.current.str.toLowerCase()));
      if (hit >= 0) setActive(hit);
    }
  }

  return (
    <div className={`xselect ${open ? "open" : ""} ${disabled ? "is-disabled" : ""}`} ref={rootRef} style={{ "--sel-accent": accent }}>
      <button
        type="button"
        className="xselect-trigger"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onKeyDown}
      >
        <span className={`xselect-value ${current.value === "" ? "is-placeholder" : ""}`}>{current.label}</span>
        <ChevronDown size={15} className="xselect-caret" />
      </button>
      {open && (
        <ul className={`xselect-menu drop-${drop}`} role="listbox" id={listId} ref={listRef}>
          {rows.map((r, i) => {
            const selected = String(r.value) === String(value ?? "");
            return (
              <li
                key={r.value || "__all"}
                role="option"
                aria-selected={selected}
                className={`xselect-option ${selected ? "selected" : ""} ${i === active ? "active" : ""} ${r.value === "" ? "is-placeholder" : ""}`}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => { e.preventDefault(); choose(r.value); }}
              >
                <span>{r.label}</span>
                {selected && <Check size={14} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

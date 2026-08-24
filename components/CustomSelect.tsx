"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "./CustomSelect.css";

export type CustomSelectProps = {
  value: string;
  options: string[];
  placeholder: string;
  onChange: (val: string) => void;
  ariaLabel?: string;
  /** Adds a type-to-filter box at the top of the menu — for long lists
      (e.g. 50 states) where scrolling alone is a chore. */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Show a clear (×) affordance on hover once a value is set, so the control
      can be reset without opening the menu. */
  clearable?: boolean;
  /** What "cleared" does. Defaults to onChange("") when clearable and unset. */
  onClear?: () => void;
};

export default function CustomSelect({
  value,
  options,
  placeholder,
  onChange,
  ariaLabel,
  searchable = false,
  searchPlaceholder = "Type to search…",
  clearable = false,
  onClear
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  // Whether the menu opens upward — decided when it opens, from the space
  // available below the control. Near the bottom of the viewport (e.g. the
  // hero's state picker) it flips up instead of being clipped.
  const [dropUp, setDropUp] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  // Matches anywhere in the name, but names that START with the query rank
  // first — typing "ne" puts Nebraska/Nevada/New… above Maine/Tennessee.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!searchable || !q) return options;
    const starts: string[] = [];
    const contains: string[] = [];
    for (const o of options) {
      const lo = o.toLowerCase();
      if (lo.startsWith(q)) starts.push(o);
      else if (lo.includes(q)) contains.push(o);
    }
    return [...starts, ...contains];
  }, [options, query, searchable]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setHighlight(Math.max(0, options.indexOf(value)));
      if (searchable) searchRef.current?.focus();
      else listRef.current?.focus();
    }
    // Deliberately keyed to `open` alone: options/value are often rebuilt on
    // every parent render, and refiring on their identity would wipe an
    // in-progress search (and steal focus) any time something else on the
    // page re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Typing re-filters — keep the highlight on something that exists.
  useEffect(() => {
    if (open) setHighlight(filtered.length > 0 ? 0 : -1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Decide drop direction the moment the menu opens: if there isn't room for
  // the menu below the control but there is above, open upward.
  const openMenu = () => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (rect) {
      const MENU_MAX = 320; // menu max-height (300) + a little breathing room
      const below = window.innerHeight - rect.bottom;
      const above = rect.top;
      setDropUp(below < MENU_MAX && above > below);
    }
    setOpen(true);
  };

  const choose = (opt: string) => {
    onChange(opt);
    setOpen(false);
  };

  const moveHighlight = (delta: number) => {
    if (filtered.length === 0) return;
    setHighlight((i) => {
      const next = (i + delta + filtered.length) % filtered.length;
      // Keep the highlighted row in view as arrows move past the fold.
      listRef.current
        ?.querySelectorAll("li")
        [next]?.scrollIntoView({ block: "nearest" });
      return next;
    });
  };

  const onNavKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveHighlight(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveHighlight(-1);
    } else if (e.key === "Home") {
      e.preventDefault();
      setHighlight(filtered.length > 0 ? 0 : -1);
    } else if (e.key === "End") {
      e.preventDefault();
      setHighlight(filtered.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlight >= 0 && highlight < filtered.length) choose(filtered[highlight]);
    } else if (e.key === "Tab") {
      setOpen(false);
    } else if (e.key === " " && !searchable) {
      // Space selects in plain listbox mode; in search mode it types a space.
      e.preventDefault();
      if (highlight >= 0 && highlight < filtered.length) choose(filtered[highlight]);
    }
  };

  const onButtonKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openMenu();
    }
  };

  return (
    <div className={`t321-mkt-select${open ? " is-open" : ""}`} ref={wrapRef}>
      <button
        type="button"
        className={`t321-mkt-select__btn${value ? " has-value" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onButtonKey}
      >
        <span className="t321-mkt-select__label">{value || placeholder}</span>
        <i className="fas fa-chevron-down" aria-hidden="true" />
      </button>
      {/* Separate button, not nested in the one above (a button inside a
          button is invalid). Sits over the chevron on hover; stops propagation
          so clearing never opens the menu. */}
      {clearable && value && (
        <button
          type="button"
          className="t321-mkt-select__clear"
          aria-label="Clear selection"
          onClick={(e) => {
            e.stopPropagation();
            if (onClear) onClear();
            else onChange("");
          }}
        >
          <i className="fas fa-times" aria-hidden="true" />
        </button>
      )}
      {open && (
        <div className={`t321-mkt-select__menu${dropUp ? " is-up" : ""}`} role="presentation">
          {searchable && (
            <div className="t321-mkt-select__search">
              <i className="fas fa-search" aria-hidden="true" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onNavKey}
              />
            </div>
          )}
          <ul
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            className="t321-mkt-select__list"
            onKeyDown={onNavKey}
          >
            {filtered.length === 0 ? (
              <li className="t321-mkt-select__none">No matches</li>
            ) : (
              filtered.map((opt, i) => (
                <li
                  key={opt}
                  role="option"
                  aria-selected={value === opt}
                  className={`t321-mkt-select__opt${highlight === i ? " is-active" : ""}${value === opt ? " is-selected" : ""}`}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => choose(opt)}
                >
                  <span>{opt}</span>
                  {value === opt && <i className="fas fa-check" aria-hidden="true" />}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

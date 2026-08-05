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
};

export default function CustomSelect({
  value,
  options,
  placeholder,
  onChange,
  ariaLabel,
  searchable = false,
  searchPlaceholder = "Type to search…"
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
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
  }, [open, options, value, searchable]);

  // Typing re-filters — keep the highlight on something that exists.
  useEffect(() => {
    if (open) setHighlight(filtered.length > 0 ? 0 : -1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

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
      setOpen(true);
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
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onButtonKey}
      >
        <span className="t321-mkt-select__label">{value || placeholder}</span>
        <i className="fas fa-chevron-down" aria-hidden="true" />
      </button>
      {open && (
        <div className="t321-mkt-select__menu" role="presentation">
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

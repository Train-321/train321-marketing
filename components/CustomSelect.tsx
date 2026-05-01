"use client";

import { useEffect, useRef, useState } from "react";
import "./CustomSelect.css";

export type CustomSelectProps = {
  value: string;
  options: string[];
  placeholder: string;
  onChange: (val: string) => void;
  ariaLabel?: string;
};

export default function CustomSelect({
  value,
  options,
  placeholder,
  onChange,
  ariaLabel
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

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
      setHighlight(Math.max(0, options.indexOf(value)));
      listRef.current?.focus();
    }
  }, [open, options, value]);

  const onButtonKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  };

  const onListKey = (e: React.KeyboardEvent<HTMLUListElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((i) => (i + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((i) => (i - 1 + options.length) % options.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      setHighlight(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setHighlight(options.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (highlight >= 0 && highlight < options.length) {
        onChange(options[highlight]);
        setOpen(false);
      }
    } else if (e.key === "Tab") {
      setOpen(false);
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
        <ul
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          className="t321-mkt-select__menu"
          onKeyDown={onListKey}
        >
          {options.map((opt, i) => (
            <li
              key={opt}
              role="option"
              aria-selected={value === opt}
              className={`t321-mkt-select__opt${highlight === i ? " is-active" : ""}${value === opt ? " is-selected" : ""}`}
              onMouseEnter={() => setHighlight(i)}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              <span>{opt}</span>
              {value === opt && <i className="fas fa-check" aria-hidden="true" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

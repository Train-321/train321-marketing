"use client";

import { useEffect, useState } from "react";
import "./EnrollButton.css";

export type StateOption = { state: string; href: string; title?: string };

type Props = {
  /** Fallback single-enroll link, used when there are no state options. */
  href: string;
  label: string;
  /** Button/link classes (e.g. the t321-mkt-btn variants). */
  className: string;
  showArrow?: boolean;
  /** When non-empty, the button opens a state picker instead of linking out. */
  options?: StateOption[];
  pickerTitle?: string;
  pickerLede?: string;
};

export default function EnrollButton({
  href,
  label,
  className,
  showArrow = true,
  options,
  pickerTitle = "Choose your state",
  pickerLede = "Requirements vary by state. Pick yours and we’ll take you straight to the right version."
}: Props) {
  const [open, setOpen] = useState(false);
  const hasOptions = Array.isArray(options) && options.length > 0;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // No grouping → behave exactly like the original enroll link.
  if (!hasOptions) {
    return (
      <a href={href} className={className}>
        {label}
        {showArrow && <i className="fas fa-arrow-right" aria-hidden="true" />}
      </a>
    );
  }

  return (
    <>
      <button
        type="button"
        className={className}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        {label}
        {showArrow && <i className="fas fa-arrow-right" aria-hidden="true" />}
      </button>

      {open && (
        <div
          className="t321-mkt-enroll"
          role="dialog"
          aria-modal="true"
          aria-labelledby="t321-enroll-title"
          onClick={() => setOpen(false)}
        >
          <div className="t321-mkt-enroll__panel" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="t321-mkt-enroll__close"
              aria-label="Close state picker"
              onClick={() => setOpen(false)}
            >
              <i className="fas fa-times" aria-hidden="true" />
            </button>

            <div className="t321-mkt-enroll__head">
              <span className="t321-mkt-enroll__eyebrow">
                <i className="fas fa-map-marker-alt" aria-hidden="true" /> State-specific
              </span>
              <h2 id="t321-enroll-title" className="t321-mkt-enroll__title">{pickerTitle}</h2>
              <p className="t321-mkt-enroll__sub">{pickerLede}</p>
            </div>

            <ul className="t321-mkt-enroll__list">
              {options!.map((o) => (
                <li key={o.state}>
                  <a href={o.href} className="t321-mkt-enroll__option">
                    <span className="t321-mkt-enroll__option-state">{o.state}</span>
                    {o.title && o.title !== o.state && (
                      <span className="t321-mkt-enroll__option-course">{o.title}</span>
                    )}
                    <i className="fas fa-arrow-right" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

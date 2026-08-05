"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { CartCourse } from "@/lib/enroll";
import { useCart } from "./cart/CartContext";
import "./EnrollButton.css";

export type StateOption = {
  state: string;
  /** Multi-state variants: the normalized 2-letter codes, rendered as chips. */
  stateCodes?: string[];
  href: string;
  title?: string;
  /**
   * Set when this state version resolved to a real marketplace course. Null
   * means the Sanity doc still holds a legacy slug rather than a course id, so
   * the option keeps linking out to the /enroll SPA.
   */
  course?: CartCourse | null;
};

type Props = {
  /** Outbound fallback, used whenever `course` is null. */
  href: string;
  label: string;
  /** Button/link classes (e.g. the t321-mkt-btn variants). */
  className: string;
  showArrow?: boolean;
  /** When non-empty, the button opens a state picker instead of acting directly. */
  options?: StateOption[];
  pickerTitle?: string;
  pickerLede?: string;
  /**
   * The marketplace course this button sells. When present the button buys
   * inline instead of navigating to the external enroll page.
   */
  course?: CartCourse | null;
  /** "buy" adds and goes to checkout; "add" adds and opens the cart drawer. */
  mode?: "buy" | "add";
};

/**
 * The Enroll CTA on course pages. It has three shapes, in priority order:
 *
 *   1. state options present  → open a picker, then act on the chosen version
 *   2. `course` resolved      → add to the cart (inline purchase)
 *   3. neither                → plain link to the external /enroll page
 *
 * Shape 3 is the pre-existing behaviour and is what still runs for the course
 * documents whose `enrollId` hasn't been re-linked to a marketplace id yet.
 */
export default function EnrollButton({
  href,
  label,
  className,
  showArrow = true,
  options,
  pickerTitle = "Choose your state",
  pickerLede = "Requirements vary by state. Pick yours and we’ll take you straight to the right version.",
  course = null,
  mode = "buy"
}: Props) {
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const { add, has, openDrawer, notifyAdded, buyer } = useCart();
  const router = useRouter();

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

  /** Drop a resolved course in the cart and go wherever `mode` says. */
  const buy = (target: CartCourse) => {
    add(target);
    if (mode === "buy") {
      router.push("/checkout");
      return;
    }
    // Toast confirmation instead of flinging the drawer open mid-browse.
    notifyAdded(target.name);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  // ── 3. Not purchasable inline → original outbound link ─────────────────
  if (!hasOptions && !course) {
    return (
      <a href={href} className={className}>
        {label}
        {showArrow && <i className="fas fa-arrow-right" aria-hidden="true" />}
      </a>
    );
  }

  // ── 2. Single course, buyable inline ───────────────────────────────────
  if (!hasOptions && course) {
    // In "add" mode a course already in the cart usually has nothing more to
    // add, so the button becomes a way back into the drawer. Seat-based
    // courses stay addable only in team mode (re-add bumps the seat count).
    const settled =
      mode === "add" &&
      has(course.id) &&
      (!course.isSeatBased || buyer.audience !== "company");
    return (
      <button
        type="button"
        className={className}
        onClick={() => (settled ? openDrawer() : buy(course))}
      >
        {added ? (
          <>
            <i className="fas fa-check" aria-hidden="true" /> Added
          </>
        ) : settled ? (
          <>
            <i className="fas fa-check" aria-hidden="true" /> In cart
          </>
        ) : (
          <>
            {label}
            {showArrow && <i className="fas fa-arrow-right" aria-hidden="true" />}
          </>
        )}
      </button>
    );
  }

  // ── 1. State picker ────────────────────────────────────────────────────
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
              {/* Keys: several variants can share a state label (e.g. two
                  "All states" versions), so the course id / index breaks
                  the tie. */}
              {options!.map((o, idx) =>
                o.course ? (
                  // Resolved to a real course — buy it inline.
                  <li key={o.course.id}>
                    <button
                      type="button"
                      className="t321-mkt-enroll__option"
                      onClick={() => {
                        setOpen(false);
                        buy(o.course!);
                      }}
                    >
                      <OptionBody option={o} />
                    </button>
                  </li>
                ) : (
                  // Not linked to a marketplace id yet — keep the old link.
                  <li key={`${o.state}-${idx}`}>
                    <a href={o.href} className="t321-mkt-enroll__option">
                      <OptionBody option={o} />
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Shared inner layout for a state-picker row: the state line gets the full
 * row width (a bold name, or one chip per code for multi-state variants —
 * every state visible, nothing truncated), with the course name beneath and
 * the arrow pinned to the edge.
 */
function OptionBody({ option }: { option: StateOption }) {
  return (
    <>
      <span className="t321-mkt-enroll__option-body">
        {option.stateCodes?.length ? (
          <span className="t321-mkt-enroll__option-states" aria-label={option.state}>
            {option.stateCodes.map((c) => (
              <em key={c}>{c}</em>
            ))}
          </span>
        ) : (
          <span className="t321-mkt-enroll__option-state">{option.state}</span>
        )}
        {option.title && option.title !== option.state && (
          <span className="t321-mkt-enroll__option-course">{option.title}</span>
        )}
      </span>
      <i className="fas fa-arrow-right" aria-hidden="true" />
    </>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CartCourse } from "@/lib/enroll";
import { useCart } from "./cart/CartContext";

type Props = {
  /** Link target — the external enroll fallback, or an on-page anchor such as
      "#choose-your-state" for grouped courses. */
  href: string;
  label: string;
  /** Button/link classes (e.g. the t321-mkt-btn variants). */
  className: string;
  showArrow?: boolean;
  /**
   * The marketplace course this button sells. When present the button buys
   * inline instead of navigating to `href`.
   */
  course?: CartCourse | null;
  /** "buy" adds and goes to checkout; "add" adds and shows the toast. */
  mode?: "buy" | "add";
};

/**
 * The Enroll CTA on course pages. Two shapes:
 *
 *   1. `course` resolved → add to the cart (inline purchase)
 *   2. otherwise         → plain link to `href` — either the external enroll
 *      page (unlinked legacy courses) or the on-page "Choose your state"
 *      section (grouped courses, see StateCoursePicker).
 */
export default function EnrollButton({
  href,
  label,
  className,
  showArrow = true,
  course = null,
  mode = "buy"
}: Props) {
  const [added, setAdded] = useState(false);
  const { add, has, openDrawer, notifyAdded, buyer } = useCart();
  const router = useRouter();

  // ── 2. Not purchasable inline → link (external or on-page anchor) ──────
  if (!course) {
    return (
      <a href={href} className={className}>
        {label}
        {showArrow && <i className="fas fa-arrow-right" aria-hidden="true" />}
      </a>
    );
  }

  // ── 1. Single course, buyable inline ───────────────────────────────────
  // In "add" mode a course already in the cart usually has nothing more to
  // add, so the button becomes a way back into the drawer. Seat-based
  // courses stay addable only in team mode (re-add bumps the seat count).
  const settled =
    mode === "add" &&
    has(course.id) &&
    (!course.isSeatBased || buyer.audience !== "company");

  const buy = () => {
    add(course);
    if (mode === "buy") {
      router.push("/checkout");
      return;
    }
    // Toast confirmation instead of flinging the drawer open mid-browse.
    notifyAdded(course.name);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <button
      type="button"
      className={className}
      onClick={() => (settled ? openDrawer() : buy())}
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

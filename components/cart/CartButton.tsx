"use client";

import Link from "next/link";
import { useCart } from "./CartContext";
import "./CartButton.css";

/**
 * The header's primary CTA slot, with two personalities:
 *
 *   cart empty  → a regular "Enroll now" button linking to the catalog —
 *                 identical styling to every other primary CTA on the site
 *   cart filled → an icon-only cart button that opens the drawer, with the
 *                 count badge pinned to the button's top-right corner
 *
 * One slot, one job: "take the next step toward buying". What that step is
 * simply changes once there's something in the cart.
 */
export default function CartButton() {
  const { count, openDrawer, drawerOpen } = useCart();

  if (count === 0) {
    return (
      <Link href="/catalog" className="t321-mkt-btn t321-mkt-btn--primary t321-mkt-cartbtn-slot">
        Enroll now <i className="fas fa-arrow-right" aria-hidden="true" />
      </Link>
    );
  }

  return (
    <button
      type="button"
      className="t321-mkt-cartbtn t321-mkt-cartbtn-slot"
      aria-label={`Open cart, ${count} ${count === 1 ? "course" : "courses"}`}
      aria-haspopup="dialog"
      aria-expanded={drawerOpen}
      onClick={openDrawer}
    >
      <i className="fas fa-shopping-cart" aria-hidden="true" />
      {/* Keyed on the count so React remounts the node on every change,
          re-triggering the pop animation instead of silently swapping the
          number. Pinned to the button's own corner, not the icon. */}
      <span key={count} className="t321-mkt-cartbtn__badge">
        {count}
      </span>
    </button>
  );
}

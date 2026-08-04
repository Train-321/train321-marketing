"use client";

import { useCart } from "./CartContext";
import "./CartButton.css";

/**
 * The cart entry point in the header nav, sitting where "Enroll now" used to.
 *
 * Always rendered (not just when the cart has items) so its position in the
 * nav is stable and buyers always know where the cart lives. The count badge
 * is what appears and disappears.
 */
export default function CartButton() {
  const { count, openDrawer, drawerOpen } = useCart();

  return (
    <button
      type="button"
      className={`t321-mkt-cartbtn${count > 0 ? " has-items" : ""}`}
      aria-label={
        count > 0
          ? `Open cart, ${count} ${count === 1 ? "course" : "courses"}`
          : "Open cart, empty"
      }
      aria-haspopup="dialog"
      aria-expanded={drawerOpen}
      onClick={openDrawer}
    >
      <span className="t321-mkt-cartbtn__icon">
        <i className="fas fa-shopping-cart" aria-hidden="true" />
        {count > 0 && (
          // Keyed on the count so React remounts the node on every change,
          // which re-triggers the pop animation instead of silently swapping
          // the number.
          <span key={count} className="t321-mkt-cartbtn__badge">
            {count}
          </span>
        )}
      </span>
      <span className="t321-mkt-cartbtn__label">Cart</span>
    </button>
  );
}

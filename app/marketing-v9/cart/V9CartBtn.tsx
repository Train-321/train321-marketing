"use client";

import { useV9Cart } from "./V9CartContext";

// Header cart trigger for /marketing-v9 — opens the isolated v9 drawer.
export default function V9CartBtn() {
  const { count, openDrawer, drawerOpen } = useV9Cart();
  return (
    <button
      type="button"
      className="gs-cartbtn"
      aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}`}
      aria-haspopup="dialog"
      aria-expanded={drawerOpen}
      onClick={openDrawer}
    >
      <i className="fas fa-shopping-cart" aria-hidden="true" />
      {count > 0 && <span key={count} className="gs-cartbtn__badge">{count}</span>}
    </button>
  );
}

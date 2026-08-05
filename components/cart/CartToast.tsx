"use client";

import { useEffect, useState } from "react";
import { useCart } from "./CartContext";
import "./CartToast.css";

/** Auto-dismiss delay. Long enough to read, short enough to never nag. */
const SHOW_MS = 3500;
/** Keep in sync with the exit animation duration in CartToast.css. */
const EXIT_MS = 220;

/**
 * Bottom-center "Added to cart" confirmation.
 *
 * Replaces the old behaviour of flinging the drawer open on every add — the
 * drawer interrupted browsing, which is exactly the moment the buyer said
 * "I'm not done yet". The toast confirms without stealing the page, and its
 * "View cart" button is the opt-in path into the drawer.
 *
 * Keyed remount per add (toast.id) restarts both the pop animation and the
 * dismiss timer when courses are added back-to-back.
 */
export default function CartToast() {
  const { toast, dismissToast, openDrawer, drawerOpen } = useCart();
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!toast) return;
    setClosing(false);

    const hide = setTimeout(() => setClosing(true), SHOW_MS);
    const gone = setTimeout(() => dismissToast(), SHOW_MS + EXIT_MS);
    return () => {
      clearTimeout(hide);
      clearTimeout(gone);
    };
  }, [toast, dismissToast]);

  // The drawer shows the same information and sits above this layer — a toast
  // peeking around it would just be noise.
  if (!toast || drawerOpen) return null;

  return (
    <div
      key={toast.id}
      className={`t321-mkt-carttoast${closing ? " is-closing" : ""}`}
      role="status"
      aria-live="polite"
    >
      <span className="t321-mkt-carttoast__icon">
        <i className="fas fa-check" aria-hidden="true" />
      </span>
      <p className="t321-mkt-carttoast__text">
        <strong>Added to cart</strong>
        <span>{toast.name}</span>
      </p>
      <button
        type="button"
        className="t321-mkt-carttoast__view"
        onClick={() => {
          dismissToast();
          openDrawer();
        }}
      >
        View cart
      </button>
      <button
        type="button"
        className="t321-mkt-carttoast__close"
        aria-label="Dismiss"
        onClick={() => dismissToast()}
      >
        <i className="fas fa-times" aria-hidden="true" />
      </button>
    </div>
  );
}

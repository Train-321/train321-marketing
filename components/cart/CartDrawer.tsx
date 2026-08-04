"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "./CartContext";
import { COURSE_PLACEHOLDER_IMAGE } from "@/lib/newFeatures";
import "./CartDrawer.css";

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

/** Keep in sync with the exit animation duration in CartDrawer.css. */
const EXIT_MS = 240;

/**
 * The slide-in cart panel. Opened from <CartButton /> in the header nav.
 *
 * Mounted once in the root layout so the drawer is reachable from any page.
 * It has no trigger of its own — the header owns that.
 */
export default function CartDrawer() {
  const {
    lines,
    count,
    quote,
    loading,
    promoCode,
    promoError,
    applyPromo,
    drawerOpen,
    closeDrawer,
    remove,
    setUsers,
    buyer,
    setAudience
  } = useCart();

  // Which numbers to show: individual = one-time totals; company = the
  // chosen cadence's subscription view (first invoice + ongoing rate).
  const isCompany = buyer.audience === "company";
  const cq = quote ? (buyer.cadence === "yearly" ? quote.yearly : quote.monthly) : null;
  const shownSubtotal = isCompany ? cq?.subtotal : quote?.subtotal;
  const shownDiscount = isCompany ? cq?.discount ?? 0 : quote?.discount ?? 0;
  const shownTotal = isCompany ? cq?.dueToday : quote?.dueToday;
  const cadenceUnit = buyer.cadence === "yearly" ? "yr" : "mo";

  const pathname = usePathname();
  const panelRef = useRef<HTMLElement | null>(null);

  // The drawer stays in the DOM through its exit animation — unmounting on
  // `drawerOpen === false` would make it vanish instantly with no transition.
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (drawerOpen) {
      setMounted(true);
      setClosing(false);
      return;
    }
    if (!mounted) return;

    setClosing(true);
    const t = setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, EXIT_MS);
    return () => clearTimeout(t);
  }, [drawerOpen, mounted]);

  // Close on navigation. `closeDrawer` is a stable callback, so this effect
  // only ever runs on a real route change.
  useEffect(() => {
    closeDrawer();
  }, [pathname, closeDrawer]);

  // Escape to close, and hold the background still while open.
  useEffect(() => {
    if (!drawerOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };

    // Compensate for the vanishing scrollbar so the page behind doesn't shift
    // sideways the moment the drawer opens.
    const gap = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPad = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPad;
    };
  }, [drawerOpen, closeDrawer]);

  // Move focus into the panel on open so keyboard and screen-reader users land
  // inside the dialog rather than back at the top of the page.
  useEffect(() => {
    if (drawerOpen && panelRef.current) panelRef.current.focus();
  }, [drawerOpen]);

  if (!mounted) return null;

  return (
    <div
      className={`t321-mkt-cart${closing ? " is-closing" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Your cart"
    >
      <button
        type="button"
        className="t321-mkt-cart__scrim"
        aria-label="Close cart"
        tabIndex={-1}
        onClick={closeDrawer}
      />

      <aside className="t321-mkt-cart__panel" ref={panelRef} tabIndex={-1}>
        <header className="t321-mkt-cart__head">
          <h2 className="t321-mkt-cart__title">
            <i className="fas fa-shopping-cart" aria-hidden="true" />
            Your cart
            {count > 0 && <span className="t321-mkt-cart__count">{count}</span>}
          </h2>
          <button
            type="button"
            className="t321-mkt-cart__close"
            aria-label="Close cart"
            onClick={closeDrawer}
          >
            <i className="fas fa-times" aria-hidden="true" />
          </button>
        </header>

        <div className="t321-mkt-cart__body">
          {lines.length === 0 ? (
            <div className="t321-mkt-cart__empty">
              <i className="fas fa-shopping-basket" aria-hidden="true" />
              <p>Your cart is empty.</p>
              <Link href="/catalog" className="t321-mkt-btn t321-mkt-btn--primary">
                Browse courses
              </Link>
            </div>
          ) : (
            <ul className="t321-mkt-cart__list">
              {lines.map((line, i) => (
                <li
                  key={line.id}
                  className="t321-mkt-cart__line"
                  // Lines fade up in sequence as the panel arrives. Capped so a
                  // large cart doesn't leave the last row trailing.
                  style={{ animationDelay: `${Math.min(i, 6) * 45 + 90}ms` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="t321-mkt-cart__thumb"
                    src={line.image || COURSE_PLACEHOLDER_IMAGE}
                    alt=""
                    loading="lazy"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (img.src.indexOf(COURSE_PLACEHOLDER_IMAGE) === -1) {
                        img.src = COURSE_PLACEHOLDER_IMAGE;
                      }
                    }}
                  />
                  <div className="t321-mkt-cart__line-body">
                    <p className="t321-mkt-cart__line-name">{line.name}</p>
                    {line.stateLabel && (
                      <span className="t321-mkt-cart__line-state">{line.stateLabel}</span>
                    )}
                    <p className="t321-mkt-cart__line-price">
                      {money(line.price)}
                      {line.isSeatBased && <span> / seat</span>}
                    </p>

                    {/* Seat steppers only for courses the LMS marks seat-based —
                        a compliance course is one seat for the buyer. */}
                    {line.isSeatBased && (
                      <div className="t321-mkt-cart__qty">
                        <button
                          type="button"
                          aria-label={`Decrease seats for ${line.name}`}
                          onClick={() => setUsers(line.id, line.users - 1)}
                          disabled={line.users <= 1}
                        >
                          <i className="fas fa-minus" aria-hidden="true" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={line.users}
                          aria-label={`Seats for ${line.name}`}
                          onChange={(e) => setUsers(line.id, Number(e.target.value))}
                        />
                        <button
                          type="button"
                          aria-label={`Increase seats for ${line.name}`}
                          onClick={() => setUsers(line.id, line.users + 1)}
                        >
                          <i className="fas fa-plus" aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="t321-mkt-cart__remove"
                    aria-label={`Remove ${line.name}`}
                    onClick={() => remove(line.id)}
                  >
                    <i className="fas fa-trash-alt" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <footer className="t321-mkt-cart__foot">
            <div className="t321-mkt-cart__promo">
              <input
                type="text"
                placeholder="Promo code"
                aria-label="Promo code"
                defaultValue={promoCode}
                onBlur={(e) => applyPromo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyPromo((e.target as HTMLInputElement).value);
                }}
              />
            </div>
            {promoError && <p className="t321-mkt-cart__promo-error">{promoError}</p>}

            <dl className="t321-mkt-cart__totals">
              <div>
                <dt>{isCompany ? `Subtotal (first ${buyer.cadence} invoice)` : "Subtotal"}</dt>
                <dd>{quote ? money(shownSubtotal ?? 0) : "—"}</dd>
              </div>
              {quote && shownDiscount > 0 && (
                <div className="is-discount">
                  <dt>Discount{quote.promo ? ` (${quote.promo.name})` : ""}</dt>
                  <dd>−{money(shownDiscount)}</dd>
                </div>
              )}
              <div className="is-total">
                <dt>{isCompany ? "Due today" : "Total"}</dt>
                <dd>
                  {loading && !quote ? (
                    <i className="fas fa-spinner fa-spin" aria-hidden="true" />
                  ) : (
                    money(shownTotal ?? 0)
                  )}
                </dd>
              </div>
            </dl>

            {/* Company = subscription: renewals bill the FULL rate (a promo
                only discounts the first invoice), so say so up front. */}
            {isCompany && quote?.hasRecurring && (cq?.ongoing ?? 0) > 0 && (
              <p className="t321-mkt-cart__ongoing">
                <i className="fas fa-rotate" aria-hidden="true" />
                Then {money(cq!.ongoing)}/{cadenceUnit} · {buyer.employees}{" "}
                {buyer.employees === 1 ? "employee" : "employees"} ·{" "}
                {buyer.locations} {buyer.locations === 1 ? "location" : "locations"}
              </p>
            )}

            <Link
              href="/checkout"
              className="t321-mkt-btn t321-mkt-btn--primary t321-mkt-btn--block t321-mkt-btn--lg"
              onClick={closeDrawer}
            >
              <i className="fas fa-lock" aria-hidden="true" /> Checkout
            </Link>
            <p className="t321-mkt-cart__secure">
              <i className="fas fa-shield-halved" aria-hidden="true" />
              Secure checkout — payments powered by Stripe
            </p>

            {/* Audience switch, in the buyer's own words. Prices above
                re-quote immediately; the details live at checkout. */}
            <button
              type="button"
              className="t321-mkt-cart__team"
              onClick={() => setAudience(isCompany ? "individual" : "company")}
            >
              {isCompany ? (
                <>
                  <i className="fas fa-user" aria-hidden="true" /> Switch to individual pricing
                </>
              ) : (
                <>
                  <i className="fas fa-users" aria-hidden="true" /> Buying for a team? See team
                  pricing
                </>
              )}
            </button>

            <Link href="/catalog" className="t321-mkt-cart__keep" onClick={closeDrawer}>
              Keep browsing
            </Link>
          </footer>
        )}
      </aside>
    </div>
  );
}

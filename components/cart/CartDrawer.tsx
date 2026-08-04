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
    setAudience,
    setEmployees,
    setLocations,
    setCadence
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

  // Promo entry is collapsed behind a "Have a promo code?" link — most buyers
  // don't have one, and a permanently empty input reads as homework. Stays
  // open once a code is set so an applied promo is never hidden.
  const [promoOpen, setPromoOpen] = useState(false);
  const showPromoInput = promoOpen || Boolean(promoCode);

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
                      {line.isSeatBased && isCompany && <span> / seat</span>}
                    </p>

                    {/* Seat steppers are a team concept — an individual buys
                        one seat of everything (the training is for them), so
                        the quantity UI only appears in team mode and only on
                        courses the LMS marks seat-based. */}
                    {line.isSeatBased && isCompany && (
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
            {/* Who's buying — a visible two-state switch (mirrors checkout's
                audience cards) instead of a text link whose wording flipped.
                Selecting Team reveals the pricing controls below. */}
            <div className="t321-mkt-cart__aud" role="radiogroup" aria-label="Buying for">
              <button
                type="button"
                role="radio"
                aria-checked={!isCompany}
                className={!isCompany ? "is-active" : ""}
                onClick={() => setAudience("individual")}
              >
                <i className="fas fa-user" aria-hidden="true" /> Individual
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={isCompany}
                className={isCompany ? "is-active" : ""}
                onClick={() => setAudience("company")}
              >
                <i className="fas fa-users" aria-hidden="true" /> Team
              </button>
            </div>

            {/* Team pricing inputs — the same employees/locations/cadence
                state checkout uses, editable right here so the totals below
                can be tuned without leaving the drawer. */}
            {isCompany && (
              <div className="t321-mkt-cart__teamctl">
                <p className="t321-mkt-cart__teamctl-head">
                  <i className="fas fa-users" aria-hidden="true" /> Team pricing
                </p>
                <div className="t321-mkt-cart__teamctl-row">
                  <label className="t321-mkt-cart__teamctl-field">
                    <span>
                      <i className="fas fa-user-group" aria-hidden="true" /> Employees
                    </span>
                    <span className="t321-mkt-cart__teamctl-stepper">
                      <button
                        type="button"
                        aria-label="Decrease employees"
                        onClick={() => setEmployees(buyer.employees - 1)}
                        disabled={buyer.employees <= 1}
                      >
                        <i className="fas fa-minus" aria-hidden="true" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={9999}
                        value={buyer.employees}
                        aria-label="Number of employees"
                        onChange={(e) => setEmployees(Number(e.target.value))}
                      />
                      <button
                        type="button"
                        aria-label="Increase employees"
                        onClick={() => setEmployees(buyer.employees + 1)}
                      >
                        <i className="fas fa-plus" aria-hidden="true" />
                      </button>
                    </span>
                  </label>
                  <label className="t321-mkt-cart__teamctl-field">
                    <span>
                      <i className="fas fa-map-marker-alt" aria-hidden="true" /> Locations
                    </span>
                    <span className="t321-mkt-cart__teamctl-stepper">
                      <button
                        type="button"
                        aria-label="Decrease locations"
                        onClick={() => setLocations(buyer.locations - 1)}
                        disabled={buyer.locations <= 1}
                      >
                        <i className="fas fa-minus" aria-hidden="true" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={9999}
                        value={buyer.locations}
                        aria-label="Number of locations"
                        onChange={(e) => setLocations(Number(e.target.value))}
                      />
                      <button
                        type="button"
                        aria-label="Increase locations"
                        onClick={() => setLocations(buyer.locations + 1)}
                      >
                        <i className="fas fa-plus" aria-hidden="true" />
                      </button>
                    </span>
                  </label>
                </div>
                <div
                  className="t321-mkt-cart__teamctl-cadence"
                  role="radiogroup"
                  aria-label="Billing cadence"
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={buyer.cadence === "yearly"}
                    className={buyer.cadence === "yearly" ? "is-active" : ""}
                    onClick={() => setCadence("yearly")}
                  >
                    Yearly <em>Save 10%</em>
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={buyer.cadence === "monthly"}
                    className={buyer.cadence === "monthly" ? "is-active" : ""}
                    onClick={() => setCadence("monthly")}
                  >
                    Monthly
                  </button>
                </div>
              </div>
            )}

            {showPromoInput ? (
              <>
                <div className="t321-mkt-cart__promo">
                  <input
                    type="text"
                    placeholder="Promo code"
                    aria-label="Promo code"
                    autoFocus={promoOpen && !promoCode}
                    defaultValue={promoCode}
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      applyPromo(v);
                      // Opened it, typed nothing, clicked away — fold back to
                      // the link rather than leaving an empty box behind.
                      if (!v) setPromoOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") applyPromo((e.target as HTMLInputElement).value);
                    }}
                  />
                </div>
                {promoError && <p className="t321-mkt-cart__promo-error">{promoError}</p>}
              </>
            ) : (
              <button
                type="button"
                className="t321-mkt-cart__promo-toggle"
                onClick={() => setPromoOpen(true)}
              >
                <i className="fas fa-tag" aria-hidden="true" /> Have a promo code?
              </button>
            )}

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
          </footer>
        )}
      </aside>
    </div>
  );
}

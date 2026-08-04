"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "./CartContext";
import { COURSE_PLACEHOLDER_IMAGE } from "@/lib/newFeatures";
import "./CartWidget.css";

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

/**
 * The floating cart button (top-right) plus the slide-in drawer it opens.
 * Mounted once in the root layout so the cart follows the buyer across pages.
 */
export default function CartWidget() {
  const {
    lines,
    count,
    quote,
    loading,
    promoCode,
    promoError,
    applyPromo,
    drawerOpen,
    openDrawer,
    closeDrawer,
    remove,
    setUsers
  } = useCart();

  const pathname = usePathname();

  // The checkout page has the cart inline in its order summary — a floating
  // button pointing back at the same items would just be noise there.
  const hideOnPage = pathname?.startsWith("/checkout");

  // Close on route change so navigating from the drawer doesn't leave it open
  // over the new page.
  useEffect(() => {
    closeDrawer();
  }, [pathname, closeDrawer]);

  // Escape to close, and lock background scroll while open.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [drawerOpen, closeDrawer]);

  if (hideOnPage) return null;

  return (
    <>
      {/* Hidden until there's something in it — an always-visible empty cart
          on a marketing page is clutter. */}
      {count > 0 && (
        <button
          type="button"
          className="t321-mkt-cartfab"
          aria-label={`Open cart, ${count} ${count === 1 ? "course" : "courses"}`}
          onClick={openDrawer}
        >
          <i className="fas fa-shopping-cart" aria-hidden="true" />
          <span className="t321-mkt-cartfab__badge">{count}</span>
        </button>
      )}

      {drawerOpen && (
        <div className="t321-mkt-cart" role="dialog" aria-modal="true" aria-label="Your cart">
          <button
            type="button"
            className="t321-mkt-cart__scrim"
            aria-label="Close cart"
            onClick={closeDrawer}
          />

          <aside className="t321-mkt-cart__panel">
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
                  {lines.map((line) => (
                    <li key={line.id} className="t321-mkt-cart__line">
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

                        {/* Seat steppers only for courses the LMS marks
                            seat-based — a compliance course is one seat for
                            the buyer themselves and has no quantity. */}
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
                    <dt>Subtotal</dt>
                    <dd>{quote ? money(quote.subtotal) : "—"}</dd>
                  </div>
                  {quote && quote.discount > 0 && (
                    <div className="is-discount">
                      <dt>Discount{quote.promo ? ` (${quote.promo.name})` : ""}</dt>
                      <dd>−{money(quote.discount)}</dd>
                    </div>
                  )}
                  <div className="is-total">
                    <dt>Total</dt>
                    <dd>
                      {loading && !quote ? (
                        <i className="fas fa-spinner fa-spin" aria-hidden="true" />
                      ) : (
                        money(quote?.dueToday ?? 0)
                      )}
                    </dd>
                  </div>
                </dl>

                <Link
                  href="/checkout"
                  className="t321-mkt-btn t321-mkt-btn--primary t321-mkt-btn--block t321-mkt-btn--lg"
                  onClick={closeDrawer}
                >
                  Checkout <i className="fas fa-arrow-right" aria-hidden="true" />
                </Link>
                <Link href="/catalog" className="t321-mkt-cart__keep" onClick={closeDrawer}>
                  Keep browsing
                </Link>
              </footer>
            )}
          </aside>
        </div>
      )}
    </>
  );
}

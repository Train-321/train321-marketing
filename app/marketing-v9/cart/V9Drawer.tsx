"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useV9Cart } from "./V9CartContext";

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

// Isolated slide-out cart drawer for /marketing-v9. Mirrors the site cart's
// drawer — individual/team switch, team pricing controls, promo, and the
// company subscription view — against the isolated v9 cart.
export default function V9Drawer() {
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
  } = useV9Cart();

  const isCompany = buyer.audience === "company";
  const cq = quote ? (buyer.cadence === "yearly" ? quote.yearly : quote.monthly) : null;
  const shownSubtotal = isCompany ? cq?.subtotal : quote?.subtotal;
  const shownDiscount = (isCompany ? cq?.discount : quote?.discount) ?? 0;
  const shownTotal = isCompany ? cq?.dueToday : quote?.dueToday;
  const cadenceUnit = buyer.cadence === "yearly" ? "yr" : "mo";

  const [promoOpen, setPromoOpen] = useState(false);
  const showPromoInput = promoOpen || Boolean(promoCode);

  // Escape to close + hold the background still while open.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [drawerOpen, closeDrawer]);

  return (
    <div className={`v9d${drawerOpen ? " is-open" : ""}`}>
      <div className="v9d__overlay" onClick={closeDrawer} aria-hidden="true" />
      <aside className="v9d__panel" role="dialog" aria-modal="true" aria-label="Your cart">
        <div className="v9d__head">
          <h2>Your cart{count > 0 ? ` (${count})` : ""}</h2>
          <button type="button" className="v9d__close" onClick={closeDrawer} aria-label="Close cart">
            <i className="fas fa-xmark" aria-hidden="true" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="v9d__empty">
            <i className="fas fa-cart-shopping" aria-hidden="true" />
            <p>Your cart is empty.</p>
            <button type="button" className="gs-btn gs-btn--ghost" onClick={closeDrawer}>Browse courses</button>
          </div>
        ) : (
          <>
            <div className="v9d__items">
              {lines.map((it) => (
                <div key={it.id} className="v9d__item">
                  <div className="v9d__thumb">
                    {it.image ? <img src={it.image} alt="" /> : <i className="fas fa-certificate" aria-hidden="true" />}
                  </div>
                  <div className="v9d__meta">
                    <span className="v9d__name">{it.name}</span>
                    {it.stateLabel && <span className="v9d__state">{it.stateLabel}</span>}
                    <p className="v9d__lineprice">
                      {money(it.price)}
                      {it.isSeatBased && isCompany && (
                        <span> / seat · {it.users} {it.users === 1 ? "seat" : "seats"} = {money(it.price * it.users)}</span>
                      )}
                    </p>

                    {it.isSeatBased && isCompany && (
                      <div className="v9d__row">
                        <div className="v9d__qty">
                          <button type="button" onClick={() => setUsers(it.id, it.users - 1)} disabled={it.users <= 1} aria-label={`Decrease seats for ${it.name}`}>−</button>
                          <span>{it.users}</span>
                          <button type="button" onClick={() => setUsers(it.id, it.users + 1)} aria-label={`Increase seats for ${it.name}`}>+</button>
                        </div>
                      </div>
                    )}
                    {it.isSeatBased && isCompany && it.users < buyer.employees && (
                      <p className="v9d__seatnote" role="status">
                        <i className="fas fa-circle-info" aria-hidden="true" /> Covers {it.users} of {buyer.employees} employees.{" "}
                        <button type="button" onClick={() => setUsers(it.id, buyer.employees)}>Use {buyer.employees}</button>
                      </p>
                    )}
                  </div>
                  <button type="button" className="v9d__remove" onClick={() => remove(it.id)} aria-label={`Remove ${it.name}`}>
                    <i className="fas fa-trash-can" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>

            <div className="v9d__foot">
              {/* Who's buying — mirrors the checkout audience switch. */}
              <div className="v9d__aud" role="radiogroup" aria-label="Buying for">
                <button type="button" role="radio" aria-checked={!isCompany} className={!isCompany ? "is-active" : ""} onClick={() => setAudience("individual")}>
                  <i className="fas fa-user" aria-hidden="true" /> Individual
                </button>
                <button type="button" role="radio" aria-checked={isCompany} className={isCompany ? "is-active" : ""} onClick={() => setAudience("company")}>
                  <i className="fas fa-users" aria-hidden="true" /> Team
                </button>
              </div>

              {isCompany && (
                <div className="v9d__team">
                  <p className="v9d__team-head"><i className="fas fa-users" aria-hidden="true" /> Team pricing</p>
                  <div className="v9d__team-row">
                    <label className="v9d__team-field">
                      <span><i className="fas fa-user-group" aria-hidden="true" /> Employees</span>
                      <span className="v9d__stepper">
                        <button type="button" onClick={() => setEmployees(buyer.employees - 1)} disabled={buyer.employees <= 1} aria-label="Decrease employees">−</button>
                        <input type="number" min={1} max={9999} value={buyer.employees} aria-label="Number of employees" onChange={(e) => setEmployees(Number(e.target.value))} />
                        <button type="button" onClick={() => setEmployees(buyer.employees + 1)} aria-label="Increase employees">+</button>
                      </span>
                    </label>
                    <label className="v9d__team-field">
                      <span><i className="fas fa-map-marker-alt" aria-hidden="true" /> Locations</span>
                      <span className="v9d__stepper">
                        <button type="button" onClick={() => setLocations(buyer.locations - 1)} disabled={buyer.locations <= 1} aria-label="Decrease locations">−</button>
                        <input type="number" min={1} max={9999} value={buyer.locations} aria-label="Number of locations" onChange={(e) => setLocations(Number(e.target.value))} />
                        <button type="button" onClick={() => setLocations(buyer.locations + 1)} aria-label="Increase locations">+</button>
                      </span>
                    </label>
                  </div>
                  <div className="v9d__cadence" role="radiogroup" aria-label="Billing cadence">
                    <button type="button" role="radio" aria-checked={buyer.cadence === "yearly"} className={buyer.cadence === "yearly" ? "is-active" : ""} onClick={() => setCadence("yearly")}>Yearly <em>Save 10%</em></button>
                    <button type="button" role="radio" aria-checked={buyer.cadence === "monthly"} className={buyer.cadence === "monthly" ? "is-active" : ""} onClick={() => setCadence("monthly")}>Monthly</button>
                  </div>
                </div>
              )}

              {showPromoInput ? (
                <>
                  <div className="v9d__promo">
                    <input
                      type="text"
                      placeholder="Promo code"
                      aria-label="Promo code"
                      autoFocus={promoOpen && !promoCode}
                      defaultValue={promoCode}
                      onBlur={(e) => {
                        const v = e.target.value.trim();
                        applyPromo(v);
                        if (!v) setPromoOpen(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") applyPromo((e.target as HTMLInputElement).value);
                      }}
                    />
                  </div>
                  {promoError && <p className="v9d__promo-error">{promoError}</p>}
                </>
              ) : (
                <button type="button" className="v9d__promo-toggle" onClick={() => setPromoOpen(true)}>
                  <i className="fas fa-tag" aria-hidden="true" /> Have a promo code?
                </button>
              )}

              <dl className="v9d__totals">
                <div>
                  <dt>{isCompany && quote?.hasRecurring ? `Subtotal (first ${buyer.cadence} invoice)` : "Subtotal"}</dt>
                  <dd>{quote ? money(shownSubtotal ?? 0) : "—"}</dd>
                </div>
                {quote && shownDiscount > 0 && (
                  <div className="is-discount">
                    <dt>Discount{quote.promo ? ` (${quote.promo.name})` : ""}
                      {quote.promo && (
                        <button type="button" className="v9d__promo-remove" aria-label="Remove promo code" title="Remove promo code" onClick={() => { applyPromo(""); setPromoOpen(false); }}>
                          <i className="fas fa-times" aria-hidden="true" />
                        </button>
                      )}
                    </dt>
                    <dd>−{money(shownDiscount)}</dd>
                  </div>
                )}
                <div className="is-total">
                  <dt>{isCompany ? "Due today" : "Total"}</dt>
                  <dd>{loading && !quote ? <i className="fas fa-spinner fa-spin" aria-hidden="true" /> : money(shownTotal ?? 0)}</dd>
                </div>
              </dl>

              {isCompany && quote?.hasRecurring && (cq?.ongoing ?? 0) > 0 && (
                <p className="v9d__ongoing">
                  <i className="fas fa-rotate" aria-hidden="true" />
                  Then {money(cq!.ongoing)}/{cadenceUnit} · {buyer.employees} {buyer.employees === 1 ? "employee" : "employees"} · {buyer.locations} {buyer.locations === 1 ? "location" : "locations"}
                </p>
              )}

              <Link href="/marketing-v9/checkout" className="gs-btn gs-btn--primary v9d__checkout" onClick={closeDrawer}>
                <i className="fas fa-lock" aria-hidden="true" /> Checkout
              </Link>
              <p className="v9d__note"><i className="fas fa-shield-halved" aria-hidden="true" /> Secure checkout</p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

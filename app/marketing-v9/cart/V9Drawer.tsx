"use client";

import { useEffect, useState } from "react";
import { US_STATES } from "@/lib/states";
import { useV9Cart } from "./V9CartContext";

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const EMAIL = /^\S+@\S+\.\S+$/;

/** Progressive US phone mask: "(555) 123-4567". */
function formatUsPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").replace(/^1(?=\d{10})/, "").slice(0, 10);
  if (!d) return "";
  if (d.length < 4) return `(${d}`;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}
function phoneIsValid(v: string): boolean {
  const digits = v.replace(/\D/g, "").length;
  return digits === 0 || digits === 10;
}

type FieldErrors = Partial<
  Record<
    | "first_name" | "last_name" | "email" | "password" | "company_name" | "phone"
    | "billing_first_name" | "billing_last_name" | "billing_email" | "billing_phone",
    string
  >
>;

type Step = "cart" | "pay" | "done";

// Isolated slide-out cart + checkout for /marketing-v9. The ENTIRE purchase
// happens in the drawer: a cart step, a payment step (with a back button), and
// a confirmation — no separate page. UI-first: "Place order" neither charges a
// card nor creates an account. Isolated from the live cart (own storage keys,
// no analytics); prices come from the shared read-only quote API only.
export default function V9Drawer() {
  const {
    lines,
    count,
    quote,
    loading,
    ready,
    promoCode,
    promoError,
    applyPromo,
    drawerOpen,
    closeDrawer,
    remove,
    setUsers,
    clear,
    buyer,
    setAudience,
    setEmployees,
    setLocations,
    setCadence
  } = useV9Cart();

  const [step, setStep] = useState<Step>("cart");
  const [promoOpen, setPromoOpen] = useState(false);
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", password: "", phone: "", state: "", company_name: ""
  });
  const [billingDifferent, setBillingDifferent] = useState(false);
  const [billing, setBilling] = useState({ first_name: "", last_name: "", email: "", phone: "" });
  const [errors, setErrors] = useState<FieldErrors>({});

  const isCompany = buyer.audience === "company";
  const cq = quote ? (buyer.cadence === "yearly" ? quote.yearly : quote.monthly) : null;
  const shownSubtotal = (isCompany ? cq?.subtotal : quote?.subtotal) ?? 0;
  const shownDiscount = (isCompany ? cq?.discount : quote?.discount) ?? 0;
  const dueToday = (isCompany ? cq?.dueToday : quote?.dueToday) ?? 0;
  const cadenceUnit = buyer.cadence === "yearly" ? "yr" : "mo";
  const needsSubscription = isCompany && quote?.hasRecurring;
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

  // Reset to the cart step when the drawer closes (keeps entered details), so
  // reopening always starts on the cart rather than mid-form or on a stale
  // confirmation.
  useEffect(() => {
    if (!drawerOpen) {
      const t = setTimeout(() => setStep((s) => (s === "done" ? "cart" : s)), 260);
      return () => clearTimeout(t);
    }
  }, [drawerOpen]);

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    };
  const setBill =
    (key: keyof typeof billing) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setBilling((b) => ({ ...b, [key]: e.target.value }));
      setErrors((prev) => ({ ...prev, [`billing_${key}`]: undefined }));
    };
  const setPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, phone: formatUsPhone(e.target.value) }));
    setErrors((prev) => ({ ...prev, phone: undefined }));
  };
  const setBillPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBilling((b) => ({ ...b, phone: formatUsPhone(e.target.value) }));
    setErrors((prev) => ({ ...prev, billing_phone: undefined }));
  };

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!form.first_name.trim()) next.first_name = "Enter your first name.";
    if (!form.last_name.trim()) next.last_name = "Enter your last name.";
    if (!EMAIL.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (form.password.length !== 8) next.password = "Password must be exactly 8 characters.";
    if (isCompany && !form.company_name.trim()) next.company_name = "Enter your company name.";
    if (!phoneIsValid(form.phone)) next.phone = "Enter a 10-digit phone number.";
    if (isCompany && billingDifferent) {
      if (!billing.first_name.trim()) next.billing_first_name = "Enter a first name.";
      if (!billing.last_name.trim()) next.billing_last_name = "Enter a last name.";
      if (!EMAIL.test(billing.email.trim())) next.billing_email = "Enter a valid email address.";
      if (!phoneIsValid(billing.phone)) next.billing_phone = "Enter a 10-digit phone number.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // UI-first: nothing is charged, no account is created. Record the order
    // state and clear the cart. Real Stripe payment gets wired here later.
    setStep("done");
    clear();
  };

  const title =
    step === "pay" ? "Checkout" : step === "done" ? "All done" : `Your cart${count > 0 ? ` (${count})` : ""}`;

  return (
    <div className={`v9d${drawerOpen ? " is-open" : ""}`}>
      <div className="v9d__overlay" onClick={closeDrawer} aria-hidden="true" />
      <aside className="v9d__panel" role="dialog" aria-modal="true" aria-label="Cart and checkout">
        <div className="v9d__head">
          {step === "pay" ? (
            <button type="button" className="v9d__back" onClick={() => setStep("cart")} aria-label="Back to cart">
              <i className="fas fa-arrow-left" aria-hidden="true" />
            </button>
          ) : null}
          <h2>{title}</h2>
          <button type="button" className="v9d__close" onClick={closeDrawer} aria-label="Close">
            <i className="fas fa-xmark" aria-hidden="true" />
          </button>
        </div>

        {step === "done" ? (
          <div className="v9d__done">
            <span className="v9d__done-ic"><i className="fas fa-circle-check" aria-hidden="true" /></span>
            <h3>Order placed</h3>
            <p>Thanks{form.first_name ? `, ${form.first_name}` : ""}! A confirmation and your course access will be sent to <strong>{form.email}</strong>.</p>
            <p className="v9d__done-note">Payment is being set up — nothing has been charged yet.</p>
            <button type="button" className="gs-btn gs-btn--primary" onClick={closeDrawer}>Browse more courses</button>
          </div>
        ) : lines.length === 0 ? (
          <div className="v9d__empty">
            <i className="fas fa-cart-shopping" aria-hidden="true" />
            <p>Your cart is empty.</p>
            <button type="button" className="gs-btn gs-btn--ghost" onClick={closeDrawer}>Browse courses</button>
          </div>
        ) : step === "pay" ? (
          /* ── Payment step ──────────────────────────────────────────── */
          <form className="v9d__payform" onSubmit={submit} noValidate>
            <div className="v9d__co">
              {/* Recap of who's buying (set on the cart step) */}
              <div className="v9d__co-recap">
                <i className={isCompany ? "fas fa-users" : "fas fa-user"} aria-hidden="true" />
                {isCompany
                  ? `Team · ${buyer.employees} ${buyer.employees === 1 ? "employee" : "employees"} · ${buyer.locations} ${buyer.locations === 1 ? "location" : "locations"}`
                  : "Just me — one-time payment"}
              </div>

              <h4 className="v9d__co-h">{isCompany ? "Admin account" : "Your details"}</h4>
              {isCompany && (
                <label className={`v9co__field${errors.company_name ? " has-error" : ""}`}>
                  <span>Company name <em aria-hidden="true">*</em></span>
                  <input type="text" autoComplete="organization" value={form.company_name} onChange={set("company_name")} />
                  {errors.company_name && <em className="v9co__err">{errors.company_name}</em>}
                </label>
              )}
              <div className="v9co__row">
                <label className={`v9co__field${errors.first_name ? " has-error" : ""}`}>
                  <span>First name <em aria-hidden="true">*</em></span>
                  <input type="text" autoComplete="given-name" value={form.first_name} onChange={set("first_name")} />
                  {errors.first_name && <em className="v9co__err">{errors.first_name}</em>}
                </label>
                <label className={`v9co__field${errors.last_name ? " has-error" : ""}`}>
                  <span>Last name <em aria-hidden="true">*</em></span>
                  <input type="text" autoComplete="family-name" value={form.last_name} onChange={set("last_name")} />
                  {errors.last_name && <em className="v9co__err">{errors.last_name}</em>}
                </label>
              </div>
              <label className={`v9co__field${errors.email ? " has-error" : ""}`}>
                <span>Email <em aria-hidden="true">*</em></span>
                <input type="email" autoComplete="email" value={form.email} onChange={set("email")} />
                {errors.email ? <em className="v9co__err">{errors.email}</em> : <small>{isCompany ? "Becomes the company admin sign-in." : "You'll sign in with this."}</small>}
              </label>
              <label className={`v9co__field${errors.password ? " has-error" : ""}`}>
                <span>Password <em aria-hidden="true">*</em></span>
                <input type="password" autoComplete="new-password" maxLength={8} value={form.password} onChange={set("password")} />
                {errors.password ? <em className="v9co__err">{errors.password}</em> : <small>Exactly 8 characters.</small>}
              </label>
              <div className="v9co__row">
                <label className={`v9co__field${errors.phone ? " has-error" : ""}`}>
                  <span>Phone <small>(optional)</small></span>
                  <input type="tel" autoComplete="tel" placeholder="(555) 123-4567" maxLength={14} value={form.phone} onChange={setPhone} />
                  {errors.phone && <em className="v9co__err">{errors.phone}</em>}
                </label>
                <label className="v9co__field">
                  <span>State <small>(optional)</small></span>
                  <select value={form.state} onChange={set("state")}>
                    <option value="">Select…</option>
                    {US_STATES.map((s) => <option key={s.code} value={s.name}>{s.name}</option>)}
                  </select>
                </label>
              </div>

              {isCompany && (
                <>
                  <label className="v9co__billing-toggle">
                    <input type="checkbox" checked={billingDifferent} onChange={(e) => setBillingDifferent(e.target.checked)} />
                    Billing contact is someone else
                  </label>
                  {billingDifferent && (
                    <div className="v9co__billing">
                      <div className="v9co__row">
                        <label className={`v9co__field${errors.billing_first_name ? " has-error" : ""}`}>
                          <span>First name <em aria-hidden="true">*</em></span>
                          <input type="text" value={billing.first_name} onChange={setBill("first_name")} />
                          {errors.billing_first_name && <em className="v9co__err">{errors.billing_first_name}</em>}
                        </label>
                        <label className={`v9co__field${errors.billing_last_name ? " has-error" : ""}`}>
                          <span>Last name <em aria-hidden="true">*</em></span>
                          <input type="text" value={billing.last_name} onChange={setBill("last_name")} />
                          {errors.billing_last_name && <em className="v9co__err">{errors.billing_last_name}</em>}
                        </label>
                      </div>
                      <label className={`v9co__field${errors.billing_email ? " has-error" : ""}`}>
                        <span>Email <em aria-hidden="true">*</em></span>
                        <input type="email" value={billing.email} onChange={setBill("email")} />
                        {errors.billing_email && <em className="v9co__err">{errors.billing_email}</em>}
                      </label>
                      <label className={`v9co__field${errors.billing_phone ? " has-error" : ""}`}>
                        <span>Phone <small>(optional)</small></span>
                        <input type="tel" placeholder="(555) 123-4567" maxLength={14} value={billing.phone} onChange={setBillPhone} />
                        {errors.billing_phone && <em className="v9co__err">{errors.billing_phone}</em>}
                      </label>
                    </div>
                  )}
                </>
              )}

              <h4 className="v9d__co-h">Payment</h4>
              <div className="v9co__pay">
                <span className="v9co__pay-label"><i className="fas fa-lock" aria-hidden="true" /> Payment</span>
                <p className="v9co__pay-note">Secure card payment is being set up. For now, placing the order reserves your courses — nothing is charged.</p>
              </div>
            </div>

            <div className="v9d__foot">
              <dl className="v9d__totals">
                <div>
                  <dt>{needsSubscription ? `First ${buyer.cadence} invoice` : "Subtotal"}</dt>
                  <dd>{quote ? money(shownSubtotal) : "—"}</dd>
                </div>
                {quote && shownDiscount > 0 && (
                  <div className="is-discount"><dt>Discount</dt><dd>−{money(shownDiscount)}</dd></div>
                )}
                <div className="is-total">
                  <dt>Due today</dt>
                  <dd>{loading && !quote ? <i className="fas fa-spinner fa-spin" aria-hidden="true" /> : money(dueToday)}</dd>
                </div>
              </dl>
              {needsSubscription && (cq?.ongoing ?? 0) > 0 && (
                <p className="v9d__ongoing"><i className="fas fa-rotate" aria-hidden="true" /> Then {money(cq!.ongoing)}/{cadenceUnit} ongoing · cancel anytime</p>
              )}
              <button type="submit" className="gs-btn gs-btn--primary v9d__checkout" disabled={loading || !quote}>
                Place order{dueToday > 0 ? ` · ${money(dueToday)}` : ""} <i className="fas fa-arrow-right" aria-hidden="true" />
              </button>
              <p className="v9d__note"><i className="fas fa-shield-halved" aria-hidden="true" /> Secure checkout</p>
            </div>
          </form>
        ) : (
          /* ── Cart step ─────────────────────────────────────────────── */
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
                  <dt>{needsSubscription ? `Subtotal (first ${buyer.cadence} invoice)` : "Subtotal"}</dt>
                  <dd>{quote ? money(shownSubtotal) : "—"}</dd>
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
                  <dd>{loading && !quote ? <i className="fas fa-spinner fa-spin" aria-hidden="true" /> : money(dueToday)}</dd>
                </div>
              </dl>

              {needsSubscription && (cq?.ongoing ?? 0) > 0 && (
                <p className="v9d__ongoing">
                  <i className="fas fa-rotate" aria-hidden="true" />
                  Then {money(cq!.ongoing)}/{cadenceUnit} · {buyer.employees} {buyer.employees === 1 ? "employee" : "employees"} · {buyer.locations} {buyer.locations === 1 ? "location" : "locations"}
                </p>
              )}

              <button type="button" className="gs-btn gs-btn--primary v9d__checkout" disabled={!quote} onClick={() => setStep("pay")}>
                <i className="fas fa-lock" aria-hidden="true" /> Checkout
              </button>
              <p className="v9d__note"><i className="fas fa-shield-halved" aria-hidden="true" /> Secure checkout</p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

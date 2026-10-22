"use client";

import { useState } from "react";
import Link from "next/link";
import { US_STATES } from "@/lib/states";
import { useV9Cart } from "../cart/V9CartContext";

// Isolated v9 checkout. Full parity with the live checkout — individual/company
// switch, team pricing (employees/locations/cadence), admin account + company
// details, separate billing contact, promo, and a seat-aware order summary —
// but UI-FIRST: prices come from the shared read-only quote API, and "Place
// order" neither charges a card nor creates an account. Nothing here touches
// the live cart, the live /checkout, or the enrollment backend's write paths.

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
    | "first_name"
    | "last_name"
    | "email"
    | "password"
    | "company_name"
    | "phone"
    | "billing_first_name"
    | "billing_last_name"
    | "billing_email"
    | "billing_phone",
    string
  >
>;

export default function V9Checkout() {
  const {
    lines,
    quote,
    loading,
    ready,
    promoCode,
    promoError,
    applyPromo,
    remove,
    setUsers,
    clear,
    buyer,
    setAudience,
    setEmployees,
    setLocations,
    setCadence
  } = useV9Cart();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    state: "",
    company_name: ""
  });
  const [billingDifferent, setBillingDifferent] = useState(false);
  const [billing, setBilling] = useState({ first_name: "", last_name: "", email: "", phone: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [placed, setPlaced] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoDraft, setPromoDraft] = useState(promoCode);
  const showPromoInput = promoOpen || Boolean(promoCode);

  const isCompany = buyer.audience === "company";
  const cq = quote ? (buyer.cadence === "yearly" ? quote.yearly : quote.monthly) : null;
  const dueToday = (isCompany ? cq?.dueToday : quote?.dueToday) ?? 0;
  const shownSubtotal = (isCompany ? cq?.subtotal : quote?.subtotal) ?? 0;
  const shownDiscount = (isCompany ? cq?.discount : quote?.discount) ?? 0;
  const cadenceUnit = buyer.cadence === "yearly" ? "yr" : "mo";
  const needsSubscription = isCompany && quote?.hasRecurring;

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
    if (!phoneIsValid(form.phone)) next.phone = "Enter a 10-digit phone number like (555) 123-4567.";
    if (isCompany && billingDifferent) {
      if (!billing.first_name.trim()) next.billing_first_name = "Enter a first name.";
      if (!billing.last_name.trim()) next.billing_last_name = "Enter a last name.";
      if (!EMAIL.test(billing.email.trim())) next.billing_email = "Enter a valid email address.";
      if (!phoneIsValid(billing.phone)) next.billing_phone = "Enter a 10-digit phone number like (555) 123-4567.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // UI-first: nothing is charged and no account is created. Record the order
    // state and clear the cart. Real Stripe payment gets wired here later.
    setPlaced(true);
    clear();
  };

  const header = (
    <header className="gs-topbar">
      <div className="gs-container gs-topbar__inner">
        <Link href="/marketing-v9" className="gs-topbar__brand" aria-label="Train 321 home">
          <img src="/img/logos/train321_logo.png" alt="Train 321" />
        </Link>
        <Link href="/marketing-v9#courses" className="gs-btn gs-btn--ghost gs-topbar__cta">
          <i className="fas fa-arrow-left" aria-hidden="true" /> Back to courses
        </Link>
      </div>
    </header>
  );

  const shell = (inner: React.ReactNode) => (
    <div className="t321-gs">
      {/* Isolated checkout page: hide the global site header/footer. */}
      <style>{`.t321-mkt-header,.t321-mkt-footer{display:none !important;}`}</style>
      {header}
      {inner}
    </div>
  );

  if (placed) {
    return shell(
      <section className="v9co v9co--done">
        <div className="v9co__done-card">
          <span className="v9co__done-ic"><i className="fas fa-circle-check" aria-hidden="true" /></span>
          <h1>Order placed</h1>
          <p>Thanks{form.first_name ? `, ${form.first_name}` : ""}! We&rsquo;ve got your order{form.company_name ? ` for ${form.company_name}` : ""}. A confirmation and your course access will be sent to <strong>{form.email}</strong>.</p>
          <p className="v9co__done-note">Payment is being set up — nothing has been charged yet.</p>
          <Link href="/marketing-v9#courses" className="gs-btn gs-btn--primary">Browse more courses <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
        </div>
      </section>
    );
  }

  if (ready && lines.length === 0) {
    return shell(
      <section className="v9co v9co--empty">
        <div className="v9co__empty-card">
          <span className="v9co__empty-ic"><i className="fas fa-cart-shopping" aria-hidden="true" /></span>
          <h1>Your cart is empty</h1>
          <p>Add a course to get started.</p>
          <Link href="/marketing-v9#courses" className="gs-btn gs-btn--primary">Browse courses <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
        </div>
      </section>
    );
  }

  return shell(
    <section className="v9co">
      <div className="gs-container">
        <h1 className="v9co__title">Checkout</h1>
        <form className="v9co__grid" onSubmit={submit} noValidate>
          <div className="v9co__main">
            {/* ── 1 · Audience ───────────────────────────────────────── */}
            <section className="v9co__card">
              <h2 className="v9co__step"><span className="v9co__step-num">1</span> Who is this training for?</h2>
              <div className="v9co__aud" role="radiogroup" aria-label="Buyer type">
                <button type="button" role="radio" aria-checked={!isCompany} className={`v9co__aud-card${!isCompany ? " is-active" : ""}`} onClick={() => setAudience("individual")}>
                  <i className="fas fa-user" aria-hidden="true" />
                  <strong>Just me</strong>
                  <span>One-time payment, instant access</span>
                </button>
                <button type="button" role="radio" aria-checked={isCompany} className={`v9co__aud-card${isCompany ? " is-active" : ""}`} onClick={() => setAudience("company")}>
                  <i className="fas fa-users" aria-hidden="true" />
                  <strong>My team</strong>
                  <span>Company account, priced per employee</span>
                </button>
              </div>

              {isCompany && (
                <div className="v9co__company">
                  <label className={`v9co__field${errors.company_name ? " has-error" : ""}`}>
                    <span>Company name <em aria-hidden="true">*</em></span>
                    <input type="text" autoComplete="organization" value={form.company_name} onChange={set("company_name")} />
                    {errors.company_name && <em className="v9co__err">{errors.company_name}</em>}
                  </label>
                  <div className="v9co__row">
                    <label className="v9co__field">
                      <span><i className="fas fa-user-group" aria-hidden="true" /> Employees <em aria-hidden="true">*</em></span>
                      <span className="v9co__stepper">
                        <button type="button" onClick={() => setEmployees(buyer.employees - 1)} disabled={buyer.employees <= 1} aria-label="Decrease employees">−</button>
                        <input type="number" min={1} max={9999} value={buyer.employees} aria-label="Number of employees" onChange={(e) => setEmployees(Number(e.target.value))} />
                        <button type="button" onClick={() => setEmployees(buyer.employees + 1)} aria-label="Increase employees">+</button>
                      </span>
                    </label>
                    <label className="v9co__field">
                      <span><i className="fas fa-map-marker-alt" aria-hidden="true" /> Locations <em aria-hidden="true">*</em></span>
                      <span className="v9co__stepper">
                        <button type="button" onClick={() => setLocations(buyer.locations - 1)} disabled={buyer.locations <= 1} aria-label="Decrease locations">−</button>
                        <input type="number" min={1} max={9999} value={buyer.locations} aria-label="Number of locations" onChange={(e) => setLocations(Number(e.target.value))} />
                        <button type="button" onClick={() => setLocations(buyer.locations + 1)} aria-label="Increase locations">+</button>
                      </span>
                    </label>
                  </div>
                  <div className="v9co__cadence" role="radiogroup" aria-label="Billing cadence">
                    <button type="button" role="radio" aria-checked={buyer.cadence === "yearly"} className={buyer.cadence === "yearly" ? "is-active" : ""} onClick={() => setCadence("yearly")}>Yearly <em>Save 10%</em></button>
                    <button type="button" role="radio" aria-checked={buyer.cadence === "monthly"} className={buyer.cadence === "monthly" ? "is-active" : ""} onClick={() => setCadence("monthly")}>Monthly</button>
                  </div>
                </div>
              )}
            </section>

            {/* ── 2 · Details ────────────────────────────────────────── */}
            <section className="v9co__card">
              <h2 className="v9co__step"><span className="v9co__step-num">2</span> {isCompany ? "Admin account" : "Your details"}</h2>
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
                {errors.email ? <em className="v9co__err">{errors.email}</em> : <small>{isCompany ? "This becomes the company admin sign-in." : "This is the email you'll sign in with."}</small>}
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
                    <option value="">Select a state…</option>
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
                          <span>Billing first name <em aria-hidden="true">*</em></span>
                          <input type="text" value={billing.first_name} onChange={setBill("first_name")} />
                          {errors.billing_first_name && <em className="v9co__err">{errors.billing_first_name}</em>}
                        </label>
                        <label className={`v9co__field${errors.billing_last_name ? " has-error" : ""}`}>
                          <span>Billing last name <em aria-hidden="true">*</em></span>
                          <input type="text" value={billing.last_name} onChange={setBill("last_name")} />
                          {errors.billing_last_name && <em className="v9co__err">{errors.billing_last_name}</em>}
                        </label>
                      </div>
                      <div className="v9co__row">
                        <label className={`v9co__field${errors.billing_email ? " has-error" : ""}`}>
                          <span>Billing email <em aria-hidden="true">*</em></span>
                          <input type="email" value={billing.email} onChange={setBill("email")} />
                          {errors.billing_email && <em className="v9co__err">{errors.billing_email}</em>}
                        </label>
                        <label className={`v9co__field${errors.billing_phone ? " has-error" : ""}`}>
                          <span>Billing phone <small>(optional)</small></span>
                          <input type="tel" placeholder="(555) 123-4567" maxLength={14} value={billing.phone} onChange={setBillPhone} />
                          {errors.billing_phone && <em className="v9co__err">{errors.billing_phone}</em>}
                        </label>
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>

            {/* ── 3 · Payment (UI-first placeholder) ─────────────────── */}
            <section className="v9co__card">
              <h2 className="v9co__step"><span className="v9co__step-num">3</span> Payment</h2>
              <div className="v9co__pay">
                <span className="v9co__pay-label"><i className="fas fa-lock" aria-hidden="true" /> Payment</span>
                <p className="v9co__pay-note">Secure card payment is being set up. For now, placing the order reserves your courses — nothing is charged.</p>
              </div>
            </section>
          </div>

          {/* ── Order summary ────────────────────────────────────────── */}
          <aside className="v9co__summary" aria-label="Order summary">
            <h2>Order summary</h2>
            <div className="v9co__lines">
              {lines.map((it) => (
                <div key={it.id} className="v9co__line">
                  <div className="v9co__line-thumb">
                    {it.image ? <img src={it.image} alt="" /> : <i className="fas fa-certificate" aria-hidden="true" />}
                  </div>
                  <div className="v9co__line-meta">
                    <span className="v9co__line-name">{it.name}</span>
                    {it.stateLabel && <span className="v9co__line-state">{it.stateLabel}</span>}
                    <span className="v9co__line-sub">
                      {!isCompany
                        ? money(it.price)
                        : it.isSeatBased
                          ? `${money(it.price)} × ${it.users} ${it.users === 1 ? "seat" : "seats"} · one-time`
                          : `${money(it.price)} / employee base`}
                    </span>
                    {it.isSeatBased && isCompany && (
                      <div className="v9co__line-row">
                        <div className="v9d__qty">
                          <button type="button" onClick={() => setUsers(it.id, it.users - 1)} disabled={it.users <= 1} aria-label="Decrease seats">−</button>
                          <span>{it.users}</span>
                          <button type="button" onClick={() => setUsers(it.id, it.users + 1)} aria-label="Increase seats">+</button>
                        </div>
                      </div>
                    )}
                    {it.isSeatBased && isCompany && it.users < buyer.employees && (
                      <p className="v9co__line-seatnote" role="status">
                        <i className="fas fa-circle-info" aria-hidden="true" /> Covers {it.users} of {buyer.employees}.{" "}
                        <button type="button" onClick={() => setUsers(it.id, buyer.employees)}>Use {buyer.employees}</button>
                      </p>
                    )}
                  </div>
                  <button type="button" className="v9co__line-remove" onClick={() => remove(it.id)} aria-label={`Remove ${it.name}`}>
                    <i className="fas fa-times" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>

            {showPromoInput ? (
              <>
                <div className="v9co__promo">
                  <input
                    type="text"
                    placeholder="Promo code"
                    aria-label="Promo code"
                    autoFocus={promoOpen && !promoCode}
                    value={promoDraft}
                    onChange={(e) => setPromoDraft(e.target.value)}
                    onBlur={() => { if (!promoDraft.trim() && !promoCode) setPromoOpen(false); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyPromo(promoDraft); } }}
                  />
                  <button type="button" className="gs-btn gs-btn--ghost" onClick={() => applyPromo(promoDraft)}>Apply</button>
                </div>
                {promoError && <p className="v9co__promo-error">{promoError}</p>}
              </>
            ) : (
              <button type="button" className="v9co__promo-toggle" onClick={() => setPromoOpen(true)}>
                <i className="fas fa-tag" aria-hidden="true" /> Have a promo code?
              </button>
            )}
            {quote?.promo && (
              <p className="v9co__promo-ok">
                <i className="fas fa-check" aria-hidden="true" /> {quote.promo.name} applied{needsSubscription ? " to your first invoice" : ""}
                <button type="button" className="v9co__promo-remove" onClick={() => { applyPromo(""); setPromoDraft(""); setPromoOpen(false); }}>Remove</button>
              </p>
            )}

            <dl className="v9co__totals">
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

            {needsSubscription && quote && (cq?.ongoing ?? 0) > 0 && (
              <div className="v9co__ongoing">
                <p><i className="fas fa-rotate" aria-hidden="true" /> Then <strong>{money(cq!.ongoing)}/{cadenceUnit}</strong> ongoing</p>
                <span>{money(cq!.perLocation)}/{cadenceUnit} × {buyer.locations} {buyer.locations === 1 ? "location" : "locations"} · {buyer.employees} {buyer.employees === 1 ? "employee" : "employees"} · cancel anytime</span>
              </div>
            )}

            <button type="submit" className="gs-btn gs-btn--primary v9co__place" disabled={loading || !quote}>
              {needsSubscription ? <>Place order · {money(dueToday)} today</> : <>Place order{dueToday > 0 ? ` · ${money(dueToday)}` : ""}</>} <i className="fas fa-arrow-right" aria-hidden="true" />
            </button>

            <ul className="v9co__assure">
              <li><i className="fas fa-shield-halved" aria-hidden="true" /> Secure 256-bit SSL encrypted</li>
              <li><i className="fas fa-bolt" aria-hidden="true" /> Instant access after purchase</li>
              <li><i className="fas fa-headset" aria-hidden="true" /> Support at support@train321.com</li>
            </ul>
          </aside>
        </form>
      </div>
    </section>
  );
}

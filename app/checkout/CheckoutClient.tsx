"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Elements, CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useCart } from "@/components/cart/CartContext";
import { COURSE_PLACEHOLDER_IMAGE } from "@/lib/newFeatures";
import type { CheckoutResult } from "@/lib/enroll";
import { trackBeginCheckout, trackPurchase, lineToItem } from "@/lib/analytics";
import { US_STATES } from "./states";
import "./checkout.css";

// The publishable key is chosen server-side in page.tsx so it always pairs
// with the LMS backend this deployment talks to (test key for the staging
// backend, live key for production) — a mismatched pair fails every payment
// with "No such token".
//
// loadStripe must run once per key, outside the render cycle — re-creating
// the promise on every render would reload Stripe.js each time.
let stripePromise: ReturnType<typeof loadStripe> | null = null;
let stripeKeyLoaded = "";
function getStripe(publishableKey: string) {
  if (!publishableKey) return null;
  if (!stripePromise || stripeKeyLoaded !== publishableKey) {
    stripePromise = loadStripe(publishableKey);
    stripeKeyLoaded = publishableKey;
  }
  return stripePromise;
}

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function CheckoutClient({ publishableKey }: { publishableKey: string }) {
  return (
    <Elements stripe={getStripe(publishableKey)}>
      <CheckoutForm stripeConfigured={Boolean(publishableKey)} />
    </Elements>
  );
}

type FieldErrors = Partial<
  Record<
    | "first_name"
    | "last_name"
    | "email"
    | "password"
    | "card"
    | "company_name"
    | "billing_first_name"
    | "billing_last_name"
    | "billing_email"
    | "phone"
    | "billing_phone",
    string
  >
>;

/**
 * Progressive US phone mask: "(555) 123-4567". Non-digits are stripped, a
 * leading country "1" on a full number is dropped, and input caps at 10
 * digits — so pasted values like "+1 555-123-4567" still land correctly.
 */
function formatUsPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").replace(/^1(?=\d{10})/, "").slice(0, 10);
  if (!d) return "";
  if (d.length < 4) return `(${d}`;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** A masked phone is valid when empty (optional field) or fully 10 digits. */
function phoneIsValid(v: string): boolean {
  const digits = v.replace(/\D/g, "").length;
  return digits === 0 || digits === 10;
}

function CheckoutForm({ stripeConfigured }: { stripeConfigured: boolean }) {
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
    toApiLines,
    buyer,
    setAudience,
    setEmployees,
    setLocations,
    setCadence
  } = useCart();
  const stripe = useStripe();
  const elements = useElements();

  // Fires once, after the cart resolves — before `ready` the lines are empty
  // and the event would carry no items or value.
  const beganCheckout = useRef(false);
  useEffect(() => {
    if (beganCheckout.current || !ready || lines.length === 0) return;
    beganCheckout.current = true;
    trackBeginCheckout(lines.map(lineToItem), quote?.dueToday);
  }, [ready, lines, quote]);

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
  const [billing, setBilling] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: ""
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [emailTaken, setEmailTaken] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [promoDraft, setPromoDraft] = useState(promoCode);
  // Collapsed behind "Have a promo code?" — same disclosure as the drawer.
  // Stays open once a code is set so an applied promo is never hidden.
  const [promoOpen, setPromoOpen] = useState(false);
  const showPromoInput = promoOpen || Boolean(promoCode);

  // ── Which numbers apply ────────────────────────────────────────────────
  // Individual: one-time totals. Company: the chosen cadence's subscription
  // view — first invoice due today, renewals at the full ongoing rate.
  const isCompany = buyer.audience === "company";
  const cq = quote ? (buyer.cadence === "yearly" ? quote.yearly : quote.monthly) : null;
  const dueToday = (isCompany ? cq?.dueToday : quote?.dueToday) ?? 0;
  const shownSubtotal = (isCompany ? cq?.subtotal : quote?.subtotal) ?? 0;
  const shownDiscount = (isCompany ? cq?.discount : quote?.discount) ?? 0;
  const cadenceUnit = buyer.cadence === "yearly" ? "yr" : "mo";

  // A company cart with compliance courses becomes a Stripe subscription,
  // which always needs a card on file — so a $0 first invoice can't be a
  // free order there. Individual (and company seat-only) $0 carts can.
  const hasCompliance = lines.some((l) => !l.isSeatBased);
  const needsSubscription = isCompany && hasCompliance;
  const isFree = Boolean(quote) && dueToday <= 0 && !needsSubscription;

  const apiLines = toApiLines();

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

  // Phone fields run through the mask instead of the plain setters.
  const setPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatUsPhone(e.target.value);
    setForm((f) => ({ ...f, phone: value }));
    setErrors((prev) => ({ ...prev, phone: undefined }));
  };
  const setBillPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatUsPhone(e.target.value);
    setBilling((b) => ({ ...b, phone: value }));
    setErrors((prev) => ({ ...prev, billing_phone: undefined }));
  };

  const onBillingEmailBlur = () => {
    const email = billing.email.trim();
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      setErrors((prev) => ({ ...prev, billing_email: "Enter a valid email address." }));
    }
  };

  /**
   * Ask the backend whether this email already has an account, so the buyer
   * finds out here rather than after entering a card. Silent on failure — the
   * checkout call enforces the same rule regardless.
   */
  const onEmailBlur = async () => {
    const email = form.email.trim();
    // Flag a malformed address as soon as the buyer leaves the field —
    // same message submit-time validation would show.
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      setErrors((prev) => ({ ...prev, email: "Enter a valid email address." }));
      return;
    }
    if (!email) return;
    try {
      const res = await fetch("/api/enroll/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (!res.ok) return;
      const data = (await res.json()) as { exists: boolean };
      setEmailTaken(data.exists);
    } catch {
      /* precheck is best-effort */
    }
  };

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!form.first_name.trim()) next.first_name = "Enter your first name.";
    if (!form.last_name.trim()) next.last_name = "Enter your last name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (form.password.length !== 8) next.password = "Password must be exactly 8 characters.";
    if (isCompany && !form.company_name.trim()) {
      next.company_name = "Enter your company name.";
    }
    if (!phoneIsValid(form.phone)) {
      next.phone = "Enter a 10-digit phone number like (555) 123-4567.";
    }
    if (isCompany && billingDifferent) {
      if (!billing.first_name.trim()) next.billing_first_name = "Enter a first name.";
      if (!billing.last_name.trim()) next.billing_last_name = "Enter a last name.";
      if (!/^\S+@\S+\.\S+$/.test(billing.email.trim()))
        next.billing_email = "Enter a valid email address.";
      if (!phoneIsValid(billing.phone)) {
        next.billing_phone = "Enter a 10-digit phone number like (555) 123-4567.";
      }
    }
    if (!isFree && !cardComplete) next.card = "Enter your card details.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (emailTaken) {
      setSubmitError("An account with that email already exists. Please sign in instead.");
      return;
    }
    if (!validate()) return;
    if (!isFree && (!stripe || !elements)) {
      setSubmitError("Payment isn't ready yet. Please wait a moment and try again.");
      return;
    }

    setSubmitting(true);
    try {
      let tokenId: string | null = null;

      if (!isFree) {
        // Tokenise in the browser. Raw card data goes straight from the Stripe
        // iframe to Stripe — it never reaches our server or the LMS.
        const card = elements!.getElement(CardElement);
        if (!card) throw new Error("Card field is unavailable. Please reload the page.");

        const { token, error } = await stripe!.createToken(card, {
          name: `${form.first_name} ${form.last_name}`.trim()
        });
        if (error || !token) {
          setErrors((prev) => ({ ...prev, card: error?.message || "We couldn't verify that card." }));
          setSubmitting(false);
          return;
        }
        tokenId = token.id;
      }

      const res = await fetch("/api/enroll/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: apiLines,
          promoCode,
          stripeTokenId: tokenId,
          cardholderName: `${form.first_name} ${form.last_name}`.trim(),
          audience: buyer.audience,
          employees: buyer.employees,
          locations: buyer.locations,
          cadence: buyer.cadence,
          companyName: form.company_name.trim(),
          billing: isCompany && billingDifferent ? billing : null,
          details: {
            email: form.email.trim(),
            password: form.password,
            first_name: form.first_name.trim(),
            last_name: form.last_name.trim(),
            phone: form.phone.trim(),
            state: form.state
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data?.message || "We couldn't complete your enrollment.");
        setSubmitting(false);
        return;
      }

      // Order is placed — empty the cart so a refresh or a back-button press
      // can't re-submit the same purchase.
      const order = data as CheckoutResult;

      // Report before clear() empties the cart — afterwards there are no
      // lines left to attribute the revenue against. The charge id doubles as
      // GA4's de-duplication key, so a refreshed success panel can't count
      // the same order twice.
      trackPurchase({
        transactionId: order.chargeId || order.subscription?.id || String(order.employee.id),
        value: order.amount,
        items: lines.map(lineToItem),
        coupon: promoCode || undefined
      });

      setResult(order);
      clear();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success ────────────────────────────────────────────────────────────
  if (result) return <SuccessPanel result={result} />;

  // ── Still rehydrating ──────────────────────────────────────────────────
  // The cart lives in localStorage and is re-resolved against the LMS on load,
  // so on a hard navigation `lines` is briefly empty for a cart that isn't.
  if (!ready) {
    return (
      <div className="t321-mkt-checkout">
        <div className="t321-mkt-container t321-mkt-checkout__empty">
          <i className="fas fa-spinner fa-spin" aria-hidden="true" />
          <p className="t321-mkt-lede">Loading your cart…</p>
        </div>
      </div>
    );
  }

  // ── Empty cart ─────────────────────────────────────────────────────────
  if (lines.length === 0) {
    return (
      <div className="t321-mkt-checkout">
        <div className="t321-mkt-container t321-mkt-checkout__empty">
          <i className="fas fa-shopping-basket" aria-hidden="true" />
          <h1 className="t321-mkt-h2">Your cart is empty</h1>
          <p className="t321-mkt-lede">Add a course and it&rsquo;ll show up here.</p>
          <Link href="/catalog" className="t321-mkt-btn t321-mkt-btn--primary t321-mkt-btn--lg">
            Browse courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="t321-mkt-checkout">
      <div className="t321-mkt-container">
        <div className="t321-mkt-checkout__head">
          <span className="t321-mkt-eyebrow">
            <i className="fas fa-lock" aria-hidden="true" /> Secure checkout
          </span>
          <h1 className="t321-mkt-h1">Complete your enrollment</h1>
          <p className="t321-mkt-lede">
            We&rsquo;ll create your Train 321 account and give you instant access to every course
            below.
          </p>
        </div>

        <form className="t321-mkt-checkout__grid" onSubmit={onSubmit} noValidate>
          <div className="t321-mkt-checkout__main">
            {/* ── 1 · Audience ─────────────────────────────────────────── */}
            <section className="t321-mkt-checkout__card">
              <h2 className="t321-mkt-checkout__step">
                <span className="t321-mkt-checkout__step-num">1</span> Who is this training for?
              </h2>

              <div className="t321-mkt-checkout__aud" role="radiogroup" aria-label="Buyer type">
                <button
                  type="button"
                  role="radio"
                  aria-checked={!isCompany}
                  className={`t321-mkt-checkout__aud-card${!isCompany ? " is-active" : ""}`}
                  onClick={() => setAudience("individual")}
                >
                  <i className="fas fa-user" aria-hidden="true" />
                  <strong>Just me</strong>
                  <span>One-time payment, instant access</span>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={isCompany}
                  className={`t321-mkt-checkout__aud-card${isCompany ? " is-active" : ""}`}
                  onClick={() => setAudience("company")}
                >
                  <i className="fas fa-users" aria-hidden="true" />
                  <strong>My team</strong>
                  <span>Company account, priced per employee</span>
                </button>
              </div>

              {isCompany && (
                <div className="t321-mkt-checkout__company">
                  <Field label="Company name" error={errors.company_name} required>
                    <input
                      type="text"
                      autoComplete="organization"
                      value={form.company_name}
                      onChange={set("company_name")}
                    />
                  </Field>

                  <div className="t321-mkt-checkout__row">
                    <Field
                      label={
                        <>
                          <i className="fas fa-user-group" aria-hidden="true" /> Employees
                        </>
                      }
                      hint="People taking the compliance courses."
                      required
                    >
                      <Stepper
                        value={buyer.employees}
                        min={1}
                        max={9999}
                        onChange={setEmployees}
                        ariaLabel="Number of employees"
                      />
                    </Field>
                    <Field
                      label={
                        <>
                          <i className="fas fa-map-marker-alt" aria-hidden="true" /> Locations
                        </>
                      }
                      hint="Where your team works."
                      required
                    >
                      <Stepper
                        value={buyer.locations}
                        min={1}
                        max={9999}
                        onChange={setLocations}
                        ariaLabel="Number of locations"
                      />
                    </Field>
                  </div>

                  <div
                    className="t321-mkt-checkout__cadence"
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
            </section>

            {/* ── 2 · Details ──────────────────────────────────────────── */}
            <section className="t321-mkt-checkout__card">
              <h2 className="t321-mkt-checkout__step">
                <span className="t321-mkt-checkout__step-num">2</span>
                {isCompany ? "Admin account" : "Your details"}
              </h2>

              <div className="t321-mkt-checkout__row">
                <Field label="First name" error={errors.first_name} required>
                  <input
                    type="text"
                    autoComplete="given-name"
                    value={form.first_name}
                    onChange={set("first_name")}
                  />
                </Field>
                <Field label="Last name" error={errors.last_name} required>
                  <input
                    type="text"
                    autoComplete="family-name"
                    value={form.last_name}
                    onChange={set("last_name")}
                  />
                </Field>
              </div>

              <Field
                label="Email"
                error={errors.email || (emailTaken ? "An account with that email already exists." : undefined)}
                hint={
                  isCompany
                    ? "This becomes the company admin sign-in."
                    : "This is the email you'll sign in with."
                }
                required
              >
                <input
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => {
                    set("email")(e);
                    setEmailTaken(false);
                  }}
                  onBlur={onEmailBlur}
                />
              </Field>

              <Field
                label="Password"
                error={errors.password}
                hint="Exactly 8 characters."
                required
              >
                <input
                  type="password"
                  autoComplete="new-password"
                  maxLength={8}
                  value={form.password}
                  onChange={set("password")}
                />
              </Field>

              <div className="t321-mkt-checkout__row">
                <Field label="Phone" error={errors.phone} hint="Optional">
                  <input
                    type="tel"
                    autoComplete="tel"
                    placeholder="(555) 123-4567"
                    maxLength={14}
                    value={form.phone}
                    onChange={setPhone}
                  />
                </Field>
                <Field label="State" hint="Optional">
                  <select value={form.state} onChange={set("state")}>
                    <option value="">Select a state…</option>
                    {US_STATES.map((s) => (
                      <option key={s.code} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* Separate billing contact — collapsed by default; the backend
                  only requires the extra fields when the mode is "different". */}
              {isCompany && (
                <>
                  <label className="t321-mkt-checkout__billing-toggle">
                    <input
                      type="checkbox"
                      checked={billingDifferent}
                      onChange={(e) => setBillingDifferent(e.target.checked)}
                    />
                    Billing contact is someone else
                  </label>

                  {billingDifferent && (
                    <div className="t321-mkt-checkout__billing">
                      <div className="t321-mkt-checkout__row">
                        <Field label="Billing first name" error={errors.billing_first_name} required>
                          <input
                            type="text"
                            value={billing.first_name}
                            onChange={setBill("first_name")}
                          />
                        </Field>
                        <Field label="Billing last name" error={errors.billing_last_name} required>
                          <input
                            type="text"
                            value={billing.last_name}
                            onChange={setBill("last_name")}
                          />
                        </Field>
                      </div>
                      <div className="t321-mkt-checkout__row">
                        <Field label="Billing email" error={errors.billing_email} required>
                          <input
                            type="email"
                            value={billing.email}
                            onChange={setBill("email")}
                            onBlur={onBillingEmailBlur}
                          />
                        </Field>
                        <Field label="Billing phone" error={errors.billing_phone} hint="Optional">
                          <input
                            type="tel"
                            placeholder="(555) 123-4567"
                            maxLength={14}
                            value={billing.phone}
                            onChange={setBillPhone}
                          />
                        </Field>
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>

            {/* ── 3 · Payment ──────────────────────────────────────────── */}
            <section className="t321-mkt-checkout__card">
              <h2 className="t321-mkt-checkout__step">
                <span className="t321-mkt-checkout__step-num">3</span> Payment
              </h2>

              {isFree ? (
                <p className="t321-mkt-checkout__free">
                  <i className="fas fa-check-circle" aria-hidden="true" />
                  Your promo code covers the full amount — no payment needed.
                </p>
              ) : !stripeConfigured ? (
                <p className="t321-mkt-checkout__error" role="alert">
                  Card payments aren&rsquo;t configured. Please contact support.
                </p>
              ) : (
                <>
                  <Field label="Card details" error={errors.card} required>
                    <div className="t321-mkt-checkout__card-el">
                      <CardElement
                        options={{
                          hidePostalCode: false,
                          style: {
                            base: {
                              fontSize: "15px",
                              color: "#0B1F33",
                              fontFamily: "inherit",
                              "::placeholder": { color: "#8A97A6" }
                            },
                            invalid: { color: "#9D1F2A" }
                          }
                        }}
                        onChange={(e) => {
                          setCardComplete(e.complete);
                          setErrors((prev) => ({
                            ...prev,
                            card: e.error?.message
                          }));
                        }}
                      />
                    </div>
                  </Field>
                  <p className="t321-mkt-checkout__secure">
                    <i className="fas fa-lock" aria-hidden="true" />
                    Card details go straight to Stripe — they never touch our servers.
                  </p>

                  {/* Trust row — familiar payment marks plus the Stripe name.
                      Brand glyphs come from the Font Awesome set already
                      loaded site-wide, so no external image requests. */}
                  <div className="t321-mkt-checkout__trust" aria-label="Accepted cards and security">
                    <span className="t321-mkt-checkout__trust-cards">
                      <i className="fab fa-cc-visa" aria-label="Visa" />
                      <i className="fab fa-cc-mastercard" aria-label="Mastercard" />
                      <i className="fab fa-cc-amex" aria-label="American Express" />
                      <i className="fab fa-cc-discover" aria-label="Discover" />
                    </span>
                    <span className="t321-mkt-checkout__trust-badge">
                      <i className="fab fa-stripe" aria-hidden="true" />
                      <span className="t321-mkt-visually-hidden">Powered by Stripe</span>
                    </span>
                  </div>
                </>
              )}
            </section>

            {submitError && (
              <p className="t321-mkt-checkout__error" role="alert">
                <i className="fas fa-exclamation-circle" aria-hidden="true" /> {submitError}
              </p>
            )}
          </div>

          {/* ── Order summary ─────────────────────────────────────────── */}
          <aside className="t321-mkt-checkout__summary" aria-label="Order summary">
            <h2 className="t321-mkt-checkout__summary-title">Order summary</h2>

            <ul className="t321-mkt-checkout__lines">
              {lines.map((line) => (
                <li key={line.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
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
                  <div>
                    <p className="t321-mkt-checkout__line-name">{line.name}</p>
                    <p className="t321-mkt-checkout__line-meta">
                      {/* Seat quantities and the one-time/recurring split are
                          team concepts — an individual sees plain per-course
                          prices, nothing else. */}
                      {!isCompany
                        ? money(line.price)
                        : line.isSeatBased
                          ? `${money(line.price)} × ${line.users} seats · one-time`
                          : `${money(line.price)} / employee base`}
                    </p>
                    {line.isSeatBased && isCompany && (
                      <div className="t321-mkt-checkout__qty">
                        <button
                          type="button"
                          aria-label={`Decrease seats for ${line.name}`}
                          onClick={() => setUsers(line.id, line.users - 1)}
                          disabled={line.users <= 1}
                        >
                          <i className="fas fa-minus" aria-hidden="true" />
                        </button>
                        <span>{line.users}</span>
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
                    className="t321-mkt-checkout__line-remove"
                    aria-label={`Remove ${line.name}`}
                    onClick={() => remove(line.id)}
                  >
                    <i className="fas fa-times" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>

            {showPromoInput ? (
              <>
                <div className="t321-mkt-checkout__promo">
                  <input
                    type="text"
                    placeholder="Promo code"
                    aria-label="Promo code"
                    autoFocus={promoOpen && !promoCode}
                    value={promoDraft}
                    onChange={(e) => setPromoDraft(e.target.value)}
                    onBlur={() => {
                      // Opened it, typed nothing, clicked away — fold back to
                      // the link rather than leaving an empty box behind.
                      if (!promoDraft.trim() && !promoCode) setPromoOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        applyPromo(promoDraft);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="t321-mkt-btn t321-mkt-btn--ghost"
                    onClick={() => applyPromo(promoDraft)}
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="t321-mkt-checkout__promo-error">{promoError}</p>}
              </>
            ) : (
              <button
                type="button"
                className="t321-mkt-checkout__promo-toggle"
                onClick={() => setPromoOpen(true)}
              >
                <i className="fas fa-tag" aria-hidden="true" /> Have a promo code?
              </button>
            )}
            {quote?.promo && (
              <p className="t321-mkt-checkout__promo-ok">
                <i className="fas fa-check" aria-hidden="true" /> {quote.promo.name} applied
                {isCompany && needsSubscription ? " to your first invoice" : ""}
                <button
                  type="button"
                  className="t321-mkt-checkout__promo-remove"
                  onClick={() => {
                    applyPromo("");
                    setPromoDraft("");
                    setPromoOpen(false);
                  }}
                >
                  Remove
                </button>
              </p>
            )}

            <dl className="t321-mkt-checkout__totals">
              <div>
                <dt>{isCompany ? `First ${buyer.cadence} invoice` : "Subtotal"}</dt>
                <dd>{quote ? money(shownSubtotal) : "—"}</dd>
              </div>
              {quote && shownDiscount > 0 && (
                <div className="is-discount">
                  <dt>Discount</dt>
                  <dd>−{money(shownDiscount)}</dd>
                </div>
              )}
              <div className="is-total">
                <dt>Due today</dt>
                <dd>
                  {loading && !quote ? (
                    <i className="fas fa-spinner fa-spin" aria-hidden="true" />
                  ) : (
                    money(dueToday)
                  )}
                </dd>
              </div>
            </dl>

            {/* Subscription terms, stated before the buyer commits: what
                renews, at what rate, and the per-location floor made visible
                so the math never looks arbitrary. */}
            {isCompany && needsSubscription && quote && (cq?.ongoing ?? 0) > 0 && (
              <div className="t321-mkt-checkout__ongoing">
                <p>
                  <i className="fas fa-rotate" aria-hidden="true" />
                  Then <strong>{money(cq!.ongoing)}/{cadenceUnit}</strong> ongoing
                </p>
                <span>
                  {money(cq!.perLocation)}/{cadenceUnit} × {buyer.locations}{" "}
                  {buyer.locations === 1 ? "location" : "locations"} · {buyer.employees}{" "}
                  {buyer.employees === 1 ? "employee" : "employees"} · cancel anytime
                </span>
              </div>
            )}

            <button
              type="submit"
              className="t321-mkt-btn t321-mkt-btn--primary t321-mkt-btn--block t321-mkt-btn--lg"
              disabled={submitting || loading || !quote}
            >
              {submitting ? (
                <>
                  <i className="fas fa-spinner fa-spin" aria-hidden="true" /> Processing…
                </>
              ) : isFree ? (
                <>Complete enrollment</>
              ) : isCompany && needsSubscription ? (
                <>Pay {money(dueToday)} today</>
              ) : (
                <>Pay {money(dueToday)}</>
              )}
            </button>

            {/* Reassurance under the pay button — the moment of highest
                hesitation. Quiet, factual, no marketing voice. */}
            <ul className="t321-mkt-checkout__assure">
              <li>
                <i className="fas fa-shield-halved" aria-hidden="true" />
                Secure 256-bit SSL encrypted payment
              </li>
              <li>
                <i className="fas fa-bolt" aria-hidden="true" />
                Instant access after purchase
              </li>
              <li>
                <i className="fas fa-headset" aria-hidden="true" />
                Support at support@train321.com
              </li>
            </ul>

            <p className="t321-mkt-checkout__terms">
              By enrolling you agree to our{" "}
              <Link href="/legal/terms-conditions">Terms &amp; Conditions</Link> and{" "}
              <Link href="/legal/privacy-policy">Privacy Policy</Link>.
            </p>
          </aside>
        </form>
      </div>
    </div>
  );
}

/** Label + control + hint/error, so every field renders consistently. */
function Field({
  label,
  hint,
  error,
  required,
  children
}: {
  /** Usually a string; company fields pass an icon + text fragment. */
  label: React.ReactNode;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`t321-mkt-field${error ? " has-error" : ""}`}>
      <span className="t321-mkt-field__label">
        {label}
        {required && <em aria-hidden="true">*</em>}
      </span>
      {children}
      {error ? (
        <span className="t321-mkt-field__error">{error}</span>
      ) : hint ? (
        <span className="t321-mkt-field__hint">{hint}</span>
      ) : null}
    </label>
  );
}

/** Numeric stepper — same interaction as the cart's seat control. */
function Stepper({
  value,
  min,
  max,
  onChange,
  ariaLabel
}: {
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  ariaLabel: string;
}) {
  return (
    <div className="t321-mkt-checkout__stepper">
      <button
        type="button"
        aria-label={`Decrease ${ariaLabel}`}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
      >
        <i className="fas fa-minus" aria-hidden="true" />
      </button>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        aria-label={ariaLabel}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <button
        type="button"
        aria-label={`Increase ${ariaLabel}`}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
      >
        <i className="fas fa-plus" aria-hidden="true" />
      </button>
    </div>
  );
}

/**
 * Post-purchase confirmation. The account already exists at this point, so the
 * only thing left is to send the buyer to the LMS to sign in — `loginUrl`
 * comes from the backend rather than being hardcoded here, so it stays correct
 * across staging and production.
 */
function SuccessPanel({ result }: { result: CheckoutResult }) {
  const sub = result.subscription;
  const nextBilling =
    sub?.periodEnd != null
      ? new Date(sub.periodEnd * 1000).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric"
        })
      : null;

  return (
    <div className="t321-mkt-checkout">
      <div className="t321-mkt-container t321-mkt-checkout__success">
        <div className="t321-mkt-checkout__success-icon">
          <i className="fas fa-check" aria-hidden="true" />
        </div>
        <span className="t321-mkt-eyebrow">
          {sub ? "Subscription active" : "Enrollment complete"}
        </span>
        <h1 className="t321-mkt-h1">You&rsquo;re all set, {result.employee.first_name}.</h1>
        <p className="t321-mkt-lede">
          We&rsquo;ve created your account for <strong>{result.employee.email}</strong> and sent a
          welcome email with your details. Sign in to start{" "}
          {sub ? "setting up your team" : "your training"}.
        </p>

        {result.amount > 0 && (
          <p className="t321-mkt-checkout__success-amt">
            Charged <strong>{money(result.amount)}</strong>
            {sub && (
              <>
                {" "}
                · renews {sub.cadence}
                {nextBilling ? ` on ${nextBilling}` : ""}
              </>
            )}
          </p>
        )}

        <div className="t321-mkt-checkout__success-actions">
          <a
            href={result.loginUrl}
            className="t321-mkt-btn t321-mkt-btn--primary t321-mkt-btn--lg"
          >
            Sign in to start <i className="fas fa-arrow-right" aria-hidden="true" />
          </a>
          {result.invoiceUrl && (
            <a
              href={result.invoiceUrl}
              className="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fas fa-file-invoice" aria-hidden="true" /> Download invoice
            </a>
          )}
        </div>

        {(result.receiptUrl || sub?.hostedInvoiceUrl) && (
          <p className="t321-mkt-checkout__success-receipt">
            <a
              href={result.receiptUrl || sub!.hostedInvoiceUrl!}
              target="_blank"
              rel="noopener noreferrer"
            >
              {result.receiptUrl ? "View Stripe receipt" : "View first invoice on Stripe"}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

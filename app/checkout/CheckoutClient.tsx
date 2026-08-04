"use client";

import Link from "next/link";
import { useState } from "react";
import { Elements, CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useCart } from "@/components/cart/CartContext";
import { COURSE_PLACEHOLDER_IMAGE } from "@/lib/newFeatures";
import type { CheckoutResult } from "@/lib/enroll";
import { US_STATES } from "./states";
import "./checkout.css";

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

// loadStripe returns a promise that must be created once, outside the
// component — re-creating it on every render would reload Stripe.js each time.
const stripePromise = PUBLISHABLE_KEY ? loadStripe(PUBLISHABLE_KEY) : null;

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function CheckoutClient() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}

type FieldErrors = Partial<
  Record<"first_name" | "last_name" | "email" | "password" | "card", string>
>;

function CheckoutForm() {
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
    toApiLines
  } = useCart();
  const stripe = useStripe();
  const elements = useElements();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    state: ""
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [emailTaken, setEmailTaken] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [promoDraft, setPromoDraft] = useState(promoCode);

  const dueToday = quote?.dueToday ?? 0;
  // A 100%-off promo produces a $0 cart, which the backend accepts as a free
  // enrollment with no card at all. Hide the card fields in that case rather
  // than asking for a card we'll never charge.
  const isFree = Boolean(quote) && dueToday <= 0;

  // Same shape the cart already prices against, so what we charge can't drift
  // from what the summary shows.
  const apiLines = toApiLines();

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  /**
   * Ask the backend whether this email already has an account, so the buyer
   * finds out here rather than after entering a card. Silent on failure — the
   * checkout call enforces the same rule regardless.
   */
  const onEmailBlur = async () => {
    const email = form.email.trim();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return;
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
    if (form.password.length < 8) next.password = "Use at least 8 characters.";
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
      setResult(data as CheckoutResult);
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
            We&rsquo;ll create your Train321 account and give you instant access to every course
            below.
          </p>
        </div>

        <form className="t321-mkt-checkout__grid" onSubmit={onSubmit} noValidate>
          <div className="t321-mkt-checkout__main">
            <section className="t321-mkt-checkout__card">
              <h2 className="t321-mkt-checkout__step">
                <span className="t321-mkt-checkout__step-num">1</span> Your details
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
                hint="This is the email you'll sign in with."
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
                hint="At least 8 characters."
                required
              >
                <input
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={set("password")}
                />
              </Field>

              <div className="t321-mkt-checkout__row">
                <Field label="Phone" hint="Optional">
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={set("phone")}
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
            </section>

            <section className="t321-mkt-checkout__card">
              <h2 className="t321-mkt-checkout__step">
                <span className="t321-mkt-checkout__step-num">2</span> Payment
              </h2>

              {isFree ? (
                <p className="t321-mkt-checkout__free">
                  <i className="fas fa-check-circle" aria-hidden="true" />
                  Your promo code covers the full amount — no payment needed.
                </p>
              ) : !stripePromise ? (
                <p className="t321-mkt-checkout__error" role="alert">
                  Card payments aren&rsquo;t configured
                  (<code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> is missing). Please contact
                  support.
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
                      {money(line.price)}
                      {line.isSeatBased && ` × ${line.users} seats`}
                    </p>
                    {line.isSeatBased && (
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

            <div className="t321-mkt-checkout__promo">
              <input
                type="text"
                placeholder="Promo code"
                aria-label="Promo code"
                value={promoDraft}
                onChange={(e) => setPromoDraft(e.target.value)}
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
            {quote?.promo && (
              <p className="t321-mkt-checkout__promo-ok">
                <i className="fas fa-check" aria-hidden="true" /> {quote.promo.name} applied
              </p>
            )}

            <dl className="t321-mkt-checkout__totals">
              <div>
                <dt>Subtotal</dt>
                <dd>{quote ? money(quote.subtotal) : "—"}</dd>
              </div>
              {quote && quote.discount > 0 && (
                <div className="is-discount">
                  <dt>Discount</dt>
                  <dd>−{money(quote.discount)}</dd>
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
              <Link href="/legal/terms-of-service">Terms of Service</Link> and{" "}
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
  label: string;
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

/**
 * Post-purchase confirmation. The account already exists at this point, so the
 * only thing left is to send the buyer to the LMS to sign in — `loginUrl`
 * comes from the backend rather than being hardcoded here, so it stays correct
 * across staging and production.
 */
function SuccessPanel({ result }: { result: CheckoutResult }) {
  return (
    <div className="t321-mkt-checkout">
      <div className="t321-mkt-container t321-mkt-checkout__success">
        <div className="t321-mkt-checkout__success-icon">
          <i className="fas fa-check" aria-hidden="true" />
        </div>
        <span className="t321-mkt-eyebrow">Enrollment complete</span>
        <h1 className="t321-mkt-h1">You&rsquo;re all set, {result.employee.first_name}.</h1>
        <p className="t321-mkt-lede">
          We&rsquo;ve created your account for <strong>{result.employee.email}</strong> and sent a
          welcome email with your details. Sign in to start your training.
        </p>

        {result.amount > 0 && (
          <p className="t321-mkt-checkout__success-amt">
            Charged <strong>{money(result.amount)}</strong>
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

        {result.receiptUrl && (
          <p className="t321-mkt-checkout__success-receipt">
            <a href={result.receiptUrl} target="_blank" rel="noopener noreferrer">
              View Stripe receipt
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

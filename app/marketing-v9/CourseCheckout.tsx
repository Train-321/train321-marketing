"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Elements, CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { US_STATES } from "@/lib/states";
import CustomSelect from "@/components/CustomSelect";
import type { CartCourse, EnrollQuote, CheckoutResult } from "@/lib/enroll";

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const EMAIL = /^\S+@\S+\.\S+$/;

// loadStripe must run once per key, outside render — recreating the promise on
// every render would reload Stripe.js each time.
let stripePromise: ReturnType<typeof loadStripe> | null = null;
let stripeKeyLoaded = "";
function getStripe(pk: string) {
  if (!pk) return null;
  if (!stripePromise || stripeKeyLoaded !== pk) {
    stripePromise = loadStripe(pk);
    stripeKeyLoaded = pk;
  }
  return stripePromise;
}

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

export type CheckoutAudience = "individual" | "company";
type Mode = "signin" | "new";
type Errors = Record<string, string | undefined>;

// Embeddable checkout section, pre-filled with one OR several courses. Rendered
// as a section on the /marketing-v9 landing page (the parent provides the page
// shell). Two account paths chosen by radio: sign in (existing account) or
// create a new account. The new-account form is driven by `audience` (from the
// URL query): "individual" shows self-registration fields, "company" shows the
// company admin + team fields. `prefillEmail` seeds the email from the query.
// UI-first — "Place order" neither signs in, charges, nor creates anything.
// Pricing is the real server-authoritative quote (read-only).
type CheckoutProps = {
  courses: CartCourse[];
  audience?: CheckoutAudience;
  prefillEmail?: string;
  publishableKey?: string;
  /** Email checkout-link token (?elt=…) — validated on load; while good, the
      sign-in path needs no password and pays against the link. */
  linkToken?: string;
};

export default function CourseCheckout(props: CheckoutProps) {
  return (
    <Elements stripe={getStripe(props.publishableKey || "")}>
      <CheckoutInner {...props} />
    </Elements>
  );
}

function CheckoutInner({
  courses,
  audience = "company",
  prefillEmail = "",
  publishableKey = "",
  linkToken = ""
}: CheckoutProps) {
  const isCompany = audience === "company";
  const stripe = useStripe();
  const elements = useElements();
  const stripeConfigured = Boolean(publishableKey);
  const appLogin =
    (process.env.NEXT_PUBLIC_APP_BASE || "https://lms.train321.com").replace(/\/+$/, "") + "/#/login";

  const [mode, setMode] = useState<Mode>("signin");
  const [placed, setPlaced] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [cardComplete, setCardComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckoutResult | null>(null);

  const [signin, setSignin] = useState({ email: prefillEmail, password: "" });
  // Billing address for the sign-in purchase path — the authenticated
  // purchase endpoint requires it (same as the in-app Purchase form).
  const [bill, setBill] = useState({ address: "", city: "", state: "", zip: "" });
  const setBl = (k: keyof typeof bill) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setBill((p) => ({ ...p, [k]: e.target.value }));
    setErrors((p) => ({ ...p, ["bl_" + k]: undefined }));
  };
  // Name from the site session's display cookie (t321_user, set by
  // /api/auth/login). When present the buyer is already signed in on this
  // origin, so the password field stays hidden and the server route charges
  // against the httpOnly session token instead. Cleared again if the server
  // answers need_password (expired session) — the field then appears.
  const [sessionUser, setSessionUser] = useState<string | null>(null);
  useEffect(() => {
    try {
      const m = document.cookie.match(/(?:^|;\s*)t321_user=([^;]+)/);
      if (!m) return;
      const u = JSON.parse(decodeURIComponent(m[1])) as { name?: string } | null;
      if (u?.name) setSessionUser(String(u.name));
    } catch {
      /* cosmetic cookie — a bad value just means "not signed in" */
    }
  }, []);
  // Email checkout link (?elt=…): confirm it server-side, then borrow the
  // signed-in UX — sessionUser hides the password field, linkActive makes the
  // submit pay against the link token. An invalid/expired token changes
  // nothing: the buyer just sees the normal password form.
  const [linkActive, setLinkActive] = useState(false);
  useEffect(() => {
    if (!linkToken) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/enroll/link-validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: linkToken })
        });
        const d = (await res.json().catch(() => null)) as
          | { success?: boolean; full_name?: string; email?: string }
          | null;
        if (!cancelled && res.ok && d?.success) {
          setSessionUser(String(d.full_name || d.email || "your account"));
          setLinkActive(true);
        }
      } catch {
        /* unreachable validator = no shortcut; the password form still works */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [linkToken]);
  const [form, setForm] = useState({
    company_name: "", first_name: "", last_name: "", email: prefillEmail, password: "", phone: "", state: ""
  });
  const [billingDifferent, setBillingDifferent] = useState(false);
  const [billing, setBilling] = useState({ first_name: "", last_name: "", email: "", phone: "" });
  const [employees, setEmployees] = useState(5);
  const [locations, setLocations] = useState(1);
  const [cadence, setCadence] = useState<"monthly" | "yearly">("yearly");

  const [quote, setQuote] = useState<EnrollQuote | null>(null);
  const [loading, setLoading] = useState(true);

  const isEmpty = courses.length === 0;
  // Team subscription pricing applies only to a NEW company account; an existing
  // account (sign in) just adds the course(s) at the one-time price.
  const teamPricing = isCompany && mode === "new";

  const lines = useMemo(
    () => courses.map((c) => ({ id: c.id, users: teamPricing && c.isSeatBased ? employees : 1, isSeatBased: c.isSeatBased })),
    [courses, teamPricing, employees]
  );
  const linesKey = lines.map((l) => `${l.id}:${l.users}:${l.isSeatBased ? 1 : 0}`).join("|");

  useEffect(() => {
    if (isEmpty) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/enroll/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lines, audience: teamPricing ? "company" : "individual", employees, locations })
        });
        const data = await res.json();
        if (!cancelled && res.ok) setQuote(data as EnrollQuote);
      } catch {
        /* pricing is best-effort */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linesKey, teamPricing, employees, locations, isEmpty]);

  const cq = quote ? (cadence === "yearly" ? quote.yearly : quote.monthly) : null;
  const dueToday = (teamPricing ? cq?.dueToday : quote?.dueToday) ?? 0;
  const shownSubtotal = (teamPricing ? cq?.subtotal : quote?.subtotal) ?? 0;
  const cadenceUnit = cadence === "yearly" ? "yr" : "mo";
  const needsSubscription = teamPricing && quote?.hasRecurring;

  const setF = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };
  const setB = (k: keyof typeof billing) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setBilling((b) => ({ ...b, [k]: e.target.value }));
    setErrors((p) => ({ ...p, [`b_${k}`]: undefined }));
  };

  function validate(): boolean {
    const next: Errors = {};
    if (mode === "signin") {
      if (!EMAIL.test(signin.email.trim())) next.si_email = "Enter a valid email address.";
      if (!signin.password && !sessionUser) next.si_password = "Enter your password.";
      if (dueToday > 0) {
        if (!bill.address.trim()) next.bl_address = "Enter your billing address.";
        if (!bill.city.trim()) next.bl_city = "Enter your city.";
        if (!bill.state) next.bl_state = "Select your state.";
        if (!/^\d{5}(-\d{4})?$/.test(bill.zip.trim())) next.bl_zip = "Enter a valid ZIP code.";
      }
    } else {
      if (isCompany && !form.company_name.trim()) next.company_name = "Enter your company name.";
      if (!form.first_name.trim()) next.first_name = "Enter your first name.";
      if (!form.last_name.trim()) next.last_name = "Enter your last name.";
      if (!EMAIL.test(form.email.trim())) next.email = "Enter a valid email address.";
      if (form.password.length !== 8) next.password = "Password must be exactly 8 characters.";
      if (!phoneIsValid(form.phone)) next.phone = "Enter a 10-digit phone number.";
      if (isCompany && billingDifferent) {
        if (!billing.first_name.trim()) next.b_first_name = "Enter a first name.";
        if (!billing.last_name.trim()) next.b_last_name = "Enter a last name.";
        if (!EMAIL.test(billing.email.trim())) next.b_email = "Enter a valid email address.";
        if (!phoneIsValid(billing.phone)) next.b_phone = "Enter a 10-digit phone number.";
      }
    }
    if (dueToday > 0 && stripeConfigured && !cardComplete) next.card = "Enter your card details.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    // Existing account → sign in with the entered credentials, then run the
    // same authenticated purchase the LMS app uses (via /api/enroll/
    // signin-checkout): server-side pricing, PaymentIntent charge, course
    // assignment, purchase history + ledger, receipt email. 3DS cards
    // round-trip: backend answers requires_action + client_secret, the
    // browser completes the challenge, then we re-POST with the intent id.
    if (mode === "signin") {
      setSubmitting(true);
      try {
        // No password + a site session → the server route charges against the
        // httpOnly session token; the password only travels when typed.
        const creds: Record<string, unknown> = {
          email: signin.email.trim(),
          courses: courses.map((c) => ({ id: c.id, name: c.name })),
          billing_address: bill.address.trim(),
          billing_city: bill.city.trim(),
          billing_state: bill.state,
          billing_zip: bill.zip.trim()
        };
        if (signin.password) creds.password = signin.password;
        else if (linkActive && linkToken) creds.link_token = linkToken;

        let paymentMethodId: string | null = null;
        if (dueToday > 0) {
          if (!stripe || !elements) {
            setSubmitError("Payment isn't ready yet. Please wait a moment and try again.");
            setSubmitting(false);
            return;
          }
          const card = elements.getElement(CardElement);
          if (!card) throw new Error("Card field is unavailable. Please reload the page.");
          const { paymentMethod, error } = await stripe.createPaymentMethod({
            type: "card",
            card,
            billing_details: { email: signin.email.trim() }
          });
          if (error || !paymentMethod) {
            setErrors((p) => ({ ...p, card: error?.message || "We couldn't verify that card." }));
            setSubmitting(false);
            return;
          }
          paymentMethodId = paymentMethod.id;
        }

        const post = async (extra: Record<string, unknown>) => {
          const res = await fetch("/api/enroll/signin-checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...creds, ...extra })
          });
          return { ok: res.ok, data: (await res.json().catch(() => null)) as Record<string, unknown> | null };
        };

        let { ok, data } = await post(paymentMethodId ? { payment_method_id: paymentMethodId } : {});

        // 3DS challenge — finish it in the browser, then confirm server-side.
        if (data?.requires_action && typeof data.client_secret === "string" && stripe) {
          const { error: actionError } = await stripe.confirmCardPayment(data.client_secret);
          if (actionError) {
            setErrors((p) => ({ ...p, card: actionError.message || "Card authentication failed." }));
            setSubmitting(false);
            return;
          }
          ({ ok, data } = await post({ payment_intent_id: String(data.intent_id || "") }));
        }

        if (!ok || !data?.success) {
          // Session/link no longer valid — reveal the password field and let
          // the buyer continue without losing the cart.
          if (data?.need_password) {
            setSessionUser(null);
            setLinkActive(false);
          }
          setSubmitError(
            (typeof data?.message === "string" && data.message) ||
              "We couldn't complete your enrollment. Your card has not been charged."
          );
          setSubmitting(false);
          return;
        }
        setPlaced(true);
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // New account → real checkout: create the account + take payment through the
    // backend (NEW_FEATURES_API_BASE). The card is tokenised in the browser; only
    // the opaque token id reaches our server.
    setSubmitting(true);
    try {
      let tokenId: string | null = null;
      if (dueToday > 0) {
        if (!stripe || !elements) {
          setSubmitError("Payment isn't ready yet. Please wait a moment and try again.");
          setSubmitting(false);
          return;
        }
        const card = elements.getElement(CardElement);
        if (!card) throw new Error("Card field is unavailable. Please reload the page.");
        const { token, error } = await stripe.createToken(card, {
          name: `${form.first_name} ${form.last_name}`.trim()
        });
        if (error || !token) {
          setErrors((p) => ({ ...p, card: error?.message || "We couldn't verify that card." }));
          setSubmitting(false);
          return;
        }
        tokenId = token.id;
      }

      const res = await fetch("/api/enroll/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines,
          promoCode: "",
          stripeTokenId: tokenId,
          cardholderName: `${form.first_name} ${form.last_name}`.trim(),
          audience: isCompany ? "company" : "individual",
          employees,
          locations,
          cadence,
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
      setResult(data as CheckoutResult);
      setPlaced(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const buyerEmail = mode === "signin" ? signin.email : form.email;
  const buyerName = mode === "signin" ? "" : form.first_name;
  const courseWord = courses.length === 1 ? "your course" : `your ${courses.length} courses`;

  // ── No valid courses (parent normally hides the section instead) ──────
  if (isEmpty) {
    return (
      <div className="v9co__embed-empty">
        <span className="v9co__empty-ic"><i className="fas fa-cart-shopping" aria-hidden="true" /></span>
        <p>We couldn&rsquo;t find those courses. <Link href="/catalog" className="gs-inline-link">Browse the catalog</Link> and pick the training you need.</p>
      </div>
    );
  }

  // ── Order placed ──────────────────────────────────────────────────────
  if (placed) {
    return (
      <div className="v9co__embed-done">
        <span className="v9co__done-ic">
          <i className="fas fa-circle-check" aria-hidden="true" />
          <span className="v9co__sparks" aria-hidden="true">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="v9co__spark" style={{ "--a": `${i * 30}deg` } as React.CSSProperties} />
            ))}
          </span>
        </span>
        {result ? (
          <>
            <h3>You&rsquo;re all set{result.employee?.first_name ? `, ${result.employee.first_name}` : ""}! 🎉</h3>
            <p>We created your account for <strong>{result.employee.email}</strong>{result.amount > 0 ? <> and charged <strong>{money(result.amount)}</strong> (test)</> : null}. Log in to start your training.</p>
            <div className="v9co__done-actions">
              <a href={result.loginUrl} className="gs-btn gs-btn--primary">Log in to start <i className="fas fa-arrow-right" aria-hidden="true" /></a>
              {result.receiptUrl && <a href={result.receiptUrl} target="_blank" rel="noopener noreferrer" className="v9co__done-link">View Stripe receipt</a>}
            </div>
          </>
        ) : (
          <>
            <h3>Order placed! 🎉</h3>
            <p>Thanks{buyerName ? `, ${buyerName}` : ""}! A confirmation and access to {courseWord} will be sent to <strong>{buyerEmail}</strong>.</p>
            <div className="v9co__done-actions">
              <a href={appLogin} className="gs-btn gs-btn--primary">Log in <i className="fas fa-arrow-right" aria-hidden="true" /></a>
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Initial load — the server is pricing the cart. A full-card loader
  //    reads better than a half-rendered form with a tiny spinner.
  if (loading && !quote) {
    return (
      <div className="v9co__embed-loading" role="status" aria-live="polite">
        <span className="v9co__load-ring" aria-hidden="true" />
        <p>Preparing your secure checkout…</p>
      </div>
    );
  }

  return (
    <form className="v9co__onecard" onSubmit={submit} noValidate>
      <div className="v9co__grid">
      <div className="v9co__main">
        {/* Account path — radio: existing account vs new account */}
        <section className="v9co__card">
          <div className="v9co__modes" role="radiogroup" aria-label="Account">
            <label className={`v9co__mode${mode === "signin" ? " is-on" : ""}`}>
              <input type="radio" name="v9co-mode" checked={mode === "signin"} onChange={() => setMode("signin")} />
              <span className="v9co__mode-dot" aria-hidden="true" />
              <span className="v9co__mode-text">
                <i className="fas fa-right-to-bracket" aria-hidden="true" />
                <span className="v9co__mode-lines">
                  <strong>{prefillEmail || "I have an account"}</strong>
                  <small>Sign in to your account</small>
                </span>
              </span>
            </label>
            <label className={`v9co__mode${mode === "new" ? " is-on" : ""}`}>
              <input type="radio" name="v9co-mode" checked={mode === "new"} onChange={() => setMode("new")} />
              <span className="v9co__mode-dot" aria-hidden="true" />
              <span className="v9co__mode-text">
                <i className={isCompany ? "fas fa-building" : "fas fa-user-plus"} aria-hidden="true" />
                <span className="v9co__mode-lines">
                  <strong>{isCompany ? "Create a company account" : "Create a new account"}</strong>
                  <small>{isCompany ? "Admin + team" : "New to Train 321"}</small>
                </span>
              </span>
            </label>
          </div>

          {mode === "signin" ? (
            <div className="v9co__panel">
              <p className="v9co__panel-note">Sign in and we&rsquo;ll add {courseWord} to your existing Train 321 account.</p>
              <label className={`v9co__field${errors.si_email ? " has-error" : ""}`}>
                <span>Email <em aria-hidden="true">*</em></span>
                <input
                  type="email"
                  autoComplete="email"
                  value={signin.email}
                  readOnly={Boolean(prefillEmail)}
                  className={prefillEmail ? "v9co__input--readonly" : undefined}
                  onChange={(e) => {
                    if (prefillEmail) return;
                    setSignin((s) => ({ ...s, email: e.target.value }));
                    setErrors((p) => ({ ...p, si_email: undefined }));
                  }}
                />
                {errors.si_email && <em className="v9co__err">{errors.si_email}</em>}
              </label>
              {sessionUser ? (
                <p className="v9co__panel-note">
                  <i className="fas fa-circle-check" aria-hidden="true" /> Signed in as{" "}
                  <strong>{sessionUser}</strong> — no password needed.
                </p>
              ) : (
                <label className={`v9co__field${errors.si_password ? " has-error" : ""}`}>
                  <span>Password <em aria-hidden="true">*</em></span>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={signin.password}
                    onChange={(e) => {
                      setSignin((s) => ({ ...s, password: e.target.value }));
                      setErrors((p) => ({ ...p, si_password: undefined }));
                    }}
                  />
                  {errors.si_password && <em className="v9co__err">{errors.si_password}</em>}
                </label>
              )}
              {dueToday > 0 && (
                <>
                  <div className="v9co__subhead"><i className="fas fa-location-dot" aria-hidden="true" /> Billing address</div>
                  <label className={`v9co__field${errors.bl_address ? " has-error" : ""}`}>
                    <span>Address <em aria-hidden="true">*</em></span>
                    <input type="text" autoComplete="street-address" value={bill.address} onChange={setBl("address")} />
                    {errors.bl_address && <em className="v9co__err">{errors.bl_address}</em>}
                  </label>
                  <label className={`v9co__field${errors.bl_city ? " has-error" : ""}`}>
                    <span>City <em aria-hidden="true">*</em></span>
                    <input type="text" autoComplete="address-level2" value={bill.city} onChange={setBl("city")} />
                    {errors.bl_city && <em className="v9co__err">{errors.bl_city}</em>}
                  </label>
                  {/* div, not label: CustomSelect opens on its own button, and a
                      wrapping label would re-toggle it on every click. */}
                  <div className={`v9co__field${errors.bl_state ? " has-error" : ""}`}>
                    <span>State <em aria-hidden="true">*</em></span>
                    <CustomSelect
                      value={bill.state}
                      options={US_STATES.map((s) => s.name)}
                      placeholder="Select your state…"
                      onChange={(v) => {
                        setBill((p) => ({ ...p, state: v }));
                        setErrors((p) => ({ ...p, bl_state: undefined }));
                      }}
                      ariaLabel="Billing state"
                      searchable
                      searchPlaceholder="Search states…"
                    />
                    {errors.bl_state && <em className="v9co__err">{errors.bl_state}</em>}
                  </div>
                  <label className={`v9co__field${errors.bl_zip ? " has-error" : ""}`}>
                    <span>ZIP code <em aria-hidden="true">*</em></span>
                    <input type="text" inputMode="numeric" autoComplete="postal-code" maxLength={10} value={bill.zip} onChange={setBl("zip")} />
                    {errors.bl_zip && <em className="v9co__err">{errors.bl_zip}</em>}
                  </label>
                </>
              )}
            </div>
          ) : (
            <div className="v9co__panel">
              {isCompany ? (
                <>
                  <p className="v9co__panel-note">Set up a company admin account and train your whole team.</p>
                  <div className="v9co__subhead"><i className="fas fa-building" aria-hidden="true" /> Company</div>
                  <label className={`v9co__field${errors.company_name ? " has-error" : ""}`}>
                    <span>Company name <em aria-hidden="true">*</em></span>
                    <input type="text" autoComplete="organization" value={form.company_name} onChange={setF("company_name")} />
                    {errors.company_name && <em className="v9co__err">{errors.company_name}</em>}
                  </label>
                  <div className="v9co__row">
                    <label className="v9co__field">
                      <span><i className="fas fa-user-group" aria-hidden="true" /> Employees <em aria-hidden="true">*</em></span>
                      <span className="v9co__stepper">
                        <button type="button" onClick={() => setEmployees((n) => Math.max(1, n - 1))} disabled={employees <= 1} aria-label="Decrease employees">−</button>
                        <input type="number" min={1} max={9999} value={employees} aria-label="Number of employees" onChange={(e) => setEmployees(Math.max(1, Math.min(9999, Number(e.target.value) || 1)))} />
                        <button type="button" onClick={() => setEmployees((n) => Math.min(9999, n + 1))} aria-label="Increase employees">+</button>
                      </span>
                      <small>Seat counts in your order follow this number.</small>
                    </label>
                    <label className="v9co__field">
                      <span><i className="fas fa-map-marker-alt" aria-hidden="true" /> Locations <em aria-hidden="true">*</em></span>
                      <span className="v9co__stepper">
                        <button type="button" onClick={() => setLocations((n) => Math.max(1, n - 1))} disabled={locations <= 1} aria-label="Decrease locations">−</button>
                        <input type="number" min={1} max={9999} value={locations} aria-label="Number of locations" onChange={(e) => setLocations(Math.max(1, Math.min(9999, Number(e.target.value) || 1)))} />
                        <button type="button" onClick={() => setLocations((n) => Math.min(9999, n + 1))} aria-label="Increase locations">+</button>
                      </span>
                      <small>Where your team works.</small>
                    </label>
                  </div>
                  <div className="v9co__cadence" role="radiogroup" aria-label="Billing cadence">
                    <button type="button" role="radio" aria-checked={cadence === "yearly"} className={cadence === "yearly" ? "is-active" : ""} onClick={() => setCadence("yearly")}>Yearly <em>Save 10%</em></button>
                    <button type="button" role="radio" aria-checked={cadence === "monthly"} className={cadence === "monthly" ? "is-active" : ""} onClick={() => setCadence("monthly")}>Monthly</button>
                  </div>

                  <div className="v9co__subhead"><i className="fas fa-user-shield" aria-hidden="true" /> Admin account</div>
                  <div className="v9co__row">
                    <label className={`v9co__field${errors.first_name ? " has-error" : ""}`}>
                      <span>First name <em aria-hidden="true">*</em></span>
                      <input type="text" autoComplete="given-name" value={form.first_name} onChange={setF("first_name")} />
                      {errors.first_name && <em className="v9co__err">{errors.first_name}</em>}
                    </label>
                    <label className={`v9co__field${errors.last_name ? " has-error" : ""}`}>
                      <span>Last name <em aria-hidden="true">*</em></span>
                      <input type="text" autoComplete="family-name" value={form.last_name} onChange={setF("last_name")} />
                      {errors.last_name && <em className="v9co__err">{errors.last_name}</em>}
                    </label>
                  </div>
                  <label className={`v9co__field${errors.email ? " has-error" : ""}`}>
                    <span>Admin email <em aria-hidden="true">*</em></span>
                    <input type="email" autoComplete="email" value={form.email} onChange={setF("email")} />
                    {errors.email ? <em className="v9co__err">{errors.email}</em> : <small>Becomes the company admin sign-in.</small>}
                  </label>
                  <label className={`v9co__field${errors.password ? " has-error" : ""}`}>
                    <span>Password <em aria-hidden="true">*</em></span>
                    <input type="password" autoComplete="new-password" maxLength={8} value={form.password} onChange={setF("password")} />
                    {errors.password ? <em className="v9co__err">{errors.password}</em> : <small>Exactly 8 characters.</small>}
                  </label>
                  <div className="v9co__row">
                    <label className={`v9co__field${errors.phone ? " has-error" : ""}`}>
                      <span>Phone <small>(optional)</small></span>
                      <input type="tel" autoComplete="tel" placeholder="(555) 123-4567" maxLength={14} value={form.phone} onChange={(e) => { setForm((f) => ({ ...f, phone: formatUsPhone(e.target.value) })); setErrors((p) => ({ ...p, phone: undefined })); }} />
                      {errors.phone && <em className="v9co__err">{errors.phone}</em>}
                    </label>
                    <label className="v9co__field">
                      <span>State <small>(optional)</small></span>
                      <select value={form.state} onChange={setF("state")}>
                        <option value="">Select…</option>
                        {US_STATES.map((s) => <option key={s.code} value={s.name}>{s.name}</option>)}
                      </select>
                    </label>
                  </div>

                  <label className="v9co__billing-toggle">
                    <input type="checkbox" checked={billingDifferent} onChange={(e) => setBillingDifferent(e.target.checked)} />
                    Billing contact is someone else
                  </label>
                  {billingDifferent && (
                    <div className="v9co__billing">
                      <div className="v9co__row">
                        <label className={`v9co__field${errors.b_first_name ? " has-error" : ""}`}>
                          <span>First name <em aria-hidden="true">*</em></span>
                          <input type="text" value={billing.first_name} onChange={setB("first_name")} />
                          {errors.b_first_name && <em className="v9co__err">{errors.b_first_name}</em>}
                        </label>
                        <label className={`v9co__field${errors.b_last_name ? " has-error" : ""}`}>
                          <span>Last name <em aria-hidden="true">*</em></span>
                          <input type="text" value={billing.last_name} onChange={setB("last_name")} />
                          {errors.b_last_name && <em className="v9co__err">{errors.b_last_name}</em>}
                        </label>
                      </div>
                      <label className={`v9co__field${errors.b_email ? " has-error" : ""}`}>
                        <span>Email <em aria-hidden="true">*</em></span>
                        <input type="email" value={billing.email} onChange={setB("email")} />
                        {errors.b_email && <em className="v9co__err">{errors.b_email}</em>}
                      </label>
                      <label className={`v9co__field${errors.b_phone ? " has-error" : ""}`}>
                        <span>Phone <small>(optional)</small></span>
                        <input type="tel" placeholder="(555) 123-4567" maxLength={14} value={billing.phone} onChange={(e) => { setBilling((b) => ({ ...b, phone: formatUsPhone(e.target.value) })); setErrors((p) => ({ ...p, b_phone: undefined })); }} />
                        {errors.b_phone && <em className="v9co__err">{errors.b_phone}</em>}
                      </label>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="v9co__panel-note">Create your account and get instant access the moment you finish.</p>
                  <div className="v9co__subhead"><i className="fas fa-user" aria-hidden="true" /> Your details</div>
                  <div className="v9co__row">
                    <label className={`v9co__field${errors.first_name ? " has-error" : ""}`}>
                      <span>First name <em aria-hidden="true">*</em></span>
                      <input type="text" autoComplete="given-name" value={form.first_name} onChange={setF("first_name")} />
                      {errors.first_name && <em className="v9co__err">{errors.first_name}</em>}
                    </label>
                    <label className={`v9co__field${errors.last_name ? " has-error" : ""}`}>
                      <span>Last name <em aria-hidden="true">*</em></span>
                      <input type="text" autoComplete="family-name" value={form.last_name} onChange={setF("last_name")} />
                      {errors.last_name && <em className="v9co__err">{errors.last_name}</em>}
                    </label>
                  </div>
                  <label className={`v9co__field${errors.email ? " has-error" : ""}`}>
                    <span>Email <em aria-hidden="true">*</em></span>
                    <input type="email" autoComplete="email" value={form.email} onChange={setF("email")} />
                    {errors.email ? <em className="v9co__err">{errors.email}</em> : <small>You&rsquo;ll sign in with this.</small>}
                  </label>
                  <label className={`v9co__field${errors.password ? " has-error" : ""}`}>
                    <span>Password <em aria-hidden="true">*</em></span>
                    <input type="password" autoComplete="new-password" maxLength={8} value={form.password} onChange={setF("password")} />
                    {errors.password ? <em className="v9co__err">{errors.password}</em> : <small>Exactly 8 characters.</small>}
                  </label>
                  <div className="v9co__row">
                    <label className={`v9co__field${errors.phone ? " has-error" : ""}`}>
                      <span>Phone <small>(optional)</small></span>
                      <input type="tel" autoComplete="tel" placeholder="(555) 123-4567" maxLength={14} value={form.phone} onChange={(e) => { setForm((f) => ({ ...f, phone: formatUsPhone(e.target.value) })); setErrors((p) => ({ ...p, phone: undefined })); }} />
                      {errors.phone && <em className="v9co__err">{errors.phone}</em>}
                    </label>
                    <label className="v9co__field">
                      <span>State <small>(optional)</small></span>
                      <select value={form.state} onChange={setF("state")}>
                        <option value="">Select…</option>
                        {US_STATES.map((s) => <option key={s.code} value={s.name}>{s.name}</option>)}
                      </select>
                    </label>
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        <section className="v9co__card">
          <h2 className="v9co__step"><span className="v9co__step-num">2</span> Payment</h2>
          {dueToday <= 0 ? (
            <p className="v9co__free"><i className="fas fa-circle-check" aria-hidden="true" /> No payment needed — your total is {money(dueToday)}.</p>
          ) : !stripeConfigured ? (
            <p className="v9co__paycfg" role="alert">Card payments aren&rsquo;t configured — set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.</p>
          ) : (
            <>
              <label className={`v9co__field${errors.card ? " has-error" : ""}`}>
                <span>Card information <em aria-hidden="true">*</em></span>
                <div className="v9co__cardel">
                  <CardElement
                    options={{
                      hidePostalCode: false,
                      style: {
                        base: { fontSize: "15px", color: "#0B1F33", fontFamily: "inherit", "::placeholder": { color: "#8A97A6" } },
                        invalid: { color: "#9D1F2A" }
                      }
                    }}
                    onChange={(ev) => {
                      setCardComplete(ev.complete);
                      setErrors((p) => ({ ...p, card: ev.error?.message }));
                    }}
                  />
                </div>
                {errors.card && <em className="v9co__err">{errors.card}</em>}
              </label>
              <p className="v9co__secure"><i className="fas fa-lock" aria-hidden="true" /> Card details go straight to Stripe — they never touch our servers. Test mode.</p>
            </>
          )}
        </section>
      </div>

      {/* Order summary — every course auto-filled from the URL */}
      <aside className="v9co__summary" aria-label="Order summary">
        <h2>Order summary{courses.length > 1 ? ` (${courses.length})` : ""}</h2>
        <div className="v9co__lines">
          {courses.map((c) => (
            <div key={c.id} className="v9co__line">
              <div className="v9co__line-thumb">
                {c.image ? <img src={c.image} alt="" /> : <i className="fas fa-certificate" aria-hidden="true" />}
              </div>
              <div className="v9co__line-meta">
                <span className="v9co__line-name">{c.name}</span>
                {c.stateLabel && <span className="v9co__line-state">{c.stateLabel}</span>}
                <span className="v9co__line-sub">
                  {!teamPricing
                    ? money(c.price)
                    : c.isSeatBased
                      ? `${money(c.price)} × ${employees} ${employees === 1 ? "seat" : "seats"}`
                      : `${money(c.price)} / employee base`}
                </span>
              </div>
            </div>
          ))}
        </div>

        <dl className="v9co__totals">
          <div>
            <dt>{needsSubscription ? `First ${cadence} invoice` : "Subtotal"}</dt>
            <dd>{quote ? money(shownSubtotal) : "—"}</dd>
          </div>
          <div className="is-total">
            <dt>Due today</dt>
            <dd>{loading && !quote ? <i className="fas fa-spinner fa-spin" aria-hidden="true" /> : money(dueToday)}</dd>
          </div>
        </dl>

        {needsSubscription && (cq?.ongoing ?? 0) > 0 && (
          <div className="v9co__ongoing">
            <p><i className="fas fa-rotate" aria-hidden="true" /> Then <strong>{money(cq!.ongoing)}/{cadenceUnit}</strong> ongoing</p>
            <span>{employees} {employees === 1 ? "employee" : "employees"} · {locations} {locations === 1 ? "location" : "locations"} · cancel anytime</span>
          </div>
        )}

        <button type="submit" className="gs-btn gs-btn--primary v9co__place" disabled={submitting || loading || !quote}>
          {submitting ? (
            <><i className="fas fa-spinner fa-spin" aria-hidden="true" /> Processing…</>
          ) : (
            <>{dueToday > 0 ? `Pay ${money(dueToday)}` : "Place order"} <i className="fas fa-arrow-right" aria-hidden="true" /></>
          )}
        </button>
        {submitError && (
          <p className="v9co__submit-error" role="alert"><i className="fas fa-circle-exclamation" aria-hidden="true" /> {submitError}</p>
        )}

        <ul className="v9co__assure">
          <li><i className="fas fa-shield-halved" aria-hidden="true" /> Secure 256-bit SSL encrypted</li>
          <li><i className="fas fa-bolt" aria-hidden="true" /> Instant access after purchase</li>
          <li><i className="fas fa-headset" aria-hidden="true" /> Support at support@train321.com</li>
        </ul>
        <p className="v9co__powered">Powered by <strong>Stripe</strong></p>
      </aside>
      </div>
    </form>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { US_STATES } from "@/lib/states";
import type { CartCourse, EnrollQuote } from "@/lib/enroll";

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const EMAIL = /^\S+@\S+\.\S+$/;

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
export default function CourseCheckout({
  courses,
  audience = "company",
  prefillEmail = ""
}: {
  courses: CartCourse[];
  audience?: CheckoutAudience;
  prefillEmail?: string;
}) {
  const isCompany = audience === "company";

  const [mode, setMode] = useState<Mode>("signin");
  const [placed, setPlaced] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const [signin, setSignin] = useState({ email: prefillEmail, password: "" });
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
      if (!signin.password) next.si_password = "Enter your password.";
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
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setPlaced(true); // UI-first: nothing is signed in, charged, or created.
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
        <span className="v9co__done-ic"><i className="fas fa-circle-check" aria-hidden="true" /></span>
        <h3>Order placed</h3>
        <p>Thanks{buyerName ? `, ${buyerName}` : ""}! A confirmation and access to {courseWord} will be sent to <strong>{buyerEmail}</strong>.</p>
        <p className="v9co__done-note">Payment is being set up — nothing has been charged yet.</p>
        <Link href="/catalog" className="gs-btn gs-btn--primary">Browse more courses <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
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
              {prefillEmail ? (
                <p className="v9co__signin-as">Signing in as <strong>{signin.email}</strong></p>
              ) : (
                <label className={`v9co__field${errors.si_email ? " has-error" : ""}`}>
                  <span>Email <em aria-hidden="true">*</em></span>
                  <input type="email" autoComplete="email" value={signin.email} onChange={(e) => { setSignin((s) => ({ ...s, email: e.target.value })); setErrors((p) => ({ ...p, si_email: undefined })); }} />
                  {errors.si_email && <em className="v9co__err">{errors.si_email}</em>}
                </label>
              )}
              <label className={`v9co__field${errors.si_password ? " has-error" : ""}`}>
                <span>Password <em aria-hidden="true">*</em></span>
                <input type="password" autoComplete="current-password" value={signin.password} onChange={(e) => { setSignin((s) => ({ ...s, password: e.target.value })); setErrors((p) => ({ ...p, si_password: undefined })); }} />
                {errors.si_password && <em className="v9co__err">{errors.si_password}</em>}
              </label>
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
          <div className="v9co__pay">
            <span className="v9co__pay-label"><i className="fas fa-lock" aria-hidden="true" /> Payment</span>
            <p className="v9co__pay-note">Secure card payment is being set up. For now, placing the order reserves {courseWord} — nothing is charged.</p>
          </div>
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

        <button type="submit" className="gs-btn gs-btn--primary v9co__place" disabled={loading || !quote}>
          {mode === "signin" ? "Sign in & place order" : "Create account & place order"}{dueToday > 0 ? ` · ${money(dueToday)}` : ""} <i className="fas fa-arrow-right" aria-hidden="true" />
        </button>

        <ul className="v9co__assure">
          <li><i className="fas fa-shield-halved" aria-hidden="true" /> Secure 256-bit SSL encrypted</li>
          <li><i className="fas fa-bolt" aria-hidden="true" /> Instant access after purchase</li>
          <li><i className="fas fa-headset" aria-hidden="true" /> Support at support@train321.com</li>
        </ul>
      </aside>
      </div>
    </form>
  );
}

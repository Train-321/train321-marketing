"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Elements,
  CardElement,
  PaymentRequestButtonElement,
  useElements,
  useStripe
} from "@stripe/react-stripe-js";
import { loadStripe, type PaymentRequest, type Token } from "@stripe/stripe-js";
import { US_STATES, parseStateTag } from "@/lib/states";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import CourseCertificate from "@/components/CourseCertificate";
import type { CartCourse, EnrollQuote, CheckoutResult } from "@/lib/enroll";

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

/** One highlight under the certificate: Font Awesome icon class, bold title, quiet sub-line. */
export type EnrollBenefit = { icon: string; title: string; sub: string };

/** Built-in highlights — what renders when Studio has nothing for this course. */
export const DEFAULT_BENEFITS: EnrollBenefit[] = [
  { icon: "fas fa-shield-halved", title: "ANSI-accredited", sub: "nationally recognized training" },
  { icon: "fas fa-mobile-screen", title: "Any device", sub: "phone, tablet or computer" },
  { icon: "fas fa-language", title: "English or Spanish", sub: "take it in your language" },
  { icon: "fas fa-rotate", title: "Save your progress", sub: "stop and come back anytime" }
];
const EMAIL = /^\S+@\S+\.\S+$/;

// loadStripe must run once per key, outside render.
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

/** Wallet tokens carry a 2-letter state; the purchase endpoint gets full names (same as the form). */
const stateName = (v: string | null | undefined) => {
  const s = (v || "").trim();
  return US_STATES.find((x) => x.code.toLowerCase() === s.toLowerCase())?.name || s;
};
/** Full state name when an LMS state tag names exactly one state ("FL" / "Florida"), else "". */
const singleStateName = (v: string | null | undefined) => {
  const parsed = parseStateTag(v);
  return parsed.states !== "all" && parsed.states.length === 1 ? stateName(parsed.states[0]) : "";
};

// `?elt=demo` previews the signed-in-link state while the backend's
// /enroll-link endpoints aren't live yet. It only changes what's shown —
// purchase() refuses to charge a demo link.
const DEMO_LINK = "demo";

/**
 * Who is buying, worked out from the email link — never asked:
 *   link     — ?elt= token validated: we know them, no password
 *   existing — the email has an account but no valid token: password
 *   new      — no account yet: name + password
 *   unknown  — no email in the URL: ask for it first
 */
// session — the buyer is already signed in on this site (t321_user display
// cookie present); the server route charges against the httpOnly session
// token, so no password is asked. Falls back to "existing" if the server
// answers need_password (session expired).
type Identity = "checking" | "link" | "session" | "existing" | "new" | "unknown";
type Errors = Record<string, string | undefined>;
type PayWith = { kind: "card" } | { kind: "wallet"; token: Token; payerName?: string };
type Outcome = { ok: true } | { ok: false; message: string };

export type QuickBuyProps = {
  courses: CartCourse[];
  /** Courses offered as one-tap add-ons (see addOns.ts). */
  suggestions?: CartCourse[];
  prefillEmail?: string;
  prefillName?: string;
  /** Promo code from the campaign link (?promo=), applied on load. */
  prefillPromo?: string;
  linkToken?: string;
  /** Highlights under the certificate; Studio-managed per course, else the built-in four. */
  benefits?: EnrollBenefit[];
  /** &state= from the link: names the state in the add-on box title even when the lead course isn't state-tagged. */
  stateCode?: string | null;
  /** Studio headline / blurb in place of the lead course's name and overview (no-course default). */
  headline?: string;
  lede?: string;
  publishableKey: string;
  rating: string;
};

export default function QuickBuy(props: QuickBuyProps) {
  return (
    <Elements stripe={getStripe(props.publishableKey)}>
      <QuickBuyInner {...props} />
    </Elements>
  );
}

function QuickBuyInner({ courses, suggestions = [], prefillEmail = "", prefillName = "", prefillPromo = "", linkToken = "", benefits = DEFAULT_BENEFITS, stateCode = null, headline = "", lede = "", rating }: QuickBuyProps) {
  const stripe = useStripe();
  const elements = useElements();
  const appBase = (process.env.NEXT_PUBLIC_APP_BASE || "https://lms.train321.com").replace(/\/+$/, "");
  const appLogin = `${appBase}/#/login`;
  const lead = courses[0];

  // ── Cart: the emailed course(s) + any add-ons picked here ─────────────
  const [added, setAdded] = useState<number[]>([]);
  // One suggestion at a time; adding it slides the next one up in its place.
  const [showAllAddOns, setShowAllAddOns] = useState(false);
  const toggleAddOn = (id: number) => setAdded((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  const cart = useMemo(
    () => [...courses, ...suggestions.filter((s) => added.includes(s.id))],
    [courses, suggestions, added]
  );

  // ── Identity ──────────────────────────────────────────────────────────
  const [identity, setIdentity] = useState<Identity>(prefillEmail || linkToken ? "checking" : "unknown");
  const [email, setEmail] = useState(prefillEmail);
  const [emailLocked, setEmailLocked] = useState(Boolean(prefillEmail));
  const [accountName, setAccountName] = useState("");

  const lookUp = useCallback(async (addr: string) => {
    if (!EMAIL.test(addr.trim())) return;
    setIdentity("checking");
    try {
      const res = await fetch("/api/enroll/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: addr.trim() })
      });
      const d = (await res.json().catch(() => null)) as { exists?: boolean } | null;
      setIdentity(res.ok && d?.exists ? "existing" : "new");
    } catch {
      // Can't tell — the new-account path reports a duplicate email itself.
      setIdentity("new");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (linkToken && linkToken === DEMO_LINK) {
        setAccountName(prefillName || "Christina Rivera");
        setIdentity("link");
        return;
      }
      if (linkToken) {
        try {
          const res = await fetch("/api/enroll/link-validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: linkToken })
          });
          const d = (await res.json().catch(() => null)) as
            | { success?: boolean; full_name?: string; email?: string }
            | null;
          if (cancelled) return;
          if (res.ok && d?.success) {
            setAccountName(String(d.full_name || ""));
            if (d.email) {
              setEmail(d.email);
              setEmailLocked(true);
            }
            setIdentity("link");
            return;
          }
        } catch {
          /* an unreachable validator just means the fallback path */
        }
      }
      if (cancelled) return;
      // Already signed in on the site? The display cookie carries the name;
      // the httpOnly token stays server-side and authorises the purchase.
      try {
        const m = document.cookie.match(/(?:^|;\s*)t321_user=([^;]+)/);
        if (m) {
          const u = JSON.parse(decodeURIComponent(m[1])) as { name?: string } | null;
          if (u?.name) {
            setAccountName(String(u.name));
            setIdentity("session");
            return;
          }
        }
      } catch {
        /* a bad cosmetic cookie just means "not signed in" */
      }
      if (prefillEmail) await lookUp(prefillEmail);
      else setIdentity("unknown");
    })();
    return () => {
      cancelled = true;
    };
  }, [linkToken, prefillEmail, prefillName, lookUp]);

  const signedInPath = identity === "link" || identity === "session" || identity === "existing";

  // ── Form ──────────────────────────────────────────────────────────────
  const [fullName, setFullName] = useState(prefillName);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [bill, setBill] = useState({ address: "", city: "", state: "", zip: "" });
  const [errors, setErrors] = useState<Errors>({});
  const clearErr = (k: string) => setErrors((p) => ({ ...p, [k]: undefined }));
  const [cardComplete, setCardComplete] = useState(false);

  // ── Promo code (may arrive pre-filled from the campaign link) ─────────
  const [promoCode, setPromoCode] = useState(prefillPromo.trim());
  const [promoInput, setPromoInput] = useState("");
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  // ── Price (server-authoritative, re-quoted as add-ons / promo change) ──
  const [quote, setQuote] = useState<EnrollQuote | null>(null);
  const [quoting, setQuoting] = useState(true);
  const lines = useMemo(() => cart.map((c) => ({ id: c.id, users: 1, isSeatBased: c.isSeatBased })), [cart]);
  useEffect(() => {
    let cancelled = false;
    setQuoting(true);
    (async () => {
      try {
        const res = await fetch("/api/enroll/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lines, audience: "individual", promoCode })
        });
        const d = (await res.json()) as EnrollQuote;
        if (cancelled || !res.ok) return;
        // The backend quietly ignores a code it doesn't recognise — that's
        // our cue to say so and drop it, which re-quotes without it.
        if (promoCode && !d.promo) {
          setPromoError(`“${promoCode}” isn’t a valid or active code.`);
          setPromoInput(promoCode);
          setPromoOpen(true);
          setPromoCode("");
          return;
        }
        setQuote(d);
      } catch {
        /* fall back to list prices below */
      } finally {
        if (!cancelled) setQuoting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lines, promoCode]);
  const applyPromo = () => {
    const code = promoInput.trim();
    if (!code) return setPromoError("Enter a promo code.");
    setPromoError(null);
    setPromoCode(code);
  };
  const listTotal = cart.reduce((s, c) => s + c.price, 0);
  // A quote for an older cart must not show against the current one.
  const dueToday = quote && !quoting ? quote.dueToday : listTotal;

  // ── Submit ────────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState<{ result: CheckoutResult | null; courses: CartCourse[] } | null>(null);

  /** Account fields only — the wallet sheet supplies the card (and usually the address). */
  function validateAccount(next: Errors) {
    if (!EMAIL.test(email.trim())) next.email = "Enter a valid email address.";
    if (identity === "existing" && !password) next.password = "Enter your Train 321 password.";
    if (identity === "new") {
      if (fullName.trim().split(/\s+/).filter(Boolean).length < 2) next.fullName = "Enter your first and last name — it goes on your certificate.";
      if (password.length !== 8) next.password = "Choose a password of exactly 8 characters.";
    }
  }
  function validateBilling(next: Errors) {
    if (!signedInPath || dueToday <= 0) return;
    if (!bill.address.trim()) next.bill = "Enter your street address.";
    else if (!bill.city.trim()) next.bill = "Enter your city.";
    else if (!bill.state) next.bill = "Pick your state.";
    else if (!/^\d{5}(-\d{4})?$/.test(bill.zip.trim())) next.bill = "Enter a 5-digit ZIP.";
  }

  const purchase = async (pay: PayWith): Promise<Outcome> => {
    setSubmitError(null);
    const fail = (message: string): Outcome => ({ ok: false, message });
    if (linkToken && linkToken === DEMO_LINK) return fail("This is a preview link — nothing was charged.");

    if (signedInPath) {
      // Wallet billing address first, typed address as the fallback.
      const card = pay.kind === "wallet" ? pay.token.card : null;
      const billing = {
        billing_address: card?.address_line1 || bill.address.trim(),
        billing_city: card?.address_city || bill.city.trim(),
        billing_state: stateName(card?.address_state) || bill.state,
        billing_zip: card?.address_zip || bill.zip.trim()
      };
      if (dueToday > 0 && Object.values(billing).some((v) => !v)) {
        return fail("Add your billing address below, then try again.");
      }

      let paymentMethodId: string | null = null;
      if (dueToday > 0) {
        if (!stripe || !elements) return fail("Payment is still loading — try again in a moment.");
        const cardEl = pay.kind === "card" ? elements.getElement(CardElement) : null;
        if (pay.kind === "card" && !cardEl) return fail("The card field didn't load. Please refresh the page.");
        const { paymentMethod, error } = await stripe.createPaymentMethod({
          type: "card",
          card: pay.kind === "wallet" ? { token: pay.token.id } : cardEl!,
          billing_details: { email: email.trim() }
        });
        if (error || !paymentMethod) return fail(error?.message || "We couldn't verify that card.");
        paymentMethodId = paymentMethod.id;
      }

      const creds: Record<string, unknown> = {
        email: email.trim(),
        courses: cart.map((c) => ({ id: c.id, name: c.name })),
        promo_code: promoCode,
        ...billing
      };
      if (password) creds.password = password;
      else if (identity === "link") creds.link_token = linkToken;

      const post = async (extra: Record<string, unknown>) => {
        const res = await fetch("/api/enroll/signin-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...creds, ...extra })
        });
        return { ok: res.ok, data: (await res.json().catch(() => null)) as Record<string, unknown> | null };
      };

      let { ok, data } = await post(paymentMethodId ? { payment_method_id: paymentMethodId } : {});
      if (data?.requires_action && typeof data.client_secret === "string" && stripe) {
        const { error } = await stripe.confirmCardPayment(data.client_secret);
        if (error) return fail(error.message || "Your bank didn't approve the payment.");
        ({ ok, data } = await post({ payment_intent_id: String(data.intent_id || "") }));
      }
      if (!ok || !data?.success) {
        if (data?.need_password) setIdentity("existing");
        return fail(
          (typeof data?.message === "string" && data.message) ||
            "We couldn't complete your enrollment. Your card has not been charged."
        );
      }
      setDone({ result: null, courses: cart });
      return { ok: true };
    }

    // New account: create it and pay in one call.
    const parts = fullName.trim().split(/\s+/);
    let tokenId: string | null = null;
    if (dueToday > 0) {
      if (pay.kind === "wallet") tokenId = pay.token.id;
      else {
        if (!stripe || !elements) return fail("Payment is still loading — try again in a moment.");
        const cardEl = elements.getElement(CardElement);
        if (!cardEl) return fail("The card field didn't load. Please refresh the page.");
        const { token, error } = await stripe.createToken(cardEl, { name: fullName.trim() });
        if (error || !token) return fail(error?.message || "We couldn't verify that card.");
        tokenId = token.id;
      }
    }
    const res = await fetch("/api/enroll/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lines,
        promoCode,
        stripeTokenId: tokenId,
        cardholderName: (pay.kind === "wallet" && pay.payerName) || fullName.trim(),
        audience: "individual",
        details: {
          email: email.trim(),
          password,
          first_name: parts[0] || "",
          last_name: parts.slice(1).join(" "),
          phone: "",
          state: ""
        }
      })
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message = String(data?.message || "We couldn't complete your enrollment.");
      if (/already|exists|taken/i.test(message)) {
        setIdentity("existing");
        setPassword("");
        return fail("You already have a Train 321 account — enter your password to add these courses to it.");
      }
      return fail(message);
    }
    setDone({ result: data as CheckoutResult, courses: cart });
    return { ok: true };
  };

  // The wallet handler is registered once; it always calls the latest purchase().
  const purchaseRef = useRef(purchase);
  purchaseRef.current = purchase;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (identity === "unknown") {
      if (EMAIL.test(email.trim())) lookUp(email);
      else setErrors({ email: "Enter a valid email address." });
      return;
    }
    const next: Errors = {};
    validateAccount(next);
    validateBilling(next);
    if (dueToday > 0 && !cardComplete) next.card = "Enter your card number, expiry, CVC and ZIP.";
    setErrors(next);
    if (Object.keys(next).length) {
      document.querySelector<HTMLElement>(".v10-card .has-error input")?.focus();
      return;
    }
    // Nothing added yet → offer the suggestions once before charging.
    if (!offeredRef.current && added.length === 0 && suggestions.length > 0) {
      offeredRef.current = true;
      openOffer();
      return;
    }
    await payByCard();
  };

  const payByCard = async () => {
    setSubmitting(true);
    try {
      // Via the ref: when called right after the offer closes, this is the
      // purchase() of the render that already has the newly added courses.
      const r = await purchaseRef.current({ kind: "card" });
      if (!r.ok) setSubmitError(r.message);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── "Before you enroll" offer: the Enroll button morphs into a dialog
  //    and, on Continue, morphs back into the button and pays. ──────────
  const payBtnRef = useRef<HTMLButtonElement>(null);
  const offerRef = useRef<HTMLDivElement>(null);
  const offeredRef = useRef(false);
  const [offer, setOffer] = useState<null | "open" | "closing">(null);
  const reducedMotion = () =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // The transform that makes the dialog sit exactly on top of the button.
  const onButton = () => {
    const el = offerRef.current;
    const btn = payBtnRef.current?.getBoundingClientRect();
    if (!el || !btn) return null;
    const box = el.getBoundingClientRect();
    const dx = btn.left + btn.width / 2 - (box.left + box.width / 2);
    const dy = btn.top + btn.height / 2 - (box.top + box.height / 2);
    return `translate(${dx}px, ${dy}px) scale(${btn.width / box.width}, ${btn.height / box.height})`;
  };
  const openOffer = () => setOffer("open");
  useLayoutEffect(() => {
    if (offer !== "open" || reducedMotion()) return;
    const from = onButton();
    if (!from || !offerRef.current) return;
    offerRef.current.animate(
      [
        { transform: from, borderRadius: "12px", backgroundColor: "#0A7EA4" },
        { transform: "none", borderRadius: "20px", backgroundColor: "#ffffff" }
      ],
      { duration: 460, easing: "cubic-bezier(.2, .8, .2, 1)" }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offer]);
  useEffect(() => {
    if (offer !== "open") return;
    offerRef.current?.querySelector<HTMLElement>(".v10-offer__go")?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeOffer(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offer]);
  /** Shrink back into the Enroll button; `pay` continues straight to payment. */
  const closeOffer = (pay: boolean) => {
    const finish = () => {
      setOffer(null);
      if (pay) payByCard();
    };
    const to = onButton();
    if (!to || !offerRef.current || reducedMotion()) return finish();
    setOffer("closing");
    const anim = offerRef.current.animate(
      [
        { transform: "none", borderRadius: "20px", backgroundColor: "#ffffff" },
        { transform: to, borderRadius: "12px", backgroundColor: "#0A7EA4" }
      ],
      { duration: 380, easing: "cubic-bezier(.4, 0, .2, 1)", fill: "forwards" }
    );
    anim.onfinish = finish;
  };

  // ── Apple Pay / Google Pay (only shown where the device supports it) ──
  const [walletReq, setWalletReq] = useState<PaymentRequest | null>(null);
  const cents = Math.round(dueToday * 100);
  const walletLabel = cart.length === 1 ? lead.name : `Train 321 — ${cart.length} courses`;
  useEffect(() => {
    if (!stripe || !quote || cents <= 0 || walletReq) return;
    const pr = stripe.paymentRequest({
      country: "US",
      currency: "usd",
      total: { label: walletLabel, amount: cents },
      requestPayerName: true,
      requestPayerEmail: true
    });
    pr.on("token", async (ev) => {
      setSubmitting(true);
      try {
        const r = await purchaseRef.current({ kind: "wallet", token: ev.token, payerName: ev.payerName });
        ev.complete(r.ok ? "success" : "fail");
        if (!r.ok) setSubmitError(r.message);
      } catch (err) {
        ev.complete("fail");
        setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      } finally {
        setSubmitting(false);
      }
    });
    pr.canMakePayment().then((can) => {
      if (can) setWalletReq(pr);
    });
  }, [stripe, quote, cents, walletReq, walletLabel]);
  useEffect(() => {
    walletReq?.update({ total: { label: walletLabel, amount: cents } });
  }, [walletReq, cents, walletLabel]);

  // ── Phones: price + "Enroll" stays one tap away once the card scrolls off ──
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardInView, setCardInView] = useState(true);
  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setCardInView(entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const jumpToCheckout = () => {
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      const empty = Array.from(cardRef.current?.querySelectorAll<HTMLInputElement>("input:not([readonly]):not([type=checkbox])") || []).find((i) => !i.value);
      empty?.focus({ preventScroll: true });
    }, 450);
  };

  const knownName = identity === "link" || identity === "session" ? accountName : "";
  const certName = knownName || fullName.trim() || "Your Name";
  const firstName = (knownName || fullName).trim().split(/\s+/)[0] || "";
  const isLoading = identity === "checking";
  const openSuggestions = suggestions.filter((s) => !added.includes(s.id));
  const where = stateCode ? stateName(stateCode) : singleStateName(lead.stateLabel);
  // Admin-authored Marketplace Overview (rich text), scrubbed of anything
  // executable. Empty when the admin hasn't written one.
  const overview = lead.description ? sanitizeHtml(lead.description).trim() : "";

  return (
    <div className="v10-hero__grid">
      {/* ── The offer (head + more; on phones the checkout sits between) ── */}
      <div className="v10-head">
        <p className="v10-hello">
          {firstName ? `Hi ${firstName}, your course is ready` : "Your course is ready"}
        </p>
        <h1 className="v10-title">{headline || lead.name}</h1>
        {/* Studio copy when given (no-course default), else the admin's
            Marketplace "Overview" when one is written, else the generic
            promise. lead.name is already the marketplace name. */}
        {lede ? (
          <p className="v10-lede">{lede}</p>
        ) : overview ? (
          <div className="v10-lede v10-overview" dangerouslySetInnerHTML={{ __html: overview }} />
        ) : (
          <p className="v10-lede">
            Finish online in about an hour and download your certificate the same day{where ? ` — built for ${where} requirements` : ""}.
          </p>
        )}
        <div className="v10-rating">
          <span className="v10-stars" aria-hidden="true">★★★★★</span>
          <span><strong>{rating}</strong> from 50,000+ learners</span>
        </div>
      </div>

      <div className="v10-more">
        <figure className="v10-cert">
          <CourseCertificate courseTitle={lead.name} learnerName={certName} showExpiration={false} />
        </figure>
        {benefits.length > 0 && (
          <ul className="v10-benefits">
            {benefits.map((b, i) => (
              <li key={`${b.title}-${i}`}>
                <i className={b.icon || "fas fa-check"} aria-hidden="true" />
                <span><strong>{b.title}</strong> {b.sub}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Checkout ─────────────────────────────────────────────────── */}
      <div className="v10-card" id="v10-checkout" ref={cardRef}>
        {done ? (
          <div className="v10-done" role="status">
            <span className="v10-done__ic" aria-hidden="true"><i className="fas fa-check" /></span>
            <h2>You&rsquo;re enrolled{firstName ? `, ${firstName}` : ""}!</h2>
            <p>
              {done.courses.length === 1 ? <><strong>{lead.name}</strong> is</> : <>Your <strong>{done.courses.length} courses</strong> are</>} in your account,
              and your receipt is on its way to <strong>{done.result?.employee.email || email}</strong>.
            </p>
            <a href={done.result?.loginUrl || appLogin} className="v10-btn v10-btn--pay">
              Start my course <i className="fas fa-arrow-right" aria-hidden="true" />
            </a>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <div className="v10-card__head">
              <h2>Complete your enrollment</h2>
              <span><i className="fas fa-lock" aria-hidden="true" /> Secure</span>
            </div>

            {/* Order */}
            <ul className="v10-lines">
              {cart.map((c, i) => (
                <li key={c.id} className="v10-line">
                  <span className="v10-line__thumb">
                    {c.image ? <img src={c.image} alt="" /> : <i className="fas fa-certificate" aria-hidden="true" />}
                  </span>
                  <span className="v10-line__name">
                    {c.name}
                    {i >= courses.length ? (
                      <button type="button" className="v10-line__remove" onClick={() => toggleAddOn(c.id)}>Remove</button>
                    ) : c.stateLabel ? (
                      <small>{c.stateLabel}</small>
                    ) : null}
                  </span>
                  <span className="v10-line__price">{money(c.price)}</span>
                </li>
              ))}
            </ul>

            {/* Promo code */}
            {promoCode && quote?.promo ? (
              <div className="v10-promo-on">
                <span className="v10-promo-on__code">
                  <i className="fas fa-tag" aria-hidden="true" /> {promoCode}
                  <button type="button" className="v10-textbtn" onClick={() => { setPromoCode(""); setPromoInput(""); setPromoOpen(false); }}>Remove</button>
                </span>
                <span className="v10-promo-on__off">−{money(quote.discount)}</span>
              </div>
            ) : promoOpen ? (
              <div className={`v10-promo${promoError ? " has-error" : ""}`}>
                <div className="v10-promo__row">
                  <input
                    type="text"
                    autoCapitalize="characters"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="Promo code"
                    aria-label="Promo code"
                    autoFocus
                    value={promoInput}
                    onChange={(e) => { setPromoInput(e.target.value); setPromoError(null); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyPromo(); } }}
                  />
                  <button type="button" className="v10-promo__apply" onClick={applyPromo} disabled={quoting && Boolean(promoCode)}>
                    {quoting && promoCode ? <span className="v10-spin v10-spin--dark" aria-hidden="true" /> : "Apply"}
                  </button>
                </div>
                {promoError && <em className="v10-err" role="alert">{promoError}</em>}
              </div>
            ) : (
              <button type="button" className="v10-promo-link" onClick={() => setPromoOpen(true)}>
                Have a promo code?
              </button>
            )}

            <div className="v10-total">
              <span>Total today</span>
              <strong aria-live="polite">{money(dueToday)}</strong>
            </div>

            {/* Who's buying — decided from the link, not asked */}
            <div className="v10-who">
              {isLoading ? (
                <p className="v10-checking"><span className="v10-spin v10-spin--dark" aria-hidden="true" /> Finding your account…</p>
              ) : identity === "link" || identity === "session" ? (
                <div className="v10-member">
                  <span className="v10-avatar" aria-hidden="true">{(accountName || email).charAt(0).toUpperCase()}</span>
                  <span className="v10-member__text">
                    <strong>{accountName || email}</strong>
                    <small>{email}</small>
                  </span>
                  <button type="button" className="v10-textbtn" onClick={() => { setEmailLocked(false); setAccountName(""); setIdentity("unknown"); }}>
                    Not you?
                  </button>
                </div>
              ) : (
                <>
                  <label className={`v10-field${errors.email ? " has-error" : ""}`}>
                    <span className="v10-field__label">Email</span>
                    <span className="v10-field__wrap">
                      <input
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        placeholder="you@example.com"
                        value={email}
                        readOnly={emailLocked}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          clearErr("email");
                          if (identity !== "unknown") setIdentity("unknown");
                        }}
                        onBlur={() => identity === "unknown" && lookUp(email)}
                      />
                      {emailLocked && (
                        <button type="button" className="v10-field__aside" onClick={() => { setEmailLocked(false); setIdentity("unknown"); setPassword(""); }}>
                          Change
                        </button>
                      )}
                    </span>
                    {errors.email && <em className="v10-err">{errors.email}</em>}
                  </label>

                  {identity === "existing" && (
                    <label className={`v10-field${errors.password ? " has-error" : ""}`}>
                      <span className="v10-field__label">
                        Password
                        <a href={`${appLogin}?forgot=1`} target="_blank" rel="noopener noreferrer">Forgot?</a>
                      </span>
                      <span className="v10-field__wrap">
                        <input type={showPw ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => { setPassword(e.target.value); clearErr("password"); }} />
                        <button type="button" className="v10-field__aside" onClick={() => setShowPw((s) => !s)}>{showPw ? "Hide" : "Show"}</button>
                      </span>
                      {errors.password ? <em className="v10-err">{errors.password}</em> : <small>Welcome back — we&rsquo;ll add this to your existing account.</small>}
                    </label>
                  )}

                  {identity === "new" && (
                    <>
                      <label className={`v10-field${errors.fullName ? " has-error" : ""}`}>
                        <span className="v10-field__label">Full name</span>
                        <input type="text" autoComplete="name" autoCapitalize="words" value={fullName} onChange={(e) => { setFullName(e.target.value); clearErr("fullName"); }} />
                        {errors.fullName ? <em className="v10-err">{errors.fullName}</em> : <small>Printed on your certificate.</small>}
                      </label>
                      <label className={`v10-field${errors.password ? " has-error" : ""}`}>
                        <span className="v10-field__label">
                          Create a password
                          <span className={password.length === 8 ? "v10-count is-ok" : "v10-count"}>{password.length}/8</span>
                        </span>
                        <span className="v10-field__wrap">
                          <input type={showPw ? "text" : "password"} autoComplete="new-password" maxLength={8} value={password} onChange={(e) => { setPassword(e.target.value); clearErr("password"); }} />
                          <button type="button" className="v10-field__aside" onClick={() => setShowPw((s) => !s)}>{showPw ? "Hide" : "Show"}</button>
                        </span>
                        {errors.password && <em className="v10-err">{errors.password}</em>}
                      </label>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Payment */}
            {!isLoading && identity !== "unknown" && dueToday > 0 && (
              <div className="v10-payment">
                {walletReq && (
                  <>
                    <PaymentRequestButtonElement
                      options={{ paymentRequest: walletReq, style: { paymentRequestButton: { type: "buy", theme: "dark", height: "50px" } } }}
                      onClick={(e) => {
                        const next: Errors = {};
                        validateAccount(next);
                        setErrors(next);
                        if (Object.keys(next).length) e.preventDefault();
                      }}
                    />
                    <div className="v10-or"><span>or pay with card</span></div>
                  </>
                )}
                <div className={`v10-field${errors.card ? " has-error" : ""}`}>
                  <span className="v10-field__label">
                    Card
                    <span className="v10-cards" aria-label="Visa, Mastercard, American Express, Discover">
                      <i className="fab fa-cc-visa" /><i className="fab fa-cc-mastercard" /><i className="fab fa-cc-amex" /><i className="fab fa-cc-discover" />
                    </span>
                  </span>
                  <div className="v10-cardel">
                    <CardElement
                      options={{
                        style: {
                          base: { fontSize: "16px", color: "#0B1F33", fontFamily: "Inter, system-ui, sans-serif", "::placeholder": { color: "#8A97A6" } },
                          invalid: { color: "#9D1F2A" }
                        }
                      }}
                      onChange={(ev) => {
                        setCardComplete(ev.complete);
                        setErrors((p) => ({ ...p, card: ev.error?.message }));
                      }}
                    />
                  </div>
                  {errors.card && <em className="v10-err">{errors.card}</em>}
                </div>

                {signedInPath && (
                  <div className={`v10-field${errors.bill ? " has-error" : ""}`}>
                    <span className="v10-field__label">Billing address</span>
                    <div className="v10-addr">
                      <input className="v10-addr__street" type="text" autoComplete="address-line1" placeholder="Street address" aria-label="Street address" value={bill.address} onChange={(e) => { setBill((b) => ({ ...b, address: e.target.value })); clearErr("bill"); }} />
                      <input type="text" autoComplete="address-level2" placeholder="City" aria-label="City" value={bill.city} onChange={(e) => { setBill((b) => ({ ...b, city: e.target.value })); clearErr("bill"); }} />
                      <select autoComplete="address-level1" aria-label="State" value={bill.state} className={bill.state ? "" : "is-empty"} onChange={(e) => { setBill((b) => ({ ...b, state: e.target.value })); clearErr("bill"); }}>
                        <option value="">State</option>
                        {US_STATES.map((s) => <option key={s.code} value={s.name}>{s.code}</option>)}
                      </select>
                      <input type="text" inputMode="numeric" autoComplete="postal-code" placeholder="ZIP" aria-label="ZIP code" maxLength={10} value={bill.zip} onChange={(e) => { setBill((b) => ({ ...b, zip: e.target.value })); clearErr("bill"); }} />
                    </div>
                    {errors.bill && <em className="v10-err">{errors.bill}</em>}
                  </div>
                )}
              </div>
            )}

            {/* Add-ons */}
            {openSuggestions.length > 0 && (
              <div className="v10-addons">
                <p className="v10-addons__title">
                  <i className="fas fa-star" aria-hidden="true" />
                  {where ? `Often added by ${where} workers` : "Popular with other learners"}
                </p>
                {(showAllAddOns ? openSuggestions : openSuggestions.slice(0, 1)).map((s) => (
                  <button key={s.id} type="button" className="v10-addon" onClick={() => toggleAddOn(s.id)}>
                    <span className="v10-addon__thumb">
                      {s.image ? <img src={s.image} alt="" /> : <i className="fas fa-certificate" aria-hidden="true" />}
                    </span>
                    <span className="v10-addon__name">
                      {s.name}
                      <small>{money(s.price)}</small>
                    </span>
                    <span className="v10-addon__add">Add</span>
                  </button>
                ))}
                {openSuggestions.length > 1 && (
                  <button type="button" className="v10-addons__more" onClick={() => setShowAllAddOns((v) => !v)}>
                    {showAllAddOns ? "Show less" : `View ${openSuggestions.length - 1} more`}
                    <i className={showAllAddOns ? "fas fa-chevron-up" : "fas fa-chevron-down"} aria-hidden="true" />
                  </button>
                )}
              </div>
            )}

            <button ref={payBtnRef} type="submit" className="v10-btn v10-btn--pay" disabled={submitting || isLoading || offer !== null}>
              {submitting ? (
                <><span className="v10-spin" aria-hidden="true" /> Processing…</>
              ) : identity === "unknown" ? (
                <>Continue <i className="fas fa-arrow-right" aria-hidden="true" /></>
              ) : (
                <><i className="fas fa-lock" aria-hidden="true" /> Enroll now</>
              )}
            </button>
            {submitError && (
              <p className="v10-submit-err" role="alert"><i className="fas fa-circle-exclamation" aria-hidden="true" /> {submitError}</p>
            )}

            <ul className="v10-assure">
              <li><i className="fas fa-lock" aria-hidden="true" /> Encrypted checkout by Stripe</li>
              <li><i className="fas fa-bolt" aria-hidden="true" /> Instant access</li>
            </ul>
          </form>
        )}
      </div>

      {offer && (
        <div className={`v10-offer${offer === "closing" ? " is-closing" : ""}`}>
          <div className="v10-offer__scrim" onClick={() => closeOffer(false)} aria-hidden="true" />
          <div ref={offerRef} className="v10-offer__box" role="dialog" aria-modal="true" aria-labelledby="v10-offer-title">
            <div className="v10-offer__inner">
              <button type="button" className="v10-offer__x" onClick={() => closeOffer(false)} aria-label="Back to checkout">
                <i className="fas fa-xmark" aria-hidden="true" />
              </button>
              <h2 id="v10-offer-title">Add these while you&rsquo;re here?</h2>
              <p className="v10-offer__sub">
                {where ? `${where} workers often need these too.` : "Often taken together."} They go into the same account, in one checkout.
              </p>
              <ul className="v10-offer__list">
                {suggestions.map((s) => {
                  const on = added.includes(s.id);
                  return (
                    <li key={s.id} className={on ? "is-on" : undefined}>
                      <span className="v10-addon__thumb">
                        {s.image ? <img src={s.image} alt="" /> : <i className="fas fa-certificate" aria-hidden="true" />}
                      </span>
                      <span className="v10-addon__name">
                        {s.name}
                        <small>{money(s.price)}</small>
                      </span>
                      <button type="button" className="v10-offer__toggle" aria-pressed={on} onClick={() => toggleAddOn(s.id)}>
                        {on ? <><i className="fas fa-check" aria-hidden="true" /> Added</> : "Add"}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="v10-offer__total">
                <span>Total today</span>
                <strong>{money(dueToday)}</strong>
              </div>
              <button type="button" className="v10-btn v10-btn--pay v10-offer__go" onClick={() => closeOffer(true)}>
                <i className="fas fa-lock" aria-hidden="true" />
                {added.length ? `Enroll in ${cart.length} courses` : "Continue to enroll"}
              </button>
            </div>
          </div>
        </div>
      )}

      {!done && !cardInView && (
        <div className="v10-sticky" role="region" aria-label="Checkout">
          <span className="v10-sticky__price">
            <small>{cart.length === 1 ? lead.name : `${cart.length} courses`}</small>
            <strong>{money(dueToday)}</strong>
          </span>
          <button type="button" className="v10-btn v10-btn--pay" onClick={jumpToCheckout}>
            Enroll now
          </button>
        </div>
      )}
    </div>
  );
}

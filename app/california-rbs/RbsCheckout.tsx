"use client";

// California RBS ad page checkout — the first screen of the page: the
// certificate they'll earn on a wide left side; the cart (courses, promo,
// total, add-ons) and the checkout (contact, payment, Pay) together on the
// right. Phones stack it: certificate, cart, contact, payment, pay.
//
// Same behaviour as /enrollment, on this page's own routes
// (/api/ads/ca-rbs/*, never the shared /enroll ones):
//   - the cart starts with the URL's courses (?ids=, else California RBS);
//   - any line can be removed (one always stays), add-ons can be added and
//     land on top;
//   - the email is checked as it's typed: a new buyer gets name + new
//     password, an existing one their password (and billing address).
// The LMS re-checks every course and computes every price.

import { useEffect, useMemo, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import CourseCertificate from "@/components/CourseCertificate";
import { RBS_NAME_EVENT } from "./HeroCertificate";
import { trackBeginCheckout, trackPurchase } from "@/lib/analytics";
import type { BuyerAudience, CartCourse, CheckoutResult, EnrollQuote, InvoiceCadence } from "@/lib/enroll";

type Identity = "unknown" | "checking" | "new" | "existing";
type Quote = { subtotal: number; discount: number; dueToday: number; promo: { name: string } | null };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ATTR_KEY = "t321.ads.ca-rbs.attr";
const ATTR_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"];
/** Same placeholder the storefront uses (lib/newFeatures COURSE_PLACEHOLDER_IMAGE). */
const COURSE_PLACEHOLDER_IMAGE = "/img/course-placeholder.svg";/** Add-on chips shown before "+N more". */
const CHIPS_SHOWN = 2;
/** How long typing has to pause before the email is checked. */
const EMAIL_CHECK_DELAY = 300;
/** Give up on a slow email check after this long and carry on as a new buyer
 *  (the new-account checkout still refuses an email that already exists). */
const EMAIL_CHECK_TIMEOUT = 5000;
/** Show the "Just me / My team" switch. Off: the page always sells to
 *  individuals ("Just me"); the team checkout code stays for later. */
const SHOW_TEAM_OPTION = false;
/** A team account starts at 5 employees (and 1 location). */
const MIN_EMPLOYEES = 5;

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

/**
 * Which ad brought this visitor: UTM tags, Google/Meta click ids, the landing
 * URL and referrer. First touch per browser session, so a reload or a second
 * visit in the same session keeps the original ad.
 */
function captureAttribution(): Record<string, string> {
  try {
    const saved = window.sessionStorage.getItem(ATTR_KEY);
    if (saved) return JSON.parse(saved) as Record<string, string>;
  } catch {
    /* storage unavailable — capture fresh */
  }
  const params = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  for (const k of ATTR_PARAMS) {
    const v = params.get(k);
    if (v) out[k] = v.slice(0, 255);
  }
  out.landing_url = window.location.href.slice(0, 500);
  if (document.referrer) out.referrer = document.referrer.slice(0, 500);
  try {
    window.sessionStorage.setItem(ATTR_KEY, JSON.stringify(out));
  } catch {
    /* ignore */
  }
  return out;
}

let stripePromise: ReturnType<typeof loadStripe> | null = null;
let stripeKeyLoaded = "";
function getStripe(key: string) {
  if (!key) return null;
  if (!stripePromise || stripeKeyLoaded !== key) {
    stripePromise = loadStripe(key);
    stripeKeyLoaded = key;
  }
  return stripePromise;
}

type Props = {
  /** The URL's courses (or California RBS when the URL names none). */
  courses: CartCourse[];
  /** "Add to your order" suggestions. */
  suggestions?: CartCourse[];
  publishableKey: string;
  /** Line under the "Checkout" heading (what's being bought). */
  subtitle: string;
  /** Studio copy (California RBS Ad Page). Blank → the built-in wording. */
  certificateNote?: string;
  checkoutHeading?: string;
  prefillEmail?: string;
  prefillName?: string;
  prefillPromo?: string;
  /** The link's state (?state=), used for the new account's profile. */
  stateCode?: string | null;
  /** True when the page sells California RBS (no ids in the URL): shows its inclusions. */
  isRbsDefault?: boolean;
  /**
   * Test run (?demo=1, locally and on the live site). Walks the whole flow
   * without the LMS or Stripe: no account, no charge, no attribution, no
   * analytics. Quotes stay real (read-only).
   */
  demo?: boolean;
  /** A short learner review shown under the order summary (the page's testimonial). */
  review?: { text: string; name: string; role?: string };
};

export default function RbsCheckout(props: Props) {
  return (
    <Elements stripe={getStripe(props.publishableKey)}>
      <CheckoutForm {...props} />
    </Elements>
  );
}

function CheckoutForm({
  courses,
  suggestions = [],
  subtitle,
  certificateNote,
  checkoutHeading,
  prefillEmail = "",
  prefillName = "",
  prefillPromo = "",
  stateCode = null,
  isRbsDefault = false,
  demo = false,
  review
}: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const attribution = useRef<Record<string, string>>({});
  useEffect(() => {
    attribution.current = captureAttribution();
  }, []);

  // ── Cart: the URL's courses + any add-ons picked here ─────────────────
  const [added, setAdded] = useState<number[]>([]);
  const [removed, setRemoved] = useState<number[]>([]);
  const linkedIds = useMemo(() => new Set(courses.map((c) => c.id)), [courses]);
  const cart = useMemo(
    () => [
      ...[...added].reverse().map((id) => suggestions.find((s) => s.id === id)).filter((s): s is CartCourse => Boolean(s)),
      ...courses.filter((c) => !removed.includes(c.id))
    ],
    [courses, suggestions, added, removed]
  );
  // The certificate preview shows the first course the link named.
  const lead = cart.find((c) => linkedIds.has(c.id)) ?? cart[0] ?? courses[0];
  const certTitle = isRbsDefault && lead?.id === courses[0]?.id ? "California RBS Training" : lead?.name || subtitle;
  const removeLine = (id: number) => {
    if (cart.length <= 1) return;
    if (linkedIds.has(id)) setRemoved((r) => [...r, id]);
    else setAdded((a) => a.filter((x) => x !== id));
  };
  const addLine = (id: number) => {
    if (linkedIds.has(id)) setRemoved((r) => r.filter((x) => x !== id));
    else setAdded((a) => (a.includes(id) ? a : [...a, id]));
  };
  // Courses this buyer already holds, learned when the LMS refused to sell
  // them again (it refuses before any charge). If that's the whole cart there
  // is nothing left to buy, so the "already enrolled" screen shows instead.
  const [heldIds, setHeldIds] = useState<number[]>([]);
  const alreadyEnrolled = heldIds.length > 0 && cart.length > 0 && cart.every((c) => heldIds.includes(c.id));
  const openSuggestions = [
    ...courses.filter((c) => removed.includes(c.id)),
    ...suggestions.filter((s) => !added.includes(s.id) && !linkedIds.has(s.id))
  ].filter((s) => !heldIds.includes(s.id));
  const [addOpen, setAddOpen] = useState(false);
  const courseIds = cart.map((c) => c.id);
  const idsKey = courseIds.join(",");

  // ── Who it's for: just me (this page's own checkout) or my team ──────
  // "My team" works exactly like the marketing cart's company checkout: it is
  // priced and bought through the same /api/enroll/quote + /api/enroll/checkout
  // routes (employees × locations, yearly/monthly subscription for compliance
  // courses, seats for seat-based ones, an admin account).
  const [audience, setAudience] = useState<BuyerAudience>("individual");
  const isCompany = audience === "company";
  const [companyName, setCompanyName] = useState("");
  const [employees, setEmployees] = useState(MIN_EMPLOYEES);
  const [locations, setLocations] = useState(1);
  const [cadence, setCadence] = useState<InvoiceCadence>("yearly");
  // Seat-based courses default to one seat per employee unless changed.
  const [seatOverride, setSeatOverride] = useState<Record<number, number>>({});
  const seatsFor = (c: CartCourse) => (c.isSeatBased ? Math.max(1, seatOverride[c.id] ?? employees) : 1);
  const [billingDifferent, setBillingDifferent] = useState(false);
  const [billing, setBilling] = useState({ first_name: "", last_name: "", email: "", phone: "" });
  const hasCompliance = cart.some((c) => !c.isSeatBased);
  const needsSubscription = isCompany && hasCompliance;
  const companyLines = cart.map((c) => ({ id: c.id, users: seatsFor(c), isSeatBased: Boolean(c.isSeatBased) }));
  const companyKey = companyLines.map((l) => `${l.id}:${l.users}:${l.isSeatBased ? 1 : 0}`).join("|");

  // ── Price ────────────────────────────────────────────────────────────
  const [promoCode, setPromoCode] = useState(prefillPromo.trim());
  const [promoOpen, setPromoOpen] = useState(Boolean(prefillPromo));
  const [promoInput, setPromoInput] = useState(prefillPromo);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(true);

  // Company quote — the marketing cart's own pricing route.
  const [cQuote, setCQuote] = useState<EnrollQuote | null>(null);
  const [cQuoting, setCQuoting] = useState(false);
  useEffect(() => {
    if (!isCompany) return;
    let cancelled = false;
    setCQuoting(true);
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch("/api/enroll/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lines: companyLines, audience: "company", employees, locations, promoCode })
        });
        const d = (await res.json()) as EnrollQuote;
        if (cancelled || !res.ok) return;
        if (promoCode && !d.promo) {
          setPromoError(`"${promoCode}" isn't a valid or active code.`);
          setPromoCode("");
          return;
        }
        setCQuote(d);
      } catch {
        /* keep the last quote */
      } finally {
        if (!cancelled) setCQuoting(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompany, companyKey, employees, locations, promoCode]);

  useEffect(() => {
    if (isCompany) return;
    let cancelled = false;
    setQuoting(true);
    (async () => {
      try {
        const res = await fetch("/api/ads/ca-rbs/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ promo_code: promoCode, course_ids: idsKey.split(",").map(Number) })
        });
        const d = (await res.json()) as Quote;
        if (cancelled || !res.ok) return;
        if (promoCode && !d.promo) {
          setPromoError(`"${promoCode}" isn't a valid or active code.`);
          setPromoCode("");
          return;
        }
        setQuote(d);
      } catch {
        /* keep the list prices shown */
      } finally {
        if (!cancelled) setQuoting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [promoCode, idsKey, isCompany]);
  // Close the promo box (or drop an applied code) and go back to the link.
  const closePromo = () => {
    setPromoOpen(false);
    setPromoInput("");
    setPromoError(null);
    setPromoCode("");
  };
  const listTotal = cart.reduce((s, c) => s + c.price, 0);
  const priced = quote && !quoting;
  // Company: the chosen cadence's view — first invoice due today, renewals
  // at the full ongoing rate (same numbers the marketing cart shows).
  const cq = cQuote ? (cadence === "yearly" ? cQuote.yearly : cQuote.monthly) : null;
  const cadenceUnit = cadence === "yearly" ? "yr" : "mo";
  const subtotal = isCompany ? (cq?.subtotal ?? 0) : priced ? quote.subtotal : listTotal;
  const discount = isCompany ? (cq?.discount ?? 0) : priced ? quote.discount : 0;
  const dueToday = isCompany ? (cq?.dueToday ?? 0) : priced ? quote.dueToday : listTotal;
  const appliedPromo = isCompany ? cQuote?.promo : quote?.promo;
  // A company subscription always needs a card on file, even at $0 today.
  const needsCard = dueToday > 0 || needsSubscription;
  const pricing = isCompany ? cQuoting || !cQuote : quoting;

  // ── Who's buying ─────────────────────────────────────────────────────
  const [email, setEmail] = useState(prefillEmail);
  const [identity, setIdentity] = useState<Identity>("unknown");
  const checkedFor = useRef("");
  // Answers already fetched this visit, so going back to an email is instant.
  const seen = useRef(new Map<string, Identity>());
  const lookUp = async (addr: string) => {
    const a = addr.trim();
    if (!EMAIL.test(a) || checkedFor.current === a.toLowerCase()) return;
    checkedFor.current = a.toLowerCase();
    const cached = seen.current.get(a.toLowerCase());
    if (cached) {
      setIdentity(cached);
      return;
    }
    setIdentity("checking");
    if (demo) {
      // Demo: no LMS call. An email starting with "existing" plays a returning buyer.
      await new Promise((r) => window.setTimeout(r, 500));
      setIdentity(/^(existing|enrolled)/i.test(a) ? "existing" : "new");
      return;
    }
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), EMAIL_CHECK_TIMEOUT);
    try {
      const res = await fetch("/api/ads/ca-rbs/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: a }),
        signal: ctrl.signal
      });
      const d = (await res.json()) as { exists?: boolean; unknown?: boolean };
      const who: Identity = d.exists ? "existing" : "new";
      if (!d.unknown) seen.current.set(a.toLowerCase(), who);
      // Ignore a late answer for an email they've since changed.
      if (checkedFor.current === a.toLowerCase()) setIdentity(who);
    } catch {
      if (checkedFor.current === a.toLowerCase()) setIdentity("new");
    } finally {
      window.clearTimeout(timer);
    }
  };
  // Checked as they type (once they pause), so there's no "Continue" step.
  // After "Change", the same address isn't re-checked until it's edited.
  const skipAuto = useRef("");
  useEffect(() => {
    if (identity !== "unknown") return;
    const a = email.trim();
    if (!EMAIL.test(a) || a.toLowerCase() === skipAuto.current) return;
    const t = window.setTimeout(() => lookUp(a), EMAIL_CHECK_DELAY);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, identity]);

  // Back to an editable email (wrong address, or their account uses another one).
  const emailRef = useRef<HTMLInputElement>(null);
  const changeEmail = () => {
    skipAuto.current = email.trim().toLowerCase();
    checkedFor.current = "";
    setIdentity("unknown");
    setPassword("");
    setError(null);
    window.setTimeout(() => {
      emailRef.current?.focus();
      emailRef.current?.select();
    }, 0);
  };

  const [first0, ...rest0] = prefillName.trim().split(/\s+/);
  const [firstName, setFirstName] = useState(first0 || "");
  const [lastName, setLastName] = useState(rest0.join(" "));
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [billState, setBillState] = useState(stateCode || "CA");
  const certName = `${firstName} ${lastName}`.trim();
  // The hero's live certificate hands its name over ("Get this certificate"):
  // fill first/last name, then put the cursor in the email field.
  useEffect(() => {
    const onName = (e: Event) => {
      const full = String((e as CustomEvent<{ name?: string }>).detail?.name || "").trim();
      if (full) {
        const [f, ...rest] = full.split(/\s+/);
        setFirstName(f);
        setLastName(rest.join(" "));
      }
      window.setTimeout(() => {
        if (!emailRef.current?.readOnly) emailRef.current?.focus({ preventScroll: true });
      }, 650);
    };
    window.addEventListener(RBS_NAME_EVENT, onName);
    return () => window.removeEventListener(RBS_NAME_EVENT, onName);
  }, []);
  // Stripe tells us when the card number, expiry, CVC and ZIP are all valid.
  const [cardComplete, setCardComplete] = useState(false);

  // ── Submit ───────────────────────────────────────────────────────────
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<CartCourse[] | null>(null);
  // Company purchase result (its admin sign-in link) from the cart's checkout.
  const [companyDone, setCompanyDone] = useState<CheckoutResult | null>(null);
  const startedCheckout = useRef(false);
  const items = cart.map((c) => ({
    item_id: String(c.id),
    item_name: c.name,
    price: c.price,
    quantity: 1,
    item_category: c.isSeatBased ? "Seat-based" : "Compliance"
  }));

  const fail = (msg: string) => {
    setError(msg);
    setBusy(false);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (cart.length === 0) return fail("Add a course to continue.");
    if (!startedCheckout.current && !demo) {
      startedCheckout.current = true;
      trackBeginCheckout(items, dueToday);
    }

    const addr = email.trim();
    if (!EMAIL.test(addr)) return fail("Enter a valid email address.");
    if (identity === "unknown" || identity === "checking") {
      await lookUp(addr);
      return;
    }
    // New learners only — an existing account can't buy here.
    if (identity === "existing") return fail("This email already has a Train 321 account. Use a different email to continue.");
    if (identity === "new") {
      if (!firstName.trim() || !lastName.trim()) return fail("Enter your first and last name as they should appear on your certificate.");
      if (password.length < 8) return fail("Choose a password with at least 8 characters.");
    } else if (!password) {
      return fail("Enter your Train 321 password.");
    }
    if (isCompany) {
      if (!companyName.trim()) return fail("Enter your company name.");
      if (billingDifferent) {
        if (!billing.first_name.trim() || !billing.last_name.trim()) return fail("Enter the billing contact's first and last name.");
        if (!EMAIL.test(billing.email.trim())) return fail("Enter a valid billing email address.");
      }
      if (pricing) return fail("Updating your total — try again in a moment.");
    }

    setBusy(true);
    if (demo && isCompany) {
      // Demo: pretend to process, then show the success screen. Nothing is sent.
      await new Promise((r) => window.setTimeout(r, 1200));
      setBusy(false);
      setDone(cart);
      return;
    }
    if (isCompany) {
      // Company: the marketing cart's own checkout — company account + admin,
      // subscription for compliance courses, seats for seat-based ones.
      const companyCard = elements?.getElement(CardElement) ?? null;
      let tokenId: string | null = null;
      if (needsCard) {
        if (!stripe || !companyCard) return fail("Payment is still loading. Try again in a moment.");
        const { token, error: tokErr } = await stripe.createToken(companyCard, { name: `${firstName.trim()} ${lastName.trim()}` });
        if (tokErr || !token) return fail(tokErr?.message || "We couldn't verify that card.");
        tokenId = token.id;
      }
      try {
        const res = await fetch("/api/enroll/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lines: companyLines,
            promoCode,
            stripeTokenId: tokenId,
            cardholderName: `${firstName.trim()} ${lastName.trim()}`,
            audience: "company",
            employees,
            locations,
            cadence,
            companyName: companyName.trim(),
            billing: billingDifferent
              ? {
                  first_name: billing.first_name.trim(),
                  last_name: billing.last_name.trim(),
                  email: billing.email.trim(),
                  phone: billing.phone.trim()
                }
              : null,
            details: { email: addr, password, first_name: firstName.trim(), last_name: lastName.trim() }
          })
        });
        const d = (await res.json().catch(() => null)) as (CheckoutResult & { message?: string }) | null;
        if (!res.ok || !d?.employee) {
          return fail(d?.message || "We couldn't complete your enrollment. Your card has not been charged.");
        }
        trackPurchase({
          transactionId: d.chargeId || d.subscription?.id || `ca-rbs-co-${d.employee.id}`,
          value: Number(d.amount || 0),
          items,
          ...(promoCode ? { coupon: promoCode } : {})
        });
        setCompanyDone(d);
        setBusy(false);
        setDone(cart);
      } catch {
        fail("We couldn't reach the enrollment service. Your card has not been charged.");
      }
      return;
    }
    if (demo) {
      // Demo: pretend to process, then show the success screen. Nothing is sent.
      // An email starting with "enrolled" plays a buyer who already has the course.
      await new Promise((r) => window.setTimeout(r, 1200));
      setBusy(false);
      if (/^enrolled/i.test(addr)) setHeldIds(courseIds);
      else setDone(cart);
      return;
    }
    const card = elements?.getElement(CardElement) ?? null;
    if (dueToday > 0 && (!stripe || !card)) return fail("Payment is still loading. Try again in a moment.");

    let chargeId: string | null = null;
    let amount = dueToday;

    if (identity === "new") {
      let cardToken = "";
      if (dueToday > 0) {
        const { token, error: tokErr } = await stripe!.createToken(card!, {
          name: `${firstName.trim()} ${lastName.trim()}`
        });
        if (tokErr || !token) return fail(tokErr?.message || "We couldn't verify that card.");
        cardToken = token.id;
      }
      const res = await fetch("/api/ads/ca-rbs/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: addr,
          password,
          state: stateCode || "CA",
          card_token: cardToken,
          card_name: `${firstName.trim()} ${lastName.trim()}`,
          promo_code: promoCode,
          course_ids: courseIds,
          attribution: attribution.current
        })
      });
      const d = (await res.json().catch(() => null)) as { success?: boolean; message?: string; chargeId?: string; amount?: number } | null;
      if (!res.ok || !d?.success) return fail(d?.message || "We couldn't complete your enrollment. Your card has not been charged.");
      chargeId = d.chargeId ?? null;
      amount = Number(d.amount ?? amount);
    } else {
      let paymentMethodId = "";
      let zip = "";
      if (dueToday > 0) {
        const { paymentMethod, error: pmErr } = await stripe!.createPaymentMethod({
          type: "card",
          card: card!,
          billing_details: { email: addr, address: { line1: address.trim(), city: city.trim(), state: billState.trim() } }
        });
        if (pmErr || !paymentMethod) return fail(pmErr?.message || "We couldn't verify that card.");
        paymentMethodId = paymentMethod.id;
        zip = paymentMethod.billing_details?.address?.postal_code || "";
      }
      const creds = {
        email: addr,
        password,
        promo_code: promoCode,
        billing_address: address.trim(),
        billing_city: city.trim(),
        billing_state: billState.trim() || "CA",
        billing_zip: zip,
        course_ids: courseIds,
        attribution: attribution.current
      };
      const post = async (extra: Record<string, string>) => {
        const res = await fetch("/api/ads/ca-rbs/signin-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...creds, ...extra })
        });
        return { ok: res.ok, d: (await res.json().catch(() => null)) as Record<string, unknown> | null };
      };
      let { ok, d } = await post(paymentMethodId ? { payment_method_id: paymentMethodId } : {});
      if (d?.requires_action && typeof d.client_secret === "string" && stripe) {
        const { error: scaErr } = await stripe.confirmCardPayment(d.client_secret);
        if (scaErr) return fail(scaErr.message || "Your bank didn't approve the payment.");
        ({ ok, d } = await post({ payment_intent_id: String(d.intent_id || "") }));
      }
      if (!ok || !d?.success) {
        if (d?.already_enrolled) {
          // Nothing was charged. Keep the courses they already have out of the
          // order: all of them → "already enrolled" screen; some → drop those
          // lines and let them pay for the rest.
          const refused = Array.isArray(d.refused_course_ids) ? (d.refused_course_ids as unknown[]).map(Number) : [];
          const held = refused.length ? refused : courseIds;
          setHeldIds((h) => Array.from(new Set([...h, ...held])));
          if (cart.every((c) => held.includes(c.id))) {
            setBusy(false);
            return;
          }
          const names = cart.filter((c) => held.includes(c.id)).map((c) => c.name);
          setRemoved((r) => Array.from(new Set([...r, ...courses.filter((c) => held.includes(c.id)).map((c) => c.id)])));
          setAdded((a) => a.filter((id) => !held.includes(id)));
          return fail(
            `You're already enrolled in ${names.join(" and ")}, so we took ${names.length === 1 ? "it" : "them"} out of your order. Your card has not been charged — check the new total and pay again.`
          );
        }
        return fail((typeof d?.message === "string" && d.message) || "We couldn't complete your enrollment. Your card has not been charged.");
      }
      chargeId = (d.chargeId as string | null) ?? null;
      amount = Number(d.amount ?? amount);
    }

    trackPurchase({
      transactionId: chargeId || `ca-rbs-${Date.now()}`,
      value: amount,
      items,
      ...(promoCode ? { coupon: promoCode } : {})
    });
    setBusy(false);
    setDone(cart);
  };

  // The success panel is much shorter than the checkout it replaces, so the
  // page would be left scrolled down past it. Bring it into view (smoothly,
  // unless the visitor prefers reduced motion) and put focus on it.
  const doneRef = useRef<HTMLDivElement>(null);
  const finished = Boolean(done) || alreadyEnrolled;
  useEffect(() => {
    if (!finished) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    // The checkout is mid-page now, so bring the success panel itself into view.
    doneRef.current?.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
    doneRef.current?.focus({ preventScroll: true });
    // Nothing left to buy: the page's "Enroll now" buttons step aside (rbs.css).
    const page = doneRef.current?.closest(".t321-rbs");
    page?.classList.add("is-enrolled");
    return () => page?.classList.remove("is-enrolled");
  }, [finished]);

  // ── Start my course (signs them straight into the learner app) ────────
  const [starting, setStarting] = useState(false);
  const startCourse = async (admin = false) => {
    setStarting(true);
    try {
      const res = await fetch("/api/ads/ca-rbs/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(admin ? { email: email.trim(), password, admin: true } : { email: email.trim(), password })
      });
      const d = (await res.json()) as { url?: string };
      if (d.url) window.location.href = d.url;
      else setStarting(false);
    } catch {
      setStarting(false);
    }
  };

  if (alreadyEnrolled && !done) {
    return (
      <div className="rbs-card rbs-done" role="status" ref={doneRef} tabIndex={-1}>
        <span className="rbs-done__ic" aria-hidden="true">
          <i className="fas fa-check" />
        </span>
        <h2>You&rsquo;re already enrolled!</h2>
        <p>
          {cart.length === 1 ? (
            <>
              <strong>{cart[0].name}</strong> is
            </>
          ) : (
            <>
              Your <strong>{cart.length} courses</strong> are
            </>
          )}{" "}
          already in your Train 321 account, so there&rsquo;s nothing more to pay.{" "}
          <strong>Your card has not been charged.</strong>
        </p>
        {demo ? (
          <>
            <p className="rbs-demo-note">
              <i className="fas fa-flask" aria-hidden="true" /> Demo run: nothing was checked, charged or sent.
            </p>
            <button type="button" className="rbs-btn rbs-btn--pay" onClick={() => window.location.reload()}>
              <i className="fas fa-rotate-right" aria-hidden="true" /> Run the demo again
            </button>
          </>
        ) : (
          <button type="button" className="rbs-btn rbs-btn--pay" onClick={() => startCourse()} disabled={starting}>
            {starting ? <span className="rbs-spin" aria-hidden="true" /> : null}
            Go to my course <i className="fas fa-arrow-right" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }

  if (done) {
    return (
      <div className="rbs-card rbs-done" role="status" ref={doneRef} tabIndex={-1}>
        <span className="rbs-done__ic" aria-hidden="true">
          <i className="fas fa-check" />
        </span>
        <h2>{isCompany ? "Your team is set up!" : <>You&rsquo;re enrolled!</>}</h2>
        {isCompany ? (
          <p>
            <strong>{companyName.trim()}</strong> now has a Train 321 company account with{" "}
            {done.length === 1 ? <strong>{done[0].name}</strong> : <strong>{done.length} courses</strong>}. Sign in as the admin
            with <strong>{email.trim()}</strong> to add your team. Your receipt is on its way.
          </p>
        ) : (
          <p>
            {done.length === 1 ? (
              <>
                <strong>{done[0].name}</strong> is
              </>
            ) : (
              <>
                Your <strong>{done.length} courses</strong> are
              </>
            )}{" "}
            in your Train 321 account. Your receipt is on its way to <strong>{email.trim()}</strong>.
          </p>
        )}
        {isRbsDefault && !isCompany && (
          <ol className="rbs-done__next">
            <li>Complete the training online.</li>
            <li>We report your completion to California ABC within 24 hours.</li>
            <li>Pass the ABC exam on the RBS Portal within 30 days.</li>
          </ol>
        )}
        {demo ? (
          <>
            <p className="rbs-demo-note">
              <i className="fas fa-flask" aria-hidden="true" /> Demo run: no account was created, nothing was charged and no
              email was sent.
            </p>
            <button type="button" className="rbs-btn rbs-btn--pay" onClick={() => window.location.reload()}>
              <i className="fas fa-rotate-right" aria-hidden="true" /> Run the demo again
            </button>
          </>
        ) : companyDone ? (
          // Signs the new admin straight in (same hand-off as "Start my course"),
          // landing on the company dashboard; the app's login page is only the fallback.
          <button type="button" className="rbs-btn rbs-btn--pay" onClick={() => startCourse(true)} disabled={starting}>
            {starting ? <span className="rbs-spin" aria-hidden="true" /> : null}
            Go to my admin dashboard <i className="fas fa-arrow-right" aria-hidden="true" />
          </button>
        ) : (
          <button type="button" className="rbs-btn rbs-btn--pay" onClick={() => startCourse()} disabled={starting}>
            {starting ? <span className="rbs-spin" aria-hidden="true" /> : null}
            Start my course <i className="fas fa-arrow-right" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }

  const known = identity === "new" || identity === "existing";
  // This page is for NEW learners only: an email that already has an account
  // gets a "use a different email" message instead of the password form, and
  // the payment part stays hidden.
  const isNew = identity === "new";

  // The Pay button stays disabled until everything it needs is filled in;
  // the hint under it names the first thing still missing.
  const missing = (() => {
    if (cart.length === 0) return "Add a course to continue.";
    if (identity === "checking") return "Checking your email…";
    if (!known) return "Enter your email to continue.";
    if (identity === "existing") return "Use a different email to continue.";
    if (identity === "new") {
      if (!firstName.trim() || !lastName.trim()) return "Enter your first and last name.";
      if (password.length < 8) return "Choose a password with at least 8 characters.";
    } else if (!password) {
      return "Enter your Train 321 password.";
    }
    if (isCompany) {
      if (!companyName.trim()) return "Enter your company name.";
      if (billingDifferent && (!billing.first_name.trim() || !billing.last_name.trim() || !EMAIL.test(billing.email.trim())))
        return "Add the billing contact's name and email.";
    }
    if (needsCard) {
      if (!cardComplete && !demo) return "Enter your card details.";
    }
    if (pricing) return "Updating your total…";
    return null;
  })();
  // Payment stays mounted while a company quote refreshes, so a typed card isn't lost.
  const showPayment = identity !== "existing" && (isCompany ? pricing || needsCard : dueToday > 0);

  // Error + Pay button + hint. Rendered twice: under the form (tablets and
  // desktop) and at the end of the order summary (phones, so the order reads
  // form → summary → Pay). CSS shows exactly one; both submit this same form.
  const payBlock = (where: "main" | "phone") => {
    const noteId = where === "main" ? "rbs-pay-note" : "rbs-pay-note-phone";
    return (
      <div className={`rbs-paybox rbs-paybox--${where}`}>
        {error && <p className="rbs-err" role="alert">{error}</p>}
        <button
          type="submit"
          className="rbs-btn rbs-btn--pay"
          disabled={busy || missing !== null}
          aria-describedby={missing && !busy ? noteId : undefined}
        >
          {busy ? <span className="rbs-spin" aria-hidden="true" /> : <i className="fas fa-lock" aria-hidden="true" />}
          {isCompany && pricing
            ? "Pay"
            : needsSubscription
              ? `Pay ${money(dueToday)} today`
              : dueToday > 0
                ? `Pay ${money(dueToday)}`
                : "Enroll now · Free"}
        </button>
        <p id={noteId} className="rbs-pay-note">
          {missing && !busy ? (
            missing
          ) : (
            <>
              <i className="fas fa-lock" aria-hidden="true" /> Powered by Stripe &middot; Instant access
            </>
          )}
        </p>
      </div>
    );
  };

  // One card split in two (hosted-checkout style): the form on the left,
  // the order summary on the right. Every field, button and handler is the
  // same as before — only where they sit has changed.
  return (
    <form className="rbs-co" onSubmit={onSubmit} noValidate aria-busy={busy}>
      <div className="rbs-split">
        {/* ── Left: the form ── */}
        <div className="rbs-split__form">
          <p className="rbs-kicker">Enroll today</p>
          <h2 className="rbs-paycard__h">{checkoutHeading || "Complete your enrollment"}</h2>
          {isRbsDefault && <p className="rbs-split__sub">Approved California RBS training provider</p>}
          {demo && (
            <p className="rbs-demo-banner" role="note">
              <i className="fas fa-flask" aria-hidden="true" /> <strong>Demo mode</strong> — a test run. Nothing is saved,
              charged or emailed. Use an email starting with &ldquo;existing&rdquo; to see the message an
              existing account gets.
            </p>
          )}

          {/* Who it's for — "My team" is the marketing cart's company checkout.
              Hidden for now (SHOW_TEAM_OPTION): the page sells to individuals. */}
          {SHOW_TEAM_OPTION && (
          <div className="rbs-aud" role="radiogroup" aria-label="Who is this training for?">
            <button
              type="button"
              role="radio"
              aria-checked={!isCompany}
              className={!isCompany ? "is-active" : undefined}
              onClick={() => setAudience("individual")}
            >
              <i className="fas fa-user" aria-hidden="true" />
              <span>
                <strong>Just me</strong>
                <small>One-time payment</small>
              </span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={isCompany}
              className={isCompany ? "is-active" : undefined}
              onClick={() => setAudience("company")}
            >
              <i className="fas fa-users" aria-hidden="true" />
              <span>
                <strong>My team</strong>
                <small>Company account</small>
              </span>
            </button>
          </div>
          )}

          {isCompany && (
            <>
              <h3 className="rbs-split__h">Company</h3>
              <label className="rbs-field">
                <span>Company name</span>
                <input autoComplete="organization" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
              </label>
              <div className="rbs-counts">
                <div className="rbs-counts__item">
                  <span>Employees</span>
                  <Stepper small min={MIN_EMPLOYEES} value={employees} onChange={setEmployees} label="Number of employees" />
                </div>
                <div className="rbs-counts__item">
                  <span>Locations</span>
                  <Stepper small value={locations} onChange={setLocations} label="Number of locations" />
                </div>
              </div>
              {hasCompliance && (
                <div className="rbs-cadence" role="radiogroup" aria-label="Billing">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={cadence === "yearly"}
                    className={cadence === "yearly" ? "is-active" : undefined}
                    onClick={() => setCadence("yearly")}
                  >
                    Yearly <em>Save 10%</em>
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={cadence === "monthly"}
                    className={cadence === "monthly" ? "is-active" : undefined}
                    onClick={() => setCadence("monthly")}
                  >
                    Monthly
                  </button>
                </div>
              )}
            </>
          )}

          {isCompany && <h3 className="rbs-split__h">Admin account</h3>}
          <label className="rbs-field">
            <span>Email</span>
            <span className="rbs-field__wrap">
              <input
                ref={emailRef}
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
                value={email}
                readOnly={known}
                className={known ? "is-locked" : undefined}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (identity !== "unknown") {
                    setIdentity("unknown");
                    checkedFor.current = "";
                  }
                }}
                onBlur={() => lookUp(email)}
                required
              />
              {identity === "checking" && <span className="rbs-spin rbs-spin--dark rbs-field__spin" aria-hidden="true" />}
              {known && (
                <button type="button" className="rbs-textbtn" onClick={changeEmail}>
                  Change
                </button>
              )}
            </span>
          </label>

          {identity === "existing" && (
            <div className="rbs-exists" role="status">
              <i className="fas fa-circle-info rbs-exists__ic" aria-hidden="true" />
              <div>
                <strong>This email already has a Train 321 account.</strong>
                <p>Use a different email to continue.</p>
                <div className="rbs-exists__actions">
                  <button type="button" className="rbs-exists__btn" onClick={changeEmail}>
                    Use a different email
                  </button>
                </div>
              </div>
            </div>
          )}

          {identity === "new" && (
            <div className="rbs-row">
              <label className="rbs-field">
                <span>First name</span>
                <input autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </label>
              <label className="rbs-field">
                <span>Last name</span>
                <input autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </label>
            </div>
          )}

          {isNew && (
            <label className="rbs-field">
              <span>{identity === "new" ? "Create a password" : "Password"}</span>
              <span className="rbs-field__wrap">
                <input
                  type={showPw ? "text" : "password"}
                  autoComplete={identity === "new" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={identity === "new" ? "At least 8 characters" : ""}
                  required
                />
                <button type="button" className="rbs-textbtn" onClick={() => setShowPw((v) => !v)} aria-pressed={showPw}>
                  {showPw ? "Hide" : "Show"}
                </button>
              </span>
            </label>
          )}

          {isCompany && isNew && (
            <>
              <label className="rbs-check">
                <input type="checkbox" checked={billingDifferent} onChange={(e) => setBillingDifferent(e.target.checked)} />
                Billing contact is someone else
              </label>
              {billingDifferent && (
                <>
                  <div className="rbs-row">
                    <label className="rbs-field">
                      <span>Billing first name</span>
                      <input value={billing.first_name} onChange={(e) => setBilling((b) => ({ ...b, first_name: e.target.value }))} />
                    </label>
                    <label className="rbs-field">
                      <span>Billing last name</span>
                      <input value={billing.last_name} onChange={(e) => setBilling((b) => ({ ...b, last_name: e.target.value }))} />
                    </label>
                  </div>
                  <div className="rbs-row">
                    <label className="rbs-field">
                      <span>Billing email</span>
                      <input type="email" value={billing.email} onChange={(e) => setBilling((b) => ({ ...b, email: e.target.value }))} />
                    </label>
                    <label className="rbs-field">
                      <span>Billing phone (optional)</span>
                      <input type="tel" value={billing.phone} onChange={(e) => setBilling((b) => ({ ...b, phone: e.target.value }))} />
                    </label>
                  </div>
                </>
              )}
            </>
          )}

          {showPayment && (
            <>
              <h3 className="rbs-split__h">Payment</h3>
              <div className="rbs-field">
                <span className="rbs-field__label">
                  Card
                  <span className="rbs-brands" aria-hidden="true">
                    <i className="fab fa-cc-visa" />
                    <i className="fab fa-cc-mastercard" />
                    <i className="fab fa-cc-amex" />
                    <i className="fab fa-cc-discover" />
                  </span>
                </span>
                {demo ? (
                  <div className="rbs-card-el rbs-card-el--demo">
                    <i className="fas fa-flask" aria-hidden="true" /> Demo mode — no card needed, nothing is charged
                  </div>
                ) : (
                  // Locked until the email check has finished (new or returning
                  // buyer known); it unlocks by itself as soon as it's done.
                  <div className={`rbs-card-el${isNew ? "" : " is-locked"}`} title={isNew ? undefined : "Enter your email first"}>
                    <CardElement
                      onChange={(e) => setCardComplete(e.complete)}
                      onReady={() => setCardComplete(false)}
                      options={{
                        disabled: !isNew,
                        style: {
                          base: { fontSize: "16px", color: "#0f2137", fontFamily: "Inter, system-ui, sans-serif", "::placeholder": { color: "#8a97a6" } },
                          invalid: { color: "#a1222e" }
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {payBlock("main")}
        </div>

        {/* ── Right: the order summary ── */}
        <aside className="rbs-split__summary" aria-label="Order summary">
          {/* Compact "Your certificate" row: a small live preview (their name
              fills in as they type) without making the summary heavy. */}
          <div className="rbs-certrow">
            <div className="rbs-certrow__thumb" aria-hidden="true">
              <CourseCertificate courseTitle={certTitle} learnerName={certName || "Your Name"} showExpiration={false} />
            </div>
            <div className="rbs-certrow__text">
              {/* Follows the form: the name typed on the left, the course in the cart. */}
              <strong>{certName || "Your Name"}</strong>
              <span>{certTitle}</span>
              {(certificateNote || isRbsDefault) && (
                <small>
                  {certificateNote ||
                    "Your official California Alcohol Server Certification is issued by California ABC after you pass the state exam."}
                </small>
              )}
            </div>
          </div>

          <ul className="rbs-items">
            {cart.map((c) => (
              <li key={c.id}>
                {/* The course's marketplace image (the site's placeholder when it has none). */}
                <span className="rbs-items__thumb" aria-hidden="true">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.image || COURSE_PLACEHOLDER_IMAGE}
                    alt=""
                    loading="lazy"
                    onError={(e) => {
                      if (!e.currentTarget.src.endsWith(COURSE_PLACEHOLDER_IMAGE)) e.currentTarget.src = COURSE_PLACEHOLDER_IMAGE;
                    }}
                  />
                </span>
                <span className="rbs-items__name">
                  {c.name}
                  {c.stateLabel && <small>{c.stateLabel}</small>}
                  {/* Team pricing, as on the marketing cart: seats for seat-based
                      courses, a per-employee base for compliance courses. */}
                  {isCompany &&
                    (c.isSeatBased ? (
                      <>
                        <span className="rbs-items__seats">
                          <Stepper
                            small
                            value={seatsFor(c)}
                            onChange={(n) => setSeatOverride((s) => ({ ...s, [c.id]: n }))}
                            label={`Seats for ${c.name}`}
                          />
                          <small>
                            {money(c.price)} &times; {seatsFor(c)} {seatsFor(c) === 1 ? "seat" : "seats"} &middot; one-time
                          </small>
                        </span>
                        {seatsFor(c) < employees && (
                          <small className="rbs-items__seatnote">
                            Covers {seatsFor(c)} of your {employees} employees.{" "}
                            <button
                              type="button"
                              className="rbs-textbtn"
                              onClick={() => setSeatOverride((s) => ({ ...s, [c.id]: employees }))}
                            >
                              Use {employees} seats
                            </button>
                          </small>
                        )}
                      </>
                    ) : (
                      <small>{money(c.price)} / employee base</small>
                    ))}
                </span>
                <span className="rbs-items__price">{money(isCompany && c.isSeatBased ? c.price * seatsFor(c) : c.price)}</span>
                {cart.length > 1 ? (
                  <button type="button" className="rbs-items__x" onClick={() => removeLine(c.id)} aria-label={`Remove ${c.name}`} title="Remove">
                    <i className="fas fa-times" aria-hidden="true" />
                  </button>
                ) : (
                  <span className="rbs-items__x-space" aria-hidden="true" />
                )}
              </li>
            ))}
          </ul>

          {/* Promo code: a link that opens the field (× closes it); an applied code can be removed. */}
          <div className="rbs-split__promo">
            {appliedPromo && promoCode ? (
              <p className="rbs-promo-applied">
                <span>
                  <i className="fas fa-tag" aria-hidden="true" /> Code <strong>{appliedPromo.name}</strong> applied
                  {needsSubscription ? " to your first invoice" : ""}
                </span>
                <button type="button" className="rbs-textbtn" onClick={closePromo}>
                  Remove
                </button>
              </p>
            ) : promoOpen ? (
              <div className="rbs-promo">
                <input
                  aria-label="Promo code"
                  placeholder="Promo code"
                  value={promoInput}
                  autoFocus
                  onChange={(e) => {
                    setPromoInput(e.target.value);
                    setPromoError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      setPromoCode(promoInput.trim());
                    } else if (e.key === "Escape") {
                      closePromo();
                    }
                  }}
                />
                <button type="button" className="rbs-promo__apply" onClick={() => setPromoCode(promoInput.trim())}>
                  Apply
                </button>
                <button type="button" className="rbs-promo__close" onClick={closePromo} aria-label="Close promo code" title="Close">
                  <i className="fas fa-times" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <button type="button" className="rbs-textbtn" onClick={() => setPromoOpen(true)}>
                Have a promo code?
              </button>
            )}
            {promoError && <p className="rbs-err" role="alert">{promoError}</p>}
          </div>

          <div className="rbs-split__totals" aria-live="polite">
            <p>
              <span>{needsSubscription ? `First ${cadence} invoice` : "Subtotal"}</span>
              <span>{isCompany && !cQuote ? "—" : money(subtotal)}</span>
            </p>
            {discount > 0 && (
              <p className="is-discount">
                <span>Discount</span>
                <span>&minus;{money(discount)}</span>
              </p>
            )}
            <p className="is-total">
              <span>{isCompany ? "Due today" : "Total"}</span>
              <strong>{isCompany && !cQuote ? "—" : money(dueToday)}</strong>
            </p>
            {/* Subscription terms, stated before they pay (as on the marketing cart). */}
            {needsSubscription && cq && cq.ongoing > 0 && (
              <span className="rbs-ongoing">
                <i className="fas fa-rotate" aria-hidden="true" /> Then <strong>{money(cq.ongoing)}/{cadenceUnit}</strong>{" "}
                &middot; {money(cq.perLocation)}/{cadenceUnit} &times; {locations} {locations === 1 ? "location" : "locations"}{" "}
                &middot; {employees} {employees === 1 ? "employee" : "employees"} &middot; cancel anytime
              </span>
            )}
          </div>

          {openSuggestions.length > 0 && (
            // Add-ons: clean rows (image, name, price, "Add") like the cart lines.
            <div className="rbs-addons">
              <p className="rbs-addons__label">Add to your order</p>
              <ul>
                {(addOpen ? openSuggestions : openSuggestions.slice(0, CHIPS_SHOWN)).map((s) => (
                  <li key={s.id}>
                    <button type="button" className="rbs-addon" onClick={() => addLine(s.id)} aria-label={`Add ${s.name}, ${money(s.price)}`}>
                      <span className="rbs-addon__thumb" aria-hidden="true">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={s.image || COURSE_PLACEHOLDER_IMAGE}
                          alt=""
                          loading="lazy"
                          onError={(e) => {
                            if (!e.currentTarget.src.endsWith(COURSE_PLACEHOLDER_IMAGE)) e.currentTarget.src = COURSE_PLACEHOLDER_IMAGE;
                          }}
                        />
                      </span>
                      <span className="rbs-addon__name">
                        {s.name}
                        {s.stateLabel && <small>{s.stateLabel}</small>}
                      </span>
                      <span className="rbs-addon__price">+{money(s.price)}</span>
                      <span className="rbs-addon__add" aria-hidden="true">
                        <i className="fas fa-plus" /> Add
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              {openSuggestions.length > CHIPS_SHOWN && (
                <button type="button" className="rbs-textbtn rbs-addons__more" onClick={() => setAddOpen((v) => !v)} aria-expanded={addOpen}>
                  {addOpen ? "Show less" : `Show ${openSuggestions.length - CHIPS_SHOWN} more`}
                </button>
              )}
            </div>
          )}
          {/* What's included + a short review: reasons to buy under the
              summary, the way US checkouts do. */}
          <ul className="rbs-included" aria-label="What's included">
            {(isRbsDefault
              ? [
                  "Approved California RBS training provider",
                  "Completion reported to California ABC within 24 hours",
                  "Self-paced — learn on your phone or computer"
                ]
              : ["Instant access right after checkout", "Self-paced — learn on your phone or computer", "Certificate of completion included"]
            ).map((t) => (
              <li key={t}>
                <i className="fas fa-circle-check" aria-hidden="true" /> {t}
              </li>
            ))}
          </ul>
          {review && (
            <figure className="rbs-review">
              <span className="rbs-review__stars" aria-label="5 out of 5 stars">
                ★★★★★
              </span>
              <blockquote>&ldquo;{review.text}&rdquo;</blockquote>
              <figcaption>
                <strong>{review.name}</strong>
                {review.role && <span>{review.role}</span>}
              </figcaption>
            </figure>
          )}
          {/* Phones: Pay comes last, after the order summary. */}
          {payBlock("phone")}
        </aside>
      </div>
    </form>
  );
}

/** − [n] + number control (employees, locations, seats). */
function Stepper({
  value,
  onChange,
  label,
  small = false,
  min = 1
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
  small?: boolean;
  min?: number;
}) {
  const clamp = (n: number) => Math.min(9999, Math.max(min, Math.floor(n) || min));
  // Typing is free (so "12" can pass through "1"); the minimum applies on blur.
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <span className={`rbs-stepper${small ? " rbs-stepper--sm" : ""}`}>
      <button type="button" onClick={() => onChange(clamp(value - 1))} disabled={value <= min} aria-label={`Decrease ${label.toLowerCase()}`}>
        <i className="fas fa-minus" aria-hidden="true" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={9999}
        value={draft ?? value}
        aria-label={label}
        onChange={(e) => {
          setDraft(e.target.value);
          const n = Math.floor(Number(e.target.value));
          if (n >= min && n <= 9999) onChange(n);
        }}
        onBlur={() => {
          if (draft !== null) onChange(clamp(Number(draft)));
          setDraft(null);
        }}
      />
      <button type="button" onClick={() => onChange(clamp(value + 1))} aria-label={`Increase ${label.toLowerCase()}`}>
        <i className="fas fa-plus" aria-hidden="true" />
      </button>
    </span>
  );
}

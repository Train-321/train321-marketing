// Server-side wrappers for the new-features "enroll" API — the public,
// unauthenticated purchase surface the marketing site checks out against.
//
// Every call here runs server-to-server from a Next route handler in
// app/api/enroll/*, so the browser never talks to the LMS directly. That keeps
// CORS out of the picture, hides the API base, and gives us one place to
// normalise the backend's error shapes into something the UI can render.
//
// Endpoint contracts (see backend/routes/api.php on the new-features repo):
//   POST /api/list/enroll-quote        → server-authoritative cart pricing
//   POST /api/list/enroll-check-email  → duplicate-account precheck
//   POST /api/list/enroll-checkout     → signup + Stripe charge + welcome email
//   GET  /api/purchase-course-new/course/{id} → one course, shaped for the cart
//
// The marketing site only ever sells to the *individual* audience: a single
// one-time Stripe charge, no employee/location counts, no subscription. The
// backend prices that as `cadence: "one_time"`, which is why nothing here
// passes an invoice cadence.

const API_BASE =
  process.env.NEW_FEATURES_API_BASE || "https://new-features-api.train321.com";

/** A single course as the cart needs it. Mirrors the backend's course shape. */
export type CartCourse = {
  id: number;
  name: string;
  price: number;
  image: string | null;
  /**
   * Seat-based courses are bought in quantities (cost × users) and are sent to
   * the backend under `special_courses` rather than `course_ids`. Compliance
   * courses are always quantity 1 for an individual buyer.
   */
  isSeatBased: boolean;
  stateLabel: string | null;
};

export type BuyerAudience = "individual" | "company";
export type InvoiceCadence = "monthly" | "yearly";

/**
 * One cadence's view of a company subscription quote. `dueToday` covers the
 * first invoice (recurring share net of promo + one-time seat charges);
 * `ongoing` is what every renewal bills — always at the FULL rate, because a
 * promo only ever discounts the first invoice.
 */
export type CadenceQuote = {
  subtotal: number;
  discount: number;
  dueToday: number;
  ongoing: number;
  perLocation: number;
};

/** What the checkout UI renders. Prices are recomputed by the backend. */
export type EnrollQuote = {
  audience: BuyerAudience;
  employees: number;
  locations: number;
  complianceSubtotal: number;
  seatOneTimeTotal: number;

  /** Individual view — a single one-time charge. */
  subtotal: number;
  discount: number;
  dueToday: number;

  /**
   * Company view — subscription figures per cadence. Both are always
   * returned so the monthly/yearly toggle can flip without a re-quote.
   * Zero-filled when audience is "individual".
   */
  monthly: CadenceQuote;
  yearly: CadenceQuote;
  /** True when the cart holds compliance courses (the recurring part). */
  hasRecurring: boolean;

  promo: { name: string; discountType: string; discount: number } | null;
};

export type QuoteInput = {
  lines: EnrollCartLine[];
  audience?: BuyerAudience;
  /** Company only — how many people will take the compliance courses. */
  employees?: number;
  /** Company only — how many locations. */
  locations?: number;
  promoCode?: string;
};

export type EnrollCartLine = { id: number; users: number; isSeatBased: boolean };

export type CheckoutDetails = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  state?: string;
};

/** Separate billing contact — only sent when the buyer picks "different". */
export type BillingContact = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
};

export type CheckoutResult = {
  employee: { id: number; first_name: string; last_name: string; email: string };
  chargeId: string | null;
  receiptUrl: string | null;
  invoiceUrl: string | null;
  loginUrl: string;
  amount: number;
  /** Populated for company subscription purchases; null for one-time buys. */
  subscription: {
    id: string | null;
    status: string | null;
    cadence: InvoiceCadence;
    /** Unix seconds — when the first period ends / next invoice bills. */
    periodEnd: number | null;
    hostedInvoiceUrl: string | null;
  } | null;
};

/** Raised when the backend answers with a non-2xx. `status` is passed through. */
export class EnrollApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "EnrollApiError";
    this.status = status;
  }
}

/**
 * Pull a human-usable message out of whatever the backend returned. Laravel
 * answers validation failures with `{ message, errors: { field: [msg] } }` and
 * business-rule failures with `{ success: false, message }`, so we check both
 * and fall back to the field-level error when the top-level message is the
 * generic "The given data was invalid."
 */
function messageFrom(body: unknown, status: number): string {
  const b = body as
    | { message?: string; errors?: Record<string, string[]> }
    | null
    | undefined;

  const firstFieldError = b?.errors
    ? Object.values(b.errors).flat().find(Boolean)
    : undefined;

  if (status === 422 && firstFieldError) return firstFieldError;
  if (b?.message) return b.message;
  if (firstFieldError) return firstFieldError;
  return "Something went wrong. Please try again.";
}

/** POST JSON to the LMS and return the parsed body, throwing on non-2xx. */
async function post<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      cache: "no-store"
    });
  } catch {
    // DNS/timeout/TLS — the LMS is unreachable, not the buyer's fault.
    throw new EnrollApiError(
      "We couldn't reach the enrollment service. Please try again in a moment.",
      503
    );
  }

  const parsed: unknown = await res.json().catch(() => null);
  if (!res.ok) throw new EnrollApiError(messageFrom(parsed, res.status), res.status);
  return parsed as T;
}

/**
 * Look one course up by marketplace id.
 *
 * The cart lives in the browser's localStorage and only persists ids + seat
 * counts — never names or prices. On every load we re-fetch each line through
 * here so a stale cart can't show (or charge) an out-of-date price, and a
 * course that's been pulled from the store simply drops out of the cart.
 *
 * Returns null for anything that no longer resolves, rather than throwing, so
 * one dead line can't break the whole cart.
 */
export async function getCartCourse(id: number): Promise<CartCourse | null> {
  try {
    const res = await fetch(`${API_BASE}/api/purchase-course-new/course/${id}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 }
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      success?: boolean;
      course?: {
        id: number;
        name?: string;
        price?: number;
        image?: string | null;
        is_seat_based?: number;
        state_label?: string | null;
      };
    };
    const c = data?.course;
    if (!data?.success || !c?.id) return null;

    return {
      id: c.id,
      name: c.name || "",
      price: Number(c.price ?? 0),
      image: c.image || null,
      isSeatBased: Number(c.is_seat_based ?? 0) === 1,
      stateLabel: c.state_label || null
    };
  } catch {
    return null;
  }
}

/**
 * Resolve a Sanity course's `enrollId` into a cart-ready course.
 *
 * `enrollId` is filled in by the Studio's course picker and holds the numeric
 * marketplace course id. Some older documents still hold a legacy slug string
 * ("food-handler", "alcohol", …) from before the picker existed — those can't
 * be purchased inline, so we return null and the caller falls back to the
 * outbound /enroll link rather than showing a broken buy button.
 */
export async function resolveEnrollCourse(enrollId?: string | null): Promise<CartCourse | null> {
  if (!enrollId) return null;
  const id = Number(enrollId);
  if (!Number.isInteger(id) || id <= 0) return null;
  return getCartCourse(id);
}

/** One row in the course page's state picker. */
export type StatePickerOption = {
  /** Display label — the variant's state tag, e.g. "Florida" or "All states". */
  state: string;
  /**
   * Set when the tag is a multi-state list: the normalized 2-letter codes,
   * rendered as individual chips so every state stays visible without
   * squeezing the row.
   */
  stateCodes?: string[];
  /** The variant course's public name, shown muted beside the state. */
  title?: string;
  /** Outbound link for states served by an external provider; "" otherwise. */
  href: string;
  /** Cart-ready course for inline purchase; null when the state redirects out. */
  course: CartCourse | null;
};

/** Code → full name, for prettifying raw LMS state tags like "Fl". */
const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan",
  MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana",
  NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota",
  OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia",
  WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming"
};

/**
 * Turn a raw LMS state tag into a picker-friendly label.
 *
 * Admins type these free-form ("Fl", "Az,CA, HI, IL, NM, TX, WV"), so:
 *   - empty / "ALL"            → "All states"
 *   - one 2-letter code        → the full state name ("Fl" → "Florida")
 *   - several codes            → every normalized code in `codes`, rendered
 *                                as chips — the full list stays visible,
 *                                nothing is truncated behind a "+N"
 *   - anything else free-form  → passed through as typed
 */
function shapeStateLabel(
  raw: string | null | undefined
): { state: string; codes?: string[] } {
  const text = String(raw || "").trim();
  if (!text || text.toUpperCase() === "ALL") return { state: "All states" };

  const tokens = text.split(",").map((t) => t.trim()).filter(Boolean);
  const codes = tokens.map((t) => t.toUpperCase());
  const allCodes = codes.length > 0 && codes.every((c) => /^[A-Z]{2}$/.test(c));

  if (!allCodes) return { state: text };
  if (codes.length === 1) return { state: STATE_NAMES[codes[0]] || codes[0] };
  return { state: codes.join(", "), codes };
}

/**
 * Build state-picker options from the LMS's own course groups.
 *
 * The new-features backend models state/regional versions as course groups
 * (tbl_course_group): each member course carries a state_label and optional
 * state_redirect_url. When the given course id belongs to a group with 2+
 * variants, the group IS the state picker — managed by LMS admins, no Sanity
 * editing involved. Returns null when the course isn't grouped (callers fall
 * back to the Sanity-managed stateVariants).
 *
 * The group payload doesn't include variant names, so each variant is
 * resolved through the course endpoint — which also gives us the canonical
 * price/image/seat flags for the cart. Variants that no longer resolve are
 * dropped rather than rendered as dead options.
 */
export async function getGroupStateOptions(
  enrollId?: string | null
): Promise<StatePickerOption[] | null> {
  const id = Number(enrollId);
  if (!Number.isInteger(id) || id <= 0) return null;

  type RawVariant = {
    id: number;
    state_label?: string | null;
    state_redirect_url?: string | null;
    price?: number;
  };
  type RawEntry = { entry_type?: string; variants?: RawVariant[] };

  let entries: RawEntry[];
  try {
    // POST fetches aren't cached by Next's data cache, but this runs inside
    // ISR page generation (5-minute revalidate on course pages), so the
    // backend sees one call per regeneration, not one per visitor.
    const res = await fetch(`${API_BASE}/api/list/enroll-courses`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ per_page: 500, page: 1, type: "all" })
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { courses?: RawEntry[] };
    entries = data.courses || [];
  } catch {
    return null;
  }

  const group = entries.find(
    (e) => e.entry_type === "group" && (e.variants || []).some((v) => v.id === id)
  );
  // A 1-variant "group" isn't a choice — treat it as a normal course.
  if (!group || (group.variants || []).length < 2) return null;

  const variants = [...(group.variants || [])].sort((a, b) =>
    String(a.state_label || "").localeCompare(String(b.state_label || ""))
  );

  const resolved = await Promise.all(variants.map((v) => getCartCourse(v.id)));

  const options: StatePickerOption[] = [];
  for (let i = 0; i < variants.length; i++) {
    const v = variants[i];
    const c = resolved[i];
    const { state, codes } = shapeStateLabel(v.state_label);
    if (v.state_redirect_url) {
      // External-provider state — link out, never add to cart.
      options.push({ state, stateCodes: codes, title: c?.name, href: v.state_redirect_url, course: null });
    } else if (c) {
      options.push({ state, stateCodes: codes, title: c.name, href: "", course: c });
    }
  }

  return options.length >= 2 ? options : null;
}

/**
 * Split the cart into the two buckets the backend expects and ask it to price
 * them. This is the ONLY source of truth for what the buyer sees — we never
 * total the cart client-side, because `enroll-checkout` recomputes the same
 * figure server-side and would reject a tampered total anyway.
 */
export async function getQuote(input: QuoteInput): Promise<EnrollQuote> {
  const { courseIds, specialCourses } = splitLines(input.lines);
  const audience: BuyerAudience = input.audience === "company" ? "company" : "individual";
  const employees = Math.max(1, input.employees || 1);
  const locations = Math.min(9999, Math.max(1, input.locations || 1));

  const raw = await post<{
    audience?: string;
    employees?: number;
    locations?: number;
    compliance_subtotal?: number;
    seat_one_time_total?: number;
    compliance_monthly?: number;
    compliance_yearly?: number;
    per_location_monthly?: number;
    per_location_yearly?: number;
    due_today_monthly?: number;
    due_today_yearly?: number;
    ongoing_monthly?: number;
    ongoing_yearly?: number;
    monthly_discount?: number;
    yearly_discount?: number;
    has_recurring?: boolean;
    promo_applied?: { name: string; discount_type: string; discount: number } | null;
  }>("/api/list/enroll-quote", {
    audience,
    course_ids: courseIds,
    special_courses: specialCourses,
    number_of_employees: employees,
    number_of_locations: locations,
    promo_code: input.promoCode || ""
  });

  const compliance = Number(raw.compliance_subtotal ?? 0);
  const seats = Number(raw.seat_one_time_total ?? 0);

  // Company: subscription math per cadence, straight off the response — the
  // employee ×1.5 multiplier, the $29/location floor, and the 10% yearly
  // discount all live server-side (EnrollQuoteController).
  const cadence = (key: "monthly" | "yearly"): CadenceQuote =>
    audience === "company"
      ? {
          subtotal:
            Number(raw[`compliance_${key}`] ?? 0) + seats,
          discount: Number(raw[`${key}_discount`] ?? 0),
          dueToday: Number(raw[`due_today_${key}`] ?? 0),
          ongoing: Number(raw[`ongoing_${key}`] ?? 0),
          perLocation: Number(raw[`per_location_${key}`] ?? 0)
        }
      : { subtotal: 0, discount: 0, dueToday: 0, ongoing: 0, perLocation: 0 };

  return {
    audience,
    employees: Number(raw.employees ?? employees),
    locations: Number(raw.locations ?? locations),
    complianceSubtotal: compliance,
    seatOneTimeTotal: seats,
    // Individual: the backend's "monthly" figures ARE the one-time totals
    // (due_today_monthly = compliance + seats − promo). The yearly variants
    // are a subscription concept and never apply to an individual cart.
    subtotal: compliance + seats,
    discount: Number(raw.monthly_discount ?? 0),
    dueToday: Number(raw.due_today_monthly ?? 0),
    monthly: cadence("monthly"),
    yearly: cadence("yearly"),
    hasRecurring: Boolean(raw.has_recurring ?? compliance > 0),
    promo: raw.promo_applied
      ? {
          name: raw.promo_applied.name,
          discountType: raw.promo_applied.discount_type,
          discount: Number(raw.promo_applied.discount ?? 0)
        }
      : null
  };
}

/** True when an account already exists for this email. */
export async function checkEmail(email: string): Promise<boolean> {
  const raw = await post<{ exists?: boolean }>("/api/list/enroll-check-email", { email });
  return Boolean(raw.exists);
}

/**
 * Create the account and take the payment in one call.
 *
 * `stripeTokenId` comes from Stripe.js in the browser (`stripe.createToken`) —
 * raw card data never touches our server or the LMS. A null token means a $0
 * cart (a 100%-off promo), which the backend accepts as a free enrollment.
 */
export async function checkout(input: {
  lines: EnrollCartLine[];
  details: CheckoutDetails;
  promoCode?: string;
  stripeTokenId: string | null;
  cardholderName?: string;
  /** Defaults to "individual" (one-time charge). */
  audience?: BuyerAudience;
  /** Company only. */
  employees?: number;
  locations?: number;
  cadence?: InvoiceCadence;
  companyName?: string;
  billing?: BillingContact | null;
}): Promise<CheckoutResult> {
  const { courseIds, specialCourses } = splitLines(input.lines);
  const audience: BuyerAudience = input.audience === "company" ? "company" : "individual";
  const cadence: InvoiceCadence = input.cadence === "yearly" ? "yearly" : "monthly";

  // `pay.name` is `required_if:pay.method,card` on the backend, so an empty
  // string is a hard 422. Fall back to the buyer's own name rather than
  // letting a blank cardholder field fail the whole purchase.
  const cardholder =
    input.cardholderName?.trim() ||
    `${input.details.first_name} ${input.details.last_name}`.trim() ||
    input.details.email;

  const pay = input.stripeTokenId
    ? { method: "card", token: { id: input.stripeTokenId }, name: cardholder }
    : { method: "free" };

  // Company checkouts carry the company + optional separate billing contact
  // inside `details`, matching EnrollPurchaseController's validation shape.
  const details: Record<string, unknown> = { ...input.details };
  if (audience === "company") {
    details.company_name = input.companyName || "";
    if (input.billing) {
      details.billing_mode = "different";
      details.billing_first_name = input.billing.first_name;
      details.billing_last_name = input.billing.last_name;
      details.billing_email = input.billing.email;
      details.billing_phone = input.billing.phone || "";
    } else {
      details.billing_mode = "same";
    }
  }

  const raw = await post<{
    employee: { id: number; first_name: string; last_name: string; email: string };
    charge: { id?: string; amount?: number; receipt?: string } | null;
    subscription: {
      id?: string;
      status?: string;
      cadence?: string;
      period_end?: number;
      invoice?: { hosted_invoice_url?: string } | null;
    } | null;
    pricing: { due_today?: number };
    invoice_url: string | null;
    login_url: string;
  }>("/api/list/enroll-checkout", {
    audience,
    course_ids: courseIds,
    special_courses: specialCourses,
    number_of_employees: Math.max(1, input.employees || 1),
    number_of_locations: Math.min(9999, Math.max(1, input.locations || 1)),
    invoice_cadence: cadence,
    promo_code: input.promoCode || "",
    details,
    pay
  });

  // The staging LMS returns absolute URLs, but the production LMS still has
  // the config-cache bug where env() reads null and both come back RELATIVE
  // ("/#/login", "/api/list/enroll-invoice/ch_..."). Left as-is they'd
  // resolve against the marketing domain and 404. Anchor them to the hosts
  // we already know: the invoice lives on the LMS API we just called, and
  // the sign-in page lives on the learner app (same base the header's
  // Sign In button uses).
  const appBase = (process.env.NEXT_PUBLIC_APP_BASE || "https://lms.train321.com").replace(/\/+$/, "");
  const absolute = (url: string | null | undefined, base: string): string | null =>
    !url ? null : /^https?:\/\//i.test(url) ? url : base + (url.startsWith("/") ? url : `/${url}`);

  return {
    employee: raw.employee,
    chargeId: raw.charge?.id ?? null,
    receiptUrl: raw.charge?.receipt ?? null,
    invoiceUrl: absolute(raw.invoice_url, API_BASE),
    loginUrl: absolute(raw.login_url, appBase) || `${appBase}/#/login`,
    amount: Number(raw.pricing?.due_today ?? 0),
    subscription: raw.subscription
      ? {
          id: raw.subscription.id ?? null,
          status: raw.subscription.status ?? null,
          cadence: raw.subscription.cadence === "yearly" ? "yearly" : "monthly",
          periodEnd: raw.subscription.period_end ?? null,
          hostedInvoiceUrl: raw.subscription.invoice?.hosted_invoice_url ?? null
        }
      : null
  };
}

/**
 * Compliance courses go in `course_ids` (implicitly quantity 1); seat-based
 * courses go in `special_courses` with their seat count. Sending a seat-based
 * course in the wrong bucket silently prices it as a single seat, so this split
 * is load-bearing.
 */
function splitLines(lines: EnrollCartLine[]) {
  const courseIds: number[] = [];
  const specialCourses: Array<{ id: number; users: number }> = [];

  for (const line of lines) {
    if (line.isSeatBased) {
      specialCourses.push({ id: line.id, users: Math.max(1, line.users) });
    } else {
      courseIds.push(line.id);
    }
  }
  return { courseIds, specialCourses };
}

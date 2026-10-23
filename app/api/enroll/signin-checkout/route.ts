import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { login, AuthError, TOKEN_COOKIE, USER_COOKIE } from "@/lib/auth";

/**
 * Existing-account checkout for the marketing-v9 embed.
 *
 * The create-account path buys through /api/enroll/checkout (which signs the
 * buyer UP); this route is its sibling for buyers who already have a Train321
 * account: sign them IN with the credentials from the form, then run the same
 * authenticated purchase the LMS app itself uses —
 *
 *   POST {API_BASE}/purchase-course-new/checkout   (Bearer token)
 *
 * which recomputes prices server-side, charges via PaymentIntent, assigns the
 * courses to the account, writes purchase history + the payments ledger and
 * sends the receipt email. 3DS cards round-trip: the backend answers
 * { requires_action, client_secret, intent_id }, the browser completes the
 * challenge, then re-POSTs here with payment_intent_id.
 *
 * Server-only on purpose: the password and bearer token never reach client JS.
 */

const API_BASE = process.env.API_BASE || "https://api.train321.com";

type Body = {
  email?: string;
  password?: string;
  /** Email checkout-link token (?elt=…) — exchanged for a bearer server-side. */
  link_token?: string;
  courses?: Array<{ id?: number | string; name?: string }>;
  payment_method_id?: string;
  payment_intent_id?: string;
  billing_address?: string;
  billing_city?: string;
  billing_state?: string;
  billing_zip?: string;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request." }, { status: 400 });
  }

  const email = String(body.email || "").trim();
  const password = String(body.password || "");
  const courses = Array.isArray(body.courses)
    ? body.courses
        .map((c) => ({ id: Number(c?.id), name: String(c?.name || "") }))
        .filter((c) => Number.isFinite(c.id) && c.id > 0)
    : [];

  if (courses.length === 0) {
    return NextResponse.json({ success: false, message: "Your cart is empty." }, { status: 400 });
  }

  // 1. Establish who's buying, in priority order:
  //      password  — always wins (also rescues an expired session/link)
  //      link      — email checkout-link token, exchanged for a bearer
  //      session   — the site's httpOnly t321_token cookie
  //    usedFallback marks the non-password paths so an expired credential can
  //    answer need_password instead of a dead end. The purchase endpoint
  //    requires the buyer's user_id in the payload for audience "myself", so
  //    each path also records it.
  const jar = await cookies();
  const linkToken = String(body.link_token || "");
  let token: string | null = null;
  let billingName = email;
  let billingEmail = email;
  let userId = 0;
  let usedFallback = false;

  if (password) {
    if (!email) {
      return NextResponse.json(
        { success: false, message: "Enter your email and password to sign in." },
        { status: 400 }
      );
    }
    try {
      const auth = await login(email, password);
      token = auth.token;
      billingName = auth.fullName || email;
      userId = auth.userId;
    } catch (err) {
      const message =
        err instanceof AuthError ? err.message : "We couldn't sign you in. Please try again.";
      const status = err instanceof AuthError && err.status === 502 ? 502 : 401;
      return NextResponse.json({ success: false, message }, { status });
    }
  } else if (linkToken) {
    usedFallback = true;
    try {
      const res = await fetch(`${API_BASE}/api/enroll-link/exchange`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ token: linkToken }),
        cache: "no-store"
      });
      const d = (await res.json().catch(() => null)) as {
        success?: boolean;
        token?: string;
        full_name?: string;
        user_id?: number;
        email?: string;
      } | null;
      if (res.ok && d?.success && d.token) {
        token = d.token;
        billingName = d.full_name || billingName;
        billingEmail = billingEmail || d.email || "";
        userId = Number(d.user_id) || 0;
      }
    } catch {
      /* fall through to need_password below */
    }
  } else {
    token = jar.get(TOKEN_COOKIE)?.value || null;
    usedFallback = Boolean(token);
    try {
      const profile = JSON.parse(jar.get(USER_COOKIE)?.value || "null") as {
        name?: string;
        id?: number;
      } | null;
      if (profile?.name) billingName = profile.name;
      userId = Number(profile?.id) || 0;
    } catch {
      /* display cookie is cosmetic — ignore a bad one */
    }
  }

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        need_password: true,
        message: linkToken
          ? "This link has expired — enter your password to continue."
          : "Enter your password to sign in."
      },
      { status: 401 }
    );
  }

  // 2. Run the same authenticated purchase the LMS app uses. Amounts are
  //    recomputed server-side from the course ids — nothing priced here.
  const purchasePayload: Record<string, unknown> = {
    audience: "myself",
    invoice_method: "one-time",
    courses,
    billing_name: billingName,
    billing_email: billingEmail,
    billing_address: String(body.billing_address || ""),
    billing_city: String(body.billing_city || ""),
    billing_state: String(body.billing_state || ""),
    billing_zip: String(body.billing_zip || ""),
    // The purchase endpoint requires the buyer's id in the payload for
    // audience "myself" (the bearer alone doesn't satisfy its check).
    ...(userId > 0 ? { user_id: userId } : {})
  };
  if (body.payment_method_id) purchasePayload.payment_method_id = String(body.payment_method_id);
  if (body.payment_intent_id) purchasePayload.payment_intent_id = String(body.payment_intent_id);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/purchase-course-new/checkout`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(purchasePayload),
      cache: "no-store"
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "We couldn't reach the enrollment service. Your card has not been charged." },
      { status: 502 }
    );
  }

  const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  if (!data) {
    return NextResponse.json(
      { success: false, message: "Unexpected response from the enrollment service." },
      { status: 502 }
    );
  }

  // A session/link token the backend no longer accepts → ask for the password
  // instead of surfacing a raw auth error. (Password logins can't hit this —
  // their token is seconds old.)
  if (usedFallback && res.status === 401) {
    return NextResponse.json(
      { success: false, need_password: true, message: "Your session expired — enter your password to continue." },
      { status: 401 }
    );
  }

  // Pass the backend's answer through untouched — success, requires_action
  // (3DS) and error shapes are all handled by the checkout component.
  return NextResponse.json(data, { status: res.status });
}

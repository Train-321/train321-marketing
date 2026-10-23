import { NextResponse } from "next/server";
import { login, AuthError } from "@/lib/auth";

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
  courses?: Array<{ id?: number | string; name?: string }>;
  payment_method_id?: string;
  payment_intent_id?: string;
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

  if (!email || !password) {
    return NextResponse.json(
      { success: false, message: "Enter your email and password to sign in." },
      { status: 400 }
    );
  }
  if (courses.length === 0) {
    return NextResponse.json({ success: false, message: "Your cart is empty." }, { status: 400 });
  }

  // 1. Sign the buyer in. A wrong password surfaces the backend's own wording.
  let auth;
  try {
    auth = await login(email, password);
  } catch (err) {
    const message =
      err instanceof AuthError ? err.message : "We couldn't sign you in. Please try again.";
    const status = err instanceof AuthError && err.status === 502 ? 502 : 401;
    return NextResponse.json({ success: false, message }, { status });
  }

  // 2. Run the same authenticated purchase the LMS app uses. Amounts are
  //    recomputed server-side from the course ids — nothing priced here.
  const purchasePayload: Record<string, unknown> = {
    audience: "myself",
    invoice_method: "one-time",
    courses,
    billing_name: auth.fullName || email,
    billing_email: email
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
        Authorization: `Bearer ${auth.token}`
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

  // Pass the backend's answer through untouched — success, requires_action
  // (3DS) and error shapes are all handled by the checkout component.
  return NextResponse.json(data, { status: res.status });
}

import { NextResponse } from "next/server";
import { login, AuthError } from "@/lib/auth";
import { adsPost, cleanAttribution, cleanCourseIds, lmsMessage } from "@/lib/adsRbs";

// California RBS ad page — EXISTING buyer: sign in with the password from the
// form (server-side, so the password and bearer never reach client JS), then
// buy through the page's own LMS endpoint. 3-D Secure round-trips: the LMS
// answers { requires_action, client_secret, intent_id }, the browser confirms
// the card, then posts here again with payment_intent_id.
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }
  const str = (k: string, max = 190) => String(body[k] ?? "").trim().slice(0, max);
  const email = str("email");
  const password = String(body.password ?? "");
  if (!email || !password) {
    return NextResponse.json({ message: "Enter your email and password to sign in." }, { status: 400 });
  }

  let token: string;
  try {
    token = (await login(email, password)).token;
  } catch (err) {
    const message = err instanceof AuthError ? err.message : "We couldn't sign you in. Please try again.";
    const status = err instanceof AuthError && err.status === 502 ? 502 : 401;
    return NextResponse.json({ message, need_password: true }, { status });
  }

  try {
    const payload: Record<string, unknown> = {
      promo_code: str("promo_code", 120),
      billing_address: str("billing_address", 255),
      billing_city: str("billing_city", 80),
      billing_state: str("billing_state", 80),
      billing_zip: str("billing_zip", 20),
      attribution: cleanAttribution(body.attribution),
      course_ids: cleanCourseIds(body.course_ids)
    };
    const pm = str("payment_method_id", 120);
    const pi = str("payment_intent_id", 120);
    if (pm) payload.payment_method_id = pm;
    if (pi) payload.payment_intent_id = pi;

    const { status, data } = await adsPost("checkout-existing", payload, token);
    if (data?.requires_action) {
      return NextResponse.json({
        requires_action: true,
        client_secret: data.client_secret ?? null,
        intent_id: data.intent_id ?? null
      });
    }
    if (status >= 400 || !data?.success) {
      return NextResponse.json(
        {
          message: lmsMessage(data, "We couldn't complete your enrollment. Your card has not been charged."),
          ...(data?.already_enrolled
            ? {
                already_enrolled: true,
                refused_course_ids: Array.isArray(data.refused_course_ids)
                  ? (data.refused_course_ids as unknown[]).map(Number).filter((n) => Number.isInteger(n) && n > 0)
                  : []
              }
            : {})
        },
        { status: status >= 400 ? status : 502 }
      );
    }
    return NextResponse.json({
      success: true,
      chargeId: (data.charge_id as string | null) ?? null,
      amount: Number(data.amount ?? 0)
    });
  } catch {
    return NextResponse.json(
      { message: "We couldn't reach the enrollment service. Your card has not been charged." },
      { status: 502 }
    );
  }
}

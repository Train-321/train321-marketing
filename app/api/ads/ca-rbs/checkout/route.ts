import { NextResponse } from "next/server";
import { adsPost, cleanAttribution, cleanCourseIds, lmsMessage } from "@/lib/adsRbs";

// California RBS ad page — NEW buyer: create the account, take the payment
// and enroll in one call. The card was tokenised by Stripe.js in the browser,
// so only an opaque token id crosses this route. The LMS re-checks the
// courses and re-prices everything.
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }
  const str = (k: string, max = 190) => String(body[k] ?? "").trim().slice(0, max);

  try {
    const { status, data } = await adsPost("checkout", {
      first_name: str("first_name", 120),
      last_name: str("last_name", 120),
      email: str("email"),
      // Not trimmed — a password is exactly what was typed.
      password: String(body.password ?? ""),
      phone: str("phone", 40),
      card_token: str("card_token", 120),
      card_name: str("card_name", 120),
      promo_code: str("promo_code", 120),
      attribution: cleanAttribution(body.attribution),
      state: str("state", 80),
      course_ids: cleanCourseIds(body.course_ids)
    });
    if (status >= 400 || !data?.success) {
      return NextResponse.json(
        { message: lmsMessage(data, "We couldn't complete your enrollment. Your card has not been charged.") },
        { status: status >= 400 ? status : 502 }
      );
    }
    const charge = data.charge as { id?: string } | null;
    const pricing = data.pricing as { due_today?: number } | null;
    return NextResponse.json({
      success: true,
      chargeId: charge?.id ?? null,
      amount: Number(pricing?.due_today ?? 0)
    });
  } catch {
    return NextResponse.json(
      { message: "We couldn't reach the enrollment service. Your card has not been charged." },
      { status: 502 }
    );
  }
}

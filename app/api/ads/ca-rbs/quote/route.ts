import { NextResponse } from "next/server";
import { adsPost, cleanCourseIds, lmsMessage } from "@/lib/adsRbs";

// California RBS ad page: today's price for the cart's courses, with an
// optional promo code. Priced by the LMS (server-authoritative), never by the browser.
export async function POST(request: Request) {
  let promo = "";
  let courseIds: number[] = [];
  try {
    const body = (await request.json()) as { promo_code?: string; course_ids?: unknown };
    promo = String(body.promo_code || "").trim().slice(0, 120);
    courseIds = cleanCourseIds(body.course_ids);
  } catch {
    /* empty body = no promo */
  }
  try {
    const { status, data } = await adsPost("quote", { promo_code: promo, course_ids: courseIds });
    if (status >= 400 || !data?.success) {
      return NextResponse.json({ message: lmsMessage(data, "We couldn't price this course.") }, { status: status >= 400 ? status : 502 });
    }
    const subtotal = Number(data.compliance_subtotal ?? 0) + Number(data.seat_one_time_total ?? 0);
    const promoApplied = data.promo_applied as { name?: string; discount_type?: string; discount?: number } | null;
    return NextResponse.json({
      subtotal,
      discount: Number(data.monthly_discount ?? 0),
      // For a single (individual) purchase the LMS's "monthly" figures are the
      // one-time totals — the same reading lib/enroll.getQuote uses.
      dueToday: Number(data.due_today_monthly ?? 0),
      promo: promoApplied ? { name: String(promoApplied.name || promo) } : null
    });
  } catch {
    return NextResponse.json({ message: "We couldn't reach the enrollment service." }, { status: 502 });
  }
}

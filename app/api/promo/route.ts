import { NextResponse } from "next/server";
import { getPromo, EnrollApiError } from "@/lib/enroll";

/**
 * GET /api/promo?code=HALLOWEEN — the live promo as the LMS admin defines it
 * (discount, description, expiry), for banners that advertise a code.
 * Server-to-server so the LMS base URL stays off the client.
 *
 *   { promo: {...} }   live code
 *   { promo: null }    unknown / inactive / expired — hide the offer
 *   503                LMS unreachable — callers fall back to their defaults
 */
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code") || "";
  if (!code.trim()) {
    return NextResponse.json({ promo: null }, { status: 400 });
  }
  try {
    const promo = await getPromo(code);
    return NextResponse.json({ promo });
  } catch (err) {
    const status = err instanceof EnrollApiError ? err.status : 503;
    return NextResponse.json({ promo: null, unavailable: true }, { status });
  }
}

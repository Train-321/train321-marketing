import { NextResponse } from "next/server";
import { getQuote, EnrollApiError, type EnrollCartLine } from "@/lib/enroll";

// Prices the browser's cart. Called on every cart change and on promo entry.
// Server-to-server so the LMS base URL stays off the client.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      lines?: EnrollCartLine[];
      promoCode?: string;
    };

    const lines = Array.isArray(body.lines) ? body.lines : [];
    if (!lines.length) {
      // An empty cart has no quote to fetch — answer with zeroes rather than
      // asking the backend (which would 422 on an empty cart).
      return NextResponse.json({
        complianceSubtotal: 0,
        seatOneTimeTotal: 0,
        subtotal: 0,
        discount: 0,
        dueToday: 0,
        promo: null
      });
    }

    return NextResponse.json(await getQuote(lines, body.promoCode));
  } catch (err) {
    const status = err instanceof EnrollApiError ? err.status : 500;
    const message =
      err instanceof EnrollApiError ? err.message : "We couldn't price your cart.";
    return NextResponse.json({ message }, { status });
  }
}

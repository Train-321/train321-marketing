import { NextResponse } from "next/server";
import {
  getQuote,
  EnrollApiError,
  type BuyerAudience,
  type EnrollCartLine
} from "@/lib/enroll";

// Prices the browser's cart. Called on every cart change and on promo entry.
// Server-to-server so the LMS base URL stays off the client.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      lines?: EnrollCartLine[];
      audience?: BuyerAudience;
      employees?: number;
      locations?: number;
      promoCode?: string;
    };

    const lines = Array.isArray(body.lines) ? body.lines : [];
    if (!lines.length) {
      // An empty cart has no quote to fetch — answer with zeroes rather than
      // asking the backend (which would 422 on an empty cart).
      const zero = { subtotal: 0, discount: 0, dueToday: 0, ongoing: 0, perLocation: 0 };
      return NextResponse.json({
        audience: body.audience === "company" ? "company" : "individual",
        employees: 1,
        locations: 1,
        complianceSubtotal: 0,
        seatOneTimeTotal: 0,
        subtotal: 0,
        discount: 0,
        dueToday: 0,
        monthly: zero,
        yearly: zero,
        hasRecurring: false,
        promo: null
      });
    }

    return NextResponse.json(
      await getQuote({
        lines,
        audience: body.audience,
        employees: body.employees,
        locations: body.locations,
        promoCode: body.promoCode
      })
    );
  } catch (err) {
    const status = err instanceof EnrollApiError ? err.status : 500;
    const message =
      err instanceof EnrollApiError ? err.message : "We couldn't price your cart.";
    return NextResponse.json({ message }, { status });
  }
}

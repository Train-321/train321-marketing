import { NextResponse } from "next/server";
import { checkout, EnrollApiError, type CheckoutDetails, type EnrollCartLine } from "@/lib/enroll";

// Creates the account + takes the payment. The card was already tokenised in
// the browser by Stripe.js, so the only payment data crossing this route is an
// opaque token id — no PAN, no CVC, ever.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      lines?: EnrollCartLine[];
      details?: CheckoutDetails;
      promoCode?: string;
      stripeTokenId?: string | null;
      cardholderName?: string;
    };

    const lines = Array.isArray(body.lines) ? body.lines : [];
    if (!lines.length) {
      return NextResponse.json(
        { message: "Your cart is empty — please add a course before checkout." },
        { status: 422 }
      );
    }
    if (!body.details) {
      return NextResponse.json({ message: "Your details are missing." }, { status: 422 });
    }

    const result = await checkout({
      lines,
      details: body.details,
      promoCode: body.promoCode,
      stripeTokenId: body.stripeTokenId ?? null,
      cardholderName: body.cardholderName
    });

    return NextResponse.json(result);
  } catch (err) {
    const status = err instanceof EnrollApiError ? err.status : 500;
    const message =
      err instanceof EnrollApiError
        ? err.message
        : "We couldn't complete your enrollment. Your card has not been charged.";
    return NextResponse.json({ message }, { status });
  }
}

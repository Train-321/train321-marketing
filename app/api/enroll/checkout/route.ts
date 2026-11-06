import { NextResponse } from "next/server";
import {
  checkout,
  EnrollApiError,
  type BillingContact,
  type BuyerAudience,
  type CheckoutDetails,
  type EnrollCartLine,
  type InvoiceCadence
} from "@/lib/enroll";
import { withStageApi } from "@/app/enrollment/stageApi";

// Creates the account + takes the payment. The card was already tokenised in
// the browser by Stripe.js, so the only payment data crossing this route is an
// opaque token id — no PAN, no CVC, ever. Individual carts become a one-time
// charge; company carts with compliance courses become a Stripe subscription.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      lines?: EnrollCartLine[];
      details?: CheckoutDetails;
      promoCode?: string;
      stripeTokenId?: string | null;
      cardholderName?: string;
      audience?: BuyerAudience;
      employees?: number;
      locations?: number;
      cadence?: InvoiceCadence;
      companyName?: string;
      billing?: BillingContact | null;
      /** From ?test=true on the page: ask the LMS for Stripe developer (test-key) mode. */
      test_mode?: boolean;
      /** A staging test link: run against the staging LMS instead of production. */
      stage?: boolean;
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
    if (body.audience === "company" && !body.companyName?.trim()) {
      return NextResponse.json({ message: "Please enter your company name." }, { status: 422 });
    }

    const details = body.details;
    // Two independent flags from the /enrollment page's ?test=true:
    //   test_mode — charge with Stripe TEST keys (LMS developer mode);
    //   stage     — a staging test link: run the purchase on the staging LMS.
    // A test link made by production sends test_mode alone, so the account
    // and enrollment land on production and only the charge is a test one.
    // With neither, this is the production checkout exactly as before.
    const result = await withStageApi(body.stage === true, () =>
      checkout({
        lines,
        details,
        promoCode: body.promoCode,
        stripeTokenId: body.stripeTokenId ?? null,
        cardholderName: body.cardholderName,
        audience: body.audience,
        employees: body.employees,
        locations: body.locations,
        cadence: body.cadence,
        companyName: body.companyName,
        billing: body.billing ?? null,
        // The dev token is added here, server-side; it never reaches the browser.
        devMode: body.test_mode === true
      })
    );

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

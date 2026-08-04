import { NextResponse } from "next/server";
import { checkEmail, EnrollApiError } from "@/lib/enroll";

// Duplicate-account precheck. The checkout form calls this on email blur so a
// buyer finds out before filling in a card that they already have an account.
// checkout() enforces the same rule, so this is purely a nicer failure point.
export async function POST(request: Request) {
  try {
    const { email } = (await request.json()) as { email?: string };
    if (!email) {
      return NextResponse.json({ message: "Email is required." }, { status: 422 });
    }
    return NextResponse.json({ exists: await checkEmail(email) });
  } catch (err) {
    const status = err instanceof EnrollApiError ? err.status : 500;
    const message =
      err instanceof EnrollApiError ? err.message : "We couldn't check that email.";
    return NextResponse.json({ message }, { status });
  }
}

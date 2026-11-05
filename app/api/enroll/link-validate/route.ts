import { NextResponse } from "next/server";
import { STAGE_API_BASE } from "@/app/enrollment/stageApi";

/**
 * Checks an email checkout-link token (?elt=…) against the backend so the v9
 * checkout can greet the buyer and hide the password field. Read-only — the
 * token is only traded for a bearer at pay time (signin-checkout).
 */

const API_BASE = process.env.API_BASE || "https://api.train321.com";

export async function POST(req: Request) {
  let token = "";
  let testMode = false;
  try {
    const body = (await req.json()) as { token?: string; test_mode?: boolean };
    token = String(body.token || "");
    testMode = body.test_mode === true;
  } catch {
    /* fall through to the empty-token reply */
  }
  if (!token) {
    return NextResponse.json({ success: false, message: "Missing token." }, { status: 400 });
  }

  // test_mode (the /enrollment page's ?test=true) validates against the
  // staging LMS, where a staging-minted link token lives.
  const base = testMode ? STAGE_API_BASE : API_BASE;

  let res: Response;
  try {
    res = await fetch(`${base}/api/enroll-link/validate`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      cache: "no-store"
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "We couldn't verify this link right now." },
      { status: 502 }
    );
  }

  const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  return NextResponse.json(data ?? { success: false }, { status: res.status });
}

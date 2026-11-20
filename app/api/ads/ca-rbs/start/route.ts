import { NextResponse } from "next/server";
import { APP_BASE, handoffUrl, issueHandoffCode, login } from "@/lib/auth";

// California RBS ad page — "Start my course" right after purchase: sign the
// buyer in with the password they just used and hand them to the learner app
// already logged in. The one-time code is minted at the click (it expires in
// minutes), and any failure simply falls back to the app's login page.
export const dynamic = "force-dynamic";

const MY_COURSES = "/employee_courses";

export async function POST(request: Request) {
  const fallback = `${APP_BASE}/#/login`;
  try {
    const body = (await request.json()) as { email?: string; password?: string; admin?: boolean };
    const email = String(body.email || "").trim();
    const password = String(body.password || "");
    if (!email || !password) return NextResponse.json({ url: fallback });
    const auth = await login(email, password);
    const code = await issueHandoffCode(auth.token);
    // A team buyer is the company admin: no `next`, so the app lands on its
    // dashboard. Individuals go straight to their courses, as before.
    return NextResponse.json({ url: handoffUrl(code, body.admin === true ? null : MY_COURSES) });
  } catch {
    return NextResponse.json({ url: fallback });
  }
}

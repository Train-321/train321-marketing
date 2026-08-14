import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { issueHandoffCode, handoffUrl, TOKEN_COOKIE, APP_BASE } from "@/lib/auth";

/**
 * "Go to my dashboard" for a visitor who is already signed in here.
 *
 * The bearer token sits in an httpOnly cookie, so only the server can read it
 * — which is why this is a redirect endpoint rather than something the header
 * can build client-side. It mints a fresh one-time code and bounces the
 * browser to the learner app, which redeems it for a session on its own
 * origin.
 *
 * Anyone without the cookie just lands on the learner app's sign-in page.
 *
 * Usage: <a href="/api/auth/handoff">Dashboard</a>
 *        <a href="/api/auth/handoff?next=/course_catalog">My courses</a>
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next");
  const loginUrl = `${APP_BASE}/#/login`;

  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(loginUrl, 302);
  }

  try {
    const code = await issueHandoffCode(token);
    return NextResponse.redirect(handoffUrl(code, next), 302);
  } catch {
    // Expired or revoked token — send them to sign in again rather than
    // showing an error page for something a fresh login fixes.
    return NextResponse.redirect(loginUrl, 302);
  }
}

import { NextResponse } from "next/server";
import { STAGE_API_BASE } from "@/app/enrollment/stageApi";
import { APP_BASE, handoffUrl, issueHandoffCode } from "@/lib/auth";

/**
 * "Start my course" on /enrollment for someone who came in on an email link.
 *
 * They never typed a password, so the learner app's login page is a dead end.
 * This trades the link token for a one-time sign-in code at the moment of the
 * click, because a code minted when the page loaded would have expired (two
 * minutes) by the time they read it. A token the LMS no longer accepts just
 * lands on the login page, as before.
 */

const API_BASE = process.env.API_BASE || "https://api.train321.com";
const STAGE_APP_BASE = "https://new-features.train321.com";
const MY_COURSES = "/employee_courses";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const token = params.get("elt") || "";
  // stage=1: the visit ran on the staging LMS (a staging test link), so the
  // token and the account live there. A test link made by production does not
  // send it and signs into the production app, like a normal link.
  const stage = params.get("stage") === "1";
  const apiBase = stage ? STAGE_API_BASE : API_BASE;
  const appBase = stage ? STAGE_APP_BASE : APP_BASE;

  try {
    const res = await fetch(`${apiBase}/api/enroll-link/exchange`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      cache: "no-store"
    });
    const data = (await res.json().catch(() => null)) as { success?: boolean; token?: string } | null;
    if (res.ok && data?.success && data.token) {
      const code = await issueHandoffCode(data.token, apiBase);
      return NextResponse.redirect(handoffUrl(code, MY_COURSES, appBase), 302);
    }
  } catch {
    /* fall through to the login page */
  }
  return NextResponse.redirect(`${appBase}/#/login`, 302);
}

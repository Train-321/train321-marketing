import { NextResponse } from "next/server";
import {
  login,
  AuthError,
  TOKEN_COOKIE,
  USER_COOKIE,
  issueHandoffCode,
  handoffUrl,
  APP_BASE
} from "@/lib/auth";

// Sign-in proxy. The browser posts credentials here rather than cross-origin
// to api.train321.com, so the bearer token can be parked in an httpOnly cookie
// that page scripts (and any injected third-party script) cannot read.
export async function POST(request: Request) {
  try {
    const { email, password, next } = (await request.json()) as {
      email?: string;
      password?: string;
      next?: string;
    };
    if (!email || !password) {
      return NextResponse.json(
        { message: "Enter your email and password." },
        { status: 422 }
      );
    }

    const result = await login(email, password);

    // Trade the token for a one-time code so the learner app can build its own
    // session — a bare link to /#/dashboard would hit its auth guard with an
    // empty localStorage and get redirected back to /#/login. If minting the
    // code fails we still consider the sign-in successful and fall back to the
    // learner app's own login page rather than stranding the buyer here.
    let redirectUrl = `${APP_BASE}/#/login`;
    try {
      redirectUrl = handoffUrl(await issueHandoffCode(result.token), next);
    } catch {
      /* fall through to the plain login URL */
    }

    const res = NextResponse.json({
      role: result.role,
      fullName: result.fullName,
      userId: result.userId,
      redirectUrl
    });

    const secure = process.env.NODE_ENV === "production";
    // Passport tokens are long-lived; a week keeps people signed in without
    // holding a credential on the device indefinitely.
    const maxAge = 60 * 60 * 24 * 7;

    res.cookies.set(TOKEN_COOKIE, result.token, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge
    });
    // Display-only; deliberately carries no token so it's safe to read in JS.
    res.cookies.set(
      USER_COOKIE,
      JSON.stringify({ name: result.fullName, role: result.role, id: result.userId }),
      { httpOnly: false, secure, sameSite: "lax", path: "/", maxAge }
    );

    return res;
  } catch (err) {
    const status = err instanceof AuthError ? err.status : 500;
    const message =
      err instanceof AuthError ? err.message : "We couldn't sign you in. Please try again.";
    return NextResponse.json({ message }, { status });
  }
}

import { NextResponse } from "next/server";
import { login, AuthError, TOKEN_COOKIE, USER_COOKIE } from "@/lib/auth";

// Sign-in proxy. The browser posts credentials here rather than cross-origin
// to api.train321.com, so the bearer token can be parked in an httpOnly cookie
// that page scripts (and any injected third-party script) cannot read.
export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) as {
      email?: string;
      password?: string;
    };
    if (!email || !password) {
      return NextResponse.json(
        { message: "Enter your email and password." },
        { status: 422 }
      );
    }

    const result = await login(email, password);

    const res = NextResponse.json({
      role: result.role,
      fullName: result.fullName,
      userId: result.userId
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

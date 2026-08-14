/**
 * Sign-in against the Train321 API (Laravel Passport, OAuth bearer tokens).
 *
 *   POST {API_BASE}/user/login  { email, password }  → { token, role, ... }
 *
 * Login is a public, stateless route — no CSRF token and no prior session are
 * needed, which is why the marketing site can call it directly. The password
 * goes over as plaintext because the API md5-hashes it server-side; pre-hashing
 * here would produce a value the backend never matches.
 *
 * This module is server-only: it runs inside the /api/auth routes so the
 * password and the returned bearer token never pass through client JS.
 */

const API_BASE = process.env.API_BASE || "https://api.train321.com";

/** Shape the API returns on a successful login. */
export type LoginResult = {
  token: string;
  tokenType: string;
  role: string;
  fullName: string;
  userId: number;
};

/** Login failed for a reason worth showing the buyer (bad password, etc). */
export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

export async function login(email: string, password: string): Promise<LoginResult> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/user/login`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store"
    });
  } catch {
    throw new AuthError("We couldn't reach the sign-in service. Please try again.", 502);
  }

  const data = (await res.json().catch(() => null)) as
    | {
        token?: string;
        token_type?: string;
        role?: string;
        full_name?: string;
        user_id?: number;
        message?: string;
      }
    | null;

  if (!res.ok || !data?.token) {
    // 422 carries the backend's own wording ("Email or Password did not
    // match…", or the inactive-account notice) — surface it as-is.
    throw new AuthError(
      data?.message || "Email or password did not match, try again.",
      res.status === 422 ? 422 : res.status || 500
    );
  }

  return {
    token: data.token,
    tokenType: data.token_type || "Bearer",
    role: data.role || "",
    fullName: data.full_name || "",
    userId: Number(data.user_id) || 0
  };
}

/** Cookie holding the bearer token. httpOnly — never readable from client JS. */
export const TOKEN_COOKIE = "t321_token";
/** Display-only profile cookie (name/role), readable so the header can render. */
export const USER_COOKIE = "t321_user";

/**
 * Cross-domain handoff into the learner app.
 *
 * Signing in here only establishes a session on THIS origin. The learner app
 * is a different host with its own localStorage, so sending someone straight
 * to /#/dashboard lands them on a blank session and its router guard bounces
 * them to /#/login. Instead we trade our bearer token for a one-time code and
 * put that in the URL; the learner app redeems it at /#/sso for a session of
 * its own.
 *
 * The code — never the bearer token — is what travels through the URL, so a
 * copy stranded in browser history or a Referer header is already expired
 * (two minutes, single use).
 */
export async function issueHandoffCode(token: string): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/user/sso/issue`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: "{}",
      cache: "no-store"
    });
  } catch {
    throw new AuthError("We couldn't reach the sign-in service. Please try again.", 502);
  }

  const data = (await res.json().catch(() => null)) as
    | { code?: string; message?: string }
    | null;

  if (!res.ok || !data?.code) {
    throw new AuthError(
      data?.message || "We couldn't open your account. Please try again.",
      res.status || 500
    );
  }
  return data.code;
}

/** Learner app base, trailing slash stripped. Matches lib/enroll.ts. */
export const APP_BASE = (
  process.env.NEXT_PUBLIC_APP_BASE || "https://lms.train321.com"
).replace(/\/+$/, "");

/**
 * Build the learner-app URL that redeems a handoff code.
 * `next` is an in-app hash path (e.g. "/course_catalog"); the learner app
 * validates it again before navigating.
 *
 * The `?_cb=` before the fragment is deliberate. The learner app's host
 * serves index.html with no Cache-Control header, so browsers fall back to
 * heuristic caching and can keep serving a pre-deploy index.html — and with
 * it a stale bundle that has never heard of /#/sso, which renders the app's
 * "Page not found" instead of signing anyone in. Everything after `#` is
 * never sent to the server, so the hash alone cannot defeat that cache; a
 * real query string can. One uncached HTML fetch per sign-in is a cheap
 * price for the handoff always landing on the current build.
 *
 * `_cb` matches the parameter the learner app's own router already uses when
 * it self-recovers from a stale index (see frontend/src/routes/router.js).
 */
export function handoffUrl(code: string, next?: string | null): string {
  const q = new URLSearchParams({ code });
  if (next && /^\/[A-Za-z0-9_\-/]*$/.test(next)) q.set("next", next);
  const cb = Date.now().toString(36);
  return `${APP_BASE}/?_cb=${cb}#/sso?${q.toString()}`;
}

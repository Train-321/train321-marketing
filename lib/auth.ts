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

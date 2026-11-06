import { AsyncLocalStorage } from "node:async_hooks";

/**
 * /enrollment?test=true talks to the new-features STAGING LMS instead of
 * production — courses, accounts, link tokens, pricing and the purchase all
 * come from there, so a tester never touches production data.
 *
 * Static on purpose (no env var): this is the only page that uses it, and
 * only when the URL carries test=true. Server-only — the browser never sees
 * this module; it just passes the flag to the page's own /api/enroll routes,
 * which wrap their work in withStageApi() too.
 */
export const STAGE_API_BASE = "https://new-features-api.train321.com";

type Slot = typeof globalThis & {
  __t321LmsBaseStore?: AsyncLocalStorage<string>;
  __t321LmsBaseOverride?: () => string | undefined;
};
const slot = globalThis as Slot;

// One store per process, kept on globalThis so the page bundle and the route
// handler bundles (and dev hot reloads) all share it.
const store = (slot.__t321LmsBaseStore ??= new AsyncLocalStorage<string>());
// lib/lmsBase.ts reads this; outside withStageApi() it answers undefined, so
// every other request keeps the production base.
slot.__t321LmsBaseOverride = () => store.getStore();

/** True for ?test=true (the same flag that switches Stripe to test keys). */
export function isTestParam(v: string | string[] | undefined | null): boolean {
  const s = Array.isArray(v) ? v[0] : v;
  return String(s || "").toLowerCase() === "true";
}

/**
 * Where a ?test=true visit should run:
 *
 *   off         no test flag — production, live Stripe keys (the normal page)
 *   production  test link MADE BY PRODUCTION — production API and data, but
 *               the purchase is charged with Stripe TEST keys (LMS dev mode)
 *   stage       any other test link — the staging LMS end to end
 */
export type TestTarget = "off" | "production" | "stage";

// Same default the link-validate route uses for the production API.
const PROD_API_BASE = process.env.API_BASE || "https://api.train321.com";

/**
 * Decide the target for this visit. A test link's sign-in token (?elt=) only
 * exists on the LMS that emailed it, so asking production "is this yours?"
 * tells the two kinds of test link apart without another URL parameter. The
 * check is the same read-only validate call the page makes anyway. No token,
 * an unknown token, or production not answering all mean staging — the safe
 * side, since nothing there is real.
 */
export async function resolveTestTarget(
  testParam: string | string[] | undefined | null,
  linkToken: string | string[] | undefined | null
): Promise<TestTarget> {
  if (!isTestParam(testParam)) return "off";
  const token = String((Array.isArray(linkToken) ? linkToken[0] : linkToken) || "").trim();
  if (!token) return "stage";
  try {
    const res = await fetch(`${PROD_API_BASE}/api/enroll-link/validate`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000)
    });
    const data = (await res.json().catch(() => null)) as { success?: boolean } | null;
    if (res.ok && data?.success) return "production";
  } catch {
    /* production unreachable or slow: fall through to staging */
  }
  return "stage";
}

/**
 * Run `fn` against the staging LMS when `on`; otherwise just run it. The
 * override lives in async context, so it covers everything `fn` awaits and
 * nothing else — a concurrent normal request is unaffected.
 */
export function withStageApi<T>(on: boolean, fn: () => Promise<T>): Promise<T> {
  return on ? store.run(STAGE_API_BASE, fn) : fn();
}

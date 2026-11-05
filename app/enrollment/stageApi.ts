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
 * Run `fn` against the staging LMS when `on`; otherwise just run it. The
 * override lives in async context, so it covers everything `fn` awaits and
 * nothing else — a concurrent normal request is unaffected.
 */
export function withStageApi<T>(on: boolean, fn: () => Promise<T>): Promise<T> {
  return on ? store.run(STAGE_API_BASE, fn) : fn();
}

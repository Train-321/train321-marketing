// Server-side helpers for the California RBS ad landing page (/california-rbs).
//
// The page has its own LMS endpoints (/api/ads/ca-rbs/*, see the LMS's
// App\Http\Controllers\Ads\CaRbsLandingController) and its own marketing API
// routes (/api/ads/ca-rbs/*), so it never touches the shared /enroll or
// /enrollment flows. The LMS resolves which course this page sells — the
// browser never sends a course id.
//
// Server-only: imported by the page and the route handlers, never by client
// components, so the LMS base URL stays off the client.

import { secureImageUrl } from "@/lib/newFeatures";
import type { CartCourse } from "@/lib/enroll";

export const LMS_API_BASE = (process.env.API_BASE || "https://api.train321.com").replace(/\/+$/, "");
const ADS = `${LMS_API_BASE}/api/ads/ca-rbs`;

const MAX_COURSES = 10;

/**
 * Course ids from the page URL, the /enrollment way: ?ids=1,2 (also ?course=
 * and ?id=). Positive whole numbers, no repeats, at most ten. The LMS checks
 * each one again and falls back to the California RBS course when none is
 * valid, so this is only a wish list.
 */
export function parseCourseIds(...values: Array<string | string[] | undefined>): number[] {
  const raw = values.flat().filter(Boolean).join(",");
  return [...new Set(raw.split(",").map((v) => Number(v.trim())).filter((n) => Number.isInteger(n) && n > 0))].slice(0, MAX_COURSES);
}

/** course_ids from a browser request body, cleaned the same way. */
export function cleanCourseIds(input: unknown): number[] {
  if (!Array.isArray(input)) return [];
  return [...new Set(input.map((v) => Number(v)).filter((n) => Number.isInteger(n) && n > 0))].slice(0, MAX_COURSES);
}

/**
 * The cart's courses (ids from the URL, else the California RBS course),
 * shaped like the rest of the storefront's cart. Empty when the LMS can't
 * offer any right now.
 */
export async function getRbsCourses(ids: number[] = []): Promise<CartCourse[]> {
  try {
    const q = ids.length ? `?ids=${ids.join(",")}` : "";
    const res = await fetch(`${ADS}/courses${q}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 }
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      success?: boolean;
      courses?: Array<{
        id: number;
        name?: string;
        marketplace_name?: string;
        price?: number;
        image?: string | null;
        is_seat_based?: number;
        state_label?: string | null;
      }>;
    };
    if (!data?.success || !Array.isArray(data.courses)) return [];
    return data.courses
      .filter((c) => c && c.id)
      .map((c) => ({
        id: c.id,
        // Marketplace display name — the internal admin name never surfaces.
        name: c.marketplace_name || c.name || "",
        price: Number(c.price ?? 0),
        image: secureImageUrl(c.image),
        isSeatBased: Number(c.is_seat_based ?? 0) === 1,
        stateLabel: c.state_label || null
      }));
  } catch {
    return [];
  }
}

/**
 * POST to one of the page's LMS endpoints. Returns the status and parsed body
 * as-is so the route handlers can pass the LMS's own messages through.
 */
export async function adsPost(
  path: "quote" | "check-email" | "checkout" | "checkout-existing",
  body: unknown,
  bearer?: string
): Promise<{ status: number; data: Record<string, unknown> | null }> {
  const res = await fetch(`${ADS}/${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {})
    },
    body: JSON.stringify(body),
    cache: "no-store"
  });
  const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  return { status: res.status, data };
}

/** First validation message from a Laravel 422, else the plain message. */
export function lmsMessage(data: Record<string, unknown> | null, fallback: string): string {
  if (!data) return fallback;
  const errors = data.errors as Record<string, string[]> | undefined;
  if (errors) {
    const first = Object.values(errors)[0]?.[0];
    if (first) return first;
  }
  return typeof data.message === "string" && data.message ? data.message : fallback;
}

/** Ad attribution the browser captured on landing (UTM tags, click ids). */
export type Attribution = Partial<
  Record<
    | "utm_source"
    | "utm_medium"
    | "utm_campaign"
    | "utm_term"
    | "utm_content"
    | "gclid"
    | "fbclid"
    | "landing_url"
    | "referrer",
    string
  >
>;

const ATTR_KEYS: Array<[keyof Attribution, number]> = [
  ["utm_source", 190],
  ["utm_medium", 190],
  ["utm_campaign", 190],
  ["utm_term", 190],
  ["utm_content", 190],
  ["gclid", 255],
  ["fbclid", 255],
  ["landing_url", 500],
  ["referrer", 500]
];

/** Keep only the known attribution fields, as trimmed strings within the LMS limits. */
export function cleanAttribution(input: unknown): Attribution {
  const src = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const out: Attribution = {};
  for (const [key, max] of ATTR_KEYS) {
    const v = src[key];
    if (typeof v === "string" && v.trim()) out[key] = v.trim().slice(0, max);
  }
  return out;
}

// Stripe publishable keys (public by design — they can only tokenise, never
// charge). Must belong to the same Stripe account as the LMS the page talks
// to, exactly as app/checkout/page.tsx pairs them.
const STAGING_PK =
  "pk_test_51TXerrHCrvN27dgKikzbOVKiEgVrnoGpmaDOaRQ19Rggz4Vwobdezb8CughlPawXWT662nPSCAsWQPOGWdJc3I3Z00Ylg5794l";
const PROD_PK =
  "pk_live_51KO1kjFsx1ZDP6JZq7zsgP0IqRvMu9a9l84IpshxlQ9LEF8IOWSKTfLWIRehvPXdsKT0bJJwsuyKO0XzeZowDehF00IPuNMZnr";

export function rbsPublishableKey(): string {
  const apiBase = process.env.NEW_FEATURES_API_BASE || LMS_API_BASE;
  return (
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    (apiBase.includes("new-features") ? STAGING_PK : PROD_PK)
  );
}

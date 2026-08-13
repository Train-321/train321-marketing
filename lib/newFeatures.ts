// New-features LMS backend — public marketplace catalog source.
//
// The /catalog page pulls its courses, categories, and search corpus from the
// Train321 "new-features" Laravel backend (the same data the /enroll page on
// new-features.train321.com renders), NOT from Sanity/Studio.
//
// Public endpoint (no auth): POST {API_BASE}/api/list/enroll-courses
//   Body (all optional): { search, type, marketplace_category_id, per_page, page }
//   Response: { courses[], total, categories[{ id, name }] }
//
// Only courses with status=1 AND in_store=1 (i.e. enabled in the marketplace)
// are returned by the backend, which is exactly what we want to show here.

import {
  availableIn,
  resolveAvailability,
  type Availability
} from "@/lib/states";

const API_BASE = process.env.NEW_FEATURES_API_BASE || "https://api.train321.com";

// Where the Enroll button sends the buyer. Hash route on the new-features SPA;
// `?add=<id>` deep-links the course straight into the enroll cart.
export const ENROLL_BASE =
  process.env.NEW_FEATURES_ENROLL_BASE || "https://lms.train321.com/#/enroll";

export type MarketplaceCourse = {
  id: number;
  name: string;
  /**
   * The Marketplace tab's "Overview" (raw HTML) — the copy an admin wrote for
   * the public storefront. For a grouped course this is the parent group's
   * Overview, since variants carry no marketplace copy of their own.
   *
   * Deliberately NOT the course's `description`, which is the in-course
   * instructions page: when no marketplace copy exists this is empty and the
   * card simply shows no blurb, rather than leaking internal instructions text.
   */
  description: string;
  image: string | null; // fully-qualified thumbnail URL (or null)
  categoryId: number | null; // marketplace_category_id
  price: number;
  // Seat-based courses are bought in quantities and are priced through a
  // different bucket at checkout (see lib/enroll.ts splitLines), so the cart
  // needs to know which kind it's holding.
  isSeatBased: boolean;
  stateLabel: string | null;
  /**
   * Resolved availability — the structured "Select States" tags plus the
   * include/exclude flag, falling back to the free-text label. This is what
   * every state decision (filtering, ordering, badges) should read.
   */
  availability: Availability;
};

export type MarketplaceCategory = {
  id: number;
  name: string;
};

export type MarketplaceCatalog = {
  courses: MarketplaceCourse[];
  categories: MarketplaceCategory[];
  total: number;
  page: number;
  perPage: number;
};

// Local fallback shown when a course has no marketplace thumbnail (or the
// thumbnail URL fails to load).
export const COURSE_PLACEHOLDER_IMAGE = "/img/course-placeholder.svg";

/**
 * The LMS builds thumbnail URLs with Laravel's asset(), which can emit
 * plain http:// — mixed content on the https marketing site. Every image
 * URL from the API goes through here so no card ever depends on the
 * browser's auto-upgrade behavior.
 */
export function secureImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.replace(/^http:\/\//i, "https://");
}

export const CATALOG_PAGE_SIZE = 6;

// The backend `description` is rich HTML. Strip tags + decode the handful of
// entities the LMS editor emits, then trim to a short card-sized blurb.
export function toBlurb(html: string, max = 160): string {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

export type CatalogQuery = {
  search?: string;
  categoryId?: number | null;
  page?: number;
  perPage?: number;
  /**
   * 2-letter state filter, applying the site-wide availability rule: a course
   * tagged for this state matches, a course whose EXCLUDED-states list omits
   * it matches, and a course with no tags at all is available everywhere so
   * it always matches. With no stateCode the catalog shows the "available
   * everywhere" baseline — genuinely untagged courses/variants only; both
   * state-limited and state-excluding courses wait for a pick.
   */
  stateCode?: string | null;
  /**
   * Skip the availability filter entirely — every marketplace course (and
   * group variant) in scope comes back regardless of state tags. Powers the
   * finder's "these exist for specific states" fallback when a category has
   * nothing in the everywhere baseline.
   */
  anyState?: boolean;
};

type RawVariant = {
  id: number;
  name?: string;
  image?: string | null;
  price?: number;
  is_seat_based?: number;
  state_label?: string | null;
  state_codes?: string[];
  state_exclude?: number;
  state_redirect_url?: string | null;
};

type RawCourse = {
  /** Numeric for real courses; "group-<n>" strings for group entries. */
  id: number | string;
  name?: string;
  description?: string;
  marketplace_description?: string;
  image?: string | null;
  category_id?: number | null;
  price?: number;
  entry_type?: string;
  is_seat_based?: number;
  state_label?: string | null;
  state_codes?: string[];
  state_exclude?: number;
  variants?: RawVariant[];
};

/**
 * Fetch the marketplace catalog plus the ordered category list.
 *
 * Search + category filtering happen server-side on the backend; state
 * filtering and pagination happen HERE. The backend's own state_code filter
 * is strict (explicitly tagged only) and it returns group shells rather than
 * buyable courses, so instead we pull the full result set (93 courses today,
 * one cached call per search/category combo), flatten group entries into
 * their purchasable variants, apply the availability rule, and slice pages
 * locally. Group variants with a state_redirect_url (external providers) are
 * dropped — a catalog card's only action is add-to-cart, which they can't do.
 */
export async function getMarketplaceCatalog(query: CatalogQuery = {}): Promise<MarketplaceCatalog> {
  const page = Math.max(1, query.page || 1);
  const perPage = Math.max(1, query.perPage || CATALOG_PAGE_SIZE);
  const stateCode = (query.stateCode || "").trim().toUpperCase() || null;

  // No stateCode → the "available everywhere" baseline: availableIn(a, null)
  // passes only truly-untagged courses, hiding both state-limited and
  // state-excluding ones until a state is picked. anyState mode bypasses the
  // filter altogether (the caller wants to SHOW what's state-specific).
  const matches = (a: Availability): boolean =>
    query.anyState ? true : availableIn(a, stateCode);

  try {
    const res = await fetch(`${API_BASE}/api/list/enroll-courses`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        // Everything in one page — state filtering + pagination are local.
        per_page: 500,
        page: 1,
        type: "all",
        search: query.search || "",
        marketplace_category_id: query.categoryId || ""
      }),
      // Revalidate every 5 minutes so newly enabled/disabled courses surface
      // without a redeploy, while keeping the page fast.
      next: { revalidate: 300 }
    });

    if (!res.ok) {
      throw new Error(`enroll-courses responded ${res.status}`);
    }

    const data = (await res.json()) as {
      courses?: RawCourse[];
      categories?: MarketplaceCategory[];
      total?: number;
    };

    const all: MarketplaceCourse[] = [];
    const seen = new Set<number>();

    for (const c of data.courses || []) {
      if (c.entry_type === "group") {
        // A group is a container, not a product — surface its variants that
        // fit the state instead of an unbuyable "group-6" card.
        for (const v of c.variants || []) {
          const id = Number(v.id);
          if (v.state_redirect_url || !v.name) continue;
          if (!Number.isInteger(id) || id <= 0 || seen.has(id)) continue;
          const availability = resolveAvailability(v.state_label, v.state_codes, v.state_exclude);
          if (!matches(availability)) continue;
          seen.add(id);
          all.push({
            id,
            name: v.name,
            // Variants have no marketplace_description of their own, so they
            // inherit the group's Overview — the copy an admin wrote for this
            // family of courses. Still never the variant's own `description`,
            // which is the in-course instructions page.
            description: c.marketplace_description || "",
            image: secureImageUrl(v.image),
            categoryId: c.category_id ?? null,
            price: Number(v.price ?? 0),
            isSeatBased: Number(v.is_seat_based ?? 0) === 1,
            stateLabel: v.state_label || null,
            availability
          });
        }
        continue;
      }

      const id = Number(c.id);
      if (!Number.isInteger(id) || id <= 0 || seen.has(id)) continue;
      const availability = resolveAvailability(c.state_label, c.state_codes, c.state_exclude);
      if (!matches(availability)) continue;
      seen.add(id);
      all.push({
        id,
        name: c.name || "",
        // Marketplace Overview ONLY — no fallback to the instructions
        // `description`. Empty marketplace copy → empty card blurb, by design.
        description: c.marketplace_description || "",
        image: secureImageUrl(c.image),
        categoryId: c.category_id ?? null,
        price: Number(c.price ?? 0),
        isSeatBased: Number(c.is_seat_based ?? 0) === 1,
        stateLabel: c.state_label || null,
        availability
      });
    }

    const categories: MarketplaceCategory[] = (data.categories || []).map((c) => ({
      id: c.id,
      name: c.name
    }));

    // With a state picked, that state's own versions lead and the broadly
    // available courses (everywhere / everywhere-except) follow. Stable
    // sort, so the backend's ordering is kept within each bucket.
    if (stateCode) {
      const specific = (c: MarketplaceCourse) => c.availability.kind === "in";
      all.sort((a, b) => Number(specific(b)) - Number(specific(a)));
    }

    return {
      courses: all.slice((page - 1) * perPage, page * perPage),
      categories,
      total: all.length,
      page,
      perPage
    };
  } catch {
    // Network/backend hiccup — render an empty catalog rather than crash the page.
    return { courses: [], categories: [], total: 0, page, perPage };
  }
}

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
import {
  applyInferredState,
  dedupeByName,
  type CourseGroupSummary
} from "@/lib/courseGroups";

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
  /**
   * The LMS Course Group this course belongs to ("group-8"), or null for an
   * ungrouped course. Set when a group entry is flattened into its variants,
   * and what the group chips filter by — so the marketing groups are driven by
   * the LMS admin, not a hardcoded list.
   */
  lmsGroupId: string | null;
};

export type MarketplaceCategory = {
  id: number;
  name: string;
  /**
   * Whether this category's courses are written per state — derived from its
   * courses, the same way a group's is from its variants. A state-regulated
   * category opens the state dialog before it filters; a nationwide one filters
   * straight through.
   */
  stateAware: boolean;
  /** States this category has a course written specifically for. */
  stateCodes: string[];
};

export type MarketplaceCatalog = {
  courses: MarketplaceCourse[];
  categories: MarketplaceCategory[];
  /**
   * The merged category+group taxonomy the storefront browses by. Always
   * summarized from the FULL corrected result set, so it stays complete even
   * when the courses array itself is filtered down to one group.
   */
  groups: CourseGroupSummary[];
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
  /**
   * Course-group slug (see lib/courseGroups.ts) — the merged category+group
   * taxonomy the home finder browses by. Applied locally after the backend
   * responds, because a group can claim courses the LMS left uncategorised.
   */
  groupId?: string | null;
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
  /** The variant's own marketplace Overview. Older backends omit it. */
  marketplace_description?: string;
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

  // No state picked → show the whole catalog, each card badged with where it
  // applies (see availabilityShort / CourseCard).
  //
  // This used to be an "available everywhere" baseline: availableIn(a, null)
  // passes ONLY untagged courses. But essentially every real course carries
  // state tags, so categories like Food Handler and Alcohol Safety rendered a
  // chip and then "No courses match your search" — with 4 and 10 courses
  // respectively sitting behind it, covering 48 states between them. Hiding
  // stock from a buyer who hasn't picked a state yet loses the sale outright,
  // and the state dropdown is right there to narrow things down.
  //
  // Once a state IS picked nothing changes: availableIn() decides exactly as
  // before, and the sort further down still floats that state's own versions
  // to the top. anyState keeps working for callers that ask for it explicitly.
  const matches = (a: Availability): boolean =>
    query.anyState || stateCode === null ? true : availableIn(a, stateCode);

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

    // Everything the backend returned, before any state or group filtering —
    // title-based state inference has to run over the whole set first, or a
    // course whose state only exists in its title gets filtered out by the
    // very tags we're about to correct.
    const parsed: MarketplaceCourse[] = [];
    const seen = new Set<number>();
    // LMS Course Group meta, keyed by the "group-N" id, captured as the group
    // entries are flattened. The chip list is built from this — so the groups
    // shown on the storefront are exactly the ones managed in the LMS admin.
    const groupMeta = new Map<string, { name: string; description: string }>();

    for (const c of data.courses || []) {
      if (c.entry_type === "group") {
        const gid = String(c.id); // "group-8"
        groupMeta.set(gid, {
          name: c.name || "Courses",
          description: c.marketplace_description || ""
        });
        // A group is a container, not a product — surface its variants that
        // fit the state instead of an unbuyable "group-6" card. Each variant
        // carries the group id so the group chip can filter to it.
        for (const v of c.variants || []) {
          const id = Number(v.id);
          if (v.state_redirect_url || !v.name) continue;
          if (!Number.isInteger(id) || id <= 0 || seen.has(id)) continue;
          const availability = resolveAvailability(v.state_label, v.state_codes, v.state_exclude);
          seen.add(id);
          parsed.push({
            id,
            name: v.name,
            // Prefer the variant's own marketplace Overview (e.g. the Florida
            // course's state-specific copy), falling back to the group's when
            // the variant has none — or when the backend predates the field.
            // Still never the variant's `description`, which is the in-course
            // instructions page.
            description: v.marketplace_description || c.marketplace_description || "",
            image: secureImageUrl(v.image),
            categoryId: c.category_id ?? null,
            price: Number(v.price ?? 0),
            isSeatBased: Number(v.is_seat_based ?? 0) === 1,
            stateLabel: v.state_label || null,
            availability,
            lmsGroupId: gid
          });
        }
        continue;
      }

      const id = Number(c.id);
      if (!Number.isInteger(id) || id <= 0 || seen.has(id)) continue;
      const availability = resolveAvailability(c.state_label, c.state_codes, c.state_exclude);
      seen.add(id);
      parsed.push({
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
        availability,
        lmsGroupId: null
      });
    }

    // Correct state tags the LMS never filled in, reading the state out of the
    // course title. Narrowly scoped — see applyInferredState().
    const corrected = parsed.map(applyInferredState);

    // Enrich each category with its state info, derived from its own courses —
    // so a category chip can open the same state dialog a group does. Built
    // over the full corrected set, so it's independent of any active filter.
    const categories: MarketplaceCategory[] = (data.categories || []).map((c) => {
      const members = corrected.filter((m) => m.categoryId === c.id);
      const stateCodes = new Set<string>();
      let stateAware = false;
      for (const m of members) {
        if (m.availability.kind === "in") {
          stateAware = true;
          for (const code of m.availability.codes) stateCodes.add(code);
        }
      }
      return {
        id: c.id,
        name: c.name,
        stateAware,
        stateCodes: Array.from(stateCodes).sort()
      };
    });

    // Chip summaries for the LMS Course Groups, built from the FULL corrected
    // set so the chip row stays complete even when the courses are filtered
    // down to a single group. State-awareness is derived from the group's own
    // variants: a group with state-specific versions opens the state dialog; a
    // nationwide one filters straight through.
    const lmsGroups: CourseGroupSummary[] = Array.from(groupMeta.entries())
      .map(([gid, meta]) => {
        const members = corrected.filter((c) => c.lmsGroupId === gid);
        const stateCodes = new Set<string>();
        let stateAware = false;
        for (const m of members) {
          if (m.availability.kind === "in") {
            stateAware = true;
            for (const code of m.availability.codes) stateCodes.add(code);
          }
        }
        const prices = members.map((m) => m.price).filter((p) => p > 0);
        return {
          id: gid,
          name: meta.name,
          blurb: meta.description ? toBlurb(meta.description) : "",
          icon: "fas fa-layer-group",
          stateAware,
          count: members.length,
          priceFrom: prices.length ? Math.min(...prices) : 0,
          stateCodes: Array.from(stateCodes).sort()
        };
      })
      .filter((g) => g.count > 0);

    // Group filter runs on the corrected set, matching the course's LMS group
    // id — the same ids the chips carry.
    const scoped = query.groupId
      ? corrected.filter((c) => c.lmsGroupId === query.groupId)
      : corrected;

    let all = scoped.filter((c) => matches(c.availability));

    // With a state picked, that state's own versions lead and the broadly
    // available courses (everywhere / everywhere-except) follow. Stable
    // sort, so the backend's ordering is kept within each bucket.
    if (stateCode) {
      const specific = (c: MarketplaceCourse) => c.availability.kind === "in";
      all.sort((a, b) => Number(specific(b)) - Number(specific(a)));
    }

    // Collapse cards that read identically — the LMS ships one course per
    // state bucket under a single name. Runs AFTER the sort so the version
    // that survives is the one most relevant to the picked state.
    all = dedupeByName(all);

    return {
      courses: all.slice((page - 1) * perPage, page * perPage),
      categories,
      groups: lmsGroups,
      total: all.length,
      page,
      perPage
    };
  } catch {
    // Network/backend hiccup — render an empty catalog rather than crash the page.
    return { courses: [], categories: [], groups: [], total: 0, page, perPage };
  }
}

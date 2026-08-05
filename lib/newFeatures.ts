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

const API_BASE = process.env.NEW_FEATURES_API_BASE || "https://new-features-api.train321.com";

// Where the Enroll button sends the buyer. Hash route on the new-features SPA;
// `?add=<id>` deep-links the course straight into the enroll cart.
export const ENROLL_BASE =
  process.env.NEW_FEATURES_ENROLL_BASE || "https://new-features.train321.com/#/enroll";

export type MarketplaceCourse = {
  id: number;
  name: string;
  /**
   * The Marketplace tab's "Overview" (raw HTML) — the copy an admin wrote for
   * the public storefront. Deliberately NOT the course's `description`, which
   * is the in-course instructions page: when no marketplace copy exists this
   * is empty and the card simply shows no blurb, rather than leaking internal
   * instructions text.
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

export const CATALOG_PAGE_SIZE = 6;

export type CatalogQuery = {
  search?: string;
  categoryId?: number | null;
  page?: number;
  perPage?: number;
};

type RawCourse = {
  id: number;
  name?: string;
  description?: string;
  marketplace_description?: string;
  image?: string | null;
  category_id?: number | null;
  price?: number;
  entry_type?: string;
  is_seat_based?: number;
  state_label?: string | null;
};

/**
 * Fetch one page of marketplace-enabled courses plus the ordered category list.
 * Search + category filtering + pagination are all handled server-side by the
 * backend so the catalog page loads incrementally (infinite scroll) instead of
 * pulling every course at once.
 */
export async function getMarketplaceCatalog(query: CatalogQuery = {}): Promise<MarketplaceCatalog> {
  const page = Math.max(1, query.page || 1);
  const perPage = Math.max(1, query.perPage || CATALOG_PAGE_SIZE);

  try {
    const res = await fetch(`${API_BASE}/api/list/enroll-courses`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        per_page: perPage,
        page,
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

    const courses: MarketplaceCourse[] = (data.courses || []).map((c) => ({
      id: c.id,
      name: c.name || "",
      // Marketplace Overview ONLY — no fallback to the instructions
      // `description`. Empty marketplace copy → empty card blurb, by design.
      description: c.marketplace_description || "",
      image: c.image || null,
      categoryId: c.category_id ?? null,
      price: Number(c.price ?? 0),
      isSeatBased: Number(c.is_seat_based ?? 0) === 1,
      stateLabel: c.state_label || null
    }));

    const categories: MarketplaceCategory[] = (data.categories || []).map((c) => ({
      id: c.id,
      name: c.name
    }));

    return { courses, categories, total: Number(data.total ?? courses.length), page, perPage };
  } catch {
    // Network/backend hiccup — render an empty catalog rather than crash the page.
    return { courses: [], categories: [], total: 0, page, perPage };
  }
}

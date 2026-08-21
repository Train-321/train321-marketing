// Course groups — the single top-level taxonomy the storefront browses by.
//
// WHY THIS FILE EXISTS
//
// The LMS hands us two overlapping ways to slice the catalog and neither one
// is usable on its own:
//
//   • marketplace CATEGORIES (5 of them: Alcohol Safety, Food Handler,
//     Sexual Harassment, Back of House, Front of House)
//   • marketplace GROUPS (3 of them: "Alcohol Safety Group" → category 2,
//     "Food Handler" → category 3, "Safety Courses" → category 5)
//
// Every group sits INSIDE a category and duplicates its name, so surfacing
// both gave the buyer "Alcohol Safety" twice. Worse, getMarketplaceCatalog()
// flattens a group into its variants, which is how the catalog ended up
// showing two cards both reading "Food Handler Certificate" — the exact
// duplication this module removes.
//
// So: one merged concept. A course group is a category and its group folded
// together, and it is the ONLY thing the home finder puts on screen up top.
// Picking one asks the buyer for their state, then shows the versions that
// actually apply there.
//
// DATA CAVEAT — read before trusting `sexual-harassment`
//
// Category 4 ("Sexual Harassment") has exactly ONE course tagged to it in the
// LMS today; the other thirteen harassment courses — including every
// state-specific one (AZ, CA, NY, IL, DC) — carry category_id: null. Those
// are also missing their state tags. Until an admin fixes the tagging in the
// LMS, `namePattern` claims them by title and `inferStateCode()` reads the
// state out of the title. Both are stopgaps: delete them once the backend
// data is right, and nothing else here has to change.

import {
  STATE_NAMES,
  availableIn,
  type Availability
} from "@/lib/states";

export type CourseGroupDef = {
  /** Stable slug — what the UI and the ?group= query param pass around. */
  id: string;
  name: string;
  blurb: string;
  /** Font Awesome class, matching the icon idiom used across the marketing site. */
  icon: string;
  /** The LMS marketplace category this group absorbs. */
  categoryId: number | null;
  /**
   * Claims courses the LMS left uncategorised, matched on title. Only
   * consulted when a course has no category_id of its own — a real category
   * always wins, so this can never steal a correctly-tagged course.
   */
  namePattern?: RegExp;
  /**
   * Does the answer depend on where the buyer works? True for the compliance
   * groups (the law differs by state); false for role training like Front of
   * House, which is the same course everywhere. Only state-aware groups open
   * the state dialog — asking "which state?" about Knife Safety is noise.
   */
  stateAware: boolean;
};

/**
 * Display order is deliberate: the three state-regulated compliance groups
 * lead (they're what people arrive searching for), role training follows.
 */
export const COURSE_GROUPS: CourseGroupDef[] = [
  {
    id: "alcohol-safety",
    name: "Alcohol Safety",
    blurb: "Seller/server certification — TABC, Florida Responsible Vendor, NY ATAP and more.",
    icon: "fas fa-wine-glass",
    categoryId: 2,
    stateAware: true
  },
  {
    id: "food-handler",
    name: "Food Handler",
    blurb: "ANSI-accredited food handler cards accepted by state and county health departments.",
    icon: "fas fa-utensils",
    categoryId: 3,
    stateAware: true
  },
  {
    id: "sexual-harassment",
    name: "Sexual Harassment",
    blurb: "State-mandated prevention training for employees and managers.",
    icon: "fas fa-user-shield",
    categoryId: 4,
    // See the DATA CAVEAT above — this is covering for missing category tags.
    namePattern: /harassment/i,
    stateAware: true
  },
  {
    id: "back-of-house",
    name: "Back of House",
    blurb: "Kitchen skills and safety — line, prep, dish, and the equipment around them.",
    icon: "fas fa-fire-burner",
    categoryId: 5,
    stateAware: false
  },
  {
    id: "front-of-house",
    name: "Front of House",
    blurb: "Service, hospitality, and bar training for everyone the guest actually meets.",
    icon: "fas fa-champagne-glasses",
    categoryId: 6,
    stateAware: false
  }
];

export function groupById(id: string | null | undefined): CourseGroupDef | null {
  if (!id) return null;
  return COURSE_GROUPS.find((g) => g.id === id) || null;
}

/**
 * Which group does this course belong to? Category tag first, title pattern
 * only as the documented fallback. Returns null for the ~76 courses the LMS
 * has left uncategorised — they stay reachable under "All courses".
 */
export function groupIdForCourse(course: {
  name: string;
  categoryId: number | null;
}): string | null {
  if (course.categoryId !== null) {
    const byCategory = COURSE_GROUPS.find((g) => g.categoryId === course.categoryId);
    // A tagged course belongs to its category's group or to nothing at all —
    // never fall through to the title patterns, which are strictly a
    // stand-in for MISSING tags.
    return byCategory ? byCategory.id : null;
  }
  const byName = COURSE_GROUPS.find((g) => g.namePattern?.test(course.name));
  return byName ? byName.id : null;
}

// ---------------------------------------------------------------------------
// Title → state inference
// ---------------------------------------------------------------------------

/**
 * Longest name first so "West Virginia" is tested before "Virginia" and
 * claims the match.
 */
const STATE_NAME_MATCHERS = Object.entries(STATE_NAMES)
  .map(([code, name]) => ({ code, re: new RegExp(`\\b${name}\\b`, "i") }))
  .sort((a, b) => b.re.source.length - a.re.source.length);

/** Shorthands the LMS actually uses in course titles. */
const STATE_ALIAS_MATCHERS: Array<{ code: string; re: RegExp }> = [
  { code: "DC", re: /\bD\.?C\.?\b/ },
  { code: "TX", re: /\bTABC\b/i },
  { code: "NY", re: /\bATAP\b/i },
  { code: "CA", re: /\bRBS\b/ }
];

/**
 * Pull a state out of a course title — "Sexual Harassment Prevention -
 * California / Manager" → "CA".
 *
 * DELIBERATELY NARROW. Applied to every course this would mislabel wine
 * courses ("California Chardonnay" is not a California-only product), so
 * callers must only use it on courses that are (a) in a state-aware group and
 * (b) carrying no state tags of their own. See applyInferredState().
 */
export function inferStateCode(name: string): string | null {
  for (const m of STATE_ALIAS_MATCHERS) if (m.re.test(name)) return m.code;
  for (const m of STATE_NAME_MATCHERS) if (m.re.test(name)) return m.code;
  return null;
}

/**
 * Upgrade an untagged course in a state-aware group to the state named in its
 * title. A course that already carries LMS state tags is returned untouched —
 * real data always beats a guess.
 */
export function applyInferredState<T extends { name: string; categoryId: number | null; availability: Availability }>(
  course: T
): T {
  if (course.availability.kind !== "all") return course;
  const group = groupById(groupIdForCourse(course));
  if (!group?.stateAware) return course;
  const code = inferStateCode(course.name);
  if (!code) return course;
  return { ...course, availability: { kind: "in", codes: [code] } };
}

// ---------------------------------------------------------------------------
// Duplicate collapsing
// ---------------------------------------------------------------------------

const normalizeName = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/**
 * Collapse courses that read identically on a card.
 *
 * The LMS ships the same product once per state bucket — two separate courses
 * both literally named "Food Handler Certificate", one covering 7 states and
 * one covering 41. Side by side they are indistinguishable and the buyer can
 * only guess. Callers sort the most relevant one first (see the state sort in
 * getMarketplaceCatalog), so keeping the first occurrence keeps the right one.
 */
export function dedupeByName<T extends { name: string }>(courses: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const c of courses) {
    const key = normalizeName(c.name);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Group summaries for the chips
// ---------------------------------------------------------------------------

export type CourseGroupSummary = {
  id: string;
  name: string;
  blurb: string;
  icon: string;
  stateAware: boolean;
  /** Distinct courses in the group, after duplicate collapsing. */
  count: number;
  /** Cheapest seat price in the group, for "from $X" copy. 0 when unpriced. */
  priceFrom: number;
  /**
   * States this group has a version written specifically for. Powers the
   * "we have a Texas version" reassurance in the state dialog; a state absent
   * from this list still gets the group's nationwide courses.
   */
  stateCodes: string[];
};

/** Build the chip-row summaries from a resolved course list. */
export function summarizeGroups(
  courses: Array<{
    name: string;
    categoryId: number | null;
    price: number;
    availability: Availability;
  }>
): CourseGroupSummary[] {
  return COURSE_GROUPS.map((g) => {
    const members = dedupeByName(
      courses.filter((c) => groupIdForCourse(c) === g.id)
    );
    const prices = members.map((m) => m.price).filter((p) => p > 0);
    const stateCodes = new Set<string>();
    for (const m of members) {
      if (m.availability.kind === "in") {
        for (const code of m.availability.codes) stateCodes.add(code);
      }
    }
    return {
      id: g.id,
      name: g.name,
      blurb: g.blurb,
      icon: g.icon,
      stateAware: g.stateAware,
      count: members.length,
      priceFrom: prices.length ? Math.min(...prices) : 0,
      stateCodes: Array.from(stateCodes).sort()
    };
  }).filter((g) => g.count > 0);
}

/** How many courses in this group apply in a given state. */
export function countForState(
  courses: Array<{ name: string; categoryId: number | null; availability: Availability }>,
  groupId: string,
  code: string | null
): number {
  return dedupeByName(
    courses.filter(
      (c) => groupIdForCourse(c) === groupId && (code === null || availableIn(c.availability, code))
    )
  ).length;
}

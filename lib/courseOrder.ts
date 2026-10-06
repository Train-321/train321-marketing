// Shared ordering for places that list course pages (the /courses hub and the
// "Related courses" block). Sanity returns courses alphabetically; these put
// the ones people actually come for in front.

/** Catch-all pages — not courses in their own right, so they sort last and
    never count as "the same category" as a real course. */
export const CATCH_ALL_SLUGS = new Set(["additional-courses", "custom-courses"]);

export const LEAD_ORDER = [
  "food-handler",
  "food-manager",
  "alcohol",
  "rbs",
  "tabc",
  "sexual-harassment",
  "california-sexual-harassment",
  "new-york-sexual-harassment",
  "illinois-sexual-harassment",
  "human-trafficking"
];

/** Lower sorts first. Lead courses in LEAD_ORDER, then everything else, then
    the catch-all pages. */
export function courseRank(slug: string): number {
  if (CATCH_ALL_SLUGS.has(slug)) return LEAD_ORDER.length + 1;
  const i = LEAD_ORDER.indexOf(slug);
  return i === -1 ? LEAD_ORDER.length : i;
}

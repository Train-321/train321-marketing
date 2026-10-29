import { getMarketplaceCatalog, type MarketplaceCourse } from "@/lib/newFeatures";
import type { CartCourse } from "@/lib/enroll";
import { parseStateTag, STATE_NAMES } from "@/lib/states";

// Courses offered next to the one in the email — the "add to your order"
// box on /enrollment.
//
//   • Cart has a state (e.g. the Florida food handler): the other courses
//     sold in that state that aren't in the cart yet — that state's own
//     versions first, then the nationwide ones.
//   • Cart has no state: "popular" courses — the list the client picks in
//     Studio (Enrollment Page → Popular courses); if that's empty, the
//     nationwide compliance courses (food handler, alcohol, harassment).
//
// Variants of something already in the cart (same LMS course group) and
// other-language versions are skipped so each pick is a distinct "yes".

const ALCOHOL = 2;
const FOOD_HANDLER = 3;
const MAX = 3;

const isCompliance = (c: MarketplaceCourse) =>
  c.categoryId === ALCOHOL || c.categoryId === FOOD_HANDLER || /sexual harassment/i.test(c.name);

const toCart = (c: MarketplaceCourse): CartCourse => ({
  id: c.id,
  name: c.name,
  price: c.price,
  image: c.image,
  isSeatBased: c.isSeatBased,
  stateLabel: c.stateLabel
});

/**
 * The state the cart is for: the first course whose LMS state tag names
 * exactly one state ("FL" or "Florida"), else null. Multi-state and
 * nationwide tags don't pin the cart to a state.
 */
function cartState(cart: CartCourse[]): string | null {
  for (const c of cart) {
    const parsed = parseStateTag(c.stateLabel);
    if (parsed.states !== "all" && parsed.states.length === 1) return parsed.states[0];
  }
  return null;
}

/** A usable 2-letter state code from the URL's &state=, else null ("ALL" counts as none). */
export function stateFromParam(raw: string | null | undefined): string | null {
  const code = (raw || "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) && STATE_NAMES[code] ? code : null;
}

export type AddOnSuggestions = {
  picks: CartCourse[];
  /** True when the picks are courses written for the cart's state; false when they're the popular list. */
  byState: boolean;
};

export async function suggestAddOns(
  cart: CartCourse[],
  popularIds: number[] = [],
  /** &state= from the link, which wins over the cart's own tags. */
  stateParam: string | null = null
): Promise<AddOnSuggestions> {
  const none: AddOnSuggestions = { picks: [], byState: false };
  if (cart.length === 0) return none;
  const stateCode = stateFromParam(stateParam) ?? cartState(cart);

  let courses: MarketplaceCourse[];
  try {
    // The whole catalog, every state: the state branch needs the courses
    // tagged for its state, the popular branch whatever the client picked.
    ({ courses } = await getMarketplaceCatalog({ anyState: true, keepVariants: true, perPage: 500 }));
  } catch {
    return none;
  }

  const inCart = new Set(cart.map((c) => c.id));
  const groups = new Set(courses.filter((c) => inCart.has(c.id) && c.lmsGroupId).map((c) => c.lmsGroupId!));
  const spanish = cart.some((c) => /spanish/i.test(c.name));

  const eligible = (c: MarketplaceCourse) =>
    !inCart.has(c.id) &&
    c.price > 0 &&
    !(c.lmsGroupId && groups.has(c.lmsGroupId)) &&
    /spanish/i.test(c.name) === spanish;

  const picks: MarketplaceCourse[] = [];
  const take = (c: MarketplaceCourse) => {
    if (picks.length >= MAX || picks.some((p) => p.id === c.id) || !eligible(c)) return;
    picks.push(c);
    if (c.lmsGroupId) groups.add(c.lmsGroupId);
  };

  // Courses WRITTEN for this state (tagged with it in the LMS). Untagged
  // "sold everywhere" courses don't count — a state with none of its own
  // falls through to the popular list below.
  if (stateCode) {
    const forState = courses.filter((c) => c.availability.kind === "in" && c.availability.codes.includes(stateCode));
    for (const c of forState) if (isCompliance(c)) take(c);
    for (const c of forState) take(c);
    if (picks.length > 0) return { picks: picks.map(toCart), byState: true };
  }

  // Studio's picks in the order the client listed them…
  for (const id of popularIds) {
    const c = courses.find((x) => x.id === id);
    if (c) take(c);
  }
  // …then nationwide compliance courses until the box is full.
  for (const c of courses) if (c.availability.kind === "all" && isCompliance(c)) take(c);

  return { picks: picks.map(toCart), byState: false };
}

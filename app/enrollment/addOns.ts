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

export async function suggestAddOns(
  cart: CartCourse[],
  popularIds: number[] = [],
  /** &state= from the link, which wins over the cart's own tags. */
  stateParam: string | null = null
): Promise<CartCourse[]> {
  if (cart.length === 0) return [];
  const stateCode = stateFromParam(stateParam) ?? cartState(cart);

  let courses: MarketplaceCourse[];
  try {
    // With a state: filtered to what's sold there, that state's own versions
    // first. Without: the whole catalog, so Studio's popular picks resolve
    // whatever state they're written for.
    ({ courses } = await getMarketplaceCatalog(
      stateCode ? { stateCode, perPage: 500 } : { anyState: true, keepVariants: true, perPage: 500 }
    ));
  } catch {
    return [];
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

  if (stateCode) {
    // An untagged course whose title leads with another state's code
    // ("CA Sexual Harassment…") is not a pick for this state, whatever the
    // LMS tags say.
    const namedForOtherState = (c: MarketplaceCourse) => {
      const m = /^([A-Z]{2})\b/.exec(c.name.trim());
      return Boolean(m && STATE_NAMES[m[1]] && m[1] !== stateCode);
    };
    const fits = (c: MarketplaceCourse) => !namedForOtherState(c);
    // This state's own versions first, then nationwide compliance courses,
    // then whatever else is sold there.
    for (const c of courses) if (c.availability.kind === "in" && fits(c)) take(c);
    for (const c of courses) if (isCompliance(c) && fits(c)) take(c);
    for (const c of courses) if (fits(c)) take(c);
  } else {
    // Studio's picks in the order the client listed them…
    for (const id of popularIds) {
      const c = courses.find((x) => x.id === id);
      if (c) take(c);
    }
    // …then nationwide compliance courses until the box is full.
    for (const c of courses) if (c.availability.kind === "all" && isCompliance(c)) take(c);
  }

  return picks.map(toCart);
}

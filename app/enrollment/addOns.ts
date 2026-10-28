import { getMarketplaceCatalog, type MarketplaceCourse } from "@/lib/newFeatures";
import type { CartCourse } from "@/lib/enroll";

// Courses to offer next to the one in the email — the "add to your order"
// list on /marketing-v10. Picks, in order:
//   1. the other compliance courses for the same state (food handler, alcohol,
//      harassment prevention) the buyer doesn't already have in the cart;
//   2. one role skill that pairs with the lead course's category.
// Variants of something already in the cart (same LMS course group), manager
// tiers and other-language versions are skipped so each pick is a distinct,
// obvious "yes" for the same person.

const ALCOHOL = 2;
const FOOD_HANDLER = 3;
const SKILL_FOR: Record<number, RegExp> = {
  [ALCOHOL]: /^bartending 101$/i,
  [FOOD_HANDLER]: /^food allergens$/i
};
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

export async function suggestAddOns(cart: CartCourse[]): Promise<CartCourse[]> {
  const lead = cart[0];
  if (!lead) return [];
  const code = (lead.stateLabel || "").trim().toUpperCase();
  const stateCode = /^[A-Z]{2}$/.test(code) ? code : null;

  let courses: MarketplaceCourse[];
  try {
    // State-filtered and already sorted with that state's own versions first.
    ({ courses } = await getMarketplaceCatalog({ stateCode: stateCode ?? undefined, perPage: 500 }));
  } catch {
    return [];
  }

  const inCart = new Set(cart.map((c) => c.id));
  const leadEntry = courses.find((c) => c.id === lead.id);
  const leadCategory = leadEntry?.categoryId ?? null;
  const groups = new Set(courses.filter((c) => inCart.has(c.id) && c.lmsGroupId).map((c) => c.lmsGroupId!));
  const spanish = /spanish/i.test(lead.name);

  const eligible = (c: MarketplaceCourse) =>
    !inCart.has(c.id) &&
    c.price > 0 &&
    !(c.lmsGroupId && groups.has(c.lmsGroupId)) &&
    !(leadCategory !== null && c.categoryId === leadCategory) &&
    /spanish/i.test(c.name) === spanish &&
    !/manager/i.test(c.name) &&
    // With no state to match, only offer courses that aren't state-specific.
    (stateCode !== null || !c.stateLabel);

  const picks: MarketplaceCourse[] = [];
  const take = (c: MarketplaceCourse) => {
    picks.push(c);
    if (c.lmsGroupId) groups.add(c.lmsGroupId);
  };

  for (const c of courses) {
    if (picks.length >= MAX - 1) break;
    if (isCompliance(c) && eligible(c)) take(c);
  }
  const skill = leadCategory !== null ? SKILL_FOR[leadCategory] : undefined;
  const skillPick = skill && courses.find((c) => skill.test(c.name.trim()) && eligible(c));
  if (skillPick) take(skillPick);

  return picks.slice(0, MAX).map(toCart);
}

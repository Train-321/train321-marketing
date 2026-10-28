import { getMarketplaceCatalog } from "@/lib/newFeatures";
import { getGroupPicker, type CartCourse, type StateVariant } from "@/lib/enroll";
import { availableIn, US_STATES } from "@/lib/states";

// `?group=<id>` support for the email-first checkout: a campaign can link to a
// course GROUP (an LMS Course Group — "group-1", or just "1") instead of a
// single course id. With `&state=XX` that state's version(s) become the cart;
// a state served by an external provider links out to it instead; with no
// state chosen the page asks first. Everything here is additive — a URL
// without ?group= never reaches this code.

export type GroupDetail = {
  id: string;
  name: string;
  blurb: string;
  stateAware: boolean;
  /** Chosen state code ("TX"), "ALL" for the nationwide version, or null. */
  state: string | null;
  /** State choices to offer: every state the group has a dedicated version for. */
  stateOptions: Array<{ code: string; name: string }>;
  /** True when a version applies everywhere (an "Any other state" choice). */
  hasNationwide: boolean;
  /** Buyable versions matching the chosen state — the cart. */
  members: CartCourse[];
  /** When the chosen state is served by a partner site: where to send the buyer. */
  redirectHref: string | null;
};

/** External-provider targets come back bare ("cra.train321.com") — make them navigable. */
const absolute = (href: string) => (/^https?:\/\//i.test(href) ? href : `https://${href}`);

export async function resolveGroup(groupId: string, stateParam: string): Promise<GroupDetail | null> {
  // Accept the LMS id either way: "group-6" as the catalog carries it, or a
  // bare "6" straight from the admin's Course Groups list.
  const trimmed = groupId.trim();
  const id = /^\d+$/.test(trimmed) ? `group-${trimmed}` : trimmed;
  if (!id) return null;

  // The catalog gives us the group's identity (name, blurb) and its buyable
  // members; the picker (seeded with any member id) gives every version —
  // including partner-redirect states the catalog leaves out as unbuyable.
  let catalog;
  try {
    catalog = await getMarketplaceCatalog({ groupId: id, anyState: true, keepVariants: true, perPage: 500 });
  } catch {
    return null;
  }
  const seed = catalog.courses[0];
  if (!seed) return null;

  const summary = catalog.groups.find((g) => g.id === id) ?? null;
  const picker = await getGroupPicker(String(seed.id));
  const variants: StateVariant[] = picker?.variants ?? [];
  const name = picker?.groupName || summary?.name || seed.name;

  const codes = new Set<string>();
  for (const v of variants) if (v.availability.kind === "in") v.availability.codes.forEach((c) => codes.add(c));
  const stateOptions = US_STATES.filter((s) => codes.has(s.code));
  const hasNationwide = variants.some((v) => v.availability.kind === "all");
  const stateAware = variants.some((v) => v.availability.kind !== "all");

  const raw = stateParam.trim().toUpperCase();
  const state = raw === "ALL" || US_STATES.some((s) => s.code === raw) ? raw : null;

  let members: CartCourse[] = [];
  let redirectHref: string | null = null;
  // A state's own version outranks the everywhere one (stable sort, so the
  // LMS order holds within each bucket) — for both the cart and a redirect.
  const pick = (code: string | null) =>
    variants
      .filter((v) => availableIn(v.availability, code))
      .sort((a, b) => Number(b.availability.kind === "in") - Number(a.availability.kind === "in"));
  if (!stateAware) {
    members = variants.flatMap((v) => (v.course ? [v.course] : []));
  } else if (state) {
    const matching = pick(state === "ALL" ? null : state);
    members = matching.flatMap((v) => (v.course ? [v.course] : []));
    if (members.length === 0) {
      const out = matching.find((v) => !v.course && v.href);
      if (out) redirectHref = absolute(out.href);
    }
  }

  return { id, name, blurb: summary?.blurb || "", stateAware, state, stateOptions, hasNationwide, members, redirectHref };
}

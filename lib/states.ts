// US state vocabulary + the LMS state-tag parser, shared by every surface
// that applies the availability rule (course-page picker, catalog, home
// course finder): a course tagged for specific states is available there; a
// course with NO state tag is available everywhere.

/** Code → full name, for prettifying raw LMS state tags like "Fl". */
export const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan",
  MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana",
  NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota",
  OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia",
  WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming"
};

/** Full name (lowercased) → code, so free-text tags like "California" parse. */
export const STATE_CODES_BY_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_NAMES).map(([code, name]) => [name.toLowerCase(), code])
);

/** Every US state + DC as {code, name}, sorted by full name — dropdown fodder. */
export const US_STATES: Array<{ code: string; name: string }> = Object.entries(
  STATE_NAMES
)
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name));

/**
 * Parse a raw admin-typed state tag ("Fl", "Az,CA, HI", "California", "ALL")
 * into normalized codes, or "all" when it applies everywhere. Unparseable
 * free text also maps to "all" (with its text preserved) — better to show a
 * version under every state than to hide it behind a typo.
 */
export function parseStateTag(raw: string | null | undefined): {
  states: "all" | string[];
  text: string;
} {
  const text = String(raw || "").trim();
  if (!text || text.toUpperCase() === "ALL") return { states: "all", text: "All states" };

  const tokens = text.split(",").map((t) => t.trim()).filter(Boolean);
  const codes: string[] = [];
  for (const t of tokens) {
    const up = t.toUpperCase();
    if (/^[A-Z]{2}$/.test(up) && STATE_NAMES[up]) codes.push(up);
    else if (STATE_CODES_BY_NAME[t.toLowerCase()]) codes.push(STATE_CODES_BY_NAME[t.toLowerCase()]);
    else return { states: "all", text };
  }
  return { states: Array.from(new Set(codes)), text };
}

/** True when a raw LMS state tag makes the course available in `code`. */
export function tagMatchesState(raw: string | null | undefined, code: string): boolean {
  const { states } = parseStateTag(raw);
  return states === "all" || states.includes(code);
}

/**
 * A course's resolved availability:
 *   all    — no tags: available in every state
 *   in     — available only in `codes` (the tagged states)
 *   except — available everywhere EXCEPT `codes` (state_exclude = 1)
 */
export type Availability =
  | { kind: "all" }
  | { kind: "in"; codes: string[] }
  | { kind: "except"; codes: string[] };

/**
 * Resolve a course's availability from what the LMS provides. The structured
 * `state_codes` + `state_exclude` pair (course_state pivot + flag) wins when
 * tags exist; the free-text state_label is the fallback for anything older.
 */
export function resolveAvailability(
  label: string | null | undefined,
  codes?: string[] | null,
  exclude?: number | boolean | null
): Availability {
  const isExclude = Boolean(Number(exclude ?? 0)) || exclude === true;
  const explicit = (codes || [])
    .map((c) => String(c).toUpperCase())
    .filter((c) => STATE_NAMES[c]);
  if (explicit.length > 0) {
    return isExclude
      ? { kind: "except", codes: explicit }
      : { kind: "in", codes: explicit };
  }
  const parsed = parseStateTag(label);
  if (parsed.states === "all") return { kind: "all" };
  return isExclude
    ? { kind: "except", codes: parsed.states }
    : { kind: "in", codes: parsed.states };
}

/**
 * Is the course available under this selection? `code === null` is the
 * no-state baseline, which only truly-everywhere courses pass — both
 * state-limited AND state-excluding courses wait for a pick.
 */
export function availableIn(a: Availability, code: string | null): boolean {
  if (a.kind === "all") return true;
  if (code === null) return false;
  return a.kind === "in" ? a.codes.includes(code) : !a.codes.includes(code);
}

/** Badge/chip copy for an availability. */
export function availabilityText(a: Availability): string {
  if (a.kind === "all") return "All states";
  return a.kind === "in"
    ? a.codes.join(", ")
    : `Not available in ${a.codes.join(", ")}`;
}

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

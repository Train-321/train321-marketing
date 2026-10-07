"use client";

// Shared state for the /v5 course finder. The hero search bar, the industry
// accordion, the explorer section and the closing CTA all read and write the
// same picked state + chip, so a choice made anywhere lands in the one
// results grid. Filtering is local: the page ships the whole marketplace
// catalog (≈120 variants) and narrows it in memory, so every click responds
// instantly with no skeleton round-trip.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { MarketplaceCategory, MarketplaceCourse } from "@/lib/newFeatures";
import type { CourseGroupSummary } from "@/lib/courseGroups";
import { dedupeByName } from "@/lib/courseGroups";
import { STATE_NAMES, US_STATES, availableIn } from "@/lib/states";
import type { FilterHint } from "./industries";

export type Chip = {
  /** "all", "group:<lmsId>" or "cat:<id>". */
  id: string;
  label: string;
  kind: "all" | "group" | "category";
  stateAware: boolean;
  /** Font Awesome icon class. */
  icon: string;
  /** Lowest price in the chip's scope, 0 when unknown. */
  priceFrom: number;
};

export type FinderMarketplace = {
  courses: MarketplaceCourse[];
  groups: CourseGroupSummary[];
  categories: MarketplaceCategory[];
  total: number;
};

/** How the current state got picked — drives the "based on your location" note. */
export type StateSource = "none" | "user" | "saved" | "geo" | "gps";

type FinderCtx = {
  stateCode: string | null;
  stateName: string | null;
  setStateCode: (code: string | null) => void;
  stateSource: StateSource;
  /** Browser geolocation → state. Resolves to the code, or null if it couldn't. */
  detectLocation: () => Promise<string | null>;
  detecting: boolean;
  detectError: string | null;
  chip: string;
  setChip: (id: string) => void;
  chips: Chip[];
  activeChip: Chip;
  /** Every variant, unfiltered. */
  all: MarketplaceCourse[];
  /** Filtered + state-sorted + deduped — what the grid shows. */
  results: MarketplaceCourse[];
  /** Course count per state code under the current chip (for the map). */
  countsByState: Record<string, { total: number; specific: number }>;
  /** Course count per chip id under the current state (for the tiles). */
  chipCounts: Record<string, number>;
  /** States that have at least one state-specific version under any chip. */
  specificStates: Set<string>;
  /** Chip id for an industry/role hint — resolved by name against the LMS. */
  resolveHint: (hint: FilterHint) => string;
  /** Count a hint would show for the current state. */
  countForHint: (hint: FilterHint) => number;
  /** Smooth-scroll to the explorer and (optionally) apply a selection. */
  focusExplorer: (next?: { stateCode?: string | null; chip?: string }) => void;
};

const Ctx = createContext<FinderCtx | null>(null);

export function useFinderV5(): FinderCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFinderV5 needs <FinderV5Provider>");
  return ctx;
}

export const EXPLORER_ID = "v5-explorer";

const STORAGE_KEY = "t321.v5.state";

/**
 * Coordinates → US state code, via BigDataCloud's free client-side reverse
 * geocoder (no key). Only ever called after the visitor clicks "Use my
 * location" and accepts the browser prompt, so the coordinates leave the
 * device with their consent.
 */
async function reverseGeocodeState(lat: number, lon: number): Promise<string | null> {
  const url =
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(lat)}` +
    `&longitude=${encodeURIComponent(lon)}&localityLanguage=en`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const j = (await res.json()) as { countryCode?: string; principalSubdivisionCode?: string };
  if (j.countryCode !== "US") return null;
  const code = (j.principalSubdivisionCode || "").replace(/^US-/, "").toUpperCase();
  return STATE_NAMES[code] ? code : null;
}

const CHIP_ICONS: Array<[RegExp, string]> = [
  [/alcohol|bar|beverage|liquor|tabc|rbs/i, "fa-cocktail"],
  [/food handler|food safety/i, "fa-utensils"],
  [/manager/i, "fa-user-tie"],
  [/harass|hr|human/i, "fa-balance-scale"],
  [/back of house/i, "fa-fire-alt"],
  [/front of house/i, "fa-concierge-bell"],
  [/safety|osha/i, "fa-hard-hat"]
];

function iconFor(label: string): string {
  for (const [re, icon] of CHIP_ICONS) if (re.test(label)) return icon;
  return "fa-graduation-cap";
}

const HINT_PATTERNS: Record<Exclude<FilterHint, "all">, RegExp> = {
  food: /food handler|food safety/i,
  alcohol: /alcohol|beverage|bar/i,
  harassment: /harass|hr\b|human resources/i,
  boh: /back of house/i,
  foh: /front of house/i
};

export function filterCourses(all: MarketplaceCourse[], stateCode: string | null, chip: string): MarketplaceCourse[] {
  let list = all;
  if (chip.startsWith("group:")) {
    const id = chip.slice(6);
    list = list.filter((c) => c.lmsGroupId === id);
  } else if (chip.startsWith("cat:")) {
    const id = Number(chip.slice(4));
    list = list.filter((c) => c.categoryId === id);
  }
  if (stateCode) list = list.filter((c) => availableIn(c.availability, stateCode));
  // The picked state's own versions lead; the nationwide ones follow. Stable,
  // so the LMS order holds within each bucket.
  if (stateCode) {
    const specific = (c: MarketplaceCourse) => c.availability.kind === "in";
    list = [...list].sort((a, b) => Number(specific(b)) - Number(specific(a)));
  }
  return dedupeByName(list);
}

export function FinderV5Provider({
  marketplace,
  children
}: {
  marketplace: FinderMarketplace;
  children: ReactNode;
}) {
  const [stateCode, setStateCodeRaw] = useState<string | null>(null);
  const [stateSource, setStateSource] = useState<StateSource>("none");
  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);
  const [chip, setChipRaw] = useState<string>("all");

  // Where is the visitor? Three layers, each only if the previous didn't
  // answer: (1) a state they picked on an earlier visit, (2) the Vercel edge
  // geo header (no prompt, absent in dev), (3) nothing — they pick. Browser
  // GPS is never used without a click (see detectLocation).
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {}
    if (saved && STATE_NAMES[saved]) {
      setStateCodeRaw(saved);
      setStateSource("saved");
      return;
    }
    let cancelled = false;
    fetch("/api/geo")
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { region?: string | null } | null) => {
        if (cancelled || !j?.region || !STATE_NAMES[j.region]) return;
        // Don't override a pick made while the request was in flight.
        setStateCodeRaw((cur) => cur ?? j.region!);
        setStateSource((cur) => (cur === "none" ? "geo" : cur));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const chips = useMemo<Chip[]>(() => {
    const out: Chip[] = [
      { id: "all", label: "All courses", kind: "all", stateAware: true, icon: "fa-th-large", priceFrom: 0 }
    ];
    for (const g of marketplace.groups) {
      out.push({
        id: `group:${g.id}`,
        label: g.name,
        kind: "group",
        stateAware: g.stateAware,
        icon: iconFor(g.name),
        priceFrom: g.priceFrom
      });
    }
    for (const c of marketplace.categories) {
      const inScope = marketplace.courses.filter((x) => x.categoryId === c.id);
      const priceFrom = inScope.length ? Math.min(...inScope.map((x) => x.price)) : 0;
      out.push({
        id: `cat:${c.id}`,
        label: c.name,
        kind: "category",
        stateAware: c.stateAware,
        icon: iconFor(c.name),
        priceFrom
      });
    }
    return out;
  }, [marketplace]);

  const setStateCode = useCallback((code: string | null) => {
    const next = code && STATE_NAMES[code] ? code : null;
    setStateCodeRaw(next);
    setStateSource(next ? "user" : "none");
    setDetectError(null);
    try {
      if (next) localStorage.setItem(STORAGE_KEY, next);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const detectLocation = useCallback(async (): Promise<string | null> => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setDetectError("Location isn't available in this browser.");
      return null;
    }
    setDetecting(true);
    setDetectError(null);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          maximumAge: 10 * 60 * 1000
        })
      );
      const code = await reverseGeocodeState(pos.coords.latitude, pos.coords.longitude);
      if (!code) {
        setDetectError("Couldn't match your location to a US state.");
        return null;
      }
      setStateCodeRaw(code);
      setStateSource("gps");
      try {
        localStorage.setItem(STORAGE_KEY, code);
      } catch {}
      return code;
    } catch (err) {
      const denied = err instanceof GeolocationPositionError && err.code === err.PERMISSION_DENIED;
      setDetectError(denied ? "Location access was blocked — pick your state instead." : "Couldn't get your location.");
      return null;
    } finally {
      setDetecting(false);
    }
  }, []);

  const setChip = useCallback(
    (id: string) => setChipRaw(chips.some((c) => c.id === id) ? id : "all"),
    [chips]
  );

  const activeChip = chips.find((c) => c.id === chip) || chips[0];

  const results = useMemo(
    () => filterCourses(marketplace.courses, stateCode, chip),
    [marketplace.courses, stateCode, chip]
  );

  const countsByState = useMemo(() => {
    const out: Record<string, { total: number; specific: number }> = {};
    for (const s of US_STATES) {
      const list = filterCourses(marketplace.courses, s.code, chip);
      out[s.code] = {
        total: list.length,
        specific: list.filter((c) => c.availability.kind === "in").length
      };
    }
    return out;
  }, [marketplace.courses, chip]);

  const chipCounts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const c of chips) out[c.id] = filterCourses(marketplace.courses, stateCode, c.id).length;
    return out;
  }, [marketplace.courses, stateCode, chips]);

  const specificStates = useMemo(() => {
    const set = new Set<string>();
    for (const c of marketplace.courses) {
      if (c.availability.kind === "in") for (const code of c.availability.codes) set.add(code);
    }
    return set;
  }, [marketplace.courses]);

  const resolveHint = useCallback(
    (hint: FilterHint): string => {
      if (hint === "all") return "all";
      const re = HINT_PATTERNS[hint];
      const hit = chips.find((c) => c.kind !== "all" && re.test(c.label));
      return hit ? hit.id : "all";
    },
    [chips]
  );

  const countForHint = useCallback(
    (hint: FilterHint) => filterCourses(marketplace.courses, stateCode, resolveHint(hint)).length,
    [marketplace.courses, stateCode, resolveHint]
  );

  const focusExplorer = useCallback(
    (next?: { stateCode?: string | null; chip?: string }) => {
      if (next && "stateCode" in next) setStateCode(next.stateCode ?? null);
      if (next?.chip) setChip(next.chip);
      const el = document.getElementById(EXPLORER_ID);
      if (!el) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    },
    [setStateCode, setChip]
  );

  const value: FinderCtx = {
    stateCode,
    stateName: stateCode ? STATE_NAMES[stateCode] : null,
    setStateCode,
    stateSource,
    detectLocation,
    detecting,
    detectError,
    chip,
    setChip,
    chips,
    activeChip,
    all: marketplace.courses,
    results,
    countsByState,
    chipCounts,
    specificStates,
    resolveHint,
    countForHint,
    focusExplorer
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

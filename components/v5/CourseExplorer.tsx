"use client";

// The course finder proper. Desktop: a sticky state panel (interactive map,
// searchable select, popular-state chips) beside category tabs and the
// results grid. Everything filters in memory via FinderContext, so the grid
// re-sorts instantly and the cards re-run their entrance animation.

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import CustomSelect from "@/components/CustomSelect";
import { CourseModalProvider } from "@/components/CourseModal";
import { STATE_CODES_BY_NAME, STATE_NAMES, US_STATES } from "@/lib/states";
import { POPULAR_STATES } from "./industries";
import { EXPLORER_ID, useFinderV5 } from "./FinderContext";
import V5CourseCard from "./V5CourseCard";
import { Reveal } from "./motion";

const UsMap = dynamic(() => import("./UsMap"), {
  ssr: false,
  loading: () => <div className="v5-map v5-map--loading" aria-hidden="true" />
});

const PAGE = 9;

/** The hero's finder bar — "Pick your state" below scrolls back up to it. */
export const FINDER_ID = "v5-finder";

/**
 * `simple` (the v5 homepage): the state is picked ONCE, in the hero finder
 * bar. This section drops its own state panel (map, select, popular chips)
 * and the category tiles; over the grid sits a card with a course search on
 * the left and a "Pick your state" button on the right that scrolls back to
 * the hero. The picked state shows in the results heading. v6 keeps the
 * full layout.
 */
export default function CourseExplorer({ simple = false }: { simple?: boolean } = {}) {
  const {
    stateCode,
    stateName,
    setStateCode,
    chip,
    setChip,
    chips,
    activeChip,
    results,
    countsByState,
    chipCounts,
    specificStates,
    detectLocation,
    detecting,
    detectError,
    stateSource
  } = useFinderV5();
  const [showAll, setShowAll] = useState(false);
  const [gridKey, setGridKey] = useState(0);
  // Simple mode's free-text search: narrows the (state-filtered) results by
  // course name or state label, in memory like everything else here.
  const [query, setQuery] = useState("");

  // Re-key the grid when the selection changes so the cards replay their
  // staggered entrance — the "live" feel of a filter that actually did
  // something. Also collapse "show all" back to the first page.
  useEffect(() => {
    setGridKey((k) => k + 1);
    setShowAll(false);
  }, [stateCode, chip, query]);

  const q = query.trim().toLowerCase();
  const shown = q
    ? results.filter((c) => c.name.toLowerCase().includes(q) || (c.stateLabel || "").toLowerCase().includes(q))
    : results;
  const visible = showAll ? shown : shown.slice(0, PAGE);
  const specificCount = stateCode ? shown.filter((c) => c.availability.kind === "in").length : 0;

  const catalogHref = (() => {
    const q = new URLSearchParams();
    if (chip.startsWith("group:")) q.set("group", chip.slice(6));
    if (chip.startsWith("cat:")) q.set("category", chip.slice(4));
    if (stateCode) q.set("state", stateCode);
    const s = q.toString();
    return s ? `/catalog?${s}` : "/catalog";
  })();

  const heading = (() => {
    const what = activeChip.kind === "all" ? "Courses" : activeChip.label;
    if (stateName) return `${what} accepted in ${stateName}`;
    return activeChip.kind === "all" ? "Every course we offer" : `All ${activeChip.label} courses`;
  })();

  // Back to the one place the state is picked (the hero finder bar).
  const goToFinder = () => {
    const el = document.getElementById(FINDER_ID);
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
    const first = el.querySelector<HTMLElement>("button, [tabindex]");
    first?.focus({ preventScroll: true });
  };

  return (
    <section className="v5-section v5-explorer" id={EXPLORER_ID} aria-labelledby="v5-explorer-title">
      <div className="v5-container">
        <Reveal className="v5-head v5-head--center">
          <p className="v5-eyebrow">
            <i className="fas fa-search-location" aria-hidden="true" /> Course finder
          </p>
          <h2 id="v5-explorer-title" className="v5-h2">
            {simple ? (
              <>
                Only what's accepted <em>where you work.</em>
              </>
            ) : (
              <>
                Pick your state. <em>We only show what's accepted there.</em>
              </>
            )}
          </h2>
          <p className="v5-lede">
            {simple
              ? "Requirements change at the state line. The list below shows the courses your health department and liquor authority recognize."
              : "Requirements change at the state line. Choose where you work and the list below narrows to the courses your health department and liquor authority recognize."}
          </p>
        </Reveal>

        <div className={`v5-explorer__layout${simple ? " v5-explorer__layout--single" : ""}`}>
          {simple && (
            <Reveal className="v5-explorer__bar" index={1}>
              <div className="v5-explorer__bar-row">
                <label className="v5-explorer__searchbox">
                  <i className="fas fa-search" aria-hidden="true" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search courses…"
                    aria-label="Search courses"
                    autoComplete="off"
                  />
                  {query && (
                    <button type="button" className="v5-explorer__searchclear" aria-label="Clear search" onClick={() => setQuery("")}>
                      <i className="fas fa-times" aria-hidden="true" />
                    </button>
                  )}
                </label>
                {/* The state itself is picked once, in the hero finder — this
                    just takes the visitor back up to it. */}
                <button type="button" className="v5-btn v5-btn--ghost v5-explorer__statebtn" onClick={goToFinder}>
                  <i className="fas fa-map-marker-alt" aria-hidden="true" />
                  {stateName ? (
                    <>
                      {stateName} <span className="v5-explorer__statebtn-change">· change</span>
                    </>
                  ) : (
                    "Pick your state"
                  )}
                </button>
              </div>
            </Reveal>
          )}

          {!simple && (
          <Reveal className="v5-explorer__side" index={1}>
            <div className="v5-statepanel">
              <div className="v5-statepanel__map">
                <UsMap
                  selected={stateCode}
                  onSelect={(code) => setStateCode(code === stateCode ? null : code)}
                  counts={countsByState}
                  specificStates={specificStates}
                />
                <p className="v5-statepanel__legend" aria-hidden="true">
                  <span className="v5-statepanel__swatch v5-statepanel__swatch--specific" /> State-specific
                  version available
                </p>
              </div>

              <div className="v5-statepanel__pick">
                <label className="v5-statepanel__label" htmlFor="v5-state-select">
                  Your state
                </label>
                <div id="v5-state-select">
                  <CustomSelect
                    value={stateName || ""}
                    options={US_STATES.map((s) => s.name)}
                    placeholder="Choose your state"
                    ariaLabel="State"
                    searchable
                    clearable
                    searchPlaceholder="Type a state…"
                    onChange={(name) => setStateCode(STATE_CODES_BY_NAME[name.toLowerCase()] || null)}
                    onClear={() => setStateCode(null)}
                    action={{
                      label: detecting ? "Finding your state…" : "Use my location",
                      busy: detecting,
                      onSelect: () => void detectLocation()
                    }}
                  />
                </div>
                {detectError && <p className="v5-statepanel__err">{detectError}</p>}
                <div className="v5-statepanel__popular" role="group" aria-label="Popular states">
                  {POPULAR_STATES.map((code) => (
                    <button
                      key={code}
                      type="button"
                      className={`v5-chip${stateCode === code ? " is-on" : ""}`}
                      aria-pressed={stateCode === code}
                      onClick={() => setStateCode(stateCode === code ? null : code)}
                    >
                      {STATE_NAMES[code]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="v5-statepanel__summary" aria-live="polite">
                {stateName ? (
                  <>
                    <strong>
                      {results.length} {results.length === 1 ? "course" : "courses"} accepted in {stateName}
                    </strong>
                    <span>
                      {specificCount > 0
                        ? `${specificCount} built for ${stateName}'s own rules, the rest accepted nationwide.`
                        : `${stateName} accepts our nationwide, ANSI-accredited versions.`}
                      {(stateSource === "geo" || stateSource === "gps") && " Detected from your location."}
                    </span>
                  </>
                ) : (
                  <>
                    <strong>Showing all {results.length} courses</strong>
                    <span>Each card says where it's accepted. Pick a state to narrow the list.</span>
                  </>
                )}
              </div>
            </div>
          </Reveal>
          )}

          <div className="v5-explorer__main">
            {!simple && (
            <div className="v5-cats" role="tablist" aria-label="Course type">
              {chips.map((c) => {
                const n = chipCounts[c.id] ?? 0;
                const meta = [
                  `${n} ${n === 1 ? "course" : "courses"}`,
                  c.priceFrom > 0 ? `from $${c.priceFrom}` : null
                ]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="tab"
                    aria-selected={chip === c.id}
                    className={`v5-cat${chip === c.id ? " is-on" : ""}`}
                    onClick={() => setChip(c.id)}
                  >
                    <span className="v5-cat__icon" aria-hidden="true">
                      <i className={`fas ${c.icon}`} />
                    </span>
                    <span className="v5-cat__text">
                      <span className="v5-cat__name">{c.label}</span>
                      <span className="v5-cat__meta">{meta}</span>
                    </span>
                    <span className="v5-cat__check" aria-hidden="true">
                      <i className="fas fa-check" />
                    </span>
                  </button>
                );
              })}
            </div>
            )}

            <div className="v5-results__head">
              <h3 className="v5-h3">{heading}</h3>
              {!simple && (
                <span className="v5-results__count">
                  {stateName && specificCount > 0 && (
                    <>
                      <i className="fas fa-sort-amount-down" aria-hidden="true" /> {stateName} versions first
                    </>
                  )}
                </span>
              )}
            </div>

            <CourseModalProvider>
              {shown.length ? (
                <div className="v5-results" key={gridKey}>
                  {visible.map((c, i) => (
                    <V5CourseCard key={c.id} course={c} stateCode={stateCode} index={i} />
                  ))}
                </div>
              ) : (
                <div className="v5-results__empty">
                  <i className="fas fa-map-signs" aria-hidden="true" />
                  <strong>Nothing matches that combination yet.</strong>
                  <span>
                    {q ? "Try a different search, or clear it to see every course." : "Try another course type, or clear the state to see every version."}
                  </span>
                  <button
                    type="button"
                    className="v5-btn v5-btn--ghost"
                    onClick={() => (q ? setQuery("") : setChip("all"))}
                  >
                    {q ? "Clear search" : "Show all course types"}
                  </button>
                </div>
              )}
            </CourseModalProvider>

            <div className="v5-results__foot">
              {shown.length > PAGE && !showAll && (
                <button type="button" className="v5-btn v5-btn--ghost" onClick={() => setShowAll(true)}>
                  Show all {shown.length} courses <i className="fas fa-chevron-down" aria-hidden="true" />
                </button>
              )}
              <Link href={catalogHref} className="v5-link v5-link--arrow">
                Open the full catalog <i className="fas fa-arrow-right" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

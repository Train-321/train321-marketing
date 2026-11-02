"use client";

// The course finder proper. Desktop: a sticky state panel (interactive map,
// searchable select, popular-state chips) beside the results grid. Everything
// filters in memory via FinderContext, so the grid re-sorts instantly and the
// cards re-run their entrance animation.
//
// `simple` (the v5 homepage, after client feedback): same state panel — it
// shares one selection with the hero finder bar, so a state picked up top is
// highlighted here too — but no category tiles over the grid (the category
// shows as a small tag on each card instead), a sort dropdown in the results
// header, no "Show all" button (the catalog link covers that), and a summary
// bar of state-version vs nationwide counts in the panel. v6 keeps the full
// layout: category tiles, "Show all", no sort.

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CustomSelect from "@/components/CustomSelect";
import { CourseModalProvider } from "@/components/CourseModal";
import type { MarketplaceCourse } from "@/lib/newFeatures";
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
/** Simple mode: "Show more" reveals this many more cards per click. */
const MORE = 10;

/** Price order lives in the Price filter; "" keeps the recommended order. */
type PriceOrder = "" | "asc" | "desc";
const PRICE_ORDERS: Array<{ key: PriceOrder; label: string; icon: string }> = [
  { key: "asc", label: "Low to high", icon: "fa-sort-amount-up-alt" },
  { key: "desc", label: "High to low", icon: "fa-sort-amount-down" }
];

/** Price chips (simple mode). `test` decides membership; the first is "any". */
const PRICE_CHIPS: Array<{ label: string; test: (price: number) => boolean }> = [
  { label: "Any price", test: () => true },
  { label: "Under $10", test: (p) => p > 0 && p < 10 },
  { label: "$10 – $25", test: (p) => p >= 10 && p <= 25 },
  { label: "$25 – $50", test: (p) => p > 25 && p <= 50 },
  { label: "$50+", test: (p) => p > 50 }
];

/** Course-length chips (minutes, as the LMS admin entered them). */
const LENGTH_CHIPS: Array<{ label: string; test: (min: number | null) => boolean }> = [
  { label: "Any length", test: () => true },
  { label: "Under 15 min", test: (m) => m !== null && m < 15 },
  { label: "15 – 30 min", test: (m) => m !== null && m >= 15 && m <= 30 },
  { label: "30 – 60 min", test: (m) => m !== null && m > 30 && m <= 60 },
  { label: "1 – 2 hours", test: (m) => m !== null && m > 60 && m <= 120 },
  { label: "2+ hours", test: (m) => m !== null && m > 120 }
];

/**
 * Order the (already filtered) list: a price order when one is picked in the
 * Price filter, else A–Z when that toggle is on, else the recommended order
 * from FinderContext (the state's own versions first).
 */
function sortCourses(list: MarketplaceCourse[], priceOrder: PriceOrder, az: boolean): MarketplaceCourse[] {
  if (!priceOrder && !az) return list;
  const out = [...list];
  if (priceOrder) {
    // "Custom" (price 0) courses go last either way — a 0 is not a real
    // price, it means "ask us".
    const priced = (c: MarketplaceCourse) => (c.price > 0 ? c.price : priceOrder === "asc" ? Number.POSITIVE_INFINITY : -1);
    out.sort((a, b) => (priceOrder === "asc" ? priced(a) - priced(b) : priced(b) - priced(a)));
  } else {
    out.sort((a, b) => a.name.localeCompare(b.name));
  }
  return out;
}

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
  const [limit, setLimit] = useState(PAGE);
  const [gridKey, setGridKey] = useState(0);
  const [priceOrder, setPriceOrder] = useState<PriceOrder>("");
  const [az, setAz] = useState(false);
  // Simple mode: category / price / length pickers live in the state panel as
  // accordions, closed until opened, so nothing clutters the grid.
  const [openAcc, setOpenAcc] = useState<"cats" | "price" | "length" | null>(null);
  const [priceIdx, setPriceIdx] = useState(0);
  const [lengthIdx, setLengthIdx] = useState(0);
  const toggleAcc = (k: "cats" | "price" | "length") => setOpenAcc((cur) => (cur === k ? null : k));

  // Re-key the grid when the selection changes so the cards replay their
  // staggered entrance — the "live" feel of a filter that actually did
  // something. Also collapse "show all" / "show more" back to the first page.
  useEffect(() => {
    setGridKey((k) => k + 1);
    setShowAll(false);
    setLimit(PAGE);
  }, [stateCode, chip, priceOrder, az, priceIdx, lengthIdx]);

  // Tag on each card (simple mode): the course's marketplace category, else
  // its course group — looked up by name from the same chips the full layout
  // shows as tiles.
  const tagFor = useMemo(() => {
    const cats: Record<number, string> = {};
    const groups: Record<string, string> = {};
    for (const c of chips) {
      if (c.kind === "category") cats[Number(c.id.slice(4))] = c.label;
      else if (c.kind === "group") groups[c.id.slice(6)] = c.label;
    }
    return (course: MarketplaceCourse): string | null =>
      (course.categoryId != null ? cats[course.categoryId] : undefined) ??
      (course.lmsGroupId ? groups[course.lmsGroupId] : undefined) ??
      null;
  }, [chips]);

  // Simple mode narrows further by price / length (both "any" by default, so
  // the list equals the context results until a chip is picked).
  const narrowed = simple
    ? results.filter((c) => PRICE_CHIPS[priceIdx].test(c.price) && LENGTH_CHIPS[lengthIdx].test(c.lengthMinutes))
    : results;
  const ordered = simple ? sortCourses(narrowed, priceOrder, az) : results;
  const visible = simple ? ordered.slice(0, limit) : showAll ? ordered : ordered.slice(0, PAGE);
  const specificCount = stateCode ? results.filter((c) => c.availability.kind === "in").length : 0;
  const nationwideCount = results.length - specificCount;

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

  return (
    <section className="v5-section v5-explorer" id={EXPLORER_ID} aria-labelledby="v5-explorer-title">
      <div className="v5-container">
        <Reveal className="v5-head v5-head--center">
          <p className="v5-eyebrow">
            <i className="fas fa-search-location" aria-hidden="true" /> Course finder
          </p>
          <h2 id="v5-explorer-title" className="v5-h2">
            Pick your state. <em>We only show what's accepted there.</em>
          </h2>
          <p className="v5-lede">
            Requirements change at the state line. Choose where you work and the list below narrows to
            the courses your health department and liquor authority recognize.
          </p>
        </Reveal>

        <div className="v5-explorer__layout">
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

              {simple && (
                <>
                  <div className={`v5-statepanel__acc${openAcc === "cats" ? " is-open" : ""}`}>
                    <button
                      type="button"
                      className="v5-statepanel__acc-head"
                      aria-expanded={openAcc === "cats"}
                      aria-controls="v5-cat-list"
                      onClick={() => toggleAcc("cats")}
                    >
                      <span className="v5-statepanel__label">Course category</span>
                      <span className="v5-statepanel__acc-right">
                        <span className="v5-statepanel__acc-value">{activeChip.label}</span>
                        <i className="fas fa-chevron-down v5-statepanel__acc-chev" aria-hidden="true" />
                      </span>
                    </button>
                    {openAcc === "cats" && (
                      <div id="v5-cat-list" className="v5-statepanel__acc-chips" role="radiogroup" aria-label="Course category">
                        {chips.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            role="radio"
                            aria-checked={chip === c.id}
                            className={`v5-chip${chip === c.id ? " is-on" : ""}`}
                            onClick={() => setChip(c.id)}
                            title={`${chipCounts[c.id] ?? 0} ${(chipCounts[c.id] ?? 0) === 1 ? "course" : "courses"}`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={`v5-statepanel__acc${openAcc === "price" ? " is-open" : ""}`}>
                    <button
                      type="button"
                      className="v5-statepanel__acc-head"
                      aria-expanded={openAcc === "price"}
                      aria-controls="v5-price-list"
                      onClick={() => toggleAcc("price")}
                    >
                      <span className="v5-statepanel__label">Price</span>
                      <span className="v5-statepanel__acc-right">
                        <span className="v5-statepanel__acc-value">
                          {PRICE_CHIPS[priceIdx].label}
                          {priceOrder && ` · ${PRICE_ORDERS.find((o) => o.key === priceOrder)?.label.toLowerCase()}`}
                        </span>
                        <i className="fas fa-chevron-down v5-statepanel__acc-chev" aria-hidden="true" />
                      </span>
                    </button>
                    {openAcc === "price" && (
                      <div id="v5-price-list" className="v5-statepanel__acc-body">
                        <div className="v5-statepanel__acc-chips" role="radiogroup" aria-label="Price range">
                          {PRICE_CHIPS.map((p, i) => (
                            <button
                              key={p.label}
                              type="button"
                              role="radio"
                              aria-checked={priceIdx === i}
                              className={`v5-chip${priceIdx === i ? " is-on" : ""}`}
                              onClick={() => setPriceIdx(i)}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                        {/* Price ORDER lives here too; tap the active one again to go back
                            to the recommended order. */}
                        <div className="v5-statepanel__acc-chips v5-statepanel__acc-chips--order" role="radiogroup" aria-label="Price order">
                          <span className="v5-statepanel__acc-mini">Order</span>
                          {PRICE_ORDERS.map((o) => (
                            <button
                              key={o.key}
                              type="button"
                              role="radio"
                              aria-checked={priceOrder === o.key}
                              className={`v5-chip${priceOrder === o.key ? " is-on" : ""}`}
                              onClick={() => setPriceOrder(priceOrder === o.key ? "" : o.key)}
                            >
                              <i className={`fas ${o.icon}`} aria-hidden="true" /> {o.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`v5-statepanel__acc${openAcc === "length" ? " is-open" : ""}`}>
                    <button
                      type="button"
                      className="v5-statepanel__acc-head"
                      aria-expanded={openAcc === "length"}
                      aria-controls="v5-length-list"
                      onClick={() => toggleAcc("length")}
                    >
                      <span className="v5-statepanel__label">Course length</span>
                      <span className="v5-statepanel__acc-right">
                        <span className="v5-statepanel__acc-value">{LENGTH_CHIPS[lengthIdx].label}</span>
                        <i className="fas fa-chevron-down v5-statepanel__acc-chev" aria-hidden="true" />
                      </span>
                    </button>
                    {openAcc === "length" && (
                      <div id="v5-length-list" className="v5-statepanel__acc-chips" role="radiogroup" aria-label="Course length">
                        {LENGTH_CHIPS.map((l, i) => (
                          <button
                            key={l.label}
                            type="button"
                            role="radio"
                            aria-checked={lengthIdx === i}
                            className={`v5-chip${lengthIdx === i ? " is-on" : ""}`}
                            onClick={() => setLengthIdx(i)}
                          >
                            {l.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="v5-statepanel__summary" aria-live="polite">
                {stateName ? (
                  <>
                    <strong>
                      {results.length} {results.length === 1 ? "course" : "courses"} accepted in {stateName}
                    </strong>
                    {/* Simple mode keeps just the count + the split bar; the
                        sentence and the "detected from your location" note
                        are only shown in the full (v6) layout. */}
                    {!simple && (
                      <span>
                        {specificCount > 0
                          ? `${specificCount} built for ${stateName}'s own rules, the rest accepted nationwide.`
                          : `${stateName} accepts our nationwide, ANSI-accredited versions.`}
                        {(stateSource === "geo" || stateSource === "gps") && " Detected from your location."}
                      </span>
                    )}
                    {simple && results.length > 0 && (
                      <span className="v5-statepanel__split" aria-hidden="true">
                        <span className="v5-statepanel__bar">
                          <i style={{ width: `${Math.round((specificCount / results.length) * 100)}%` }} />
                        </span>
                        <small>
                          <span className="v5-statepanel__dot v5-statepanel__dot--specific" />
                          {specificCount} {stateName} {specificCount === 1 ? "version" : "versions"}
                          <span className="v5-statepanel__dot v5-statepanel__dot--all" />
                          {nationwideCount} nationwide
                        </small>
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <strong>Showing all {results.length} courses</strong>
                    {!simple && <span>Each card says where it's accepted. Pick a state to narrow the list.</span>}
                  </>
                )}
              </div>
            </div>
          </Reveal>

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

            <div className={`v5-results__head${simple ? " v5-results__head--simple" : ""}`}>
              {/* Simple mode: no heading over the grid at all — the panel
                  summary already says what is listed. The spacer keeps the
                  A–Z toggle on the right. */}
              {simple ? <span /> : <h3 className="v5-h3">{heading}</h3>}
              {simple ? (
                // One toggle: A–Z on/off. Price order is in the Price filter.
                <button
                  type="button"
                  className={`v5-sortaz${az ? " is-on" : ""}`}
                  aria-pressed={az}
                  title={az ? "Back to recommended order" : "Sort by name, A to Z"}
                  onClick={() => setAz((v) => !v)}
                >
                  <i className="fas fa-sort-alpha-down" aria-hidden="true" /> Sort A–Z
                </button>
              ) : (
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
              {ordered.length ? (
                <div className="v5-results" key={gridKey}>
                  {visible.map((c, i) => (
                    <V5CourseCard
                      key={c.id}
                      course={c}
                      stateCode={stateCode}
                      index={i}
                      category={simple ? tagFor(c) : null}
                    />
                  ))}
                </div>
              ) : (
                <div className="v5-results__empty">
                  <i className="fas fa-map-signs" aria-hidden="true" />
                  <strong>Nothing matches that combination yet.</strong>
                  <span>
                    {simple && (priceIdx || lengthIdx)
                      ? "Try a different price or length, or clear those filters."
                      : "Try another course type, or clear the state to see every version."}
                  </span>
                  <button
                    type="button"
                    className="v5-btn v5-btn--ghost"
                    onClick={() => {
                      if (simple && (priceIdx || lengthIdx)) {
                        setPriceIdx(0);
                        setLengthIdx(0);
                      } else setChip("all");
                    }}
                  >
                    {simple && (priceIdx || lengthIdx) ? "Clear price & length" : "Show all course types"}
                  </button>
                </div>
              )}
            </CourseModalProvider>

            {simple ? (
              // Simple mode: no catalog link — "Show more" reveals MORE cards
              // per click until the list is complete.
              <div className="v5-results__foot">
                {ordered.length > limit && (
                  <button type="button" className="v5-btn v5-btn--ghost" onClick={() => setLimit((n) => n + MORE)}>
                    Show more <i className="fas fa-chevron-down" aria-hidden="true" />
                  </button>
                )}
              </div>
            ) : (
              <div className="v5-results__foot">
                {ordered.length > PAGE && !showAll && (
                  <button type="button" className="v5-btn v5-btn--ghost" onClick={() => setShowAll(true)}>
                    Show all {ordered.length} courses <i className="fas fa-chevron-down" aria-hidden="true" />
                  </button>
                )}
                <Link href={catalogHref} className="v5-link v5-link--arrow">
                  Open the full catalog <i className="fas fa-arrow-right" aria-hidden="true" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

// Hero: the finder IS the hero. Audience toggle, headline, a search-bar style
// "Where do you work? / What do you need?" row that drives the explorer, a
// proof row, and the industry accordion on the right.

import CustomSelect from "@/components/CustomSelect";
import { useCart } from "@/components/cart/CartContext";
import { STATE_CODES_BY_NAME, STATE_NAMES, US_STATES } from "@/lib/states";
import IndustrySpotlight from "./IndustrySpotlight";
import { useFinderV5 } from "./FinderContext";

export type Audience = "self" | "team";

type Stat = { value: string; label: string };

const COPY: Record<
  Audience,
  { eyebrow: string; h1Pre: string; h1Em: string; lede: string; cta: string }
> = {
  self: {
    eyebrow: "ANSI-accredited · Accepted in all 50 states · Certificate the same day",
    h1Pre: "The certificate your job needs,",
    h1Em: "before your next shift.",
    lede:
      "Food handler, food manager, alcohol server and workplace compliance courses that take about an hour on your phone. Pass, and your certificate downloads instantly.",
    cta: "Search courses"
  },
  team: {
    eyebrow: "One account · Every location · One invoice",
    h1Pre: "Train the whole team",
    h1Em: "before the dinner rush.",
    lede:
      "Assign ANSI-accredited courses in minutes, watch certificates roll in the same day, and keep every location inspection-ready from one dashboard.",
    cta: "Search courses"
  }
};

function findStat(stats: Stat[], re: RegExp): Stat | undefined {
  return stats.find((s) => re.test(s.label) || re.test(s.value));
}

export default function HeroV5({
  audience,
  onAudience,
  companyStats
}: {
  audience: Audience;
  onAudience: (a: Audience) => void;
  companyStats: Stat[];
}) {
  const copy = COPY[audience];
  const {
    stateCode,
    stateName,
    setStateCode,
    stateSource,
    detectLocation,
    detecting,
    detectError,
    chip,
    setChip,
    chips,
    focusExplorer
  } = useFinderV5();
  const { buyer } = useCart();

  const rating = findStat(companyStats, /rating/i);
  const certs = findStat(companyStats, /certificate/i);
  const locations = findStat(companyStats, /location/i);

  const chipLabels = chips.map((c) => c.label);
  const chipLabel = chips.find((c) => c.id === chip)?.label || chipLabels[0];

  return (
    <section className="v5-hero" aria-labelledby="v5-hero-title">
      <div className="v5-hero__bg" aria-hidden="true">
        <span className="v5-hero__blob v5-hero__blob--a" />
        <span className="v5-hero__blob v5-hero__blob--b" />
        <span className="v5-hero__grid" />
      </div>

      <div className="v5-container v5-hero__grid-layout">
        <div className="v5-hero__copy">
          <div className="v5-seg" role="tablist" aria-label="Who is this training for?">
            <span
              className="v5-seg__pill"
              aria-hidden="true"
              style={{ transform: audience === "team" ? "translateX(100%)" : "translateX(0)" }}
            />
            <button
              type="button"
              role="tab"
              aria-selected={audience === "self"}
              className={`v5-seg__btn${audience === "self" ? " is-on" : ""}`}
              onClick={() => onAudience("self")}
            >
              <i className="fas fa-user" aria-hidden="true" /> For myself
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={audience === "team"}
              className={`v5-seg__btn${audience === "team" ? " is-on" : ""}`}
              onClick={() => onAudience("team")}
            >
              <i className="fas fa-users" aria-hidden="true" /> For my team
            </button>
          </div>

          <p className="v5-hero__eyebrow" key={`eb-${audience}`}>
            <span className="v5-dot" aria-hidden="true" />
            {copy.eyebrow}
          </p>

          <h1 className="v5-h1" id="v5-hero-title" key={`h1-${audience}`}>
            <span className="v5-h1__line">
              <span>{copy.h1Pre}</span>
            </span>{" "}
            <span className="v5-h1__line">
              <em>{copy.h1Em}</em>
            </span>
          </h1>
          <p className="v5-hero__lede" key={`lede-${audience}`}>
            {copy.lede}
          </p>

          <form
            className="v5-finderbar"
            role="search"
            aria-label="Find your course"
            onSubmit={(e) => {
              e.preventDefault();
              focusExplorer();
            }}
          >
            <div className="v5-finderbar__field">
              <span className="v5-finderbar__label">
                <i className="fas fa-map-marker-alt" aria-hidden="true" /> Where do you work?
              </span>
              <CustomSelect
                value={stateCode ? STATE_NAMES[stateCode] : ""}
                options={US_STATES.map((s) => s.name)}
                placeholder="Pick your state"
                ariaLabel="State"
                searchable
                clearable
                searchPlaceholder="Type a state…"
                onChange={(name) => setStateCode(STATE_CODES_BY_NAME[name] || null)}
                onClear={() => setStateCode(null)}
                action={{
                  label: detecting ? "Finding your state…" : "Use my location",
                  busy: detecting,
                  onSelect: () => void detectLocation()
                }}
                direction="down"
              />
            </div>
            <span className="v5-finderbar__divider" aria-hidden="true" />
            <div className="v5-finderbar__field">
              <span className="v5-finderbar__label">
                <i className="fas fa-graduation-cap" aria-hidden="true" /> What do you need?
              </span>
              <CustomSelect
                value={chipLabel}
                options={chipLabels}
                placeholder="All courses"
                ariaLabel="Course type"
                onChange={(label) => {
                  const hit = chips.find((c) => c.label === label);
                  setChip(hit ? hit.id : "all");
                }}
                direction="down"
              />
            </div>
            <button type="submit" className="v5-btn v5-btn--ink v5-finderbar__go">
              <i className="fas fa-search" aria-hidden="true" />
              {copy.cta}
            </button>
          </form>

          {(detectError || (stateName && stateSource !== "user" && stateSource !== "none")) && (
            <p className="v5-hero__geo" aria-live="polite">
              {detectError ? (
                <span className="v5-hero__geo-err">
                  <i className="fas fa-exclamation-circle" aria-hidden="true" /> {detectError}
                </span>
              ) : stateSource === "saved" ? (
                <>
                  <i className="fas fa-history" aria-hidden="true" /> Welcome back — still in{" "}
                  <strong>{stateName}</strong>?{" "}
                  <button type="button" className="v5-link" onClick={() => setStateCode(null)}>
                    Change state
                  </button>
                </>
              ) : (
                <>
                  <i className="fas fa-location-arrow" aria-hidden="true" /> Showing courses accepted in{" "}
                  <strong>{stateName}</strong>, based on your location. Not right? Pick a state above.
                </>
              )}
            </p>
          )}

          <ul className="v5-hero__proof" aria-label="Why Train 321">
            <li>
              <span className="v5-stars" aria-hidden="true">
                <i className="fas fa-star" />
                <i className="fas fa-star" />
                <i className="fas fa-star" />
                <i className="fas fa-star" />
                <i className="fas fa-star-half-alt" />
              </span>
              <strong>{rating?.value || "4.8/5"}</strong>
              <span>rating</span>
            </li>
            <li>
              <strong>{certs?.value || "50,000+"}</strong>
              <span>certified</span>
            </li>
            <li>
              <strong>{locations?.value || "5,000+"}</strong>
              <span>{buyer.audience === "company" ? "locations on team plans" : "locations"}</span>
            </li>
          </ul>
        </div>

        <div className="v5-hero__visual">
          <IndustrySpotlight />
        </div>
      </div>
    </section>
  );
}

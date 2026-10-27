"use client";

// Hero: the finder IS the hero. Audience toggle, headline, a search-bar style
// "Where do you work? / What do you need?" row that drives the explorer, the
// Studio trust badges, and the industry accordion on the right.

import type { ReactNode } from "react";
import type { HomePage } from "@/lib/sanity";
import FinderBar from "./FinderBar";
import IndustrySpotlight from "./IndustrySpotlight";
import { useFinderV5 } from "./FinderContext";

export type Audience = "self" | "team";

const COPY: Record<
  Audience,
  { eyebrow: string; h1Pre: string; h1Em: string; lede: string; cta: string }
> = {
  self: {
    eyebrow: "Accredited courses · Accepted in most states · Certificate the same day",
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
      "Assign accredited courses in minutes, watch certificates roll in the same day, and keep every location inspection-ready from one dashboard.",
    cta: "Search courses"
  }
};

// Only shown while Studio's Home Page → hero trust pills is empty.
const TRUST_PILLS = [
  { icon: "fas fa-shield-alt", label: "Trusted since 2020" },
  { icon: "fas fa-flag-usa", label: "Accepted in most states" },
  { icon: "fas fa-bolt", label: "Instant certificate" }
];

export default function HeroV5({
  audience,
  onAudience,
  home,
  decor
}: {
  audience: Audience;
  onAudience: (a: Audience) => void;
  home: HomePage | null;
  /** Seasonal art layered over the backdrop (e.g. the Halloween event). */
  decor?: ReactNode;
}) {
  // Studio copy wins, in the canonical home page's order: the per-audience
  // block, then the legacy single-hero fields, then the defaults above. A
  // Studio headline without its own accent words stands alone, as it does there.
  const fallback = COPY[audience];
  const studio = audience === "team" ? home?.audienceTeam : home?.audienceSelf;
  const studioH1 = studio?.h1Pre || home?.heroHeadline;
  const copy = {
    ...fallback,
    eyebrow: studio?.eyebrow || home?.heroEyebrow || fallback.eyebrow,
    h1Pre: studioH1?.trim() || fallback.h1Pre,
    h1Em: studio?.h1Em?.trim() || (studioH1 ? "" : fallback.h1Em),
    lede: studio?.lede || home?.heroSubcopy || fallback.lede
  };
  const { stateName, setStateCode, stateSource, detectError } = useFinderV5();
  // The same badges the canonical home page shows under its hero.
  const pills = home?.heroTrustPills?.filter((p) => p.label).length
    ? home.heroTrustPills.filter((p) => p.label)
    : TRUST_PILLS;

  return (
    <section className="v5-hero" aria-labelledby="v5-hero-title">
      <div className="v5-hero__bg" aria-hidden="true">
        <span className="v5-hero__blob v5-hero__blob--a" />
        <span className="v5-hero__blob v5-hero__blob--b" />
        <span className="v5-hero__grid" />
      </div>
      {decor}

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
            </span>
            {copy.h1Em && (
              <>
                {" "}
                <span className="v5-h1__line">
                  <em>{copy.h1Em}</em>
                </span>
              </>
            )}
          </h1>
          <p className="v5-hero__lede" key={`lede-${audience}`}>
            {copy.lede}
          </p>

          <FinderBar cta={copy.cta} />

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
            {pills.map((p, i) => (
              <li key={i}>
                <i className={`${p.icon || "fas fa-check"} v5-hero__proof-icon`} aria-hidden="true" />
                <strong>{p.label}</strong>
              </li>
            ))}
          </ul>
        </div>

        <div className="v5-hero__visual">
          <IndustrySpotlight />
        </div>
      </div>
    </section>
  );
}

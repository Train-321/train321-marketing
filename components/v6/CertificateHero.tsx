"use client";

// v6 hero: same job as the v5 hero (audience toggle, headline, finder bar,
// proof) with the live certificate as the visual.

import { useCart } from "@/components/cart/CartContext";
import FinderBar from "@/components/v5/FinderBar";
import { useFinderV5 } from "@/components/v5/FinderContext";
import type { Audience } from "@/components/v5/HeroV5";
import LiveCertificate from "./LiveCertificate";

type Stat = { value: string; label: string };

const COPY: Record<Audience, { eyebrow: string; h1Pre: string; h1Em: string; lede: string }> = {
  self: {
    eyebrow: "ANSI-accredited · Accepted in all 50 states · Certificate the same day",
    h1Pre: "The certificate your job needs,",
    h1Em: "issued the moment you pass.",
    lede:
      "Food handler, food manager, alcohol server and workplace compliance courses that take about an hour on your phone. Pick your state and we show only what's accepted there."
  },
  team: {
    eyebrow: "One account · Every location · One invoice",
    h1Pre: "Every certificate your team needs,",
    h1Em: "on one dashboard by Friday.",
    lede:
      "Assign ANSI-accredited courses by role, watch certificates land the same day, and keep every location inspection-ready without chasing paper."
  }
};

export default function CertificateHero({
  audience,
  onAudience,
  companyStats
}: {
  audience: Audience;
  onAudience: (a: Audience) => void;
  companyStats: Stat[];
}) {
  const copy = COPY[audience];
  const { stateName, stateSource, setStateCode, detectError } = useFinderV5();
  const { buyer } = useCart();
  const rating = companyStats.find((s) => /rating/i.test(s.label));
  const certs = companyStats.find((s) => /certificate/i.test(s.label));
  const locations = companyStats.find((s) => /location/i.test(s.label));

  return (
    <section className="v5-hero v6-hero" aria-labelledby="v6-hero-title">
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

          <h1 className="v5-h1" id="v6-hero-title" key={`h1-${audience}`}>
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

          <FinderBar />

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

        <div className="v5-hero__visual v6-hero__visual">
          <LiveCertificate />
        </div>
      </div>
    </section>
  );
}

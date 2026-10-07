"use client";

// The hero visual: one big photo at a time. Six industries crossfade through
// a single frame (slow push-in on the live one) with a caption naming the
// industry. It auto-advances while on screen; hovering pauses it and reveals
// previous/next arrows (always visible on touch, where there is no hover).
// Deliberately no CTA of its own — the finder bar beside it is the one call
// to action.

import { useEffect, useRef, useState } from "react";
import { INDUSTRIES } from "./industries";
import { PHOTOS, photoUrl } from "./photos";
import { useInView, usePrefersReducedMotion } from "./motion";

const STEP_MS = 5200;

export default function IndustrySpotlight() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: false, threshold: 0.3, rootMargin: "0px" });
  const playing = inView && !paused && !reduced;

  // Restarts whenever the slide changes, so a manual step always gets a full
  // interval before the show moves on again.
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setActive((i) => (i + 1) % INDUSTRIES.length), STEP_MS);
    return () => clearTimeout(t);
  }, [playing, active]);

  const go = (delta: number) =>
    setActive((i) => (i + delta + INDUSTRIES.length) % INDUSTRIES.length);

  const ind = INDUSTRIES[active];

  return (
    <div
      ref={ref}
      className="v5-spot"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="v5-spot__stage" aria-roledescription="carousel" aria-label="Industries we train">
        {INDUSTRIES.map((item, i) => {
          const photo = PHOTOS[item.photo];
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={item.key}
              src={photoUrl(photo, 900, 1100)}
              alt={i === active ? photo.alt : ""}
              style={{ objectPosition: photo.pos }}
              className={`v5-spot__img${i === active ? " is-active" : ""}`}
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : undefined}
              decoding="async"
            />
          );
        })}
        <span className="v5-spot__shade" aria-hidden="true" />

        <div className="v5-spot__caption" key={ind.key} aria-live="polite">
          <span className="v5-spot__kicker">
            <i className={`fas ${ind.icon}`} aria-hidden="true" />
            {ind.name}
          </span>
          <p className="v5-spot__blurb">{ind.blurb}</p>
        </div>

        <button
          type="button"
          className="v5-spot__arrow v5-spot__arrow--prev"
          aria-label="Previous industry"
          onClick={() => go(-1)}
        >
          <i className="fas fa-chevron-left" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="v5-spot__arrow v5-spot__arrow--next"
          aria-label="Next industry"
          onClick={() => go(1)}
        >
          <i className="fas fa-chevron-right" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

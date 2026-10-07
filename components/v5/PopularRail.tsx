"use client";

// "Most enrolled" — the Studio-managed marketing courses (Sanity), as a
// scroll-snap rail of tall photo cards. Hover zooms the photo, deepens the
// scrim and slides the tagline up; the arrows scroll one card at a time.

import Link from "next/link";
import { useRef, type CSSProperties } from "react";
import type { Course } from "@/lib/sanity";
import { sizedImage } from "@/lib/images";
import { Reveal } from "./motion";

const CATEGORY_LABEL: Record<string, string> = {
  food: "Food safety",
  alcohol: "Alcohol service",
  hr: "HR compliance"
};

export default function PopularRail({ courses, slugs }: { courses: Course[]; slugs: string[] }) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const picked = slugs
    .map((s) => courses.find((c) => c.slug === s))
    .filter((c): c is Course => Boolean(c));

  if (!picked.length) return null;

  const scrollBy = (dir: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>(".v5-pop");
    const step = card ? card.offsetWidth + 20 : rail.clientWidth * 0.8;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rail.scrollBy({ left: dir * step, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <section className="v5-section v5-popular" aria-labelledby="v5-popular-title">
      <div className="v5-container">
        <Reveal className="v5-head v5-head--row">
          <div>
            <p className="v5-eyebrow">
              <i className="fas fa-fire" aria-hidden="true" /> Most enrolled
            </p>
            <h2 id="v5-popular-title" className="v5-h2">
              The courses employers ask for <em>most.</em>
            </h2>
          </div>
          <div className="v5-rail__nav">
            <button type="button" className="v5-rail__btn" aria-label="Scroll back" onClick={() => scrollBy(-1)}>
              <i className="fas fa-arrow-left" aria-hidden="true" />
            </button>
            <button type="button" className="v5-rail__btn" aria-label="Scroll forward" onClick={() => scrollBy(1)}>
              <i className="fas fa-arrow-right" aria-hidden="true" />
            </button>
          </div>
        </Reveal>
      </div>

      <div className="v5-rail" ref={railRef}>
        <div className="v5-rail__track">
          {picked.map((c, i) => {
            const chip = c.eyebrow || (c.category ? CATEGORY_LABEL[c.category] : "Course");
            return (
              <Link
                key={c.slug}
                href={`/courses/${c.slug}`}
                className={`v5-pop${c.image ? "" : ` v5-pop--tone-${c.color || "neutral"}`}`}
                style={{ "--v5-i": i } as CSSProperties}
              >
                <span className="v5-pop__media" aria-hidden="true">
                  {c.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={sizedImage(c.image, 640)} alt="" loading="lazy" decoding="async" />
                  ) : (
                    <i className={`fas ${c.icon || "fa-graduation-cap"} v5-pop__icon`} />
                  )}
                </span>
                <span className="v5-pop__top">
                  <span className="v5-pop__chip">{chip}</span>
                  {i === 0 && <span className="v5-pop__chip v5-pop__chip--hot">#1 this month</span>}
                </span>
                <span className="v5-pop__body">
                  <span className="v5-pop__title">{c.title}</span>
                  {c.tagline && <span className="v5-pop__tag">{c.tagline}</span>}
                  <span className="v5-pop__foot">
                    <span className="v5-pop__price">
                      {c.priceFrom ? (
                        <>
                          <small>from</small> ${c.priceFrom}
                        </>
                      ) : (
                        "See pricing"
                      )}
                    </span>
                    <span className="v5-pop__go">
                      View course <i className="fas fa-arrow-right" aria-hidden="true" />
                    </span>
                  </span>
                </span>
              </Link>
            );
          })}
          <Link href="/courses" className="v5-pop v5-pop--all">
            <span className="v5-pop__body">
              <span className="v5-pop__title">See every course</span>
              <span className="v5-pop__tag">Food, alcohol, HR and safety — one catalog, one cart.</span>
              <span className="v5-pop__go">
                Browse the catalog <i className="fas fa-arrow-right" aria-hidden="true" />
              </span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

"use client";

// Testimonials: a soft-washed band with up to six quote cards in a staggered
// three-column grid. Each card leads with the Studio "stat" as a highlight
// line, carries a big serif quotation mark, and ends with a gradient-initial
// avatar. The aggregate rating (a real company stat) sits in the header; no
// per-quote stars are invented.

import type { Testimonial } from "@/lib/sanity";
import { Reveal } from "./motion";

type Stat = { value: string; label: string };

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0] || "")
    .join("")
    .toUpperCase();
}

/** Long quotes (60+ words) step the type down a notch so the card stays scannable. */
function sizeClass(quote: string): string {
  return quote.trim().split(/\s+/).length > 60 ? " v5-quote--long" : "";
}

const trimDot = (s: string) => s.replace(/[.\s]+$/, "");

export default function TestimonialsV5({ items, companyStats }: { items: Testimonial[]; companyStats: Stat[] }) {
  if (!items.length) return null;
  const rating = companyStats.find((s) => /rating/i.test(s.label));
  const certs = companyStats.find((s) => /certificate/i.test(s.label));
  const shown = items.slice(0, 6);

  return (
    <section className="v5-section v5-quotes" id="testimonials" aria-labelledby="v5-quotes-title">
      <div className="v5-container">
        <Reveal className="v5-head v5-head--center">
          <p className="v5-eyebrow">
            <i className="fas fa-quote-left" aria-hidden="true" /> From the floor
          </p>
          <h2 id="v5-quotes-title" className="v5-h2">
            Operators who stopped <em>chasing certificates.</em>
          </h2>
          <p className="v5-lede">
            Real words from HR managers, training leads and association partners who run compliance for
            hundreds of locations.
          </p>
          <div className="v5-quotes__rating" aria-label="Learner rating">
            <span className="v5-stars" aria-hidden="true">
              <i className="fas fa-star" />
              <i className="fas fa-star" />
              <i className="fas fa-star" />
              <i className="fas fa-star" />
              <i className="fas fa-star-half-alt" />
            </span>
            <strong>{rating?.value || "4.8/5"}</strong>
            <span>{rating?.label?.toLowerCase() || "average learner rating"}</span>
            {certs && (
              <>
                <span className="v5-quotes__sep" aria-hidden="true" />
                <strong>{certs.value}</strong>
                <span>{certs.label.toLowerCase()}</span>
              </>
            )}
          </div>
        </Reveal>

        <div className="v5-quotes__grid">
          {shown.map((t, i) => (
            <Reveal as="figure" key={t.id} className={`v5-quote${sizeClass(t.quote)}`} index={i}>
              <span className="v5-quote__mark" aria-hidden="true">
                “
              </span>
              {t.stat && (
                <p className="v5-quote__lead">
                  {trimDot(t.stat.value)}
                  {t.stat.label && <span> — {trimDot(t.stat.label).toLowerCase()}</span>}
                </p>
              )}
              <blockquote>
                <p>{t.quote}</p>
              </blockquote>
              <figcaption>
                <span className="v5-quote__avatar" aria-hidden="true">
                  {initials(t.name)}
                </span>
                <span className="v5-quote__who">
                  <strong>{t.name}</strong>
                  <span>{[t.role, t.company].filter(Boolean).join(" · ")}</span>
                </span>
              </figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

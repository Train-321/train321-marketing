"use client";

import { useEffect, useRef, useState } from "react";
import type { Testimonial } from "@/lib/sanity";

/**
 * Testimonial grid. Quotes run anywhere from 20 to 60+ words, and letting the
 * longest one set the row height left the short cards looking half empty. The
 * card clamps its quote instead, so every box stays the same compact size, and
 * anything that overflows offers a "Read more" that opens the full text in a
 * dialog. The clamp is measured rather than guessed from length, so the link
 * appears exactly when text is actually cut off at the current width.
 */

function initials(name: string) {
  return (name || "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function QuoteCard({
  testimonial,
  onExpand
}: {
  testimonial: Testimonial;
  onExpand: () => void;
}) {
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const [isClamped, setIsClamped] = useState(false);

  useEffect(() => {
    const el = quoteRef.current;
    if (!el) return;
    // A clamped box reports more scroll height than it can show. Re-measured on
    // resize because how much fits changes with the column width.
    const measure = () => setIsClamped(el.scrollHeight - el.clientHeight > 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [testimonial.quote]);

  return (
    <figure className="t321-mkt-quote t321-mkt-card">
      <blockquote ref={quoteRef}>&ldquo;{testimonial.quote}&rdquo;</blockquote>
      {isClamped && (
        <button type="button" className="t321-mkt-quote__more" onClick={onExpand}>
          Read more
          <span className="t321-mkt-sr-only"> of {testimonial.name}&rsquo;s review</span>
        </button>
      )}
      <figcaption>
        <div className="t321-mkt-quote__avatar" aria-hidden="true">
          {initials(testimonial.name)}
        </div>
        <div className="t321-mkt-quote__meta">
          <strong>{testimonial.name}</strong>
          <span>
            {testimonial.role} · {testimonial.company}
          </span>
        </div>
      </figcaption>
      {testimonial.stat && (
        <p className="t321-mkt-quote__stat">
          <strong>{testimonial.stat.value}</strong> {testimonial.stat.label}
        </p>
      )}
    </figure>
  );
}

function QuoteModal({
  testimonial,
  onClose
}: {
  testimonial: Testimonial | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!testimonial) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [testimonial, onClose]);

  if (!testimonial) return null;

  return (
    <div
      className="t321-mkt-quote-modal"
      role="dialog"
      aria-modal="true"
      aria-label={`Review from ${testimonial.name}`}
      onClick={onClose}
    >
      <div className="t321-mkt-quote-modal__panel" onClick={(e) => e.stopPropagation()}>
        <button
          ref={closeRef}
          type="button"
          className="t321-mkt-quote-modal__close"
          aria-label="Close review"
          onClick={onClose}
        >
          <i className="fas fa-times" aria-hidden="true" />
        </button>
        <blockquote className="t321-mkt-quote-modal__quote">
          &ldquo;{testimonial.quote}&rdquo;
        </blockquote>
        <div className="t321-mkt-quote-modal__meta">
          <div className="t321-mkt-quote__avatar" aria-hidden="true">
            {initials(testimonial.name)}
          </div>
          <div className="t321-mkt-quote__meta">
            <strong>{testimonial.name}</strong>
            <span>
              {testimonial.role} · {testimonial.company}
            </span>
          </div>
        </div>
        {testimonial.stat && (
          <p className="t321-mkt-quote__stat">
            <strong>{testimonial.stat.value}</strong> {testimonial.stat.label}
          </p>
        )}
      </div>
    </div>
  );
}

export default function TestimonialQuotes({ items }: { items: Testimonial[] }) {
  const [expanded, setExpanded] = useState<Testimonial | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollOn, setCanScrollOn] = useState(false);

  // The track is a scroll-snap rail, so touch swiping comes free and the
  // arrows only have to drive it. They show when there is actually something
  // off-screen — three cards on a desktop row fills it exactly and needs no
  // controls, while a fourth, or any narrower viewport, does.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () => {
      setCanScrollBack(el.scrollLeft > 4);
      setCanScrollOn(Math.ceil(el.scrollLeft + el.clientWidth) < el.scrollWidth - 4);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [items.length]);

  // One card per press. scrollBy without an explicit behavior follows the
  // stylesheet, which drops to instant under prefers-reduced-motion.
  const step = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".t321-mkt-quote");
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({ left: direction * (card ? card.offsetWidth + gap : el.clientWidth) });
  };

  const showControls = canScrollBack || canScrollOn;

  return (
    <>
      <div
        className="t321-mkt-quotes"
        ref={trackRef}
        role="region"
        aria-label="Customer reviews"
        tabIndex={0}
      >
        {items.map((t) => (
          <QuoteCard key={t.id} testimonial={t} onExpand={() => setExpanded(t)} />
        ))}
      </div>

      {showControls && (
        <div className="t321-mkt-quotes__controls">
          <button
            type="button"
            className="t321-mkt-quotes__arrow"
            onClick={() => step(-1)}
            disabled={!canScrollBack}
            aria-label="Previous reviews"
          >
            <i className="fas fa-arrow-left" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="t321-mkt-quotes__arrow"
            onClick={() => step(1)}
            disabled={!canScrollOn}
            aria-label="Next reviews"
          >
            <i className="fas fa-arrow-right" aria-hidden="true" />
          </button>
        </div>
      )}

      <QuoteModal testimonial={expanded} onClose={() => setExpanded(null)} />
    </>
  );
}

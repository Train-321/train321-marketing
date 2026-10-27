"use client";

// Testimonials: a soft-washed band with up to six quote cards in an even
// three-column grid. Each card leads with the Studio "stat" as a highlight
// line, carries a big serif quotation mark, and ends with a gradient-initial
// avatar. The aggregate rating (a real company stat) sits in the header; no
// per-quote stars are invented.
//
// Quotes run from a few lines to a few paragraphs, so each one is clamped and
// every card in a row is the same height. When the clamp actually cuts text
// (measured, not guessed from length), "Read more" opens the full quote in a
// dialog — the same pattern as the canonical home page.
//
// Opening morphs the card into the dialog the way the course cards do (see
// CourseModal.tsx): the clicked card alone takes a shared view-transition
// name, then inside document.startViewTransition() the dialog takes it over
// while the card hides, and the browser grows one into the other. Closing
// runs it backwards. No View Transitions API, or reduced motion: a plain
// CSS fade instead.

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";
import type { SectionHead, Testimonial } from "@/lib/sanity";
import { Reveal } from "./motion";
import AccentLast from "./AccentLast";

type Stat = { value: string; label: string };

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0] || "")
    .join("")
    .toUpperCase();
}

/** The one shared-element name the clicked card and the dialog morph through. */
const QUOTE_MORPH = "v5-quote-morph";

// The Studio "stat" reads as the review's title: the value as the headline,
// the label as a quieter line under it, both exactly as the editor wrote them.
function Lead({ stat }: { stat: Testimonial["stat"] }) {
  if (!stat?.value) return null;
  return (
    <p className="v5-quote__lead">
      <strong>{stat.value}</strong>
      {stat.label && <span>{stat.label}</span>}
    </p>
  );
}

function Who({ t }: { t: Testimonial }) {
  return (
    <>
      <span className="v5-quote__avatar" aria-hidden="true">
        {initials(t.name)}
      </span>
      <span className="v5-quote__who">
        <strong>{t.name}</strong>
        <span>{[t.role, t.company].filter(Boolean).join(" · ")}</span>
      </span>
    </>
  );
}

function QuoteCard({
  t,
  index,
  isOpen,
  isMorphSource,
  onExpand
}: {
  t: Testimonial;
  index: number;
  /** Its dialog is up: the card hides, since it "became" the dialog. */
  isOpen: boolean;
  /** Carries the morph name, from the click until the close lands. */
  isMorphSource: boolean;
  onExpand: (trigger: HTMLElement) => void;
}) {
  const textRef = useRef<HTMLParagraphElement | null>(null);
  const [clamped, setClamped] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    // Re-measured on resize: how much fits changes with the column width.
    const measure = () => setClamped(el.scrollHeight - el.clientHeight > 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [t.quote]);

  return (
    <Reveal
      as="figure"
      className="v5-quote"
      index={index}
      style={
        {
          viewTransitionName: isMorphSource ? QUOTE_MORPH : undefined,
          visibility: isOpen ? "hidden" : undefined
        } as CSSProperties
      }
    >
      <span className="v5-quote__mark" aria-hidden="true">
        “
      </span>
      <Lead stat={t.stat} />
      <blockquote>
        <p ref={textRef}>{t.quote}</p>
      </blockquote>
      {clamped && (
        <button
          type="button"
          className="v5-quote__more"
          aria-haspopup="dialog"
          onClick={(e) => onExpand(e.currentTarget)}
        >
          Read more <span className="v5-sr-only">of {t.name}&rsquo;s review</span>
          <i className="fas fa-arrow-right" aria-hidden="true" />
        </button>
      )}
      <figcaption>
        <Who t={t} />
      </figcaption>
    </Reveal>
  );
}

/** Full quote. The card that was clicked grows into this panel (see the
 *  morph notes on TestimonialsV5); it sits inside the overlay as a plain
 *  fixed layer, like the course dialog, so both can be captured by name. */
function QuoteDialog({ t, onClose }: { t: Testimonial | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  // Esc closes; the page behind stops scrolling; focus moves into the panel.
  useEffect(() => {
    if (!t) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // The gutter stays reserved, so locking the scroll doesn't shift the
    // page sideways by a scrollbar's width under the morph.
    const root = document.documentElement;
    const prev = { overflow: root.style.overflow, gutter: root.style.scrollbarGutter };
    root.style.scrollbarGutter = "stable";
    root.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      root.style.overflow = prev.overflow;
      root.style.scrollbarGutter = prev.gutter;
    };
  }, [t, onClose]);

  if (!t) return null;

  return (
    <div className="v5-quote-dialog" role="presentation" onClick={onClose}>
      <div
        className="v5-quote-dialog__panel"
        role="dialog"
        aria-modal="true"
        aria-label={`Review from ${t.name}`}
        style={{ viewTransitionName: QUOTE_MORPH } as CSSProperties}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          className="v5-quote-dialog__close"
          aria-label="Close review"
          onClick={onClose}
        >
          <i className="fas fa-times" aria-hidden="true" />
        </button>
        <Lead stat={t.stat} />
        <blockquote>
          {t.quote
            .split(/\n+/)
            .filter((p) => p.trim())
            .map((p, i) => (
              <p key={i}>{p}</p>
            ))}
        </blockquote>
        <div className="v5-quote-dialog__who">
          <Who t={t} />
        </div>
      </div>
    </div>
  );
}

type VTDocument = Document & {
  startViewTransition?: (cb: () => void) => { finished: Promise<void> };
};

function canMorph(): boolean {
  return (
    Boolean((document as VTDocument).startViewTransition) &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Runs one quote morph. The class on <html> scopes the CSS that keeps the
 *  rest of the page still (no root cross-fade) to this transition only. */
function morph(update: () => void): Promise<void> {
  const root = document.documentElement;
  root.classList.add("v5-quote-vt");
  const transition = (document as VTDocument).startViewTransition!(() => flushSync(update));
  return transition.finished.finally(() => root.classList.remove("v5-quote-vt"));
}

export default function TestimonialsV5({
  items,
  companyStats,
  head
}: {
  items: Testimonial[];
  companyStats: Stat[];
  head?: SectionHead;
}) {
  const [expanded, setExpanded] = useState<Testimonial | null>(null);
  // The card holding the morph name. Set before the open transition (so the
  // "before" snapshot has a source) and cleared only once the close lands
  // (so the shrink-back has a target).
  const [morphId, setMorphId] = useState<string | null>(null);
  const trigger = useRef<HTMLElement | null>(null);

  const open = useCallback((t: Testimonial, from: HTMLElement) => {
    trigger.current = from;
    if (!canMorph()) {
      setMorphId(t.id);
      setExpanded(t);
      return;
    }
    flushSync(() => setMorphId(t.id));
    void morph(() => setExpanded(t));
  }, []);

  const close = useCallback(() => {
    // Focus goes back to the card's "Read more" once it's visible again.
    const done = () => {
      setMorphId(null);
      trigger.current?.focus({ preventScroll: true });
    };
    if (!canMorph()) {
      setExpanded(null);
      done();
      return;
    }
    void morph(() => setExpanded(null)).finally(done);
  }, []);

  if (!items.length) return null;
  const rating = companyStats.find((s) => /rating/i.test(s.label));
  const certs = companyStats.find((s) => /certificate/i.test(s.label));
  const shown = items.slice(0, 6);

  return (
    <section className="v5-section v5-quotes" id="testimonials" aria-labelledby="v5-quotes-title">
      <div className="v5-container">
        <Reveal className="v5-head v5-head--center">
          <p className="v5-eyebrow">
            <i className={head?.icon || "fas fa-quote-left"} aria-hidden="true" /> {head?.eyebrow || "From the floor"}
          </p>
          <h2 id="v5-quotes-title" className="v5-h2">
            {head?.heading ? (
              <AccentLast text={head.heading} />
            ) : (
              <>
                Operators who stopped <em>chasing certificates.</em>
              </>
            )}
          </h2>
          {/* The default lede only belongs with the default heading. */}
          {(head?.lede || !head?.heading) && (
            <p className="v5-lede">
              {head?.lede ||
                "Real words from HR managers, training leads and association partners who run compliance for their teams."}
            </p>
          )}
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
            <QuoteCard
              key={t.id}
              t={t}
              index={i}
              isOpen={expanded?.id === t.id}
              isMorphSource={morphId === t.id && expanded?.id !== t.id}
              onExpand={(from) => open(t, from)}
            />
          ))}
        </div>
        <QuoteDialog t={expanded} onClose={close} />
      </div>
    </section>
  );
}

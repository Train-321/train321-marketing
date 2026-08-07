"use client";

// Card-to-dialog morph for marketplace course cards.
//
// Clicking a card doesn't just open a dialog — the card itself grows into
// it. Mechanism: at click time the clicked card (and ONLY that card — a name
// per card would drag every card into the transition and let neighbors'
// snapshots paint over the morph) is given the shared view-transition-name;
// then inside document.startViewTransition() the dialog takes the name over
// while the card hides, so the browser morphs the one element into the
// other and the grid slot sits empty until the dialog returns the card on
// close. Browsers without the View Transitions API (and reduced-motion
// users) get an instant open with a plain CSS fade/pop fallback instead.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { flushSync } from "react-dom";
import type { MarketplaceCourse } from "@/lib/newFeatures";
import AddToCartButton from "./cart/AddToCartButton";
import SkeletonImage from "./SkeletonImage";
import "./CourseModal.css";

/** The one shared-element name the clicked card/dialog pair morphs through. */
export const COURSE_MORPH_NAME = "t321-course-morph";

type CourseModalCtx = {
  /** Morph the given course's card into the detail dialog. */
  open: (course: MarketplaceCourse) => void;
  /** Which course's dialog is up — its card hides (it "became" the dialog). */
  activeId: number | null;
  /** Which card currently carries the morph name (click → close cleanup). */
  morphId: number | null;
};

const Ctx = createContext<CourseModalCtx | null>(null);

export function useCourseModal() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Course cards need <CourseModalProvider>");
  return ctx;
}

/**
 * The LMS marketplace description is admin-authored rich HTML. It comes from
 * the client's own backend, but strip the actively dangerous bits anyway
 * before letting it into the page: executable elements, inline handlers, and
 * javascript: URLs.
 */
function sanitizeHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc
    .querySelectorAll("script,style,iframe,object,embed,link,meta,form")
    .forEach((n) => n.remove());
  doc.querySelectorAll("*").forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      if (name.startsWith("on")) el.removeAttribute(attr.name);
      else if (
        (name === "href" || name === "src") &&
        /^\s*javascript:/i.test(attr.value)
      )
        el.removeAttribute(attr.name);
    }
  });
  return doc.body.innerHTML;
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

export function CourseModalProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<MarketplaceCourse | null>(null);
  // The card currently holding the shared-element name. Set BEFORE the open
  // transition (so the "before" snapshot has a source) and cleared only after
  // the close transition lands (so the "after" snapshot has a target).
  const [morphId, setMorphId] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const open = useCallback((course: MarketplaceCourse) => {
    const doc = document as VTDocument;
    if (!canMorph()) {
      setMorphId(course.id);
      setActive(course);
      return;
    }
    // 1. Tag the clicked card as the morph source, synchronously, so the
    //    old-state snapshot captures it under the shared name.
    flushSync(() => setMorphId(course.id));
    // 2. Swap to the dialog inside the transition — it takes the name over
    //    while the card hides, and the browser animates one into the other.
    doc.startViewTransition!(() => {
      flushSync(() => setActive(course));
    });
  }, []);

  const close = useCallback(() => {
    const doc = document as VTDocument;
    if (!canMorph()) {
      setActive(null);
      setMorphId(null);
      return;
    }
    const transition = doc.startViewTransition!(() => {
      flushSync(() => setActive(null));
    });
    // The card needs the name until the shrink-back lands; then release it
    // so the next transition on the page doesn't drag the card along.
    transition.finished.finally(() => setMorphId(null));
  }, []);

  // Esc closes; the page behind the overlay stops scrolling.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [active, close]);

  const value = useMemo(
    () => ({ open, activeId: active?.id ?? null, morphId }),
    [open, active, morphId]
  );

  const desc = useMemo(
    () => (active?.description ? sanitizeHtml(active.description) : ""),
    [active]
  );

  return (
    <Ctx.Provider value={value}>
      {children}

      {active && (
        <div className="t321-cm__overlay" onClick={close} role="presentation">
          <div
            ref={dialogRef}
            className="t321-cm"
            role="dialog"
            aria-modal="true"
            aria-label={active.name}
            tabIndex={-1}
            style={{ viewTransitionName: COURSE_MORPH_NAME } as React.CSSProperties}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="t321-cm__close"
              aria-label="Close"
              onClick={close}
            >
              <i className="fas fa-times" aria-hidden="true" />
            </button>

            <div className="t321-cm__media">
              <SkeletonImage src={active.image} alt={active.name} />
            </div>

            <div className="t321-cm__body">
              {active.stateLabel && (
                <span className="t321-cm__chip">
                  <i className="fas fa-map-marker-alt" aria-hidden="true" />
                  {active.stateLabel}
                </span>
              )}
              <h3 className="t321-cm__title">{active.name}</h3>

              {desc ? (
                <div
                  className="t321-cm__desc"
                  // Sanitized above — executable content stripped.
                  dangerouslySetInnerHTML={{ __html: desc }}
                />
              ) : (
                <p className="t321-cm__desc t321-cm__desc--empty">
                  Self-paced online course with an instant certificate on
                  completion.
                </p>
              )}

              <div className="t321-cm__foot">
                {active.price > 0 ? (
                  <span className="t321-cm__price">
                    <span>From</span>
                    <strong>${active.price}</strong>
                    <span>/ seat</span>
                  </span>
                ) : (
                  <span className="t321-cm__price">
                    <strong>Custom</strong>
                  </span>
                )}
                {/* The button's own handler adds to the cart, then the click
                    bubbles here and the dialog morphs back into its card —
                    leaving the confirmation toast (or drawer) in view. */}
                <div className="t321-cm__actions" onClick={close}>
                  <AddToCartButton
                    course={{
                      id: active.id,
                      name: active.name,
                      price: active.price,
                      image: active.image,
                      isSeatBased: active.isSeatBased,
                      stateLabel: active.stateLabel
                    }}
                    mode="add"
                    className="t321-mkt-btn t321-mkt-btn--primary t321-mkt-btn--lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}

"use client";

// The marketplace course card used by /catalog and the home course finder.
// The whole card is clickable: it morphs into the course detail dialog (see
// CourseModal.tsx) — except the Add-to-cart button, which keeps its own job.

import type { MarketplaceCourse } from "@/lib/newFeatures";
import { toBlurb } from "@/lib/newFeatures";
import AddToCartButton from "./cart/AddToCartButton";
import SkeletonImage from "./SkeletonImage";
import { COURSE_MORPH_NAME, useCourseModal } from "./CourseModal";

export default function CourseCard({ course }: { course: MarketplaceCourse }) {
  const { open, activeId, morphId } = useCourseModal();

  // Dialog up for this course → the card hides: it hasn't been covered by a
  // dialog, it BECAME the dialog, and its grid slot waits empty for the
  // shrink-back. The morph name rides on the card only while it's the
  // transition's source/target — while the dialog is open the dialog owns
  // the name, and a duplicate would abort the whole transition.
  const isOpen = activeId === course.id;
  const isMorphSource = morphId === course.id && !isOpen;

  return (
    <article
      className="t321-mkt-catalog__card t321-mkt-card t321-mkt-card--click"
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-label={`${course.name} — view details`}
      style={
        {
          viewTransitionName: isMorphSource ? COURSE_MORPH_NAME : undefined,
          visibility: isOpen ? "hidden" : undefined
        } as React.CSSProperties
      }
      onClick={() => open(course)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open(course);
        }
      }}
    >
      <div className="t321-mkt-catalog__card-top has-image is-tone-accent">
        <SkeletonImage src={course.image} alt={course.name} className="t321-mkt-catalog__card-img" />
      </div>
      <div className="t321-mkt-catalog__card-body">
        <h3 className="t321-mkt-h3">{course.name}</h3>
        {course.description && <p>{toBlurb(course.description)}</p>}

        <div className="t321-mkt-catalog__card-foot">
          <div>
            {course.price > 0 ? (
              <span className="t321-mkt-catalog__card-price">
                <span>From</span>
                <strong>${course.price}</strong>
                <span>/ seat</span>
              </span>
            ) : (
              <span className="t321-mkt-catalog__card-price">
                <strong>Custom</strong>
              </span>
            )}
          </div>
          <div
            className="t321-mkt-catalog__card-actions"
            // Adding to the cart is not "open the dialog" — keep the click
            // (and the keyboard events the button handles itself) local.
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <AddToCartButton
              course={{
                id: course.id,
                name: course.name,
                price: course.price,
                image: course.image,
                isSeatBased: course.isSeatBased,
                stateLabel: course.stateLabel
              }}
              mode="add"
              className="t321-mkt-btn t321-mkt-btn--primary"
            />
          </div>
        </div>
      </div>
    </article>
  );
}

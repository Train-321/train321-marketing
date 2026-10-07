"use client";

// Marketplace course card for the /v5 finder grid. Same contract as
// components/CourseCard.tsx — the card morphs into the shared course dialog,
// Add-to-cart keeps its own click — with the v5 look: tall media, a state
// badge that answers "is this the one for MY state?", price up front.

import type { CSSProperties } from "react";
import type { MarketplaceCourse } from "@/lib/newFeatures";
import { toBlurb } from "@/lib/newFeatures";
import { STATE_NAMES, availabilityShort } from "@/lib/states";
import AddToCartButton from "@/components/cart/AddToCartButton";
import SkeletonImage from "@/components/SkeletonImage";
import { COURSE_MORPH_NAME, useCourseModal } from "@/components/CourseModal";

type Props = {
  course: MarketplaceCourse;
  stateCode: string | null;
  /** Position in the grid — staggers the entrance animation. */
  index: number;
};

function badgeFor(course: MarketplaceCourse, stateCode: string | null): { text: string; tone: string; icon: string } {
  const a = course.availability;
  if (stateCode) {
    if (a.kind === "in") {
      return { text: `${STATE_NAMES[stateCode]} version`, tone: "specific", icon: "fa-check-circle" };
    }
    return { text: `Accepted in ${STATE_NAMES[stateCode]}`, tone: "ok", icon: "fa-map-marker-alt" };
  }
  if (a.kind === "all") return { text: "Accepted nationwide", tone: "all", icon: "fa-globe-americas" };
  return { text: availabilityShort(a), tone: "limited", icon: "fa-map-marker-alt" };
}

export default function V5CourseCard({ course, stateCode, index }: Props) {
  const { open, activeId, morphId } = useCourseModal();
  const isOpen = activeId === course.id;
  const isMorphSource = morphId === course.id && !isOpen;
  const badge = badgeFor(course, stateCode);
  const blurb = course.description ? toBlurb(course.description, 120) : "";
  const price = course.price % 1 === 0 ? String(course.price) : course.price.toFixed(2);

  return (
    <div
      className="v5-course"
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      style={
        {
          viewTransitionName: isMorphSource ? COURSE_MORPH_NAME : undefined,
          visibility: isOpen ? "hidden" : undefined,
          "--v5-i": index
        } as CSSProperties
      }
      onClick={() => open(course)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open(course);
        }
      }}
    >
      <div className="v5-course__media">
        <SkeletonImage src={course.image} alt={course.name} className="v5-course__img" width={480} />
        <span className={`v5-course__badge v5-course__badge--${badge.tone}`}>
          <i className={`fas ${badge.icon}`} aria-hidden="true" />
          {badge.text}
        </span>
      </div>
      <div className="v5-course__body">
        <h3 className="v5-course__name">{course.name}</h3>
        {blurb && <p className="v5-course__blurb">{blurb}</p>}
        <div className="v5-course__foot">
          {course.price > 0 ? (
            <span className="v5-course__price">
              <small>from</small>
              <strong>${price}</strong>
              {course.isSeatBased && <small>/ seat</small>}
            </span>
          ) : (
            <span className="v5-course__price">
              <strong>Custom</strong>
            </span>
          )}
          <span
            className="v5-course__actions"
            // Adding to the cart is not "open the dialog".
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
              className="v5-btn v5-btn--ink v5-btn--sm"
              showArrow={false}
            />
          </span>
        </div>
      </div>
    </div>
  );
}

"use client";

// Modern course browser for /marketing-v9: category filter chips over a grid of
// add-to-cart cards. Courses come pre-flattened from the page (marketplace
// catalog), each tagged with its category label so filtering is pure client state.

import { useState } from "react";
import { toBlurb, type MarketplaceCourse } from "@/lib/newFeatures";
import V9AddButton from "./cart/V9AddButton";

export type V9Course = MarketplaceCourse & { catLabel: string };

export default function CoursesV9({
  courses,
  categories
}: {
  courses: V9Course[];
  categories: string[];
}) {
  const [active, setActive] = useState<string>("all");
  const shown = active === "all" ? courses : courses.filter((c) => c.catLabel === active);

  return (
    <>
      {categories.length > 1 && (
        <div className="v9c-filters" role="tablist" aria-label="Filter courses">
          <button
            type="button"
            className={`v9c-filter${active === "all" ? " is-on" : ""}`}
            aria-pressed={active === "all"}
            onClick={() => setActive("all")}
          >
            All courses
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`v9c-filter${active === cat ? " is-on" : ""}`}
              aria-pressed={active === cat}
              onClick={() => setActive(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="v9c-grid">
        {shown.map((c) => (
          <Card key={c.id} course={c} />
        ))}
      </div>
    </>
  );
}

function Card({ course }: { course: V9Course }) {
  const blurb = course.description ? toBlurb(course.description, 90) : "";
  return (
    <article className="v9c-card">
      <div className="v9c-card__media">
        {course.image ? (
          <img src={course.image} alt="" />
        ) : (
          <span className="v9c-card__ic"><i className="fas fa-certificate" aria-hidden="true" /></span>
        )}
        <span className="v9c-card__cat">{course.catLabel}</span>
      </div>
      <div className="v9c-card__body">
        {course.stateLabel && (
          <span className="v9c-card__state"><i className="fas fa-location-dot" aria-hidden="true" /> {course.stateLabel}</span>
        )}
        <h3 className="v9c-card__title">{course.name}</h3>
        {blurb && <p className="v9c-card__blurb">{blurb}</p>}
        <div className="v9c-card__meta">
          <span><i className="fas fa-laptop" aria-hidden="true" /> Online</span>
          <span><i className="fas fa-certificate" aria-hidden="true" /> Certificate</span>
        </div>
        <div className="v9c-card__foot">
          <span className="v9c-card__price">
            {course.price > 0 ? (
              <>From <strong>${course.price}</strong><span>/seat</span></>
            ) : (
              <strong>Custom</strong>
            )}
          </span>
          <V9AddButton
            course={{
              id: course.id,
              name: course.name,
              price: course.price,
              image: course.image,
              stateLabel: course.stateLabel
            }}
            className="gs-btn gs-btn--primary v9c-card__add"
          />
        </div>
      </div>
    </article>
  );
}

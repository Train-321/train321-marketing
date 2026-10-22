"use client";

// Modern course browser for /marketing-v9: a search box + category filter
// chips over a grid of add-to-cart cards, revealed a page at a time with a
// "Load more" button. Courses come pre-flattened from the page (marketplace
// catalog), each tagged with its category label so filtering is client state.

import { useEffect, useMemo, useState } from "react";
import { toBlurb, type MarketplaceCourse } from "@/lib/newFeatures";
import V9AddButton from "./cart/V9AddButton";

export type V9Course = MarketplaceCourse & { catLabel: string };

const PAGE_SIZE = 9;

export default function CoursesV9({
  courses,
  categories
}: {
  courses: V9Course[];
  categories: string[];
}) {
  const [active, setActive] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((c) => {
      if (active !== "all" && c.catLabel !== active) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.catLabel.toLowerCase().includes(q) ||
        (c.stateLabel || "").toLowerCase().includes(q)
      );
    });
  }, [courses, active, query]);

  // Re-collapse to the first page whenever the filter or search changes, so a
  // new result set doesn't open with a long list already expanded.
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [active, query]);

  const shown = filtered.slice(0, visible);
  const remaining = filtered.length - shown.length;

  return (
    <>
      {/* Search */}
      <div className="v9c-search">
        <i className="fas fa-magnifying-glass" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search courses…"
          aria-label="Search courses"
        />
        {query && (
          <button type="button" className="v9c-search__clear" aria-label="Clear search" onClick={() => setQuery("")}>
            <i className="fas fa-xmark" aria-hidden="true" />
          </button>
        )}
      </div>

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

      {shown.length > 0 ? (
        <div className="v9c-grid">
          {shown.map((c) => (
            <Card key={c.id} course={c} />
          ))}
        </div>
      ) : (
        <p className="v9c-empty">
          No courses match{query ? ` “${query.trim()}”` : " that filter"}.{" "}
          <button type="button" className="gs-inline-link" onClick={() => { setQuery(""); setActive("all"); }}>
            Clear
          </button>
        </p>
      )}

      {remaining > 0 && (
        <div className="v9c-more">
          <button type="button" className="gs-btn gs-btn--ghost" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
            Load more <span>({remaining} more)</span>
          </button>
        </div>
      )}
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
              isSeatBased: course.isSeatBased,
              stateLabel: course.stateLabel
            }}
            className="gs-btn gs-btn--primary v9c-card__add"
          />
        </div>
      </div>
    </article>
  );
}

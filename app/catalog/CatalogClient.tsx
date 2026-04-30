"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Course } from "@/lib/sanity";
import "./catalog.css";

const CATEGORY_DEFS = [
  { id: "all", label: "All", icon: "fas fa-th" },
  { id: "food", label: "Food safety", icon: "fas fa-utensils" },
  { id: "alcohol", label: "Alcohol", icon: "fas fa-wine-glass-alt" },
  { id: "hr", label: "HR & compliance", icon: "fas fa-users-cog" }
];

type SortMode = "alpha" | "price-asc" | "price-desc";

export default function CatalogClient({ courses }: { courses: Course[] }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [sortMode, setSortMode] = useState<SortMode>("alpha");

  const totalCount = courses.length;

  const categoryChips = useMemo(
    () =>
      CATEGORY_DEFS.map((c) => ({
        ...c,
        count:
          c.id === "all"
            ? courses.length
            : courses.filter((x) => x.category === c.id).length
      })),
    [courses]
  );

  const filteredCourses = useMemo(() => {
    let list = courses.slice();

    if (activeCategory !== "all") {
      list = list.filter((c) => c.category === activeCategory);
    }

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((c) => {
        const hay = [
          c.title,
          c.summary,
          c.tagline,
          c.eyebrow,
          (c.accreditations || []).join(" ")
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    switch (sortMode) {
      case "price-asc":
        list.sort((a, b) => (a.priceFrom ?? 1e9) - (b.priceFrom ?? 1e9));
        break;
      case "price-desc":
        list.sort((a, b) => (b.priceFrom ?? 0) - (a.priceFrom ?? 0));
        break;
      case "alpha":
      default:
        list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [query, activeCategory, sortMode, courses]);

  const resetFilters = () => {
    setQuery("");
    setActiveCategory("all");
  };

  return (
    <div className="t321-mkt-catalog">
      <section className="t321-mkt-catalog__hero">
        <div className="t321-mkt-container">
          <span className="t321-mkt-eyebrow"><i className="fas fa-th" /> Course library</span>
          <h1 className="t321-mkt-h1">Every course, one page.</h1>
          <p className="t321-mkt-lede">
            Browse our full catalog — {totalCount} courses across food safety,
            alcohol service, HR compliance, and specialized training.
          </p>

          <div className="t321-mkt-catalog__search">
            <i className="fas fa-search" aria-hidden="true" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              placeholder="Search courses…"
              aria-label="Search courses"
            />
            {query && (
              <button
                type="button"
                className="t321-mkt-catalog__search-clear"
                aria-label="Clear"
                onClick={() => setQuery("")}
              >
                <i className="fas fa-times" />
              </button>
            )}
          </div>

          <div className="t321-mkt-catalog__filters" role="tablist" aria-label="Category filter">
            {categoryChips.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                className={`t321-mkt-catalog__chip${activeCategory === c.id ? " is-active" : ""}`}
                aria-selected={activeCategory === c.id}
                onClick={() => setActiveCategory(c.id)}
              >
                <i className={c.icon} aria-hidden="true" />
                {c.label}
                <span className="t321-mkt-catalog__chip-count">{c.count}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="t321-mkt-section">
        <div className="t321-mkt-container">
          <div className="t321-mkt-catalog__toolbar">
            <p className="t321-mkt-catalog__count">
              Showing <strong>{filteredCourses.length}</strong> of {totalCount} courses
              {query && <span> matching &ldquo;{query}&rdquo;</span>}
            </p>
            <label className="t321-mkt-catalog__sort">
              <span>Sort</span>
              <select value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)}>
                <option value="alpha">A-Z</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </label>
          </div>

          {filteredCourses.length ? (
            <div className="t321-mkt-catalog__grid">
              {filteredCourses.map((c) => (
                <article key={c.slug} className="t321-mkt-catalog__card t321-mkt-card">
                  <div className={`t321-mkt-catalog__card-top${c.image ? " has-image" : ""} is-tone-${c.color || "accent"}`}>
                    {c.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        className="t321-mkt-catalog__card-img"
                        src={c.image}
                        alt={c.title}
                        loading="lazy"
                      />
                    ) : (
                      <i className={c.icon || "fas fa-graduation-cap"} aria-hidden="true" />
                    )}
                  </div>
                  <div className="t321-mkt-catalog__card-body">
                    <span className="t321-mkt-catalog__card-eyebrow">{c.eyebrow}</span>
                    <h3 className="t321-mkt-h3">{c.title}</h3>
                    <p>{c.tagline}</p>

                    <div className="t321-mkt-catalog__card-meta">
                      {c.modules && (
                        <span>
                          <i className="fas fa-clock" aria-hidden="true" />
                          {c.modules.length} modules
                        </span>
                      )}
                      {c.accreditations && c.accreditations.length > 0 && (
                        <span>
                          <i className="fas fa-check-circle" aria-hidden="true" />
                          {c.accreditations[0]}
                        </span>
                      )}
                    </div>

                    <div className="t321-mkt-catalog__card-foot">
                      <div>
                        {c.priceFrom != null ? (
                          <span className="t321-mkt-catalog__card-price">
                            <span>From</span>
                            <strong>${c.priceFrom}</strong>
                            <span>/ seat</span>
                          </span>
                        ) : (
                          <span className="t321-mkt-catalog__card-price">
                            <strong>Custom</strong>
                          </span>
                        )}
                      </div>
                      <div className="t321-mkt-catalog__card-actions">
                        <Link href={`/courses/${c.slug}`} className="t321-mkt-btn t321-mkt-btn--subtle">
                          Details
                        </Link>
                        <Link
                          href={`/enroll?add=${c.enrollId}`}
                          className="t321-mkt-btn t321-mkt-btn--primary"
                        >
                          Enroll
                          <i className="fas fa-arrow-right" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="t321-mkt-catalog__empty">
              <i className="fas fa-search" aria-hidden="true" />
              <h3>No courses match your search.</h3>
              <p>Try a different term or clear your filters.</p>
              <button
                type="button"
                className="t321-mkt-btn t321-mkt-btn--ghost"
                onClick={resetFilters}
              >
                Clear search &amp; filters
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="t321-mkt-section t321-mkt-section--ink">
        <div className="t321-mkt-container t321-mkt-catalog__cta">
          <div>
            <h2 className="t321-mkt-h2">Need something we don&apos;t offer?</h2>
            <p className="t321-mkt-lede">
              We build custom courses to your SOPs and brand. Typical delivery in 4-6 weeks.
            </p>
          </div>
          <div className="t321-mkt-catalog__cta-actions">
            <Link href="/contact" className="t321-mkt-btn t321-mkt-btn--accent t321-mkt-btn--lg">
              Talk to us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

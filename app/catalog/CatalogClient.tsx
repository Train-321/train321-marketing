"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CatalogPage } from "@/lib/sanity";
import type { MarketplaceCourse, MarketplaceCategory, MarketplaceCatalog } from "@/lib/newFeatures";
import CustomSelect from "@/components/CustomSelect";
import CourseCard from "@/components/CourseCard";
import { CourseModalProvider } from "@/components/CourseModal";
import { US_STATES } from "@/lib/states";
import "./catalog.css";

/** Sentinel option that clears the state filter back to the baseline. */
const ALL_STATES_OPTION = "All states";
const STATE_OPTIONS = [ALL_STATES_OPTION, ...US_STATES.map((s) => s.name)];

type Props = {
  initialCourses: MarketplaceCourse[];
  categories: MarketplaceCategory[];
  initialTotal: number;
  page?: CatalogPage | null;
};

export default function CatalogClient({
  initialCourses,
  categories,
  initialTotal,
  page
}: Props) {
  const [query, setQuery] = useState("");
  // activeCategory holds a marketplace category id (as string) or "all".
  const [activeCategory, setActiveCategory] = useState<string>("all");
  // stateName holds a full state name ("Ohio") or "" for the everywhere
  // baseline. The 2-letter code is derived when building the request.
  const [stateName, setStateName] = useState("");

  const [courses, setCourses] = useState<MarketplaceCourse[]>(initialCourses);
  const [total, setTotal] = useState(initialTotal);
  const [pageNum, setPageNum] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const heroEyebrow = page?.heroEyebrow || "Course library";
  const heroHeading = page?.heroHeading || "Every course, one page.";
  const heroLede =
    page?.heroLede ||
    `Browse our full catalog — ${initialTotal} courses across food safety, alcohol service, HR compliance, and specialized training.`;
  const searchPlaceholder = page?.searchPlaceholder || "Search courses…";
  const emptyText = page?.emptyText || "No courses match your search.";
  const clearLabel = page?.clearFiltersLabel || "Clear search & filters";

  const cta = page?.bottomCta;
  const ctaHeading = cta?.heading || "Need something we don't offer?";
  const ctaLede =
    cta?.lede ||
    "We build custom courses to your SOPs and brand. Typical delivery in 4-6 weeks.";
  const ctaLabel = cta?.primaryCta?.label || "Talk to us";
  const ctaHref = cta?.primaryCta?.to || "/contact";

  const categoryChips = [
    { id: "all", label: "All" },
    ...categories.map((c) => ({ id: String(c.id), label: c.name }))
  ];

  const hasMore = courses.length < total;

  // Fetch a page from the proxy route. page 1 replaces the list (used on
  // search / category / state change); higher pages append (infinite scroll).
  const fetchPage = useCallback(
    async (nextPage: number, search: string, category: string, state: string) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ page: String(nextPage) });
        if (search.trim()) params.set("search", search.trim());
        if (category !== "all") params.set("categoryId", category);
        const stateCode = US_STATES.find((s) => s.name === state)?.code;
        if (stateCode) params.set("stateCode", stateCode);

        const res = await fetch(`/api/catalog?${params.toString()}`);
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = (await res.json()) as MarketplaceCatalog;

        setTotal(data.total);
        setPageNum(nextPage);
        setCourses((prev) => (nextPage === 1 ? data.courses : [...prev, ...data.courses]));
      } catch {
        setError("We couldn't load courses. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Debounced reload from page 1 whenever any filter changes. Skips the very
  // first render so we reuse the server-rendered first page.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const t = setTimeout(() => fetchPage(1, query, activeCategory, stateName), 300);
    return () => clearTimeout(t);
  }, [query, activeCategory, stateName, fetchPage]);

  // Deep links from the home course finder ("/catalog?state=OH") preselect
  // the state. Read once on mount — defined AFTER the reload effect so the
  // resulting state change triggers a normal filtered fetch.
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("state");
    const match = code && US_STATES.find((s) => s.code === code.toUpperCase());
    if (match) setStateName(match.name);
  }, []);

  const resetFilters = () => {
    setQuery("");
    setActiveCategory("all");
    setStateName("");
  };

  return (
    <CourseModalProvider>
    <div className="t321-mkt-catalog">
      <section className="t321-mkt-catalog__hero">
        <div className="t321-mkt-container">
          <span className="t321-mkt-eyebrow"><i className="fas fa-th" /> {heroEyebrow}</span>
          <h1 className="t321-mkt-h1">{heroHeading}</h1>
          <p className="t321-mkt-lede">{heroLede}</p>

          <div className="t321-mkt-catalog__controls">
            <div className="t321-mkt-catalog__search">
              <i className="fas fa-search" aria-hidden="true" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="search"
                placeholder={searchPlaceholder}
                aria-label="Search courses"
              />
              {query && (
                <button type="button" className="t321-mkt-catalog__search-clear" aria-label="Clear" onClick={() => setQuery("")}>
                  <i className="fas fa-times" />
                </button>
              )}
            </div>
            <div className="t321-mkt-catalog__state">
              <CustomSelect
                value={stateName}
                options={STATE_OPTIONS}
                placeholder="Your state…"
                onChange={(v) => setStateName(v === ALL_STATES_OPTION ? "" : v)}
                ariaLabel="Filter by state"
                searchable
                searchPlaceholder="Search states…"
              />
            </div>
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
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="t321-mkt-section">
        <div className="t321-mkt-container">
          <div className="t321-mkt-catalog__toolbar">
            <p className="t321-mkt-catalog__count">
              Showing <strong>{courses.length}</strong> of {total} courses
              {stateName && <span> available in {stateName}</span>}
              {query && <span> matching &ldquo;{query}&rdquo;</span>}
            </p>
          </div>

          {courses.length ? (
            <>
              <div className="t321-mkt-catalog__grid">
                {courses.map((c) => (
                  <CourseCard key={c.id} course={c} />
                ))}
              </div>

              {error && <p className="t321-mkt-catalog__loadmore-error">{error}</p>}

              {hasMore && (
                <div className="t321-mkt-catalog__loadmore">
                  <button
                    type="button"
                    className="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg"
                    onClick={() => fetchPage(pageNum + 1, query, activeCategory, stateName)}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin" aria-hidden="true" /> Loading…
                      </>
                    ) : (
                      <>Load more courses</>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : loading ? (
            <p className="t321-mkt-catalog__loading">
              <i className="fas fa-spinner fa-spin" aria-hidden="true" /> Loading courses…
            </p>
          ) : (
            <div className="t321-mkt-catalog__empty">
              <i className="fas fa-search" aria-hidden="true" />
              <h3>{emptyText}</h3>
              <p>Try a different term or clear your filters.</p>
              <button type="button" className="t321-mkt-btn t321-mkt-btn--ghost" onClick={resetFilters}>
                {clearLabel}
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="t321-mkt-section t321-mkt-section--ink">
        <div className="t321-mkt-container t321-mkt-catalog__cta">
          <div>
            <h2 className="t321-mkt-h2">{ctaHeading}</h2>
            <p className="t321-mkt-lede">{ctaLede}</p>
          </div>
          <div className="t321-mkt-catalog__cta-actions">
            <Link href={ctaHref} className="t321-mkt-btn t321-mkt-btn--accent t321-mkt-btn--lg">
              {ctaLabel}
            </Link>
          </div>
        </div>
      </section>
    </div>
    </CourseModalProvider>
  );
}

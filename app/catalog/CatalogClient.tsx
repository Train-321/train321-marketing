"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CatalogPage } from "@/lib/sanity";
import type { MarketplaceCourse, MarketplaceCategory, MarketplaceCatalog } from "@/lib/newFeatures";
import { categoryGroupSummary, type CourseGroupSummary } from "@/lib/courseGroups";
import CustomSelect from "@/components/CustomSelect";
import CourseCard from "@/components/CourseCard";
import GroupStateDialog from "@/components/GroupStateDialog";
import { CourseModalProvider } from "@/components/CourseModal";
import { US_STATES } from "@/lib/states";
import "./catalog.css";

/** Sentinel option that clears the state filter back to the baseline. */
const ALL_STATES_OPTION = "All states";
const STATE_OPTIONS = [ALL_STATES_OPTION, ...US_STATES.map((s) => s.name)];

/** Shared "no filter" sentinel for both the group and the category selection. */
const ALL = "all";

type Props = {
  initialCourses: MarketplaceCourse[];
  categories: MarketplaceCategory[];
  /** Course-group chips shown BEFORE the category chips (see HomeCourseFinder,
      which uses the same summaries and the same state dialog). */
  groups: CourseGroupSummary[];
  initialTotal: number;
  page?: CatalogPage | null;
};

export default function CatalogClient({
  initialCourses,
  categories,
  groups,
  initialTotal,
  page
}: Props) {
  const [query, setQuery] = useState("");
  // A group and a category are mutually exclusive — one chip row, one active
  // filter. activeGroup holds a group slug or "all"; activeCategory holds a
  // marketplace category id (as string) or "all". Picking one clears the other,
  // so the request never carries both.
  const [activeGroup, setActiveGroup] = useState<string>(ALL);
  const [activeCategory, setActiveCategory] = useState<string>(ALL);
  // The group awaiting a state answer. Non-null == the state dialog is up. Same
  // flow as the home finder: a state-regulated group with no state on file asks
  // before it filters.
  const [pendingGroup, setPendingGroup] = useState<CourseGroupSummary | null>(null);
  // Same, for a state-regulated category — a separate slot so the group flow is
  // untouched. Only one is ever non-null at a time.
  const [pendingCategory, setPendingCategory] = useState<CourseGroupSummary | null>(null);
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

  // One row: All, then the group chips, then the category chips — the order
  // the request asked for. Groups carry a `kind` so the click handler knows to
  // route a state-regulated one through the dialog.
  const filterChips: Array<{ id: string; label: string; kind: "all" | "group" | "category" }> = [
    { id: ALL, label: "All", kind: "all" },
    ...groups.map((g) => ({ id: g.id, label: g.name, kind: "group" as const })),
    ...categories.map((c) => ({ id: String(c.id), label: c.name, kind: "category" as const }))
  ];

  const hasMore = courses.length < total;

  // Fetch a page from the proxy route. page 1 replaces the list (used on
  // search / group / category / state change); higher pages append.
  // group and category are mutually exclusive; at most one is ever non-"all".
  const fetchPage = useCallback(
    async (nextPage: number, search: string, group: string, category: string, state: string) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ page: String(nextPage) });
        if (search.trim()) params.set("search", search.trim());
        if (group !== ALL) params.set("groupId", group);
        if (category !== ALL) params.set("categoryId", category);
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

  // Selecting a category clears any group. A state-regulated category asks for
  // the state first — same dialog, same "ask once" rule as a group; a
  // nationwide category (or one asked after a state is already set) filters
  // straight through, exactly as before.
  const pickCategory = (id: string) => {
    const cat = categories.find((c) => String(c.id) === id);
    if (cat?.stateAware && !stateName) {
      setPendingCategory(categoryGroupSummary(cat));
      return;
    }
    setActiveGroup(ALL);
    setActiveCategory(id);
  };

  // Category dialog answered — commit the category and state together.
  const confirmPendingCategory = (picked: string) => {
    if (!pendingCategory) return;
    setActiveGroup(ALL);
    setActiveCategory(pendingCategory.id);
    setStateName(picked);
    setPendingCategory(null);
  };

  // A state-regulated group with no state on file asks first; everything else
  // filters immediately. Identical trigger to the home finder's pickGroup, so
  // the same dialog appears for the same reason on both pages.
  const pickGroup = (id: string) => {
    if (id === ALL) {
      setActiveGroup(ALL);
      setActiveCategory(ALL);
      return;
    }
    const group = groups.find((g) => g.id === id);
    if (group?.stateAware && !stateName) {
      setPendingGroup(group);
      return;
    }
    setActiveCategory(ALL);
    setActiveGroup(id);
  };

  // Dialog answered — commit the group and the state together.
  const confirmPending = (picked: string) => {
    if (!pendingGroup) return;
    setActiveCategory(ALL);
    setActiveGroup(pendingGroup.id);
    setStateName(picked);
    setPendingGroup(null);
  };

  // Debounced reload from page 1 whenever any filter changes. Skips the very
  // first render so we reuse the server-rendered first page.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const t = setTimeout(() => fetchPage(1, query, activeGroup, activeCategory, stateName), 300);
    return () => clearTimeout(t);
  }, [query, activeGroup, activeCategory, stateName, fetchPage]);

  // Deep links from the home course finder preselect the group AND state the
  // visitor was looking at ("/catalog?group=group-8&state=OH"), so the catalog
  // opens on the same filtered view. Read once on mount — defined AFTER the
  // reload effect so the resulting state change triggers a normal filtered
  // fetch. The group is set directly (not via pickGroup) so it never re-opens
  // the state dialog: the state is already in hand.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("state");
    const match = code && US_STATES.find((s) => s.code === code.toUpperCase());
    if (match) setStateName(match.name);

    const group = params.get("group");
    if (group && groups.some((g) => g.id === group)) {
      setActiveCategory(ALL);
      setActiveGroup(group);
    }

    // Category carry-over, mirroring the group one. Set directly (not via
    // pickCategory) so a state-regulated category never re-opens the state
    // dialog here — the state, if any, arrived in the URL alongside it.
    const category = params.get("category");
    if (category && categories.some((c) => String(c.id) === category)) {
      setActiveGroup(ALL);
      setActiveCategory(category);
    }
    // groups/categories are server-provided and stable for the page; runs once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetFilters = () => {
    setQuery("");
    setActiveGroup(ALL);
    setActiveCategory(ALL);
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
                clearable
                onClear={() => setStateName("")}
              />
            </div>
          </div>

          <div className="t321-mkt-catalog__filters" role="tablist" aria-label="Course group and category filter">
            {filterChips.map((c) => {
              const active =
                c.kind === "all"
                  ? activeGroup === ALL && activeCategory === ALL
                  : c.kind === "group"
                    ? activeGroup === c.id
                    : activeCategory === c.id;
              return (
                <button
                  key={`${c.kind}:${c.id}`}
                  type="button"
                  role="tab"
                  className={`t321-mkt-catalog__chip${active ? " is-active" : ""}`}
                  aria-selected={active}
                  onClick={() => (c.kind === "category" ? pickCategory(c.id) : pickGroup(c.id))}
                >
                  {c.label}
                </button>
              );
            })}
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
                    onClick={() => fetchPage(pageNum + 1, query, activeGroup, activeCategory, stateName)}
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

    {/* Same dialog, same trigger as the home finder: a state-regulated group
        clicked with no state on file asks for one before filtering. */}
    <GroupStateDialog
      group={pendingGroup}
      onConfirm={confirmPending}
      onClose={() => setPendingGroup(null)}
    />
    {/* Same dialog for a state-regulated category. */}
    <GroupStateDialog
      group={pendingCategory}
      onConfirm={confirmPendingCategory}
      onClose={() => setPendingCategory(null)}
    />
    </CourseModalProvider>
  );
}

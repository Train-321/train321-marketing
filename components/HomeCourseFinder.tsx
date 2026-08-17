"use client";

// The home hero's course finder: category chips + a state picker where the
// old "Find my course / See how it works" buttons stood, driving a live
// course grid in its own section right below the hero. Cards match the
// /catalog page exactly (same classes, same add-to-cart), and the section
// always ends in a link out to the full catalog carrying the picked state.
//
// The controls live inside the hero body while the results section sits
// outside the hero entirely, so — like the course page's state picker — the
// two halves talk through a tiny context provider.

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import type {
  MarketplaceCatalog,
  MarketplaceCategory,
  MarketplaceCourse
} from "@/lib/newFeatures";
import { US_STATES } from "@/lib/states";
import CustomSelect from "./CustomSelect";
import CourseCard from "./CourseCard";
import { CourseModalProvider } from "./CourseModal";
import "@/app/catalog/catalog.css";
import "./HomeCourseFinder.css";

/** Sentinel option that clears the state filter back to the baseline. */
const ALL_STATES_OPTION = "All states";
const STATE_OPTIONS = [ALL_STATES_OPTION, ...US_STATES.map((s) => s.name)];

/** How many cards the home section shows — the catalog handles the rest. */
const HOME_PAGE_SIZE = 6;

export type HomeMarketplace = {
  courses: MarketplaceCourse[];
  categories: MarketplaceCategory[];
  total: number;
};

type FinderState = {
  categories: MarketplaceCategory[];
  activeCategory: string;
  setActiveCategory: (id: string) => void;
  stateName: string;
  setStateName: (name: string) => void;
  courses: MarketplaceCourse[];
  total: number;
  loading: boolean;
  /**
   * Upsell shown when the main result is empty: with a state picked, other
   * courses available in that state; with only a category, that category's
   * state-specific courses. Null when the main result has content (or the
   * fallback itself came back empty).
   */
  fallback: { label: string; hint: string; courses: MarketplaceCourse[] } | null;
};

const FinderCtx = createContext<FinderState | null>(null);

function useFinder() {
  const ctx = useContext(FinderCtx);
  if (!ctx) throw new Error("Course finder components need <HomeFinderProvider>");
  return ctx;
}

export function HomeFinderProvider({
  marketplace,
  children
}: {
  marketplace: HomeMarketplace;
  children: React.ReactNode;
}) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [stateName, setStateName] = useState("");
  const [courses, setCourses] = useState(marketplace.courses.slice(0, HOME_PAGE_SIZE));
  const [total, setTotal] = useState(marketplace.total);
  const [loading, setLoading] = useState(false);
  const [fallback, setFallback] = useState<FinderState["fallback"]>(null);

  const fetchPage = useCallback(async (params: URLSearchParams) => {
    params.set("perPage", String(HOME_PAGE_SIZE));
    const res = await fetch(`/api/catalog?${params.toString()}`);
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()) as MarketplaceCatalog;
  }, []);

  const refetch = useCallback(
    async (category: string, state: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category !== "all") params.set("categoryId", category);
        const code = US_STATES.find((s) => s.name === state)?.code;
        if (code) params.set("stateCode", code);

        const data = await fetchPage(params);
        setCourses(data.courses);
        setTotal(data.total);

        // Empty result → upsell what IS available instead of a dead end,
        // trying the most relevant pool first. A buyer's state is fixed but
        // their category isn't, so a picked state falls back to that state's
        // other courses; a bare category falls back to its state-specific
        // versions; and a category with nothing at all (or a fallback that
        // itself came back empty) falls back to courses from the other
        // categories so there's always something on screen next to the
        // catalog CTA.
        if (data.total === 0) {
          const catName = marketplace.categories.find(
            (c) => String(c.id) === category
          )?.name;

          const candidates: Array<{ params: URLSearchParams; label: string; hint: string }> = [];
          if (code) {
            candidates.push({
              params: new URLSearchParams({ stateCode: code }),
              label: `Other courses available in ${state}`,
              hint: `More training approved for ${state}, from every category.`
            });
          } else if (category !== "all") {
            candidates.push({
              params: new URLSearchParams({ categoryId: category, anyState: "1" }),
              label: `${catName || "These"} courses for specific states`,
              hint: "Offered state by state — pick yours above to confirm what applies."
            });
          }
          // Last resort — the unfiltered everywhere baseline. Only when the
          // main query actually had a filter; if THAT query was already
          // unfiltered and still empty, the LMS is down and there's nothing
          // to fetch.
          if (code || category !== "all") {
            candidates.push({
              params: new URLSearchParams(),
              label: "Popular courses from our other categories",
              hint: "From across the catalog — pick anything, or browse the full list."
            });
          }

          let picked: FinderState["fallback"] = null;
          for (const cand of candidates) {
            const fb = await fetchPage(cand.params);
            if (fb.courses.length > 0) {
              picked = { label: cand.label, hint: cand.hint, courses: fb.courses };
              break;
            }
          }
          setFallback(picked);
        } else {
          setFallback(null);
        }
      } catch {
        /* keep whatever is on screen — the finder is never worth an error wall */
      } finally {
        setLoading(false);
      }
    },
    [fetchPage, marketplace.categories]
  );

  // Refetch when a filter changes; the server-rendered first page covers the
  // initial render.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    refetch(activeCategory, stateName);
  }, [activeCategory, stateName, refetch]);

  const value = useMemo(
    () => ({
      categories: marketplace.categories,
      activeCategory,
      setActiveCategory,
      stateName,
      setStateName,
      courses,
      total,
      loading,
      fallback
    }),
    [marketplace.categories, activeCategory, stateName, courses, total, loading, fallback]
  );

  return <FinderCtx.Provider value={value}>{children}</FinderCtx.Provider>;
}

/** Anchor the category chips scroll to, so a pick shows its own results. */
const FINDER_RESULTS_ID = "course-results";

/** Hero-body half: category chips + the searchable state dropdown. */
export function FinderControls() {
  const { categories, activeCategory, setActiveCategory, stateName, setStateName } =
    useFinder();

  // Picking a category filters a list further down the page, which on desktop
  // is below the fold — without this the chip looks like it did nothing.
  const pickCategory = (id: string) => {
    setActiveCategory(id);
    const results = document.getElementById(FINDER_RESULTS_ID);
    if (!results) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    results.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  const chips = [
    { id: "all", label: "All courses" },
    ...categories.map((c) => ({ id: String(c.id), label: c.name }))
  ];

  return (
    <div className="t321-hcf">
      <div className="t321-hcf__cats" role="tablist" aria-label="Course category">
        {chips.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={activeCategory === c.id}
            className={`t321-mkt-catalog__chip${activeCategory === c.id ? " is-active" : ""}`}
            onClick={() => pickCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="t321-hcf__state">
        <CustomSelect
          value={stateName}
          options={STATE_OPTIONS}
          placeholder="Choose your state…"
          onChange={(v) => setStateName(v === ALL_STATES_OPTION ? "" : v)}
          ariaLabel="Your state"
          searchable
          searchPlaceholder="Search states…"
        />
        {!stateName && (
          <p className="t321-hcf__hint">
            Showing every course, each badged with where it&rsquo;s accepted —
            pick your state to narrow the list.
          </p>
        )}
      </div>
    </div>
  );
}

/** Shimmer cards shown while a filter change is in flight — same shell as
    the real catalog cards (image band, title, blurb, price + button) so the
    swap doesn't shift the layout. */
function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <div className="t321-mkt-catalog__grid" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="t321-mkt-catalog__card t321-mkt-card">
          <div className="t321-skel" style={{ height: 180, borderRadius: 0 }} />
          <div className="t321-mkt-catalog__card-body">
            <span className="t321-skel t321-skel--label" style={{ width: "70%", height: "1.15rem" }} />
            <span className="t321-skel t321-skel--label" style={{ width: "95%" }} />
            <span className="t321-skel t321-skel--label" style={{ width: "60%" }} />
            <div className="t321-mkt-catalog__card-foot">
              <span className="t321-skel" style={{ width: "4.5rem", height: "1.6rem" }} />
              <span className="t321-skel" style={{ width: "8rem", height: "2.6rem", borderRadius: 10 }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Below-hero half: the filtered course grid + the path into the catalog. */
export function FinderResults() {
  const { categories, activeCategory, stateName, courses, total, loading, fallback } =
    useFinder();

  const stateCode = US_STATES.find((s) => s.name === stateName)?.code;
  const catalogHref = stateCode ? `/catalog?state=${stateCode}` : "/catalog";
  const categoryName = categories.find((c) => String(c.id) === activeCategory)?.name;

  return (
    <CourseModalProvider>
    <section
      id={FINDER_RESULTS_ID}
      className="t321-mkt-section t321-mkt-section--sunk t321-hcf-results"
    >
      <div className="t321-mkt-container">
        <div className="t321-mkt-section__head">
          <span className="t321-mkt-eyebrow">
            <i className="fas fa-map-marker-alt" aria-hidden="true" />
            {stateName ? ` Available in ${stateName}` : " Browse by state"}
          </span>
          {/* Before a state is picked this grid is the whole catalog, badged
              per course — including state-only ones like the Florida and New
              York variants. Saying "available in every state" here claimed
              the opposite of what the cards underneath show. */}
          <h2 className="t321-mkt-h2">
            {stateName
              ? `${categoryName || "Courses"} in ${stateName}`
              : categoryName
                ? `All ${categoryName} courses`
                : "All courses"}
          </h2>
        </div>

        {loading ? (
          /* Shimmer placeholders shaped like the cards they become — a
             filter change (especially one that ends in the empty + fallback
             fetch pair) shows these instead of a dimmed stale grid. */
          <SkeletonCards />
        ) : courses.length === 0 ? (
          /* Same visual language as the catalog's no-results card. When a
             fallback upsell renders right below, the copy hands off to it
             instead of dead-ending on a catalog button. */
          <div className="t321-mkt-catalog__empty">
            <i
              className={stateName ? "fas fa-map-marker-alt" : "fas fa-search"}
              aria-hidden="true"
            />
            <h3>
              No {categoryName ? `${categoryName.toLowerCase()} courses` : "courses"}
              {stateName ? ` in ${stateName}` : ""} yet
            </h3>
            {fallback ? (
              <p>
                Nothing in this exact combination — but don&rsquo;t leave
                empty-handed: here&rsquo;s what we do have.
              </p>
            ) : (
              <>
                <p>
                  {stateName
                    ? "Try another category or state — or see everything we offer in one place."
                    : "Try another category — or see everything we offer in one place."}
                </p>
                <Link href={catalogHref} className="t321-mkt-btn t321-mkt-btn--primary t321-mkt-btn--lg">
                  Browse the full catalog
                  <i className="fas fa-arrow-right" aria-hidden="true" />
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="t321-mkt-catalog__grid">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}

        {/* Upsell grid for an empty result — other courses in the picked
            state, or the category's state-specific versions. */}
        {courses.length === 0 && !loading && fallback && (
          <div className="t321-hcf__fallback">
            <h3 className="t321-mkt-h3">{fallback.label}</h3>
            <p className="t321-hcf__fallback-hint">{fallback.hint}</p>
            <div className="t321-mkt-catalog__grid">
              {fallback.courses.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          </div>
        )}

        {/* The no-fallback empty card carries its own catalog CTA — showing
            the foot too would render the same button twice. */}
        {(courses.length > 0 || loading || fallback) && (
          <div className="t321-hcf__foot">
            {/* Count hides mid-fetch — it would report the outgoing result. */}
            {!loading && total > courses.length && (
              <p className="t321-hcf__count">
                Showing {courses.length} of {total} courses
                {stateName ? ` available in ${stateName}` : ""}.
              </p>
            )}
            <Link href={catalogHref} className="t321-mkt-btn t321-mkt-btn--primary t321-mkt-btn--lg">
              Explore the full catalog
              <i className="fas fa-arrow-right" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </section>
    </CourseModalProvider>
  );
}

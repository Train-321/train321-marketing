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

  const refetch = useCallback(async (category: string, state: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ perPage: String(HOME_PAGE_SIZE) });
      if (category !== "all") params.set("categoryId", category);
      const code = US_STATES.find((s) => s.name === state)?.code;
      if (code) params.set("stateCode", code);

      const res = await fetch(`/api/catalog?${params.toString()}`);
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as MarketplaceCatalog;
      setCourses(data.courses);
      setTotal(data.total);
    } catch {
      /* keep whatever is on screen — the finder is never worth an error wall */
    } finally {
      setLoading(false);
    }
  }, []);

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
      loading
    }),
    [marketplace.categories, activeCategory, stateName, courses, total, loading]
  );

  return <FinderCtx.Provider value={value}>{children}</FinderCtx.Provider>;
}

/** Hero-body half: category chips + the searchable state dropdown. */
export function FinderControls() {
  const { categories, activeCategory, setActiveCategory, stateName, setStateName } =
    useFinder();

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
            onClick={() => setActiveCategory(c.id)}
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
            Showing courses accepted in every state — pick yours to see
            everything available there.
          </p>
        )}
      </div>
    </div>
  );
}

/** Below-hero half: the filtered course grid + the path into the catalog. */
export function FinderResults() {
  const { categories, activeCategory, stateName, courses, total, loading } = useFinder();

  const stateCode = US_STATES.find((s) => s.name === stateName)?.code;
  const catalogHref = stateCode ? `/catalog?state=${stateCode}` : "/catalog";
  const categoryName = categories.find((c) => String(c.id) === activeCategory)?.name;

  return (
    <CourseModalProvider>
    <section className="t321-mkt-section t321-mkt-section--sunk t321-hcf-results">
      <div className="t321-mkt-container">
        <div className="t321-mkt-section__head">
          <span className="t321-mkt-eyebrow">
            <i className="fas fa-map-marker-alt" aria-hidden="true" />
            {stateName ? ` Available in ${stateName}` : " Available everywhere"}
          </span>
          <h2 className="t321-mkt-h2">
            {stateName
              ? `${categoryName || "Courses"} in ${stateName}`
              : `${categoryName || "Courses"} available in every state`}
          </h2>
        </div>

        {courses.length === 0 && !loading ? (
          <p className="t321-hcf__empty">
            No {categoryName ? `${categoryName.toLowerCase()} courses` : "courses"}
            {stateName ? ` for ${stateName}` : ""} yet —{" "}
            <Link href={catalogHref}>browse the full catalog</Link> to see
            everything we offer.
          </p>
        ) : (
          <div className={`t321-mkt-catalog__grid${loading ? " is-loading" : ""}`}>
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}

        <div className="t321-hcf__foot">
          {total > courses.length && (
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
      </div>
    </section>
    </CourseModalProvider>
  );
}

"use client";

// The home hero's course finder: course-group chips + a state picker where
// the old "Find my course / See how it works" buttons stood, driving a live
// course grid in its own section right below the hero. Cards match the
// /catalog page exactly (same classes, same add-to-cart), and the section
// always ends in a link out to the full catalog carrying the picked state.
//
// The chips are COURSE GROUPS, not raw LMS categories — see lib/courseGroups.ts
// for why the two were merged. Picking a state-regulated group (alcohol, food
// handler, harassment) opens the state dialog first, because those courses
// don't mean anything until we know where the buyer works. Role-training
// groups (front/back of house) filter straight through: the same course
// applies in every state, so a prompt would be pure friction.
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
import type { CourseGroupSummary } from "@/lib/courseGroups";
import { US_STATES } from "@/lib/states";
import CustomSelect from "./CustomSelect";
import CourseCard from "./CourseCard";
import GroupStateDialog from "./GroupStateDialog";
import { CourseModalProvider } from "./CourseModal";
import "@/app/catalog/catalog.css";
import "./HomeCourseFinder.css";

/** Sentinel option that clears the state filter back to the baseline. */
const ALL_STATES_OPTION = "All states";
const STATE_OPTIONS = [ALL_STATES_OPTION, ...US_STATES.map((s) => s.name)];

/** Sentinel group id for the unfiltered everything view. */
const ALL_GROUPS = "all";

/** How many cards the home section shows — the catalog handles the rest. */
const HOME_PAGE_SIZE = 6;

export type HomeMarketplace = {
  courses: MarketplaceCourse[];
  groups: CourseGroupSummary[];
  /** Marketplace categories, shown as chips AFTER the group chips. */
  categories: MarketplaceCategory[];
  total: number;
};

type FinderState = {
  groups: CourseGroupSummary[];
  activeGroup: string;
  /** Chip click — may open the state dialog before the filter actually moves. */
  pickGroup: (id: string) => void;
  categories: MarketplaceCategory[];
  activeCategory: string;
  /** Category chip click — filters straight through, no dialog. */
  pickCategory: (id: string) => void;
  stateName: string;
  setStateName: (name: string) => void;
  courses: MarketplaceCourse[];
  total: number;
  loading: boolean;
  /**
   * Upsell shown when the main result is empty: with a state picked, other
   * courses available in that state; with only a group, that group's
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

/** Anchor the group chips scroll to, so a pick shows its own results. */
const FINDER_RESULTS_ID = "course-results";

/** Picking a filter moves a list that's below the fold on desktop — without
    this the chip looks like it did nothing. */
function scrollToResults() {
  const results = document.getElementById(FINDER_RESULTS_ID);
  if (!results) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  results.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}

export function HomeFinderProvider({
  marketplace,
  children
}: {
  marketplace: HomeMarketplace;
  children: React.ReactNode;
}) {
  const [activeGroup, setActiveGroup] = useState(ALL_GROUPS);
  // A group and a category are mutually exclusive; picking one clears the
  // other, so a request never carries both. Shares the "all" sentinel.
  const [activeCategory, setActiveCategory] = useState(ALL_GROUPS);
  const [stateName, setStateName] = useState("");
  const [courses, setCourses] = useState(marketplace.courses.slice(0, HOME_PAGE_SIZE));
  const [total, setTotal] = useState(marketplace.total);
  const [loading, setLoading] = useState(false);
  const [fallback, setFallback] = useState<FinderState["fallback"]>(null);
  /** The group awaiting a state answer. Non-null == dialog is up. */
  const [pendingGroup, setPendingGroup] = useState<CourseGroupSummary | null>(null);

  const fetchPage = useCallback(async (params: URLSearchParams) => {
    params.set("perPage", String(HOME_PAGE_SIZE));
    const res = await fetch(`/api/catalog?${params.toString()}`);
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()) as MarketplaceCatalog;
  }, []);

  const refetch = useCallback(
    async (group: string, category: string, state: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (group !== ALL_GROUPS) params.set("groupId", group);
        if (category !== ALL_GROUPS) params.set("categoryId", category);
        const code = US_STATES.find((s) => s.name === state)?.code;
        if (code) params.set("stateCode", code);

        const data = await fetchPage(params);
        setCourses(data.courses);
        setTotal(data.total);

        // Empty result → upsell what IS available instead of a dead end,
        // trying the most relevant pool first. A buyer's state is fixed but
        // their group isn't, so a picked state falls back to that state's
        // other courses; a bare group falls back to its state-specific
        // versions; and a group with nothing at all (or a fallback that
        // itself came back empty) falls back to courses from the other
        // groups so there's always something on screen next to the
        // catalog CTA.
        if (data.total === 0) {
          const groupName = marketplace.groups.find((g) => g.id === group)?.name;

          const candidates: Array<{ params: URLSearchParams; label: string; hint: string }> = [];
          if (code) {
            candidates.push({
              params: new URLSearchParams({ stateCode: code }),
              label: `Other courses available in ${state}`,
              hint: `More training approved for ${state}, from every group.`
            });
          } else if (group !== ALL_GROUPS) {
            candidates.push({
              params: new URLSearchParams({ groupId: group, anyState: "1" }),
              label: `${groupName || "These"} courses for specific states`,
              hint: "Offered state by state — pick yours above to confirm what applies."
            });
          }
          // Last resort — the unfiltered everywhere baseline. Only when the
          // main query actually had a filter; if THAT query was already
          // unfiltered and still empty, the LMS is down and there's nothing
          // to fetch.
          if (code || group !== ALL_GROUPS) {
            candidates.push({
              params: new URLSearchParams(),
              label: "Popular courses from our other groups",
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
    [fetchPage, marketplace.groups]
  );

  /**
   * Chip click. A state-regulated group with no state on file asks first;
   * everything else filters immediately.
   *
   * We ask ONCE, not once per chip: after the buyer has told us their state,
   * moving between groups keeps it and re-prompting would be nagging. The
   * state dropdown under the chips is always there to change it.
   */
  const pickGroup = useCallback(
    (id: string) => {
      if (id === ALL_GROUPS) {
        setActiveGroup(ALL_GROUPS);
        setActiveCategory(ALL_GROUPS);
        scrollToResults();
        return;
      }
      const group = marketplace.groups.find((g) => g.id === id);
      if (group?.stateAware && !stateName) {
        setPendingGroup(group);
        return;
      }
      setActiveCategory(ALL_GROUPS);
      setActiveGroup(id);
      scrollToResults();
    },
    [marketplace.groups, stateName]
  );

  /** Category chip — filters straight through, clearing any active group. */
  const pickCategory = useCallback((id: string) => {
    setActiveGroup(ALL_GROUPS);
    setActiveCategory(id);
    scrollToResults();
  }, []);

  /** Dialog answered — commit the group and the state together. */
  const confirmPending = useCallback(
    (picked: string) => {
      if (!pendingGroup) return;
      setActiveCategory(ALL_GROUPS);
      setActiveGroup(pendingGroup.id);
      setStateName(picked);
      setPendingGroup(null);
      // Let the dialog unmount and the grid re-render before moving the page.
      requestAnimationFrame(scrollToResults);
    },
    [pendingGroup]
  );

  // Refetch when a filter changes; the server-rendered first page covers the
  // initial render.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    refetch(activeGroup, activeCategory, stateName);
  }, [activeGroup, activeCategory, stateName, refetch]);

  const value = useMemo(
    () => ({
      groups: marketplace.groups,
      activeGroup,
      pickGroup,
      categories: marketplace.categories,
      activeCategory,
      pickCategory,
      stateName,
      setStateName,
      courses,
      total,
      loading,
      fallback
    }),
    [marketplace.groups, activeGroup, pickGroup, marketplace.categories, activeCategory, pickCategory, stateName, courses, total, loading, fallback]
  );

  return (
    <FinderCtx.Provider value={value}>
      {children}
      {/* Owned by the provider, not by FinderControls — the controls render
          twice (hero + mobile) and would otherwise mount two dialogs. */}
      <GroupStateDialog
        group={pendingGroup}
        onConfirm={confirmPending}
        onClose={() => setPendingGroup(null)}
      />
    </FinderCtx.Provider>
  );
}

/** Hero-body half: course-group chips + the searchable state dropdown. */
export function FinderControls() {
  const { groups, activeGroup, pickGroup, categories, activeCategory, pickCategory, stateName, setStateName } =
    useFinder();

  // One row: All, then group chips, then category chips. Same order and same
  // behaviour as the catalog page.
  const chips: Array<{ id: string; label: string; kind: "all" | "group" | "category" }> = [
    { id: ALL_GROUPS, label: "All courses", kind: "all" },
    ...groups.map((g) => ({ id: g.id, label: g.name, kind: "group" as const })),
    ...categories.map((c) => ({ id: String(c.id), label: c.name, kind: "category" as const }))
  ];

  return (
    <div className="t321-hcf">
      <div className="t321-hcf__cats" role="tablist" aria-label="Course group and category">
        {chips.map((c) => {
          const active =
            c.kind === "all"
              ? activeGroup === ALL_GROUPS && activeCategory === ALL_GROUPS
              : c.kind === "group"
                ? activeGroup === c.id
                : activeCategory === c.id;
          return (
            <button
              key={`${c.kind}:${c.id}`}
              type="button"
              role="tab"
              aria-selected={active}
              className={`t321-mkt-catalog__chip${active ? " is-active" : ""}`}
              onClick={() => (c.kind === "category" ? pickCategory(c.id) : pickGroup(c.id))}
            >
              {c.label}
            </button>
          );
        })}
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
  const { groups, activeGroup, stateName, courses, total, loading, fallback } =
    useFinder();

  const stateCode = US_STATES.find((s) => s.name === stateName)?.code;
  const catalogHref = stateCode ? `/catalog?state=${stateCode}` : "/catalog";
  const groupName = groups.find((g) => g.id === activeGroup)?.name;

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
              ? `${groupName || "Courses"} in ${stateName}`
              : groupName
                ? `All ${groupName} courses`
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
              No {groupName ? `${groupName.toLowerCase()} courses` : "courses"}
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
                    ? "Try another group or state — or see everything we offer in one place."
                    : "Try another group — or see everything we offer in one place."}
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
            state, or the group's state-specific versions. */}
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

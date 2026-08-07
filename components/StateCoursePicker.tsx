"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import type { GroupPicker, StateVariant } from "@/lib/enroll";
import { availableIn } from "@/lib/states";
import type { MarketplaceCourse } from "@/lib/newFeatures";
import AddToCartButton from "./cart/AddToCartButton";
import SkeletonImage from "./SkeletonImage";
import CustomSelect from "./CustomSelect";
import "./StateCoursePicker.css";

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

/**
 * The picked state is shared between two spots that live far apart in the
 * page tree: the dropdown in the hero price card and the results section
 * below the hero. This tiny context is the bridge.
 */
const StateCtx = createContext<{
  stateName: string;
  setStateName: (s: string) => void;
} | null>(null);

export function StatePickerProvider({ children }: { children: React.ReactNode }) {
  const [stateName, setStateName] = useState("");
  const value = useMemo(() => ({ stateName, setStateName }), [stateName]);
  return <StateCtx.Provider value={value}>{children}</StateCtx.Provider>;
}

function useStatePicker() {
  const ctx = useContext(StateCtx);
  if (!ctx) throw new Error("State picker components need <StatePickerProvider>");
  return ctx;
}

/**
 * The picker's dropdown half. Selecting a state makes <StateResults /> (below
 * the hero) render that state's course versions as full-size thumbnail cards.
 *
 * `variant` only changes the sizing: "hero" sits in the wide hero body as the
 * page's primary call to action, "card" is the narrow price-card fit.
 */
export function StateSelect({
  picker,
  variant = "card"
}: {
  picker: GroupPicker;
  variant?: "card" | "hero";
}) {
  const { stateName, setStateName } = useStatePicker();
  const stateNames = picker.states.map((s) => s.name);

  // Whether anything is already on screen below drives which hint we show —
  // promising "courses accepted in every state" reads as broken on a group
  // that has none and renders no results until a state is picked.
  const hasNationwide = picker.variants.some((v) => v.availability.kind === "all");

  // Every variant is "all states" — nothing to choose; the results section
  // shows everything on its own.
  if (stateNames.length === 0) return null;

  return (
    <div className={`t321-spc t321-spc--${variant}`} id="choose-your-state">
      <p className="t321-spc__label">
        <i className="fas fa-map-marker-alt" aria-hidden="true" /> Choose your state
      </p>
      <CustomSelect
        value={stateName}
        options={stateNames}
        placeholder="Select your state…"
        onChange={setStateName}
        ariaLabel="Your state"
        searchable
        searchPlaceholder="Search states…"
      />
      {!stateName && (
        <p className="t321-spc__hint">
          {hasNationwide
            ? "Showing courses accepted in every state. Pick yours to see versions approved there."
            : "Courses for your state will appear below."}
        </p>
      )}
    </div>
  );
}

/**
 * Full-width results section under the hero: the group's versions as big
 * thumbnail cards, followed by other courses available in the same state —
 * the cross-sell shelf.
 *
 * A version carrying no state tag is available everywhere, so those are the
 * baseline and are ALWAYS on screen: on their own before a state is picked,
 * and alongside a picked state's own versions after. A state with no version
 * of its own therefore falls back to exactly these rather than to nothing.
 */
export function StateResults({ picker }: { picker: GroupPicker }) {
  const { stateName } = useStatePicker();

  const picked = picker.states.find((s) => s.name === stateName) ?? null;

  const variants = picker.variants.filter((v) =>
    availableIn(v.availability, picked?.code ?? null)
  );
  // With a state picked, its own versions lead and the broadly available
  // ones (everywhere / everywhere-except) follow. Stable sort keeps the
  // admin's ordering within each bucket.
  if (picked) {
    const specific = (v: StateVariant) => v.availability.kind === "in";
    variants.sort((a, b) => Number(specific(b)) - Number(specific(a)));
  }

  // ── Cross-sell: other courses tagged for the picked state ──────────────
  const [recs, setRecs] = useState<MarketplaceCourse[]>([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const groupIds = useMemo(() => new Set(picker.variants.map((v) => v.id)), [picker]);

  useEffect(() => {
    if (!picked) {
      setRecs([]);
      return;
    }
    let cancelled = false;
    setRecsLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/catalog?stateCode=${picked.code}&perPage=12`);
        if (!res.ok) return;
        const data = (await res.json()) as { courses: MarketplaceCourse[] };
        if (cancelled) return;
        setRecs(
          data.courses
            // Real courses only (no group entries), and nothing already
            // offered by this group's own version list.
            .filter((c) => typeof c.id === "number" && Number.isFinite(c.id))
            .filter((c) => !groupIds.has(c.id))
            .slice(0, 4)
        );
      } catch {
        /* cross-sell is best-effort — the main results never depend on it */
      } finally {
        if (!cancelled) setRecsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [picked, groupIds]);

  // Nothing to show only when this group has no nationwide version AND the
  // visitor hasn't picked a state yet.
  if (variants.length === 0 && !picked) return null;

  return (
    <section className="t321-mkt-section t321-mkt-section--sunk t321-sr">
      <div className="t321-mkt-container">
        <div className="t321-mkt-section__head">
          <span className="t321-mkt-eyebrow">
            <i className="fas fa-map-marker-alt" aria-hidden="true" />
            {picked ? ` Available in ${picked.name}` : " Available everywhere"}
          </span>
          <h2 className="t321-mkt-h2">
            {picked ? `Your courses in ${picked.name}` : "Available in every state"}
          </h2>
        </div>

        {variants.length === 0 && (
          <p className="t321-sr__empty">
            We don&rsquo;t have a version of this course for {picked?.name} yet.{" "}
            <a href="/catalog">Browse the full catalog</a> to see what else is
            available.
          </p>
        )}

        <div className="t321-sr__grid">
          {variants.map((v, idx) => (
            <article key={v.course ? v.course.id : `${v.id}-${idx}`} className="t321-sr__card">
              <div className="t321-sr__card-media">
                <SkeletonImage src={v.course?.image} alt={v.title} />
                {v.availability.kind !== "in" && (
                  <span className="t321-sr__badge">
                    {v.availability.kind === "all" ? "All states" : v.stateText}
                  </span>
                )}
              </div>
              <div className="t321-sr__card-body">
                <h3 className="t321-sr__name">{v.title || v.stateText}</h3>
                <div className="t321-sr__foot">
                  {v.course ? (
                    <>
                      <span className="t321-sr__price">{money(v.price)}</span>
                      <AddToCartButton
                        course={v.course}
                        mode="add"
                        className="t321-mkt-btn t321-mkt-btn--primary"
                      />
                    </>
                  ) : (
                    <>
                      <span className="t321-sr__price t321-sr__price--muted">
                        External provider
                      </span>
                      <a
                        href={v.href}
                        className="t321-mkt-btn t321-mkt-btn--ghost"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Go to provider{" "}
                        <i className="fas fa-external-link-alt" aria-hidden="true" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {picked && recsLoading && (
          <div className="t321-sr__recs" aria-hidden="true">
            <h3 className="t321-mkt-h3 t321-sr__recs-head">
              Also available in {picked.name}
            </h3>
            <div className="t321-sr__grid">
              {[0, 1, 2].map((i) => (
                <div key={i} className="t321-sr__card t321-sr__card--skel">
                  <div className="t321-sr__card-media t321-skel" />
                  <div className="t321-sr__card-body">
                    <span className="t321-skel t321-skel--label" style={{ width: "80%" }} />
                    <div className="t321-sr__foot">
                      <span className="t321-skel t321-skel--label" style={{ width: "3.5rem", marginBottom: 0 }} />
                      <span className="t321-skel" style={{ width: "7rem", height: "2.4rem" }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {picked && !recsLoading && recs.length > 0 && (
          <div className="t321-sr__recs">
            <h3 className="t321-mkt-h3 t321-sr__recs-head">
              Also available in {picked.name}
            </h3>
            <div className="t321-sr__grid">
              {recs.map((c) => (
                <article key={c.id} className="t321-sr__card">
                  <div className="t321-sr__card-media">
                    <SkeletonImage src={c.image} alt={c.name} />
                  </div>
                  <div className="t321-sr__card-body">
                    <h3 className="t321-sr__name">{c.name}</h3>
                    <div className="t321-sr__foot">
                      <span className="t321-sr__price">{money(c.price)}</span>
                      <AddToCartButton
                        course={{
                          id: c.id,
                          name: c.name,
                          price: c.price,
                          image: c.image,
                          isSeatBased: c.isSeatBased,
                          stateLabel: c.stateLabel
                        }}
                        mode="add"
                        className="t321-mkt-btn t321-mkt-btn--primary"
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

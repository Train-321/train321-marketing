"use client";

import { useState } from "react";
import type { GroupPicker } from "@/lib/enroll";
import AddToCartButton from "./cart/AddToCartButton";
import CustomSelect from "./CustomSelect";
import "./StateCoursePicker.css";

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

/**
 * Inline state-first course picker for grouped courses — a page section, not
 * a dialog. The buyer picks their state from a dropdown and the versions
 * available there render directly beneath, each with its own Add to cart.
 *
 * Living on the page (rather than in a modal) means a buyer can add several
 * versions in one visit, and the section has room to grow into cross-sell
 * ("also available in Florida…") later. The Enroll buttons elsewhere on the
 * page anchor-scroll here via id="choose-your-state".
 */
export default function StateCoursePicker({ picker }: { picker: GroupPicker }) {
  const [stateName, setStateName] = useState("");

  const stateNames = picker.states.map((s) => s.name);
  const pickedCode = picker.states.find((s) => s.name === stateName)?.code ?? null;

  // No specific states at all (every variant is "all states") → skip the
  // dropdown and list everything. Otherwise: nothing shows until a state is
  // picked, then that state's versions plus the all-states versions.
  const visible =
    stateNames.length === 0
      ? picker.variants
      : pickedCode
        ? picker.variants.filter(
            (v) => v.states === "all" || v.states.includes(pickedCode)
          )
        : [];

  return (
    <section id="choose-your-state" className="t321-mkt-section t321-mkt-section--sunk t321-sp">
      <div className="t321-mkt-container">
        <div className="t321-mkt-section__head">
          <span className="t321-mkt-eyebrow">
            <i className="fas fa-map-marker-alt" aria-hidden="true" /> State-specific
          </span>
          <h2 className="t321-mkt-h2">Choose your state</h2>
          <p className="t321-mkt-lede">
            Requirements vary by state. Pick yours to see the versions available there.
          </p>
        </div>

        {stateNames.length > 0 && (
          <div className="t321-sp__select">
            <CustomSelect
              value={stateName}
              options={stateNames}
              placeholder="Select your state…"
              onChange={setStateName}
              ariaLabel="Your state"
            />
          </div>
        )}

        {stateNames.length > 0 && !pickedCode ? (
          <p className="t321-sp__hint">
            <i className="fas fa-arrow-up" aria-hidden="true" />
            Choose a state above to see the courses available there.
          </p>
        ) : (
          <ul className="t321-sp__grid">
            {visible.map((v, idx) => (
              <li key={v.course ? v.course.id : `${v.id}-${idx}`} className="t321-sp__card">
                <div className="t321-sp__card-body">
                  <p className="t321-sp__name">{v.title || v.stateText}</p>
                  <p className="t321-sp__meta">
                    {v.course ? money(v.price) : "Served by an external provider"}
                    {v.states === "all" && <em>All states</em>}
                  </p>
                </div>
                {v.course ? (
                  <AddToCartButton
                    course={v.course}
                    mode="add"
                    className="t321-mkt-btn t321-mkt-btn--primary"
                  />
                ) : (
                  // External-provider state — link out, never add to cart.
                  <a
                    href={v.href}
                    className="t321-mkt-btn t321-mkt-btn--ghost"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Go to provider <i className="fas fa-external-link-alt" aria-hidden="true" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

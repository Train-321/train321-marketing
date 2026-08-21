"use client";

// The state prompt that stands between picking a course group and seeing its
// courses. Compliance training is written per state, so "Alcohol Safety" isn't
// a buyable thing until we know where the buyer works — this asks once, then
// every group they browse afterwards is already narrowed.
//
// Modal shell deliberately mirrors SignInDialog / ReportIssueDialog: scrim +
// panel, click-outside and Escape to close, body scroll locked while open.

import { useEffect, useRef, useState } from "react";
import type { CourseGroupSummary } from "@/lib/courseGroups";
import { STATE_NAMES, US_STATES } from "@/lib/states";
import { useCart } from "./cart/CartContext";
import CustomSelect from "./CustomSelect";
import "./GroupStateDialog.css";

const STATE_OPTIONS = US_STATES.map((s) => s.name);

type Props = {
  /** The group the buyer just picked, or null when the dialog is closed. */
  group: CourseGroupSummary | null;
  /** Confirmed with a state name, or "" for the show-me-everything path. */
  onConfirm: (stateName: string) => void;
  onClose: () => void;
};

export default function GroupStateDialog({ group, onConfirm, onClose }: Props) {
  const [stateName, setStateName] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  // Plenty of buyers here are one person getting their own certificate, so
  // this can't assume a team. The hero's "For myself / For my team" toggle
  // routes through the cart (see HomePage.chooseAudience), which makes
  // buyer.audience the one source of truth — and it defaults to individual.
  const { buyer } = useCart();
  const isTeam = buyer.audience === "company";

  // Each group gets a fresh prompt — carrying the previous pick over would
  // silently answer a question the buyer hasn't been asked yet.
  useEffect(() => {
    if (group) setStateName("");
  }, [group]);

  useEffect(() => {
    if (!group) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [group, onClose]);

  if (!group) return null;

  const code = US_STATES.find((s) => s.name === stateName)?.code;
  // Does this group have a version written for that state specifically, or
  // will they get the nationwide course? Both are fine — saying which one
  // up front is what stops the "is this the right course for me?" hesitation.
  const hasStateVersion = Boolean(code && group.stateCodes.includes(code));

  return (
    <div
      className="t321-gsd"
      role="dialog"
      aria-modal="true"
      aria-labelledby="t321-gsd-title"
      onClick={onClose}
    >
      <div
        className="t321-gsd__panel"
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="t321-gsd__close"
          onClick={onClose}
          aria-label="Close"
        >
          <i className="fas fa-times" aria-hidden="true" />
        </button>

        <div className="t321-gsd__head">
          <span className="t321-gsd__icon" aria-hidden="true">
            <i className={group.icon} />
          </span>
          <h2 className="t321-gsd__title" id="t321-gsd-title">
            {group.name}
          </h2>
          <p className="t321-gsd__sub">{group.blurb}</p>
        </div>

        <form
          className="t321-gsd__form"
          onSubmit={(e) => {
            e.preventDefault();
            onConfirm(stateName);
          }}
        >
          <label className="t321-gsd__label" htmlFor="t321-gsd-state">
            {isTeam ? "Where will your team be working?" : "Where will you be working?"}
          </label>
          <p className="t321-gsd__help">
            {group.name} requirements are set state by state — tell us yours and
            we&rsquo;ll show only the courses that count there.
          </p>

          <div className="t321-gsd__select">
            <CustomSelect
              value={stateName}
              options={STATE_OPTIONS}
              placeholder="Choose your state…"
              onChange={setStateName}
              ariaLabel="Your state"
              searchable
              searchPlaceholder="Search states…"
            />
          </div>

          {/* Reassurance the moment they pick, before they commit. */}
          {stateName && (
            <p
              className={`t321-gsd__match${hasStateVersion ? " is-specific" : ""}`}
            >
              <i
                className={hasStateVersion ? "fas fa-circle-check" : "fas fa-globe"}
                aria-hidden="true"
              />
              {hasStateVersion
                ? `We have a ${STATE_NAMES[code!]}-specific ${group.name.toLowerCase()} course.`
                : `${stateName} accepts our nationwide ${group.name.toLowerCase()} training.`}
            </p>
          )}

          <button
            type="submit"
            className="t321-mkt-btn t321-mkt-btn--primary t321-mkt-btn--lg t321-gsd__submit"
            disabled={!stateName}
          >
            Show my courses
            <i className="fas fa-arrow-right" aria-hidden="true" />
          </button>

          <button
            type="button"
            className="t321-gsd__skip"
            onClick={() => onConfirm("")}
          >
            Not sure yet — show every {group.name.toLowerCase()} course
          </button>
        </form>
      </div>
    </div>
  );
}

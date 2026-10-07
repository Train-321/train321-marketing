"use client";

// The hero visual for /v6: the thing you actually get. A certificate that
// fills itself in from the finder — the picked state's own version of the
// picked course type, today's date, where it's accepted — and tilts gently
// toward the cursor. Clearly a preview (it says so), not a real document.

import { useMemo, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import type { MarketplaceCourse } from "@/lib/newFeatures";
import { availabilityShort } from "@/lib/states";
import { useFinderV5 } from "@/components/v5/FinderContext";
import { usePrefersReducedMotion } from "@/components/v5/motion";

const MAX_TILT = 9;

/** Language editions ("- Spanish", "- Creole") shouldn't be the headline version. */
const LANGUAGE_EDITION = /spanish|creole|haitian|french|chinese|korean|vietnamese|tagalog/i;

/** The course the certificate shows for the current pick. */
function pickCourse(results: MarketplaceCourse[], chipKind: string, stateCode: string | null): MarketplaceCourse | null {
  if (!results.length) return null;
  const reach = (c: MarketplaceCourse) =>
    c.availability.kind === "all" ? 1000 : c.availability.kind === "except" ? 900 : c.availability.codes.length;
  // "All courses" → lead with a food handler card (what most people come for).
  const pool = chipKind === "all" ? results.filter((c) => /food handler/i.test(c.name)) : results;
  const list = pool.length ? pool : results;
  const english = list.filter((c) => !LANGUAGE_EDITION.test(c.name));
  const candidates = english.length ? english : list;
  // With a state picked, filterCourses already leads with that state's own
  // version; without one, prefer the widest-accepted version.
  return stateCode ? candidates[0] : [...candidates].sort((a, b) => reach(b) - reach(a))[0];
}

/** "Accepted in" line for the preview. */
function acceptedText(course: MarketplaceCourse | null, stateName: string | null): string {
  if (!course) return "—";
  const a = course.availability;
  if (a.kind === "all") return "All 50 states";
  if (a.kind === "except") return "Most states";
  if (stateName) return stateName;
  return a.codes.length >= 40 ? `${a.codes.length} states` : availabilityShort(a);
}

export default function LiveCertificate() {
  const { results, activeChip, stateCode, stateName } = useFinderV5();
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, sx: 50, sy: 50 });

  const course = useMemo(() => pickCourse(results, activeChip.kind, stateCode), [results, activeChip.kind, stateCode]);
  const issued = useMemo(
    () => new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    []
  );
  const accepted = acceptedText(course, stateName);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    setTilt({ rx: (0.5 - y) * MAX_TILT, ry: (x - 0.5) * MAX_TILT * 1.2, sx: x * 100, sy: y * 100 });
  };
  const onLeave = () => setTilt({ rx: 0, ry: 0, sx: 50, sy: 50 });

  return (
    <div className="v6-cert-wrap" ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}>
      <div
        className="v6-cert"
        style={
          {
            "--rx": `${tilt.rx}deg`,
            "--ry": `${tilt.ry}deg`,
            "--sx": `${tilt.sx}%`,
            "--sy": `${tilt.sy}%`
          } as CSSProperties
        }
        aria-label="Preview of a Train 321 certificate"
      >
        <div className="v6-cert__head">
          <span className="v6-cert__brand">
            TRAIN <b>321</b>
          </span>
          <span className="v6-cert__kind">Certificate of completion</span>
        </div>

        <p className="v6-cert__line">This certifies that</p>
        <p className="v6-cert__name">
          <span>Your name</span>
        </p>
        <p className="v6-cert__line">has successfully completed</p>
        <p className="v6-cert__course" key={course?.id ?? "none"}>
          {course ? course.name : "Pick a state and a course type"}
        </p>

        <dl className="v6-cert__meta">
          <div>
            <dt>Accepted in</dt>
            <dd>{accepted}</dd>
          </div>
          <div>
            <dt>Issued</dt>
            <dd>{issued}</dd>
          </div>
          <div>
            <dt>Certificate no.</dt>
            <dd>T321-••••-••••</dd>
          </div>
        </dl>

        <span className="v6-cert__seal" aria-hidden="true">
          <i className="fas fa-check" />
          <span>Verified · train321.com</span>
        </span>
        <span className="v6-cert__shine" aria-hidden="true" />
      </div>

      <span className="v6-cert__tag" aria-hidden="true">
        <i className="fas fa-bolt" /> Ready the moment you pass
      </span>
      <p className="v6-cert__note">
        Preview. The real one carries your name, the course you finished and the date — and downloads
        instantly.
      </p>
    </div>
  );
}

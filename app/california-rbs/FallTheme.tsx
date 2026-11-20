"use client";

// Thanksgiving look for the California RBS page — the homepage's autumn theme
// WITHOUT its promo bar or code. The page decides whether it's on (fall.ts,
// server side) and only renders these while it is:
//   - FallTheme       hero: falling leaves, a maple branch, a warm low sun
//                     (the homepage's FallDecor, reused as-is);
//   - RbsPumpkins     a pumpkin pair with fallen leaves (placed by the caller);
//   - FallPageLeaves  a few faint leaves drifting down the screen below the
//                     hero — hidden while the hero or the checkout is on screen,
//                     so nothing drifts over the payment form.
// All decorative: click-through, hidden from assistive tech, and still under
// prefers-reduced-motion (fall.css + rbs.css).

import { useEffect, useState } from "react";
import FallDecor, { HarvestPumpkin, Leaf, OakLeaf } from "@/components/v5/fall/FallDecor";
import "@/components/v5/fall/fall.css";

export default function FallTheme() {
  return <FallDecor />;
}

// A few fallen leaves around the pair — positions in px inside a 190×116 box,
// same layout as the homepage's hero patch.
const PATCH_LEAVES = [
  { x: 102, y: 4, s: 24, r: -28, c: "#b23a12", oak: false },
  { x: -6, y: 84, s: 24, r: 150, c: "#c9611a", oak: true },
  { x: 6, y: 92, s: 26, r: 30, c: "#d9541e", oak: false },
  { x: 30, y: 98, s: 22, r: -40, c: "#f2a93b", oak: true },
  { x: 120, y: 100, s: 24, r: 70, c: "#b23a12", oak: false },
  { x: 150, y: 94, s: 22, r: -20, c: "#e07b1a", oak: true },
  { x: 168, y: 100, s: 20, r: 110, c: "#f0b429", oak: false }
];

/** Two harvest pumpkins and a ring of fallen leaves (190×116 box). */
export function RbsPumpkins({ className = "" }: { className?: string }) {
  return (
    <div className={`v5-fa-patch rbs-fall-patch ${className}`} aria-hidden="true">
      <span className="v5-fa-pumpkin v5-fa-pumpkin--small">
        <HarvestPumpkin />
      </span>
      <span className="v5-fa-pumpkin v5-fa-pumpkin--big">
        <HarvestPumpkin />
      </span>
      {PATCH_LEAVES.map((l, i) => (
        <span
          key={i}
          className="v5-fa-patch__leaf"
          style={
            {
              left: l.x,
              top: l.y,
              color: l.c,
              "--fa-size": `${l.s}px`,
              transform: `rotate(${l.r}deg)`
            } as React.CSSProperties
          }
        >
          {l.oak ? <OakLeaf /> : <Leaf />}
        </span>
      ))}
    </div>
  );
}

const PAGE_LEAVES = [
  { x: "7%", size: 22, color: "#e07b1a", dur: "22s", delay: "-4s", oak: false },
  { x: "21%", size: 18, color: "#f2a93b", dur: "26s", delay: "-15s", oak: true },
  { x: "46%", size: 20, color: "#d9541e", dur: "24s", delay: "-9s", oak: false },
  { x: "63%", size: 16, color: "#f0b429", dur: "28s", delay: "-20s", oak: true },
  { x: "81%", size: 22, color: "#c9611a", dur: "23s", delay: "-2s", oak: false },
  { x: "93%", size: 18, color: "#e38a24", dur: "27s", delay: "-12s", oak: true }
];

/** Faint leaves drifting down the screen while reading the sections below. */
export function FallPageLeaves() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    // Off while the hero (it has its own leaves) or the checkout is on screen.
    const watch = Array.from(document.querySelectorAll(".t321-rbs .rbs-hero, .t321-rbs #rbs-checkout"));
    if (!watch.length) return;
    const visible = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      setOn(visible.size === 0);
    });
    watch.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className={`v5-fa-page${on ? " is-on" : ""}`} aria-hidden="true">
      {PAGE_LEAVES.map((l, i) => (
        <span
          key={i}
          className={`v5-fa-leaf${i % 2 === 1 ? " v5-fa-leaf--extra" : ""}`}
          style={
            {
              left: l.x,
              color: l.color,
              "--fa-size": `${l.size}px`,
              "--fa-dur": l.dur,
              "--fa-delay": l.delay
            } as React.CSSProperties
          }
        >
          <span className="v5-fa-leaf__spin">{l.oak ? <OakLeaf /> : <Leaf />}</span>
        </span>
      ))}
    </div>
  );
}

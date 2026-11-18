"use client";

// Course finder map card, fall theme: a leafy autumn vine draped along the
// card's top edge, wrapping the top-right corner and trailing down its right
// side, plus a few leaves drifting down past the card's left side. An overlay
// only — positioned over the card's edges, no height added, click-through,
// hidden from assistive tech, and still under prefers-reduced-motion.

import { Leaf, OakLeaf } from "./FallDecor";

const MAPLE_D =
  "M50 4c3 10 7 17 13 22l-3 7 11-3c5 2 11 3 18 3-4 5-7 10-8 16l6 6-9 1c-2 6-2 12 0 19-6-4-12-6-18-6l-4 10-4-10c-6 0-12 2-18 6 2-7 2-13 0-19l-9-1 6-6c-1-6-4-11-8-16 7 0 13-1 18-3l11 3-3-7c6-5 10-12 13-22z";

// Leaves along the vine: attach point (x, y) on the stem, the way the leaf
// hangs, its size and colour. Top run first, then down the right side —
// those point outward so the map stays clear.
const VINE_LEAVES = [
  { x: 34, y: 15, r: 200, s: 0.24, c: "#e07b1a", d: "-0.3s" },
  { x: 88, y: 20, r: 160, s: 0.2, c: "#f2a93b", d: "-1.4s" },
  { x: 142, y: 11, r: 215, s: 0.26, c: "#b23a12", d: "-0.8s" },
  { x: 198, y: 18, r: 150, s: 0.21, c: "#e38a24", d: "-2.1s" },
  { x: 252, y: 11, r: 205, s: 0.25, c: "#d9541e", d: "-1.1s" },
  { x: 306, y: 19, r: 140, s: 0.22, c: "#f0b429", d: "-0.5s" },
  { x: 350, y: 64, r: 262, s: 0.24, c: "#c9611a", d: "-1.7s" },
  { x: 347, y: 122, r: 284, s: 0.21, c: "#e07b1a", d: "-0.9s" },
  { x: 352, y: 180, r: 256, s: 0.23, c: "#b23a12", d: "-2.4s" },
  { x: 346, y: 236, r: 280, s: 0.2, c: "#f2a93b", d: "-1.2s" }
];

const LEFT_FALL = [
  { left: -30, size: 22, color: "#e07b1a", dur: "8.5s", delay: "-1s", oak: false },
  { left: -14, size: 18, color: "#f2a93b", dur: "10s", delay: "-5s", oak: true },
  { left: -38, size: 20, color: "#b23a12", dur: "9.2s", delay: "-7.5s", oak: false },
  { left: -20, size: 16, color: "#e38a24", dur: "11s", delay: "-3s", oak: true }
];

export default function FallPanelVine() {
  return (
    <div className="v5-fa-vinewrap" aria-hidden="true">
      <svg className="v5-fa-vine" viewBox="0 0 370 270" focusable="false">
        <g fill="none" stroke="#7a4322" strokeLinecap="round">
          <path
            d="M0 18C40 8 70 26 110 16S180 6 220 16 300 24 334 14Q358 10 356 42C354 100 342 160 352 262"
            strokeWidth="4"
          />
          <path d="M120 16c4-9 12-12 20-9M262 13c6 8 14 9 20 5M354 92c8 2 12 9 10 16M348 206c-8 3-11 10-8 17" strokeWidth="2" />
        </g>
        {VINE_LEAVES.map((l, i) => (
          <g key={i} transform={`translate(${l.x} ${l.y})`}>
            <g className="v5-fa-vine__leaf" style={{ animationDelay: l.d }}>
              <g transform={`rotate(${l.r}) scale(${l.s}) translate(-50 -8)`}>
                <path d={MAPLE_D} fill={l.c} />
                <path d="M50 30v62" stroke="rgba(60,20,0,.3)" strokeWidth="3" strokeLinecap="round" fill="none" />
              </g>
            </g>
          </g>
        ))}
      </svg>
      {LEFT_FALL.map((l, i) => (
        <span
          key={i}
          className="v5-fa-vinefall"
          style={
            {
              left: `${l.left}px`,
              color: l.color,
              "--fa-size": `${l.size}px`,
              "--fa-dur": l.dur,
              "--fa-delay": l.delay
            } as React.CSSProperties
          }
        >
          {l.oak ? <OakLeaf /> : <Leaf />}
        </span>
      ))}
    </div>
  );
}

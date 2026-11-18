"use client";

// A light fall touch for the rest of the homepage: six small, faint leaves
// drifting down the screen while the visitor reads the sections below the
// hero. Shown only once the hero has scrolled out of view (the hero has its
// own decoration), click-through, hidden from assistive tech, and off under
// prefers-reduced-motion (CSS).

import { useEffect, useState } from "react";
import { Leaf, OakLeaf } from "./FallDecor";

const LEAVES = [
  { x: "7%", size: 22, color: "#e07b1a", dur: "22s", delay: "-4s", oak: false },
  { x: "21%", size: 18, color: "#f2a93b", dur: "26s", delay: "-15s", oak: true },
  { x: "46%", size: 20, color: "#d9541e", dur: "24s", delay: "-9s", oak: false },
  { x: "63%", size: 16, color: "#f0b429", dur: "28s", delay: "-20s", oak: true },
  { x: "81%", size: 22, color: "#c9611a", dur: "23s", delay: "-2s", oak: false },
  { x: "93%", size: 18, color: "#e38a24", dur: "27s", delay: "-12s", oak: true }
];

export default function FallPageLeaves() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const hero = document.querySelector(".v5--fall .v5-hero");
    if (!hero) return;
    const io = new IntersectionObserver(([entry]) => setOn(!entry.isIntersecting), { threshold: 0 });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  return (
    <div className={`v5-fa-page${on ? " is-on" : ""}`} aria-hidden="true">
      {LEAVES.map((l, i) => (
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

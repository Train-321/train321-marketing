"use client";

// Hero decoration for the Fall / Thanksgiving event: autumn leaves drifting
// down behind the hero's content, a scatter of fallen leaves along its bottom
// edge, and a little pumpkin patch. With a mouse, the cursor blows falling
// leaves aside and kicks the fallen ones up. Purely decorative — behind the
// hero's controls, hidden from assistive tech, still under
// prefers-reduced-motion (no falling, no mouse play).

import { useEffect, useId, useRef, useState } from "react";

/** A harvest pumpkin (whole, not carved) with a stem and a curl of vine. */
export function HarvestPumpkin({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={className} viewBox="0 0 120 110" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${id}b`} cx="42%" cy="36%" r="72%">
          <stop offset="0" stopColor="#ffb257" />
          <stop offset="0.55" stopColor="#e8701a" />
          <stop offset="1" stopColor="#a63d0a" />
        </radialGradient>
        <radialGradient id={`${id}s`} cx="50%" cy="40%" r="70%">
          <stop offset="0" stopColor="#e9802a" />
          <stop offset="1" stopColor="#8f3208" />
        </radialGradient>
      </defs>
      <path d="M57 28c-1-11 1-17 7-22l5 3c-4 4-5 10-4 19z" fill="#4e6b1f" />
      <path d="M66 12c6-6 14-7 20-3-6 1-10 4-12 9-3-2-6-4-8-6z" fill="none" stroke="#5b7a24" strokeWidth="2.2" strokeLinecap="round" />
      <ellipse cx="35" cy="68" rx="29" ry="37" fill={`url(#${id}s)`} />
      <ellipse cx="85" cy="68" rx="29" ry="37" fill={`url(#${id}s)`} />
      <ellipse cx="60" cy="68" rx="33" ry="41" fill={`url(#${id}b)`} stroke="rgba(110,40,8,.35)" strokeWidth="1.5" />
      <path d="M60 28v80" stroke="rgba(110,40,8,.22)" strokeWidth="2" />
      <ellipse cx="46" cy="52" rx="7" ry="11" fill="rgba(255,235,200,.22)" />
    </svg>
  );
}

const MAPLE_D =
  "M50 4c3 10 7 17 13 22l-3 7 11-3c5 2 11 3 18 3-4 5-7 10-8 16l6 6-9 1c-2 6-2 12 0 19-6-4-12-6-18-6l-4 10-4-10c-6 0-12 2-18 6 2-7 2-13 0-19l-9-1 6-6c-1-6-4-11-8-16 7 0 13-1 18-3l11 3-3-7c6-5 10-12 13-22z";

/** A maple-style leaf; colour comes from CSS (currentColor). */
export function Leaf({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <path fill="currentColor" d={MAPLE_D} />
      <path d="M50 30v62" stroke="rgba(60,20,0,.35)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M50 52l-14-10M50 52l14-10M50 66l-10-7M50 66l10-7" stroke="rgba(60,20,0,.25)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** An oak leaf for variety; colour from CSS. */
export function OakLeaf({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M50 6c7 2 10 9 8 16 7-1 12 3 12 10-1 5-5 8-9 9 6 2 9 7 7 13-2 5-7 7-12 6 3 6 1 12-5 15-2 1-3 1-1 10h-4c2-9 1-9-1-10-6-3-8-9-5-15-5 1-10-1-12-6-2-6 1-11 7-13-4-1-8-4-9-9 0-7 5-11 12-10-2-7 1-14 8-16z"
      />
      <path d="M50 20v66" stroke="rgba(60,20,0,.35)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * A maple branch reaching in from the top-right corner, in full autumn
 * colour. Each leaf hangs from the branch at (x, y), rotated and scaled; the
 * leaves flutter on their own clocks while the whole branch sways.
 */
const BRANCH_LEAVES = [
  { x: 214, y: 30, r: 160, s: 0.5, c: "#d9541e", d: "-0.4s" },
  { x: 176, y: 52, r: 205, s: 0.44, c: "#f2a93b", d: "-1.6s" },
  { x: 150, y: 86, r: 150, s: 0.56, c: "#b23a12", d: "-0.9s" },
  { x: 118, y: 96, r: 215, s: 0.4, c: "#e07b1a", d: "-2.2s" },
  { x: 92, y: 124, r: 170, s: 0.5, c: "#c9611a", d: "-1.2s" },
  { x: 58, y: 136, r: 200, s: 0.42, c: "#f0b429", d: "-0.2s" },
  { x: 132, y: 128, r: 185, s: 0.36, c: "#a8321a", d: "-2.8s" }
];

function Branch({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 300 200" aria-hidden="true" focusable="false">
      <g fill="none" stroke="#6b3a1c" strokeLinecap="round">
        <path d="M304 -6C250 18 214 40 180 66S110 118 46 150" strokeWidth="7" />
        <path d="M206 48c-6 12-8 22-6 34" strokeWidth="3.5" />
        <path d="M150 88c10 8 16 18 18 30" strokeWidth="3" />
        <path d="M104 116c-4 10-2 20 4 28" strokeWidth="2.6" />
        <path d="M250 22c10 6 18 6 28 2" strokeWidth="3" />
      </g>
      {BRANCH_LEAVES.map((l, i) => (
        <g key={i} transform={`translate(${l.x} ${l.y})`}>
          <g className="v5-fa-branch__leaf" style={{ animationDelay: l.d }}>
            <g transform={`rotate(${l.r}) scale(${l.s}) translate(-50 -8)`}>
              <path d={MAPLE_D} fill={l.c} />
              <path d="M50 30v62" stroke="rgba(60,20,0,.3)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </g>
          </g>
        </g>
      ))}
    </svg>
  );
}

// Each leaf: where it starts across the hero, size, colour, how long one
// fall takes and its phase. Delays are negative so the sky is already full of
// leaves on first paint instead of raining in from the top edge.
const LEAVES = [
  { x: "6%", size: 40, color: "#d9541e", dur: "14s", delay: "-2s", kind: "maple" },
  { x: "14%", size: 30, color: "#f2a93b", dur: "17s", delay: "-9s", kind: "oak" },
  { x: "24%", size: 36, color: "#b23a12", dur: "15s", delay: "-5s", kind: "maple" },
  { x: "33%", size: 26, color: "#e07b1a", dur: "19s", delay: "-13s", kind: "oak" },
  { x: "58%", size: 34, color: "#c9611a", dur: "16s", delay: "-7s", kind: "maple" },
  { x: "68%", size: 28, color: "#f0b429", dur: "18s", delay: "-11s", kind: "oak" },
  { x: "78%", size: 38, color: "#a8321a", dur: "15s", delay: "-3s", kind: "maple" },
  { x: "88%", size: 30, color: "#e38a24", dur: "20s", delay: "-15s", kind: "oak" },
  { x: "95%", size: 26, color: "#d9541e", dur: "17s", delay: "-6s", kind: "maple" }
];

// A few fallen leaves tucked around the pumpkins' base — positions inside
// the group, in px. The cursor can kick them up; they settle back.
const PATCH_LEAVES = [
  // One resting against the big pumpkin's stem.
  { x: 102, y: 4, s: 24, r: -28, c: "#b23a12", oak: false },
  // A loose ring along the base, open in the middle so it reads as tidy.
  { x: -6, y: 84, s: 24, r: 150, c: "#c9611a", oak: true },
  { x: 6, y: 92, s: 26, r: 30, c: "#d9541e", oak: false },
  { x: 30, y: 98, s: 22, r: -40, c: "#f2a93b", oak: true },
  { x: 120, y: 100, s: 24, r: 70, c: "#b23a12", oak: false },
  { x: 150, y: 94, s: 22, r: -20, c: "#e07b1a", oak: true },
  { x: 168, y: 100, s: 20, r: 110, c: "#f0b429", oak: false },
  { x: 180, y: 84, s: 22, r: -64, c: "#a8321a", oak: false }
];

// How far the cursor reaches. Falling leaves within PUSH_R are blown aside;
// the patch's leaves within KICK_R jump up and tumble back down.
const PUSH_R = 130;
const KICK_R = 70;

// The pumpkin group sits on the photo card's bottom-right corner: it
// overlaps the corner by OVERLAP_X / reaches OVERHANG_Y below the card. That
// corner is picture only (the card's caption is bottom-left), so nothing is
// covered.
const OVERLAP_X = 30;
const OVERHANG_Y = 58;
const PATCH_W = 190;
const PATCH_H = 116;

export default function FallDecor() {
  const ref = useRef<HTMLDivElement>(null);
  // Where the pumpkin group goes, relative to the hero; null until measured
  // (or when the photo card isn't shown), so nothing jumps on first paint.
  const [patch, setPatch] = useState<{ left: number; top: number } | null>(null);

  // Keep the group anchored to the photo card at every width: measure on
  // mount, after the hero's entrance animation, and whenever the hero or the
  // card resizes.
  useEffect(() => {
    const hero = ref.current?.parentElement;
    const card = hero?.querySelector<HTMLElement>(".v5-hero__visual");
    if (!hero || !card) return;
    const place = () => {
      const h = hero.getBoundingClientRect();
      const c = card.getBoundingClientRect();
      if (c.width < 1 || c.height < 1) return setPatch(null);
      setPatch({
        // Never past the hero's right edge (no sideways scroll on narrow screens).
        left: Math.min(c.right - h.left - PATCH_W + OVERLAP_X, h.width - PATCH_W - 8),
        top: c.bottom - h.top - PATCH_H + OVERHANG_Y
      });
    };
    place();
    const settle = window.setTimeout(place, 1300);
    const ro = new ResizeObserver(place);
    ro.observe(hero);
    ro.observe(card);
    return () => {
      window.clearTimeout(settle);
      ro.disconnect();
    };
  }, []);

  // Mouse play. Purely visual, mouse only (touch scrolling is left alone),
  // and off for people who asked for reduced motion.
  useEffect(() => {
    const decor = ref.current;
    const hero = decor?.parentElement;
    if (!decor || !hero) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // The patch's leaves live in the front layer (a sibling of the decor).
    const front = hero.querySelector<HTMLElement>(".v5-fa-front");

    const timers = new Map<HTMLElement, number>();
    let frame = 0;
    let px = 0;
    let py = 0;

    const later = (el: HTMLElement, ms: number, fn: () => void) => {
      window.clearTimeout(timers.get(el));
      timers.set(el, window.setTimeout(fn, ms));
    };

    const tick = () => {
      frame = 0;
      // Falling leaves: a gust pushes them away from the cursor, then they
      // drift back onto their own path.
      decor.querySelectorAll<HTMLElement>(".v5-fa-leaf__push").forEach((el) => {
        const r = el.getBoundingClientRect();
        const dx = r.left + r.width / 2 - px;
        const dy = r.top + r.height / 2 - py;
        const d = Math.hypot(dx, dy);
        if (d > PUSH_R || d === 0) return;
        const f = (1 - d / PUSH_R) * 90;
        el.style.transition = "transform 0.35s cubic-bezier(0.2, 0.8, 0.3, 1)";
        el.style.transform = `translate(${(dx / d) * f}px, ${(dy / d) * f}px) rotate(${dx > 0 ? 35 : -35}deg)`;
        later(el, 380, () => {
          el.style.transition = "transform 1.8s ease-in-out";
          el.style.transform = "";
        });
      });
      // Fallen leaves: a kick sends them up and tumbling, then they settle.
      (front || decor).querySelectorAll<HTMLElement>(".v5-fa-patch__leaf").forEach((el) => {
        if (el.dataset.kicked) return;
        const r = el.getBoundingClientRect();
        const dx = r.left + r.width / 2 - px;
        const dy = r.top + r.height / 2 - py;
        const d = Math.hypot(dx, dy);
        if (d > KICK_R) return;
        const rest = el.dataset.rot || "0";
        const side = dx === 0 ? (Math.random() < 0.5 ? -1 : 1) : Math.sign(dx);
        const hop = 34 + Math.random() * 46;
        const drift = side * (24 + Math.random() * 40);
        const spin = Number(rest) + side * (140 + Math.random() * 160);
        el.dataset.kicked = "1";
        el.style.transition = "transform 0.42s cubic-bezier(0.15, 0.85, 0.3, 1)";
        el.style.transform = `translate(${drift}px, ${-hop}px) rotate(${spin}deg)`;
        later(el, 430, () => {
          // Drops back to its own spot, so the group always looks tidy.
          el.style.transition = "transform 0.9s cubic-bezier(0.5, 0, 0.75, 0)";
          el.style.transform = `rotate(${rest}deg)`;
          later(el, 950, () => {
            delete el.dataset.kicked;
          });
        });
      });
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      px = e.clientX;
      py = e.clientY;
      if (!frame) frame = window.requestAnimationFrame(tick);
    };

    hero.addEventListener("pointermove", onMove);
    return () => {
      hero.removeEventListener("pointermove", onMove);
      if (frame) window.cancelAnimationFrame(frame);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  return (
    <>
    <div className="v5-fa-decor" aria-hidden="true" ref={ref}>
      {/* Low autumn sun glowing behind the branch in the top-right corner. */}
      <span className="v5-fa-bloom" />
      <span className="v5-fa-branch">
        <Branch />
      </span>
      {LEAVES.map((l, i) => (
        <span
          key={i}
          className={`v5-fa-leaf${i % 3 === 1 ? " v5-fa-leaf--extra" : ""}`}
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
          <span className="v5-fa-leaf__push">
            <span className="v5-fa-leaf__spin">{l.kind === "oak" ? <OakLeaf /> : <Leaf />}</span>
          </span>
        </span>
      ))}
    </div>
    {/* Front layer: only the pumpkin group, which sits OVER the photo card's
        corner. Separate from the decor (which is behind the content) and
        click-through, so it never blocks anything. */}
    <div className="v5-fa-front" aria-hidden="true">
      {patch && (
        <div className="v5-fa-patch" style={{ left: patch.left, top: patch.top }}>
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
              data-rot={l.r}
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
      )}
    </div>
    </>
  );
}

"use client";

// Hero decoration for the Halloween event: jack-o'-lanterns hanging on
// strings and swaying, a few bats crossing the sky, and a cobweb in the
// corner. Purely decorative — one layer behind the hero's controls, hidden
// from assistive tech, and still under prefers-reduced-motion.

import { useId } from "react";

/** A carved jack-o'-lantern with a glowing face. */
export function Pumpkin({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={className} viewBox="0 0 120 110" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${id}b`} cx="42%" cy="36%" r="72%">
          <stop offset="0" stopColor="#ffb54d" />
          <stop offset="0.55" stopColor="#f47a1f" />
          <stop offset="1" stopColor="#b9400c" />
        </radialGradient>
        <radialGradient id={`${id}s`} cx="50%" cy="40%" r="70%">
          <stop offset="0" stopColor="#f08a2c" />
          <stop offset="1" stopColor="#9c3409" />
        </radialGradient>
        <radialGradient id={`${id}g`} cx="50%" cy="50%" r="60%">
          <stop offset="0" stopColor="#fff6c2" />
          <stop offset="1" stopColor="#ffb21a" />
        </radialGradient>
      </defs>
      <path d="M57 26C56 15 58 9 64 4l5 3c-4 4-5 10-4 19z" fill="#4f5d1c" />
      <ellipse cx="35" cy="67" rx="29" ry="37" fill={`url(#${id}s)`} />
      <ellipse cx="85" cy="67" rx="29" ry="37" fill={`url(#${id}s)`} />
      <ellipse cx="60" cy="67" rx="33" ry="41" fill={`url(#${id}b)`} stroke="rgba(120,40,8,.35)" strokeWidth="1.5" />
      <g fill={`url(#${id}g)`} className="v5-hw-face">
        <path d="M40 52l10 14H30z" />
        <path d="M80 52l10 14H70z" />
        <path d="M60 67l4 7h-8z" />
        <path d="M33 79c9 11 45 11 54 0l-5 9-5-4-5 6-6-5-6 6-6-6-6 5-5-6-5 4z" />
      </g>
    </svg>
  );
}

/** Bat silhouette: body, head and ears, and two scalloped wings that beat
 *  from the shoulders. The left wing is the right one mirrored by its group —
 *  the mirror sits on the <g> because a CSS animation's transform would
 *  replace a transform attribute on the path itself. */
function Bat({ className }: { className?: string }) {
  const wing =
    "M64 25C74 13 92 7 116 13c-6 4-8 9-7 16-7-4-14-3-19 3-4-6-11-7-17-2-2-5-5-7-9-5z";
  return (
    <svg className={className} viewBox="0 0 120 56" aria-hidden="true" focusable="false">
      <path className="v5-hw-bat__wing" d={wing} />
      <g transform="matrix(-1 0 0 1 120 0)">
        <path className="v5-hw-bat__wing" d={wing} />
      </g>
      <ellipse cx="60" cy="31" rx="5.5" ry="10" />
      <circle cx="60" cy="20" r="5.5" />
      <path d="M55.5 18.5 56 10l3.6 6.2zM64.5 18.5 64 10l-3.6 6.2z" />
    </svg>
  );
}

function Web({ className }: { className?: string }) {
  // Spokes from the corner, joined by sagging threads.
  const spokes = [8, 24, 40, 56, 72, 86];
  const rings = [34, 62, 92, 124];
  const pt = (a: number, r: number) => {
    const rad = (a * Math.PI) / 180;
    return [r * Math.cos(rad), r * Math.sin(rad)];
  };
  return (
    <svg className={className} viewBox="0 0 150 150" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1">
        {spokes.map((a) => {
          const [x, y] = pt(a, 150);
          return <line key={a} x1="0" y1="0" x2={x} y2={y} />;
        })}
        {rings.map((r) => (
          <path
            key={r}
            d={spokes
              .map((a, i) => {
                const [x, y] = pt(a, r);
                if (i === 0) return `M${x} ${y}`;
                // Sag each thread toward the corner.
                const [cx, cy] = pt((a + spokes[i - 1]) / 2, r * 0.86);
                return `Q${cx} ${cy} ${x} ${y}`;
              })
              .join(" ")}
          />
        ))}
      </g>
    </svg>
  );
}

const PUMPKINS = [
  { x: "47%", len: 92, size: 66, delay: "0s", dur: "5.2s" },
  { x: "53.5%", len: 34, size: 44, delay: "-1.6s", dur: "4.4s" },
  { x: "95.5%", len: 58, size: 52, delay: "-3.1s", dur: "5.8s" }
];

const BATS = [
  // Kept to the band above the headline, so no bat ever crosses the copy.
  // The last one is small, soft and slow: a bat far off, for depth.
  { top: "8%", size: 58, dur: "21s", delay: "-5s", far: false },
  { top: "15%", size: 40, dur: "27s", delay: "-16s", far: false },
  { top: "3%", size: 26, dur: "38s", delay: "-24s", far: true }
];

export default function HalloweenDecor() {
  return (
    <div className="v5-hw-decor" aria-hidden="true">
      <Web className="v5-hw-web" />
      {BATS.map((b, i) => (
        <span
          key={i}
          className={`v5-hw-bat${i > 1 ? " v5-hw-bat--extra" : ""}${b.far ? " v5-hw-bat--far" : ""}`}
          style={
            {
              top: b.top,
              "--hw-size": `${b.size}px`,
              "--hw-dur": b.dur,
              "--hw-delay": b.delay
            } as React.CSSProperties
          }
        >
          <Bat />
        </span>
      ))}
      {PUMPKINS.map((p, i) => (
        <span
          key={i}
          className={`v5-hw-hang${i > 0 ? " v5-hw-hang--extra" : ""}`}
          style={
            {
              left: p.x,
              "--hw-len": `${p.len}px`,
              "--hw-size": `${p.size}px`,
              "--hw-dur": p.dur,
              "--hw-delay": p.delay
            } as React.CSSProperties
          }
        >
          <span className="v5-hw-hang__string" />
          <Pumpkin className="v5-hw-hang__pumpkin" />
        </span>
      ))}
    </div>
  );
}

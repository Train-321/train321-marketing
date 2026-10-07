"use client";

// Clickable US map for the course finder. Pure SVG: each state is a path
// with hover/selected classes, and a floating tooltip shows the course count
// for that state under the current chip. Loaded lazily (next/dynamic) — the
// outlines are ~44 KB and only desktop shows the map.

import { useRef, useState, type MouseEvent } from "react";
import { STATE_NAMES } from "@/lib/states";
import { US_MAP_STATES, US_MAP_VIEWBOX } from "./usMapData";

type Props = {
  selected: string | null;
  onSelect: (code: string) => void;
  counts: Record<string, { total: number; specific: number }>;
  specificStates: Set<string>;
};

export default function UsMap({ selected, onSelect, counts, specificStates }: Props) {
  const [hover, setHover] = useState<{ code: string; x: number; y: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const track = (e: MouseEvent, code: string) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    setHover({ code, x: e.clientX - r.left, y: e.clientY - r.top });
  };

  // The selected state is drawn last so its stroke sits above its neighbours.
  const ordered = selected
    ? [...US_MAP_STATES.filter((s) => s.id !== selected), ...US_MAP_STATES.filter((s) => s.id === selected)]
    : US_MAP_STATES;

  const tip = hover ? counts[hover.code] : null;

  return (
    <div className="v5-map" ref={wrapRef}>
      <svg
        viewBox={US_MAP_VIEWBOX}
        className="v5-map__svg"
        role="img"
        aria-label="Map of the United States — click your state"
      >
        {ordered.map((s) => {
          const cls = [
            "v5-map__state",
            selected === s.id ? "is-selected" : "",
            specificStates.has(s.id) ? "has-specific" : "",
            hover?.code === s.id ? "is-hover" : ""
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <path
              key={s.id}
              d={s.d}
              className={cls}
              onMouseMove={(e) => track(e, s.id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onSelect(s.id)}
            >
              <title>{s.name}</title>
            </path>
          );
        })}
      </svg>
      {hover && (
        <div className="v5-map__tip" style={{ left: hover.x, top: hover.y }} role="status">
          <strong>{STATE_NAMES[hover.code] || hover.code}</strong>
          <span>
            {tip?.total ?? 0} courses
            {tip?.specific ? ` · ${tip.specific} ${hover.code}-specific` : ""}
          </span>
        </div>
      )}
    </div>
  );
}

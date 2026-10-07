"use client";

// "...and everywhere else food and drink is served": a cloud of workplace
// pills. On a fine pointer, hovering a pill floats a photo card beside the
// cursor (it swings in from a slight tilt); on touch the pills are plain
// buttons. Every pill hands its filter to the course finder.

import { useRef, useState, type MouseEvent } from "react";
import type { FilterHint } from "./industries";
import { PHOTOS, photoUrl, type PhotoKey } from "./photos";
import { useFinderV5 } from "./FinderContext";

type Pill = { label: string; photo: PhotoKey; filter: FilterHint };

const PILLS: Pill[] = [
  { label: "Full service", photo: "restaurant", filter: "food" },
  { label: "Quick service", photo: "cafe", filter: "foh" },
  { label: "Bars & lounges", photo: "bar", filter: "alcohol" },
  { label: "Breweries & taprooms", photo: "brewery", filter: "alcohol" },
  { label: "Hotels", photo: "hotel", filter: "all" },
  { label: "Resorts & clubs", photo: "hotelbar", filter: "alcohol" },
  { label: "Coffee & bakeries", photo: "cafe", filter: "food" },
  { label: "Food trucks", photo: "foodtruck", filter: "food" },
  { label: "Catering", photo: "catering", filter: "food" },
  { label: "Grocery & deli", photo: "grocery", filter: "food" },
  { label: "Convenience stores", photo: "grocery", filter: "alcohol" },
  { label: "Ghost kitchens", photo: "kitchen", filter: "boh" },
  { label: "Delivery", photo: "delivery", filter: "food" },
  { label: "Stadiums & events", photo: "catering", filter: "alcohol" },
  { label: "Franchise groups", photo: "manager", filter: "harassment" },
  { label: "Front desk & office", photo: "host", filter: "harassment" },
  { label: "Dish & prep", photo: "dishwasher", filter: "boh" },
  { label: "Whole teams", photo: "team", filter: "all" }
];

export default function WorkplacePills() {
  const { resolveHint, focusExplorer } = useFinderV5();
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const track = (e: MouseEvent, i: number) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    setHover({ i, x: e.clientX - r.left, y: e.clientY - r.top });
  };

  const photo = hover ? PHOTOS[PILLS[hover.i].photo] : null;

  return (
    <div className="v5-pills" ref={wrapRef}>
      <p className="v5-pills__lead">…and everywhere else food and drink is served</p>
      <div className="v5-pills__cloud">
        {PILLS.map((p, i) => (
          <button
            key={p.label}
            type="button"
            className={`v5-pill${hover?.i === i ? " is-on" : ""}`}
            onMouseEnter={(e) => track(e, i)}
            onMouseMove={(e) => track(e, i)}
            onMouseLeave={() => setHover(null)}
            onClick={() => focusExplorer({ chip: resolveHint(p.filter) })}
          >
            {p.label}
          </button>
        ))}
      </div>
      {hover && photo && (
        <div
          className="v5-pills__float"
          aria-hidden="true"
          style={{ transform: `translate(${hover.x + 18}px, ${hover.y - 150}px)` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoUrl(photo, 400, 500)} alt="" style={{ objectPosition: photo.pos }} />
          <span>{PILLS[hover.i].label}</span>
        </div>
      )}
    </div>
  );
}

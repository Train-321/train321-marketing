"use client";

// "Built for every shift" — two counter-scrolling rows of role tiles. Shows
// breadth (fourteen jobs, every one of them a real person at work) without
// repeating the hero's accordion mechanic. Hover pauses the row and lifts
// the tile; the "takes" line tells that role which course is theirs.

import { ROLES } from "./industries";
import { PHOTOS, photoUrl } from "./photos";
import { Reveal } from "./motion";
import WorkplacePills from "./WorkplacePills";

function Row({ items, reverse }: { items: typeof ROLES; reverse?: boolean }) {
  // Two copies back to back make the loop seamless (the track translates by
  // exactly half its width, then snaps back).
  const loop = [...items, ...items];
  return (
    <div className={`v5-marquee${reverse ? " v5-marquee--reverse" : ""}`}>
      <div className="v5-marquee__track">
        {loop.map((r, i) => {
          const photo = PHOTOS[r.photo];
          return (
            <div className="v5-role" key={`${r.name}-${i}`} aria-hidden={i >= items.length}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl(photo, 480, 600)}
                alt={i < items.length ? photo.alt : ""}
                style={{ objectPosition: photo.pos }}
                loading="lazy"
                decoding="async"
              />
              <span className="v5-role__shade" aria-hidden="true" />
              <span className="v5-role__text">
                <span className="v5-role__name">{r.name}</span>
                <span className="v5-role__takes">{r.takes}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function RolesMarquee() {
  const half = Math.ceil(ROLES.length / 2);
  return (
    <section className="v5-section v5-roles" aria-labelledby="v5-roles-title">
      <div className="v5-container">
        <Reveal className="v5-head v5-head--center">
          <p className="v5-eyebrow">
            <i className="fas fa-id-badge" aria-hidden="true" /> Built for every shift
          </p>
          <h2 id="v5-roles-title" className="v5-h2">
            Whoever is on the schedule, <em>their course is here.</em>
          </h2>
          <p className="v5-lede">
            From the dish pit to the GM's office — the same account, the same dashboard, the right certificate for every role.
          </p>
        </Reveal>
      </div>
      <Reveal variant="none" className="v5-roles__rows">
        <Row items={ROLES.slice(0, half)} />
        <Row items={ROLES.slice(half)} reverse />
      </Reveal>
      <div className="v5-container">
        <Reveal index={1}>
          <WorkplacePills />
        </Reveal>
      </div>
    </section>
  );
}

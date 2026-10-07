"use client";

// "Every role, every room": three columns of real-workplace portraits
// drifting slowly in alternating directions beside the pitch. Shows breadth
// without a carousel or a grid of cards. Hover pauses the wall and names
// the role (always named on touch).

import { ROLES } from "@/components/v5/industries";
import { Reveal } from "@/components/v5/motion";
import { PHOTOS, photoUrl } from "@/components/v5/photos";
import { useFinderV5 } from "@/components/v5/FinderContext";

const COLS = 3;

export default function RoleMosaic() {
  const { focusExplorer } = useFinderV5();
  // Deal the roles into three columns, each duplicated for a seamless loop.
  const cols = Array.from({ length: COLS }, (_, c) => ROLES.filter((_, i) => i % COLS === c));

  return (
    <section className="v5-section v6-mosaic" aria-labelledby="v6-mosaic-title">
      <div className="v5-container v6-mosaic__layout">
        <Reveal className="v6-mosaic__copy">
          <p className="v5-eyebrow">
            <i className="fas fa-id-badge" aria-hidden="true" /> Every role, every room
          </p>
          <h2 className="v5-h2" id="v6-mosaic-title">
            Whoever is on the schedule, <em>their course is here.</em>
          </h2>
          <p className="v5-lede">
            Servers, bartenders, line cooks, hosts, managers, baristas, caterers, grocery clerks, hotel
            staff, delivery drivers — one account, one dashboard, the right certificate for each.
          </p>
          <ul className="v6-mosaic__points">
            <li>
              <i className="fas fa-utensils" aria-hidden="true" /> Food handler cards accepted by your health department
            </li>
            <li>
              <i className="fas fa-cocktail" aria-hidden="true" /> State-approved alcohol server training (TABC, RBS, RVT…)
            </li>
            <li>
              <i className="fas fa-balance-scale" aria-hidden="true" /> Harassment prevention for every state that requires it
            </li>
          </ul>
          <button type="button" className="v5-btn v5-btn--ink" onClick={() => focusExplorer()}>
            Find courses for my team <i className="fas fa-arrow-right" aria-hidden="true" />
          </button>
        </Reveal>

        <Reveal variant="none" className="v6-mosaic__wall" aria-hidden="true">
          {cols.map((col, c) => (
            <div key={c} className={`v6-mosaic__col${c === 1 ? " v6-mosaic__col--down" : ""}`}>
              {[...col, ...col].map((r, i) => {
                const photo = PHOTOS[r.photo];
                return (
                  <div className="v6-mosaic__tile" key={`${r.name}-${i}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoUrl(photo, 420, 540)}
                      alt=""
                      style={{ objectPosition: photo.pos }}
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="v6-mosaic__label">
                      <strong>{r.name}</strong>
                      <span>{r.takes}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

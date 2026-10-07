"use client";

// Logo marquee under the hero. Logos come from Studio (Site Settings → trust
// logos); duplicated once so the CSS loop is seamless. Greyscale at rest,
// colour on hover.

import type { TrustLogo } from "@/lib/sanity";

export default function TrustStrip({ logos }: { logos: TrustLogo[] }) {
  const items = logos.filter((l) => l.imageUrl);
  if (!items.length) return null;
  const loop = [...items, ...items];
  return (
    <section className="v5-trust" aria-label="Trusted by">
      <div className="v5-container v5-trust__row">
        <p className="v5-trust__label">
          Trusted by teams at restaurant groups, hotels and state associations
        </p>
        <div className="v5-marquee v5-marquee--logos">
          <div className="v5-marquee__track">
            {loop.map((l, i) => (
              <span className="v5-trust__logo" key={`${l.name}-${i}`} aria-hidden={i >= items.length}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={l.imageUrl!} alt={i < items.length ? l.label || l.name : ""} loading="lazy" decoding="async" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

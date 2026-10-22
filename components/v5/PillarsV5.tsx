"use client";

// "What we do" — the three training categories. Content is dynamic: it comes
// from the Sanity home document (pillarsHead + pillars), the same source the
// canonical home page uses, so edits in Studio update both. The fallbacks below
// only show if Studio has nothing yet.

import Link from "next/link";
import type { PillarCard, SectionHead } from "@/lib/sanity";
import { Reveal } from "./motion";

const FALLBACK: PillarCard[] = [
  {
    icon: "fas fa-utensils",
    tone: "amber",
    title: "Food safety",
    body: "Food Handler, Food Manager, and accredited variants. Accepted by every state health department.",
    linkLabel: "Browse food safety",
    linkHref: "/food-handler"
  },
  {
    icon: "fas fa-wine-glass-alt",
    tone: "plum",
    title: "Alcohol & service",
    body: "Alcohol server training plus bar basics, service basics, and security host.",
    linkLabel: "Browse alcohol & service",
    linkHref: "/alcohol"
  },
  {
    icon: "fas fa-users-cog",
    tone: "emerald",
    title: "HR & compliance",
    body: "Sexual harassment (state-specific), human trafficking, and practical HR for managers.",
    linkLabel: "Browse HR & compliance",
    linkHref: "/human-resources"
  }
];

export default function PillarsV5({
  head,
  pillars
}: {
  head?: SectionHead;
  pillars?: PillarCard[];
}) {
  const cards = pillars?.length ? pillars : FALLBACK;
  return (
    <section className="v5-section v5-pillars-sec" aria-labelledby="v5-pillars-title">
      <div className="v5-container">
        <Reveal className="v5-head v5-head--center">
          <p className="v5-eyebrow">
            <i className={head?.icon || "fas fa-tag"} aria-hidden="true" /> {head?.eyebrow || "What we do"}
          </p>
          <h2 id="v5-pillars-title" className="v5-h2">
            {head?.heading || "Required training. One simple platform."}
          </h2>
          <p className="v5-lede">
            {head?.lede ||
              "Food handling, alcohol safety, and workplace compliance training for hospitality and service teams, all under one login, one dashboard, and one invoice."}
          </p>
        </Reveal>
        <Reveal className="v5-pillars">
          {cards.map((p, i) => (
            <Link
              key={i}
              href={p.linkHref || "#"}
              className={`v5-pillar v5-pillar--${p.tone || "amber"}`}
            >
              <span className="v5-pillar__icon" aria-hidden="true">
                <i className={p.icon || "fas fa-circle"} />
              </span>
              <h3 className="v5-h3">{p.title}</h3>
              <p>{p.body}</p>
              <span className="v5-pillar__link">
                {p.linkLabel || "Learn more"} <i className="fas fa-arrow-right" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

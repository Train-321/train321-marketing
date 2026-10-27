"use client";

import Link from "next/link";
import type { FaqItem, SectionHead } from "@/lib/sanity";
import { Reveal } from "./motion";
import AccentLast from "./AccentLast";

export default function FaqV5({
  items,
  head,
  ctaLabel
}: {
  items: FaqItem[];
  head?: SectionHead;
  ctaLabel?: string;
}) {
  if (!items.length) return null;
  return (
    <section className="v5-section v5-faq" aria-labelledby="v5-faq-title">
      <div className="v5-container v5-faq__grid">
        <Reveal className="v5-faq__intro">
          <p className="v5-eyebrow">
            <i className={head?.icon || "fas fa-question-circle"} aria-hidden="true" /> {head?.eyebrow || "Good to know"}
          </p>
          <h2 id="v5-faq-title" className="v5-h2">
            {head?.heading ? (
              <AccentLast text={head.heading} />
            ) : (
              <>
                Questions we get <em>before the first course.</em>
              </>
            )}
          </h2>
          <p className="v5-lede">{head?.lede || "Still unsure? Call 561-325-7300 — a person answers."}</p>
          <Link href="/faq" className="v5-btn v5-btn--ghost">
            {ctaLabel || "All FAQs"} <i className="fas fa-arrow-right" aria-hidden="true" />
          </Link>
        </Reveal>
        <div className="v5-faq__list">
          {items.map((f, i) => (
            <Reveal as="details" key={f.q} className="v5-faq__item" index={i}>
              <summary>
                <span>{f.q}</span>
                <i className="fas fa-plus" aria-hidden="true" />
              </summary>
              <div className="v5-faq__body">
                <p>{f.a}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

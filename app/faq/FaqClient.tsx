"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import type { FaqGroup, FaqPage, SiteSettings } from "@/lib/sanity";
import "./faq.css";

function slug(s: string) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

type Props = { faqs: FaqGroup[]; page?: FaqPage | null; settings?: SiteSettings };

export default function FaqClient({ faqs, page, settings }: Props) {
  const [query, setQuery] = useState("");

  const heroEyebrow = page?.heroEyebrow || "Frequently asked";
  const heroHeading = page?.heroHeading || "Questions we hear a lot.";
  const heroLede = page?.heroLede || "Can't find what you need? Drop us a line — a real person will reply within 2 business hours.";
  const searchPlaceholder = page?.searchPlaceholder || "Search FAQs…";
  const categoriesLabel = page?.categoriesLabel || "Categories";
  const emptyText = page?.emptyText || "No matching questions.";

  const cta = page?.bottomCta;
  const ctaEyebrow = cta?.eyebrow || "Still stuck?";
  const ctaHeading = cta?.heading || "We're here to help.";
  const ctaLede = cta?.lede || "Email, phone, or live chat — whichever works. Most replies land within 2 business hours.";
  const ctaPrimaryLabel = cta?.primaryCta?.label || "Contact support";
  const ctaPrimaryHref = cta?.primaryCta?.to || "/contact";
  const phone = settings?.phone || "561-325-7300";
  const ctaSecondaryLabel = cta?.secondaryCta?.label || phone;
  const ctaSecondaryHref = cta?.secondaryCta?.to || `tel:+1${phone.replace(/\D/g, "")}`;

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;
    return faqs
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((it) => (it.q + " " + it.a).toLowerCase().includes(q))
      }))
      .filter((cat) => cat.items.length);
  }, [query, faqs]);

  return (
    <div className="t321-mkt-faq">
      <section className="t321-mkt-faq__hero">
        <div className="t321-mkt-container">
          <span className="t321-mkt-eyebrow"><i className="fas fa-question-circle" /> {heroEyebrow}</span>
          <h1 className="t321-mkt-h1">{heroHeading}</h1>
          <p className="t321-mkt-lede">{heroLede}</p>

          <div className="t321-mkt-faq__search">
            <i className="fas fa-search" aria-hidden="true" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              placeholder={searchPlaceholder}
              aria-label="Search FAQs"
            />
            {query && (
              <button type="button" className="t321-mkt-faq__search-clear" onClick={() => setQuery("")}>
                <i className="fas fa-times" />
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="t321-mkt-section">
        <div className="t321-mkt-container t321-mkt-faq__body">
          <nav className="t321-mkt-faq__nav" aria-label="FAQ categories">
            <span className="t321-mkt-faq__nav-head">{categoriesLabel}</span>
            {faqs.map((cat) => (
              <a key={cat.category} href={`#${slug(cat.category)}`} className="t321-mkt-faq__nav-link">
                {cat.category}
              </a>
            ))}
          </nav>

          <div className="t321-mkt-faq__list">
            {filteredCategories.map((cat) => (
              <section key={cat.category} id={slug(cat.category)} className="t321-mkt-faq__cat">
                <h2 className="t321-mkt-h2">{cat.category}</h2>
                {cat.items.map((it, i) => (
                  <details key={i} className="t321-mkt-faq__item">
                    <summary>
                      <span>{it.q}</span>
                      <i className="fas fa-plus" aria-hidden="true" />
                    </summary>
                    <p>{it.a}</p>
                  </details>
                ))}
              </section>
            ))}

            {!filteredCategories.length && (
              <div className="t321-mkt-faq__empty">
                <i className="fas fa-search" />
                <h3>{emptyText}</h3>
                <p>Try a different search term or <Link href="/contact">ask us directly</Link>.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="t321-mkt-section t321-mkt-section--sunk">
        <div className="t321-mkt-container t321-mkt-faq__cta">
          <div>
            <span className="t321-mkt-eyebrow">{ctaEyebrow}</span>
            <h2 className="t321-mkt-h2">{ctaHeading}</h2>
            <p className="t321-mkt-lede">{ctaLede}</p>
          </div>
          <div className="t321-mkt-faq__cta-actions">
            <Link href={ctaPrimaryHref} className="t321-mkt-btn t321-mkt-btn--primary t321-mkt-btn--lg">
              {ctaPrimaryLabel}
            </Link>
            <a href={ctaSecondaryHref} className="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg">
              <i className="fas fa-phone" /> {ctaSecondaryLabel}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

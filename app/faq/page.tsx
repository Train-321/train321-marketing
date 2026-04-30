"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { faqs } from "@/assets/data/faqs";
import "./faq.css";

function slug(s: string) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function FaqPage() {
  const [query, setQuery] = useState("");

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;
    return faqs
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((it) => (it.q + " " + it.a).toLowerCase().includes(q))
      }))
      .filter((cat) => cat.items.length);
  }, [query]);

  return (
    <div className="t321-mkt-faq">
      <section className="t321-mkt-faq__hero">
        <div className="t321-mkt-container">
          <span className="t321-mkt-eyebrow"><i className="fas fa-question-circle" /> Frequently asked</span>
          <h1 className="t321-mkt-h1">Questions we hear a lot.</h1>
          <p className="t321-mkt-lede">
            Can&apos;t find what you need? <Link href="/contact">Drop us a line</Link> —
            a real person will reply within 2 business hours.
          </p>

          <div className="t321-mkt-faq__search">
            <i className="fas fa-search" aria-hidden="true" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              placeholder="Search FAQs…"
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
            <span className="t321-mkt-faq__nav-head">Categories</span>
            {faqs.map((cat) => (
              <a
                key={cat.category}
                href={`#${slug(cat.category)}`}
                className="t321-mkt-faq__nav-link"
              >{cat.category}</a>
            ))}
          </nav>

          <div className="t321-mkt-faq__list">
            {filteredCategories.map((cat) => (
              <section
                key={cat.category}
                id={slug(cat.category)}
                className="t321-mkt-faq__cat"
              >
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
                <h3>No matching questions.</h3>
                <p>Try a different search term or <Link href="/contact">ask us directly</Link>.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="t321-mkt-section t321-mkt-section--sunk">
        <div className="t321-mkt-container t321-mkt-faq__cta">
          <div>
            <span className="t321-mkt-eyebrow">Still stuck?</span>
            <h2 className="t321-mkt-h2">We&apos;re here to help.</h2>
            <p className="t321-mkt-lede">
              Email, phone, or live chat — whichever works. Most replies land within 2 business hours.
            </p>
          </div>
          <div className="t321-mkt-faq__cta-actions">
            <Link href="/contact" className="t321-mkt-btn t321-mkt-btn--primary t321-mkt-btn--lg">
              Contact support
            </Link>
            <a href="tel:+15613257300" className="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg">
              <i className="fas fa-phone" /> 561-325-7300
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

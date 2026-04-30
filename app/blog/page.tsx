"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { blogPosts } from "@/assets/data/blog";
import "./blog.css";

function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

const sortedPosts = [...blogPosts].sort(
  (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
);

export default function BlogIndexPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(sortedPosts.map((p) => p.category).filter(Boolean));
    return ["All", ...Array.from(cats)] as string[];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sortedPosts.filter((p) => {
      if (activeCategory !== "All" && p.category !== activeCategory) return false;
      if (!q) return true;
      return (p.title + " " + (p.excerpt || "") + " " + (p.category || "")).toLowerCase().includes(q);
    });
  }, [query, activeCategory]);

  const featured = sortedPosts[0];
  const showFeatured = !query && activeCategory === "All" && Boolean(featured);

  const filteredRest = useMemo(() => {
    if (showFeatured && featured) {
      return filtered.filter((p) => p.slug !== featured.slug);
    }
    return filtered;
  }, [filtered, showFeatured, featured]);

  const resetFilters = () => {
    setQuery("");
    setActiveCategory("All");
  };

  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
  };

  return (
    <div className="t321-mkt-blog">
      <section className="t321-mkt-blog__hero">
        <div className="t321-mkt-container">
          <span className="t321-mkt-eyebrow"><i className="fas fa-feather-alt" /> Field notes</span>
          <h1 className="t321-mkt-h1">The Train321 journal.</h1>
          <p className="t321-mkt-lede">
            Compliance updates, operator playbooks, and the lessons we collect from
            thousands of rollouts — written by the people who run the platform.
          </p>

          <div className="t321-mkt-blog__filters">
            <div className="t321-mkt-blog__search">
              <i className="fas fa-search" aria-hidden="true" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="search"
                placeholder="Search articles…"
                aria-label="Search articles"
              />
            </div>
            <div className="t321-mkt-blog__cats">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`t321-mkt-blog__cat${activeCategory === c ? " is-active" : ""}`}
                  onClick={() => setActiveCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {showFeatured && featured && (
        <section className="t321-mkt-section">
          <div className="t321-mkt-container">
            <Link href={`/blog/${featured.slug}`} className="t321-mkt-blog__featured">
              <div className={`t321-mkt-blog__featured-art is-tone-${featured.heroTone}`}>
                <i className={featured.heroIcon} aria-hidden="true" />
              </div>
              <div>
                <span className="t321-mkt-eyebrow">{featured.category} · Latest</span>
                <h2 className="t321-mkt-h2">{featured.title}</h2>
                <p>{featured.excerpt}</p>
                <div className="t321-mkt-blog__meta">
                  <span>{formatDate(featured.publishedAt)}</span>
                  <span>·</span>
                  <span>{featured.readMinutes} min read</span>
                  <span>·</span>
                  <span>{featured.author.name}</span>
                </div>
                <span className="t321-mkt-blog__featured-link">
                  Read the article <i className="fas fa-arrow-right" />
                </span>
              </div>
            </Link>
          </div>
        </section>
      )}

      <section className={`t321-mkt-section${!showFeatured ? " t321-mkt-section--sunk" : ""}`}>
        <div className="t321-mkt-container">
          {showFeatured && (
            <div className="t321-mkt-section__head">
              <span className="t321-mkt-eyebrow">Recent</span>
              <h2 className="t321-mkt-h2">More from the journal</h2>
            </div>
          )}

          {filteredRest.length ? (
            <div className="t321-mkt-blog__grid">
              {filteredRest.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="t321-mkt-blog__card t321-mkt-card t321-mkt-card--hover"
                >
                  <div className={`t321-mkt-blog__card-art is-tone-${p.heroTone}`}>
                    <i className={p.heroIcon} aria-hidden="true" />
                  </div>
                  <span className="t321-mkt-blog__card-cat">{p.category}</span>
                  <h3 className="t321-mkt-h3">{p.title}</h3>
                  <p>{p.excerpt}</p>
                  <div className="t321-mkt-blog__meta">
                    <span>{formatDate(p.publishedAt)}</span>
                    <span>·</span>
                    <span>{p.readMinutes} min</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="t321-mkt-blog__empty">
              <i className="fas fa-search" />
              <h3>No articles match your filters.</h3>
              <p>
                Try a different search term or{" "}
                <button type="button" onClick={resetFilters}>clear filters</button>.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="t321-mkt-section t321-mkt-section--ink">
        <div className="t321-mkt-container t321-mkt-blog__cta">
          <div>
            <h2 className="t321-mkt-h2">One email a month. No fluff.</h2>
            <p className="t321-mkt-lede">
              Compliance updates, operator interviews, and things we learned the hard way.
              Unsubscribe any time.
            </p>
          </div>
          <form className="t321-mkt-blog__news" onSubmit={onSubscribe}>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="you@work.com"
              aria-label="Email"
            />
            <button type="submit" className="t321-mkt-btn t321-mkt-btn--accent" disabled={subscribed}>
              {subscribed ? "Subscribed" : "Subscribe"}
              <i className="fas fa-arrow-right" aria-hidden="true" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

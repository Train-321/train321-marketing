import Link from "next/link";
import { testimonials, trustLogos } from "@/assets/data/testimonials";
import "./testimonials.css";

function initials(name: string) {
  return (name || "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export const metadata = {
  title: "Testimonials — Train321",
  description: "What operators say about Train321."
};

export default function TestimonialsPage() {
  const featured = testimonials[0];
  const rest = testimonials.slice(1);

  return (
    <div className="t321-mkt-testimonials">
      <section className="t321-mkt-testimonials__hero">
        <div className="t321-mkt-container">
          <span className="t321-mkt-eyebrow"><i className="fas fa-quote-left" /> Customer stories</span>
          <h1 className="t321-mkt-h1">Real words from real operators.</h1>
          <p className="t321-mkt-lede">
            We don&apos;t write our testimonials. These are emails, calls, and Slack messages from
            operators running actual restaurants, bars, and multi-unit groups.
          </p>
          <div className="t321-mkt-testimonials__stats">
            <div className="t321-mkt-testimonials__stat">
              <strong>500K+</strong>
              <span>Certificates issued</span>
            </div>
            <div className="t321-mkt-testimonials__stat">
              <strong>97%</strong>
              <span>Average completion rate</span>
            </div>
            <div className="t321-mkt-testimonials__stat">
              <strong>4.8/5</strong>
              <span>Operator satisfaction</span>
            </div>
            <div className="t321-mkt-testimonials__stat">
              <strong>2 hrs</strong>
              <span>Avg. support reply</span>
            </div>
          </div>
        </div>
      </section>

      <section className="t321-mkt-section">
        <div className="t321-mkt-container">
          <div className="t321-mkt-section__head">
            <span className="t321-mkt-eyebrow">Featured</span>
            <h2 className="t321-mkt-h2">The one we print on the wall</h2>
          </div>
          <figure className="t321-mkt-testimonials__featured">
            <i className="fas fa-quote-left t321-mkt-testimonials__featured-mark" aria-hidden="true" />
            <blockquote>{featured.quote}</blockquote>
            <figcaption>
              <div className="t321-mkt-testimonials__avatar" aria-hidden="true">{initials(featured.name)}</div>
              <div>
                <strong>{featured.name}</strong>
                <span>{featured.role} · {featured.company}</span>
              </div>
              {featured.stat && (
                <div className="t321-mkt-testimonials__featured-stat">
                  <strong>{featured.stat.value}</strong>
                  <span>{featured.stat.label}</span>
                </div>
              )}
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="t321-mkt-section t321-mkt-section--sunk">
        <div className="t321-mkt-container">
          <div className="t321-mkt-section__head">
            <span className="t321-mkt-eyebrow"><i className="fas fa-users" /> Operator voices</span>
            <h2 className="t321-mkt-h2">More from the field</h2>
          </div>
          <div className="t321-mkt-testimonials__grid">
            {rest.map((t) => (
              <article key={t.id} className="t321-mkt-testimonials__card t321-mkt-card">
                <i className="fas fa-quote-left t321-mkt-testimonials__card-mark" aria-hidden="true" />
                <blockquote>{t.quote}</blockquote>
                <footer>
                  <div className="t321-mkt-testimonials__avatar t321-mkt-testimonials__avatar--sm" aria-hidden="true">{initials(t.name)}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role} · {t.company}</span>
                  </div>
                </footer>
                {t.stat && (
                  <div className="t321-mkt-testimonials__card-stat">
                    <strong>{t.stat.value}</strong>
                    <span>{t.stat.label}</span>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="t321-mkt-section">
        <div className="t321-mkt-container">
          <div className="t321-mkt-section__head">
            <span className="t321-mkt-eyebrow"><i className="fas fa-award" /> Trusted by</span>
            <h2 className="t321-mkt-h2">Associations and operators who partner with us</h2>
          </div>
          <div className="t321-mkt-testimonials__logos">
            {trustLogos.map((l) => (
              <div key={l.name} className="t321-mkt-testimonials__logo">
                <span>{l.name}</span>
                <small>{l.label}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="t321-mkt-section t321-mkt-section--ink">
        <div className="t321-mkt-container t321-mkt-testimonials__cta">
          <div>
            <h2 className="t321-mkt-h2">Want a reference call?</h2>
            <p className="t321-mkt-lede">
              We&apos;ll happily introduce you to an operator running Train321 at roughly your
              scale. No scripts, no pitches — just a peer conversation.
            </p>
          </div>
          <Link href="/contact" className="t321-mkt-btn t321-mkt-btn--accent t321-mkt-btn--lg">
            Request a reference
            <i className="fas fa-arrow-right" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}

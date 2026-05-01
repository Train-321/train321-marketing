import Link from "next/link";
import { getTestimonials, getSiteSettings, getTestimonialsPage } from "@/lib/sanity";
import TrustLogosCarousel from "@/components/TrustLogosCarousel";
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

const FALLBACK_STATS = [
  { value: "500K+", label: "Certificates issued" },
  { value: "97%", label: "Average completion rate" },
  { value: "4.8/5", label: "Operator satisfaction" },
  { value: "2 hrs", label: "Avg. support reply" }
];

export default async function TestimonialsPage() {
  const [testimonials, settings, page] = await Promise.all([
    getTestimonials(),
    getSiteSettings(),
    getTestimonialsPage()
  ]);
  const trustLogos = settings.trustLogos || [];
  const featured = testimonials[0];
  const rest = testimonials.slice(1);

  const heroEyebrow = page?.heroEyebrow || "Customer stories";
  const heroHeading = page?.heroHeading || "Real words from real operators.";
  const heroLede =
    page?.heroLede ||
    "We don't write our testimonials. These are emails, calls, and Slack messages from operators running actual restaurants, bars, and multi-unit groups.";
  const heroStats = page?.heroStats?.length ? page.heroStats : FALLBACK_STATS;

  const featuredEyebrow = page?.featuredHead?.eyebrow || "Featured";
  const featuredHeading = page?.featuredHead?.heading || "The one we print on the wall";

  const moreEyebrow = page?.moreHead?.eyebrow || "Operator voices";
  const moreHeading = page?.moreHead?.heading || "More from the field";
  const moreIcon = page?.moreHead?.icon || "fas fa-users";

  const trustEyebrow = page?.trustHead?.eyebrow || "Trusted by";
  const trustHeading = page?.trustHead?.heading || "Associations and operators who partner with us";
  const trustIcon = page?.trustHead?.icon || "fas fa-award";

  const cta = page?.bottomCta;
  const ctaHeading = cta?.heading || "Want a reference call?";
  const ctaLede =
    cta?.lede ||
    "We'll happily introduce you to an operator running Train321 at roughly your scale. No scripts, no pitches — just a peer conversation.";
  const ctaLabel = cta?.primaryCta?.label || "Request a reference";
  const ctaHref = cta?.primaryCta?.to || "/contact";

  return (
    <div className="t321-mkt-testimonials">
      <section className="t321-mkt-testimonials__hero">
        <div className="t321-mkt-container">
          <span className="t321-mkt-eyebrow"><i className="fas fa-quote-left" /> {heroEyebrow}</span>
          <h1 className="t321-mkt-h1">{heroHeading}</h1>
          <p className="t321-mkt-lede">{heroLede}</p>
          <div className="t321-mkt-testimonials__stats">
            {heroStats.map((s, i) => (
              <div key={i} className="t321-mkt-testimonials__stat">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {featured && (
        <section className="t321-mkt-section">
          <div className="t321-mkt-container">
            <div className="t321-mkt-section__head">
              <span className="t321-mkt-eyebrow">{featuredEyebrow}</span>
              <h2 className="t321-mkt-h2">{featuredHeading}</h2>
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
      )}

      <section className="t321-mkt-section t321-mkt-section--sunk">
        <div className="t321-mkt-container">
          <div className="t321-mkt-section__head">
            <span className="t321-mkt-eyebrow"><i className={moreIcon} /> {moreEyebrow}</span>
            <h2 className="t321-mkt-h2">{moreHeading}</h2>
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
            <span className="t321-mkt-eyebrow"><i className={trustIcon} /> {trustEyebrow}</span>
            <h2 className="t321-mkt-h2">{trustHeading}</h2>
          </div>
          <TrustLogosCarousel logos={trustLogos} />
        </div>
      </section>

      <section className="t321-mkt-section t321-mkt-section--ink">
        <div className="t321-mkt-container t321-mkt-testimonials__cta">
          <div>
            <h2 className="t321-mkt-h2">{ctaHeading}</h2>
            <p className="t321-mkt-lede">{ctaLede}</p>
          </div>
          <Link href={ctaHref} className="t321-mkt-btn t321-mkt-btn--accent t321-mkt-btn--lg">
            {ctaLabel}
            <i className="fas fa-arrow-right" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}

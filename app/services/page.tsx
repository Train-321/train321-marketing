import Link from "next/link";
import "./services.css";

const TIERS = [
  {
    name: "Individual",
    audience: "Single learners",
    price: "From $12",
    priceSub: "per course",
    featured: false,
    features: [
      "Any course in the catalog",
      "Instant certificate on pass",
      "Mobile-friendly course player",
      "Email support within 2 hours"
    ],
    cta: "Browse courses",
    ctaTo: "/catalog"
  },
  {
    name: "Team",
    audience: "5-100 seats",
    price: "From $99/mo",
    priceSub: "+ per-seat pricing",
    featured: true,
    features: [
      "All courses included",
      "Manager dashboard & reporting",
      "CSV learner import",
      "Volume discounts at 10, 25, 50, 100 seats",
      "Phone & chat support"
    ],
    cta: "Start a team plan",
    ctaTo: "/enroll"
  },
  {
    name: "Business",
    audience: "100+ seats, multi-unit",
    price: "Custom",
    priceSub: "annual pricing",
    featured: false,
    features: [
      "Everything in Team",
      "SSO (Okta, Google, Azure AD)",
      "SCORM / xAPI export to your LMS",
      "Custom reporting & API access",
      "Named customer success manager"
    ],
    cta: "Talk to sales",
    ctaTo: "/contact"
  }
];

const ADDONS = [
  { to: "/courses/custom-courses", icon: "fa-sliders-h", title: "Custom course production", body: "We script, record, and deploy custom courses from your SOPs in 4-6 weeks. You own the content; we host it." },
  { to: "/courses/white-labeling", icon: "fa-paint-brush", title: "White-label deployment", body: "Every course, delivered in your colors, at your URL, with your logo on every certificate." },
  { to: "/courses/licensing", icon: "fa-id-card", title: "Association licensing", body: "State restaurant associations and trade groups license our catalog as the engine behind their member training." },
  { to: "/courses/additional-courses", icon: "fa-plus-circle", title: "Specialized training", body: "Cash handling, active-shooter response, data privacy, workplace violence — beyond the core compliance catalog." }
];

export default function ServicesPage() {
  return (
    <div className="t321-mkt-services">
      <section className="t321-mkt-services__hero">
        <div className="t321-mkt-container">
          <span className="t321-mkt-eyebrow"><i className="fas fa-layer-group" /> Services</span>
          <h1 className="t321-mkt-h1">Built for teams of every size.</h1>
          <p className="t321-mkt-lede">
            Whether you&apos;re a single-location owner training five people or a franchise
            deploying across hundreds of units, we have a plan — and a set of services —
            that fits how you actually work.
          </p>
        </div>
      </section>

      <section className="t321-mkt-section">
        <div className="t321-mkt-container">
          <div className="t321-mkt-services__tiers">
            {TIERS.map((t) => (
              <article key={t.name} className={`t321-mkt-services__tier t321-mkt-card${t.featured ? " is-featured" : ""}`}>
                {t.featured && <span className="t321-mkt-badge t321-mkt-badge--positive">Most popular</span>}
                <span className="t321-mkt-services__tier-eyebrow">{t.audience}</span>
                <h3 className="t321-mkt-h3">{t.name}</h3>
                <div className="t321-mkt-services__tier-price">
                  <strong>{t.price}</strong>
                  {t.priceSub && <span>{t.priceSub}</span>}
                </div>
                <ul>
                  {t.features.map((f) => (
                    <li key={f}>
                      <i className="fas fa-check" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={t.ctaTo} className={`t321-mkt-btn ${t.featured ? "t321-mkt-btn--primary" : "t321-mkt-btn--ghost"}`}>
                  {t.cta}
                  <i className="fas fa-arrow-right" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="t321-mkt-section t321-mkt-section--sunk">
        <div className="t321-mkt-container">
          <div className="t321-mkt-section__head">
            <span className="t321-mkt-eyebrow"><i className="fas fa-cogs" /> Additional services</span>
            <h2 className="t321-mkt-h2">Beyond the standard catalog</h2>
            <p className="t321-mkt-lede">
              For operators with specific needs — branding, reporting integrations, or
              proprietary SOPs — we offer hands-on professional services.
            </p>
          </div>
          <div className="t321-mkt-services__addons">
            {ADDONS.map((a) => (
              <Link key={a.to} href={a.to} className="t321-mkt-services__addon t321-mkt-card t321-mkt-card--hover">
                <span className="t321-mkt-services__addon-icon"><i className={`fas ${a.icon}`} /></span>
                <h3 className="t321-mkt-h3">{a.title}</h3>
                <p>{a.body}</p>
                <span className="t321-mkt-services__addon-link">Learn more <i className="fas fa-arrow-right" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="t321-mkt-section t321-mkt-section--ink">
        <div className="t321-mkt-container t321-mkt-services__cta">
          <div>
            <h2 className="t321-mkt-h2">Not sure which fits?</h2>
            <p className="t321-mkt-lede">
              Tell us about your team — we&apos;ll point you to the right plan (and the discount
              that applies to your headcount).
            </p>
          </div>
          <Link href="/contact" className="t321-mkt-btn t321-mkt-btn--accent t321-mkt-btn--lg">
            Talk to sales
            <i className="fas fa-arrow-right" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}

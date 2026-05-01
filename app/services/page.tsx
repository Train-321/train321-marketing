import Link from "next/link";
import { getServicesPage } from "@/lib/sanity";
import type { PillarCard, ServicesTier } from "@/lib/sanity";
import "./services.css";

const FALLBACK_TIERS: ServicesTier[] = [
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
    ctaLabel: "Browse courses",
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
    ctaLabel: "Start a team plan",
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
    ctaLabel: "Talk to sales",
    ctaTo: "/contact"
  }
];

const FALLBACK_ADDONS: PillarCard[] = [
  { linkHref: "/courses/custom-courses", icon: "fas fa-sliders-h", title: "Custom course production", body: "We script, record, and deploy custom courses from your SOPs in 4-6 weeks. You own the content; we host it." },
  { linkHref: "/courses/white-labeling", icon: "fas fa-paint-brush", title: "White-label deployment", body: "Every course, delivered in your colors, at your URL, with your logo on every certificate." },
  { linkHref: "/courses/licensing", icon: "fas fa-id-card", title: "Association licensing", body: "State restaurant associations and trade groups license our catalog as the engine behind their member training." },
  { linkHref: "/courses/additional-courses", icon: "fas fa-plus-circle", title: "Specialized training", body: "Cash handling, active-shooter response, data privacy, workplace violence — beyond the core compliance catalog." }
];

export const metadata = {
  title: "Services & Pricing — Train321",
  description: "Plans for individuals, teams, and enterprises."
};

export default async function ServicesPage() {
  const page = await getServicesPage();

  const heroEyebrow = page?.heroEyebrow || "Services";
  const heroHeading = page?.heroHeading || "Built for teams of every size.";
  const heroLede =
    page?.heroLede ||
    "Whether you're a single-location owner training five people or a franchise deploying across hundreds of units, we have a plan — and a set of services — that fits how you actually work.";

  const tiers = page?.tiers?.length ? page.tiers : FALLBACK_TIERS;

  const addonsEyebrow = page?.addonsHead?.eyebrow || "Additional services";
  const addonsHeading = page?.addonsHead?.heading || "Beyond the standard catalog";
  const addonsLede =
    page?.addonsHead?.lede ||
    "For operators with specific needs — branding, reporting integrations, or proprietary SOPs — we offer hands-on professional services.";
  const addons = page?.addons?.length ? page.addons : FALLBACK_ADDONS;

  const cta = page?.bottomCta;
  const ctaHeading = cta?.heading || "Not sure which fits?";
  const ctaLede =
    cta?.lede ||
    "Tell us about your team — we'll point you to the right plan (and the discount that applies to your headcount).";
  const ctaLabel = cta?.primaryCta?.label || "Talk to sales";
  const ctaHref = cta?.primaryCta?.to || "/contact";

  return (
    <div className="t321-mkt-services">
      <section className="t321-mkt-services__hero">
        <div className="t321-mkt-container">
          <span className="t321-mkt-eyebrow"><i className="fas fa-layer-group" /> {heroEyebrow}</span>
          <h1 className="t321-mkt-h1">{heroHeading}</h1>
          <p className="t321-mkt-lede">{heroLede}</p>
        </div>
      </section>

      <section className="t321-mkt-section">
        <div className="t321-mkt-container">
          <div className="t321-mkt-services__tiers">
            {tiers.map((t, i) => (
              <article key={t.name || i} className={`t321-mkt-services__tier t321-mkt-card${t.featured ? " is-featured" : ""}`}>
                {t.featured && <span className="t321-mkt-badge t321-mkt-badge--positive">Most popular</span>}
                {t.audience && <span className="t321-mkt-services__tier-eyebrow">{t.audience}</span>}
                <h3 className="t321-mkt-h3">{t.name}</h3>
                <div className="t321-mkt-services__tier-price">
                  <strong>{t.price}</strong>
                  {t.priceSub && <span>{t.priceSub}</span>}
                </div>
                <ul>
                  {(t.features || []).map((f, j) => (
                    <li key={j}>
                      <i className="fas fa-check" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
                {t.ctaTo && (
                  <Link href={t.ctaTo} className={`t321-mkt-btn ${t.featured ? "t321-mkt-btn--primary" : "t321-mkt-btn--ghost"}`}>
                    {t.ctaLabel || "Learn more"}
                    <i className="fas fa-arrow-right" aria-hidden="true" />
                  </Link>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="t321-mkt-section t321-mkt-section--sunk">
        <div className="t321-mkt-container">
          <div className="t321-mkt-section__head">
            <span className="t321-mkt-eyebrow"><i className={page?.addonsHead?.icon || "fas fa-cogs"} /> {addonsEyebrow}</span>
            <h2 className="t321-mkt-h2">{addonsHeading}</h2>
            <p className="t321-mkt-lede">{addonsLede}</p>
          </div>
          <div className="t321-mkt-services__addons">
            {addons.map((a, i) => {
              const href = a.linkHref || "#";
              const inner = (
                <>
                  <span className="t321-mkt-services__addon-icon"><i className={a.icon || "fas fa-circle"} /></span>
                  <h3 className="t321-mkt-h3">{a.title}</h3>
                  <p>{a.body}</p>
                  <span className="t321-mkt-services__addon-link">{a.linkLabel || "Learn more"} <i className="fas fa-arrow-right" /></span>
                </>
              );
              return a.linkHref ? (
                <Link key={i} href={href} className="t321-mkt-services__addon t321-mkt-card t321-mkt-card--hover">
                  {inner}
                </Link>
              ) : (
                <div key={i} className="t321-mkt-services__addon t321-mkt-card">{inner}</div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="t321-mkt-section t321-mkt-section--ink">
        <div className="t321-mkt-container t321-mkt-services__cta">
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

import Link from "next/link";
import { getSiteSettings, getAboutPage } from "@/lib/sanity";
import "./about.css";

export const metadata = {
  title: "About",
  description: "The team and mission behind Train 321.",
  alternates: { canonical: "/about" }
};

export default async function AboutPage() {
  const [settings, page] = await Promise.all([
    getSiteSettings(),
    getAboutPage()
  ]);
  const companyStats = settings.companyStats || [];

  // Hardcoded fallbacks for first render before the doc exists.
  const heroEyebrow = page?.heroEyebrow || "Our story";
  const heroHeading = page?.heroHeading || "Compliance training shouldn't feel like a tax.";
  const heroLede =
    page?.heroLede ||
    "We started Train 321 in 2018 because the alternatives felt built for lawyers, not for line cooks. Six years later, we've issued over 500,000 certificates to teams who actually finished the course.";

  const storyEyebrow = page?.storyHead?.eyebrow || "The mission";
  const storyHeading = page?.storyHead?.heading || "Make training so good, teams finish it";
  const storyParagraphs = page?.storyParagraphs?.length
    ? page.storyParagraphs
    : [
        "The hospitality industry spends billions of dollars a year on compliance training that nobody watches. Vendors produce 1997-era slideshows, teams click through on autopilot, and the paperwork gets filed. Then an inspector shows up, and the only thing that's actually changed is a folder full of certificates.",
        "We're building the other thing. Short, direct, written by people who worked the line. Mobile-first because our learners are taking it on their phone between a prep shift and a dinner rush. Updated the day a law changes — not the quarter after.",
        "That's our whole thesis. If we can make training so good that people actually learn from it, compliance takes care of itself."
      ];

  const pillarsEyebrow = page?.pillarsHead?.eyebrow || "What we believe";
  const pillarsHeading =
    page?.pillarsHead?.heading || "Three things we refuse to compromise on";
  const pillars = page?.pillars?.length
    ? page.pillars
    : [
        {
          icon: "fas fa-microscope",
          tone: "accent",
          title: "Content accuracy",
          body: "Every course is written by a subject-matter expert and reviewed annually. When laws change, our courses change the same week. No ghost-written freelance copy; no auto-translated modules."
        },
        {
          icon: "fas fa-mobile-alt",
          tone: "warn",
          title: "Learner experience",
          body: "If a cook can't finish a course on their phone during prep, we've failed. Every course is playable in 15-minute chunks, saves progress automatically, and works on a $80 Android with a cracked screen."
        },
        {
          icon: "fas fa-dollar-sign",
          tone: "positive",
          title: "Pricing transparency",
          body: "No \"contact us for pricing.\" No per-feature upsells. You see the price on every course page, and volume discounts apply automatically."
        }
      ];

  const cta = page?.bottomCta;
  const ctaHeading = cta?.heading || "Want to see how we work?";
  const ctaLede =
    cta?.lede ||
    "Book a 20-minute demo. We'll show you the platform with your courses already loaded.";
  const ctaPrimaryLabel = cta?.primaryCta?.label || "Book a demo";
  const ctaPrimaryHref = cta?.primaryCta?.to || "/demo";
  const ctaSecondaryLabel = cta?.secondaryCta?.label || "Contact us";
  const ctaSecondaryHref = cta?.secondaryCta?.to || "/contact";

  return (
    <div className="t321-mkt-about">
      <section className="t321-mkt-about__hero">
        <div className="t321-mkt-container">
          <span className="t321-mkt-eyebrow"><i className="fas fa-users" /> {heroEyebrow}</span>
          <h1 className="t321-mkt-h1">{heroHeading}</h1>
          <p className="t321-mkt-lede">{heroLede}</p>
        </div>
      </section>

      <section className="t321-mkt-section">
        <div className="t321-mkt-container t321-mkt-about__story">
          <div className="t321-mkt-about__story-body">
            <span className="t321-mkt-eyebrow">{storyEyebrow}</span>
            <h2 className="t321-mkt-h2">{storyHeading}</h2>
            {storyParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <aside className="t321-mkt-about__stats" aria-label="Company stats">
            {companyStats.map((s) => (
              <div key={s.label} className="t321-mkt-about__stat">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </aside>
        </div>
      </section>

      <section className="t321-mkt-section t321-mkt-section--sunk">
        <div className="t321-mkt-container">
          <div className="t321-mkt-section__head">
            <span className="t321-mkt-eyebrow"><i className={page?.pillarsHead?.icon || "fas fa-compass"} /> {pillarsEyebrow}</span>
            <h2 className="t321-mkt-h2">{pillarsHeading}</h2>
          </div>
          <div className="t321-mkt-about__pillars">
            {pillars.map((p, i) => (
              <article key={i} className="t321-mkt-about__pillar t321-mkt-card">
                <span className={`t321-mkt-about__pillar-icon t321-mkt-about__pillar-icon--${p.tone || "accent"}`}>
                  <i className={p.icon || "fas fa-check-circle"} />
                </span>
                <h3 className="t321-mkt-h3">{p.title}</h3>
                <p>{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="t321-mkt-section t321-mkt-section--ink">
        <div className="t321-mkt-container t321-mkt-about__cta">
          <div>
            <h2 className="t321-mkt-h2">{ctaHeading}</h2>
            <p className="t321-mkt-lede">{ctaLede}</p>
          </div>
          <div className="t321-mkt-about__cta-actions">
            <Link href={ctaPrimaryHref} className="t321-mkt-btn t321-mkt-btn--accent t321-mkt-btn--lg">
              {ctaPrimaryLabel}
            </Link>
            <Link href={ctaSecondaryHref} className="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg">
              {ctaSecondaryLabel}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { getMarketplaceCatalog, type MarketplaceCourse } from "@/lib/newFeatures";
import { getTestimonials, getFaqGroups, getSiteSettings, type Testimonial, type FaqItem } from "@/lib/sanity";
import CoursesV9, { type V9Course } from "./CoursesV9";
import TestimonialsV9 from "./TestimonialsV9";
import "./marketing-v9.css";

// "Get started" landing page: an advanced, LMS-style storefront. Courses come
// from the marketplace catalog (same source as /catalog) so they carry prices
// and buyable ids — the cards add straight to the cart. A minimal landing
// header (logo + one CTA), noindex for now.
export const metadata: Metadata = {
  title: "Get started — food, alcohol & workplace training | Train 321",
  description:
    "Browse ANSI-accredited food, alcohol and workplace compliance courses and add them to your cart. Finish online in about an hour, certificate the same day.",
  alternates: { canonical: "/marketing-v9" },
  robots: { index: false, follow: true }
};

const CATALOG_HREF = "/catalog";

type Stat = { value: string; label: string };
const FALLBACK_STATS: Stat[] = [
  { value: "50,000+", label: "Workers certified" },
  { value: "4.9/5", label: "Learner rating" },
  { value: "50", label: "States accepted" },
  { value: "~1 hr", label: "Average completion" }
];

const BENEFITS = [
  { icon: "fas fa-shield-halved", title: "ANSI-accredited training", body: "Nationally recognized courses accepted by regulators in all 50 states." },
  { icon: "fas fa-certificate", title: "Same-day certificate", body: "Pass the exam and download your official certificate instantly." },
  { icon: "fas fa-users", title: "Train your whole team", body: "Enroll staff in bulk and track every certificate in one dashboard." }
];

const STEPS = [
  { n: 1, title: "Choose your course", body: "Pick the food safety, alcohol safety, or workplace training you need for work." },
  { n: 2, title: "Train online", body: "Finish on your phone or computer in about an hour, in English or Spanish." },
  { n: 3, title: "Get your certificate", body: "Pass the course and download your certificate the moment you are done." }
];

// Collapse state variants of the same course into one representative card,
// preferring a nationwide version when one exists.
function dedupeByName(list: MarketplaceCourse[]): MarketplaceCourse[] {
  const seen = new Map<string, MarketplaceCourse>();
  for (const c of list) {
    const existing = seen.get(c.name);
    if (!existing || (existing.stateLabel && !c.stateLabel)) seen.set(c.name, c);
  }
  return [...seen.values()];
}

export default async function GetStartedLanding() {
  let courses: MarketplaceCourse[] = [];
  let categories: Array<{ id: number; name: string }> = [];
  let testimonials: Testimonial[] = [];
  let faqs: FaqItem[] = [];
  let stats: Stat[] = [];

  try {
    const catalog = await getMarketplaceCatalog();
    courses = catalog.courses;
    categories = catalog.categories.map((c) => ({ id: c.id, name: c.name }));
  } catch { /* storefront unreachable: the grid just won't render */ }
  try { testimonials = await getTestimonials(); } catch { /* skip social proof */ }
  try { const g = await getFaqGroups(); faqs = (g[0]?.items || []).slice(0, 6); } catch { /* skip faq */ }
  try { const s = await getSiteSettings(); stats = s.companyStats?.length ? s.companyStats : FALLBACK_STATS; } catch { stats = FALLBACK_STATS; }

  const catName = new Map(categories.map((c) => [c.id, c.name]));
  const flat: V9Course[] = dedupeByName(courses).map((c) => ({
    ...c,
    catLabel: (c.categoryId != null && catName.get(c.categoryId)) || "More courses"
  }));
  const labels: string[] = [];
  for (const c of categories) if (flat.some((f) => f.catLabel === c.name)) labels.push(c.name);
  if (flat.some((f) => f.catLabel === "More courses")) labels.push("More courses");

  const quotes = (testimonials.filter((t) => t.featured).length ? testimonials.filter((t) => t.featured) : testimonials).slice(0, 6);

  return (
    <div className="t321-gs">

      {/* Landing page: hide the full site header/footer and use a minimal one. */}
      <style>{`.t321-mkt-header,.t321-mkt-footer{display:none !important;}`}</style>

      {/* ── Minimal landing header (logo + one CTA, no nav) ────────────── */}
      <header className="gs-topbar">
        <div className="gs-container gs-topbar__inner">
          <Link href="/" className="gs-topbar__brand" aria-label="Train 321 home">
            <img src="/img/logos/train321_logo.png" alt="Train 321" />
          </Link>
          <Link href={CATALOG_HREF} className="gs-btn gs-btn--primary gs-topbar__cta">Browse all courses <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
        </div>
      </header>

      {/* ── Hero (centered course finder) ──────────────────────────────── */}
      <section className="gs-hero">
        {/* Decorative accents only — aria-hidden and non-interactive so they
            never block the finder, buttons, or any clicks. */}
        <span className="gs-hero__deco gs-hero__deco--1" aria-hidden="true"><i className="fas fa-id-badge" /></span>
        <span className="gs-hero__deco gs-hero__deco--2" aria-hidden="true"><i className="fas fa-certificate" /></span>
        <span className="gs-hero__deco gs-hero__deco--3" aria-hidden="true"><i className="fas fa-graduation-cap" /></span>
        <span className="gs-hero__deco gs-hero__deco--4" aria-hidden="true"><i className="fas fa-paper-plane" /></span>
        <span className="gs-hero__deco gs-hero__deco--5" aria-hidden="true"><i className="fas fa-award" /></span>
        <span className="gs-hero__deco gs-hero__deco--6" aria-hidden="true"><i className="fas fa-star" /></span>
        <span className="gs-hero__deco gs-hero__deco--7" aria-hidden="true"><i className="fas fa-shield-halved" /></span>
        <span className="gs-hero__deco gs-hero__deco--8" aria-hidden="true"><i className="fas fa-clipboard-check" /></span>
        <div className="gs-container gs-hero__center">
          <div className="gs-hero__rating">
            <span className="gs-stars" aria-hidden="true">★★★★★</span>
            <span><strong>4.9/5</strong> from 50,000+ learners</span>
          </div>
          <h1>Find your required training and <em>get certified today.</em></h1>
          <p className="gs-lede">Food, alcohol, and workplace courses you finish on your phone in about an hour. Certificate the same day, accepted in all 50 states.</p>
          <div className="gs-finder">
            <span className="gs-finder__label"><i className="fas fa-magnifying-glass" aria-hidden="true" /> I need</span>
            <div className="gs-finder__chips">
              <a href="#courses" className="gs-finder__chip">Food safety</a>
              <a href="#courses" className="gs-finder__chip">Alcohol &amp; service</a>
              <a href="#courses" className="gs-finder__chip">Workplace</a>
            </div>
            <a href="#courses" className="gs-btn gs-btn--primary gs-finder__go">Browse courses <i className="fas fa-arrow-right" aria-hidden="true" /></a>
          </div>
          <ul className="gs-trust">
            <li><i className="fas fa-shield-halved" aria-hidden="true" /> ANSI-accredited</li>
            <li><i className="fas fa-flag-usa" aria-hidden="true" /> Accepted in 50 states</li>
            <li><i className="fas fa-bolt" aria-hidden="true" /> Instant certificate</li>
          </ul>
        </div>
      </section>

      {/* ── Stat band ──────────────────────────────────────────────────── */}
      <div className="gs-stats">
        <div className="gs-container gs-stats__grid">
          {stats.slice(0, 4).map((s, i) => (
            <div key={i} className="gs-stat"><div className="gs-stat__n">{s.value}</div><div className="gs-stat__l">{s.label}</div></div>
          ))}
        </div>
      </div>

      {/* ── Benefits ───────────────────────────────────────────────────── */}
      <section className="gs-section">
        <div className="gs-container">
          <div className="gs-head">
            <span className="gs-pill"><i className="fas fa-star" aria-hidden="true" /> Why Train 321</span>
            <h2>Built for busy teams</h2>
            <p className="gs-lede">Everything hospitality and service workers need to get certified and stay compliant.</p>
          </div>
          <div className="gs-benefits">
            {BENEFITS.map((b) => (
              <div key={b.title} className="gs-benefit">
                <span className="gs-benefit__icon"><i className={b.icon} aria-hidden="true" /></span>
                <h3>{b.title}</h3>
                <p>{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Courses by category (dynamic, add to cart) ─────────────────── */}
      <section className="gs-section gs-sunk" id="courses">
        <div className="gs-container">
          <div className="gs-head">
            <span className="gs-pill"><i className="fas fa-graduation-cap" aria-hidden="true" /> Our courses</span>
            <h2>Pick your training</h2>
            <p className="gs-lede">Add a course to your cart and check out in minutes. Every course is online and issues a certificate the moment you pass.</p>
          </div>

          {flat.length > 0 ? (
            <CoursesV9 courses={flat} categories={labels} />
          ) : (
            <p className="gs-lede" style={{ textAlign: "center" }}>
              Browse the <Link href={CATALOG_HREF} className="gs-inline-link">full catalog</Link> to see every course.
            </p>
          )}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section className="gs-section">
        <div className="gs-container">
          <div className="gs-head">
            <span className="gs-pill"><i className="fas fa-wand-magic-sparkles" aria-hidden="true" /> How it works</span>
            <h2>Certified in three steps</h2>
          </div>
          <div className="gs-steps">
            {STEPS.map((s) => (
              <div key={s.n} className="gs-step">
                <span className="gs-step__num">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────────── */}
      {quotes.length > 0 && (
        <section className="gs-section gs-sunk">
          <div className="gs-container">
            <div className="gs-head">
              <span className="gs-pill"><i className="fas fa-quote-right" aria-hidden="true" /> What learners say</span>
              <h2>Trusted by thousands of workers</h2>
            </div>
            <TestimonialsV9 items={quotes} />
          </div>
        </section>
      )}

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      {faqs.length > 0 && (
        <section className="gs-section">
          <div className="gs-container gs-faq">
            <div className="gs-head">
              <span className="gs-pill"><i className="fas fa-circle-question" aria-hidden="true" /> Good to know</span>
              <h2>Questions, answered</h2>
            </div>
            {faqs.map((f, i) => (
              <details key={i} className="gs-qa" open={i === 0}>
                <summary className="gs-qa__q">
                  <span>{f.q}</span>
                  <i className="fas fa-chevron-down gs-qa__chev" aria-hidden="true" />
                </summary>
                <p className="gs-qa__a">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <section className="gs-final">
        <div className="gs-container">
          <span className="gs-pill"><i className="fas fa-bolt" aria-hidden="true" /> Ready when you are</span>
          <h2 style={{ marginTop: "14px" }}>Get certified before your next shift</h2>
          <p>Pick your course and finish online today.</p>
          <div className="gs-cta-row">
            <a href="#courses" className="gs-btn gs-btn--primary">Browse courses <i className="fas fa-arrow-right" aria-hidden="true" /></a>
          </div>
        </div>
      </section>

      {/* ── Slim footer ────────────────────────────────────────────────── */}
      <footer className="gs-footer">
        <div className="gs-container">
          <div className="gs-fbrand">Train 321</div>
          <p>Food handler, alcohol and compliance training. <a href="tel:5613257300">561-325-7300</a></p>
          <p className="gs-foot-fine">© 2026 Train 321. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { getCourses, type Course } from "@/lib/sanity";
import "./marketing-v9.css";

// "Get started" landing page hub: a professional, sectioned page that lists the
// courses grouped by category. The course cards are DYNAMIC (getCourses from
// Sanity), so adding a course in Studio automatically adds it here. A normal
// site page (keeps the site header and footer). noindex keeps it out of search
// for now.
export const metadata: Metadata = {
  title: "Get started — food, alcohol & workplace training | Train 321",
  description:
    "Browse ANSI-accredited food, alcohol and workplace compliance courses. Finish online in about an hour, certificate the same day, accepted in all 50 states.",
  alternates: { canonical: "/marketing-v9" },
  robots: { index: false, follow: true }
};

const CATALOG_HREF = "/catalog";

// Category sections, in display order. Adding a course to Studio under one of
// these categories drops it straight into the matching section below.
const GROUPS: Array<{ key: Course["category"]; label: string; icon: string }> = [
  { key: "food", label: "Food safety", icon: "fas fa-utensils" },
  { key: "alcohol", label: "Alcohol & service", icon: "fas fa-wine-glass-alt" },
  { key: "hr", label: "Workplace compliance", icon: "fas fa-users-cog" }
];

const STEPS = [
  { n: 1, title: "Choose your course", body: "Pick the food safety, alcohol safety, or workplace training you need for work." },
  { n: 2, title: "Train online", body: "Finish on your phone or computer in about an hour, in English or Spanish." },
  { n: 3, title: "Get your certificate", body: "Pass the course and download your certificate the moment you are done." }
];

function CourseCard({ course }: { course: Course }) {
  return (
    <Link href={`/courses/${course.slug}`} className={`gs-course gs-course--${course.color || "neutral"}`}>
      <span className="gs-course__media">
        {course.image ? (
          <img src={course.image} alt="" />
        ) : (
          <span className="gs-course__icon"><i className={course.icon || "fas fa-certificate"} aria-hidden="true" /></span>
        )}
      </span>
      <span className="gs-course__body">
        <span className="gs-course__title">{course.title}</span>
        {(course.tagline || course.summary) && (
          <span className="gs-course__desc">{course.tagline || course.summary}</span>
        )}
        <span className="gs-course__link">View course <i className="fas fa-arrow-right" aria-hidden="true" /></span>
      </span>
    </Link>
  );
}

export default async function GetStartedLanding() {
  let courses: Course[] = [];
  try {
    courses = await getCourses();
  } catch {
    /* if the backend is unreachable the page still renders without the grid */
  }

  const known = new Set(GROUPS.map((g) => g.key));
  const sections = GROUPS.map((g) => ({ ...g, items: courses.filter((c) => c.category === g.key) })).filter(
    (g) => g.items.length > 0
  );
  const other = courses.filter((c) => !c.category || !known.has(c.category));

  return (
    <div className="t321-gs">

      {/* Landing page: hide the full site header/footer and use a minimal one.
          This style ships only in this route's HTML and unmounts on navigation. */}
      <style>{`.t321-mkt-header,.t321-mkt-footer{display:none !important;}`}</style>

      {/* ── Minimal landing header (logo + one CTA, no nav) ────────────── */}
      <header className="gs-topbar">
        <div className="gs-container gs-topbar__inner">
          <Link href="/" className="gs-topbar__brand" aria-label="Train 321 home">
            <img src="/img/logos/train321_logo.png" alt="Train 321" />
          </Link>
          <Link href={CATALOG_HREF} className="gs-btn gs-btn--primary gs-topbar__cta">
            Browse all courses <i className="fas fa-arrow-right" aria-hidden="true" />
          </Link>
        </div>
      </header>

      {/* ── Hero (two-column landing style) ────────────────────────────── */}
      <section className="gs-hero">
        <div className="gs-container gs-hero__grid">
          <div className="gs-hero__copy">
            <span className="gs-pill"><i className="fas fa-bolt" aria-hidden="true" /> Welcome to Train 321</span>
            <h1>Get certified for work, <em>online.</em></h1>
            <p className="gs-lede">Food, alcohol, and workplace courses you finish on your phone in about an hour. Certificate the same day, accepted in all 50 states.</p>
            <div className="gs-cta-row">
              <Link href={CATALOG_HREF} className="gs-btn gs-btn--primary">Browse all courses <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
              <a href="#courses" className="gs-btn gs-btn--ghost">See courses</a>
            </div>
            <ul className="gs-trust">
              <li><i className="fas fa-shield-halved" aria-hidden="true" /> ANSI-accredited</li>
              <li><i className="fas fa-flag-usa" aria-hidden="true" /> Accepted in 50 states</li>
              <li><i className="fas fa-bolt" aria-hidden="true" /> Instant certificate</li>
            </ul>
          </div>
          <div className="gs-hero__media">
            <img src="/img/hero-restaurant.png" alt="Food service team at work" />
          </div>
        </div>
      </section>

      {/* ── Courses by category (dynamic) ──────────────────────────────── */}
      <section className="gs-section" id="courses">
        <div className="gs-container">
          <div className="gs-head">
            <span className="gs-pill"><i className="fas fa-graduation-cap" aria-hidden="true" /> Our courses</span>
            <h2>Pick your training</h2>
            <p className="gs-lede">Every course is online, mobile-friendly, and issues a certificate the moment you pass.</p>
          </div>

          {sections.map((g) => (
            <div key={g.key} className="gs-cat">
              <h3 className="gs-cat__title"><i className={g.icon} aria-hidden="true" /> {g.label}</h3>
              <div className="gs-courses">
                {g.items.map((c) => <CourseCard key={c.slug} course={c} />)}
              </div>
            </div>
          ))}

          {other.length > 0 && (
            <div className="gs-cat">
              <h3 className="gs-cat__title"><i className="fas fa-layer-group" aria-hidden="true" /> More courses</h3>
              <div className="gs-courses">
                {other.map((c) => <CourseCard key={c.slug} course={c} />)}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section className="gs-section gs-sunk">
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

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <section className="gs-final">
        <div className="gs-container">
          <span className="gs-pill"><i className="fas fa-bolt" aria-hidden="true" /> Ready when you are</span>
          <h2 style={{ marginTop: "14px" }}>Get certified before your next shift</h2>
          <p>Pick your course and finish online today.</p>
          <div className="gs-cta-row">
            <Link href={CATALOG_HREF} className="gs-btn gs-btn--primary">Browse all courses <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
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

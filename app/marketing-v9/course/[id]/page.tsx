import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMarketplaceCatalog, toBlurb, type MarketplaceCourse } from "@/lib/newFeatures";
import "../../marketing-v9.css";

// Dynamic per-course landing page for the v9 flow — one template that works for
// ANY course by its marketplace id (e.g. /marketing-v9/course/123). An email /
// ad lands here; "Get started" goes straight to the course's checkout page.
// Isolated under /marketing-v9: it never touches the live site or its cart.

export const dynamicParams = true;

async function findCourse(id: number): Promise<{ course: MarketplaceCourse; catLabel: string } | null> {
  try {
    const { courses, categories } = await getMarketplaceCatalog();
    const course = courses.find((c) => c.id === id);
    if (!course) return null;
    const catLabel =
      (course.categoryId != null && categories.find((k) => k.id === course.categoryId)?.name) || "Compliance training";
    return { course, catLabel };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const found = await findCourse(Number(id));
  if (!found) return { title: "Course | Train 321", robots: { index: false, follow: false } };
  return {
    title: `${found.course.name} — get certified today | Train 321`,
    description: `Enroll in ${found.course.name}. Online, about an hour, official certificate the same day.`,
    robots: { index: false, follow: true }
  };
}

const BENEFITS = [
  { icon: "fas fa-laptop", title: "100% online", body: "Finish on your phone or computer, in English or Spanish." },
  { icon: "fas fa-certificate", title: "Same-day certificate", body: "Pass the exam and download your official certificate instantly." },
  { icon: "fas fa-shield-halved", title: "ANSI-accredited", body: "Nationally recognized and accepted by regulators in all 50 states." }
];

const STEPS = [
  { n: 1, title: "Get started", body: "Create your account or sign in — it takes a minute." },
  { n: 2, title: "Train online", body: "Work through the course at your own pace, start to finish." },
  { n: 3, title: "Get certified", body: "Pass the course and download your certificate right away." }
];

export default async function CourseLanding({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) notFound();

  const found = await findCourse(numId);
  if (!found) notFound();
  const { course, catLabel } = found;
  const blurb = course.description ? toBlurb(course.description, 220) : "";
  const checkoutHref = `/marketing-v9/course/${course.id}/checkout`;

  return (
    <div className="t321-gs">
      {/* Landing page: hide the full site header/footer, use a minimal one. */}
      <style>{`.t321-mkt-header,.t321-mkt-footer{display:none !important;}`}</style>

      <header className="gs-topbar">
        <div className="gs-container gs-topbar__inner">
          <Link href="/" className="gs-topbar__brand" aria-label="Train 321 home">
            <img src="/img/logos/train321_logo.png" alt="Train 321" />
          </Link>
          <Link href="/marketing-v9" className="gs-btn gs-btn--ghost gs-topbar__cta">All courses</Link>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="gs-clp-hero">
        <div className="gs-container gs-clp-hero__grid">
          <div className="gs-clp-hero__copy">
            <span className="gs-pill"><i className="fas fa-graduation-cap" aria-hidden="true" /> {catLabel}</span>
            <h1>{course.name}</h1>
            {course.stateLabel && (
              <span className="gs-clp-hero__state"><i className="fas fa-location-dot" aria-hidden="true" /> {course.stateLabel}</span>
            )}
            {blurb && <p className="gs-lede">{blurb}</p>}
            <div className="gs-clp-hero__cta">
              <Link href={checkoutHref} className="gs-btn gs-btn--primary gs-btn--lg">Get started <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
              {course.price > 0 && (
                <span className="gs-clp-hero__price">From <strong>${course.price}</strong><span>/seat</span></span>
              )}
            </div>
            <ul className="gs-trust">
              <li><i className="fas fa-shield-halved" aria-hidden="true" /> ANSI-accredited</li>
              <li><i className="fas fa-flag-usa" aria-hidden="true" /> Accepted in 50 states</li>
              <li><i className="fas fa-bolt" aria-hidden="true" /> Instant certificate</li>
            </ul>
          </div>
          <div className="gs-clp-hero__media">
            {course.image ? (
              <img src={course.image} alt="" />
            ) : (
              <span className="gs-clp-hero__ic"><i className="fas fa-certificate" aria-hidden="true" /></span>
            )}
          </div>
        </div>
      </section>

      {/* ── What's included ────────────────────────────────────────────── */}
      <section className="gs-section">
        <div className="gs-container">
          <div className="gs-head">
            <span className="gs-pill"><i className="fas fa-star" aria-hidden="true" /> What you get</span>
            <h2>Everything you need to get certified</h2>
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
          <h2 style={{ marginTop: "14px" }}>Start {course.name} today</h2>
          <p>Finish online and get your certificate the same day.</p>
          <div className="gs-cta-row">
            <Link href={checkoutHref} className="gs-btn gs-btn--primary gs-btn--lg">Get started <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

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

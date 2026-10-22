import type { Metadata } from "next";
import Link from "next/link";
import { getCourse } from "@/lib/sanity";
import CourseCertificate from "@/components/CourseCertificate";
import "./marketing-v8.css";

// Standalone email-marketing landing page for the California RBS course
// (Responsible Beverage Service). A new, isolated route — nothing imports it
// and it imports no existing page, so it can't affect the rest of the site.
// noindex keeps it out of search (the page is for campaign traffic only).
export const metadata: Metadata = {
  title: "California RBS certification, 100% online | Train 321",
  description:
    "ABC-approved Responsible Beverage Service training for California alcohol servers and managers. Self-paced online course that prepares you for the mandatory ABC exam.",
  alternates: { canonical: "/marketing-v8" },
  robots: { index: false, follow: true }
};

// ── Campaign settings — edit these in one place ──────────────────────────
const CTA_HREF = "/courses/rbs"; // where every CTA button goes
const PHONE = "561-325-7300";
// Social-proof figures. PLACEHOLDERS — replace with real numbers before launch.
const STAT_CERTIFIED = "40,000+"; // PLACEHOLDER - confirm before launch
const STAT_RATING = "4.8/5"; // PLACEHOLDER - confirm before launch
const STAT_REVIEWS = "1,900+"; // PLACEHOLDER - confirm before launch

const STEPS = [
  { n: "1", icon: "fas fa-id-card", title: "Register with CA ABC", body: "Get your server ID from the ABC portal." },
  { n: "2", icon: "fas fa-graduation-cap", title: "Take the training", body: "Finish our online course at your own pace." },
  { n: "3", icon: "fas fa-award", title: "Pass the ABC exam", body: "Sit the mandatory exam and get certified." }
];

const FEATURES = [
  { icon: "fas fa-circle-check", title: "ABC-approved", body: "Meets California ABC requirements for RBS." },
  { icon: "fas fa-clipboard-check", title: "Built for the exam", body: "Lessons map to the ABC exam so you pass." },
  { icon: "fas fa-laptop", title: "Online, self-paced", body: "Start, pause, and finish on any device." }
];

const FAQS = [
  { icon: "fas fa-circle-check", q: "Is this course ABC approved?", a: "Yes, it is approved by the California ABC." },
  { icon: "fas fa-id-card", q: "Do I register with the ABC first?", a: "Yes, you need a server ID before the exam." },
  { icon: "fas fa-clock", q: "How long does it take?", a: "Most servers finish in a couple of hours." }
];

export default async function CaliforniaRbsLanding() {
  let course = null;
  try {
    course = await getCourse("rbs");
  } catch {}

  return (
    <div className="t321-mlh">

      {/* Email landing page: hide the global site header + footer. This style
          ships only in this route's HTML and unmounts on navigation away, so
          no other page is affected. The page renders its own minimal footer. */}
      <style>{`.t321-mkt-header,.t321-mkt-footer{display:none !important;}`}</style>

      {/* ── Split-screen two-tone hero ─────────────────────────────────── */}
      <section className="mlh-hero">
        <div className="mlh-hero-panel">
          <div className="mlh-hero-inner">
            <span className="mlh-eyebrow"><i className="fas fa-martini-glass" aria-hidden="true" /> California RBS certification</span>
            <h1>Get RBS certified, <em>100% online</em></h1>
            <p className="mlh-subhead">ABC-approved training that prepares California servers to pass the mandatory exam.</p>
            <Link href={CTA_HREF} className="mlh-btn mlh-btn--primary">Start the RBS course <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
            <div className="mlh-micro">
              <span><i className="fas fa-check" aria-hidden="true" /> ABC-approved</span>
              <span><i className="fas fa-check" aria-hidden="true" /> Self-paced online</span>
              <span><i className="fas fa-check" aria-hidden="true" /> Exam preparation</span>
            </div>
          </div>
        </div>
        <div className="mlh-hero-media">
          <img src={course?.image || "/img/server.jpg"} alt={course?.title || "California RBS course"} />
        </div>
      </section>

      {/* ── Stepper: RBS in 3 steps ────────────────────────────────────── */}
      <section className="mlh-section mlh-sunk">
        <div className="mlh-container">
          <div className="mlh-head">
            <span className="mlh-pill"><i className="fas fa-list-ol" aria-hidden="true" /> The California process</span>
            <h2>RBS certification in 3 steps</h2>
          </div>
          <ol className="mlh-stepper">
            {STEPS.map((s) => (
              <li key={s.n} className="mlh-step">
                <span className="mlh-step-num">{s.n}</span>
                <span className="mlh-step-icon"><i className={s.icon} aria-hidden="true" /></span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
          <div className="mlh-step-cta">
            <Link href={CTA_HREF} className="mlh-btn mlh-btn--primary">Take the RBS training <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      {/* ── Feature row: why us ────────────────────────────────────────── */}
      <section className="mlh-section">
        <div className="mlh-container">
          <div className="mlh-head">
            <span className="mlh-pill"><i className="fas fa-star" aria-hidden="true" /> Why Train 321</span>
            <h2>Everything you need to get certified</h2>
          </div>
          <div className="mlh-feature-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="mlh-feature">
                <span className="mlh-feature-icon"><i className={f.icon} aria-hidden="true" /></span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Certificate preview ────────────────────────────────────────── */}
      <section className="mlh-section mlh-sunk">
        <div className="mlh-narrow">
          <div className="mlh-head">
            <span className="mlh-pill"><i className="fas fa-certificate" aria-hidden="true" /> Your certificate</span>
            <h2>Proof of training to keep on file</h2>
            <p className="mlh-lede">Download your certificate the moment you finish the course.</p>
          </div>
          <div className="mlh-cert">
            <CourseCertificate courseTitle="California Responsible Beverage Service" showExpiration={false} />
          </div>
        </div>
      </section>

      {/* ── Trust strip ────────────────────────────────────────────────── */}
      <div className="mlh-trust">
        <div className="mlh-container mlh-trust-grid">
          <div className="mlh-trust-item"><div className="mlh-trust-n">{STAT_CERTIFIED}</div><div className="mlh-trust-l">Servers trained</div></div>
          <div className="mlh-trust-item"><div className="mlh-trust-n">ABC</div><div className="mlh-trust-l">Approved training</div></div>
          <div className="mlh-trust-item"><div className="mlh-trust-n">{STAT_RATING}</div><div className="mlh-trust-l">Learner rating</div></div>
          <div className="mlh-trust-item"><div className="mlh-trust-n">{STAT_REVIEWS}</div><div className="mlh-trust-l">Reviews</div></div>
        </div>
      </div>

      {/* ── FAQ: California specifics ──────────────────────────────────── */}
      <section className="mlh-section mlh-sunk">
        <div className="mlh-narrow">
          <div className="mlh-head">
            <span className="mlh-pill"><i className="fas fa-circle-question" aria-hidden="true" /> California specifics</span>
            <h2>Questions, answered</h2>
          </div>
          <div className="mlh-faq">
            {FAQS.map((f) => (
              <div key={f.q} className="mlh-qa">
                <h3><i className={f.icon} aria-hidden="true" /> {f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <div className="mlh-final">
        <div className="mlh-container">
          <span className="mlh-pill mlh-pill--dark"><i className="fas fa-martini-glass" aria-hidden="true" /> Ready when you are</span>
          <h2>Get RBS certified before your next shift</h2>
          <p>Join {STAT_CERTIFIED} California servers who trained the easy way.</p>
          <Link href={CTA_HREF} className="mlh-btn mlh-btn--primary">Start the RBS course <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
          <div className="mlh-micro mlh-micro--dark">
            <span><i className="fas fa-lock" aria-hidden="true" /> Secure checkout</span>
            <span><i className="fas fa-circle-check" aria-hidden="true" /> ABC-approved</span>
          </div>
        </div>
      </div>

      {/* ── Footer (minimal, no nav) ───────────────────────────────────── */}
      <footer className="mlh-footer">
        <div className="mlh-container">
          <div className="mlh-fbrand">Train 321</div>
          <p style={{ margin: "8px 0 0" }}>Food handler, alcohol, and compliance training. <a href={`tel:${PHONE.replace(/\D/g, "")}`}>{PHONE}</a></p>
          <p style={{ margin: "6px 0 0", color: "#6c8498" }}>© 2026 Train 321. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}

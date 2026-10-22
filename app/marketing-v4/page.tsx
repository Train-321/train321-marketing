import type { Metadata } from "next";
import Link from "next/link";
import CourseCertificate from "@/components/CourseCertificate";
import "./marketing-v4.css";

// Standalone email-marketing landing page for the Sexual Harassment Prevention
// course. A new, isolated route — nothing imports it and it imports no existing
// page, so it can't affect the rest of the site. noindex keeps it out of search
// (the page is for campaign traffic only).
export const metadata: Metadata = {
  title: "Sexual harassment prevention training online | Train 321",
  description:
    "Online sexual harassment prevention training for employees and supervisors. Satisfies state mandates like California SB 1343, New York, and Illinois. Certificate included.",
  alternates: { canonical: "/marketing-v4" },
  robots: { index: false, follow: true }
};

// ── Campaign settings — edit these in one place ──────────────────────────
const CTA_HREF = "/courses/sexual-harassment"; // where every CTA goes
const PRICE_INDIVIDUAL = "$19"; // PLACEHOLDER - confirm before launch
const PRICE_TEAM = "$12"; // PLACEHOLDER - confirm before launch (per seat, bulk)
// Social-proof and scope figures. PLACEHOLDERS — replace with real numbers before launch.
const STAT_TRAINED = "250,000+"; // PLACEHOLDER - confirm before launch
const STAT_EMPLOYERS = "8,000+"; // PLACEHOLDER - confirm before launch
const STAT_STATES = "All 50"; // PLACEHOLDER - confirm before launch

const COVERS = [
  {
    icon: "fas fa-eye",
    title: "Recognize harassment",
    body: "Identify quid pro quo and hostile work environment conduct, including subtle behavior that often goes unreported."
  },
  {
    icon: "fas fa-hand",
    title: "Prevent and respond",
    body: "Learn bystander steps, how to report concerns, and the protections against retaliation that apply to everyone."
  },
  {
    icon: "fas fa-scale-balanced",
    title: "Know the law",
    body: "Understand employer and employee responsibilities under federal and state law in plain, practical terms."
  },
  {
    icon: "fas fa-people-group",
    title: "Build a safer workplace",
    body: "Set clear expectations for respectful conduct so your whole team shares the same standard."
  }
];

const AUDIENCE = [
  {
    icon: "fas fa-user",
    title: "Employees",
    body: "Core training that helps staff recognize harassment, understand their rights, and know how to report concerns safely."
  },
  {
    icon: "fas fa-user-tie",
    title: "Supervisors and managers",
    body: "Extended coverage of the added duties managers carry: receiving complaints, preventing retaliation, and meeting manager-specific training rules."
  }
];

const STATES = [
  { code: "CA", note: "California SB 1343: employees and supervisors at employers with 5+ staff." },
  { code: "NY", note: "New York State and NYC: annual training for all employees." },
  { code: "IL", note: "Illinois: annual training under the Workplace Transparency Act." },
  { code: "CT", note: "Connecticut: employees and supervisors at covered employers." },
  { code: "WA", note: "Washington and more states with training requirements." }
];

const FAQS = [
  {
    icon: "fas fa-map-location-dot",
    q: "Does it meet my state's requirement?",
    a: "The course is built to satisfy common state mandates, including California SB 1343, New York, and Illinois. Confirm the version you need for your state before enrolling."
  },
  {
    icon: "fas fa-users",
    q: "What's the difference between employee and supervisor training?",
    a: "Employees get the core course. Supervisors get extended coverage of their added legal duties, which several states require separately."
  },
  {
    icon: "fas fa-clock",
    q: "How long does the training take?",
    a: "Most employees finish in about an hour. Supervisor training runs longer to cover the extra required topics. Pause and resume anytime."
  },
  {
    icon: "fas fa-file-arrow-down",
    q: "Do I get a certificate for my records?",
    a: "Yes. You download a completion certificate as soon as you finish, and employers can store every certificate in one place."
  }
];

export default function SexualHarassmentLanding() {
  return (
    <div className="t321-mld">

      {/* Email landing page: hide the global site header + footer. This style
          ships only in this route's HTML and unmounts on navigation away, so
          no other page is affected. */}
      <style>{`.t321-mkt-header,.t321-mkt-footer{display:none !important;}`}</style>

      {/* ── Hero (left-aligned, calm) ──────────────────────────────────── */}
      <header className="mld-hero">
        <div className="mld-wrap">
          <span className="mld-eyebrow"><i className="fas fa-shield-halved" aria-hidden="true" /> Compliance training</span>
          <h1>Sexual harassment prevention training, done right</h1>
          <p className="mld-lede">
            Online training for employees and supervisors that satisfies state requirements and helps your team build a safer, more respectful workplace.
          </p>
          <div className="mld-hero-actions">
            <Link href={CTA_HREF} className="mld-btn mld-btn--primary">Start training <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
            <Link href={CTA_HREF} className="mld-btn mld-btn--ghost">Train your team</Link>
          </div>
          <ul className="mld-hero-points">
            <li><i className="fas fa-check" aria-hidden="true" /> 100% online, any device</li>
            <li><i className="fas fa-check" aria-hidden="true" /> Employee and supervisor versions</li>
            <li><i className="fas fa-check" aria-hidden="true" /> Certificate on completion</li>
          </ul>
        </div>
      </header>

      {/* ── Trust strip ────────────────────────────────────────────────── */}
      <div className="mld-trust">
        <div className="mld-wrap mld-trust-grid">
          <div className="mld-trust-item"><span className="mld-trust-n">{STAT_TRAINED}</span><span className="mld-trust-l">People trained</span></div>
          <div className="mld-trust-item"><span className="mld-trust-n">{STAT_EMPLOYERS}</span><span className="mld-trust-l">Employers served</span></div>
          <div className="mld-trust-item"><span className="mld-trust-n">{STAT_STATES}</span><span className="mld-trust-l">States supported</span></div>
        </div>
      </div>

      {/* ── Editorial body: sticky rail + content stack ────────────────── */}
      <section className="mld-body">
        <div className="mld-wrap mld-body-grid">

          {/* Left: sticky rail */}
          <aside className="mld-rail">
            <div className="mld-rail-inner">
              <span className="mld-eyebrow"><i className="fas fa-book-open" aria-hidden="true" /> Course overview</span>
              <h2>Training that holds up to scrutiny</h2>
              <p className="mld-rail-summary">
                A clear, current course that meets training mandates and gives employees and supervisors the standard they need to prevent harassment at work.
              </p>
              <div className="mld-rail-img">
                <CourseCertificate courseTitle="Sexual Harassment Prevention Training" />
              </div>
              <Link href={CTA_HREF} className="mld-btn mld-btn--primary mld-btn--block">Start training <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
              <p className="mld-rail-note"><i className="fas fa-lock" aria-hidden="true" /> Certificate issued the moment you finish</p>
            </div>
          </aside>

          {/* Right: content blocks */}
          <div className="mld-content">

            <article className="mld-block">
              <h3><i className="fas fa-list-check" aria-hidden="true" /> What the training covers</h3>
              <p className="mld-block-intro">Practical, scenario-based lessons that stay focused on what people need to recognize and do.</p>
              <ul className="mld-covers">
                {COVERS.map((c) => (
                  <li key={c.title}>
                    <span className="mld-covers-ic"><i className={c.icon} aria-hidden="true" /></span>
                    <div>
                      <strong>{c.title}</strong>
                      <p>{c.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </article>

            <article className="mld-block">
              <h3><i className="fas fa-users" aria-hidden="true" /> Who needs it</h3>
              <p className="mld-block-intro">Separate coverage for staff and the managers who supervise them.</p>
              <div className="mld-audience">
                {AUDIENCE.map((a) => (
                  <div key={a.title} className="mld-audience-card">
                    <span className="mld-audience-ic"><i className={a.icon} aria-hidden="true" /></span>
                    <strong>{a.title}</strong>
                    <p>{a.body}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="mld-block">
              <h3><i className="fas fa-building-columns" aria-hidden="true" /> Meets state requirements</h3>
              <p className="mld-block-intro">
                Many states require regular sexual harassment prevention training. This course is built to satisfy common mandates.
              </p>
              <ul className="mld-states">
                {STATES.map((s) => (
                  <li key={s.code}>
                    <span className="mld-states-code">{s.code}</span>
                    <span className="mld-states-note">{s.note}</span>
                  </li>
                ))}
              </ul>
              <p className="mld-block-fine">Requirements vary by state and employer size. Confirm the version your organization needs before enrolling.</p>
            </article>

          </div>
        </div>
      </section>

      {/* ── Pricing (compact) ──────────────────────────────────────────── */}
      <section className="mld-pricing">
        <div className="mld-wrap">
          <div className="mld-pricing-head">
            <span className="mld-eyebrow"><i className="fas fa-tag" aria-hidden="true" /> Pricing</span>
            <h2>Train one person or your whole organization</h2>
          </div>
          <div className="mld-price-grid">
            <div className="mld-plan">
              <h3>Individual</h3>
              <p className="mld-plan-sub">For a single employee or supervisor</p>
              <p className="mld-plan-price">{PRICE_INDIVIDUAL} <span>/ course</span></p>
              <ul>
                <li><i className="fas fa-check" aria-hidden="true" /> Full prevention course</li>
                <li><i className="fas fa-check" aria-hidden="true" /> Employee or supervisor version</li>
                <li><i className="fas fa-check" aria-hidden="true" /> Completion certificate</li>
                <li><i className="fas fa-check" aria-hidden="true" /> Works on any device</li>
              </ul>
              <Link href={CTA_HREF} className="mld-btn mld-btn--ghost mld-btn--block">Start training</Link>
            </div>
            <div className="mld-plan mld-plan--business">
              <span className="mld-plan-tag">For employers</span>
              <h3>Business / Team</h3>
              <p className="mld-plan-sub">Bulk training for your staff</p>
              <p className="mld-plan-price">{PRICE_TEAM} <span>/ seat</span></p>
              <ul>
                <li><i className="fas fa-check" aria-hidden="true" /> Everything in Individual</li>
                <li><i className="fas fa-check" aria-hidden="true" /> Bulk employee enrollment</li>
                <li><i className="fas fa-check" aria-hidden="true" /> Progress and completion tracking</li>
                <li><i className="fas fa-check" aria-hidden="true" /> Certificates stored in one place</li>
              </ul>
              <Link href={CTA_HREF} className="mld-btn mld-btn--primary mld-btn--block">Train your team</Link>
            </div>
          </div>
          <p className="mld-price-fine">Prices shown are placeholders and subject to change before launch.</p>
        </div>
      </section>

      {/* ── FAQ (short) ────────────────────────────────────────────────── */}
      <section className="mld-faq-sec">
        <div className="mld-wrap mld-narrow">
          <span className="mld-eyebrow"><i className="fas fa-circle-question" aria-hidden="true" /> Good to know</span>
          <h2 className="mld-faq-title">Common questions</h2>
          <div className="mld-faq">
            {FAQS.map((f) => (
              <div key={f.q} className="mld-qa">
                <h3><i className={f.icon} aria-hidden="true" /> {f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quiet final CTA ────────────────────────────────────────────── */}
      <section className="mld-final">
        <div className="mld-wrap mld-narrow">
          <h2>Get your team trained and compliant</h2>
          <p>Join {STAT_EMPLOYERS} employers who train their people the straightforward way.</p>
          <Link href={CTA_HREF} className="mld-btn mld-btn--primary">Start training <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
        </div>
      </section>

      {/* ── Footer (minimal, no nav) ───────────────────────────────────── */}
      <footer className="mld-footer">
        <div className="mld-wrap">
          <div className="mld-fbrand">Train 321</div>
          <p>Workplace compliance and safety training.</p>
          <p className="mld-fcopy">© 2026 Train 321. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}

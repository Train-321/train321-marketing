import type { Metadata } from "next";
import Link from "next/link";
import { getCourse } from "@/lib/sanity";
import CourseCertificate from "@/components/CourseCertificate";
import "./marketing-v6.css";

// Standalone email-marketing landing page for the Security Host course. A new,
// isolated route — nothing imports it and it imports no existing page, so it
// can't affect the rest of the site. noindex keeps it out of search (the page
// is for campaign traffic only).
export const metadata: Metadata = {
  title: "Security host and door staff training online | Train 321",
  description:
    "Online security host training for door staff and venue security. Manage entry, control crowds, de-escalate conflict, and earn your certificate.",
  alternates: { canonical: "/marketing-v6" },
  robots: { index: false, follow: true }
};

// ── Campaign settings — edit these in one place ──────────────────────────
const CTA_HREF = "/courses/security-host"; // where every CTA button goes (pricing lives here)
const PHONE = "561-325-7300";
// Social-proof figures. PLACEHOLDERS — replace with real numbers before launch.
const STAT_TRAINED = "18,000+"; // PLACEHOLDER - confirm before launch
const STAT_RATING = "4.8/5"; // PLACEHOLDER - confirm before launch
const STAT_REVIEWS = "1,900+"; // PLACEHOLDER - confirm before launch
const STAT_VENUES = "600+"; // PLACEHOLDER - confirm before launch

// Scenario cards sit right below the hero headline. Short labels only.
const SCENARIOS = [
  { icon: "fas fa-people-roof", title: "Crowd control" },
  { icon: "fas fa-id-card", title: "ID and entry" },
  { icon: "fas fa-hand", title: "De-escalation" },
  { icon: "fas fa-triangle-exclamation", title: "Incident response" }
];

const COVERED = [
  { icon: "fas fa-id-card-clip", title: "Entry and ID checks" },
  { icon: "fas fa-people-group", title: "Crowd and line control" },
  { icon: "fas fa-comments", title: "Conflict de-escalation" },
  { icon: "fas fa-kit-medical", title: "Incident response" },
  { icon: "fas fa-scale-balanced", title: "Legal limits" },
  { icon: "fas fa-award", title: "Certificate of completion" }
];

const FAQS = [
  { icon: "fas fa-clock", q: "How long does it take?", a: "A few hours, at your own pace." },
  { icon: "fas fa-award", q: "Do I get a certificate?", a: "Yes, downloadable as soon as you pass." },
  { icon: "fas fa-users", q: "Can I train my team?", a: "Yes, you can enroll your whole crew in bulk." }
];

export default async function SecurityHostLanding() {
  // Pull the course so the hero photo is the course's own image. Wrapped in
  // try/catch so a Sanity hiccup never breaks this campaign page.
  let course = null;
  try {
    course = await getCourse("security-host");
  } catch {}

  return (
    <div className="t321-mlf">

      {/* Email landing page: hide the global site header + footer. This style
          ships only in this route's HTML and unmounts on navigation away, so
          no other page is affected. The page renders its own minimal footer. */}
      <style>{`.t321-mkt-header,.t321-mkt-footer{display:none !important;}`}</style>

      {/* ── Hero with scenario card grid ────────────────────────────────── */}
      <div className="mlf-hero">
        <div className="mlf-container">
          <div className="mlf-hero-top">
            <span className="mlf-pill"><i className="fas fa-shield-halved" aria-hidden="true" /> Security host and door staff training</span>
            <h1>Own the <em>door</em></h1>
            <p className="mlf-lede">Online security host training for door staff at bars, clubs, and venues.</p>
            <div className="mlf-hero-cta">
              <Link href={CTA_HREF} className="mlf-btn mlf-btn--primary">Start training <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
              <div className="mlf-rating">
                <span className="mlf-stars">★★★★★</span>
                <span><b>{STAT_RATING}</b> from {STAT_REVIEWS} door staff</span>
              </div>
            </div>
          </div>

          <div className="mlf-scenarios">
            {SCENARIOS.map((s) => (
              <div key={s.title} className="mlf-scenario">
                <span className="mlf-scenario-ic"><i className={s.icon} aria-hidden="true" /></span>
                <strong>{s.title}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Dark CTA band ───────────────────────────────────────────────── */}
      <div className="mlf-band">
        <div className="mlf-container mlf-band-inner">
          <div className="mlf-band-text">
            <h2>Get shift-ready, fast</h2>
            <p>Finish online, walk into your next shift ready.</p>
          </div>
          <Link href={CTA_HREF} className="mlf-btn mlf-btn--primary">Enroll now <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
        </div>
      </div>

      {/* ── What's covered ──────────────────────────────────────────────── */}
      <section className="mlf-section">
        <div className="mlf-container">
          <div className="mlf-head">
            <span className="mlf-pill"><i className="fas fa-list-check" aria-hidden="true" /> What's covered</span>
            <h2>Everything a door needs</h2>
          </div>
          <div className="mlf-feature-grid">
            {COVERED.map((c) => (
              <div key={c.title} className="mlf-feature">
                <span className="mlf-feature-ic"><i className={c.icon} aria-hidden="true" /></span>
                <strong>{c.title}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Value section: course image + points ────────────────────────── */}
      <section className="mlf-section mlf-sunk">
        <div className="mlf-container mlf-value-grid">
          <div className="mlf-value-media">
            <img src={course?.image || "/img/hero-restaurant.png"} alt={course?.title || "Security host training"} />
          </div>
          <div className="mlf-value-body">
            <span className="mlf-pill"><i className="fas fa-star" aria-hidden="true" /> Why Train 321</span>
            <h2>Training that holds up</h2>
            <ul className="mlf-points">
              <li><span className="mlf-pi"><i className="fas fa-bolt" aria-hidden="true" /></span><div><strong>On your schedule</strong></div></li>
              <li><span className="mlf-pi"><i className="fas fa-shield-halved" aria-hidden="true" /></span><div><strong>Real door scenarios</strong></div></li>
              <li><span className="mlf-pi"><i className="fas fa-award" aria-hidden="true" /></span><div><strong>Certificate to show your venue</strong></div></li>
            </ul>
            <Link href={CTA_HREF} className="mlf-btn mlf-btn--primary" style={{ marginTop: "26px" }}>Start training <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      {/* ── Trust / stat strip ──────────────────────────────────────────── */}
      <div className="mlf-stats">
        <div className="mlf-container mlf-stats-grid">
          <div className="mlf-stat"><div className="mlf-n">{STAT_TRAINED}</div><div className="mlf-l">Staff trained</div></div>
          <div className="mlf-stat"><div className="mlf-n">{STAT_VENUES}</div><div className="mlf-l">Venues onboard</div></div>
          <div className="mlf-stat"><div className="mlf-n">{STAT_RATING}</div><div className="mlf-l">Learner rating</div></div>
          <div className="mlf-stat"><div className="mlf-n">24/7</div><div className="mlf-l">Access, any device</div></div>
        </div>
      </div>

      {/* ── Certificate preview ─────────────────────────────────────────── */}
      <section className="mlf-section">
        <div className="mlf-container mlf-cert-grid">
          <div className="mlf-cert-copy">
            <span className="mlf-pill"><i className="fas fa-award" aria-hidden="true" /> Certificate of completion</span>
            <h2>Proof you can show your venue</h2>
            <p className="mlf-lede">Pass the course and download your certificate right away.</p>
            <Link href={CTA_HREF} className="mlf-btn mlf-btn--primary">Start training <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
          </div>
          <div className="mlf-cert-preview">
            <CourseCertificate courseTitle="Security Host Training" />
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="mlf-section mlf-sunk">
        <div className="mlf-narrow">
          <div className="mlf-head">
            <span className="mlf-pill"><i className="fas fa-circle-question" aria-hidden="true" /> Good to know</span>
            <h2>Questions, answered</h2>
          </div>
          <div className="mlf-faq">
            {FAQS.map((f) => (
              <div key={f.q} className="mlf-qa">
                <h3><i className={f.icon} aria-hidden="true" /> {f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────── */}
      <div className="mlf-final">
        <div className="mlf-container">
          <span className="mlf-pill" style={{ background: "rgba(0,180,219,.16)", color: "#7fe3f5" }}><i className="fas fa-bolt" aria-hidden="true" /> Ready for the next shift</span>
          <h2 style={{ marginTop: "16px" }}>Own the door, every night</h2>
          <p>Join {STAT_TRAINED} security hosts trained the smart way.</p>
          <Link href={CTA_HREF} className="mlf-btn mlf-btn--primary">Start training <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
          <div className="mlf-micro" style={{ color: "#8aa2b5" }}>
            <span><i className="fas fa-lock" style={{ color: "#5DCAA5" }} aria-hidden="true" /> Secure checkout</span>
            <span><i className="fas fa-award" style={{ color: "#5DCAA5" }} aria-hidden="true" /> Certificate included</span>
          </div>
        </div>
      </div>

      {/* ── Footer (minimal, no nav) ────────────────────────────────────── */}
      <footer className="mlf-footer">
        <div className="mlf-container">
          <div className="mlf-fbrand">Train 321</div>
          <p style={{ margin: "8px 0 0" }}>Security, food handler, alcohol, and compliance training. <a href={`tel:${PHONE.replace(/\D/g, "")}`}>{PHONE}</a></p>
          <p style={{ margin: "6px 0 0", color: "#6c8498" }}>© 2026 Train 321. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}

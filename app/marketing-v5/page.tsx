import type { Metadata } from "next";
import Link from "next/link";
import "./marketing-v5.css";

// Standalone email-marketing landing page for the Human Trafficking Awareness
// course. A new, isolated route — nothing imports it and it imports no existing
// page, so it can't affect the rest of the site. noindex keeps it out of search
// (the page is for campaign traffic only).
export const metadata: Metadata = {
  title: "Human trafficking awareness training, online | Train 321",
  description:
    "A short online course that teaches you to recognize the signs of human trafficking and report them safely. Earn a certificate and meet awareness-training requirements.",
  alternates: { canonical: "/marketing-v5" },
  robots: { index: false, follow: true }
};

// ── Campaign settings — edit these in one place ──────────────────────────
const CTA_HREF = "/courses/human-trafficking"; // where every CTA goes
const PRICE_INDIVIDUAL = "$20"; // PLACEHOLDER - confirm before launch
const PRICE_TEAM = "$15"; // PLACEHOLDER - confirm before launch (per seat)
// Impact figures. PLACEHOLDERS — replace with real, verifiable numbers before launch.
const STAT_DURATION = "About 1 hour"; // PLACEHOLDER - confirm before launch
const STAT_INDUSTRIES = "3 industries"; // PLACEHOLDER - confirm before launch
const STAT_CERTIFICATE = "Same day"; // PLACEHOLDER - confirm before launch

const LEARN = [
  {
    icon: "fas fa-eye",
    title: "Learn the signs and indicators",
    body: "Understand the common indicators of trafficking and how it can appear in everyday settings."
  },
  {
    icon: "fas fa-phone-volume",
    title: "Know how to respond and report",
    body: "Learn who to contact and how to report safely, without putting yourself or anyone else at risk."
  },
  {
    icon: "fas fa-certificate",
    title: "Earn your certificate",
    body: "Finish the short online course and download a certificate that documents your training."
  }
];

const FAQS = [
  {
    q: "How long does the course take?",
    a: "Most people finish in about an hour. You can pause and resume at any time, on any device."
  },
  {
    q: "Is this training required for my industry?",
    a: "Awareness training is required or recommended in certain industries, including hospitality, transportation, and healthcare. Requirements vary by state and employer, so confirm what applies to you."
  },
  {
    q: "Do I get a certificate?",
    a: "Yes. When you complete the course you can download a certificate that documents the training you finished."
  },
  {
    q: "Can my team take it together?",
    a: "Yes. The business option lets you enroll staff and keep each person's certificate in one place."
  }
];

export default function HumanTraffickingLanding() {
  return (
    <div className="t321-mle">

      {/* Email landing page: hide the global site header + footer. This style
          ships only in this route's HTML and unmounts on navigation away, so
          no other page is affected. The page renders its own minimal footer. */}
      <style>{`.t321-mkt-header,.t321-mkt-footer{display:none !important;}`}</style>

      {/* ── Hero (centered, minimal, no header nav) ─────────────────────── */}
      <header className="mle-hero">
        <div className="mle-col">
          <span className="mle-eyebrow"><i className="fas fa-hands-holding-circle" aria-hidden="true" /> Human trafficking awareness training</span>
          <h1>Learn to see what others miss</h1>
          <p className="mle-lede">
            A short, respectful online course that teaches you to recognize the signs of human
            trafficking and report them safely. Built for workers who are in a position to help.
          </p>
          <Link href={CTA_HREF} className="mle-btn mle-btn--primary">
            Start the course <i className="fas fa-arrow-right" aria-hidden="true" />
          </Link>
          <p className="mle-reassure">
            <i className="fas fa-clock" aria-hidden="true" /> {STAT_DURATION} &nbsp;&middot;&nbsp;
            <i className="fas fa-award" aria-hidden="true" /> Certificate included
          </p>
        </div>
      </header>

      {/* Slim full-width image band below the hero */}
      <div className="mle-band">
        <img src="/img/banner-image.png" alt="People at work in a public-facing setting" />
      </div>

      {/* ── Impact strip ────────────────────────────────────────────────── */}
      <section className="mle-impact">
        <div className="mle-impact-grid">
          <div className="mle-impact-item">
            <i className="fas fa-eye" aria-hidden="true" />
            <strong>Recognize the signs</strong>
            <span>Know the indicators to watch for.</span>
          </div>
          <div className="mle-impact-item">
            <i className="fas fa-shield-heart" aria-hidden="true" />
            <strong>Report with confidence</strong>
            <span>Respond safely and appropriately.</span>
          </div>
          <div className="mle-impact-item">
            <i className="fas fa-building-shield" aria-hidden="true" />
            <strong>Meet requirements</strong>
            <span>Required in {STAT_INDUSTRIES} and more.</span>
          </div>
        </div>
      </section>

      {/* ── What you'll learn (centered 3-item list) ───────────────────── */}
      <section className="mle-section">
        <div className="mle-col">
          <h2 className="mle-h2">What you will learn</h2>
          <ul className="mle-learn">
            {LEARN.map((item) => (
              <li key={item.title}>
                <span className="mle-learn-icon"><i className={item.icon} aria-hidden="true" /></span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Who needs this ──────────────────────────────────────────────── */}
      <section className="mle-section mle-sunk">
        <div className="mle-col">
          <span className="mle-eyebrow"><i className="fas fa-users" aria-hidden="true" /> Who this is for</span>
          <p className="mle-who">
            Written for people who meet the public in their work, including
            <b> hospitality</b>, <b>transportation</b>, and <b>healthcare</b>. If your role puts you
            in contact with travelers, guests, or patients, you are often the person best placed to
            notice something is wrong.
          </p>
        </div>
      </section>

      {/* ── Pricing (single-focus) ─────────────────────────────────────── */}
      <section className="mle-section">
        <div className="mle-col">
          <h2 className="mle-h2">One course, one price</h2>
          <div className="mle-price-card">
            <p className="mle-price">{PRICE_INDIVIDUAL} <span>/ person</span></p>
            <p className="mle-price-sub">Full awareness course and certificate, completed online.</p>
            <ul className="mle-price-list">
              <li><i className="fas fa-check" aria-hidden="true" /> Learn the signs and how to report</li>
              <li><i className="fas fa-check" aria-hidden="true" /> {STAT_CERTIFICATE} certificate on completion</li>
              <li><i className="fas fa-check" aria-hidden="true" /> Works on mobile and desktop</li>
            </ul>
            <Link href={CTA_HREF} className="mle-btn mle-btn--primary mle-btn--full">
              Start the course
            </Link>
          </div>
          <p className="mle-team-line">
            Training a team? Enroll staff at {PRICE_TEAM} per seat and keep every certificate in one place.{" "}
            <Link href={CTA_HREF} className="mle-inline-link">See the business option <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
          </p>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="mle-section mle-sunk">
        <div className="mle-col">
          <h2 className="mle-h2">Questions, answered</h2>
          <div className="mle-faq">
            {FAQS.map((f) => (
              <div key={f.q} className="mle-qa">
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA (calm) ───────────────────────────────────────────── */}
      <section className="mle-final">
        <div className="mle-col">
          <h2 className="mle-h2">A short course that can make a real difference</h2>
          <p className="mle-final-sub">
            Spend about an hour learning what to look for. The people you help may never know you did.
          </p>
          <Link href={CTA_HREF} className="mle-btn mle-btn--primary">
            Start the course <i className="fas fa-arrow-right" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* ── Footer (minimal, no nav) ───────────────────────────────────── */}
      <footer className="mle-footer">
        <div className="mle-col">
          <div className="mle-fbrand">Train 321</div>
          <p>Compliance and awareness training, online.</p>
          <p className="mle-fcopy">© 2026 Train 321. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}

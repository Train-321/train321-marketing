import type { Metadata } from "next";
import Link from "next/link";
import "./marketing-v7.css";

// Standalone email-marketing landing page for the TABC Certification course
// (Texas alcohol seller-server certification). A new, isolated route — nothing
// imports it and it imports no existing page, so it can't affect the rest of
// the site. noindex keeps it out of search (the page is for campaign traffic
// only).
export const metadata: Metadata = {
  title: "TABC certification online in about an hour | Train 321",
  description:
    "Official TABC-approved Texas alcohol seller-server certification, 100% online. Finish in about an hour and get your certificate instantly, accepted statewide.",
  alternates: { canonical: "/marketing-v7" },
  robots: { index: false, follow: true }
};

// ── Campaign settings — edit these in one place ──────────────────────────
const CTA_HREF = "/courses/tabc"; // where every CTA button goes

// PLACEHOLDER - confirm before launch
const PRICE_INDIVIDUAL = "$10.99";
// PLACEHOLDER - confirm before launch
const PRICE_TEAM = "$8.99";

// Social-proof figures. PLACEHOLDER - confirm before launch.
const STAT_CERTIFIED = "75,000+";
const STAT_RATING = "4.9/5";
const STAT_REVIEWS = "3,100+";

const LEARN = [
  { icon: "fas fa-id-card", text: "Check IDs and spot fake or altered identification" },
  { icon: "fas fa-user-slash", text: "Recognize and refuse service to intoxicated or underage customers" },
  { icon: "fas fa-scale-balanced", text: "Understand Texas alcohol laws and your legal responsibilities" },
  { icon: "fas fa-circle-exclamation", text: "Limit your liability and your employer's under state law" }
];

const FAQS = [
  { icon: "fas fa-circle-check", q: "Is this course TABC approved?", a: "Yes. It's an official TABC-approved seller-server program, accepted statewide for bartenders, servers, and retail clerks." },
  { icon: "fas fa-calendar-check", q: "How long is my certification valid?", a: "Your TABC certificate stays valid for the full required period. We'll remind you before it's time to renew." },
  { icon: "fas fa-bolt", q: "How fast do I get my certificate?", a: "Instantly. Pass the final and download your official certificate right away, no waiting and no mail." },
  { icon: "fas fa-briefcase", q: "Will my employer accept it?", a: "Yes. Because it's TABC-approved, Texas employers accept it to satisfy their seller-server training requirement." }
];

export default function TabcLanding() {
  return (
    <div className="t321-mlg">

      {/* Email landing page: hide the global site header + footer. This style
          ships only in this route's HTML and unmounts on navigation away, so
          no other page is affected. The page renders its own minimal footer. */}
      <style>{`.t321-mkt-header,.t321-mkt-footer{display:none !important;}`}</style>

      {/* ── Hero: headline + offer card (left), certificate (right) ─────── */}
      <section className="mlg-hero">
        <div className="mlg-container mlg-hero-grid">

          <div className="mlg-hero-copy">
            <span className="mlg-pill"><i className="fas fa-certificate" aria-hidden="true" /> Official TABC seller-server course</span>
            <h1>Get TABC certified online in <em>about an hour</em></h1>
            <p className="mlg-lede">The fast, official way for Texas bartenders, servers, and clerks to meet their alcohol seller-server requirement. Finish today and get your certificate instantly.</p>

            <div className="mlg-offer">
              <div className="mlg-offer-head">
                <span className="mlg-badge"><i className="fas fa-check" aria-hidden="true" /> Texas approved</span>
                <div className="mlg-offer-price">
                  <span className="mlg-price-num">{PRICE_INDIVIDUAL}</span>
                  <span className="mlg-price-unit">one-time, no subscription</span>
                </div>
              </div>
              <ul className="mlg-offer-list">
                <li><i className="fas fa-circle-check" aria-hidden="true" /> TABC-approved and accepted statewide</li>
                <li><i className="fas fa-circle-check" aria-hidden="true" /> Official certificate the moment you pass</li>
                <li><i className="fas fa-circle-check" aria-hidden="true" /> Satisfies your employer's requirement</li>
              </ul>
              <Link href={CTA_HREF} className="mlg-btn mlg-btn--primary mlg-btn--block">Start for {PRICE_INDIVIDUAL} <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
              <div className="mlg-micro">
                <span><i className="fas fa-lock" aria-hidden="true" /> Secure checkout</span>
                <span><i className="fas fa-rotate-right" aria-hidden="true" /> Free retakes</span>
              </div>
            </div>
          </div>

          <div className="mlg-hero-cert">
            <span className="mlg-cert-ribbon"><i className="fas fa-circle-check" aria-hidden="true" /> TABC approved</span>
            <div className="mlg-cert-frame">
              <img src="/img/certificate/tabc-sample.png" alt="Sample TABC seller-server certification certificate" />
            </div>
            <div className="mlg-cert-caption">
              <img src="/img/certificate/stamp.png" alt="" className="mlg-cert-stamp" />
              <span>Your official certificate, issued the moment you pass.</span>
            </div>
          </div>

        </div>
      </section>

      {/* ── Trust strip ────────────────────────────────────────────────── */}
      <div className="mlg-trust">
        <div className="mlg-container mlg-trust-grid">
          <span><i className="fas fa-certificate" aria-hidden="true" /> TABC approved</span>
          <span><i className="fas fa-map-location-dot" aria-hidden="true" /> Accepted statewide</span>
          <span><i className="fas fa-bolt" aria-hidden="true" /> Instant certificate</span>
          <span><i className="fas fa-star" aria-hidden="true" /> {STAT_RATING} from {STAT_REVIEWS} learners</span>
        </div>
      </div>

      {/* ── What you'll learn ──────────────────────────────────────────── */}
      <section className="mlg-section">
        <div className="mlg-container mlg-learn-grid">
          <div className="mlg-learn-media">
            <img src="/img/server.jpg" alt="Server checking a customer's ID at the bar" />
          </div>
          <div className="mlg-learn-body">
            <span className="mlg-pill"><i className="fas fa-graduation-cap" aria-hidden="true" /> What you'll learn</span>
            <h2>Everything Texas law requires, in one short course</h2>
            <p className="mlg-lede mlg-lede--sm">Built for anyone who sells or serves alcohol in Texas.</p>
            <ul className="mlg-learn-list">
              {LEARN.map((l) => (
                <li key={l.text}>
                  <span className="mlg-learn-icon"><i className={l.icon} aria-hidden="true" /></span>
                  <span>{l.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Offer / pricing block ──────────────────────────────────────── */}
      <section className="mlg-section mlg-sunk">
        <div className="mlg-narrow">
          <div className="mlg-head">
            <span className="mlg-pill"><i className="fas fa-tag" aria-hidden="true" /> One simple price</span>
            <h2>Certify yourself in minutes</h2>
            <p className="mlg-lede">No subscription and no hidden fees. Just pass and download your certificate.</p>
          </div>

          <div className="mlg-deal">
            <span className="mlg-badge mlg-badge--lg"><i className="fas fa-check" aria-hidden="true" /> Texas approved</span>
            <div className="mlg-deal-price">
              <span className="mlg-deal-num">{PRICE_INDIVIDUAL}</span>
              <span className="mlg-deal-unit">per person, one-time</span>
            </div>
            <ul className="mlg-deal-list">
              <li><i className="fas fa-circle-check" aria-hidden="true" /> Full TABC seller-server course</li>
              <li><i className="fas fa-circle-check" aria-hidden="true" /> Final exam with free retakes</li>
              <li><i className="fas fa-circle-check" aria-hidden="true" /> Instant official certificate</li>
              <li><i className="fas fa-circle-check" aria-hidden="true" /> Valid for the full required period</li>
            </ul>
            <Link href={CTA_HREF} className="mlg-btn mlg-btn--primary mlg-btn--block">Get certified for {PRICE_INDIVIDUAL} <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
            <p className="mlg-deal-team">
              <i className="fas fa-users" aria-hidden="true" /> Certifying a team? Seats from <strong>{PRICE_TEAM} each</strong> with a manager dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ (Texas specifics) ──────────────────────────────────────── */}
      <section className="mlg-section">
        <div className="mlg-narrow">
          <div className="mlg-head">
            <span className="mlg-pill"><i className="fas fa-circle-question" aria-hidden="true" /> Texas specifics</span>
            <h2>Questions, answered</h2>
          </div>
          <div className="mlg-faq">
            {FAQS.map((f) => (
              <div key={f.q} className="mlg-qa">
                <h3><i className={f.icon} aria-hidden="true" /> {f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <div className="mlg-final">
        <div className="mlg-container">
          <span className="mlg-pill mlg-pill--dark"><i className="fas fa-bolt" aria-hidden="true" /> Ready before your next shift</span>
          <h2>Get your TABC certificate today</h2>
          <p>Join {STAT_CERTIFIED} Texas workers who certified the fast, official way.</p>
          <Link href={CTA_HREF} className="mlg-btn mlg-btn--primary">Start for {PRICE_INDIVIDUAL} <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
          <div className="mlg-micro mlg-micro--dark">
            <span><i className="fas fa-certificate" aria-hidden="true" /> TABC approved</span>
            <span><i className="fas fa-bolt" aria-hidden="true" /> Instant certificate</span>
          </div>
        </div>
      </div>

      {/* ── Footer (minimal, no nav) ───────────────────────────────────── */}
      <footer className="mlg-footer">
        <div className="mlg-container">
          <div className="mlg-fbrand">Train 321</div>
          <p style={{ margin: "8px 0 0" }}>TABC, food handler, and compliance training for Texas.</p>
          <p style={{ margin: "6px 0 0", color: "#6c8498" }}>© 2026 Train 321. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}

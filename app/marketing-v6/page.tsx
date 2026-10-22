import type { Metadata } from "next";
import Link from "next/link";
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
const CTA_HREF = "/courses/security-host"; // where every CTA button goes
const PRICE_INDIVIDUAL = "$29"; // PLACEHOLDER - confirm before launch
const PRICE_TEAM = "$24"; // PLACEHOLDER - confirm before launch (per seat)
const PHONE = "561-325-7300";
// Social-proof figures. PLACEHOLDERS — replace with real numbers before launch.
const STAT_TRAINED = "18,000+"; // PLACEHOLDER - confirm before launch
const STAT_RATING = "4.8/5"; // PLACEHOLDER - confirm before launch
const STAT_REVIEWS = "1,900+"; // PLACEHOLDER - confirm before launch
const STAT_VENUES = "600+"; // PLACEHOLDER - confirm before launch

// Scenario cards sit right below the hero headline.
const SCENARIOS = [
  { icon: "fas fa-people-roof", title: "Crowd control", body: "Keep lines moving and manage capacity under pressure." },
  { icon: "fas fa-id-card", title: "ID and entry", body: "Check IDs, spot fakes, and handle refusals with confidence." },
  { icon: "fas fa-hand", title: "De-escalation", body: "Defuse conflict and calm heated guests before it escalates." },
  { icon: "fas fa-triangle-exclamation", title: "Incident response", body: "Act fast when something goes wrong and document it right." }
];

const COVERED = [
  { icon: "fas fa-id-card-clip", title: "Entry and ID checks", body: "Verify IDs, catch fakes, and manage who gets in and who does not." },
  { icon: "fas fa-people-group", title: "Crowd and line control", body: "Manage capacity, keep queues orderly, and prevent crushes." },
  { icon: "fas fa-comments", title: "Conflict de-escalation", body: "Read the room and talk tense situations down before they turn physical." },
  { icon: "fas fa-kit-medical", title: "Incident response", body: "Respond to fights, medical issues, and emergencies with a clear plan." },
  { icon: "fas fa-scale-balanced", title: "Legal limits and liability", body: "Know your authority, use of force limits, and when to call police." },
  { icon: "fas fa-award", title: "Certificate of completion", body: "Finish online and download a certificate you can show your venue." }
];

const FAQS = [
  { icon: "fas fa-clock", q: "How long does it take?", a: "Most people finish in a few hours. Work at your own pace and resume anytime." },
  { icon: "fas fa-building-shield", q: "Is it accepted by my venue or state?", a: "Requirements vary by state and venue. Check your local rules, then confirm with your employer." },
  { icon: "fas fa-award", q: "Do I get a certificate?", a: "Yes. Pass the course and download your certificate right away to share with your venue." },
  { icon: "fas fa-users", q: "Can I train my whole team?", a: "Yes. Enroll your door and security staff in bulk at a lower per-seat rate." }
];

export default function SecurityHostLanding() {
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
            <h1>Run the door with <em>confidence</em></h1>
            <p className="mlf-lede">Online training for security hosts, door staff, and bouncers at bars, clubs, and venues. Manage entry, control crowds, and keep the night under control.</p>
            <div className="mlf-hero-cta">
              <Link href={CTA_HREF} className="mlf-btn mlf-btn--primary">Start training for {PRICE_INDIVIDUAL} <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
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
                <p>{s.body}</p>
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
            <p>Finish online and walk into your next shift knowing exactly what to do.</p>
          </div>
          <Link href={CTA_HREF} className="mlf-btn mlf-btn--primary">Enroll now <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
        </div>
      </div>

      {/* ── What's covered ──────────────────────────────────────────────── */}
      <section className="mlf-section">
        <div className="mlf-container">
          <div className="mlf-head">
            <span className="mlf-pill"><i className="fas fa-list-check" aria-hidden="true" /> What's covered</span>
            <h2>Everything a door needs to run safe</h2>
            <p className="mlf-lede">Built for the real situations security hosts face every night.</p>
          </div>
          <div className="mlf-feature-grid">
            {COVERED.map((c) => (
              <div key={c.title} className="mlf-feature">
                <span className="mlf-feature-ic"><i className={c.icon} aria-hidden="true" /></span>
                <strong>{c.title}</strong>
                <p>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Value section: image + points ───────────────────────────────── */}
      <section className="mlf-section mlf-sunk">
        <div className="mlf-container mlf-value-grid">
          <div className="mlf-value-media">
            <img src="/img/banner-image.png" alt="Security host working the door at a venue" />
          </div>
          <div className="mlf-value-body">
            <span className="mlf-pill"><i className="fas fa-star" aria-hidden="true" /> Why Train 321</span>
            <h2>Training that holds up under pressure</h2>
            <p className="mlf-lede" style={{ fontSize: "16px" }}>Practical, no-fluff lessons you can finish on any device.</p>
            <ul className="mlf-points">
              <li><span className="mlf-pi"><i className="fas fa-bolt" aria-hidden="true" /></span><div><strong>Online and on your schedule</strong><p>Short lessons you can finish on a phone before your shift.</p></div></li>
              <li><span className="mlf-pi"><i className="fas fa-shield-halved" aria-hidden="true" /></span><div><strong>Real door scenarios</strong><p>Entry, crowds, conflict, and incidents, taught the way they happen.</p></div></li>
              <li><span className="mlf-pi"><i className="fas fa-award" aria-hidden="true" /></span><div><strong>Certificate to show your venue</strong><p>Download proof of completion as soon as you pass.</p></div></li>
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

      {/* ── Pricing ─────────────────────────────────────────────────────── */}
      <section className="mlf-section">
        <div className="mlf-container">
          <div className="mlf-head">
            <span className="mlf-pill"><i className="fas fa-tag" aria-hidden="true" /> Simple pricing</span>
            <h2>Train yourself, or your whole crew</h2>
            <p className="mlf-lede">One flat price per person, with a lower rate for venues and teams.</p>
          </div>
          <div className="mlf-price-grid">
            <div className="mlf-plan">
              <h3>Individual</h3>
              <p className="mlf-sub">For a single security host</p>
              <p className="mlf-price">{PRICE_INDIVIDUAL} <span>/ course</span></p>
              <ul>
                <li><i className="fas fa-check" aria-hidden="true" /> Full security host course</li>
                <li><i className="fas fa-check" aria-hidden="true" /> Entry, crowd, and conflict training</li>
                <li><i className="fas fa-check" aria-hidden="true" /> Legal limits and liability</li>
                <li><i className="fas fa-check" aria-hidden="true" /> Certificate of completion</li>
                <li><i className="fas fa-check" aria-hidden="true" /> Mobile and desktop access</li>
              </ul>
              <Link href={CTA_HREF} className="mlf-btn mlf-btn--light">Start training</Link>
            </div>
            <div className="mlf-plan is-pop">
              <span className="mlf-tag">Best for venues</span>
              <h3>Venue / Team</h3>
              <p className="mlf-sub">For bars, clubs, and security firms</p>
              <p className="mlf-price">{PRICE_TEAM} <span>/ seat</span></p>
              <ul>
                <li><i className="fas fa-check" aria-hidden="true" /> Everything in Individual</li>
                <li><i className="fas fa-check" aria-hidden="true" /> Manager dashboard</li>
                <li><i className="fas fa-check" aria-hidden="true" /> Bulk staff enrollment</li>
                <li><i className="fas fa-check" aria-hidden="true" /> Progress tracking</li>
                <li><i className="fas fa-check" aria-hidden="true" /> Volume discounts</li>
              </ul>
              <Link href={CTA_HREF} className="mlf-btn mlf-btn--primary">Train your team</Link>
            </div>
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
          <Link href={CTA_HREF} className="mlf-btn mlf-btn--primary">Start training for {PRICE_INDIVIDUAL} <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
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

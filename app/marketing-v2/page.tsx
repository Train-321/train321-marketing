import type { Metadata } from "next";
import Link from "next/link";
import CourseCertificate from "@/components/CourseCertificate";
import { getCourse } from "@/lib/sanity";
import "./marketing-v2.css";

// Standalone email-marketing landing page for the Food Manager course. A new,
// isolated route. Nothing imports it and it imports no existing page, so it
// can't affect the rest of the site. noindex keeps it out of search (the page
// is for campaign traffic only).
export const metadata: Metadata = {
  title: "Certified Food Protection Manager course | Train 321",
  description:
    "ANSI-accredited Food Manager certification, 100% online. Full CFPM exam prep for kitchen managers and supervisors. Run an inspection-ready kitchen.",
  alternates: { canonical: "/marketing-v2" },
  robots: { index: false, follow: true }
};

// ── Campaign settings, edit these in one place ───────────────────────────
const CTA_HREF = "/courses/food-manager"; // where every CTA button goes
const PRICE_INDIVIDUAL = "$35"; // PLACEHOLDER - confirm before launch
const PRICE_TEAM = "$29"; // PLACEHOLDER - confirm before launch (per manager)
const PHONE = "561-325-7300";
// Social-proof figures. PLACEHOLDERS, replace with real numbers before launch.
const STAT_MANAGERS = "18,000+"; // PLACEHOLDER
const STAT_PASS_RATE = "96%"; // PLACEHOLDER
const STAT_RATING = "4.9/5"; // PLACEHOLDER
const STAT_REVIEWS = "1,400+"; // PLACEHOLDER

const FEATURES = [
  {
    icon: "fas fa-award",
    kicker: "Nationally recognized",
    title: "Earn the CFPM credential",
    body: "ANSI-accredited and accepted by health departments nationwide."
  },
  {
    icon: "fas fa-clipboard-check",
    kicker: "Inspection ready",
    title: "Run a compliant kitchen",
    body: "Master HACCP, temperature control, and corrective action."
  },
  {
    icon: "fas fa-graduation-cap",
    kicker: "Full exam prep",
    title: "Pass on the first try",
    body: "Study modules and practice questions built around the national exam."
  }
];

const FAQS = [
  { icon: "fas fa-clock", q: "How long does it take?", a: "Most managers finish in a few short sessions." },
  { icon: "fas fa-file-signature", q: "Is the exam included?", a: "Yes, full CFPM exam prep is included." },
  { icon: "fas fa-building-shield", q: "Will my health department accept it?", a: "Yes, the CFPM credential is recognized nationwide." }
];

export default async function FoodManagerLanding() {
  let course = null;
  try {
    course = await getCourse("food-manager");
  } catch {}

  const heroImg = course?.image || "/img/hero-restaurant.png";
  const heroAlt = course?.title || "Food manager course";

  return (
    <div className="t321-mlb">

      {/* Email landing page: hide the global site header + footer. This style
          ships only in this route's HTML and unmounts on navigation away, so
          no other page is affected. The page renders its own minimal footer. */}
      <style>{`.t321-mkt-header,.t321-mkt-footer{display:none !important;}`}</style>

      {/* ── Split hero (text left, image right) ────────────────────────── */}
      <header className="mlb-hero">
        <div className="mlb-container mlb-hero-grid">
          <div className="mlb-hero-copy">
            <span className="mlb-pill"><i className="fas fa-shield-halved" aria-hidden="true" /> ANSI-accredited certification</span>
            <h1>Become a Certified Food Protection Manager</h1>
            <p className="mlb-lede">ANSI-accredited CFPM exam prep you complete online, at your own pace.</p>
            <div className="mlb-cta-row">
              <Link href={CTA_HREF} className="mlb-btn mlb-btn--primary">Start certification <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
              <Link href={CTA_HREF} className="mlb-btn mlb-btn--light">Train your team</Link>
            </div>
            <div className="mlb-micro">
              <span><i className="fas fa-check" aria-hidden="true" /> CFPM exam prep included</span>
              <span><i className="fas fa-check" aria-hidden="true" /> Study at your own pace</span>
              <span><i className="fas fa-check" aria-hidden="true" /> Accepted nationwide</span>
            </div>
          </div>
          <div className="mlb-hero-media">
            <span className="mlb-ribbon"><i className="fas fa-circle-check" aria-hidden="true" /> ANSI-accredited</span>
            <div className="mlb-hero-photo">
              <img src={heroImg} alt={heroAlt} />
            </div>
            <div className="mlb-floatcard">
              <div className="mlb-thumb"><img src="/img/certificate/stamp.png" alt="" /></div>
              <div>
                <strong><i className="fas fa-circle-check" aria-hidden="true" /> Certified Food Protection Manager</strong>
                <span>Nationally recognized credential</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Alternating zig-zag feature rows ───────────────────────────── */}
      <section className="mlb-section">
        <div className="mlb-container">
          <div className="mlb-head">
            <span className="mlb-pill"><i className="fas fa-star" aria-hidden="true" /> Why managers choose Train 321</span>
            <h2>Built for the people who run the kitchen</h2>
          </div>
          <div className="mlb-zig">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`mlb-row${i % 2 === 1 ? " is-flip" : ""}`}>
                <div className="mlb-row-media">
                  <img src={heroImg} alt={heroAlt} />
                </div>
                <div className="mlb-row-copy">
                  <span className="mlb-kicker"><i className={f.icon} aria-hidden="true" /> {f.kicker}</span>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                  <Link href={CTA_HREF} className="mlb-link">Learn more <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Slim stats strip ───────────────────────────────────────────── */}
      <div className="mlb-stats">
        <div className="mlb-container mlb-stats-grid">
          <div className="mlb-stat"><div className="mlb-n">{STAT_MANAGERS}</div><div className="mlb-l">Managers certified</div></div>
          <div className="mlb-stat"><div className="mlb-n">{STAT_PASS_RATE}</div><div className="mlb-l">Exam pass rate</div></div>
          <div className="mlb-stat"><div className="mlb-n">50</div><div className="mlb-l">States recognized</div></div>
          <div className="mlb-stat"><div className="mlb-n">{STAT_RATING}</div><div className="mlb-l">Manager rating</div></div>
        </div>
      </div>

      {/* ── Two-tier pricing ───────────────────────────────────────────── */}
      <section className="mlb-section mlb-sunk">
        <div className="mlb-container">
          <div className="mlb-head">
            <span className="mlb-pill"><i className="fas fa-tag" aria-hidden="true" /> Pricing</span>
            <h2>Certify one manager, or your whole bench</h2>
          </div>
          <div className="mlb-price-grid">
            <div className="mlb-plan">
              <h3>Individual</h3>
              <p className="mlb-sub">For a single manager</p>
              <p className="mlb-price">{PRICE_INDIVIDUAL} <span>/ manager</span></p>
              <ul>
                <li><i className="fas fa-check" aria-hidden="true" /> Full Food Manager course</li>
                <li><i className="fas fa-check" aria-hidden="true" /> CFPM exam preparation</li>
                <li><i className="fas fa-check" aria-hidden="true" /> HACCP and compliance modules</li>
                <li><i className="fas fa-check" aria-hidden="true" /> Study online at your own pace</li>
                <li><i className="fas fa-check" aria-hidden="true" /> Nationally recognized credential</li>
              </ul>
              <Link href={CTA_HREF} className="mlb-btn mlb-btn--light">Start certification</Link>
            </div>
            <div className="mlb-plan is-pop">
              <span className="mlb-tag">Best for operators</span>
              <h3>Team</h3>
              <p className="mlb-sub">For restaurants and multi-manager operations</p>
              <p className="mlb-price">{PRICE_TEAM} <span>/ manager</span></p>
              <ul>
                <li><i className="fas fa-check" aria-hidden="true" /> Everything in Individual</li>
                <li><i className="fas fa-check" aria-hidden="true" /> Train multiple managers at once</li>
                <li><i className="fas fa-check" aria-hidden="true" /> Manager dashboard and progress tracking</li>
                <li><i className="fas fa-check" aria-hidden="true" /> Certificates stored in one place</li>
                <li><i className="fas fa-check" aria-hidden="true" /> Volume pricing for larger teams</li>
              </ul>
              <Link href={CTA_HREF} className="mlb-btn mlb-btn--primary">Train your team</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <section className="mlb-section">
        <div className="mlb-narrow">
          <div className="mlb-head">
            <span className="mlb-pill"><i className="fas fa-circle-question" aria-hidden="true" /> Good to know</span>
            <h2>Questions, answered</h2>
          </div>
          <div className="mlb-faq">
            {FAQS.map((f) => (
              <div key={f.q} className="mlb-qa">
                <h3><i className={f.icon} aria-hidden="true" /> {f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA band ─────────────────────────────────────────────── */}
      <div className="mlb-final">
        <div className="mlb-container mlb-final-grid">
          <div className="mlb-final-copy">
            <span className="mlb-pill mlb-pill--dark"><i className="fas fa-bolt" aria-hidden="true" /> Ready when you are</span>
            <h2>Put a certified manager on every shift</h2>
            <p>Join {STAT_MANAGERS} managers certified with Train 321.</p>
            <div className="mlb-cta-row">
              <Link href={CTA_HREF} className="mlb-btn mlb-btn--primary">Start certification for {PRICE_INDIVIDUAL} <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
            </div>
            <div className="mlb-micro mlb-micro--dark">
              <span><i className="fas fa-lock" aria-hidden="true" /> Secure checkout</span>
              <span><i className="fas fa-shield-halved" aria-hidden="true" /> ANSI-accredited</span>
            </div>
          </div>
          <div className="mlb-final-media">
            <CourseCertificate courseTitle="Certified Food Protection Manager" />
          </div>
        </div>
      </div>

      {/* ── Footer (minimal, no nav) ───────────────────────────────────── */}
      <footer className="mlb-footer">
        <div className="mlb-container">
          <div className="mlb-fbrand">Train 321</div>
          <p style={{ margin: "8px 0 0" }}>Food manager, food handler, and compliance training. <a href={`tel:${PHONE.replace(/\D/g, "")}`}>{PHONE}</a></p>
          <p style={{ margin: "6px 0 0", color: "#6c8498" }}>© 2026 Train 321. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}

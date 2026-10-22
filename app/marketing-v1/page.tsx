import type { Metadata } from "next";
import Link from "next/link";
import CourseCertificate from "@/components/CourseCertificate";
import { getCourse } from "@/lib/sanity";
import "./marketing-v1.css";

// Standalone email-marketing landing page for the Food Handler course. A new,
// isolated route — nothing imports it and it imports no existing page, so it
// can't affect the rest of the site. noindex keeps it out of search (the page
// is for campaign traffic only).
export const metadata: Metadata = {
  title: "Food handler certification in about an hour | Train 321",
  description:
    "ANSI-accredited food handler course, 100% online. Pass the exam and download your certificate the same day, accepted in all 50 states.",
  alternates: { canonical: "/marketing-v1" },
  robots: { index: false, follow: true }
};

// ── Campaign settings — edit these in one place ──────────────────────────
const CTA_HREF = "/courses/food-handler"; // where every "Get certified" button goes
const PRICE_INDIVIDUAL = "$10";
const PRICE_TEAM = "$8";
const PHONE = "561-325-7300";
// Social-proof figures. PLACEHOLDERS — replace with real numbers before launch.
const STAT_CERTIFIED = "50,000+";
const STAT_RATING = "4.9/5";
const STAT_REVIEWS = "2,300+";

const BENEFITS = [
  { icon: "fas fa-bolt", title: "Fast and 100% online", body: "Finish in about an hour, English or Spanish." },
  { icon: "fas fa-certificate", title: "Same-day certificate", body: "Pass and download it instantly." },
  { icon: "fas fa-users", title: "Train your whole team", body: "Enroll staff in bulk and track every certificate." }
];

const FAQS = [
  { icon: "fas fa-clock", q: "How long does it take?", a: "About an hour, pause and resume anytime." },
  { icon: "fas fa-map-location-dot", q: "Is it accepted in my state?", a: "ANSI-accredited and accepted in all 50 states." },
  { icon: "fas fa-rotate-right", q: "What if I fail the exam?", a: "Retakes are free, as many as you need." }
];

export default async function FoodHandlerLanding() {
  let course = null;
  try {
    course = await getCourse("food-handler");
  } catch {}

  return (
    <div className="t321-ml">

      {/* Email landing page: hide the global site header + footer. This style
          ships only in this route's HTML and unmounts on navigation away, so
          no other page is affected. The page renders its own minimal footer. */}
      <style>{`.t321-mkt-header,.t321-mkt-footer{display:none !important;}`}</style>

      {/* ── Hero (no header nav) ───────────────────────────────────────── */}
      <div className="ml-hero">
        <div className="ml-container">
          <span className="ml-pill"><i className="fas fa-shield-halved" aria-hidden="true" /> ANSI-accredited food handler course</span>
          <h1>Food handler card in <em>about an hour</em></h1>
          <p className="ml-lede">100% online and accepted in all 50 states.</p>
          <Link href={CTA_HREF} className="ml-btn ml-btn--primary">Get certified for {PRICE_INDIVIDUAL} <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
          <div className="ml-micro">
            <span><i className="fas fa-check" aria-hidden="true" /> No subscription</span>
            <span><i className="fas fa-check" aria-hidden="true" /> Instant certificate</span>
            <span><i className="fas fa-check" aria-hidden="true" /> Free exam retakes</span>
          </div>
          <div className="ml-rating">
            <span className="ml-stars">★★★★★</span>
            <span><b>{STAT_RATING}</b> from {STAT_REVIEWS} learners</span>
          </div>
        </div>
        <div className="ml-showcase">
          <span className="ml-ribbon"><i className="fas fa-circle-check" aria-hidden="true" /> ANSI-accredited</span>
          <div className="ml-photo">
            <img src={course?.image || "/img/hero-restaurant.png"} alt={course?.title || "Food handler course"} />
          </div>
          <div className="ml-floatcard">
            <div className="ml-thumb"><CourseCertificate courseTitle="Food Handler Certification" /></div>
            <div>
              <strong><i className="fas fa-circle-check" aria-hidden="true" /> Certificate issued</strong>
              <span>Official and accepted, same day</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat band ──────────────────────────────────────────────────── */}
      <div className="ml-stats">
        <div className="ml-container ml-stats-grid">
          <div className="ml-stat"><div className="ml-n">{STAT_CERTIFIED}</div><div className="ml-l">Workers certified</div></div>
          <div className="ml-stat"><div className="ml-n">~1 hr</div><div className="ml-l">Average completion</div></div>
          <div className="ml-stat"><div className="ml-n">50</div><div className="ml-l">States accepted</div></div>
          <div className="ml-stat"><div className="ml-n">{STAT_RATING}</div><div className="ml-l">Learner rating</div></div>
        </div>
      </div>

      {/* ── Value section: image + benefits ────────────────────────────── */}
      <section className="ml-section">
        <div className="ml-container ml-value-grid">
          <div className="ml-value-media">
            <img src="/img/individual-phone.png" alt="Taking the food handler course on a phone" />
          </div>
          <div className="ml-value-body">
            <span className="ml-pill"><i className="fas fa-star" aria-hidden="true" /> Why Train 321</span>
            <h2>The simplest way to get certified</h2>
            <p className="ml-lede" style={{ fontSize: "16px" }}>Built for food workers and the businesses that employ them.</p>
            <ul className="ml-benefits">
              {BENEFITS.map((b) => (
                <li key={b.title}>
                  <span className="ml-bi"><i className={b.icon} aria-hidden="true" /></span>
                  <div><strong>{b.title}</strong><p>{b.body}</p></div>
                </li>
              ))}
            </ul>
            <Link href={CTA_HREF} className="ml-btn ml-btn--primary" style={{ marginTop: "26px" }}>Get certified <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────── */}
      <section className="ml-section ml-sunk">
        <div className="ml-container">
          <div className="ml-head">
            <span className="ml-pill"><i className="fas fa-tag" aria-hidden="true" /> Simple pricing</span>
            <h2>One price. No surprises.</h2>
            <p className="ml-lede">Certify yourself, or your whole team at a lower per-seat rate.</p>
          </div>
          <div className="ml-price-grid">
            <div className="ml-plan">
              <h3>Individual</h3>
              <p className="ml-sub">For a single worker</p>
              <p className="ml-price">{PRICE_INDIVIDUAL} <span>/ course</span></p>
              <ul>
                <li><i className="fas fa-check" aria-hidden="true" /> Full food handler course</li>
                <li><i className="fas fa-check" aria-hidden="true" /> Final exam, free retakes</li>
                <li><i className="fas fa-check" aria-hidden="true" /> Same-day certificate</li>
                <li><i className="fas fa-check" aria-hidden="true" /> English and Spanish</li>
                <li><i className="fas fa-check" aria-hidden="true" /> Mobile and desktop</li>
              </ul>
              <Link href={CTA_HREF} className="ml-btn ml-btn--light">Get certified</Link>
            </div>
            <div className="ml-plan is-pop">
              <span className="ml-tag">Best for businesses</span>
              <h3>Team</h3>
              <p className="ml-sub">For restaurants and food businesses</p>
              <p className="ml-price">{PRICE_TEAM} <span>/ seat</span></p>
              <ul>
                <li><i className="fas fa-check" aria-hidden="true" /> Everything in Individual</li>
                <li><i className="fas fa-check" aria-hidden="true" /> Manager dashboard</li>
                <li><i className="fas fa-check" aria-hidden="true" /> Bulk staff enrollment</li>
                <li><i className="fas fa-check" aria-hidden="true" /> Progress tracking</li>
                <li><i className="fas fa-check" aria-hidden="true" /> Volume discounts</li>
              </ul>
              <Link href={CTA_HREF} className="ml-btn ml-btn--primary">Train your team</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <section className="ml-section">
        <div className="ml-narrow">
          <div className="ml-head">
            <span className="ml-pill"><i className="fas fa-circle-question" aria-hidden="true" /> Good to know</span>
            <h2>Questions, answered</h2>
          </div>
          <div className="ml-faq">
            {FAQS.map((f) => (
              <div key={f.q} className="ml-qa">
                <h3><i className={f.icon} aria-hidden="true" /> {f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <div className="ml-final">
        <div className="ml-container">
          <span className="ml-pill" style={{ background: "rgba(0,180,219,.16)", color: "#7fe3f5" }}><i className="fas fa-bolt" aria-hidden="true" /> Ready when you are</span>
          <h2 style={{ marginTop: "16px" }}>Get certified before your next shift</h2>
          <p>Join {STAT_CERTIFIED} workers certified the easy way.</p>
          <Link href={CTA_HREF} className="ml-btn ml-btn--primary">Get certified for {PRICE_INDIVIDUAL} <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
          <div className="ml-micro" style={{ color: "#8aa2b5" }}>
            <span><i className="fas fa-lock" style={{ color: "#5DCAA5" }} aria-hidden="true" /> Secure checkout</span>
            <span><i className="fas fa-shield-halved" style={{ color: "#5DCAA5" }} aria-hidden="true" /> ANSI-accredited</span>
          </div>
        </div>
      </div>

      {/* ── Footer (minimal, no nav) ───────────────────────────────────── */}
      <footer className="ml-footer">
        <div className="ml-container">
          <div className="ml-fbrand">Train 321</div>
          <p style={{ margin: "8px 0 0" }}>Food handler, alcohol and compliance training. <a href={`tel:${PHONE.replace(/\D/g, "")}`}>{PHONE}</a></p>
          <p style={{ margin: "6px 0 0", color: "#6c8498" }}>© 2026 Train 321. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}

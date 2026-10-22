import type { Metadata } from "next";
import Link from "next/link";
import { getCourse } from "@/lib/sanity";
import CourseCertificate from "@/components/CourseCertificate";
import "./marketing-v3.css";

// Standalone email-marketing landing page for the Alcohol Safety (responsible
// seller/server) course. A new, isolated route - nothing imports it and it
// imports no existing page, so it can't affect the rest of the site. noindex
// keeps it out of search (the page is for campaign traffic only).
export const metadata: Metadata = {
  title: "Responsible alcohol server certification online | Train 321",
  description:
    "Responsible alcohol seller and server training for bartenders, servers, and clerks. Finish online in about an hour and get your certificate instantly.",
  alternates: { canonical: "/marketing-v3" },
  robots: { index: false, follow: true }
};

// Campaign settings - edit these in one place.
const CTA_HREF = "/courses/alcohol"; // where every CTA button goes
const PHONE = "561-325-7300";
// Social-proof figures. PLACEHOLDERS - replace with real numbers before launch.
const STAT_CERTIFIED = "75,000+"; // PLACEHOLDER - confirm before launch
const STAT_RATING = "4.9/5"; // PLACEHOLDER - confirm before launch
const STAT_REVIEWS = "3,100+"; // PLACEHOLDER - confirm before launch
const STAT_MINUTES = "~60"; // PLACEHOLDER - confirm before launch

const BENEFITS = [
  { icon: "fas fa-id-card", title: "Check IDs with confidence", body: "Verify real IDs and spot fakes." },
  { icon: "fas fa-wine-glass", title: "Prevent over-service", body: "Know exactly when to stop serving." },
  { icon: "fas fa-scale-balanced", title: "Reduce your liability", body: "Protect yourself and your venue." }
];

const LEARN = [
  "Verify and read IDs",
  "Signs of intoxication",
  "When to refuse service"
];

const FAQS = [
  { icon: "fas fa-clock", q: "How long does it take?", a: "About an hour, on any device." },
  { icon: "fas fa-file-arrow-down", q: "When do I get my certificate?", a: "Instantly, right after you pass." },
  { icon: "fas fa-rotate-right", q: "What if I fail the exam?", a: "Retakes are always free." }
];

export default async function AlcoholSafetyLanding() {
  let course = null;
  try {
    course = await getCourse("alcohol");
  } catch {}

  const courseImg = course?.image || "/img/server.jpg";
  const courseAlt = course?.title || "Alcohol safety course";

  return (
    <div className="t321-mlc">

      {/* Email landing page: hide the global site header + footer. This style
          ships only in this route's HTML and unmounts on navigation away, so
          no other page is affected. The page renders its own minimal footer. */}
      <style>{`.t321-mkt-header,.t321-mkt-footer{display:none !important;}`}</style>

      {/* Dark immersive hero (flat) */}
      <div className="mlc-hero">
        <div className="mlc-container mlc-hero-grid">
          <div className="mlc-hero-copy">
            <span className="mlc-pill"><i className="fas fa-martini-glass-citrus" aria-hidden="true" /> Alcohol server training</span>
            <h1>Serve smart. Stay <em>covered.</em></h1>
            <p className="mlc-lede">Get your responsible seller-server certification online in about an hour.</p>
            <div className="mlc-hero-cta">
              <Link href={CTA_HREF} className="mlc-btn mlc-btn--primary">Get certified <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
              <span className="mlc-rating">
                <span className="mlc-stars">★★★★★</span>
                <span><b>{STAT_RATING}</b> from {STAT_REVIEWS} learners</span>
              </span>
            </div>
            <div className="mlc-micro">
              <span><i className="fas fa-check" aria-hidden="true" /> State-approved where required</span>
              <span><i className="fas fa-check" aria-hidden="true" /> Instant certificate</span>
              <span><i className="fas fa-check" aria-hidden="true" /> Free exam retakes</span>
            </div>
          </div>
          <div className="mlc-hero-media">
            <div className="mlc-photo">
              <img src={courseImg} alt={courseAlt} />
            </div>
            <div className="mlc-floatcard">
              <span className="mlc-fc-icon"><i className="fas fa-circle-check" aria-hidden="true" /></span>
              <div>
                <strong>Certificate issued</strong>
                <span>Download it the moment you pass</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefit tiles (light) */}
      <section className="mlc-section">
        <div className="mlc-container">
          <div className="mlc-head">
            <span className="mlc-pill mlc-pill--light"><i className="fas fa-shield-halved" aria-hidden="true" /> Why it matters</span>
            <h2>One shift can cost your venue everything</h2>
          </div>
          <div className="mlc-tiles">
            {BENEFITS.map((b) => (
              <div key={b.title} className="mlc-tile">
                <span className="mlc-tile-icon"><i className={b.icon} aria-hidden="true" /></span>
                <strong>{b.title}</strong>
                <p>{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you'll learn */}
      <section className="mlc-section mlc-sunk">
        <div className="mlc-container mlc-learn-grid">
          <div className="mlc-learn-media">
            <img src={courseImg} alt={courseAlt} />
          </div>
          <div className="mlc-learn-body">
            <span className="mlc-pill mlc-pill--light"><i className="fas fa-list-check" aria-hidden="true" /> What you'll learn</span>
            <h2>Everything you need behind the bar</h2>
            <ul className="mlc-learn-list">
              {LEARN.map((item) => (
                <li key={item}><i className="fas fa-circle-check" aria-hidden="true" /> {item}</li>
              ))}
            </ul>
            <Link href={CTA_HREF} className="mlc-btn mlc-btn--primary" style={{ marginTop: "26px" }}>Start the course <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      {/* Certificate preview */}
      <section className="mlc-section">
        <div className="mlc-container mlc-cert-grid">
          <div className="mlc-cert-body">
            <span className="mlc-pill mlc-pill--light"><i className="fas fa-award" aria-hidden="true" /> Official certificate</span>
            <h2>The certificate you earn</h2>
            <p className="mlc-lede">Download, print, or email it the moment you pass.</p>
            <Link href={CTA_HREF} className="mlc-btn mlc-btn--primary">Get certified <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
          </div>
          <div className="mlc-cert-visual">
            <CourseCertificate courseTitle="Alcohol Seller-Server Certification" />
          </div>
        </div>
      </section>

      {/* Trust / stat strip */}
      <div className="mlc-stats">
        <div className="mlc-container mlc-stats-grid">
          <div className="mlc-stat"><div className="mlc-n">{STAT_CERTIFIED}</div><div className="mlc-l">Servers certified</div></div>
          <div className="mlc-stat"><div className="mlc-n">{STAT_MINUTES} min</div><div className="mlc-l">Average completion</div></div>
          <div className="mlc-stat"><div className="mlc-n">24/7</div><div className="mlc-l">Online access</div></div>
          <div className="mlc-stat"><div className="mlc-n">{STAT_RATING}</div><div className="mlc-l">Learner rating</div></div>
        </div>
      </div>

      {/* FAQ */}
      <section className="mlc-section mlc-sunk">
        <div className="mlc-narrow">
          <div className="mlc-head">
            <span className="mlc-pill mlc-pill--light"><i className="fas fa-circle-question" aria-hidden="true" /> Good to know</span>
            <h2>Questions, answered</h2>
          </div>
          <div className="mlc-faq">
            {FAQS.map((f) => (
              <div key={f.q} className="mlc-qa">
                <h3><i className={f.icon} aria-hidden="true" /> {f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <div className="mlc-final">
        <div className="mlc-container">
          <span className="mlc-pill mlc-pill--dark"><i className="fas fa-bolt" aria-hidden="true" /> Ready when you are</span>
          <h2>Get certified before your next shift</h2>
          <p>Join {STAT_CERTIFIED} servers who trained the easy way.</p>
          <Link href={CTA_HREF} className="mlc-btn mlc-btn--primary">Get certified <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
          <div className="mlc-micro mlc-micro--dark">
            <span><i className="fas fa-lock" aria-hidden="true" /> Secure checkout</span>
            <span><i className="fas fa-shield-halved" aria-hidden="true" /> State-approved where required</span>
          </div>
        </div>
      </div>

      {/* Footer (minimal, no nav) */}
      <footer className="mlc-footer">
        <div className="mlc-container">
          <div className="mlc-fbrand">Train 321</div>
          <p style={{ margin: "8px 0 0" }}>Food handler, alcohol and compliance training. <a href={`tel:${PHONE.replace(/\D/g, "")}`}>{PHONE}</a></p>
          <p style={{ margin: "6px 0 0", color: "#6c8498" }}>© 2026 Train 321. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}

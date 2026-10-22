import type { Metadata } from "next";
import Link from "next/link";
import { getCourse } from "@/lib/sanity";
import CourseCertificate from "@/components/CourseCertificate";
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
// Course duration shown in the hero. PLACEHOLDER - replace with a real,
// verifiable figure before launch.
const STAT_DURATION = "About 1 hour"; // PLACEHOLDER - confirm before launch

const LEARN = [
  {
    icon: "fas fa-eye",
    title: "Recognize the signs",
    body: "Spot the common indicators of trafficking in everyday settings."
  },
  {
    icon: "fas fa-phone-volume",
    title: "Report safely",
    body: "Know who to contact and how to respond without putting anyone at risk."
  },
  {
    icon: "fas fa-certificate",
    title: "Earn a certificate",
    body: "Finish online and download proof of your training the same day."
  }
];

const FAQS = [
  { q: "How long does it take?", a: "Most people finish in about an hour." },
  { q: "Do I get a certificate?", a: "Yes, you can download it as soon as you finish." },
  { q: "Can my team take it together?", a: "Yes, enroll staff and keep every certificate in one place." }
];

export default async function HumanTraffickingLanding() {
  let course = null;
  try {
    course = await getCourse("human-trafficking");
  } catch {}

  const imageSrc = course?.image || "/img/hero-team-video-poster.jpg";
  const imageAlt = course?.title || "Human trafficking awareness training";

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
            A short online course that teaches you to recognize the signs of trafficking and report them safely.
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

      {/* Slim full-width image band — the course's own image */}
      <div className="mle-band">
        <img src={imageSrc} alt={imageAlt} />
      </div>

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

      {/* ── Certificate ─────────────────────────────────────────────────── */}
      <section className="mle-section mle-sunk">
        <div className="mle-cert-col">
          <span className="mle-eyebrow"><i className="fas fa-award" aria-hidden="true" /> Your certificate</span>
          <p className="mle-cert-line">Finish the course and download the certificate shown below.</p>
          <div className="mle-cert-frame">
            <CourseCertificate courseTitle="Human Trafficking Awareness Training" />
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="mle-section">
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

import type { Metadata } from "next";
import Link from "next/link";
import { getHomePage, getSiteSettings, type PillarCard } from "@/lib/sanity";
import "./marketing-v9.css";

// "Get started" email destination hub. A new, isolated route for email
// campaigns: the email's "Get started" button points here, and the visitor
// picks their training. Nothing imports it and it imports no existing page, so
// it can't affect the rest of the site. noindex keeps it out of search.
export const metadata: Metadata = {
  title: "Get started — food, alcohol & workplace training | Train 321",
  description:
    "Pick your training and get certified online. ANSI-accredited food, alcohol and workplace compliance courses, finished on your phone, certificate the same day.",
  alternates: { canonical: "/marketing-v9" },
  robots: { index: false, follow: true }
};

// Where the main "browse everything" button goes.
const CATALOG_HREF = "/catalog";
const PHONE = "561-325-7300";

// Shown only if Studio's home document has no pillars yet. The live cards come
// from Sanity (home.pillars), the same source the home page uses.
const FALLBACK: PillarCard[] = [
  {
    icon: "fas fa-utensils",
    tone: "amber",
    title: "Food safety",
    body: "Food Handler and Food Manager certification for restaurant staff and managers.",
    linkLabel: "Browse food safety",
    linkHref: "/food-handler"
  },
  {
    icon: "fas fa-wine-glass-alt",
    tone: "plum",
    title: "Alcohol & service",
    body: "Responsible alcohol server and seller training, with state-approved courses where required.",
    linkLabel: "Browse alcohol safety",
    linkHref: "/alcohol"
  },
  {
    icon: "fas fa-users-cog",
    tone: "emerald",
    title: "Workplace compliance",
    body: "Sexual harassment prevention, human trafficking awareness, and other workplace courses.",
    linkLabel: "Browse workplace courses",
    linkHref: "/human-resources"
  }
];

const STEPS = [
  { n: 1, title: "Choose your course", body: "Pick the food safety, alcohol safety, or workplace training you need for work." },
  { n: 2, title: "Train online", body: "Finish on your phone or computer in about an hour, in English or Spanish." },
  { n: 3, title: "Get your certificate", body: "Pass the course and download your certificate the moment you are done." }
];

export default async function GetStartedLanding() {
  let pillars: PillarCard[] | undefined;
  let phone = PHONE;
  try {
    const [home, settings] = await Promise.all([getHomePage(), getSiteSettings()]);
    pillars = home?.pillars?.length ? home.pillars : undefined;
    phone = settings?.phone || PHONE;
  } catch {
    /* fall back to the defaults below */
  }
  const cards = pillars || FALLBACK;

  return (
    <div className="t321-gs">

      {/* Email landing page: hide the global site header + footer. This style
          ships only in this route's HTML and unmounts on navigation away. */}
      <style>{`.t321-mkt-header,.t321-mkt-footer{display:none !important;}`}</style>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="gs-hero">
        <div className="gs-container">
          <span className="gs-pill"><i className="fas fa-bolt" aria-hidden="true" /> Welcome to Train 321</span>
          <h1>Let&rsquo;s get you <em>certified.</em></h1>
          <p className="gs-lede">Pick the training you need below and finish online in about an hour. ANSI-accredited and accepted in all 50 states.</p>
          <div className="gs-cta-row">
            <Link href={CATALOG_HREF} className="gs-btn gs-btn--primary">Browse all courses <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
          </div>
          <ul className="gs-trust">
            <li><i className="fas fa-shield-halved" aria-hidden="true" /> ANSI-accredited</li>
            <li><i className="fas fa-flag-usa" aria-hidden="true" /> Accepted in 50 states</li>
            <li><i className="fas fa-bolt" aria-hidden="true" /> Instant certificate</li>
          </ul>
        </div>
      </section>

      {/* ── Chooser (dynamic from the home document) ───────────────────── */}
      <section className="gs-section">
        <div className="gs-container">
          <div className="gs-head">
            <span className="gs-pill"><i className="fas fa-tag" aria-hidden="true" /> Choose your training</span>
            <h2>What do you need?</h2>
            <p className="gs-lede">Three categories, one platform. Pick the one that fits your role.</p>
          </div>
          <div className="gs-pillars">
            {cards.map((p, i) => (
              <Link key={i} href={p.linkHref || "#"} className={`gs-pillar gs-pillar--${p.tone || "amber"}`}>
                <span className="gs-pillar__icon" aria-hidden="true"><i className={p.icon || "fas fa-circle"} /></span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
                <span className="gs-pillar__link">{p.linkLabel || "Browse courses"} <i className="fas fa-arrow-right" aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section className="gs-section gs-sunk">
        <div className="gs-container">
          <div className="gs-head">
            <span className="gs-pill"><i className="fas fa-wand-magic-sparkles" aria-hidden="true" /> How it works</span>
            <h2>Certified in three steps</h2>
          </div>
          <div className="gs-steps">
            {STEPS.map((s) => (
              <div key={s.n} className="gs-step">
                <span className="gs-step__num">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <section className="gs-final">
        <div className="gs-container">
          <span className="gs-pill"><i className="fas fa-bolt" aria-hidden="true" /> Ready when you are</span>
          <h2 style={{ marginTop: "14px" }}>Get certified before your next shift</h2>
          <p>Pick your course and finish online today.</p>
          <div className="gs-cta-row">
            <Link href={CATALOG_HREF} className="gs-btn gs-btn--primary">Browse all courses <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      {/* ── Footer (minimal, no nav) ───────────────────────────────────── */}
      <footer className="gs-footer">
        <div className="gs-container">
          <div className="gs-fbrand">Train 321</div>
          <p style={{ margin: "8px 0 0" }}>Food handler, alcohol and compliance training. <a href={`tel:${phone.replace(/\D/g, "")}`}>{phone}</a></p>
          <p style={{ margin: "6px 0 0", color: "#6c8498" }}>© 2026 Train 321. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}

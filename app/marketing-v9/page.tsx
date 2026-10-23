import type { Metadata } from "next";
import Link from "next/link";
import { getTestimonials, getSiteSettings, type Testimonial } from "@/lib/sanity";
import { getCartCourse, type CartCourse } from "@/lib/enroll";
import TestimonialsV9 from "./TestimonialsV9";
import CourseCheckout from "./CourseCheckout";
import "./marketing-v9.css";

// v9 landing page: the full marketing page (hero, benefits, how-it-works,
// testimonials, FAQ) WITH a checkout section built in. /marketing-v9?ids=856,692
// pre-fills the checkout section with those courses so a visitor can buy right
// on the page. noindex. Isolated: it only READS course + price data — nothing
// is charged or created.
export const metadata: Metadata = {
  title: "Get started — food, alcohol & workplace training | Train 321",
  description:
    "Enroll in ANSI-accredited food, alcohol and workplace compliance courses. Finish online in about an hour, certificate the same day.",
  alternates: { canonical: "/marketing-v9" },
  robots: { index: false, follow: true }
};

const CATALOG_HREF = "/catalog";

type Stat = { value: string; label: string };
const FALLBACK_STATS: Stat[] = [
  { value: "50,000+", label: "Workers certified" },
  { value: "4.9/5", label: "Learner rating" },
  { value: "50", label: "States accepted" },
  { value: "~1 hr", label: "Average completion" }
];

const STEPS = [
  { n: 1, title: "Choose your course", body: "Pick the food safety, alcohol safety, or workplace training you need for work." },
  { n: 2, title: "Train online", body: "Finish on your phone or computer in about an hour, in English or Spanish." },
  { n: 3, title: "Get your certificate", body: "Pass the course and download your certificate the moment you are done." }
];

export default async function GetStartedLanding({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Courses to pre-fill the checkout section come from the URL:
  // /marketing-v9?ids=856,692 (single id or comma-separated list).
  const sp = await searchParams;
  const idsParam = sp.ids ?? sp.course ?? sp.id;
  const raw = idsParam ? (Array.isArray(idsParam) ? idsParam.join(",") : idsParam) : "";
  const ids = [
    ...new Set(raw.split(",").map((s) => Number(s.trim())).filter((n) => Number.isInteger(n) && n > 0))
  ];
  const resolved = await Promise.all(ids.map((n) => getCartCourse(n)));
  const courses = resolved.filter((c): c is CartCourse => c !== null);
  const hasCheckout = courses.length > 0;

  // Account type + email come from the campaign URL:
  // ?audience=individual|company_admin&email=...
  const audRaw = (Array.isArray(sp.audience) ? sp.audience[0] : sp.audience) || (Array.isArray(sp.type) ? sp.type[0] : sp.type) || "";
  // Default to individual unless the query explicitly says company/company_admin.
  const audience: "individual" | "company" = /^comp/i.test(audRaw) ? "company" : "individual";
  const prefillEmail = (Array.isArray(sp.email) ? sp.email[0] : sp.email) || "";

  let testimonials: Testimonial[] = [];
  let stats: Stat[] = [];
  try { testimonials = await getTestimonials(); } catch { /* skip social proof */ }
  try { const s = await getSiteSettings(); stats = s.companyStats?.length ? s.companyStats : FALLBACK_STATS; } catch { stats = FALLBACK_STATS; }

  const quotes = (testimonials.filter((t) => t.featured).length ? testimonials.filter((t) => t.featured) : testimonials).slice(0, 6);

  return (
    <div className="t321-gs">
      {/* Landing page: hide the full site header/footer and use a minimal one. */}
      <style>{`.t321-mkt-header,.t321-mkt-footer{display:none !important;}`}</style>

      {/* ── Hero (with the checkout built in when ?ids= is present) ─────── */}
      <section className={`gs-hero${hasCheckout ? " gs-hero--buy" : ""}`}>
        <span className="gs-hero__deco gs-hero__deco--1" aria-hidden="true"><i className="fas fa-id-badge" /></span>
        <span className="gs-hero__deco gs-hero__deco--2" aria-hidden="true"><i className="fas fa-certificate" /></span>
        <span className="gs-hero__deco gs-hero__deco--3" aria-hidden="true"><i className="fas fa-graduation-cap" /></span>
        <span className="gs-hero__deco gs-hero__deco--4" aria-hidden="true"><i className="fas fa-paper-plane" /></span>
        <span className="gs-hero__deco gs-hero__deco--5" aria-hidden="true"><i className="fas fa-award" /></span>
        <span className="gs-hero__deco gs-hero__deco--6" aria-hidden="true"><i className="fas fa-star" /></span>
        <span className="gs-hero__deco gs-hero__deco--7" aria-hidden="true"><i className="fas fa-shield-halved" /></span>
        <span className="gs-hero__deco gs-hero__deco--8" aria-hidden="true"><i className="fas fa-clipboard-check" /></span>
        <div className="gs-container gs-hero__center">
          <div className="gs-hero__rating">
            <span className="gs-stars" aria-hidden="true">★★★★★</span>
            <span><strong>4.9/5</strong> from 50,000+ learners</span>
          </div>
          <h1>{hasCheckout ? <>You&rsquo;re one step from <em>getting certified.</em></> : <>Find your required training and <em>get certified today.</em></>}</h1>
          <p className="gs-lede">{hasCheckout
            ? "Create your account or sign in below to finish enrolling — instant access, certificate the same day, accepted in all 50 states."
            : "Food, alcohol, and workplace courses you finish on your phone in about an hour. Certificate the same day, accepted in all 50 states."}</p>
          {!hasCheckout && (
            <div className="gs-cta-row" style={{ marginTop: "26px" }}>
              <Link href={CATALOG_HREF} className="gs-btn gs-btn--primary gs-btn--lg">
                Browse all courses <i className="fas fa-arrow-right" aria-hidden="true" />
              </Link>
            </div>
          )}
          <ul className="gs-trust">
            <li><i className="fas fa-shield-halved" aria-hidden="true" /> ANSI-accredited</li>
            <li><i className="fas fa-flag-usa" aria-hidden="true" /> Accepted in 50 states</li>
            <li><i className="fas fa-bolt" aria-hidden="true" /> Instant certificate</li>
          </ul>
        </div>
      </section>

      {/* ── Checkout on a dark band — the one card floats on dark (dark shows
          left/right), with the stat band below it. ──────────────────────── */}
      {hasCheckout ? (
        <section className="gs-buyzone" id="checkout">
          <div className="gs-container">
            <div className="gs-buyzone__box">
              <p className="gs-buyzone__label"><i className="fas fa-lock" aria-hidden="true" /> Secure checkout — create your account or sign in to start today</p>
              <CourseCheckout courses={courses} audience={audience} prefillEmail={prefillEmail} />
              <div className="gs-buyzone__stats gs-stats__grid">
                {stats.slice(0, 4).map((s, i) => (
                  <div key={i} className="gs-stat"><div className="gs-stat__n">{s.value}</div><div className="gs-stat__l">{s.label}</div></div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div className="gs-stats">
          <div className="gs-container gs-stats__grid">
            {stats.slice(0, 4).map((s, i) => (
              <div key={i} className="gs-stat"><div className="gs-stat__n">{s.value}</div><div className="gs-stat__l">{s.label}</div></div>
            ))}
          </div>
        </div>
      )}

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

      {/* ── Testimonials ───────────────────────────────────────────────── */}
      {quotes.length > 0 && (
        <section className="gs-section gs-tsec">
          <span className="gs-tdeco gs-tdeco--1" aria-hidden="true"><i className="fas fa-comment-dots" /></span>
          <span className="gs-tdeco gs-tdeco--2" aria-hidden="true"><i className="fas fa-star" /></span>
          <span className="gs-tdeco gs-tdeco--3" aria-hidden="true"><i className="fas fa-thumbs-up" /></span>
          <span className="gs-tdeco gs-tdeco--4" aria-hidden="true"><i className="fas fa-heart" /></span>
          <div className="gs-container">
            <div className="gs-head">
              <span className="gs-pill"><i className="fas fa-quote-right" aria-hidden="true" /> What learners say</span>
              <h2>Trusted by thousands of workers</h2>
            </div>
            <TestimonialsV9 items={quotes} />
          </div>
        </section>
      )}

      <footer className="gs-footer">
        <div className="gs-container">
          <div className="gs-fbrand">Train 321</div>
          <p>Food handler, alcohol and compliance training. <a href="tel:5613257300">561-325-7300</a></p>
          <p className="gs-foot-fine">© 2026 Train 321. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

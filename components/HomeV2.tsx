// Conversion- and SEO-focused homepage variant. Server component (no client
// JS) so all copy ships in the initial HTML and the page stays fast. Lives at
// /v2 — the canonical homepage at app/page.tsx is untouched.
//
// Positioning is grounded in three things the big compliance-training sites
// (ServSafe, StateFoodSafety, 360training/Learn2Serve, TIPS, EasyLlama) get
// wrong: they hide their price, lead with a category label instead of an
// outcome, and force a demo before you can buy. This page does the opposite —
// price up front, speed in the headline, both buyers (individual + operator)
// served on one page.

import Link from "next/link";
import type { Course, Testimonial, FaqGroup, TrustLogo } from "@/lib/sanity";
import TrustLogosCarousel from "./TrustLogosCarousel";
import "./HomeV2.css";

type CompanyStat = { value: string; label: string };

type Props = {
  courses: Course[];
  testimonials: Testimonial[];
  faqs: FaqGroup[];
  companyStats: CompanyStat[];
  trustLogos?: TrustLogo[];
};

// Fallback prices match content/courses/*.json. Live LMS prices (when present)
// arrive on the course objects and win.
const PRICE_FALLBACK: Record<string, number> = {
  "food-handler": 14,
  alcohol: 15,
  "food-manager": 99,
  "sexual-harassment": 19,
  "human-trafficking": 12
};

function priceOf(courses: Course[], slug: string): number {
  const c = courses.find((x) => x.slug === slug);
  return c?.priceFrom ?? PRICE_FALLBACK[slug] ?? 0;
}

function initials(name: string) {
  return (name || "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// Popular states for the acceptance section. The credential name genuinely
// differs by state (WA issues a "Food Worker Card", not "handler"), and a few
// jurisdictions run their own county programs — calling that out directly is
// what defuses the buyer's #1 fear: "will my card actually be accepted here?"
const STATES = [
  "California",
  "Texas",
  "Florida",
  "Arizona",
  "Washington",
  "Illinois",
  "New York",
  "Nevada",
  "Oregon",
  "New Mexico",
  "Utah",
  "Oklahoma"
];

export default function HomeV2({
  courses,
  testimonials,
  faqs,
  companyStats,
  trustLogos = []
}: Props) {
  const foodPrice = priceOf(courses, "food-handler");
  const alcoholPrice = priceOf(courses, "alcohol");
  const managerPrice = priceOf(courses, "food-manager");
  const shPrice = priceOf(courses, "sexual-harassment");
  const htPrice = priceOf(courses, "human-trafficking");

  const quotes = testimonials.slice(0, 3);
  const faqItems = faqs.flatMap((g) => g.items).slice(0, 6);

  // Pull the headline counts from live site settings so the trust strip can't
  // contradict the stats band lower down the page.
  const certCount = companyStats.find((s) => /cert/i.test(s.label))?.value || "500,000+";
  const bizCount = companyStats.find((s) => /business/i.test(s.label))?.value || "12,400+";

  const categories = [
    {
      icon: "fas fa-utensils",
      tone: "amber",
      eyebrow: "Food safety",
      title: "Food Handler & Manager",
      body: "Personal hygiene, temperatures, allergens, cross-contamination. The card every kitchen and front-of-house job asks for.",
      price: foodPrice,
      managerPrice,
      bullets: ["Food Handler", "Food Manager", "ANAB-accredited"],
      href: "/courses/food-handler",
      linkLabel: "See food safety"
    },
    {
      icon: "fas fa-wine-glass-alt",
      tone: "plum",
      eyebrow: "Responsible alcohol service",
      title: "Alcohol Seller / Server",
      body: "Spot fake IDs, read intoxication, refuse a sale without losing the guest. TIPS-equivalent and approved in 48 states.",
      price: alcoholPrice,
      bullets: ["Seller / server", "Bar & service basics", "Security host"],
      href: "/courses/alcohol",
      linkLabel: "See alcohol training"
    },
    {
      icon: "fas fa-scale-balanced",
      tone: "emerald",
      eyebrow: "HR & compliance",
      title: "Harassment & Trafficking",
      body: "State-specific harassment training (CA SB 1343, IL, NY) plus human-trafficking awareness for hospitality.",
      price: shPrice,
      htPrice,
      bullets: ["Sexual harassment", "Human trafficking", "Supervisor track"],
      href: "/courses/sexual-harassment",
      linkLabel: "See HR & compliance"
    }
  ];

  return (
    <div className="t321-v2">
      {/* ───────────────────────── Hero ───────────────────────── */}
      <section className="t321-v2-hero">
        <div className="t321-mkt-container t321-v2-hero__inner">
          <div className="t321-v2-hero__copy">
            <span className="t321-v2-kicker">
              <i className="fas fa-shield-halved" aria-hidden="true" /> ANAB-accredited · accepted in all 50 states
            </span>
            <h1 className="t321-v2-h1">
              Get the certificate your job needs, <em>done in under an hour.</em>
            </h1>
            <p className="t321-v2-lede">
              Food handler, alcohol, and harassment training you take on your phone.
              Pass and your certificate downloads the same minute. Starts at ${foodPrice} —
              and that&rsquo;s the price right here, not after you sign up.
            </p>
            <div className="t321-v2-hero__cta">
              <Link href="/catalog" className="t321-mkt-btn t321-mkt-btn--primary t321-mkt-btn--lg">
                Find your course <i className="fas fa-arrow-right" aria-hidden="true" />
              </Link>
              <Link href="/services" className="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg">
                <i className="fas fa-users" aria-hidden="true" /> Training a team?
              </Link>
            </div>
            <ul className="t321-v2-hero__pills">
              <li><i className="fas fa-bolt" aria-hidden="true" /> Under 1 hour</li>
              <li><i className="fas fa-file-arrow-down" aria-hidden="true" /> Instant certificate</li>
              <li><i className="fas fa-tag" aria-hidden="true" /> From ${foodPrice}</li>
            </ul>
          </div>

          {/* Hero photo with the proof cards floating over it. */}
          <aside className="t321-v2-hero__visual" aria-hidden="true">
            <div className="t321-v2-figure">
              <span className="t321-v2-figure__glow" />
              <img
                src="/img/individual-phone.png"
                alt=""
                width={1122}
                height={1402}
                className="t321-v2-figure__photo"
              />

              <div className="t321-v2-rating t321-v2-float t321-v2-float--rating">
                <strong>4.8</strong>
                <div>
                  <div className="t321-v2-rating__stars" aria-label="4.8 out of 5">
                    <i className="fas fa-star" /><i className="fas fa-star" /><i className="fas fa-star" /><i className="fas fa-star" /><i className="fas fa-star-half-stroke" />
                  </div>
                  <span>Average learner rating</span>
                </div>
              </div>

              <div className="t321-v2-issued t321-v2-float t321-v2-float--issued">
                <span className="t321-v2-issued__seal">
                  <svg viewBox="0 0 64 64" aria-hidden="true">
                    <circle cx="32" cy="32" r="26" />
                    <path d="M20 33 l8 8 l16 -17" />
                  </svg>
                </span>
                <div>
                  <span className="t321-v2-issued__eyebrow">Certificate issued</span>
                  <strong>Issued the moment you pass</strong>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ──────────────────── Trust strip ──────────────────── */}
      <section className="t321-mkt-section t321-mkt-section--tight t321-v2-trust">
        <div className="t321-mkt-container">
          <p className="t321-v2-trust__line">
            <strong>{certCount} certifications</strong> issued for <strong>{bizCount} businesses</strong> — from single-location owners to national chains.
          </p>
          <TrustLogosCarousel
            logos={trustLogos}
            label="Trusted by state restaurant associations and multi-unit operators nationwide"
          />
        </div>
      </section>

      {/* ──────────────── Categories with prices up front ──────────────── */}
      <section className="t321-mkt-section">
        <div className="t321-mkt-container">
          <div className="t321-mkt-section__head">
            <span className="t321-mkt-eyebrow"><i className="fas fa-layer-group" /> Pick what you need</span>
            <h2 className="t321-mkt-h2">Every course. Every price. No surprises at checkout.</h2>
            <p className="t321-mkt-lede">
              Most training sites make you start an account before they&rsquo;ll show a number.
              Here&rsquo;s what each costs, before you give us anything.
            </p>
          </div>
          <div className="t321-v2-cats">
            {categories.map((c) => (
              <Link key={c.title} href={c.href} className="t321-v2-cat">
                <div className={`t321-v2-cat__top t321-v2-cat__top--${c.tone}`}>
                  <span className="t321-v2-cat__icon"><i className={c.icon} /></span>
                  <span className="t321-v2-cat__price">from ${c.price}</span>
                </div>
                <span className="t321-v2-cat__eyebrow">{c.eyebrow}</span>
                <h3 className="t321-mkt-h3">{c.title}</h3>
                <p>{c.body}</p>
                <ul className="t321-v2-cat__list">
                  {c.bullets.map((b) => (
                    <li key={b}><i className="fas fa-check" /> {b}</li>
                  ))}
                </ul>
                <span className="t321-v2-cat__link">{c.linkLabel} <i className="fas fa-arrow-right" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── How it works (individual) ──────────────── */}
      <section className="t321-mkt-section t321-mkt-section--sunk">
        <div className="t321-mkt-container">
          <div className="t321-mkt-section__head">
            <span className="t321-mkt-eyebrow"><i className="fas fa-bolt" /> How it works</span>
            <h2 className="t321-mkt-h2">Certified in under an hour. Most people finish in one sitting.</h2>
          </div>
          <ol className="t321-v2-steps">
            <li>
              <span className="t321-v2-steps__num">1</span>
              <h3 className="t321-mkt-h3">Tell us your state</h3>
              <p>Pick your state and your role. We show you the exact course your county and employer accept — no guessing which version you need.</p>
            </li>
            <li>
              <span className="t321-v2-steps__num">2</span>
              <h3 className="t321-mkt-h3">Take it on your phone</h3>
              <p>Short lessons built for the phone in your apron pocket. Pause mid-shift, pick up later. Progress saves on its own.</p>
            </li>
            <li>
              <span className="t321-v2-steps__num">3</span>
              <h3 className="t321-mkt-h3">Download your certificate</h3>
              <p>Pass the final and your certificate downloads instantly. Email it to your manager or the health department the same day.</p>
            </li>
          </ol>
        </div>
      </section>

      {/* ──────────────── Operator wedge ──────────────── */}
      <section className="t321-mkt-section t321-v2-team">
        <div className="t321-mkt-container t321-v2-team__inner">
          <div className="t321-v2-team__copy">
            <span className="t321-mkt-eyebrow"><i className="fas fa-users-gear" /> For operators</span>
            <h2 className="t321-mkt-h2">Train the whole team — food, alcohol, and HR — from one dashboard.</h2>
            <p className="t321-mkt-lede">
              The big providers make you pick a lane: food sites for one cert, HR
              platforms for another. Run all of it here, on one login, one invoice.
            </p>
            <ul className="t321-v2-team__feats">
              <li><i className="fas fa-file-csv" /> <span>Invite your team by email or CSV upload. Everyone starts the same day.</span></li>
              <li><i className="fas fa-chart-line" /> <span>See who&rsquo;s done, who&rsquo;s mid-course, and who hasn&rsquo;t started — live.</span></li>
              <li><i className="fas fa-file-export" /> <span>Export a completion report your inspector or insurer accepts, in seconds.</span></li>
              <li><i className="fas fa-tags" /> <span>Per-seat price drops automatically at 10, 25, 50, and 100 seats.</span></li>
            </ul>
            <div className="t321-v2-team__cta">
              <Link href="/services" className="t321-mkt-btn t321-mkt-btn--primary t321-mkt-btn--lg">
                See team pricing <i className="fas fa-arrow-right" />
              </Link>
              <Link href="/demo" className="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg">
                <i className="fas fa-play-circle" /> Book a 15-min demo
              </Link>
            </div>
          </div>

          <div className="t321-v2-team__panel" aria-hidden="true">
            <div className="t321-v2-dash">
              <div className="t321-v2-dash__head">
                <span><i className="fas fa-table-list" /> Team progress</span>
                <span className="t321-v2-dash__pill">14 locations</span>
              </div>
              <div className="t321-v2-dash__rows">
                <div className="t321-v2-dash__row">
                  <span>Food Handler</span>
                  <div className="t321-v2-dash__track"><span style={{ width: "97%" }} /></div>
                  <em>97%</em>
                </div>
                <div className="t321-v2-dash__row">
                  <span>Alcohol Server</span>
                  <div className="t321-v2-dash__track"><span style={{ width: "88%" }} /></div>
                  <em>88%</em>
                </div>
                <div className="t321-v2-dash__row">
                  <span>Harassment (SB 1343)</span>
                  <div className="t321-v2-dash__track"><span style={{ width: "100%" }} /></div>
                  <em>100%</em>
                </div>
              </div>
              <div className="t321-v2-dash__foot">
                <i className="fas fa-quote-left" />
                <span>&ldquo;Certification rates went to 97% inside 30 days. Inspectors noticed.&rdquo; — Marci L., Coastal Hospitality Group</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── Acceptance / states (SEO + objection) ──────────────── */}
      <section className="t321-mkt-section t321-mkt-section--sunk">
        <div className="t321-mkt-container">
          <div className="t321-mkt-section__head">
            <span className="t321-mkt-eyebrow"><i className="fas fa-map-location-dot" /> Will it be accepted?</span>
            <h2 className="t321-mkt-h2">Approved in your state — including the counties that run their own rules.</h2>
            <p className="t321-mkt-lede">
              Our cards are ANAB-accredited and accepted by every state health department.
              For places that run their own program — Maricopa County (AZ), Clark County (NV),
              San Diego (CA) — we route you to the version that county requires.
            </p>
          </div>
          <div className="t321-v2-states">
            {STATES.map((s) => (
              <Link key={s} href="/catalog" className="t321-v2-state">
                <i className="fas fa-location-dot" aria-hidden="true" /> {s}
              </Link>
            ))}
            <Link href="/catalog" className="t321-v2-state t321-v2-state--all">
              All states <i className="fas fa-arrow-right" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────── Stats band ──────────────── */}
      {companyStats.length > 0 && (
        <section className="t321-mkt-section t321-mkt-section--ink">
          <div className="t321-mkt-container t321-v2-stats">
            {companyStats.map((s) => (
              <div key={s.label} className="t321-v2-stats__item">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ──────────────── Comparison ──────────────── */}
      <section className="t321-mkt-section">
        <div className="t321-mkt-container">
          <div className="t321-mkt-section__head">
            <span className="t321-mkt-eyebrow"><i className="fas fa-right-left" /> Why operators switch</span>
            <h2 className="t321-mkt-h2">The old way vs. the way it should work</h2>
          </div>
          <div className="t321-v2-compare">
            <div className="t321-v2-compare__col t321-v2-compare__col--old">
              <span className="t321-v2-compare__tag">The old way</span>
              <ul>
                <li><i className="fas fa-xmark" /> All-day classroom or a proctor appointment</li>
                <li><i className="fas fa-xmark" /> Price hidden until you&rsquo;ve made an account</li>
                <li><i className="fas fa-xmark" /> Certificate mailed, or a PDF days later</li>
                <li><i className="fas fa-xmark" /> No idea who on your team actually finished</li>
                <li><i className="fas fa-xmark" /> A different vendor for every course type</li>
              </ul>
            </div>
            <div className="t321-v2-compare__col t321-v2-compare__col--new">
              <span className="t321-v2-compare__tag t321-v2-compare__tag--new">With Train321</span>
              <ul>
                <li><i className="fas fa-check" /> Under an hour, on the phone you already carry</li>
                <li><i className="fas fa-check" /> Price shown up front — from ${foodPrice}</li>
                <li><i className="fas fa-check" /> Certificate downloads the second you pass</li>
                <li><i className="fas fa-check" /> Live dashboard + one-click completion export</li>
                <li><i className="fas fa-check" /> Food, alcohol, and HR under one login</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── Testimonials ──────────────── */}
      {quotes.length > 0 && (
        <section className="t321-mkt-section t321-mkt-section--sunk">
          <div className="t321-mkt-container">
            <div className="t321-mkt-section__head">
              <span className="t321-mkt-eyebrow"><i className="fas fa-comment-dots" /> What operators say</span>
              <h2 className="t321-mkt-h2">Real quotes from real customers</h2>
            </div>
            <div className="t321-v2-quotes">
              {quotes.map((t) => (
                <figure key={t.id} className="t321-v2-quote t321-mkt-card">
                  <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
                  <figcaption>
                    <div className="t321-v2-quote__avatar" aria-hidden="true">{initials(t.name)}</div>
                    <div>
                      <strong>{t.name}</strong>
                      <span>{[t.role, t.company].filter(Boolean).join(" · ")}</span>
                    </div>
                  </figcaption>
                  {t.stat && (
                    <p className="t321-v2-quote__stat">
                      <strong>{t.stat.value}</strong> {t.stat.label}
                    </p>
                  )}
                </figure>
              ))}
            </div>
            <div className="t321-v2-quotes__foot">
              <Link href="/testimonials" className="t321-mkt-btn t321-mkt-btn--subtle">
                Read more stories <i className="fas fa-arrow-right" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ──────────────── FAQ ──────────────── */}
      {faqItems.length > 0 && (
        <section className="t321-mkt-section">
          <div className="t321-mkt-container t321-v2-faq">
            <div className="t321-v2-faq__head">
              <span className="t321-mkt-eyebrow"><i className="fas fa-circle-question" /> Frequently asked</span>
              <h2 className="t321-mkt-h2">The questions buyers ask us first</h2>
              <p className="t321-mkt-lede">Straight answers. More on the full FAQ.</p>
              <Link href="/faq" className="t321-mkt-btn t321-mkt-btn--ghost">
                See all questions <i className="fas fa-arrow-right" />
              </Link>
            </div>
            <div className="t321-v2-faq__list">
              {faqItems.map((f, i) => (
                <details key={i} className="t321-v2-faq__item">
                  <summary>
                    <span>{f.q}</span>
                    <i className="fas fa-plus" aria-hidden="true" />
                  </summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ──────────────── Final CTA ──────────────── */}
      <section className="t321-mkt-section t321-mkt-section--ink">
        <div className="t321-mkt-container t321-v2-cta">
          <div>
            <h2 className="t321-mkt-h2">Pick your course and be certified today.</h2>
            <p className="t321-mkt-lede">
              You&rsquo;re less than an hour away. From ${foodPrice}, on your phone, certificate the same minute you pass.
            </p>
          </div>
          <div className="t321-v2-cta__actions">
            <Link href="/catalog" className="t321-mkt-btn t321-mkt-btn--accent t321-mkt-btn--lg">
              Find your course <i className="fas fa-arrow-right" />
            </Link>
            <Link href="/services" className="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg">
              Train a team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

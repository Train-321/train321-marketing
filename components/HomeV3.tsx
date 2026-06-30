// Dark / "midnight blue" homepage variant. Distinct from /v2 on purpose:
// full-bleed video hero, glassmorphism on navy, a bento course grid, and a
// horizontal stepper. Same real content + prices. Server component (no client
// JS) — the hero <video> is plain HTML autoplay/loop/muted.
//
// Drop a motion file at public/video/hero-train321.mp4 and it plays behind the
// hero. Until then the poster image shows, so nothing looks broken.

import Link from "next/link";
import type { Course, Testimonial, FaqGroup, TrustLogo } from "@/lib/sanity";
import TrustLogosCarousel from "./TrustLogosCarousel";
import "./HomeV3.css";

type CompanyStat = { value: string; label: string };

type Props = {
  courses: Course[];
  testimonials: Testimonial[];
  faqs: FaqGroup[];
  companyStats: CompanyStat[];
  trustLogos?: TrustLogo[];
};

const PRICE_FALLBACK: Record<string, number> = {
  "food-handler": 14,
  alcohol: 15,
  "food-manager": 99,
  "sexual-harassment": 19,
  "human-trafficking": 12
};

function priceOf(courses: Course[], slug: string): number {
  return courses.find((x) => x.slug === slug)?.priceFrom ?? PRICE_FALLBACK[slug] ?? 0;
}

function initials(name: string) {
  return (name || "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function HomeV3({
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

  const ratingStat = companyStats.find((s) => /rating/i.test(s.label))?.value || "4.8/5";
  const certCount = companyStats.find((s) => /cert/i.test(s.label))?.value || "100,000+";

  const featured = testimonials[0];
  const sideQuotes = testimonials.slice(1, 3);
  const faqItems = faqs.flatMap((g) => g.items).slice(0, 6);

  return (
    <div className="t321-v3">
      {/* ───────────────────────── Hero ───────────────────────── */}
      <section className="t321-v3-hero">
        <span className="t321-v3-hero__bg" aria-hidden="true" />
        <div className="t321-mkt-container t321-v3-hero__grid">
          <div className="t321-v3-hero__inner">
            <span className="t321-v3-chip">
              <i className="fas fa-shield-halved" aria-hidden="true" /> ANAB-accredited · accepted in all 50 states
            </span>
            <h1 className="t321-v3-h1">
              Get certified <span className="t321-v3-glow">today.</span>
            </h1>
            <p className="t321-v3-lede">
              Food, alcohol, and HR compliance training you finish on your phone in under an hour.
              Pass and your certificate downloads the same minute — from ${foodPrice}, accepted everywhere you work.
            </p>
            <div className="t321-v3-hero__cta">
              <Link href="/catalog" className="t321-v3-btn t321-v3-btn--primary">
                Find your course <i className="fas fa-arrow-right" aria-hidden="true" />
              </Link>
              <Link href="/services" className="t321-v3-btn t321-v3-btn--ghost">
                <i className="fas fa-users" aria-hidden="true" /> For teams
              </Link>
            </div>

            <dl className="t321-v3-hero__stats">
              <div><dt>{certCount}</dt><dd>certifications issued</dd></div>
              <div><dt>{ratingStat}</dt><dd>average learner rating</dd></div>
              <div><dt>Under 1 hr</dt><dd>most finish in one sitting</dd></div>
              <div><dt>50 states</dt><dd>cards accepted</dd></div>
            </dl>
          </div>

          <div className="t321-v3-hero__visual" aria-hidden="true">
            <span className="t321-v3-hero__glow" />
            <img
              src="/img/server.jpg"
              alt=""
              width={928}
              height={1152}
              className="t321-v3-hero__photo"
            />
          </div>
        </div>
      </section>

      {/* ───────────────────────── Trust ───────────────────────── */}
      <section className="t321-v3-section t321-v3-trust">
        <div className="t321-mkt-container">
          <div className="t321-v3-trust__panel">
            <TrustLogosCarousel
              logos={trustLogos}
              label="Trusted by state restaurant associations and multi-unit operators nationwide"
            />
          </div>
        </div>
      </section>

      {/* ───────────────────── Bento course grid ───────────────────── */}
      <section className="t321-v3-section t321-v3-section--sunk">
        <div className="t321-mkt-container">
          <header className="t321-v3-head">
            <span className="t321-v3-eyebrow"><i className="fas fa-layer-group" /> What you can get certified in</span>
            <h2 className="t321-v3-h2">One platform for every cert your team needs.</h2>
            <p className="t321-v3-sub">Real prices, shown up front. No account required to see a number.</p>
          </header>

          <div className="t321-v3-bento">
            <Link href="/courses/food-handler" className="t321-v3-tile t321-v3-tile--lg">
              <span className="t321-v3-tile__icon t321-v3-tile__icon--amber"><i className="fas fa-utensils" /></span>
              <span className="t321-v3-tile__price">from ${foodPrice}</span>
              <h3 className="t321-v3-tile__title">Food Handler &amp; Manager</h3>
              <p>Hygiene, temperatures, allergens, cross-contamination. The card every kitchen and front-of-house job asks for.</p>
              <ul className="t321-v3-tile__list">
                <li><i className="fas fa-check" /> Food Handler — from ${foodPrice}</li>
                <li><i className="fas fa-check" /> Food Manager — from ${managerPrice}</li>
                <li><i className="fas fa-check" /> ANAB-accredited, 50 states</li>
              </ul>
              <span className="t321-v3-tile__link">See food safety <i className="fas fa-arrow-right" /></span>
            </Link>

            <Link href="/courses/alcohol" className="t321-v3-tile">
              <span className="t321-v3-tile__icon t321-v3-tile__icon--cyan"><i className="fas fa-wine-glass-alt" /></span>
              <span className="t321-v3-tile__price">from ${alcoholPrice}</span>
              <h3 className="t321-v3-tile__title">Alcohol Seller / Server</h3>
              <p>Fake IDs, intoxication, responsible refusal. TIPS-equivalent, approved in 48 states.</p>
              <span className="t321-v3-tile__link">See alcohol training <i className="fas fa-arrow-right" /></span>
            </Link>

            <Link href="/courses/sexual-harassment" className="t321-v3-tile">
              <span className="t321-v3-tile__icon t321-v3-tile__icon--violet"><i className="fas fa-scale-balanced" /></span>
              <span className="t321-v3-tile__price">from ${Math.min(shPrice, htPrice)}</span>
              <h3 className="t321-v3-tile__title">Harassment &amp; Trafficking</h3>
              <p>State-specific harassment (CA SB 1343, IL, NY) and human-trafficking awareness for hospitality.</p>
              <span className="t321-v3-tile__link">See HR &amp; compliance <i className="fas fa-arrow-right" /></span>
            </Link>

            <div className="t321-v3-tile t321-v3-tile--feature">
              <div className="t321-v3-feat">
                <i className="fas fa-bolt" />
                <div><strong>Instant certificate</strong><span>Downloads the second you pass</span></div>
              </div>
              <div className="t321-v3-feat">
                <i className="fas fa-mobile-screen" />
                <div><strong>Built for the phone</strong><span>Pause mid-shift, pick up later</span></div>
              </div>
              <div className="t321-v3-feat">
                <i className="fas fa-table-list" />
                <div><strong>One dashboard for teams</strong><span>Invite, track, export to CSV</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────── How it works (stepper) ───────────────────── */}
      <section className="t321-v3-section">
        <div className="t321-mkt-container">
          <header className="t321-v3-head">
            <span className="t321-v3-eyebrow"><i className="fas fa-bolt" /> How it works</span>
            <h2 className="t321-v3-h2">Three steps. Most people finish in one sitting.</h2>
          </header>
          <ol className="t321-v3-stepper">
            <li>
              <span className="t321-v3-stepper__num">1</span>
              <h3>Tell us your state</h3>
              <p>Pick your state and role. We show the exact course your county and employer accept.</p>
            </li>
            <li>
              <span className="t321-v3-stepper__num">2</span>
              <h3>Take it on your phone</h3>
              <p>Short lessons, mobile-first. Progress saves on its own between shifts.</p>
            </li>
            <li>
              <span className="t321-v3-stepper__num">3</span>
              <h3>Download your certificate</h3>
              <p>Pass the final and it&rsquo;s yours instantly — email it to your manager the same day.</p>
            </li>
          </ol>
        </div>
      </section>

      {/* ───────────────────── Operator band ───────────────────── */}
      <section className="t321-v3-section">
        <div className="t321-mkt-container t321-v3-team">
          <div className="t321-v3-team__panel" aria-hidden="true">
            <div className="t321-v3-dash">
              <div className="t321-v3-dash__head">
                <span><i className="fas fa-table-list" /> Team progress</span>
                <span className="t321-v3-dash__pill">14 locations</span>
              </div>
              <div className="t321-v3-dash__row">
                <span>Food Handler</span>
                <div className="t321-v3-dash__track"><span style={{ width: "97%" }} /></div>
                <em>97%</em>
              </div>
              <div className="t321-v3-dash__row">
                <span>Alcohol Server</span>
                <div className="t321-v3-dash__track"><span style={{ width: "88%" }} /></div>
                <em>88%</em>
              </div>
              <div className="t321-v3-dash__row">
                <span>Harassment (SB 1343)</span>
                <div className="t321-v3-dash__track"><span style={{ width: "100%" }} /></div>
                <em>100%</em>
              </div>
            </div>
          </div>
          <div className="t321-v3-team__copy">
            <span className="t321-v3-eyebrow"><i className="fas fa-users-gear" /> For operators</span>
            <h2 className="t321-v3-h2">Train the whole team from one dashboard.</h2>
            <p className="t321-v3-sub">
              Food, alcohol, and HR on one login and one invoice. Invite by CSV, watch
              completions update live, and pull an inspector-ready report in seconds.
            </p>
            <ul className="t321-v3-checks">
              <li><i className="fas fa-check" /> Per-seat price drops at 10, 25, 50, and 100 seats</li>
              <li><i className="fas fa-check" /> Completion export your inspector or insurer accepts</li>
              <li><i className="fas fa-check" /> 97% certified across 14 locations in 30 days (Coastal Hospitality Group)</li>
            </ul>
            <div className="t321-v3-hero__cta">
              <Link href="/services" className="t321-v3-btn t321-v3-btn--primary">
                See team pricing <i className="fas fa-arrow-right" />
              </Link>
              <Link href="/demo" className="t321-v3-btn t321-v3-btn--outline">
                <i className="fas fa-play-circle" /> Book a 15-min demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────── Testimonials ───────────────────── */}
      {featured && (
        <section className="t321-v3-section t321-v3-section--sunk">
          <div className="t321-mkt-container">
            <header className="t321-v3-head">
              <span className="t321-v3-eyebrow"><i className="fas fa-comment-dots" /> What operators say</span>
              <h2 className="t321-v3-h2">Real quotes from real customers.</h2>
            </header>
            <div className="t321-v3-quotes">
              <figure className="t321-v3-quote t321-v3-quote--feature">
                <blockquote>&ldquo;{featured.quote}&rdquo;</blockquote>
                <figcaption>
                  <div className="t321-v3-quote__avatar">{initials(featured.name)}</div>
                  <div>
                    <strong>{featured.name}</strong>
                    <span>{[featured.role, featured.company].filter(Boolean).join(" · ")}</span>
                  </div>
                </figcaption>
                {featured.stat && (
                  <p className="t321-v3-quote__stat"><strong>{featured.stat.value}</strong> {featured.stat.label}</p>
                )}
              </figure>
              <div className="t321-v3-quotes__side">
                {sideQuotes.map((t) => (
                  <figure key={t.id} className="t321-v3-quote">
                    <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
                    <figcaption>
                      <div className="t321-v3-quote__avatar">{initials(t.name)}</div>
                      <div>
                        <strong>{t.name}</strong>
                        <span>{[t.role, t.company].filter(Boolean).join(" · ")}</span>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ───────────────────── FAQ ───────────────────── */}
      {faqItems.length > 0 && (
        <section className="t321-v3-section">
          <div className="t321-mkt-container t321-v3-faq">
            <header className="t321-v3-head t321-v3-head--left">
              <span className="t321-v3-eyebrow"><i className="fas fa-circle-question" /> Frequently asked</span>
              <h2 className="t321-v3-h2">The questions buyers ask first.</h2>
              <Link href="/faq" className="t321-v3-btn t321-v3-btn--outline">
                See all questions <i className="fas fa-arrow-right" />
              </Link>
            </header>
            <div className="t321-v3-faq__list">
              {faqItems.map((f, i) => (
                <details key={i} className="t321-v3-faq__item">
                  <summary><span>{f.q}</span><i className="fas fa-plus" aria-hidden="true" /></summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────────────────── Final CTA ───────────────────── */}
      <section className="t321-v3-section">
        <div className="t321-mkt-container">
          <div className="t321-v3-cta">
            <h2 className="t321-v3-cta__title">Pick your course and be certified today.</h2>
            <p>You&rsquo;re less than an hour away. From ${foodPrice}, on your phone, certificate the minute you pass.</p>
            <div className="t321-v3-hero__cta">
              <Link href="/catalog" className="t321-v3-btn t321-v3-btn--invert">
                Find your course <i className="fas fa-arrow-right" />
              </Link>
              <Link href="/services" className="t321-v3-btn t321-v3-btn--ghost-dark">
                Train a team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

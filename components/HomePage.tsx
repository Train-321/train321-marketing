"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Course, Testimonial, FaqGroup, TrustLogo, HomePage as HomePageDoc } from "@/lib/sanity";
import TrustLogosCarousel from "./TrustLogosCarousel";
import {
  HomeFinderProvider,
  FinderControls,
  FinderResults,
  type HomeMarketplace
} from "./HomeCourseFinder";
import { useCart } from "./cart/CartContext";
import "./HomePage.css";

type CompanyStat = { value: string; label: string };

const POPULAR_SLUGS = ["food-handler", "alcohol", "sexual-harassment", "food-manager"];

type Audience = "self" | "team";

type AudienceCopy = {
  eyebrow: string;
  h1Pre: string;
  h1Em: string;
  lede: string;
  ctaPrimary: { label: string; to: string };
  ctaGhost: { label: string; to: string; icon: string };
  trustLabel: string;
  stepsTitle: string;
  stepsLede: string;
  steps: Array<{ title: string; body: string }>;
  bottomTitle: string;
  bottomLede: string;
  bottomCtaSecondary: { label: string; to: string };
};

const AUDIENCE_COPY: Record<Audience, AudienceCopy> = {
  team: {
    eyebrow: "The faster way to certified staff",
    h1Pre: "Compliance training your team",
    h1Em: "actually finishes.",
    lede: "ANSI-accredited courses for food safety, alcohol service, and HR compliance. Rolled out across your whole team in under an hour. Accepted in all 50 states.",
    ctaPrimary: { label: "Browse courses", to: "/catalog" },
    ctaGhost: { label: "Watch a 2-minute demo", to: "/demo", icon: "fas fa-play-circle" },
    trustLabel: "Trusted by state restaurant associations and multi-unit operators nationwide",
    stepsTitle: "Certified in under an hour of your time",
    stepsLede: "Three steps. Your team does most of the work on their phones during prep.",
    steps: [
      { title: "Pick your courses", body: "Browse the catalog, choose seat counts. Volume pricing kicks in automatically at 10, 25, 50, and 100 seats." },
      { title: "Invite your team", body: "Add learners one at a time or upload a CSV. Every learner gets a personal link and can start the same day." },
      { title: "Track completion", body: "Your dashboard shows who's done, who's in progress, and who hasn't started. Certificates auto-issue on pass." }
    ],
    bottomTitle: "Ready to get your team certified?",
    bottomLede: "You're less than an hour away. Pick your courses, add your team, start today.",
    bottomCtaSecondary: { label: "Talk to sales", to: "/contact" }
  },
  self: {
    eyebrow: "Get certified on your phone, on your schedule",
    h1Pre: "Get certified",
    h1Em: "in under an hour.",
    lede: "ANSI-accredited courses for food safety, alcohol service, and HR compliance. Take it on your phone, get your certificate the same day. Accepted in all 50 states.",
    ctaPrimary: { label: "Find my course", to: "/catalog" },
    ctaGhost: { label: "See how it works", to: "/demo", icon: "fas fa-play-circle" },
    trustLabel: "Accepted by employers and health departments in all 50 states",
    stepsTitle: "Certified in under an hour",
    stepsLede: "Three steps. Most people finish in one sitting on their phone.",
    steps: [
      { title: "Pick your course", body: "Tell us your state and what your job needs. We'll show you exactly the right course — no guesswork." },
      { title: "Take it on your phone", body: "Short video lessons, mobile-first. Pause whenever, pick up where you left off. Most people finish in one sitting." },
      { title: "Get your certificate", body: "Pass the final and your certificate downloads instantly. Email it to your employer the same day." }
    ],
    bottomTitle: "Ready to get certified?",
    bottomLede: "You're less than an hour away. Pick your course, take it on your phone, certificate today.",
    bottomCtaSecondary: { label: "Have questions?", to: "/contact" }
  }
};

type ModuleState = "done" | "active" | "locked";
type HeroModule = { label: string; state: ModuleState; icon?: string };
type HeroCourse = {
  urlTitle: string;
  badge: string;
  title: string;
  time: string;
  progress: number;
  modules: HeroModule[];
};

const HERO_COURSES: HeroCourse[] = [
  {
    urlTitle: "Food Handler",
    badge: "Module 4 of 6",
    title: "Cleaning & Sanitizing",
    time: "06:42 / 10:48",
    progress: 62,
    modules: [
      { label: "Intro to food safety", state: "done" },
      { label: "Personal hygiene", state: "done" },
      { label: "Time & temperature", state: "done" },
      { label: "Cleaning & sanitizing", state: "active" },
      { label: "Allergen awareness", state: "locked" },
      { label: "Final exam", state: "locked", icon: "fa-award" }
    ]
  },
  {
    urlTitle: "Alcohol Safety",
    badge: "Module 3 of 6",
    title: "Checking IDs & Refusal",
    time: "04:18 / 09:12",
    progress: 48,
    modules: [
      { label: "Alcohol laws by state", state: "done" },
      { label: "Signs of intoxication", state: "done" },
      { label: "Checking IDs & refusal", state: "active" },
      { label: "Incident documentation", state: "locked" },
      { label: "Server responsibilities", state: "locked" },
      { label: "Final exam", state: "locked", icon: "fa-award" }
    ]
  },
  {
    urlTitle: "Sexual Harassment",
    badge: "Module 5 of 6",
    title: "Bystander Intervention",
    time: "08:04 / 11:36",
    progress: 78,
    modules: [
      { label: "Defining harassment", state: "done" },
      { label: "Protected classes", state: "done" },
      { label: "Reporting channels", state: "done" },
      { label: "Retaliation rules", state: "done" },
      { label: "Bystander intervention", state: "active" },
      { label: "Final exam", state: "locked", icon: "fa-award" }
    ]
  },
  {
    urlTitle: "Food Manager",
    badge: "Module 4 of 6",
    title: "HACCP Principles",
    time: "11:22 / 18:50",
    progress: 55,
    modules: [
      { label: "Foodborne illness", state: "done" },
      { label: "Receiving & storage", state: "done" },
      { label: "Prep & cooking temps", state: "done" },
      { label: "HACCP principles", state: "active" },
      { label: "Pest control", state: "locked" },
      { label: "Final exam", state: "locked", icon: "fa-award" }
    ]
  }
];

function moduleIcon(m: HeroModule) {
  if (m.icon) return "fas " + m.icon;
  if (m.state === "done") return "fas fa-check";
  if (m.state === "active") return "fas fa-play";
  return "fas fa-lock";
}

function initials(name: string) {
  return (name || "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type HomePageProps = {
  forcedAudience?: Audience | null;
  courses: Course[];
  testimonials: Testimonial[];
  companyStats: CompanyStat[];
  faqs: FaqGroup[];
  trustLogos?: TrustLogo[];
  home?: HomePageDoc | null;
  /** Marketplace catalog slice powering the hero course finder. */
  marketplace: HomeMarketplace;
};

export default function HomePage({
  forcedAudience = null,
  courses,
  testimonials,
  companyStats,
  faqs,
  trustLogos = [],
  home = null,
  marketplace
}: HomePageProps) {
  const [audience, setAudience] = useState<Audience>(forcedAudience || "self");
  const [courseIndex, setCourseIndex] = useState(0);
  const { setAudience: setCartAudience, buyer, ready: cartReady } = useCart();

  // Hydrate audience from localStorage when not pinned by prop.
  useEffect(() => {
    if (forcedAudience) {
      setAudience(forcedAudience);
      return;
    }
    try {
      const stored = window.localStorage.getItem("t321-audience");
      if (stored === "team" || stored === "self") setAudience(stored);
    } catch {
      /* localStorage unavailable */
    }
  }, [forcedAudience]);

  // The cart's buyer mode is the source of truth once it has hydrated — the
  // header's audience link and checkout's step-1 cards can both change it,
  // and the hero pills should follow rather than show a stale choice.
  useEffect(() => {
    if (forcedAudience || !cartReady) return;
    const val: Audience = buyer.audience === "company" ? "team" : "self";
    setAudience(val);
    try {
      window.localStorage.setItem("t321-audience", val);
    } catch {
      /* ignore */
    }
  }, [buyer.audience, cartReady, forcedAudience]);

  // Course-cycle timer (skipped when reduced motion is preferred).
  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = window.setInterval(() => {
      setCourseIndex((i) => (i + 1) % HERO_COURSES.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  const popularSlugsResolved = home?.popularSlugs?.length ? home.popularSlugs : POPULAR_SLUGS;
  const popularCourses = useMemo(
    () =>
      popularSlugsResolved.map((slug) => courses.find((c) => c.slug === slug)).filter(
        (x): x is Course => Boolean(x)
      ),
    [courses, popularSlugsResolved]
  );

  const featuredTestimonials = useMemo(() => testimonials.slice(0, 3), [testimonials]);
  const homeFaqs = useMemo(() => faqs[0]?.items?.slice(0, 4) || [], [faqs]);

  const activeCourse = HERO_COURSES[courseIndex] || HERO_COURSES[0];
  const baseCopy = AUDIENCE_COPY[audience] || AUDIENCE_COPY.team;
  const sanityAudience = audience === "team" ? home?.audienceTeam : home?.audienceSelf;
  // Resolution order, highest -> lowest priority:
  //   1. Per-audience Sanity copy (audienceTeam / audienceSelf) — must win
  //      so the in-page audience toggle actually changes content.
  //   2. Legacy single-hero Sanity overrides (heroEyebrow/heroHeadline/etc.)
  //      — only kick in when the per-audience block hasn't set that field.
  //   3. Hardcoded per-audience defaults.
  const copy = {
    ...baseCopy,
    eyebrow: sanityAudience?.eyebrow || home?.heroEyebrow || baseCopy.eyebrow,
    h1Pre: sanityAudience?.h1Pre || home?.heroHeadline || baseCopy.h1Pre,
    h1Em: sanityAudience?.h1Em || (sanityAudience?.h1Pre || home?.heroHeadline ? "" : baseCopy.h1Em),
    lede: sanityAudience?.lede || home?.heroSubcopy || baseCopy.lede,
    ctaPrimary: sanityAudience?.ctaPrimary?.label
      ? {
          label: sanityAudience.ctaPrimary.label,
          to: sanityAudience.ctaPrimary.to || baseCopy.ctaPrimary.to
        }
      : home?.heroPrimaryCta?.label
        ? {
            label: home.heroPrimaryCta.label,
            to: home.heroPrimaryCta.to || baseCopy.ctaPrimary.to
          }
        : baseCopy.ctaPrimary,
    ctaGhost: sanityAudience?.ctaGhost?.label
      ? {
          ...baseCopy.ctaGhost,
          label: sanityAudience.ctaGhost.label,
          to: sanityAudience.ctaGhost.to || baseCopy.ctaGhost.to
        }
      : home?.heroSecondaryCta?.label
        ? {
            ...baseCopy.ctaGhost,
            label: home.heroSecondaryCta.label,
            to: home.heroSecondaryCta.to || baseCopy.ctaGhost.to
          }
        : baseCopy.ctaGhost,
    trustLabel: sanityAudience?.trustLabel || baseCopy.trustLabel,
    stepsTitle: sanityAudience?.stepsTitle || baseCopy.stepsTitle,
    stepsLede: sanityAudience?.stepsLede || baseCopy.stepsLede,
    steps: sanityAudience?.steps?.length
      ? sanityAudience.steps.map((s) => ({ title: s.title || "", body: s.body || "" }))
      : baseCopy.steps,
    bottomTitle: sanityAudience?.bottomTitle || baseCopy.bottomTitle,
    bottomLede: sanityAudience?.bottomLede || baseCopy.bottomLede,
    bottomCtaSecondary: sanityAudience?.bottomCtaSecondary?.label
      ? {
          label: sanityAudience.bottomCtaSecondary.label,
          to: sanityAudience.bottomCtaSecondary.to || baseCopy.bottomCtaSecondary.to
        }
      : baseCopy.bottomCtaSecondary
  };
  const showAudienceToggle = !forcedAudience;

  const chooseAudience = (val: Audience) => {
    if (forcedAudience) return;
    // Route through the cart so a non-empty cart gets the "this clears your
    // Switching never clears the cart — items simply re-quote under the
    // other pricing model. The pill and localStorage follow via the
    // buyer-sync effect above.
    setCartAudience(val === "team" ? "company" : "individual");
  };

  const setCourse = (i: number) => setCourseIndex(i);

  return (
    <div className="t321-mkt-home">
      <HomeFinderProvider marketplace={marketplace}>
      <section className="t321-mkt-hero">
        <div className="t321-mkt-container t321-mkt-hero__inner">
          <div className="t321-mkt-hero__body">
            {showAudienceToggle && (
              <div
                className="t321-mkt-hero__audience"
                role="tablist"
                aria-label="Who is this for?"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={audience === "self"}
                  className={`t321-mkt-hero__audience-pill${audience === "self" ? " is-active" : ""}`}
                  onClick={() => chooseAudience("self")}
                >
                  <i className="fas fa-user" aria-hidden="true" /> For myself
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={audience === "team"}
                  className={`t321-mkt-hero__audience-pill${audience === "team" ? " is-active" : ""}`}
                  onClick={() => chooseAudience("team")}
                >
                  <i className="fas fa-users" aria-hidden="true" /> For my team
                </button>
              </div>
            )}
            <span className="t321-mkt-eyebrow">
              <i className="fas fa-bolt" aria-hidden="true" /> {copy.eyebrow}
            </span>
            <h1 className="t321-mkt-h1">
              {copy.h1Pre} <em>{copy.h1Em}</em>
            </h1>
            <p className="t321-mkt-lede">{copy.lede}</p>
            {/* The old Find-my-course / See-how-it-works button pair is
                replaced by the course finder: category chips + state picker
                here, live results in <FinderResults /> right below the hero. */}
            <FinderControls />
            <ul className="t321-mkt-hero__trust">
              {(home?.heroTrustPills?.length
                ? home.heroTrustPills
                : [
                    { icon: "fas fa-shield-alt", label: "ANSI-accredited" },
                    { icon: "fas fa-flag-usa", label: "Accepted in 50 states" },
                    { icon: "fas fa-bolt", label: "Instant certificate" }
                  ]
              ).map((p, i) => (
                <li key={i}>
                  <i className={p.icon || "fas fa-check"} aria-hidden="true" />
                  {p.label}
                </li>
              ))}
            </ul>
          </div>

          <aside
            className={`t321-mkt-hero__visual${audience === "self" ? " t321-mkt-hero__visual--figure" : ""}`}
            aria-hidden="true"
          >
            <span className="t321-mkt-hero__glow" />
            <span className="t321-mkt-hero__grid" />

            {audience === "self" ? (
              <img
                src="/img/hero-restaurant.png"
                alt=""
                width={1537}
                height={1023}
                className="t321-mkt-hero__photo"
              />
            ) : (
            <div className="t321-mkt-hero__stage t321-mkt-hero__float--a">
              <div className="t321-mkt-hero__stage-chrome">
                <span className="t321-mkt-hero__dot" />
                <span className="t321-mkt-hero__dot" />
                <span className="t321-mkt-hero__dot" />
                <span className="t321-mkt-hero__url">
                  <i className="fas fa-lock" /> train321.com · {activeCourse.urlTitle}
                </span>
              </div>
              <div className="t321-mkt-hero__stage-body">
                {/* NOTE: Vue's <transition name="t321-hero-swap"> was dropped in the React port.
                    The crossfade between courses is now a hard cut. Functionally equivalent. */}
                <div key={activeCourse.urlTitle} className="t321-mkt-hero__stage-frame">
                  <div className="t321-mkt-hero__lesson-head">
                    <span className="t321-mkt-hero__badge t321-mkt-hero__badge--soft">
                      <i className="fas fa-layer-group" /> {activeCourse.badge}
                    </span>
                    <span className="t321-mkt-hero__live">
                      <span className="t321-mkt-hero__live-dot" /> Live now
                    </span>
                  </div>
                  <strong className="t321-mkt-hero__lesson-title">{activeCourse.title}</strong>
                  <div className="t321-mkt-hero__player">
                    <span className="t321-mkt-hero__player-play"><i className="fas fa-play" /></span>
                    <div className="t321-mkt-hero__player-meta">
                      <div className="t321-mkt-hero__player-track">
                        <span
                          className="t321-mkt-hero__player-fill"
                          style={{ width: activeCourse.progress + "%" }}
                        />
                      </div>
                      <div className="t321-mkt-hero__player-time">
                        <span>{activeCourse.time}</span>
                        <span><i className="fas fa-closed-captioning" /> CC</span>
                      </div>
                    </div>
                  </div>
                  <ul className="t321-mkt-hero__modules">
                    {activeCourse.modules.map((m) => (
                      <li key={m.label} className={"is-" + m.state}>
                        <i className={moduleIcon(m)} /> {m.label}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="t321-mkt-hero__stage-dots" role="tablist" aria-label="Course preview">
                  {HERO_COURSES.map((c, i) => (
                    <button
                      key={c.urlTitle}
                      type="button"
                      className={`t321-mkt-hero__stage-dot${i === courseIndex ? " is-active" : ""}`}
                      aria-label={"Show " + c.urlTitle}
                      aria-selected={i === courseIndex}
                      onClick={() => setCourse(i)}
                    />
                  ))}
                </div>
              </div>
            </div>
            )}

            <div className="t321-mkt-hero__cert t321-mkt-hero__float--b">
              <div className="t321-mkt-hero__cert-seal">
                <svg viewBox="0 0 64 64">
                  <circle className="ring" cx="32" cy="32" r="26" />
                  <path className="tick" d="M20 33 l8 8 l16 -17" />
                </svg>
              </div>
              <div className="t321-mkt-hero__cert-body">
                <span className="t321-mkt-hero__cert-eyebrow">Certificate issued</span>
                <strong>Food Handler Certificate</strong>
                <span className="t321-mkt-hero__cert-sub">Valid through 2029 · #FH-384201</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="t321-mkt-section t321-mkt-section--sunk">
        <div className="t321-mkt-container">
          <div className="t321-mkt-section__head">
            <span className="t321-mkt-eyebrow"><i className={home?.popularHead?.icon || "fas fa-fire"} /> {home?.popularHead?.eyebrow || "Most enrolled"}</span>
            <h2 className="t321-mkt-h2">{home?.popularHead?.heading || "Popular courses"}</h2>
            <p className="t321-mkt-lede">{home?.popularHead?.lede || "The courses most operators start with. Click any to see details or enroll now."}</p>
          </div>
          <div className="t321-mkt-popular">
            {popularCourses.map((c) => (
              <Link
                key={c.slug}
                href={`/courses/${c.slug}`}
                className="t321-mkt-popular__card t321-mkt-card t321-mkt-card--hover"
              >
                <div className={`t321-mkt-popular__top is-tone-${c.color || "neutral"}`}>
                  <i className={c.icon} aria-hidden="true" />
                  {c.priceFrom != null && (
                    <span className="t321-mkt-popular__price">From ${c.priceFrom}</span>
                  )}
                </div>
                <div className="t321-mkt-popular__body">
                  <span className="t321-mkt-popular__eyebrow">{c.eyebrow}</span>
                  <h3 className="t321-mkt-h3">{c.title}</h3>
                  <p>{c.tagline}</p>
                  <span className="t321-mkt-popular__link">
                    See details <i className="fas fa-arrow-right" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="t321-mkt-popular__foot">
            <Link href="/catalog" className="t321-mkt-btn t321-mkt-btn--primary t321-mkt-btn--lg">
              {home?.popularCtaLabel || "Browse the full catalog"}
              <i className="fas fa-arrow-right" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="t321-mkt-section">
        <div className="t321-mkt-container">
          <div className="t321-mkt-section__head">
            <span className="t321-mkt-eyebrow"><i className={home?.pillarsHead?.icon || "fas fa-tag"} /> {home?.pillarsHead?.eyebrow || "What we do"}</span>
            <h2 className="t321-mkt-h2">{home?.pillarsHead?.heading || "Three categories. One platform."}</h2>
            <p className="t321-mkt-lede">
              {home?.pillarsHead?.lede || "Everything compliance-sensitive in the hospitality and service industries — under one login, one dashboard, one invoice."}
            </p>
          </div>
          <div className="t321-mkt-pillars">
            {(home?.pillars?.length
              ? home.pillars
              : [
                  { icon: "fas fa-utensils", tone: "amber", title: "Food safety", body: "Food Handler, Food Manager, accredited variants. Accepted by every state health department.", linkLabel: "Browse food safety", linkHref: "/food-handler" },
                  { icon: "fas fa-wine-glass-alt", tone: "plum", title: "Alcohol & service", body: "TIPS-equivalent alcohol server training plus bar basics, service basics, and security host.", linkLabel: "Browse alcohol & service", linkHref: "/alcohol" },
                  { icon: "fas fa-users-cog", tone: "emerald", title: "HR & compliance", body: "Sexual harassment (state-specific), human trafficking, and practical HR for managers.", linkLabel: "Browse HR & compliance", linkHref: "/human-resources" }
                ]
            ).map((p, i) => (
              <Link key={i} href={p.linkHref || "#"} className="t321-mkt-pillar t321-mkt-card t321-mkt-card--hover">
                <span className={`t321-mkt-pillar__icon t321-mkt-pillar__icon--${p.tone || "amber"}`}>
                  <i className={p.icon || "fas fa-circle"} />
                </span>
                <h3 className="t321-mkt-h3">{p.title}</h3>
                <p>{p.body}</p>
                <span className="t321-mkt-pillar__link">{p.linkLabel || "Learn more"} <i className="fas fa-arrow-right" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* The live course finder results now sit here, where the Popular block
          used to be — the two swapped places so Popular leads. FinderResults
          reads the finder context, so HomeFinderProvider closes after it
          rather than up by the hero. */}
      <FinderResults />
      </HomeFinderProvider>

      <section className="t321-mkt-section">
        <div className="t321-mkt-container">
          <div className="t321-mkt-section__head">
            <span className="t321-mkt-eyebrow"><i className={home?.howHead?.icon || "fas fa-magic"} /> {home?.howHead?.eyebrow || "How it works"}</span>
            <h2 className="t321-mkt-h2">{copy.stepsTitle}</h2>
            <p className="t321-mkt-lede">{copy.stepsLede}</p>
          </div>
          <ol className="t321-mkt-steps">
            {copy.steps.map((step, i) => (
              <li key={i}>
                <span className="t321-mkt-steps__num">{i + 1}</span>
                <h3 className="t321-mkt-h3">{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* The trust logos lead into the numbers band — social proof and the
          headline stats read as one block rather than being split across the
          page. */}
      <section className="t321-mkt-section t321-mkt-section--tight t321-mkt-section--sunk t321-mkt-trust">
        <div className="t321-mkt-container">
          <TrustLogosCarousel logos={trustLogos} label={copy.trustLabel} />
        </div>
      </section>

      <section className="t321-mkt-section t321-mkt-section--ink">
        <div className="t321-mkt-container t321-mkt-stats">
          {companyStats.map((s) => (
            <div key={s.label} className="t321-mkt-stats__item">
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="t321-mkt-section t321-mkt-section--sunk">
        <div className="t321-mkt-container">
          <div className="t321-mkt-section__head">
            <span className="t321-mkt-eyebrow"><i className={home?.opinionsHead?.icon || "fas fa-quote-right"} /> {home?.opinionsHead?.eyebrow || "What operators say"}</span>
            <h2 className="t321-mkt-h2">{home?.opinionsHead?.heading || "Real quotes from real customers"}</h2>
          </div>
          <div className="t321-mkt-quotes">
            {featuredTestimonials.map((t) => (
              <figure key={t.id} className="t321-mkt-quote t321-mkt-card">
                <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption>
                  <div className="t321-mkt-quote__avatar" aria-hidden="true">{initials(t.name)}</div>
                  <div className="t321-mkt-quote__meta">
                    <strong>{t.name}</strong>
                    <span>{t.role} · {t.company}</span>
                  </div>
                </figcaption>
                {t.stat && (
                  <p className="t321-mkt-quote__stat">
                    <strong>{t.stat.value}</strong> {t.stat.label}
                  </p>
                )}
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="t321-mkt-section">
        <div className="t321-mkt-container t321-mkt-faq-teaser">
          <div>
            <span className="t321-mkt-eyebrow"><i className={home?.faqTeaserHead?.icon || "fas fa-question-circle"} /> {home?.faqTeaserHead?.eyebrow || "Frequently asked"}</span>
            <h2 className="t321-mkt-h2">{home?.faqTeaserHead?.heading || "Questions we hear a lot"}</h2>
            <p className="t321-mkt-lede">{home?.faqTeaserHead?.lede || "Quick answers to the things most buyers ask us. More detail on our FAQ page."}</p>
            <Link href="/faq" className="t321-mkt-btn t321-mkt-btn--ghost">
              {home?.faqTeaserCtaLabel || "See all questions"} <i className="fas fa-arrow-right" />
            </Link>
          </div>
          <div className="t321-mkt-faq-teaser__list">
            {homeFaqs.map((f, i) => (
              <details key={i} className="t321-mkt-faq-teaser__item">
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

      <section className="t321-mkt-section t321-mkt-section--ink">
        <div className="t321-mkt-container t321-mkt-cta">
          <div>
            <h2 className="t321-mkt-h2">{home?.bottomCta?.heading || copy.bottomTitle}</h2>
            <p className="t321-mkt-lede">{home?.bottomCta?.lede || copy.bottomLede}</p>
          </div>
          <div className="t321-mkt-cta__actions">
            <Link
              href={home?.bottomCta?.primaryCta?.to || "/catalog"}
              className="t321-mkt-btn t321-mkt-btn--accent t321-mkt-btn--lg"
            >
              {home?.bottomCta?.primaryCta?.label || "Browse courses"}
              <i className="fas fa-arrow-right" aria-hidden="true" />
            </Link>
            <Link
              href={home?.bottomCta?.secondaryCta?.to || copy.bottomCtaSecondary.to}
              className="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg"
            >
              {home?.bottomCta?.secondaryCta?.label || copy.bottomCtaSecondary.label}
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

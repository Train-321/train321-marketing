"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTina } from "tinacms/dist/react";
import type {
  CourseConnectionQuery,
  CourseConnectionQueryVariables,
  TestimonialConnectionQuery,
  TestimonialConnectionQueryVariables,
  FaqGroupConnectionQuery,
  FaqGroupConnectionQueryVariables,
  SiteSettingsQuery,
  SiteSettingsQueryVariables
} from "@/tina/__generated__/types";
import "./HomePage.css";

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

type CoursesRes = {
  data: CourseConnectionQuery;
  query: string;
  variables: CourseConnectionQueryVariables;
};
type TestimonialsRes = {
  data: TestimonialConnectionQuery;
  query: string;
  variables: TestimonialConnectionQueryVariables;
};
type FaqsRes = {
  data: FaqGroupConnectionQuery;
  query: string;
  variables: FaqGroupConnectionQueryVariables;
};
type SettingsRes = {
  data: SiteSettingsQuery;
  query: string;
  variables: SiteSettingsQueryVariables;
};

type HomePageProps = {
  forcedAudience?: Audience | null;
  coursesRes: CoursesRes;
  testimonialsRes: TestimonialsRes;
  faqsRes: FaqsRes;
  settingsRes: SettingsRes;
};

export default function HomePage({
  forcedAudience = null,
  coursesRes,
  testimonialsRes,
  faqsRes,
  settingsRes
}: HomePageProps) {
  const { data: coursesData } = useTina(coursesRes);
  const { data: testimonialsData } = useTina(testimonialsRes);
  const { data: faqsData } = useTina(faqsRes);
  const { data: settingsData } = useTina(settingsRes);

  const courses = useMemo(
    () =>
      (coursesData.courseConnection.edges || [])
        .map((e) => e?.node)
        .filter((n): n is NonNullable<typeof n> => Boolean(n)),
    [coursesData]
  );
  const testimonials = useMemo(
    () =>
      (testimonialsData.testimonialConnection.edges || [])
        .map((e) => e?.node)
        .filter((n): n is NonNullable<typeof n> => Boolean(n))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [testimonialsData]
  );
  const faqs = useMemo(
    () =>
      (faqsData.faqGroupConnection.edges || [])
        .map((e) => e?.node)
        .filter((n): n is NonNullable<typeof n> => Boolean(n))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [faqsData]
  );
  const companyStats = useMemo(
    () =>
      (settingsData.siteSettings.companyStats || []).filter(
        (s): s is NonNullable<typeof s> => Boolean(s)
      ),
    [settingsData]
  );
  const [audience, setAudience] = useState<Audience>(forcedAudience || "team");
  const [courseIndex, setCourseIndex] = useState(0);

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

  const popularCourses = useMemo(
    () =>
      POPULAR_SLUGS.map((slug) =>
        courses.find((c) => c._sys.filename === slug)
      ).filter((x): x is NonNullable<typeof x> => Boolean(x)),
    [courses]
  );

  const featuredTestimonials = useMemo(() => testimonials.slice(0, 3), [testimonials]);
  const homeFaqs = useMemo(
    () =>
      ((faqs[0]?.items || []).filter(
        (it): it is NonNullable<typeof it> => Boolean(it)
      ) || []).slice(0, 4),
    [faqs]
  );

  const activeCourse = HERO_COURSES[courseIndex] || HERO_COURSES[0];
  const copy = AUDIENCE_COPY[audience] || AUDIENCE_COPY.team;
  const showAudienceToggle = !forcedAudience;

  const chooseAudience = (val: Audience) => {
    if (forcedAudience) return;
    setAudience(val);
    try {
      window.localStorage.setItem("t321-audience", val);
    } catch {
      /* ignore */
    }
  };

  const setCourse = (i: number) => setCourseIndex(i);

  return (
    <div className="t321-mkt-home">
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
            <div className="t321-mkt-hero__cta">
              <Link href={copy.ctaPrimary.to} className="t321-mkt-btn t321-mkt-btn--primary t321-mkt-btn--lg">
                {copy.ctaPrimary.label}
                <i className="fas fa-arrow-right" aria-hidden="true" />
              </Link>
              <Link href={copy.ctaGhost.to} className="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg">
                <i className={copy.ctaGhost.icon} aria-hidden="true" />
                {copy.ctaGhost.label}
              </Link>
            </div>
            <ul className="t321-mkt-hero__trust">
              <li><i className="fas fa-shield-alt" aria-hidden="true" />ANSI-accredited</li>
              <li><i className="fas fa-flag-usa" aria-hidden="true" />Accepted in 50 states</li>
              <li><i className="fas fa-bolt" aria-hidden="true" />Instant certificate</li>
            </ul>
          </div>

          <aside className="t321-mkt-hero__visual" aria-hidden="true">
            <span className="t321-mkt-hero__glow" />
            <span className="t321-mkt-hero__grid" />

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

            <div className="t321-mkt-hero__cert t321-mkt-hero__float--b">
              <div className="t321-mkt-hero__cert-seal">
                <svg viewBox="0 0 64 64">
                  <circle className="ring" cx="32" cy="32" r="26" />
                  <path className="tick" d="M20 33 l8 8 l16 -17" />
                </svg>
              </div>
              <div className="t321-mkt-hero__cert-body">
                <span className="t321-mkt-hero__cert-eyebrow">Certificate issued</span>
                <strong>ANSI Food Handler</strong>
                <span className="t321-mkt-hero__cert-sub">Valid through 2029 · #FH-384201</span>
              </div>
            </div>

            <div className="t321-mkt-hero__rating t321-mkt-hero__float--e">
              <div className="t321-mkt-hero__rating-top">
                <strong className="t321-mkt-hero__rating-score">4.9</strong>
                <div className="t321-mkt-hero__rating-top-meta">
                  <div className="t321-mkt-hero__rating-stars" aria-label="4.9 out of 5">
                    <i className="fas fa-star" />
                    <i className="fas fa-star" />
                    <i className="fas fa-star" />
                    <i className="fas fa-star" />
                    <i className="fas fa-star" />
                  </div>
                  <span className="t321-mkt-hero__rating-total">284,912 reviews</span>
                </div>
              </div>
              <div className="t321-mkt-hero__rating-bars">
                <div className="t321-mkt-hero__rating-bar">
                  <span>5</span>
                  <div className="t321-mkt-hero__rating-track"><span style={{ width: "94%" }} /></div>
                  <em>94%</em>
                </div>
                <div className="t321-mkt-hero__rating-bar">
                  <span>4</span>
                  <div className="t321-mkt-hero__rating-track"><span style={{ width: "4%" }} /></div>
                  <em>4%</em>
                </div>
                <div className="t321-mkt-hero__rating-bar">
                  <span>3</span>
                  <div className="t321-mkt-hero__rating-track"><span style={{ width: "1%" }} /></div>
                  <em>1%</em>
                </div>
              </div>
              <div className="t321-mkt-hero__rating-foot">
                <i className="fas fa-quote-left" />
                <span>&ldquo;Finished in an hour, certificate issued instantly.&rdquo;</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="t321-mkt-section t321-mkt-section--tight t321-mkt-section--sunk t321-mkt-trust">
        <div className="t321-mkt-container">
          <p className="t321-mkt-trust__label">{copy.trustLabel}</p>
          <div className="t321-mkt-trust__logos">
            <div className="t321-mkt-trust__logo" title="California Restaurant Association">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://www.calrest.org/sites/default/themes/dtheme/img/calrest-logo.svg" alt="California Restaurant Association" />
            </div>
            <div className="t321-mkt-trust__logo" title="Delaware Restaurant Association">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://dra.train321.com/img/logos/dra_logo.png" alt="Delaware Restaurant Association" />
            </div>
            <div className="t321-mkt-trust__logo" title="Massachusetts Restaurant Association">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://www.train321.com/images/logos/MRA.png" alt="Massachusetts Restaurant Association" />
            </div>
            <div className="t321-mkt-trust__logo" title="Oregon Restaurant & Lodging Association">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://www.train321.com/images/logos/orla.png" alt="Oregon Restaurant & Lodging Association" />
            </div>
            <div className="t321-mkt-trust__logo" title="New Mexico Restaurant Association">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://www.train321.com/images/logos/nmra.png" alt="New Mexico Restaurant Association" />
            </div>
            <div className="t321-mkt-trust__logo" title="Nevada Restaurant Association" aria-label="Nevada Restaurant Association">
              <svg viewBox="0 0 180 56" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
                <g>
                  <polygon points="20,10 23.5,20 34,20 25.5,26 29,36 20,30 11,36 14.5,26 6,20 16.5,20" fill="#9D1F2A" />
                  <polygon points="20,13.5 22.3,20.7 29.5,20.7 23.7,25 26,32 20,27.6 14,32 16.3,25 10.5,20.7 17.7,20.7" fill="#00CCFE" opacity="0.35" />
                  <text x="42" y="30" fontFamily="Georgia, 'Times New Roman', serif" fontSize="24" fontWeight="700" fill="#0B437C" letterSpacing="1.2">NVRA</text>
                  <text x="42" y="42" fontFamily="Inter, Arial, sans-serif" fontSize="6.5" fontWeight="700" fill="#5E5C57" letterSpacing="1">NEVADA RESTAURANT ASSN.</text>
                </g>
              </svg>
            </div>
            <div className="t321-mkt-trust__logo t321-mkt-trust__logo--brand" title="Denny's">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://companieslogo.com/img/orig/DENN_BIG-c9a931d8.png?t=1720244491" alt="Denny's" />
            </div>
            <div className="t321-mkt-trust__logo t321-mkt-trust__logo--brand" title="Jack in the Box">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://www.train321.com/images/logos/jack-in-the-box.png" alt="Jack in the Box" />
            </div>
            <div className="t321-mkt-trust__logo t321-mkt-trust__logo--brand" title="Taco Cabana">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://tacocabana.train321.com/taco-cabana.png" alt="Taco Cabana" />
            </div>
          </div>
        </div>
      </section>

      <section className="t321-mkt-section">
        <div className="t321-mkt-container">
          <div className="t321-mkt-section__head">
            <span className="t321-mkt-eyebrow"><i className="fas fa-tag" /> What we do</span>
            <h2 className="t321-mkt-h2">Three categories. One platform.</h2>
            <p className="t321-mkt-lede">
              Everything compliance-sensitive in the hospitality and service industries —
              under one login, one dashboard, one invoice.
            </p>
          </div>
          <div className="t321-mkt-pillars">
            <Link href="/food-handler" className="t321-mkt-pillar t321-mkt-card t321-mkt-card--hover">
              <span className="t321-mkt-pillar__icon t321-mkt-pillar__icon--amber">
                <i className="fas fa-utensils" />
              </span>
              <h3 className="t321-mkt-h3">Food safety</h3>
              <p>Food Handler, Food Manager, accredited variants. Accepted by every state health department.</p>
              <span className="t321-mkt-pillar__link">Browse food safety <i className="fas fa-arrow-right" /></span>
            </Link>
            <Link href="/alcohol" className="t321-mkt-pillar t321-mkt-card t321-mkt-card--hover">
              <span className="t321-mkt-pillar__icon t321-mkt-pillar__icon--plum">
                <i className="fas fa-wine-glass-alt" />
              </span>
              <h3 className="t321-mkt-h3">Alcohol &amp; service</h3>
              <p>TIPS-equivalent alcohol server training plus bar basics, service basics, and security host.</p>
              <span className="t321-mkt-pillar__link">Browse alcohol &amp; service <i className="fas fa-arrow-right" /></span>
            </Link>
            <Link href="/human-resources" className="t321-mkt-pillar t321-mkt-card t321-mkt-card--hover">
              <span className="t321-mkt-pillar__icon t321-mkt-pillar__icon--emerald">
                <i className="fas fa-users-cog" />
              </span>
              <h3 className="t321-mkt-h3">HR &amp; compliance</h3>
              <p>Sexual harassment (state-specific), human trafficking, and practical HR for managers.</p>
              <span className="t321-mkt-pillar__link">Browse HR &amp; compliance <i className="fas fa-arrow-right" /></span>
            </Link>
          </div>
        </div>
      </section>

      <section className="t321-mkt-section t321-mkt-section--sunk">
        <div className="t321-mkt-container">
          <div className="t321-mkt-section__head">
            <span className="t321-mkt-eyebrow"><i className="fas fa-fire" /> Most enrolled</span>
            <h2 className="t321-mkt-h2">Popular courses</h2>
            <p className="t321-mkt-lede">
              The courses most operators start with. Click any to see details or enroll now.
            </p>
          </div>
          <div className="t321-mkt-popular">
            {popularCourses.map((c) => (
              <Link
                key={c._sys.filename}
                href={`/courses/${c._sys.filename}`}
                className="t321-mkt-popular__card t321-mkt-card t321-mkt-card--hover"
              >
                <div className={`t321-mkt-popular__top is-tone-${c.color || "neutral"}`}>
                  <i className={c.icon || ""} aria-hidden="true" />
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
              Browse the full catalog
              <i className="fas fa-arrow-right" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="t321-mkt-section">
        <div className="t321-mkt-container">
          <div className="t321-mkt-section__head">
            <span className="t321-mkt-eyebrow"><i className="fas fa-magic" /> How it works</span>
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
            <span className="t321-mkt-eyebrow"><i className="fas fa-quote-right" /> What operators say</span>
            <h2 className="t321-mkt-h2">Real quotes from real customers</h2>
          </div>
          <div className="t321-mkt-quotes">
            {featuredTestimonials.map((t) => (
              <figure key={t._sys.filename} className="t321-mkt-quote t321-mkt-card">
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
          <div className="t321-mkt-quotes__foot">
            <Link href="/testimonials" className="t321-mkt-btn t321-mkt-btn--subtle">
              Read more stories <i className="fas fa-arrow-right" />
            </Link>
          </div>
        </div>
      </section>

      <section className="t321-mkt-section">
        <div className="t321-mkt-container t321-mkt-faq-teaser">
          <div>
            <span className="t321-mkt-eyebrow"><i className="fas fa-question-circle" /> Frequently asked</span>
            <h2 className="t321-mkt-h2">Questions we hear a lot</h2>
            <p className="t321-mkt-lede">
              Quick answers to the things most buyers ask us. More detail on our FAQ page.
            </p>
            <Link href="/faq" className="t321-mkt-btn t321-mkt-btn--ghost">
              See all questions <i className="fas fa-arrow-right" />
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
            <h2 className="t321-mkt-h2">{copy.bottomTitle}</h2>
            <p className="t321-mkt-lede">{copy.bottomLede}</p>
          </div>
          <div className="t321-mkt-cta__actions">
            <Link href="/catalog" className="t321-mkt-btn t321-mkt-btn--accent t321-mkt-btn--lg">
              Browse courses
              <i className="fas fa-arrow-right" aria-hidden="true" />
            </Link>
            <Link href={copy.bottomCtaSecondary.to} className="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg">
              {copy.bottomCtaSecondary.label}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

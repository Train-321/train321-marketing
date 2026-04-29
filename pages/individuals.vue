<template>
  <div class="t321-mkt-home">
    <section class="t321-mkt-hero">
      <div class="t321-mkt-container t321-mkt-hero__inner">
        <div class="t321-mkt-hero__body">
          <div
            v-if="showAudienceToggle"
            class="t321-mkt-hero__audience"
            role="tablist"
            aria-label="Who is this for?"
          >
            <button
              type="button"
              role="tab"
              :aria-selected="audience === 'self'"
              class="t321-mkt-hero__audience-pill"
              :class="{ 'is-active': audience === 'self' }"
              @click="setAudience('self')"
            >
              <i class="fas fa-user" aria-hidden="true"></i> For myself
            </button>
            <button
              type="button"
              role="tab"
              :aria-selected="audience === 'team'"
              class="t321-mkt-hero__audience-pill"
              :class="{ 'is-active': audience === 'team' }"
              @click="setAudience('team')"
            >
              <i class="fas fa-users" aria-hidden="true"></i> For my team
            </button>
          </div>
          <span class="t321-mkt-eyebrow">
            <i class="fas fa-bolt" aria-hidden="true"></i>
            {{ copy.eyebrow }}
          </span>
          <h1 class="t321-mkt-h1">
            {{ copy.h1Pre }} <em>{{ copy.h1Em }}</em>
          </h1>
          <p class="t321-mkt-lede">{{ copy.lede }}</p>
          <div class="t321-mkt-hero__cta">
            <NuxtLink :to="copy.ctaPrimary.to" class="t321-mkt-btn t321-mkt-btn--primary t321-mkt-btn--lg">
              {{ copy.ctaPrimary.label }}
              <i class="fas fa-arrow-right" aria-hidden="true"></i>
            </NuxtLink>
            <NuxtLink :to="copy.ctaGhost.to" class="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg">
              <i :class="copy.ctaGhost.icon" aria-hidden="true"></i>
              {{ copy.ctaGhost.label }}
            </NuxtLink>
          </div>
          <ul class="t321-mkt-hero__trust">
            <li><i class="fas fa-shield-alt" aria-hidden="true"></i>ANSI-accredited</li>
            <li><i class="fas fa-flag-usa" aria-hidden="true"></i>Accepted in 50 states</li>
            <li><i class="fas fa-bolt" aria-hidden="true"></i>Instant certificate</li>
          </ul>
        </div>

        <aside class="t321-mkt-hero__visual" aria-hidden="true">
          <span class="t321-mkt-hero__glow"></span>
          <span class="t321-mkt-hero__grid"></span>

          <div class="t321-mkt-hero__stage t321-mkt-hero__float--a">
            <div class="t321-mkt-hero__stage-chrome">
              <span class="t321-mkt-hero__dot"></span>
              <span class="t321-mkt-hero__dot"></span>
              <span class="t321-mkt-hero__dot"></span>
              <span class="t321-mkt-hero__url">
                <i class="fas fa-lock"></i> train321.com · {{ activeCourse.urlTitle }}
              </span>
            </div>
            <div class="t321-mkt-hero__stage-body">
              <transition name="t321-hero-swap">
                <div :key="activeCourse.urlTitle" class="t321-mkt-hero__stage-frame">
                  <div class="t321-mkt-hero__lesson-head">
                    <span class="t321-mkt-hero__badge t321-mkt-hero__badge--soft">
                      <i class="fas fa-layer-group"></i> {{ activeCourse.badge }}
                    </span>
                    <span class="t321-mkt-hero__live">
                      <span class="t321-mkt-hero__live-dot"></span> Live now
                    </span>
                  </div>
                  <strong class="t321-mkt-hero__lesson-title">{{ activeCourse.title }}</strong>
                  <div class="t321-mkt-hero__player">
                    <span class="t321-mkt-hero__player-play"><i class="fas fa-play"></i></span>
                    <div class="t321-mkt-hero__player-meta">
                      <div class="t321-mkt-hero__player-track">
                        <span class="t321-mkt-hero__player-fill" :style="{ width: activeCourse.progress + '%' }"></span>
                      </div>
                      <div class="t321-mkt-hero__player-time">
                        <span>{{ activeCourse.time }}</span>
                        <span><i class="fas fa-closed-captioning"></i> CC</span>
                      </div>
                    </div>
                  </div>
                  <ul class="t321-mkt-hero__modules">
                    <li
                      v-for="m in activeCourse.modules"
                      :key="m.label"
                      :class="'is-' + m.state"
                    >
                      <i :class="moduleIcon(m)"></i> {{ m.label }}
                    </li>
                  </ul>
                </div>
              </transition>
              <div class="t321-mkt-hero__stage-dots" role="tablist" aria-label="Course preview">
                <button
                  v-for="(c, i) in courses"
                  :key="c.urlTitle"
                  type="button"
                  class="t321-mkt-hero__stage-dot"
                  :class="{ 'is-active': i === courseIndex }"
                  :aria-label="'Show ' + c.urlTitle"
                  :aria-selected="i === courseIndex"
                  @click="setCourse(i)"
                ></button>
              </div>
            </div>
          </div>

          <div class="t321-mkt-hero__cert t321-mkt-hero__float--b">
            <div class="t321-mkt-hero__cert-seal">
              <svg viewBox="0 0 64 64">
                <circle class="ring" cx="32" cy="32" r="26" />
                <path class="tick" d="M20 33 l8 8 l16 -17" />
              </svg>
            </div>
            <div class="t321-mkt-hero__cert-body">
              <span class="t321-mkt-hero__cert-eyebrow">Certificate issued</span>
              <strong>ANSI Food Handler</strong>
              <span class="t321-mkt-hero__cert-sub">Valid through 2029 · #FH-384201</span>
            </div>
          </div>

          <div class="t321-mkt-hero__rating t321-mkt-hero__float--e">
            <div class="t321-mkt-hero__rating-top">
              <strong class="t321-mkt-hero__rating-score">4.9</strong>
              <div class="t321-mkt-hero__rating-top-meta">
                <div class="t321-mkt-hero__rating-stars" aria-label="4.9 out of 5">
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star"></i>
                </div>
                <span class="t321-mkt-hero__rating-total">284,912 reviews</span>
              </div>
            </div>
            <div class="t321-mkt-hero__rating-bars">
              <div class="t321-mkt-hero__rating-bar">
                <span>5</span>
                <div class="t321-mkt-hero__rating-track"><span style="width:94%"></span></div>
                <em>94%</em>
              </div>
              <div class="t321-mkt-hero__rating-bar">
                <span>4</span>
                <div class="t321-mkt-hero__rating-track"><span style="width:4%"></span></div>
                <em>4%</em>
              </div>
              <div class="t321-mkt-hero__rating-bar">
                <span>3</span>
                <div class="t321-mkt-hero__rating-track"><span style="width:1%"></span></div>
                <em>1%</em>
              </div>
            </div>
            <div class="t321-mkt-hero__rating-foot">
              <i class="fas fa-quote-left"></i>
              <span>&ldquo;Finished in an hour, certificate issued instantly.&rdquo;</span>
            </div>
          </div>

        </aside>
      </div>
    </section>

    <section class="t321-mkt-section t321-mkt-section--tight t321-mkt-section--sunk t321-mkt-trust">
      <div class="t321-mkt-container">
        <p class="t321-mkt-trust__label">{{ copy.trustLabel }}</p>
        <div class="t321-mkt-trust__logos">
          <div class="t321-mkt-trust__logo" title="California Restaurant Association">
            <img src="https://www.calrest.org/sites/default/themes/dtheme/img/calrest-logo.svg" alt="California Restaurant Association" />
          </div>
          <div class="t321-mkt-trust__logo" title="Delaware Restaurant Association">
            <img src="https://dra.train321.com/img/logos/dra_logo.png" alt="Delaware Restaurant Association" />
          </div>
          <div class="t321-mkt-trust__logo" title="Massachusetts Restaurant Association">
            <img src="https://www.train321.com/images/logos/MRA.png" alt="Massachusetts Restaurant Association" />
          </div>
          <div class="t321-mkt-trust__logo" title="Oregon Restaurant & Lodging Association">
            <img src="https://www.train321.com/images/logos/orla.png" alt="Oregon Restaurant & Lodging Association" />
          </div>
          <div class="t321-mkt-trust__logo" title="New Mexico Restaurant Association">
            <img src="https://www.train321.com/images/logos/nmra.png" alt="New Mexico Restaurant Association" />
          </div>
          <div class="t321-mkt-trust__logo" title="Nevada Restaurant Association" aria-label="Nevada Restaurant Association">
            <svg viewBox="0 0 180 56" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
              <g>
                <polygon points="20,10 23.5,20 34,20 25.5,26 29,36 20,30 11,36 14.5,26 6,20 16.5,20" fill="#9D1F2A" />
                <polygon points="20,13.5 22.3,20.7 29.5,20.7 23.7,25 26,32 20,27.6 14,32 16.3,25 10.5,20.7 17.7,20.7" fill="#00CCFE" opacity="0.35" />
                <text x="42" y="30" font-family="Georgia, 'Times New Roman', serif" font-size="24" font-weight="700" fill="#0B437C" letter-spacing="1.2">NVRA</text>
                <text x="42" y="42" font-family="Inter, Arial, sans-serif" font-size="6.5" font-weight="700" fill="#5E5C57" letter-spacing="1">NEVADA RESTAURANT ASSN.</text>
              </g>
            </svg>
          </div>
          <div class="t321-mkt-trust__logo t321-mkt-trust__logo--brand" title="Denny's">
            <img src="https://companieslogo.com/img/orig/DENN_BIG-c9a931d8.png?t=1720244491" alt="Denny's" />
          </div>
          <div class="t321-mkt-trust__logo t321-mkt-trust__logo--brand" title="Jack in the Box">
            <img src="https://www.train321.com/images/logos/jack-in-the-box.png" alt="Jack in the Box" />
          </div>
          <div class="t321-mkt-trust__logo t321-mkt-trust__logo--brand" title="Taco Cabana">
            <img src="https://tacocabana.train321.com/taco-cabana.png" alt="Taco Cabana" />
          </div>
        </div>
      </div>
    </section>

    <section class="t321-mkt-section">
      <div class="t321-mkt-container">
        <div class="t321-mkt-section__head">
          <span class="t321-mkt-eyebrow"><i class="fas fa-tag"></i> What we do</span>
          <h2 class="t321-mkt-h2">Three categories. One platform.</h2>
          <p class="t321-mkt-lede">
            Everything compliance-sensitive in the hospitality and service industries —
            under one login, one dashboard, one invoice.
          </p>
        </div>
        <div class="t321-mkt-pillars">
          <NuxtLink to="/food-handler" class="t321-mkt-pillar t321-mkt-card t321-mkt-card--hover">
            <span class="t321-mkt-pillar__icon t321-mkt-pillar__icon--amber">
              <i class="fas fa-utensils"></i>
            </span>
            <h3 class="t321-mkt-h3">Food safety</h3>
            <p>Food Handler, Food Manager, accredited variants. Accepted by every state health department.</p>
            <span class="t321-mkt-pillar__link">Browse food safety <i class="fas fa-arrow-right"></i></span>
          </NuxtLink>
          <NuxtLink to="/alcohol" class="t321-mkt-pillar t321-mkt-card t321-mkt-card--hover">
            <span class="t321-mkt-pillar__icon t321-mkt-pillar__icon--plum">
              <i class="fas fa-wine-glass-alt"></i>
            </span>
            <h3 class="t321-mkt-h3">Alcohol & service</h3>
            <p>TIPS-equivalent alcohol server training plus bar basics, service basics, and security host.</p>
            <span class="t321-mkt-pillar__link">Browse alcohol &amp; service <i class="fas fa-arrow-right"></i></span>
          </NuxtLink>
          <NuxtLink to="/human-resources" class="t321-mkt-pillar t321-mkt-card t321-mkt-card--hover">
            <span class="t321-mkt-pillar__icon t321-mkt-pillar__icon--emerald">
              <i class="fas fa-users-cog"></i>
            </span>
            <h3 class="t321-mkt-h3">HR & compliance</h3>
            <p>Sexual harassment (state-specific), human trafficking, and practical HR for managers.</p>
            <span class="t321-mkt-pillar__link">Browse HR &amp; compliance <i class="fas fa-arrow-right"></i></span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="t321-mkt-section t321-mkt-section--sunk">
      <div class="t321-mkt-container">
        <div class="t321-mkt-section__head">
          <span class="t321-mkt-eyebrow"><i class="fas fa-fire"></i> Most enrolled</span>
          <h2 class="t321-mkt-h2">Popular courses</h2>
          <p class="t321-mkt-lede">
            The courses most operators start with. Click any to see details or enroll now.
          </p>
        </div>
        <div class="t321-mkt-popular">
          <NuxtLink
            v-for="c in popularCourses"
            :key="c.slug"
            :to="'/' + c.slug"
            class="t321-mkt-popular__card t321-mkt-card t321-mkt-card--hover"
          >
            <div class="t321-mkt-popular__top" :class="'is-tone-' + (c.color || 'neutral')">
              <i :class="c.icon" aria-hidden="true"></i>
              <span v-if="c.priceFrom" class="t321-mkt-popular__price">From ${{ c.priceFrom }}</span>
            </div>
            <div class="t321-mkt-popular__body">
              <span class="t321-mkt-popular__eyebrow">{{ c.eyebrow }}</span>
              <h3 class="t321-mkt-h3">{{ c.title }}</h3>
              <p>{{ c.tagline }}</p>
              <span class="t321-mkt-popular__link">
                See details <i class="fas fa-arrow-right"></i>
              </span>
            </div>
          </NuxtLink>
        </div>
        <div class="t321-mkt-popular__foot">
          <NuxtLink to="/catalog" class="t321-mkt-btn t321-mkt-btn--primary t321-mkt-btn--lg">
            Browse the full catalog
            <i class="fas fa-arrow-right" aria-hidden="true"></i>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="t321-mkt-section">
      <div class="t321-mkt-container">
        <div class="t321-mkt-section__head">
          <span class="t321-mkt-eyebrow"><i class="fas fa-magic"></i> How it works</span>
          <h2 class="t321-mkt-h2">{{ copy.stepsTitle }}</h2>
          <p class="t321-mkt-lede">{{ copy.stepsLede }}</p>
        </div>
        <ol class="t321-mkt-steps">
          <li v-for="(step, i) in copy.steps" :key="i">
            <span class="t321-mkt-steps__num">{{ i + 1 }}</span>
            <h3 class="t321-mkt-h3">{{ step.title }}</h3>
            <p>{{ step.body }}</p>
          </li>
        </ol>
      </div>
    </section>

    <section class="t321-mkt-section t321-mkt-section--ink">
      <div class="t321-mkt-container t321-mkt-stats">
        <div v-for="s in companyStats" :key="s.label" class="t321-mkt-stats__item">
          <strong>{{ s.value }}</strong>
          <span>{{ s.label }}</span>
        </div>
      </div>
    </section>

    <section class="t321-mkt-section t321-mkt-section--sunk">
      <div class="t321-mkt-container">
        <div class="t321-mkt-section__head">
          <span class="t321-mkt-eyebrow"><i class="fas fa-quote-right"></i> What operators say</span>
          <h2 class="t321-mkt-h2">Real quotes from real customers</h2>
        </div>
        <div class="t321-mkt-quotes">
          <figure v-for="t in featuredTestimonials" :key="t.id" class="t321-mkt-quote t321-mkt-card">
            <blockquote>&ldquo;{{ t.quote }}&rdquo;</blockquote>
            <figcaption>
              <div class="t321-mkt-quote__avatar" aria-hidden="true">{{ initials(t.name) }}</div>
              <div class="t321-mkt-quote__meta">
                <strong>{{ t.name }}</strong>
                <span>{{ t.role }} · {{ t.company }}</span>
              </div>
            </figcaption>
            <p v-if="t.stat" class="t321-mkt-quote__stat">
              <strong>{{ t.stat.value }}</strong> {{ t.stat.label }}
            </p>
          </figure>
        </div>
        <div class="t321-mkt-quotes__foot">
          <NuxtLink to="/testimonials" class="t321-mkt-btn t321-mkt-btn--subtle">
            Read more stories <i class="fas fa-arrow-right"></i>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="t321-mkt-section">
      <div class="t321-mkt-container t321-mkt-faq-teaser">
        <div>
          <span class="t321-mkt-eyebrow"><i class="fas fa-question-circle"></i> Frequently asked</span>
          <h2 class="t321-mkt-h2">Questions we hear a lot</h2>
          <p class="t321-mkt-lede">
            Quick answers to the things most buyers ask us. More detail on our FAQ page.
          </p>
          <NuxtLink to="/faq" class="t321-mkt-btn t321-mkt-btn--ghost">
            See all questions <i class="fas fa-arrow-right"></i>
          </NuxtLink>
        </div>
        <div class="t321-mkt-faq-teaser__list">
          <details v-for="(f, i) in homeFaqs" :key="i" class="t321-mkt-faq-teaser__item">
            <summary>
              <span>{{ f.q }}</span>
              <i class="fas fa-plus" aria-hidden="true"></i>
            </summary>
            <p>{{ f.a }}</p>
          </details>
        </div>
      </div>
    </section>

    <section class="t321-mkt-section t321-mkt-section--ink">
      <div class="t321-mkt-container t321-mkt-cta">
        <div>
          <h2 class="t321-mkt-h2">{{ copy.bottomTitle }}</h2>
          <p class="t321-mkt-lede">{{ copy.bottomLede }}</p>
        </div>
        <div class="t321-mkt-cta__actions">
          <NuxtLink to="/catalog" class="t321-mkt-btn t321-mkt-btn--accent t321-mkt-btn--lg">
            Browse courses
            <i class="fas fa-arrow-right" aria-hidden="true"></i>
          </NuxtLink>
          <NuxtLink :to="copy.bottomCtaSecondary.to" class="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg">
            {{ copy.bottomCtaSecondary.label }}
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { courseFamilyList } from "~/assets/data/courses";
import { testimonials } from "~/assets/data/testimonials";
import { companyStats } from "~/assets/data/team";
import { faqs } from "~/assets/data/faqs";

const POPULAR_SLUGS = ["food-handler", "alcohol", "sexual-harassment", "food-manager"];

const AUDIENCE_COPY = {
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

const HERO_COURSES = [
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

export default {
  name: "MarketingHome",
  props: {
    forcedAudience: { type: String, default: null }
  },
  data() {
    return {
      companyStats,
      courses: HERO_COURSES,
      courseIndex: 0,
      audience: this.forcedAudience || "team"
    };
  },
  mounted() {
    if (typeof window === "undefined") return;
    if (!this.forcedAudience) {
      try {
        const stored = window.localStorage.getItem("t321-audience");
        if (stored === "team" || stored === "self") this.audience = stored;
      } catch (e) { /* localStorage unavailable */ }
    }
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    this._courseTimer = window.setInterval(() => {
      this.courseIndex = (this.courseIndex + 1) % this.courses.length;
    }, 4200);
  },
  beforeUnmount() {
    if (this._courseTimer) clearInterval(this._courseTimer);
  },
  watch: {
    forcedAudience(val) {
      if (val === "team" || val === "self") this.audience = val;
    }
  },
  computed: {
    activeCourse() {
      return this.courses[this.courseIndex] || this.courses[0];
    },
    popularCourses() {
      return POPULAR_SLUGS
        .map(slug => courseFamilyList.find(c => c.slug === slug))
        .filter(Boolean);
    },
    featuredTestimonials() {
      return testimonials.slice(0, 3);
    },
    homeFaqs() {
      const first = faqs[0]?.items || [];
      return first.slice(0, 4);
    },
    copy() {
      return AUDIENCE_COPY[this.audience] || AUDIENCE_COPY.team;
    },
    showAudienceToggle() {
      return !this.forcedAudience;
    }
  },
  methods: {
    moduleIcon(m) {
      if (m.icon) return "fas " + m.icon;
      if (m.state === "done") return "fas fa-check";
      if (m.state === "active") return "fas fa-play";
      return "fas fa-lock";
    },
    setCourse(i) {
      this.courseIndex = i;
      if (this._courseTimer) {
        clearInterval(this._courseTimer);
        this._courseTimer = window.setInterval(() => {
          this.courseIndex = (this.courseIndex + 1) % this.courses.length;
        }, 4200);
      }
    },
    setAudience(val) {
      if (this.forcedAudience) return;
      if (val !== "team" && val !== "self") return;
      this.audience = val;
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem("t321-audience", val);
        }
      } catch (e) { /* ignore */ }
    },
    initials(name) {
      return (name || "")
        .split(" ")
        .map(p => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
  }
};
</script>

<style scoped>
.t321-mkt-hero {
  padding: 4.5rem 0 5.5rem;
  background:
    radial-gradient(1200px 500px at 15% 10%, var(--t321-mkt-accent-wash) 0%, transparent 60%),
    var(--t321-mkt-paper);
  border-bottom: 1px solid var(--t321-mkt-line);
}
.t321-mkt-hero__inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}
.t321-mkt-hero__body { max-width: 560px; }
.t321-mkt-hero__audience {
  display: flex;
  width: fit-content;
  gap: 4px;
  padding: 4px;
  background: var(--t321-mkt-paper-sunk, #F2F0EA);
  border: 1px solid var(--t321-mkt-line, #E8E4DB);
  border-radius: 999px;
  margin-bottom: 1.1rem;
}
.t321-mkt-hero__audience-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.95rem;
  border: 0;
  background: transparent;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--t321-mkt-ink-muted, #5E5C57);
  border-radius: 999px;
  cursor: pointer;
  transition: background 160ms ease, color 160ms ease, box-shadow 160ms ease;
}
.t321-mkt-hero__audience-pill i { font-size: 0.78rem; }
.t321-mkt-hero__audience-pill:hover { color: var(--t321-mkt-ink, #0F0F0E); }
.t321-mkt-hero__audience-pill.is-active {
  background: #ffffff;
  color: var(--t321-mkt-ink, #0F0F0E);
  box-shadow: 0 1px 2px rgba(15, 15, 14, 0.06), 0 4px 12px -4px rgba(15, 15, 14, 0.08);
}
.t321-mkt-hero__audience-pill.is-active i { color: var(--t321-mkt-accent, #0A427B); }
.t321-mkt-hero__body .t321-mkt-h1 em {
  font-style: italic;
  color: var(--t321-mkt-accent);
  font-weight: 500;
}
.t321-mkt-hero__cta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}
.t321-mkt-hero__trust {
  margin: 2rem 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  gap: 1.75rem;
  flex-wrap: wrap;
}
.t321-mkt-hero__trust li {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  color: var(--t321-mkt-ink-muted);
}
.t321-mkt-hero__trust i { color: var(--t321-mkt-accent); }

.t321-mkt-hero__visual {
  position: relative;
  height: 400px;
  perspective: 1400px;
}
.t321-mkt-hero__glow {
  position: absolute;
  inset: -40px;
  background:
    radial-gradient(420px 300px at 70% 30%, rgba(0, 204, 254, 0.22), transparent 65%),
    radial-gradient(360px 260px at 25% 75%, rgba(11, 67, 124, 0.16), transparent 60%);
  filter: blur(10px);
  z-index: 0;
  pointer-events: none;
  animation: t321Hero-glow 12s ease-in-out infinite alternate;
}
.t321-mkt-hero__grid {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image: radial-gradient(circle, rgba(11, 67, 124, 0.14) 1px, transparent 1.6px);
  background-size: 22px 22px;
  mask-image: radial-gradient(ellipse at 55% 50%, #000 30%, transparent 75%);
  -webkit-mask-image: radial-gradient(ellipse at 55% 50%, #000 30%, transparent 75%);
  opacity: 0.5;
  pointer-events: none;
}

/* Course-player stage */
.t321-mkt-hero__stage {
  position: absolute;
  top: 3%;
  left: 1.5rem;
  width: 340px;
  height: 324px;
  background: #ffffff;
  border: 1px solid var(--t321-mkt-line);
  border-radius: 18px;
  box-shadow:
    0 1px 0 rgba(15, 15, 14, 0.04),
    0 30px 60px -20px rgba(15, 15, 14, 0.22),
    0 8px 20px -10px rgba(11, 67, 124, 0.18);
  overflow: hidden;
  z-index: 3;
  display: flex;
  flex-direction: column;
}
.t321-mkt-hero__stage-chrome {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0.55rem 0.85rem;
  border-bottom: 1px solid var(--t321-mkt-line);
  background: linear-gradient(180deg, #fafaf7, #f4f3ee);
}
.t321-mkt-hero__dot { width: 9px; height: 9px; border-radius: 50%; background: #e4d9b3; }
.t321-mkt-hero__dot:nth-child(2) { background: #cfe1c9; }
.t321-mkt-hero__dot:nth-child(3) { background: #c9d6e5; }
.t321-mkt-hero__url {
  margin-left: auto;
  font-size: 0.7rem;
  color: var(--t321-mkt-ink-muted);
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.t321-mkt-hero__url i { font-size: 0.62rem; color: var(--t321-mkt-positive); }
.t321-mkt-hero__stage-body {
  padding: 1.1rem 1.2rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.t321-mkt-hero__stage-frame {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  width: 100%;
}
.t321-mkt-hero__lesson-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.t321-mkt-hero__badge {
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
}
.t321-mkt-hero__badge--soft {
  background: var(--t321-mkt-accent-wash);
  color: var(--t321-mkt-accent);
}
.t321-mkt-hero__live {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
  color: var(--t321-mkt-ink-muted);
  font-weight: 500;
}
.t321-mkt-hero__live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #e03b3b;
  box-shadow: 0 0 0 0 rgba(224, 59, 59, 0.7);
  animation: t321Hero-pulse 1.6s ease-out infinite;
}
.t321-mkt-hero__lesson-title {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--t321-mkt-ink);
  line-height: 1.3;
  letter-spacing: -0.01em;
  min-height: 1.43em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}
.t321-mkt-hero__player {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.85rem;
  background: var(--t321-mkt-paper-sunk);
  border-radius: 12px;
}
.t321-mkt-hero__player-play {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--t321-mkt-accent), var(--t321-mkt-accent-bright));
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  box-shadow: 0 6px 16px -4px rgba(0, 204, 254, 0.45);
  flex-shrink: 0;
  animation: t321Hero-breathe 2.8s ease-in-out infinite;
}
.t321-mkt-hero__player-play i { margin-left: 2px; }
.t321-mkt-hero__player-meta { flex: 1; display: flex; flex-direction: column; gap: 0.4rem; min-width: 0; }
.t321-mkt-hero__player-track {
  height: 5px;
  border-radius: 999px;
  background: rgba(11, 67, 124, 0.12);
  overflow: hidden;
  position: relative;
}
.t321-mkt-hero__player-fill {
  display: block;
  height: 100%;
  width: 0;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--t321-mkt-accent), var(--t321-mkt-accent-bright));
  transform-origin: left center;
  transition: width 900ms cubic-bezier(0.22, 0.61, 0.36, 1);
}
.t321-mkt-hero__player-time {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: var(--t321-mkt-ink-muted);
}
.t321-mkt-hero__player-time i { margin-right: 0.2rem; }

.t321-mkt-hero__modules {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem 0.9rem;
}
.t321-mkt-hero__modules li {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.74rem;
  color: var(--t321-mkt-ink-muted);
  min-width: 0;
}
.t321-mkt-hero__modules li > span,
.t321-mkt-hero__modules li {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.t321-mkt-hero__modules li i {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.55rem;
  background: rgba(11, 67, 124, 0.08);
  color: var(--t321-mkt-ink-muted);
  flex-shrink: 0;
}
.t321-mkt-hero__modules li.is-done { color: var(--t321-mkt-ink); }
.t321-mkt-hero__modules li.is-done i {
  background: var(--t321-mkt-positive-wash);
  color: var(--t321-mkt-positive);
}
.t321-mkt-hero__modules li.is-active {
  color: var(--t321-mkt-ink);
  font-weight: 600;
}
.t321-mkt-hero__modules li.is-active i {
  background: var(--t321-mkt-accent-wash);
  color: var(--t321-mkt-accent);
  animation: t321Hero-pulseRing 2s ease-out infinite;
}

/* Certificate card */
.t321-mkt-hero__cert {
  position: absolute;
  bottom: 3%;
  right: -10px;
  width: 280px;
  padding: 1rem 1.1rem;
  background: #ffffff;
  border: 1px solid var(--t321-mkt-line);
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  box-shadow:
    0 24px 60px -20px rgba(15, 15, 14, 0.22),
    0 6px 16px -8px rgba(45, 106, 79, 0.2);
  z-index: 4;
  overflow: hidden;
}
.t321-mkt-hero__cert::before {
  content: "";
  position: absolute;
  top: -40%;
  left: -30%;
  width: 40%;
  height: 200%;
  background: linear-gradient(110deg, transparent, rgba(255, 255, 255, 0.75), transparent);
  transform: skewX(-18deg);
  animation: t321Hero-shimmer 5s ease-in-out 2s infinite;
  pointer-events: none;
}
.t321-mkt-hero__cert-seal {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--t321-mkt-positive-wash);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.t321-mkt-hero__cert-seal svg { width: 44px; height: 44px; overflow: visible; }
.t321-mkt-hero__cert-seal .ring {
  fill: none;
  stroke: var(--t321-mkt-positive);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-dasharray: 164;
  stroke-dashoffset: 164;
  transform: rotate(-90deg);
  transform-origin: center;
  animation: t321Hero-ringDraw 1.6s ease-out 0.4s forwards;
}
.t321-mkt-hero__cert-seal .tick {
  fill: none;
  stroke: var(--t321-mkt-positive);
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 36;
  stroke-dashoffset: 36;
  animation: t321Hero-tickDraw 0.55s ease-out 1.7s forwards;
}
.t321-mkt-hero__cert-body { display: flex; flex-direction: column; gap: 0.2rem; min-width: 0; }
.t321-mkt-hero__cert-eyebrow {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--t321-mkt-positive);
}
.t321-mkt-hero__cert-body strong {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1rem;
  font-weight: 500;
  color: var(--t321-mkt-ink);
}
.t321-mkt-hero__cert-sub {
  font-size: 0.74rem;
  color: var(--t321-mkt-ink-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Course pagination dots */
.t321-mkt-hero__stage-dots {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 0.75rem;
}
.t321-mkt-hero__stage-dot {
  width: 14px;
  height: 4px;
  border-radius: 2px;
  background: rgba(11, 67, 124, 0.18);
  border: 0;
  padding: 0;
  cursor: pointer;
  transition: background 240ms ease, width 240ms ease;
}
.t321-mkt-hero__stage-dot:hover { background: rgba(11, 67, 124, 0.35); }
.t321-mkt-hero__stage-dot.is-active {
  background: var(--t321-mkt-accent);
  width: 24px;
}

/* Course swap transition — crossfade (enter + leave overlap) */
.t321-hero-swap-enter-active,
.t321-hero-swap-leave-active {
  transition: opacity 380ms cubic-bezier(0.4, 0, 0.2, 1),
              transform 380ms cubic-bezier(0.4, 0, 0.2, 1);
  will-change: opacity, transform;
}
.t321-hero-swap-leave-active {
  position: absolute;
  inset: 1.1rem 1.2rem auto 1.2rem;
  pointer-events: none;
}
.t321-hero-swap-enter { opacity: 0; transform: translateY(6px); }
.t321-hero-swap-leave-to { opacity: 0; transform: translateY(-4px); }
.t321-hero-swap-enter-active .t321-mkt-hero__player-fill {
  animation: t321Hero-fillGrow 0.9s cubic-bezier(0.22, 0.61, 0.36, 1) 0.15s both;
}
@keyframes t321Hero-fillGrow {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

/* Gentle staggered row reveal on each course swap (opacity only, no height jump) */
.t321-hero-swap-enter-active .t321-mkt-hero__modules li {
  animation: t321Hero-moduleIn 0.42s cubic-bezier(0.4, 0, 0.2, 1) both;
}
.t321-hero-swap-enter-active .t321-mkt-hero__modules li:nth-child(1),
.t321-hero-swap-enter-active .t321-mkt-hero__modules li:nth-child(2) { animation-delay: 0.10s; }
.t321-hero-swap-enter-active .t321-mkt-hero__modules li:nth-child(3),
.t321-hero-swap-enter-active .t321-mkt-hero__modules li:nth-child(4) { animation-delay: 0.20s; }
.t321-hero-swap-enter-active .t321-mkt-hero__modules li:nth-child(5),
.t321-hero-swap-enter-active .t321-mkt-hero__modules li:nth-child(6) { animation-delay: 0.30s; }
@keyframes t321Hero-moduleIn {
  0% { opacity: 0; transform: translateY(6px); }
  100% { opacity: 1; transform: translateY(0); }
}
.t321-hero-swap-enter-active .t321-mkt-hero__modules li i {
  animation: t321Hero-checkPop 0.38s cubic-bezier(0.3, 1.5, 0.5, 1) both;
}
.t321-hero-swap-enter-active .t321-mkt-hero__modules li:nth-child(1) i,
.t321-hero-swap-enter-active .t321-mkt-hero__modules li:nth-child(2) i { animation-delay: 0.22s; }
.t321-hero-swap-enter-active .t321-mkt-hero__modules li:nth-child(3) i,
.t321-hero-swap-enter-active .t321-mkt-hero__modules li:nth-child(4) i { animation-delay: 0.32s; }
.t321-hero-swap-enter-active .t321-mkt-hero__modules li:nth-child(5) i,
.t321-hero-swap-enter-active .t321-mkt-hero__modules li:nth-child(6) i { animation-delay: 0.42s; }
@keyframes t321Hero-checkPop {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

/* Expanded reviews card (top-right) */
.t321-mkt-hero__rating {
  position: absolute;
  top: 2%;
  right: -10px;
  width: 238px;
  padding: 1rem 1.1rem 1rem;
  background: #ffffff;
  border: 1px solid var(--t321-mkt-line);
  border-radius: 14px;
  box-shadow:
    0 22px 48px -18px rgba(15, 15, 14, 0.22),
    0 6px 14px -8px rgba(11, 67, 124, 0.16);
  z-index: 5;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.t321-mkt-hero__rating-top {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}
.t321-mkt-hero__rating-score {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 2.1rem;
  font-weight: 500;
  line-height: 1;
  color: var(--t321-mkt-ink);
  letter-spacing: -0.02em;
}
.t321-mkt-hero__rating-top-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}
.t321-mkt-hero__rating-stars {
  display: inline-flex;
  gap: 2px;
  color: #e5a33b;
  font-size: 0.74rem;
}
.t321-mkt-hero__rating-total {
  font-size: 0.7rem;
  color: var(--t321-mkt-ink-muted);
  white-space: nowrap;
}
.t321-mkt-hero__rating-bars {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.t321-mkt-hero__rating-bar {
  display: grid;
  grid-template-columns: 12px 1fr 32px;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.68rem;
  color: var(--t321-mkt-ink-muted);
}
.t321-mkt-hero__rating-bar span {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.t321-mkt-hero__rating-bar em {
  font-style: normal;
  text-align: right;
  color: var(--t321-mkt-ink);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.t321-mkt-hero__rating-track {
  height: 5px;
  border-radius: 999px;
  background: var(--t321-mkt-paper-sunk);
  overflow: hidden;
}
.t321-mkt-hero__rating-track span {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #e5a33b, #f4b860);
  transform-origin: left center;
  animation: t321Hero-ratingBar 1.2s cubic-bezier(0.22, 0.61, 0.36, 1) 0.9s both;
}
.t321-mkt-hero__rating-foot {
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  padding-top: 0.65rem;
  border-top: 1px solid var(--t321-mkt-line);
  font-size: 0.72rem;
  color: var(--t321-mkt-ink-muted);
  line-height: 1.4;
  font-style: italic;
}
.t321-mkt-hero__rating-foot i {
  color: var(--t321-mkt-accent);
  font-size: 0.6rem;
  margin-top: 0.2rem;
  flex-shrink: 0;
}

/* Fade-in (opacity) + idle bob (transform). Split so they don't collide. */
.t321-mkt-hero__float--a,
.t321-mkt-hero__float--b,
.t321-mkt-hero__float--e { opacity: 0; }
.t321-mkt-hero__float--a {
  animation:
    t321Hero-fade 0.65s ease-out 0.1s both,
    t321Hero-bobA 7s ease-in-out 0.75s infinite;
}
.t321-mkt-hero__float--b {
  animation:
    t321Hero-fade 0.65s ease-out 0.3s both,
    t321Hero-bobB 8s ease-in-out 0.95s infinite;
}
.t321-mkt-hero__float--e {
  animation:
    t321Hero-fade 0.65s ease-out 0.5s both,
    t321Hero-bobE 7.5s ease-in-out 1.15s infinite;
}

@keyframes t321Hero-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes t321Hero-bobA {
  0%, 100% { transform: translateY(0) rotate(-1.5deg); }
  50% { transform: translateY(-6px) rotate(-1.2deg); }
}
@keyframes t321Hero-bobB {
  0%, 100% { transform: translateY(0) rotate(2deg); }
  50% { transform: translateY(-5px) rotate(2.4deg); }
}
@keyframes t321Hero-bobE {
  0%, 100% { transform: translateY(0) rotate(-1deg); }
  50% { transform: translateY(-4px) rotate(-0.5deg); }
}
@keyframes t321Hero-ratingBar {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
@keyframes t321Hero-ringDraw {
  to { stroke-dashoffset: 0; }
}
@keyframes t321Hero-tickDraw {
  to { stroke-dashoffset: 0; }
}
@keyframes t321Hero-shimmer {
  0% { left: -30%; }
  55%, 100% { left: 130%; }
}
@keyframes t321Hero-pulse {
  0% { box-shadow: 0 0 0 0 rgba(224, 59, 59, 0.7); }
  100% { box-shadow: 0 0 0 10px rgba(224, 59, 59, 0); }
}
@keyframes t321Hero-pulseRing {
  0%, 100% { box-shadow: 0 0 0 0 rgba(0, 204, 254, 0.4); }
  50% { box-shadow: 0 0 0 5px rgba(0, 204, 254, 0); }
}
@keyframes t321Hero-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
}
@keyframes t321Hero-glow {
  from { opacity: 0.7; }
  to { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .t321-mkt-hero__float--a { animation: none; opacity: 1; transform: rotate(-1.5deg); }
  .t321-mkt-hero__float--b { animation: none; opacity: 1; transform: rotate(2deg); }
  .t321-mkt-hero__float--e { animation: none; opacity: 1; transform: rotate(-1deg); }
  .t321-mkt-hero__rating-track span { animation: none; transform: scaleX(1); }
  .t321-mkt-hero__player-fill { transition: none; }
  .t321-hero-swap-enter-active,
  .t321-hero-swap-leave-active { transition: none; }
  .t321-hero-swap-enter-active .t321-mkt-hero__player-fill { animation: none; }
  .t321-hero-swap-enter-active .t321-mkt-hero__modules li,
  .t321-hero-swap-enter-active .t321-mkt-hero__modules li i { animation: none; }
  .t321-mkt-hero__cert::before,
  .t321-mkt-hero__live-dot,
  .t321-mkt-hero__modules li.is-active i,
  .t321-mkt-hero__player-play,
  .t321-mkt-hero__glow { animation: none; }
  .t321-mkt-hero__cert-seal .ring,
  .t321-mkt-hero__cert-seal .tick { stroke-dashoffset: 0; animation: none; }
}

/* Trust band */
.t321-mkt-trust__label {
  text-align: center;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--t321-mkt-ink-muted);
  font-weight: 600;
  margin: 0 0 1.5rem;
}
.t321-mkt-trust__logos {
  display: grid;
  grid-template-columns: repeat(9, minmax(0, 1fr));
  gap: 0.5rem;
  align-items: center;
  padding: 0.5rem 0;
}
.t321-mkt-trust__logo {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
  padding: 0 0.85rem;
  position: relative;
  opacity: 0.9;
  transition: opacity 160ms ease, transform 160ms ease;
}
.t321-mkt-trust__logo + .t321-mkt-trust__logo::before {
  content: "";
  position: absolute;
  left: 0;
  top: 20px;
  bottom: 20px;
  width: 1px;
  background: var(--t321-mkt-line);
}
.t321-mkt-trust__logo:hover {
  opacity: 1;
  transform: translateY(-1px);
}
.t321-mkt-trust__logo img,
.t321-mkt-trust__logo svg {
  max-height: 64px;
  max-width: 100%;
  width: auto;
  height: auto;
  display: block;
  object-fit: contain;
}
.t321-mkt-trust__logo svg { width: 100%; height: 64px; }

@media (max-width: 1199.98px) {
  .t321-mkt-trust__logos { grid-template-columns: repeat(5, minmax(0, 1fr)); }
  .t321-mkt-trust__logo:nth-child(n+6)::before,
  .t321-mkt-trust__logo:nth-child(6)::before { display: none; }
}
@media (max-width: 767.98px) {
  .t321-mkt-trust__logos { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.25rem; }
  .t321-mkt-trust__logo { height: 68px; padding: 0 0.45rem; }
  .t321-mkt-trust__logo img,
  .t321-mkt-trust__logo svg { max-height: 52px; }
  .t321-mkt-trust__logo svg { height: 52px; }
  .t321-mkt-trust__logo::before { display: none !important; }
}

/* Three pillars */
.t321-mkt-pillars {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}
.t321-mkt-pillar {
  text-decoration: none;
  color: var(--t321-mkt-ink);
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
.t321-mkt-pillar__icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  margin-bottom: 0.45rem;
}
.t321-mkt-pillar__icon--amber {
  background: var(--t321-mkt-warn-wash);
  color: var(--t321-mkt-warn);
}
.t321-mkt-pillar__icon--plum {
  background: var(--t321-mkt-purple-wash);
  color: var(--t321-mkt-purple);
}
.t321-mkt-pillar__icon--emerald {
  background: var(--t321-mkt-positive-wash);
  color: var(--t321-mkt-positive);
}
.t321-mkt-pillar p {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.55;
  color: var(--t321-mkt-ink-muted);
  max-width: 36ch;
}
.t321-mkt-pillar__link {
  margin-top: auto;
  padding-top: 0.8rem;
  color: var(--t321-mkt-accent);
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

/* Popular courses grid */
.t321-mkt-popular {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}
.t321-mkt-popular__card {
  text-decoration: none;
  color: inherit;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.t321-mkt-popular__top {
  padding: 1.4rem 1.5rem;
  color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #0B437C, #00CCFE);
}
.t321-mkt-popular__top i { font-size: 1.5rem; }
.t321-mkt-popular__top.is-tone-amber {
  background: linear-gradient(135deg, #9D6200, #C08A2E);
}
.t321-mkt-popular__top.is-tone-plum {
  background: linear-gradient(135deg, #6B3A8A, #8C57AE);
}
.t321-mkt-popular__top.is-tone-emerald {
  background: linear-gradient(135deg, #2D6A4F, #3E8E68);
}
.t321-mkt-popular__top.is-tone-neutral {
  background: linear-gradient(135deg, #0F0F0E, #3A3A38);
}
.t321-mkt-popular__price {
  font-size: 0.8rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.15);
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
}
.t321-mkt-popular__body {
  padding: 1.25rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
}
.t321-mkt-popular__eyebrow {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--t321-mkt-ink-muted);
}
.t321-mkt-popular__body p {
  font-size: 0.88rem;
  color: var(--t321-mkt-ink-muted);
  line-height: 1.5;
  margin: 0 0 0.75rem;
  flex: 1;
}
.t321-mkt-popular__link {
  color: var(--t321-mkt-accent);
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.t321-mkt-popular__foot {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

/* Steps */
.t321-mkt-steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  counter-reset: step;
}
.t321-mkt-steps li {
  padding: 2rem;
  background: #ffffff;
  border: 1px solid var(--t321-mkt-line);
  border-radius: 14px;
  position: relative;
}
.t321-mkt-steps__num {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--t321-mkt-ink);
  color: #ffffff;
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 500;
  font-size: 1.15rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}
.t321-mkt-steps p {
  margin: 0;
  font-size: 0.92rem;
  color: var(--t321-mkt-ink-muted);
  line-height: 1.55;
}

/* Stats band */
.t321-mkt-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  text-align: center;
}
.t321-mkt-stats__item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.t321-mkt-stats__item strong {
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(2rem, 3vw, 3rem);
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.02em;
  color: #ffffff;
}
.t321-mkt-stats__item span {
  font-size: 0.82rem;
  color: #A8A39A;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* Quotes */
.t321-mkt-quotes {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}
.t321-mkt-quote blockquote {
  margin: 0 0 1.25rem;
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 400;
  font-size: 1.05rem;
  line-height: 1.5;
  color: var(--t321-mkt-ink);
  letter-spacing: -0.01em;
}
.t321-mkt-quote figcaption {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding-top: 1rem;
  border-top: 1px solid var(--t321-mkt-line);
}
.t321-mkt-quote__avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--t321-mkt-accent), var(--t321-mkt-accent-bright));
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.t321-mkt-quote__meta strong {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--t321-mkt-ink);
}
.t321-mkt-quote__meta span {
  font-size: 0.8rem;
  color: var(--t321-mkt-ink-muted);
}
.t321-mkt-quote__stat {
  margin: 0.85rem 0 0;
  padding: 0.55rem 0.8rem;
  background: var(--t321-mkt-accent-wash);
  border-radius: 8px;
  font-size: 0.82rem;
  color: var(--t321-mkt-ink-muted);
}
.t321-mkt-quote__stat strong {
  color: var(--t321-mkt-accent);
  font-weight: 600;
}
.t321-mkt-quotes__foot {
  text-align: center;
  margin-top: 1.75rem;
}

/* FAQ teaser */
.t321-mkt-faq-teaser {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 3rem;
  align-items: start;
}
.t321-mkt-faq-teaser__list { display: flex; flex-direction: column; gap: 0.6rem; }
.t321-mkt-faq-teaser__item {
  background: #ffffff;
  border: 1px solid var(--t321-mkt-line);
  border-radius: 12px;
  transition: border-color 140ms ease;
}
.t321-mkt-faq-teaser__item[open] { border-color: var(--t321-mkt-accent); }
.t321-mkt-faq-teaser__item summary {
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.95rem;
}
.t321-mkt-faq-teaser__item summary::-webkit-details-marker { display: none; }
.t321-mkt-faq-teaser__item summary i {
  color: var(--t321-mkt-accent);
  transition: transform 200ms ease;
}
.t321-mkt-faq-teaser__item[open] summary i { transform: rotate(45deg); }
.t321-mkt-faq-teaser__item p {
  margin: 0;
  padding: 0 1.25rem 1.1rem;
  font-size: 0.92rem;
  color: var(--t321-mkt-ink-muted);
  line-height: 1.6;
}

/* Bottom CTA */
.t321-mkt-cta {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  align-items: center;
}
.t321-mkt-cta__actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.t321-mkt-cta__actions .t321-mkt-btn--ghost {
  background: transparent;
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.25);
}
.t321-mkt-cta__actions .t321-mkt-btn--ghost:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: #ffffff;
}

@media (max-width: 1199.98px) {
  .t321-mkt-popular { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 991.98px) {
  .t321-mkt-hero__inner { grid-template-columns: 1fr; }
  .t321-mkt-hero__visual { height: 420px; max-width: 560px; margin: 0 auto; width: 100%; padding-left: 0; }
  .t321-mkt-pillars,
  .t321-mkt-steps,
  .t321-mkt-stats,
  .t321-mkt-quotes {
    grid-template-columns: 1fr 1fr;
  }
  .t321-mkt-faq-teaser,
  .t321-mkt-cta {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 600px) {
  .t321-mkt-hero { padding: 2rem 0 2.5rem; }
  .t321-mkt-hero__visual { display: none; }
  .t321-mkt-pillars,
  .t321-mkt-steps,
  .t321-mkt-stats,
  .t321-mkt-quotes,
  .t321-mkt-popular {
    grid-template-columns: 1fr;
  }
}
</style>

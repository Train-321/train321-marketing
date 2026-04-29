<template>
  <div class="t321-mkt-about">
    <section class="t321-mkt-about__hero">
      <div class="t321-mkt-container">
        <span class="t321-mkt-eyebrow"><i class="fas fa-users"></i> Our story</span>
        <h1 class="t321-mkt-h1">Compliance training shouldn't feel like a tax.</h1>
        <p class="t321-mkt-lede">
          We started Train321 in 2018 because the alternatives felt built for lawyers,
          not for line cooks. Six years later, we've issued over 500,000 certificates
          to teams who actually finished the course.
        </p>
      </div>
    </section>

    <section class="t321-mkt-section">
      <div class="t321-mkt-container t321-mkt-about__story">
        <div class="t321-mkt-about__story-body">
          <span class="t321-mkt-eyebrow">The mission</span>
          <h2 class="t321-mkt-h2">Make training so good, teams finish it</h2>
          <p>
            The hospitality industry spends billions of dollars a year on compliance training
            that nobody watches. Vendors produce 1997-era slideshows, teams click through on
            autopilot, and the paperwork gets filed. Then an inspector shows up, and the only
            thing that's actually changed is a folder full of certificates.
          </p>
          <p>
            We're building the other thing. Short, direct, written by people who worked the
            line. Mobile-first because our learners are taking it on their phone between a prep
            shift and a dinner rush. Updated the day a law changes — not the quarter after.
          </p>
          <p>
            That's our whole thesis. If we can make training so good that people actually learn
            from it, compliance takes care of itself.
          </p>
        </div>
        <aside class="t321-mkt-about__stats" aria-label="Company stats">
          <div v-for="s in companyStats" :key="s.label" class="t321-mkt-about__stat">
            <strong>{{ s.value }}</strong>
            <span>{{ s.label }}</span>
          </div>
        </aside>
      </div>
    </section>

    <section class="t321-mkt-section t321-mkt-section--sunk">
      <div class="t321-mkt-container">
        <div class="t321-mkt-section__head">
          <span class="t321-mkt-eyebrow"><i class="fas fa-compass"></i> What we believe</span>
          <h2 class="t321-mkt-h2">Three things we refuse to compromise on</h2>
        </div>
        <div class="t321-mkt-about__pillars">
          <article class="t321-mkt-about__pillar t321-mkt-card">
            <span class="t321-mkt-about__pillar-icon t321-mkt-about__pillar-icon--accent">
              <i class="fas fa-microscope"></i>
            </span>
            <h3 class="t321-mkt-h3">Content accuracy</h3>
            <p>
              Every course is written by a subject-matter expert and reviewed annually. When laws
              change, our courses change the same week. No ghost-written freelance copy; no
              auto-translated modules.
            </p>
          </article>
          <article class="t321-mkt-about__pillar t321-mkt-card">
            <span class="t321-mkt-about__pillar-icon t321-mkt-about__pillar-icon--warn">
              <i class="fas fa-mobile-alt"></i>
            </span>
            <h3 class="t321-mkt-h3">Learner experience</h3>
            <p>
              If a cook can't finish a course on their phone during prep, we've failed. Every
              course is playable in 15-minute chunks, saves progress automatically, and works on
              a $80 Android with a cracked screen.
            </p>
          </article>
          <article class="t321-mkt-about__pillar t321-mkt-card">
            <span class="t321-mkt-about__pillar-icon t321-mkt-about__pillar-icon--positive">
              <i class="fas fa-dollar-sign"></i>
            </span>
            <h3 class="t321-mkt-h3">Pricing transparency</h3>
            <p>
              No &ldquo;contact us for pricing.&rdquo; No per-feature upsells. You see the
              price on every course page, volume discounts apply automatically, and unused
              seats are refundable for 60 days.
            </p>
          </article>
        </div>
      </div>
    </section>

    <section class="t321-mkt-section">
      <div class="t321-mkt-container">
        <div class="t321-mkt-section__head">
          <span class="t321-mkt-eyebrow"><i class="fas fa-user-friends"></i> The team</span>
          <h2 class="t321-mkt-h2">People behind the platform</h2>
          <p class="t321-mkt-lede">
            A small team — around 30 of us — split between curriculum, customer success, and
            engineering. Most of us have worked the line.
          </p>
        </div>
        <div class="t321-mkt-about__team">
          <article v-for="m in team" :key="m.name" class="t321-mkt-about__team-card t321-mkt-card">
            <div class="t321-mkt-about__avatar" aria-hidden="true">{{ initials(m.name) }}</div>
            <h3 class="t321-mkt-h3">{{ m.name }}</h3>
            <span class="t321-mkt-about__team-role">{{ m.role }}</span>
            <p>{{ m.bio }}</p>
            <div class="t321-mkt-about__socials">
              <a v-if="m.linkedin" :href="m.linkedin" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
              <a v-if="m.twitter" :href="m.twitter" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="t321-mkt-section t321-mkt-section--ink">
      <div class="t321-mkt-container t321-mkt-about__cta">
        <div>
          <h2 class="t321-mkt-h2">Want to see how we work?</h2>
          <p class="t321-mkt-lede">
            Book a 20-minute demo. We'll show you the platform with your courses already loaded.
          </p>
        </div>
        <div class="t321-mkt-about__cta-actions">
          <NuxtLink to="/demo" class="t321-mkt-btn t321-mkt-btn--accent t321-mkt-btn--lg">
            Book a demo
          </NuxtLink>
          <NuxtLink to="/contact" class="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg">
            Contact us
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
useSeoMeta({
  title: "About — Train321",
  description: "The team and mission behind Train321."
});

const { data: team } = await useSanityFetch(groq`
  *[_type == "teamMember"] | order(order asc) {
    name, role, bio, linkedin, twitter
  }
`);

const { data: settings } = await useSanityFetch(groq`
  *[_id == "siteSettings"][0] { companyStats[] { value, label } }
`);

const companyStats = computed(() => settings.value?.companyStats || []);

function initials(name) {
  return (name || "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
</script>

<style scoped>
.t321-mkt-about__hero {
  padding: 3rem 0 2rem;
  background: linear-gradient(180deg, var(--t321-mkt-paper) 0%, var(--t321-mkt-paper-sunk) 100%);
  border-bottom: 1px solid var(--t321-mkt-line);
}
.t321-mkt-about__hero .t321-mkt-h1 { max-width: 18ch; }

.t321-mkt-about__story {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 3rem;
  align-items: start;
}
.t321-mkt-about__story-body p {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--t321-mkt-ink);
  margin: 0 0 1rem;
}
.t321-mkt-about__stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.t321-mkt-about__stat {
  background: #ffffff;
  border: 1px solid var(--t321-mkt-line);
  border-radius: 14px;
  padding: 1.25rem;
  text-align: center;
}
.t321-mkt-about__stat strong {
  display: block;
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.75rem;
  font-weight: 500;
  color: var(--t321-mkt-ink);
  letter-spacing: -0.02em;
  line-height: 1;
}
.t321-mkt-about__stat span {
  display: block;
  margin-top: 0.4rem;
  font-size: 0.78rem;
  color: var(--t321-mkt-ink-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.t321-mkt-about__pillars {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}
.t321-mkt-about__pillar p {
  margin: 0.4rem 0 0;
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--t321-mkt-ink-muted);
}
.t321-mkt-about__pillar-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
}
.t321-mkt-about__pillar-icon--accent {
  background: var(--t321-mkt-accent-wash);
  color: var(--t321-mkt-accent);
}
.t321-mkt-about__pillar-icon--warn {
  background: var(--t321-mkt-warn-wash);
  color: var(--t321-mkt-warn);
}
.t321-mkt-about__pillar-icon--positive {
  background: var(--t321-mkt-positive-wash);
  color: var(--t321-mkt-positive);
}

.t321-mkt-about__team {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}
.t321-mkt-about__team-card {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.t321-mkt-about__avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--t321-mkt-accent), var(--t321-mkt-accent-bright));
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}
.t321-mkt-about__team-role {
  display: block;
  font-size: 0.78rem;
  color: var(--t321-mkt-ink-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: -0.2rem;
  margin-bottom: 0.75rem;
}
.t321-mkt-about__team-card p {
  margin: 0 0 1rem;
  font-size: 0.88rem;
  color: var(--t321-mkt-ink-muted);
  line-height: 1.55;
}
.t321-mkt-about__socials {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}
.t321-mkt-about__socials a {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--t321-mkt-paper-sunk);
  color: var(--t321-mkt-ink-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  text-decoration: none;
  transition: background 120ms ease, color 120ms ease;
}
.t321-mkt-about__socials a:hover {
  background: var(--t321-mkt-accent);
  color: #ffffff;
}

.t321-mkt-about__cta {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  align-items: center;
}
.t321-mkt-about__cta-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.t321-mkt-about__cta-actions .t321-mkt-btn--ghost {
  background: transparent;
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.25);
}
.t321-mkt-about__cta-actions .t321-mkt-btn--ghost:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: #ffffff;
}

@media (max-width: 991.98px) {
  .t321-mkt-about__story,
  .t321-mkt-about__cta {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .t321-mkt-about__pillars,
  .t321-mkt-about__team {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 600px) {
  .t321-mkt-about__pillars,
  .t321-mkt-about__team,
  .t321-mkt-about__stats {
    grid-template-columns: 1fr;
  }
}
</style>

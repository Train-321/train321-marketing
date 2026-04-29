<template>
  <article v-if="course" class="t321-mkt-course">
    <section class="t321-mkt-course__hero">
      <div class="t321-mkt-container t321-mkt-course__hero-grid">
        <div class="t321-mkt-course__hero-body">
          <div class="t321-mkt-course__crumbs">
            <NuxtLink to="/">Home</NuxtLink>
            <i class="fas fa-angle-right" aria-hidden="true"></i>
            <NuxtLink to="/catalog">Courses</NuxtLink>
            <i class="fas fa-angle-right" aria-hidden="true"></i>
            <span>{{ course.title }}</span>
          </div>
          <span class="t321-mkt-eyebrow">
            <i :class="course.icon || 'fas fa-book'" aria-hidden="true"></i>
            {{ course.eyebrow }}
          </span>
          <h1 class="t321-mkt-h1">{{ course.title }}</h1>
          <p class="t321-mkt-lede">{{ course.tagline }}</p>
          <div class="t321-mkt-course__cta">
            <NuxtLink :to="enrollHref" class="t321-mkt-btn t321-mkt-btn--accent t321-mkt-btn--lg">
              Enroll now
              <i class="fas fa-arrow-right" aria-hidden="true"></i>
            </NuxtLink>
            <NuxtLink to="/catalog" class="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg">
              Browse all courses
            </NuxtLink>
          </div>
          <ul v-if="course.accreditations" class="t321-mkt-course__accred">
            <li v-for="a in course.accreditations" :key="a">
              <i class="fas fa-check-circle" aria-hidden="true"></i>{{ a }}
            </li>
          </ul>
        </div>

        <aside class="t321-mkt-course__hero-card" aria-label="Course summary">
          <div class="t321-mkt-course__hero-card-head" :class="'is-tone-' + (course.color || 'accent')">
            <i :class="course.icon || 'fas fa-book'" aria-hidden="true"></i>
          </div>
          <div class="t321-mkt-course__hero-card-body">
            <div v-if="course.priceFrom !== null && course.priceFrom !== undefined" class="t321-mkt-course__price">
              <span class="t321-mkt-course__price-from">From</span>
              <span class="t321-mkt-course__price-amt">${{ course.priceFrom }}</span>
              <span class="t321-mkt-course__price-unit">per seat</span>
            </div>
            <div v-else class="t321-mkt-course__price t321-mkt-course__price--custom">
              <span class="t321-mkt-course__price-amt">Custom</span>
              <span class="t321-mkt-course__price-unit">pricing</span>
            </div>
            <p v-if="course.priceNote" class="t321-mkt-course__price-note">{{ course.priceNote }}</p>
            <ul v-if="course.hero && course.hero.stats" class="t321-mkt-course__stats">
              <li v-for="s in course.hero.stats" :key="s.label">
                <strong>{{ s.value }}</strong>
                <span>{{ s.label }}</span>
              </li>
            </ul>
            <NuxtLink :to="enrollHref" class="t321-mkt-btn t321-mkt-btn--primary t321-mkt-btn--block">
              Get started
              <i class="fas fa-arrow-right" aria-hidden="true"></i>
            </NuxtLink>
            <p class="t321-mkt-course__card-foot">
              <i class="fas fa-shield-alt" aria-hidden="true"></i>
              60-day money-back guarantee on unused seats
            </p>
          </div>
        </aside>
      </div>
    </section>

    <section class="t321-mkt-section">
      <div class="t321-mkt-container t321-mkt-course__two">
        <div>
          <span class="t321-mkt-eyebrow">Course overview</span>
          <h2 class="t321-mkt-h2">What you'll get</h2>
          <p class="t321-mkt-course__summary">{{ course.summary }}</p>
        </div>
        <div v-if="course.outcomes" class="t321-mkt-course__outcomes">
          <h3 class="t321-mkt-h3">By the end, you'll be able to</h3>
          <ul>
            <li v-for="(o, i) in course.outcomes" :key="i">
              <i class="fas fa-check" aria-hidden="true"></i>{{ o }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section v-if="course.modules" class="t321-mkt-section t321-mkt-section--sunk">
      <div class="t321-mkt-container">
        <div class="t321-mkt-section__head">
          <span class="t321-mkt-eyebrow">Curriculum</span>
          <h2 class="t321-mkt-h2">Inside the course</h2>
          <p class="t321-mkt-lede">{{ course.modules.length }} modules — self-paced, with progress that saves automatically.</p>
        </div>
        <ol class="t321-mkt-course__modules">
          <li v-for="(m, i) in course.modules" :key="m.title">
            <span class="t321-mkt-course__mod-num">{{ String(i + 1).padStart(2, "0") }}</span>
            <div class="t321-mkt-course__mod-body">
              <strong>{{ m.title }}</strong>
              <span>{{ m.duration }}</span>
            </div>
            <i class="fas fa-play-circle t321-mkt-course__mod-icon" aria-hidden="true"></i>
          </li>
        </ol>
      </div>
    </section>

    <section v-if="course.certificate" class="t321-mkt-section">
      <div class="t321-mkt-container t321-mkt-course__cert">
        <div class="t321-mkt-course__cert-visual" aria-hidden="true">
          <div class="t321-mkt-course__cert-card">
            <span class="t321-mkt-course__cert-head">Certificate of Completion</span>
            <span class="t321-mkt-course__cert-name">{{ course.title }}</span>
            <span class="t321-mkt-course__cert-seal"><i class="fas fa-medal"></i></span>
            <span class="t321-mkt-course__cert-meta">Train321 · ANSI-accredited</span>
          </div>
        </div>
        <div>
          <span class="t321-mkt-eyebrow">Your certificate</span>
          <h2 class="t321-mkt-h2">Official, instant, accepted</h2>
          <dl class="t321-mkt-course__cert-dl">
            <div><dt>Delivery</dt><dd>{{ course.certificate.delivery }}</dd></div>
            <div><dt>Validity</dt><dd>{{ course.certificate.validity }}</dd></div>
            <div><dt>Accepted by</dt><dd>{{ course.certificate.accepted }}</dd></div>
          </dl>
        </div>
      </div>
    </section>

    <section v-if="course.faqs && course.faqs.length" class="t321-mkt-section t321-mkt-section--sunk">
      <div class="t321-mkt-container t321-mkt-course__faqs">
        <div class="t321-mkt-section__head">
          <span class="t321-mkt-eyebrow">FAQ</span>
          <h2 class="t321-mkt-h2">Common questions</h2>
        </div>
        <details v-for="(f, i) in course.faqs" :key="i" class="t321-mkt-course__faq">
          <summary>
            <span>{{ f.q }}</span>
            <i class="fas fa-plus" aria-hidden="true"></i>
          </summary>
          <p>{{ f.a }}</p>
        </details>
      </div>
    </section>

    <section class="t321-mkt-section t321-mkt-section--ink">
      <div class="t321-mkt-container t321-mkt-course__cta-band">
        <div>
          <h2 class="t321-mkt-h2">Ready to get your team certified?</h2>
          <p class="t321-mkt-lede">
            Buy seats in under a minute. Invite learners by email or CSV. Track completion from a single dashboard.
          </p>
        </div>
        <div class="t321-mkt-course__cta-band-actions">
          <NuxtLink :to="enrollHref" class="t321-mkt-btn t321-mkt-btn--accent t321-mkt-btn--lg">
            Enroll now
            <i class="fas fa-arrow-right" aria-hidden="true"></i>
          </NuxtLink>
          <NuxtLink to="/demo" class="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg">
            See a demo
          </NuxtLink>
        </div>
      </div>
    </section>
  </article>

  <div v-else class="t321-mkt-section">
    <div class="t321-mkt-container">
      <h1 class="t321-mkt-h1">Course not found</h1>
      <p class="t321-mkt-lede">
        We couldn't find that course. <NuxtLink to="/catalog">Browse the catalog</NuxtLink>.
      </p>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const slug = computed(() => route.params.slug);

const { data: courseRaw } = await useSanityFetch(
  groq`*[_type == "course" && slug.current == $slug][0] {
    title, "slug": slug.current, eyebrow, tagline, category, color, icon,
    summary, outcomes, modules, accreditations, certificate,
    priceFrom, priceNote, faqs, enrollId, enrollUrl,
    "hero": { "stats": heroStats }
  }`,
  { slug }
);

const course = computed(() => courseRaw.value);

useSeoMeta(
  computed(() => ({
    title: course.value ? `${course.value.title} · Train321` : "Course · Train321",
    description: course.value?.summary || course.value?.tagline || ""
  }))
);

const enrollHref = computed(() => {
  if (!course.value) return "/enroll";
  if (course.value.enrollUrl) return course.value.enrollUrl;
  const id = course.value.enrollId;
  return id ? `/enroll?add=${id}&checkout=1` : "/enroll";
});
</script>

<style scoped>
.t321-mkt-course__hero {
  background: linear-gradient(180deg, var(--t321-mkt-paper) 0%, var(--t321-mkt-paper-sunk) 100%);
  padding: 3rem 0 2.5rem;
  border-bottom: 1px solid var(--t321-mkt-line);
}
.t321-mkt-course__hero-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 3rem;
  align-items: start;
}

.t321-mkt-course__crumbs {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.82rem;
  color: var(--t321-mkt-ink-muted);
  margin-bottom: 1rem;
}
.t321-mkt-course__crumbs a {
  color: var(--t321-mkt-ink-muted);
  text-decoration: none;
}
.t321-mkt-course__crumbs a:hover { color: var(--t321-mkt-ink); }
.t321-mkt-course__crumbs i { font-size: 0.65rem; }

.t321-mkt-course__cta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}
.t321-mkt-course__accred {
  list-style: none;
  margin: 1.75rem 0 0;
  padding: 0;
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
}
.t321-mkt-course__accred li {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  color: var(--t321-mkt-ink-muted);
}
.t321-mkt-course__accred i {
  color: var(--t321-mkt-positive);
}

.t321-mkt-course__hero-card {
  background: #ffffff;
  border: 1px solid var(--t321-mkt-line);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 32px rgba(15, 15, 14, 0.06);
  position: sticky;
  top: 120px;
}
.t321-mkt-course__hero-card-head {
  padding: 1.5rem;
  font-size: 2.2rem;
  color: #ffffff;
  text-align: center;
  background: linear-gradient(135deg, #0A427B, #1579D1);
}
.t321-mkt-course__hero-card-head.is-tone-amber {
  background: linear-gradient(135deg, #9D6200, #C08A2E);
}
.t321-mkt-course__hero-card-head.is-tone-plum {
  background: linear-gradient(135deg, #6B3A8A, #8C57AE);
}
.t321-mkt-course__hero-card-head.is-tone-emerald {
  background: linear-gradient(135deg, #2D6A4F, #3E8E68);
}
.t321-mkt-course__hero-card-head.is-tone-neutral {
  background: linear-gradient(135deg, #0F0F0E, #3A3A38);
}
.t321-mkt-course__hero-card-body {
  padding: 1.5rem;
}

.t321-mkt-course__price {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-bottom: 0.25rem;
}
.t321-mkt-course__price-from {
  font-size: 0.78rem;
  color: var(--t321-mkt-ink-muted);
  font-weight: 500;
}
.t321-mkt-course__price-amt {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 2.4rem;
  font-weight: 500;
  color: var(--t321-mkt-ink);
  line-height: 1;
  letter-spacing: -0.02em;
}
.t321-mkt-course__price-unit {
  font-size: 0.82rem;
  color: var(--t321-mkt-ink-muted);
}
.t321-mkt-course__price--custom .t321-mkt-course__price-amt { font-size: 1.6rem; }
.t321-mkt-course__price-note {
  font-size: 0.8rem;
  color: var(--t321-mkt-ink-muted);
  margin: 0.25rem 0 1rem;
}

.t321-mkt-course__stats {
  list-style: none;
  padding: 1rem 0;
  margin: 1rem 0;
  border-top: 1px solid var(--t321-mkt-line);
  border-bottom: 1px solid var(--t321-mkt-line);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  text-align: center;
}
.t321-mkt-course__stats li {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}
.t321-mkt-course__stats strong {
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 500;
  font-size: 1.05rem;
  color: var(--t321-mkt-ink);
}
.t321-mkt-course__stats span {
  font-size: 0.7rem;
  color: var(--t321-mkt-ink-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.t321-mkt-course__card-foot {
  margin: 1rem 0 0;
  text-align: center;
  font-size: 0.78rem;
  color: var(--t321-mkt-ink-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}
.t321-mkt-course__card-foot i { color: var(--t321-mkt-positive); }

.t321-mkt-course__two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;
}
.t321-mkt-course__summary {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--t321-mkt-ink-muted);
  max-width: 58ch;
}
.t321-mkt-course__outcomes {
  background: #ffffff;
  border: 1px solid var(--t321-mkt-line);
  border-radius: 14px;
  padding: 1.75rem;
}
.t321-mkt-course__outcomes ul {
  list-style: none;
  margin: 0.75rem 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.t321-mkt-course__outcomes li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.95rem;
  color: var(--t321-mkt-ink);
}
.t321-mkt-course__outcomes i {
  margin-top: 0.35rem;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--t321-mkt-positive-wash);
  color: var(--t321-mkt-positive);
  font-size: 0.68rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.t321-mkt-course__modules {
  list-style: none;
  margin: 0;
  padding: 0;
  max-width: 820px;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.t321-mkt-course__modules li {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: #ffffff;
  border: 1px solid var(--t321-mkt-line);
  border-radius: 12px;
  transition: border-color 140ms ease, transform 140ms ease;
}
.t321-mkt-course__modules li:hover {
  border-color: var(--t321-mkt-line-strong);
  transform: translateY(-1px);
}
.t321-mkt-course__mod-num {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.1rem;
  color: var(--t321-mkt-accent);
  font-weight: 500;
  min-width: 32px;
}
.t321-mkt-course__mod-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.t321-mkt-course__mod-body strong {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--t321-mkt-ink);
}
.t321-mkt-course__mod-body span {
  font-size: 0.8rem;
  color: var(--t321-mkt-ink-muted);
  margin-top: 0.15rem;
}
.t321-mkt-course__mod-icon {
  color: var(--t321-mkt-line-strong);
  font-size: 1.3rem;
  transition: color 120ms ease;
}
.t321-mkt-course__modules li:hover .t321-mkt-course__mod-icon {
  color: var(--t321-mkt-accent);
}

.t321-mkt-course__cert {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}
.t321-mkt-course__cert-visual {
  display: flex;
  justify-content: center;
}
.t321-mkt-course__cert-card {
  width: 100%;
  max-width: 360px;
  aspect-ratio: 4 / 3;
  background: linear-gradient(135deg, #fffbf2, #f6ecdb);
  border: 1px solid #e6d9be;
  border-radius: 12px;
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto 1fr auto;
  gap: 0.5rem;
  box-shadow: 0 20px 48px rgba(15, 15, 14, 0.15);
  transform: rotate(-1.5deg);
  position: relative;
}
.t321-mkt-course__cert-head {
  grid-column: 1 / 2;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #9D6200;
}
.t321-mkt-course__cert-name {
  grid-column: 1 / 2;
  align-self: center;
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.3rem;
  line-height: 1.2;
  color: #5A3F14;
  font-weight: 500;
}
.t321-mkt-course__cert-seal {
  grid-column: 2 / 3;
  grid-row: 1 / 3;
  align-self: center;
  justify-self: end;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #d9a847, #a47914);
  color: #fffbf2;
  font-size: 1.6rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 -4px 6px rgba(0, 0, 0, 0.15);
}
.t321-mkt-course__cert-meta {
  grid-column: 1 / 3;
  font-size: 0.72rem;
  color: #9D6200;
  padding-top: 0.5rem;
  border-top: 1px solid #e6d9be;
}
.t321-mkt-course__cert-dl {
  margin: 1.25rem 0 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.85rem;
}
.t321-mkt-course__cert-dl > div {
  display: grid;
  grid-template-columns: 120px 1fr;
  align-items: baseline;
  gap: 1rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--t321-mkt-line);
}
.t321-mkt-course__cert-dl dt {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--t321-mkt-ink-muted);
  margin: 0;
}
.t321-mkt-course__cert-dl dd {
  margin: 0;
  font-size: 0.95rem;
  color: var(--t321-mkt-ink);
}

.t321-mkt-course__faqs {
  max-width: 820px;
}
.t321-mkt-course__faq {
  background: #ffffff;
  border: 1px solid var(--t321-mkt-line);
  border-radius: 12px;
  margin-bottom: 0.6rem;
  transition: border-color 140ms ease;
}
.t321-mkt-course__faq[open] {
  border-color: var(--t321-mkt-accent);
}
.t321-mkt-course__faq summary {
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.95rem;
}
.t321-mkt-course__faq summary::-webkit-details-marker { display: none; }
.t321-mkt-course__faq summary i {
  color: var(--t321-mkt-accent);
  transition: transform 200ms ease;
}
.t321-mkt-course__faq[open] summary i { transform: rotate(45deg); }
.t321-mkt-course__faq p {
  margin: 0;
  padding: 0 1.25rem 1.1rem;
  font-size: 0.92rem;
  color: var(--t321-mkt-ink-muted);
  line-height: 1.6;
}

.t321-mkt-course__cta-band {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  align-items: center;
}
.t321-mkt-course__cta-band-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.t321-mkt-course__cta-band-actions .t321-mkt-btn--ghost {
  background: transparent;
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.25);
}
.t321-mkt-course__cta-band-actions .t321-mkt-btn--ghost:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: #ffffff;
}

@media (max-width: 991.98px) {
  .t321-mkt-course__hero-grid,
  .t321-mkt-course__two,
  .t321-mkt-course__cert,
  .t321-mkt-course__cta-band {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .t321-mkt-course__hero-card { position: static; }
}
</style>

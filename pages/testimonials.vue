<template>
  <div class="t321-mkt-testimonials">
    <section class="t321-mkt-testimonials__hero">
      <div class="t321-mkt-container">
        <span class="t321-mkt-eyebrow"><i class="fas fa-quote-left"></i> Customer stories</span>
        <h1 class="t321-mkt-h1">Real words from real operators.</h1>
        <p class="t321-mkt-lede">
          We don't write our testimonials. These are emails, calls, and Slack messages from
          operators running actual restaurants, bars, and multi-unit groups.
        </p>
        <div class="t321-mkt-testimonials__stats">
          <div class="t321-mkt-testimonials__stat">
            <strong>500K+</strong>
            <span>Certificates issued</span>
          </div>
          <div class="t321-mkt-testimonials__stat">
            <strong>97%</strong>
            <span>Average completion rate</span>
          </div>
          <div class="t321-mkt-testimonials__stat">
            <strong>4.8/5</strong>
            <span>Operator satisfaction</span>
          </div>
          <div class="t321-mkt-testimonials__stat">
            <strong>2 hrs</strong>
            <span>Avg. support reply</span>
          </div>
        </div>
      </div>
    </section>

    <section class="t321-mkt-section">
      <div class="t321-mkt-container">
        <div class="t321-mkt-section__head">
          <span class="t321-mkt-eyebrow">Featured</span>
          <h2 class="t321-mkt-h2">The one we print on the wall</h2>
        </div>
        <figure class="t321-mkt-testimonials__featured">
          <i class="fas fa-quote-left t321-mkt-testimonials__featured-mark" aria-hidden="true"></i>
          <blockquote>{{ featured.quote }}</blockquote>
          <figcaption>
            <div class="t321-mkt-testimonials__avatar" aria-hidden="true">{{ initials(featured.name) }}</div>
            <div>
              <strong>{{ featured.name }}</strong>
              <span>{{ featured.role }} · {{ featured.company }}</span>
            </div>
            <div v-if="featured.stat" class="t321-mkt-testimonials__featured-stat">
              <strong>{{ featured.stat.value }}</strong>
              <span>{{ featured.stat.label }}</span>
            </div>
          </figcaption>
        </figure>
      </div>
    </section>

    <section class="t321-mkt-section t321-mkt-section--sunk">
      <div class="t321-mkt-container">
        <div class="t321-mkt-section__head">
          <span class="t321-mkt-eyebrow"><i class="fas fa-users"></i> Operator voices</span>
          <h2 class="t321-mkt-h2">More from the field</h2>
        </div>
        <div class="t321-mkt-testimonials__grid">
          <article v-for="t in rest" :key="t.id" class="t321-mkt-testimonials__card t321-mkt-card">
            <i class="fas fa-quote-left t321-mkt-testimonials__card-mark" aria-hidden="true"></i>
            <blockquote>{{ t.quote }}</blockquote>
            <footer>
              <div class="t321-mkt-testimonials__avatar t321-mkt-testimonials__avatar--sm" aria-hidden="true">{{ initials(t.name) }}</div>
              <div>
                <strong>{{ t.name }}</strong>
                <span>{{ t.role }} · {{ t.company }}</span>
              </div>
            </footer>
            <div v-if="t.stat" class="t321-mkt-testimonials__card-stat">
              <strong>{{ t.stat.value }}</strong>
              <span>{{ t.stat.label }}</span>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="t321-mkt-section">
      <div class="t321-mkt-container">
        <div class="t321-mkt-section__head">
          <span class="t321-mkt-eyebrow"><i class="fas fa-award"></i> Trusted by</span>
          <h2 class="t321-mkt-h2">Associations and operators who partner with us</h2>
        </div>
        <div class="t321-mkt-testimonials__logos">
          <div v-for="l in trustLogos" :key="l.name" class="t321-mkt-testimonials__logo">
            <span>{{ l.name }}</span>
            <small>{{ l.label }}</small>
          </div>
        </div>
      </div>
    </section>

    <section class="t321-mkt-section t321-mkt-section--ink">
      <div class="t321-mkt-container t321-mkt-testimonials__cta">
        <div>
          <h2 class="t321-mkt-h2">Want a reference call?</h2>
          <p class="t321-mkt-lede">
            We'll happily introduce you to an operator running Train321 at roughly your
            scale. No scripts, no pitches — just a peer conversation.
          </p>
        </div>
        <NuxtLink to="/contact" class="t321-mkt-btn t321-mkt-btn--accent t321-mkt-btn--lg">
          Request a reference
          <i class="fas fa-arrow-right" aria-hidden="true"></i>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script>
import { testimonials, trustLogos } from "~/assets/data/testimonials";

export default {
  name: "MarketingTestimonials",
  data() {
    return { testimonials, trustLogos };
  },
  computed: {
    featured() { return this.testimonials[0]; },
    rest() { return this.testimonials.slice(1); }
  },
  methods: {
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
.t321-mkt-testimonials__hero {
  padding: 3rem 0 2rem;
  background: linear-gradient(180deg, var(--t321-mkt-paper) 0%, var(--t321-mkt-paper-sunk) 100%);
  border-bottom: 1px solid var(--t321-mkt-line);
}
.t321-mkt-testimonials__hero .t321-mkt-h1 { max-width: 22ch; }
.t321-mkt-testimonials__stats {
  margin-top: 2rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}
.t321-mkt-testimonials__stat {
  background: #ffffff;
  border: 1px solid var(--t321-mkt-line);
  border-radius: 14px;
  padding: 1.1rem 1.25rem;
}
.t321-mkt-testimonials__stat strong {
  display: block;
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.75rem;
  line-height: 1;
  font-weight: 500;
  letter-spacing: -0.02em;
}
.t321-mkt-testimonials__stat span {
  display: block;
  margin-top: 0.4rem;
  font-size: 0.78rem;
  color: var(--t321-mkt-ink-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.t321-mkt-testimonials__featured {
  position: relative;
  background: #ffffff;
  border: 1px solid var(--t321-mkt-line);
  border-radius: 20px;
  padding: 2.5rem;
  max-width: 920px;
  margin: 0 auto;
  box-shadow: 0 12px 36px rgba(15, 15, 14, 0.05);
}
.t321-mkt-testimonials__featured-mark {
  position: absolute;
  top: 1.75rem;
  left: 2rem;
  color: var(--t321-mkt-accent-wash);
  font-size: 2.5rem;
}
.t321-mkt-testimonials__featured blockquote {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.5rem;
  line-height: 1.45;
  font-weight: 400;
  color: var(--t321-mkt-ink);
  margin: 0 0 1.75rem;
  padding-left: 3.25rem;
  letter-spacing: -0.01em;
}
.t321-mkt-testimonials__featured figcaption {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1rem;
  padding-left: 3.25rem;
}
.t321-mkt-testimonials__featured figcaption > div strong {
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
}
.t321-mkt-testimonials__featured figcaption > div span {
  display: block;
  font-size: 0.82rem;
  color: var(--t321-mkt-ink-muted);
}
.t321-mkt-testimonials__featured-stat {
  text-align: right;
  padding-left: 1.5rem;
  border-left: 1px solid var(--t321-mkt-line);
}
.t321-mkt-testimonials__featured-stat strong {
  display: block;
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.4rem;
  font-weight: 500;
  color: var(--t321-mkt-accent);
}
.t321-mkt-testimonials__featured-stat span {
  display: block;
  font-size: 0.75rem;
  color: var(--t321-mkt-ink-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.15rem;
}

.t321-mkt-testimonials__avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--t321-mkt-accent), var(--t321-mkt-accent-bright));
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 600;
}
.t321-mkt-testimonials__avatar--sm { width: 40px; height: 40px; font-size: 0.8rem; }

.t321-mkt-testimonials__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}
.t321-mkt-testimonials__card {
  position: relative;
  padding: 2rem 1.75rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.t321-mkt-testimonials__card-mark {
  position: absolute;
  top: 1.25rem;
  right: 1.5rem;
  color: var(--t321-mkt-accent-wash);
  font-size: 1.75rem;
}
.t321-mkt-testimonials__card blockquote {
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--t321-mkt-ink);
}
.t321-mkt-testimonials__card footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--t321-mkt-line);
}
.t321-mkt-testimonials__card footer strong {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
}
.t321-mkt-testimonials__card footer span {
  display: block;
  font-size: 0.78rem;
  color: var(--t321-mkt-ink-muted);
}
.t321-mkt-testimonials__card-stat {
  display: inline-flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.5rem 0.85rem;
  background: var(--t321-mkt-positive-wash);
  color: var(--t321-mkt-positive);
  border-radius: 8px;
  align-self: flex-start;
}
.t321-mkt-testimonials__card-stat strong {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1rem;
  font-weight: 600;
}
.t321-mkt-testimonials__card-stat span {
  font-size: 0.78rem;
}

.t321-mkt-testimonials__logos {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
.t321-mkt-testimonials__logo {
  background: #ffffff;
  border: 1px solid var(--t321-mkt-line);
  border-radius: 12px;
  padding: 1.1rem 1.25rem;
  text-align: center;
}
.t321-mkt-testimonials__logo span {
  display: block;
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--t321-mkt-ink);
}
.t321-mkt-testimonials__logo small {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.76rem;
  color: var(--t321-mkt-ink-muted);
}

.t321-mkt-testimonials__cta {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  align-items: center;
}

@media (max-width: 991.98px) {
  .t321-mkt-testimonials__stats { grid-template-columns: repeat(2, 1fr); }
  .t321-mkt-testimonials__featured { padding: 2rem 1.5rem; }
  .t321-mkt-testimonials__featured-mark { left: 1.25rem; top: 1.25rem; font-size: 1.75rem; }
  .t321-mkt-testimonials__featured blockquote,
  .t321-mkt-testimonials__featured figcaption { padding-left: 2.25rem; }
  .t321-mkt-testimonials__featured figcaption {
    grid-template-columns: auto 1fr;
  }
  .t321-mkt-testimonials__featured-stat {
    grid-column: 1 / -1;
    text-align: left;
    padding-left: 2.25rem;
    border-left: 0;
    border-top: 1px solid var(--t321-mkt-line);
    padding-top: 0.85rem;
  }
  .t321-mkt-testimonials__grid { grid-template-columns: 1fr; }
  .t321-mkt-testimonials__logos { grid-template-columns: repeat(2, 1fr); }
  .t321-mkt-testimonials__cta { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .t321-mkt-testimonials__logos { grid-template-columns: 1fr; }
}
</style>

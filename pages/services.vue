<template>
  <div class="t321-mkt-services">
    <section class="t321-mkt-services__hero">
      <div class="t321-mkt-container">
        <span class="t321-mkt-eyebrow"><i class="fas fa-layer-group"></i> Services</span>
        <h1 class="t321-mkt-h1">Built for teams of every size.</h1>
        <p class="t321-mkt-lede">
          Whether you're a single-location owner training five people or a franchise
          deploying across hundreds of units, we have a plan — and a set of services —
          that fits how you actually work.
        </p>
      </div>
    </section>

    <section class="t321-mkt-section">
      <div class="t321-mkt-container">
        <div class="t321-mkt-services__tiers">
          <article v-for="t in tiers" :key="t.name" class="t321-mkt-services__tier t321-mkt-card" :class="{ 'is-featured': t.featured }">
            <span v-if="t.featured" class="t321-mkt-badge t321-mkt-badge--positive">Most popular</span>
            <span class="t321-mkt-services__tier-eyebrow">{{ t.audience }}</span>
            <h3 class="t321-mkt-h3">{{ t.name }}</h3>
            <div class="t321-mkt-services__tier-price">
              <strong>{{ t.price }}</strong>
              <span v-if="t.priceSub">{{ t.priceSub }}</span>
            </div>
            <ul>
              <li v-for="f in t.features" :key="f">
                <i class="fas fa-check" aria-hidden="true"></i>
                {{ f }}
              </li>
            </ul>
            <NuxtLink :to="t.ctaTo" class="t321-mkt-btn" :class="t.featured ? 't321-mkt-btn--primary' : 't321-mkt-btn--ghost'">
              {{ t.cta }}
              <i class="fas fa-arrow-right" aria-hidden="true"></i>
            </NuxtLink>
          </article>
        </div>
      </div>
    </section>

    <section class="t321-mkt-section t321-mkt-section--sunk">
      <div class="t321-mkt-container">
        <div class="t321-mkt-section__head">
          <span class="t321-mkt-eyebrow"><i class="fas fa-cogs"></i> Additional services</span>
          <h2 class="t321-mkt-h2">Beyond the standard catalog</h2>
          <p class="t321-mkt-lede">
            For operators with specific needs — branding, reporting integrations, or
            proprietary SOPs — we offer hands-on professional services.
          </p>
        </div>
        <div class="t321-mkt-services__addons">
          <NuxtLink to="/custom-courses" class="t321-mkt-services__addon t321-mkt-card t321-mkt-card--hover">
            <span class="t321-mkt-services__addon-icon"><i class="fas fa-sliders-h"></i></span>
            <h3 class="t321-mkt-h3">Custom course production</h3>
            <p>We script, record, and deploy custom courses from your SOPs in 4-6 weeks. You own the content; we host it.</p>
            <span class="t321-mkt-services__addon-link">Learn more <i class="fas fa-arrow-right"></i></span>
          </NuxtLink>
          <NuxtLink to="/white-labeling" class="t321-mkt-services__addon t321-mkt-card t321-mkt-card--hover">
            <span class="t321-mkt-services__addon-icon"><i class="fas fa-paint-brush"></i></span>
            <h3 class="t321-mkt-h3">White-label deployment</h3>
            <p>Every course, delivered in your colors, at your URL, with your logo on every certificate.</p>
            <span class="t321-mkt-services__addon-link">Learn more <i class="fas fa-arrow-right"></i></span>
          </NuxtLink>
          <NuxtLink to="/licensing" class="t321-mkt-services__addon t321-mkt-card t321-mkt-card--hover">
            <span class="t321-mkt-services__addon-icon"><i class="fas fa-id-card"></i></span>
            <h3 class="t321-mkt-h3">Association licensing</h3>
            <p>State restaurant associations and trade groups license our catalog as the engine behind their member training.</p>
            <span class="t321-mkt-services__addon-link">Learn more <i class="fas fa-arrow-right"></i></span>
          </NuxtLink>
          <NuxtLink to="/additional-courses" class="t321-mkt-services__addon t321-mkt-card t321-mkt-card--hover">
            <span class="t321-mkt-services__addon-icon"><i class="fas fa-plus-circle"></i></span>
            <h3 class="t321-mkt-h3">Specialized training</h3>
            <p>Cash handling, active-shooter response, data privacy, workplace violence — beyond the core compliance catalog.</p>
            <span class="t321-mkt-services__addon-link">Learn more <i class="fas fa-arrow-right"></i></span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="t321-mkt-section t321-mkt-section--ink">
      <div class="t321-mkt-container t321-mkt-services__cta">
        <div>
          <h2 class="t321-mkt-h2">Not sure which fits?</h2>
          <p class="t321-mkt-lede">
            Tell us about your team — we'll point you to the right plan (and the discount
            that applies to your headcount).
          </p>
        </div>
        <NuxtLink to="/contact" class="t321-mkt-btn t321-mkt-btn--accent t321-mkt-btn--lg">
          Talk to sales
          <i class="fas fa-arrow-right" aria-hidden="true"></i>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "MarketingServices",
  data() {
    return {
      tiers: [
        {
          name: "Individual",
          audience: "Single learners",
          price: "From $12",
          priceSub: "per course",
          featured: false,
          features: [
            "Any course in the catalog",
            "Instant certificate on pass",
            "Mobile-friendly course player",
            "Email support within 2 hours"
          ],
          cta: "Browse courses",
          ctaTo: "/catalog"
        },
        {
          name: "Team",
          audience: "5-100 seats",
          price: "From $99/mo",
          priceSub: "+ per-seat pricing",
          featured: true,
          features: [
            "All courses included",
            "Manager dashboard & reporting",
            "CSV learner import",
            "Volume discounts at 10, 25, 50, 100 seats",
            "Phone & chat support"
          ],
          cta: "Start a team plan",
          ctaTo: "/enroll"
        },
        {
          name: "Business",
          audience: "100+ seats, multi-unit",
          price: "Custom",
          priceSub: "annual pricing",
          featured: false,
          features: [
            "Everything in Team",
            "SSO (Okta, Google, Azure AD)",
            "SCORM / xAPI export to your LMS",
            "Custom reporting & API access",
            "Named customer success manager"
          ],
          cta: "Talk to sales",
          ctaTo: "/contact"
        }
      ]
    };
  }
};
</script>

<style scoped>
.t321-mkt-services__hero {
  padding: 3rem 0 2rem;
  background: linear-gradient(180deg, var(--t321-mkt-paper) 0%, var(--t321-mkt-paper-sunk) 100%);
  border-bottom: 1px solid var(--t321-mkt-line);
}
.t321-mkt-services__hero .t321-mkt-h1 { max-width: 20ch; }

.t321-mkt-services__tiers {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  align-items: stretch;
}
.t321-mkt-services__tier {
  padding: 2rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
  border-width: 1.5px;
}
.t321-mkt-services__tier.is-featured {
  border-color: var(--t321-mkt-ink);
  transform: translateY(-6px);
  box-shadow: 0 24px 48px rgba(15, 15, 14, 0.12);
}
.t321-mkt-services__tier .t321-mkt-badge {
  position: absolute;
  top: -10px;
  left: 1.75rem;
}
.t321-mkt-services__tier-eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--t321-mkt-ink-muted);
}
.t321-mkt-services__tier-price {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.75rem 0 1.25rem;
  border-bottom: 1px solid var(--t321-mkt-line);
  margin-bottom: 1.25rem;
}
.t321-mkt-services__tier-price strong {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 2rem;
  font-weight: 500;
  color: var(--t321-mkt-ink);
  line-height: 1;
  letter-spacing: -0.02em;
}
.t321-mkt-services__tier-price span {
  font-size: 0.88rem;
  color: var(--t321-mkt-ink-muted);
}
.t321-mkt-services__tier ul {
  list-style: none;
  margin: 0 0 1.75rem;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  flex: 1;
}
.t321-mkt-services__tier ul li {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  font-size: 0.92rem;
  color: var(--t321-mkt-ink);
}
.t321-mkt-services__tier ul li i {
  margin-top: 0.2rem;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--t321-mkt-positive-wash);
  color: var(--t321-mkt-positive);
  font-size: 0.65rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.t321-mkt-services__tier .t321-mkt-btn { margin-top: auto; }

.t321-mkt-services__addons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}
.t321-mkt-services__addon {
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.t321-mkt-services__addon-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--t321-mkt-accent-wash);
  color: var(--t321-mkt-accent);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  margin-bottom: 0.5rem;
}
.t321-mkt-services__addon p {
  margin: 0 0 0.75rem;
  font-size: 0.92rem;
  color: var(--t321-mkt-ink-muted);
  line-height: 1.55;
}
.t321-mkt-services__addon-link {
  color: var(--t321-mkt-accent);
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: auto;
}

.t321-mkt-services__cta {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  align-items: center;
}

@media (max-width: 991.98px) {
  .t321-mkt-services__tiers { grid-template-columns: 1fr; }
  .t321-mkt-services__tier.is-featured { transform: none; }
  .t321-mkt-services__addons { grid-template-columns: 1fr; }
  .t321-mkt-services__cta { grid-template-columns: 1fr; }
}
</style>

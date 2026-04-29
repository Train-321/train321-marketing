<template>
  <article v-if="page" class="t321-mkt-legal">
    <section class="t321-mkt-legal__hero">
      <div class="t321-mkt-container">
        <div class="t321-mkt-legal__crumbs">
          <NuxtLink to="/">Home</NuxtLink>
          <i class="fas fa-angle-right" aria-hidden="true"></i>
          <span>{{ page.title }}</span>
        </div>
        <span class="t321-mkt-eyebrow"><i class="fas fa-file-alt" aria-hidden="true"></i> Policy</span>
        <h1 class="t321-mkt-h1">{{ page.title }}</h1>
        <p class="t321-mkt-legal__date">Effective {{ formatDate(page.effectiveDate) }}</p>
        <p v-if="page.intro" class="t321-mkt-lede">{{ page.intro }}</p>
      </div>
    </section>

    <section class="t321-mkt-section">
      <div class="t321-mkt-container t321-mkt-legal__body">
        <aside class="t321-mkt-legal__toc" aria-label="On this page">
          <span class="t321-mkt-legal__toc-head">On this page</span>
          <ol>
            <li v-for="(s, i) in page.sections" :key="i">
              <a :href="'#section-' + i">{{ s.heading }}</a>
            </li>
          </ol>
        </aside>

        <div class="t321-mkt-prose t321-mkt-legal__prose">
          <section
            v-for="(s, i) in page.sections"
            :key="i"
            :id="'section-' + i"
            class="t321-mkt-legal__section"
          >
            <h2>{{ s.heading }}</h2>
            <template v-for="(b, bi) in s.blocks">
              <p v-if="b.type === 'p'" :key="'p' + bi">{{ b.content }}</p>
              <ul v-else-if="b.type === 'ul'" :key="'ul' + bi">
                <li v-for="(it, idx) in b.content" :key="idx">{{ it }}</li>
              </ul>
              <ol v-else-if="b.type === 'ol'" :key="'ol' + bi">
                <li v-for="(it, idx) in b.content" :key="idx">{{ it }}</li>
              </ol>
            </template>
          </section>
        </div>
      </div>
    </section>
  </article>

  <div v-else class="t321-mkt-section">
    <div class="t321-mkt-container">
      <h1 class="t321-mkt-h1">Page not found</h1>
      <p class="t321-mkt-lede">
        <NuxtLink to="/">Return home</NuxtLink>.
      </p>
    </div>
  </div>
</template>

<script>
import { legalPages } from "~/assets/data/legal";

export default {
  name: "LegalPage",
  props: {
    slug: { type: String, default: "" }
  },
  computed: {
    page() {
      const key = this.slug || this.$route.params.slug || this.$route.meta?.slug;
      return legalPages[key] || null;
    }
  },
  methods: {
    formatDate(iso) {
      if (!iso) return "";
      const d = new Date(iso);
      return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    }
  }
};
</script>

<style scoped>
.t321-mkt-legal__hero {
  padding: 3rem 0 2rem;
  background: var(--t321-mkt-paper-sunk);
  border-bottom: 1px solid var(--t321-mkt-line);
}
.t321-mkt-legal__crumbs {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.82rem;
  color: var(--t321-mkt-ink-muted);
  margin-bottom: 1rem;
}
.t321-mkt-legal__crumbs a {
  color: var(--t321-mkt-ink-muted);
  text-decoration: none;
}
.t321-mkt-legal__crumbs a:hover { color: var(--t321-mkt-ink); }
.t321-mkt-legal__crumbs i { font-size: 0.65rem; }
.t321-mkt-legal__date {
  font-size: 0.82rem;
  color: var(--t321-mkt-ink-muted);
  margin: 0 0 1rem;
}
.t321-mkt-legal__body {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 3rem;
  align-items: start;
}
.t321-mkt-legal__toc {
  position: sticky;
  top: 120px;
  padding: 1.25rem;
  background: #ffffff;
  border: 1px solid var(--t321-mkt-line);
  border-radius: 12px;
}
.t321-mkt-legal__toc-head {
  display: block;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--t321-mkt-ink-muted);
  margin-bottom: 0.75rem;
}
.t321-mkt-legal__toc ol {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  counter-reset: toc;
}
.t321-mkt-legal__toc li {
  counter-increment: toc;
}
.t321-mkt-legal__toc a {
  font-size: 0.85rem;
  color: var(--t321-mkt-ink-muted);
  text-decoration: none;
  transition: color 120ms ease;
}
.t321-mkt-legal__toc a:hover { color: var(--t321-mkt-accent); }
.t321-mkt-legal__prose { max-width: 72ch; }
.t321-mkt-legal__section { scroll-margin-top: 120px; }

@media (max-width: 991.98px) {
  .t321-mkt-legal__body {
    grid-template-columns: 1fr;
  }
  .t321-mkt-legal__toc {
    position: static;
    order: 0;
  }
  .t321-mkt-legal__toc ol {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
}
</style>

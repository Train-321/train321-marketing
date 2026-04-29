<template>
  <div class="t321-mkt-faq">
    <section class="t321-mkt-faq__hero">
      <div class="t321-mkt-container">
        <span class="t321-mkt-eyebrow"><i class="fas fa-question-circle"></i> Frequently asked</span>
        <h1 class="t321-mkt-h1">Questions we hear a lot.</h1>
        <p class="t321-mkt-lede">
          Can't find what you need? <NuxtLink to="/contact">Drop us a line</NuxtLink> —
          a real person will reply within 2 business hours.
        </p>

        <div class="t321-mkt-faq__search">
          <i class="fas fa-search" aria-hidden="true"></i>
          <input v-model="query" type="search" placeholder="Search FAQs…" aria-label="Search FAQs" />
          <button v-if="query" type="button" class="t321-mkt-faq__search-clear" @click="query = ''"><i class="fas fa-times"></i></button>
        </div>
      </div>
    </section>

    <section class="t321-mkt-section">
      <div class="t321-mkt-container t321-mkt-faq__body">
        <nav class="t321-mkt-faq__nav" aria-label="FAQ categories">
          <span class="t321-mkt-faq__nav-head">Categories</span>
          <a
            v-for="cat in faqs"
            :key="cat.category"
            :href="'#' + slug(cat.category)"
            class="t321-mkt-faq__nav-link"
          >{{ cat.category }}</a>
        </nav>

        <div class="t321-mkt-faq__list">
          <section
            v-for="cat in filteredCategories"
            :key="cat.category"
            :id="slug(cat.category)"
            class="t321-mkt-faq__cat"
          >
            <h2 class="t321-mkt-h2">{{ cat.category }}</h2>
            <details v-for="(it, i) in cat.items" :key="i" class="t321-mkt-faq__item">
              <summary>
                <span>{{ it.q }}</span>
                <i class="fas fa-plus" aria-hidden="true"></i>
              </summary>
              <p>{{ it.a }}</p>
            </details>
          </section>

          <div v-if="!filteredCategories.length" class="t321-mkt-faq__empty">
            <i class="fas fa-search"></i>
            <h3>No matching questions.</h3>
            <p>Try a different search term or <NuxtLink to="/contact">ask us directly</NuxtLink>.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="t321-mkt-section t321-mkt-section--sunk">
      <div class="t321-mkt-container t321-mkt-faq__cta">
        <div>
          <span class="t321-mkt-eyebrow">Still stuck?</span>
          <h2 class="t321-mkt-h2">We're here to help.</h2>
          <p class="t321-mkt-lede">
            Email, phone, or live chat — whichever works. Most replies land within 2 business hours.
          </p>
        </div>
        <div class="t321-mkt-faq__cta-actions">
          <NuxtLink to="/contact" class="t321-mkt-btn t321-mkt-btn--primary t321-mkt-btn--lg">
            Contact support
          </NuxtLink>
          <a href="tel:+15613257300" class="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg">
            <i class="fas fa-phone"></i> 561-325-7300
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { faqs } from "~/assets/data/faqs";

export default {
  name: "MarketingFaq",
  data() {
    return { faqs, query: "" };
  },
  computed: {
    filteredCategories() {
      const q = this.query.trim().toLowerCase();
      if (!q) return this.faqs;
      return this.faqs
        .map(cat => ({
          ...cat,
          items: cat.items.filter(it =>
            (it.q + " " + it.a).toLowerCase().includes(q)
          )
        }))
        .filter(cat => cat.items.length);
    }
  },
  methods: {
    slug(s) {
      return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    }
  }
};
</script>

<style scoped>
.t321-mkt-faq__hero {
  padding: 3rem 0 2rem;
  background: linear-gradient(180deg, var(--t321-mkt-paper) 0%, var(--t321-mkt-paper-sunk) 100%);
  border-bottom: 1px solid var(--t321-mkt-line);
}
.t321-mkt-faq__search {
  margin-top: 1.5rem;
  max-width: 560px;
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1.5px solid var(--t321-mkt-line-strong);
  border-radius: 12px;
  transition: border-color 120ms ease, box-shadow 120ms ease;
}
.t321-mkt-faq__search:focus-within {
  border-color: var(--t321-mkt-accent);
  box-shadow: 0 0 0 4px var(--t321-mkt-accent-wash);
}
.t321-mkt-faq__search > i {
  padding-left: 1rem;
  color: var(--t321-mkt-ink-muted);
}
.t321-mkt-faq__search input {
  flex: 1;
  border: 0;
  outline: none;
  background: transparent;
  padding: 0.85rem 1rem;
  font-size: 1rem;
  font-family: inherit;
  min-width: 0;
}
.t321-mkt-faq__search-clear {
  background: transparent;
  border: 0;
  padding: 0.5rem 0.85rem;
  cursor: pointer;
  color: var(--t321-mkt-ink-muted);
}

.t321-mkt-faq__body {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 3rem;
  align-items: start;
}
.t321-mkt-faq__nav {
  position: sticky;
  top: 120px;
  padding: 1.25rem;
  background: #ffffff;
  border: 1px solid var(--t321-mkt-line);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.t321-mkt-faq__nav-head {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--t321-mkt-ink-muted);
  margin-bottom: 0.25rem;
}
.t321-mkt-faq__nav-link {
  padding: 0.5rem 0.6rem;
  border-radius: 7px;
  font-size: 0.88rem;
  color: var(--t321-mkt-ink);
  text-decoration: none;
  transition: background 120ms ease;
}
.t321-mkt-faq__nav-link:hover {
  background: var(--t321-mkt-paper-sunk);
  color: var(--t321-mkt-accent);
}

.t321-mkt-faq__list {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}
.t321-mkt-faq__cat h2 { margin-bottom: 1rem; }
.t321-mkt-faq__item {
  background: #ffffff;
  border: 1px solid var(--t321-mkt-line);
  border-radius: 12px;
  margin-bottom: 0.6rem;
  transition: border-color 140ms ease;
}
.t321-mkt-faq__item[open] { border-color: var(--t321-mkt-accent); }
.t321-mkt-faq__item summary {
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.95rem;
}
.t321-mkt-faq__item summary::-webkit-details-marker { display: none; }
.t321-mkt-faq__item summary i {
  color: var(--t321-mkt-accent);
  transition: transform 200ms ease;
}
.t321-mkt-faq__item[open] summary i { transform: rotate(45deg); }
.t321-mkt-faq__item p {
  margin: 0;
  padding: 0 1.25rem 1.1rem;
  font-size: 0.92rem;
  color: var(--t321-mkt-ink-muted);
  line-height: 1.65;
}

.t321-mkt-faq__empty {
  text-align: center;
  padding: 3rem;
  background: #ffffff;
  border: 1px dashed var(--t321-mkt-line-strong);
  border-radius: 14px;
  color: var(--t321-mkt-ink-muted);
}
.t321-mkt-faq__empty i { font-size: 1.5rem; margin-bottom: 0.6rem; display: block; }
.t321-mkt-faq__empty h3 {
  font-family: 'Fraunces', Georgia, serif;
  color: var(--t321-mkt-ink);
  font-size: 1.2rem;
  margin: 0 0 0.4rem;
  letter-spacing: -0.01em;
  font-weight: 500;
}
.t321-mkt-faq__empty a { color: var(--t321-mkt-accent); }

.t321-mkt-faq__cta {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  align-items: center;
}
.t321-mkt-faq__cta-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

@media (max-width: 991.98px) {
  .t321-mkt-faq__body { grid-template-columns: 1fr; }
  .t321-mkt-faq__nav {
    position: static;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .t321-mkt-faq__nav-head { width: 100%; }
  .t321-mkt-faq__cta { grid-template-columns: 1fr; }
}
</style>

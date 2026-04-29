<template>
  <div class="t321-mkt-blog">
    <section class="t321-mkt-blog__hero">
      <div class="t321-mkt-container">
        <span class="t321-mkt-eyebrow"><i class="fas fa-feather-alt"></i> Field notes</span>
        <h1 class="t321-mkt-h1">The Train321 journal.</h1>
        <p class="t321-mkt-lede">
          Compliance updates, operator playbooks, and the lessons we collect from
          thousands of rollouts — written by the people who run the platform.
        </p>

        <div class="t321-mkt-blog__filters">
          <div class="t321-mkt-blog__search">
            <i class="fas fa-search" aria-hidden="true"></i>
            <input v-model="query" type="search" placeholder="Search articles…" aria-label="Search articles" />
          </div>
          <div class="t321-mkt-blog__cats">
            <button
              v-for="c in categories"
              :key="c"
              type="button"
              class="t321-mkt-blog__cat"
              :class="{ 'is-active': activeCategory === c }"
              @click="activeCategory = c"
            >{{ c }}</button>
          </div>
        </div>
      </div>
    </section>

    <section v-if="featured && !query && activeCategory === 'All'" class="t321-mkt-section">
      <div class="t321-mkt-container">
        <NuxtLink :to="'/blog/' + featured.slug" class="t321-mkt-blog__featured">
          <div class="t321-mkt-blog__featured-art" :class="'is-tone-' + featured.heroTone">
            <i :class="featured.heroIcon" aria-hidden="true"></i>
          </div>
          <div>
            <span class="t321-mkt-eyebrow">{{ featured.category }} · Latest</span>
            <h2 class="t321-mkt-h2">{{ featured.title }}</h2>
            <p>{{ featured.excerpt }}</p>
            <div class="t321-mkt-blog__meta">
              <span>{{ formatDate(featured.publishedAt) }}</span>
              <span>·</span>
              <span>{{ featured.readMinutes }} min read</span>
              <span>·</span>
              <span>{{ featured.author.name }}</span>
            </div>
            <span class="t321-mkt-blog__featured-link">Read the article <i class="fas fa-arrow-right"></i></span>
          </div>
        </NuxtLink>
      </div>
    </section>

    <section class="t321-mkt-section" :class="{ 't321-mkt-section--sunk': !featured || query || activeCategory !== 'All' }">
      <div class="t321-mkt-container">
        <div class="t321-mkt-section__head" v-if="!query && activeCategory === 'All'">
          <span class="t321-mkt-eyebrow">Recent</span>
          <h2 class="t321-mkt-h2">More from the journal</h2>
        </div>

        <div v-if="filteredRest.length" class="t321-mkt-blog__grid">
          <NuxtLink
            v-for="p in filteredRest"
            :key="p.slug"
            :to="'/blog/' + p.slug"
            class="t321-mkt-blog__card t321-mkt-card t321-mkt-card--hover"
          >
            <div class="t321-mkt-blog__card-art" :class="'is-tone-' + p.heroTone">
              <i :class="p.heroIcon" aria-hidden="true"></i>
            </div>
            <span class="t321-mkt-blog__card-cat">{{ p.category }}</span>
            <h3 class="t321-mkt-h3">{{ p.title }}</h3>
            <p>{{ p.excerpt }}</p>
            <div class="t321-mkt-blog__meta">
              <span>{{ formatDate(p.publishedAt) }}</span>
              <span>·</span>
              <span>{{ p.readMinutes }} min</span>
            </div>
          </NuxtLink>
        </div>

        <div v-else class="t321-mkt-blog__empty">
          <i class="fas fa-search"></i>
          <h3>No articles match your filters.</h3>
          <p>Try a different search term or <button type="button" @click="resetFilters">clear filters</button>.</p>
        </div>
      </div>
    </section>

    <section class="t321-mkt-section t321-mkt-section--ink">
      <div class="t321-mkt-container t321-mkt-blog__cta">
        <div>
          <h2 class="t321-mkt-h2">One email a month. No fluff.</h2>
          <p class="t321-mkt-lede">
            Compliance updates, operator interviews, and things we learned the hard way.
            Unsubscribe any time.
          </p>
        </div>
        <form class="t321-mkt-blog__news" @submit.prevent="onSubscribe">
          <input v-model="email" type="email" required placeholder="you@work.com" aria-label="Email" />
          <button type="submit" class="t321-mkt-btn t321-mkt-btn--accent" :disabled="subscribed">
            {{ subscribed ? 'Subscribed' : 'Subscribe' }}
            <i class="fas fa-arrow-right" aria-hidden="true"></i>
          </button>
        </form>
      </div>
    </section>
  </div>
</template>

<script>
import { blogPosts } from "~/assets/data/blog";

export default {
  name: "MarketingBlog",
  data() {
    return {
      posts: blogPosts,
      query: "",
      activeCategory: "All",
      email: "",
      subscribed: false
    };
  },
  computed: {
    categories() {
      const cats = new Set(this.posts.map(p => p.category));
      return ["All", ...Array.from(cats)];
    },
    sortedPosts() {
      return [...this.posts].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
    },
    filtered() {
      const q = this.query.trim().toLowerCase();
      return this.sortedPosts.filter(p => {
        if (this.activeCategory !== "All" && p.category !== this.activeCategory) return false;
        if (!q) return true;
        return (p.title + " " + p.excerpt + " " + p.category).toLowerCase().includes(q);
      });
    },
    featured() {
      return this.sortedPosts[0];
    },
    filteredRest() {
      if (!this.query && this.activeCategory === "All") {
        return this.filtered.filter(p => p.slug !== this.featured.slug);
      }
      return this.filtered;
    }
  },
  methods: {
    formatDate(iso) {
      const d = new Date(iso);
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    },
    resetFilters() {
      this.query = "";
      this.activeCategory = "All";
    },
    onSubscribe() {
      this.subscribed = true;
    }
  }
};
</script>

<style scoped>
.t321-mkt-blog__hero {
  padding: 3rem 0 2rem;
  background: linear-gradient(180deg, var(--t321-mkt-paper) 0%, var(--t321-mkt-paper-sunk) 100%);
  border-bottom: 1px solid var(--t321-mkt-line);
}
.t321-mkt-blog__filters {
  margin-top: 1.75rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}
.t321-mkt-blog__search {
  flex: 1;
  min-width: 240px;
  max-width: 420px;
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 1.5px solid var(--t321-mkt-line-strong);
  border-radius: 12px;
  transition: border-color 120ms ease, box-shadow 120ms ease;
}
.t321-mkt-blog__search:focus-within {
  border-color: var(--t321-mkt-accent);
  box-shadow: 0 0 0 4px var(--t321-mkt-accent-wash);
}
.t321-mkt-blog__search > i {
  padding-left: 1rem;
  color: var(--t321-mkt-ink-muted);
}
.t321-mkt-blog__search input {
  flex: 1;
  border: 0;
  outline: none;
  background: transparent;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  font-family: inherit;
  min-width: 0;
}
.t321-mkt-blog__cats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.t321-mkt-blog__cat {
  background: transparent;
  border: 1.5px solid var(--t321-mkt-line);
  border-radius: 999px;
  padding: 0.45rem 0.85rem;
  font-size: 0.85rem;
  color: var(--t321-mkt-ink-muted);
  cursor: pointer;
  font-family: inherit;
  transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
}
.t321-mkt-blog__cat:hover { background: #ffffff; color: var(--t321-mkt-ink); }
.t321-mkt-blog__cat.is-active {
  background: var(--t321-mkt-ink);
  border-color: var(--t321-mkt-ink);
  color: #ffffff;
}

.t321-mkt-blog__featured {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 2.5rem;
  background: #ffffff;
  border: 1px solid var(--t321-mkt-line);
  border-radius: 18px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: border-color 140ms ease, box-shadow 140ms ease;
}
.t321-mkt-blog__featured:hover {
  border-color: var(--t321-mkt-accent);
  box-shadow: 0 20px 40px rgba(15, 15, 14, 0.08);
}
.t321-mkt-blog__featured > div:last-child { padding: 2.25rem 2.25rem 2.25rem 0; }
.t321-mkt-blog__featured .t321-mkt-h2 { margin: 0.35rem 0 0.65rem; }
.t321-mkt-blog__featured p {
  margin: 0 0 1rem;
  color: var(--t321-mkt-ink-muted);
  font-size: 1rem;
  line-height: 1.65;
}
.t321-mkt-blog__featured-art {
  background: var(--t321-mkt-accent-wash);
  color: var(--t321-mkt-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
}
.t321-mkt-blog__featured-art.is-tone-warn { background: var(--t321-mkt-warn-wash); color: var(--t321-mkt-warn); }
.t321-mkt-blog__featured-art.is-tone-positive { background: var(--t321-mkt-positive-wash); color: var(--t321-mkt-positive); }
.t321-mkt-blog__featured-art.is-tone-critical { background: #fbe2e4; color: var(--t321-mkt-critical); }
.t321-mkt-blog__featured-art.is-tone-purple { background: var(--t321-mkt-purple-wash); color: var(--t321-mkt-purple); }

.t321-mkt-blog__featured-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--t321-mkt-accent);
  font-weight: 500;
  font-size: 0.9rem;
}

.t321-mkt-blog__meta {
  display: flex;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: var(--t321-mkt-ink-muted);
  margin-bottom: 0.85rem;
  flex-wrap: wrap;
}

.t321-mkt-blog__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}
.t321-mkt-blog__card {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
}
.t321-mkt-blog__card-art {
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--t321-mkt-accent-wash);
  color: var(--t321-mkt-accent);
  font-size: 2rem;
}
.t321-mkt-blog__card-art.is-tone-warn { background: var(--t321-mkt-warn-wash); color: var(--t321-mkt-warn); }
.t321-mkt-blog__card-art.is-tone-positive { background: var(--t321-mkt-positive-wash); color: var(--t321-mkt-positive); }
.t321-mkt-blog__card-art.is-tone-critical { background: #fbe2e4; color: var(--t321-mkt-critical); }
.t321-mkt-blog__card-art.is-tone-purple { background: var(--t321-mkt-purple-wash); color: var(--t321-mkt-purple); }

.t321-mkt-blog__card-cat {
  padding: 1.1rem 1.25rem 0;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--t321-mkt-ink-muted);
  font-weight: 600;
}
.t321-mkt-blog__card h3 {
  margin: 0.25rem 1.25rem 0.5rem;
  font-size: 1.1rem;
}
.t321-mkt-blog__card p {
  margin: 0 1.25rem 0.75rem;
  font-size: 0.9rem;
  color: var(--t321-mkt-ink-muted);
  line-height: 1.55;
  flex: 1;
}
.t321-mkt-blog__card .t321-mkt-blog__meta {
  margin: 0 1.25rem 1.25rem;
}

.t321-mkt-blog__empty {
  text-align: center;
  padding: 3rem;
  background: #ffffff;
  border: 1px dashed var(--t321-mkt-line-strong);
  border-radius: 14px;
  color: var(--t321-mkt-ink-muted);
}
.t321-mkt-blog__empty i { font-size: 1.5rem; margin-bottom: 0.6rem; display: block; }
.t321-mkt-blog__empty h3 {
  font-family: 'Fraunces', Georgia, serif;
  color: var(--t321-mkt-ink);
  font-size: 1.2rem;
  margin: 0 0 0.4rem;
  font-weight: 500;
  letter-spacing: -0.01em;
}
.t321-mkt-blog__empty button {
  background: none;
  border: 0;
  color: var(--t321-mkt-accent);
  cursor: pointer;
  font-family: inherit;
  padding: 0;
  text-decoration: underline;
}

.t321-mkt-blog__cta {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  align-items: center;
}
.t321-mkt-blog__news {
  display: flex;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.08);
  padding: 0.4rem;
  border-radius: 12px;
}
.t321-mkt-blog__news input {
  flex: 1;
  min-width: 220px;
  border: 0;
  background: transparent;
  outline: none;
  color: #ffffff;
  padding: 0.6rem 0.85rem;
  font-family: inherit;
  font-size: 0.95rem;
}
.t321-mkt-blog__news input::placeholder { color: rgba(255, 255, 255, 0.55); }

@media (max-width: 991.98px) {
  .t321-mkt-blog__featured { grid-template-columns: 1fr; }
  .t321-mkt-blog__featured-art { height: 200px; font-size: 3rem; }
  .t321-mkt-blog__featured > div:last-child { padding: 0 1.75rem 1.75rem; }
  .t321-mkt-blog__grid { grid-template-columns: repeat(2, 1fr); }
  .t321-mkt-blog__cta { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .t321-mkt-blog__grid { grid-template-columns: 1fr; }
  .t321-mkt-blog__news { flex-direction: column; }
}
</style>

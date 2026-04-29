<template>
  <div class="t321-mkt-catalog">
    <section class="t321-mkt-catalog__hero">
      <div class="t321-mkt-container">
        <span class="t321-mkt-eyebrow"><i class="fas fa-th"></i> Course library</span>
        <h1 class="t321-mkt-h1">Every course, one page.</h1>
        <p class="t321-mkt-lede">
          Browse our full catalog — {{ courses?.length || 0 }} courses across food safety,
          alcohol service, HR compliance, and specialized training.
        </p>

        <div class="t321-mkt-catalog__search">
          <i class="fas fa-search" aria-hidden="true"></i>
          <input
            v-model="query"
            type="search"
            placeholder="Search courses…"
            aria-label="Search courses"
          />
          <button
            v-if="query"
            type="button"
            class="t321-mkt-catalog__search-clear"
            aria-label="Clear"
            @click="query = ''"
          ><i class="fas fa-times"></i></button>
        </div>

        <div class="t321-mkt-catalog__filters" role="tablist" aria-label="Category filter">
          <button
            v-for="c in categoryChips"
            :key="c.id"
            type="button"
            role="tab"
            class="t321-mkt-catalog__chip"
            :class="{ 'is-active': activeCategory === c.id }"
            :aria-selected="activeCategory === c.id"
            @click="activeCategory = c.id"
          >
            <i :class="c.icon" aria-hidden="true"></i>
            {{ c.label }}
            <span class="t321-mkt-catalog__chip-count">{{ c.count }}</span>
          </button>
        </div>
      </div>
    </section>

    <section class="t321-mkt-section">
      <div class="t321-mkt-container">
        <div class="t321-mkt-catalog__toolbar">
          <p class="t321-mkt-catalog__count">
            Showing <strong>{{ filteredCourses.length }}</strong> of
            {{ courses?.length || 0 }} courses
            <span v-if="query"> matching &ldquo;{{ query }}&rdquo;</span>
          </p>
          <label class="t321-mkt-catalog__sort">
            <span>Sort</span>
            <select v-model="sortMode">
              <option value="alpha">A-Z</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </label>
        </div>

        <div v-if="pending" class="t321-mkt-catalog__empty">
          <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
          <p>Loading courses…</p>
        </div>

        <div v-else-if="filteredCourses.length" class="t321-mkt-catalog__grid">
          <article
            v-for="c in filteredCourses"
            :key="c._id"
            class="t321-mkt-catalog__card t321-mkt-card"
          >
            <div class="t321-mkt-catalog__card-top">
              <img
                v-if="c.image"
                class="t321-mkt-catalog__card-img"
                :src="urlFor(c.image).width(640).height(360).fit('crop').url()"
                :alt="c.title"
                loading="lazy"
              />
              <i v-else class="fas fa-graduation-cap" aria-hidden="true"></i>
            </div>
            <div class="t321-mkt-catalog__card-body">
              <span v-if="c.state" class="t321-mkt-catalog__card-eyebrow">
                {{ c.state.toUpperCase() }}
              </span>
              <h3 class="t321-mkt-h3">{{ c.title }}</h3>
              <p>{{ c.shortDescription }}</p>

              <div class="t321-mkt-catalog__card-meta">
                <span v-if="c.durationMinutes">
                  <i class="fas fa-clock" aria-hidden="true"></i>
                  {{ formatDuration(c.durationMinutes) }}
                </span>
                <span v-if="c.accreditations && c.accreditations.length">
                  <i class="fas fa-check-circle" aria-hidden="true"></i>
                  {{ c.accreditations[0] }}
                </span>
              </div>

              <div class="t321-mkt-catalog__card-foot">
                <div>
                  <span v-if="c.price" class="t321-mkt-catalog__card-price">
                    <span>From</span>
                    <strong>${{ c.price }}</strong>
                    <span>/ seat</span>
                  </span>
                </div>
                <div class="t321-mkt-catalog__card-actions">
                  <NuxtLink :to="`/courses/${c.slug}`" class="t321-mkt-btn t321-mkt-btn--subtle">
                    Details
                  </NuxtLink>
                  <a
                    :href="enrollHref(c)"
                    class="t321-mkt-btn t321-mkt-btn--primary"
                  >
                    Enroll
                    <i class="fas fa-arrow-right" aria-hidden="true"></i>
                  </a>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="t321-mkt-catalog__empty">
          <i class="fas fa-search" aria-hidden="true"></i>
          <h3>No courses match your search.</h3>
          <p>Try a different term or clear your filters.</p>
          <button
            type="button"
            class="t321-mkt-btn t321-mkt-btn--ghost"
            @click="resetFilters"
          >Clear search &amp; filters</button>
        </div>
      </div>
    </section>

    <section class="t321-mkt-section t321-mkt-section--ink">
      <div class="t321-mkt-container t321-mkt-catalog__cta">
        <div>
          <h2 class="t321-mkt-h2">Need something we don't offer?</h2>
          <p class="t321-mkt-lede">
            We build custom courses to your SOPs and brand. Typical delivery in 4-6 weeks.
          </p>
        </div>
        <div class="t321-mkt-catalog__cta-actions">
          <NuxtLink to="/contact" class="t321-mkt-btn t321-mkt-btn--accent t321-mkt-btn--lg">
            Talk to us
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { urlFor } from "~/composables/useSanityImage";

useSeoMeta({
  title: "Course Catalog — Train321",
  description:
    "Browse Train321's full catalog of food safety, alcohol service, and compliance training courses.",
  ogTitle: "Course Catalog — Train321"
});

const config = useRuntimeConfig();

// Fetched at build time when running `nuxt generate` (SSG = great SEO).
// Becomes SSR if running `nuxt build` instead. Either way, Google sees real content.
const { data: courses, pending } = await useSanityQuery(
  groq`*[_type == "course"] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    family,
    state,
    shortDescription,
    durationMinutes,
    price,
    image,
    accreditations,
    enrollUrl
  }`
);

const query = ref("");
const activeCategory = ref("all");
const sortMode = ref("alpha");

const CATEGORY_DEFS = [
  { id: "all", label: "All", icon: "fas fa-th", families: null },
  { id: "food", label: "Food safety", icon: "fas fa-utensils", families: ["food-handler", "food-manager", "haccp", "allergen"] },
  { id: "alcohol", label: "Alcohol", icon: "fas fa-wine-glass-alt", families: ["alcohol-server"] }
];

const categoryChips = computed(() =>
  CATEGORY_DEFS.map((c) => ({
    ...c,
    count: c.families
      ? (courses.value || []).filter((x) => c.families.includes(x.family)).length
      : (courses.value || []).length
  }))
);

const filteredCourses = computed(() => {
  let list = (courses.value || []).slice();

  const cat = CATEGORY_DEFS.find((c) => c.id === activeCategory.value);
  if (cat && cat.families) {
    list = list.filter((c) => cat.families.includes(c.family));
  }

  const q = query.value.trim().toLowerCase();
  if (q) {
    list = list.filter((c) => {
      const hay = [c.title, c.shortDescription, c.state, (c.accreditations || []).join(" ")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  switch (sortMode.value) {
    case "price-asc":
      list.sort((a, b) => (a.price || 1e9) - (b.price || 1e9));
      break;
    case "price-desc":
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
    case "alpha":
    default:
      list.sort((a, b) => a.title.localeCompare(b.title));
  }

  return list;
});

function formatDuration(mins) {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function enrollHref(course) {
  if (course.enrollUrl) return course.enrollUrl;
  const appBase = config.public.appBase || "";
  return `${appBase.replace(/\/$/, "")}/enroll?course=${course.slug}`;
}

function resetFilters() {
  query.value = "";
  activeCategory.value = "all";
}
</script>
<style scoped>
.t321-mkt-catalog__hero {
  padding: 3rem 0 2rem;
  background: linear-gradient(180deg, var(--t321-mkt-paper) 0%, var(--t321-mkt-paper-sunk) 100%);
  border-bottom: 1px solid var(--t321-mkt-line);
}
.t321-mkt-catalog__hero .t321-mkt-lede { max-width: 54ch; }

.t321-mkt-catalog__search {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 560px;
  margin-top: 1.5rem;
  background: #ffffff;
  border: 1.5px solid var(--t321-mkt-line-strong);
  border-radius: 12px;
  transition: border-color 120ms ease, box-shadow 120ms ease;
}
.t321-mkt-catalog__search:focus-within {
  border-color: var(--t321-mkt-accent);
  box-shadow: 0 0 0 4px var(--t321-mkt-accent-wash);
}
.t321-mkt-catalog__search > i {
  padding-left: 1rem;
  color: var(--t321-mkt-ink-muted);
}
.t321-mkt-catalog__search input {
  flex: 1;
  border: 0;
  outline: none;
  background: transparent;
  padding: 0.85rem 1rem;
  font-size: 1rem;
  font-family: inherit;
  color: var(--t321-mkt-ink);
  min-width: 0;
}
.t321-mkt-catalog__search input::placeholder { color: var(--t321-mkt-ink-muted); }
.t321-mkt-catalog__search-clear {
  background: transparent;
  border: 0;
  padding: 0.5rem 0.85rem;
  color: var(--t321-mkt-ink-muted);
  cursor: pointer;
  font-size: 0.85rem;
}
.t321-mkt-catalog__search-clear:hover { color: var(--t321-mkt-ink); }

.t321-mkt-catalog__filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1.25rem;
}
.t321-mkt-catalog__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 0.95rem;
  border-radius: 999px;
  border: 1px solid var(--t321-mkt-line-strong);
  background: #ffffff;
  color: var(--t321-mkt-ink);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 120ms ease;
  font-family: inherit;
}
.t321-mkt-catalog__chip:hover {
  border-color: var(--t321-mkt-ink-muted);
}
.t321-mkt-catalog__chip.is-active {
  background: var(--t321-mkt-ink);
  border-color: var(--t321-mkt-ink);
  color: #ffffff;
}
.t321-mkt-catalog__chip-count {
  font-size: 0.72rem;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  background: var(--t321-mkt-paper-sunk);
  color: var(--t321-mkt-ink-muted);
  min-width: 22px;
  text-align: center;
}
.t321-mkt-catalog__chip.is-active .t321-mkt-catalog__chip-count {
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
}
.t321-mkt-catalog__chip i {
  font-size: 0.82rem;
  color: var(--t321-mkt-ink-muted);
}
.t321-mkt-catalog__chip.is-active i { color: #ffffff; }

.t321-mkt-catalog__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.t321-mkt-catalog__count {
  margin: 0;
  font-size: 0.9rem;
  color: var(--t321-mkt-ink-muted);
}
.t321-mkt-catalog__count strong { color: var(--t321-mkt-ink); font-weight: 600; }
.t321-mkt-catalog__sort {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--t321-mkt-ink-muted);
}
.t321-mkt-catalog__sort select {
  border: 1px solid var(--t321-mkt-line-strong);
  background: #ffffff;
  border-radius: 8px;
  padding: 0.45rem 0.6rem;
  font-family: inherit;
  font-size: 0.85rem;
  color: var(--t321-mkt-ink);
  cursor: pointer;
}
.t321-mkt-catalog__sort select:focus { outline: 2px solid var(--t321-mkt-accent); outline-offset: 2px; }

.t321-mkt-catalog__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}
.t321-mkt-catalog__card {
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 160ms ease, box-shadow 160ms ease;
}
.t321-mkt-catalog__card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 36px rgba(15, 15, 14, 0.08);
}
.t321-mkt-catalog__card-top {
  padding: 1.25rem 1.5rem;
  color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #0A427B, #1579D1);
  position: relative;
}
.t321-mkt-catalog__card-top i { font-size: 1.4rem; }
.t321-mkt-catalog__card-top.has-image {
  padding: 0;
  height: 180px;
  overflow: hidden;
}
.t321-mkt-catalog__card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.t321-mkt-catalog__card-top.has-image .t321-mkt-badge {
  position: absolute;
  top: 0.65rem;
  right: 0.65rem;
}
.t321-mkt-catalog__card-top.is-tone-amber {
  background: linear-gradient(135deg, #9D6200, #C08A2E);
}
.t321-mkt-catalog__card-top.is-tone-plum {
  background: linear-gradient(135deg, #6B3A8A, #8C57AE);
}
.t321-mkt-catalog__card-top.is-tone-emerald {
  background: linear-gradient(135deg, #2D6A4F, #3E8E68);
}
.t321-mkt-catalog__card-top.is-tone-neutral {
  background: linear-gradient(135deg, #0F0F0E, #3A3A38);
}
.t321-mkt-catalog__card-body {
  padding: 1.25rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex: 1;
}
.t321-mkt-catalog__card-eyebrow {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--t321-mkt-ink-muted);
}
.t321-mkt-catalog__card-body p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--t321-mkt-ink-muted);
  line-height: 1.55;
}
.t321-mkt-catalog__card-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin: 0.85rem 0;
  font-size: 0.8rem;
  color: var(--t321-mkt-ink-muted);
}
.t321-mkt-catalog__card-meta i {
  margin-right: 0.35rem;
  color: var(--t321-mkt-accent);
}
.t321-mkt-catalog__card-foot {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--t321-mkt-line);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}
.t321-mkt-catalog__card-price {
  display: inline-flex;
  align-items: baseline;
  gap: 0.25rem;
  font-size: 0.82rem;
  color: var(--t321-mkt-ink-muted);
}
.t321-mkt-catalog__card-price strong {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.3rem;
  font-weight: 500;
  color: var(--t321-mkt-ink);
  letter-spacing: -0.01em;
}
.t321-mkt-catalog__card-actions {
  display: flex;
  gap: 0.4rem;
}

.t321-mkt-catalog__empty {
  text-align: center;
  padding: 4rem 1rem;
  background: #ffffff;
  border: 1px dashed var(--t321-mkt-line-strong);
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
.t321-mkt-catalog__empty > i {
  font-size: 1.75rem;
  color: var(--t321-mkt-ink-muted);
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: var(--t321-mkt-paper-sunk);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}
.t321-mkt-catalog__empty h3 {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.3rem;
  font-weight: 500;
  margin: 0;
  letter-spacing: -0.01em;
}
.t321-mkt-catalog__empty p { margin: 0; color: var(--t321-mkt-ink-muted); font-size: 0.92rem; }

.t321-mkt-catalog__cta {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  align-items: center;
}
.t321-mkt-catalog__cta-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.t321-mkt-catalog__cta-actions .t321-mkt-btn--ghost {
  background: transparent;
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.25);
}
.t321-mkt-catalog__cta-actions .t321-mkt-btn--ghost:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: #ffffff;
}

@media (max-width: 1199.98px) {
  .t321-mkt-catalog__grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 767.98px) {
  .t321-mkt-catalog__grid { grid-template-columns: 1fr; }
  .t321-mkt-catalog__cta { grid-template-columns: 1fr; }
}
</style>

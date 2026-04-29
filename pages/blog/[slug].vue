<template>
  <div class="t321-mkt-article" v-if="post">
    <header class="t321-mkt-article__hero" :class="'is-tone-' + post.heroTone">
      <div class="t321-mkt-container">
        <nav class="t321-mkt-article__crumbs" aria-label="Breadcrumb">
          <NuxtLink to="/blog">Journal</NuxtLink>
          <span aria-hidden="true">/</span>
          <span>{{ post.category }}</span>
        </nav>
        <span class="t321-mkt-eyebrow">
          <i :class="post.heroIcon" aria-hidden="true"></i>
          {{ post.category }}
        </span>
        <h1 class="t321-mkt-h1">{{ post.title }}</h1>
        <p class="t321-mkt-lede">{{ post.excerpt }}</p>
        <div class="t321-mkt-article__meta">
          <div class="t321-mkt-article__avatar" aria-hidden="true">{{ initials(post.author.name) }}</div>
          <div class="t321-mkt-article__author">
            <strong>{{ post.author.name }}</strong>
            <span>{{ post.author.role }}</span>
          </div>
          <div class="t321-mkt-article__dot" aria-hidden="true"></div>
          <div class="t321-mkt-article__dates">
            <strong>{{ formatDate(post.publishedAt) }}</strong>
            <span>{{ post.readMinutes }} min read</span>
          </div>
        </div>
      </div>
    </header>

    <section class="t321-mkt-section">
      <div class="t321-mkt-container t321-mkt-article__body">
        <aside class="t321-mkt-article__share" aria-label="Share">
          <span>Share</span>
          <button type="button" @click="copyLink" aria-label="Copy link">
            <i class="fas" :class="copied ? 'fa-check' : 'fa-link'"></i>
          </button>
          <a :href="twitterHref" target="_blank" rel="noopener" aria-label="Share on Twitter"><i class="fab fa-twitter"></i></a>
          <a :href="linkedinHref" target="_blank" rel="noopener" aria-label="Share on LinkedIn"><i class="fab fa-linkedin-in"></i></a>
        </aside>

        <article class="t321-mkt-article__prose">
          <component
            v-for="(block, i) in post.body"
            :key="i"
            :is="tag(block.type)"
            :class="blockClass(block.type)"
          >
            <template v-if="block.type === 'ul' || block.type === 'ol'">
              <li v-for="(item, j) in block.content" :key="j">{{ item }}</li>
            </template>
            <template v-else>{{ block.content }}</template>
          </component>

          <div class="t321-mkt-article__sign">
            <div class="t321-mkt-article__avatar t321-mkt-article__avatar--lg" aria-hidden="true">{{ initials(post.author.name) }}</div>
            <div>
              <strong>{{ post.author.name }}</strong>
              <span>{{ post.author.role }} · Train321</span>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="t321-mkt-section t321-mkt-section--sunk" v-if="related.length">
      <div class="t321-mkt-container">
        <div class="t321-mkt-section__head">
          <span class="t321-mkt-eyebrow">Keep reading</span>
          <h2 class="t321-mkt-h2">More in the journal</h2>
        </div>
        <div class="t321-mkt-article__related">
          <NuxtLink
            v-for="p in related"
            :key="p.slug"
            :to="'/blog/' + p.slug"
            class="t321-mkt-card t321-mkt-card--hover t321-mkt-article__related-card"
          >
            <div class="t321-mkt-article__related-art" :class="'is-tone-' + p.heroTone">
              <i :class="p.heroIcon" aria-hidden="true"></i>
            </div>
            <span class="t321-mkt-eyebrow">{{ p.category }}</span>
            <h3 class="t321-mkt-h3">{{ p.title }}</h3>
            <p>{{ p.excerpt }}</p>
            <span class="t321-mkt-article__related-link">Read article <i class="fas fa-arrow-right"></i></span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="t321-mkt-section t321-mkt-section--ink">
      <div class="t321-mkt-container t321-mkt-article__cta">
        <div>
          <h2 class="t321-mkt-h2">Ready to see the platform?</h2>
          <p class="t321-mkt-lede">
            Book a 20-minute walkthrough with a real human. No slides, no pressure.
          </p>
        </div>
        <div class="t321-mkt-article__cta-actions">
          <NuxtLink to="/demo" class="t321-mkt-btn t321-mkt-btn--accent t321-mkt-btn--lg">
            Book a demo
            <i class="fas fa-arrow-right" aria-hidden="true"></i>
          </NuxtLink>
          <NuxtLink to="/catalog" class="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg">
            Browse courses
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>

  <div v-else class="t321-mkt-article__missing">
    <div class="t321-mkt-container">
      <span class="t321-mkt-eyebrow">404</span>
      <h1 class="t321-mkt-h2">This article has moved or doesn't exist.</h1>
      <p class="t321-mkt-lede">Head back to the journal — everything is indexed there.</p>
      <NuxtLink to="/blog" class="t321-mkt-btn t321-mkt-btn--primary">
        Back to the journal
        <i class="fas fa-arrow-right" aria-hidden="true"></i>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const slug = computed(() => route.params.slug);

const BLOCK_TYPE_MAP = {
  blockParagraph: "p",
  blockHeading2: "h2",
  blockHeading3: "h3",
  blockBulletList: "ul",
  blockOrderedList: "ol",
  blockCallout: "callout",
  blockQuote: "quote"
};

const POST_PROJECTION = `{
  "slug": slug.current,
  title, excerpt, category, publishedAt, readMinutes, heroTone, heroIcon,
  "author": { "name": authorName, "role": authorRole },
  body
}`;

const { data: postRaw } = await useSanityFetch(
  groq`*[_type == "blogPost" && slug.current == $slug][0] ${POST_PROJECTION}`,
  { slug }
);

const { data: relatedRaw } = await useSanityFetch(
  groq`*[_type == "blogPost" && slug.current != $slug] | order(publishedAt desc)[0...3] ${POST_PROJECTION}`,
  { slug }
);

function normalizePost(p) {
  if (!p) return null;
  return {
    ...p,
    body: (p.body || []).map((b) => ({
      type: BLOCK_TYPE_MAP[b._type] || "p",
      content: b.content
    }))
  };
}

const post = computed(() => normalizePost(postRaw.value));
const related = computed(() => (relatedRaw.value || []).map(normalizePost));

useSeoMeta(
  computed(() => ({
    title: post.value ? `${post.value.title} — Train321` : "Article — Train321",
    description: post.value?.excerpt || ""
  }))
);

const copied = ref(false);

const shareUrl = computed(() => (typeof window === "undefined" ? "" : window.location.href));
const twitterHref = computed(() => {
  if (!post.value) return "#";
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.value.title)}&url=${encodeURIComponent(shareUrl.value)}`;
});
const linkedinHref = computed(
  () => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl.value)}`
);

function initials(name) {
  return (name || "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function tag(type) {
  switch (type) {
    case "h2":
      return "h2";
    case "h3":
      return "h3";
    case "ul":
      return "ul";
    case "ol":
      return "ol";
    case "callout":
      return "aside";
    default:
      return "p";
  }
}

function blockClass(type) {
  return type === "callout" ? "t321-mkt-article__callout" : "";
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 1800);
  } catch (e) {
    copied.value = false;
  }
}

watch(
  () => route.params.slug,
  () => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }
);
</script>

<style scoped>
.t321-mkt-article__hero {
  padding: 2.5rem 0 3rem;
  background: linear-gradient(180deg, var(--t321-mkt-accent-wash) 0%, var(--t321-mkt-paper) 100%);
  border-bottom: 1px solid var(--t321-mkt-line);
}
.t321-mkt-article__hero.is-tone-warn { background: linear-gradient(180deg, var(--t321-mkt-warn-wash) 0%, var(--t321-mkt-paper) 100%); }
.t321-mkt-article__hero.is-tone-positive { background: linear-gradient(180deg, var(--t321-mkt-positive-wash) 0%, var(--t321-mkt-paper) 100%); }
.t321-mkt-article__hero.is-tone-critical { background: linear-gradient(180deg, #fbe2e4 0%, var(--t321-mkt-paper) 100%); }
.t321-mkt-article__hero.is-tone-purple { background: linear-gradient(180deg, var(--t321-mkt-purple-wash) 0%, var(--t321-mkt-paper) 100%); }

.t321-mkt-article__crumbs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.82rem;
  color: var(--t321-mkt-ink-muted);
  margin-bottom: 1rem;
}
.t321-mkt-article__crumbs a {
  color: var(--t321-mkt-accent);
  text-decoration: none;
}
.t321-mkt-article__crumbs a:hover { text-decoration: underline; }

.t321-mkt-article__hero .t321-mkt-h1 { max-width: 24ch; }

.t321-mkt-article__meta {
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.t321-mkt-article__avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--t321-mkt-accent), var(--t321-mkt-accent-bright));
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
  font-weight: 600;
}
.t321-mkt-article__avatar--lg { width: 56px; height: 56px; font-size: 1rem; }
.t321-mkt-article__author strong {
  display: block;
  font-size: 0.92rem;
  font-weight: 600;
}
.t321-mkt-article__author span {
  display: block;
  font-size: 0.8rem;
  color: var(--t321-mkt-ink-muted);
}
.t321-mkt-article__dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--t321-mkt-line-strong);
}
.t321-mkt-article__dates strong {
  display: block;
  font-size: 0.92rem;
  font-weight: 600;
}
.t321-mkt-article__dates span {
  display: block;
  font-size: 0.8rem;
  color: var(--t321-mkt-ink-muted);
}

.t321-mkt-article__body {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 2.5rem;
  align-items: start;
  max-width: 960px;
}
.t321-mkt-article__share {
  position: sticky;
  top: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
.t321-mkt-article__share span {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--t321-mkt-ink-muted);
  margin-bottom: 0.4rem;
}
.t321-mkt-article__share a,
.t321-mkt-article__share button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ffffff;
  border: 1px solid var(--t321-mkt-line);
  color: var(--t321-mkt-ink);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  text-decoration: none;
  transition: border-color 120ms ease, color 120ms ease, background 120ms ease;
}
.t321-mkt-article__share a:hover,
.t321-mkt-article__share button:hover {
  border-color: var(--t321-mkt-accent);
  color: var(--t321-mkt-accent);
}

.t321-mkt-article__prose {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--t321-mkt-ink);
}
.t321-mkt-article__prose h2 {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.75rem;
  font-weight: 500;
  color: var(--t321-mkt-ink);
  letter-spacing: -0.015em;
  margin: 2.5rem 0 0.75rem;
}
.t321-mkt-article__prose h3 {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--t321-mkt-ink);
  margin: 1.75rem 0 0.5rem;
}
.t321-mkt-article__prose p {
  margin: 0 0 1.1rem;
}
.t321-mkt-article__prose ul,
.t321-mkt-article__prose ol {
  padding-left: 1.25rem;
  margin: 0 0 1.25rem;
}
.t321-mkt-article__prose li {
  margin-bottom: 0.5rem;
}
.t321-mkt-article__callout {
  display: block;
  background: var(--t321-mkt-accent-wash);
  border-left: 4px solid var(--t321-mkt-accent);
  padding: 1.1rem 1.35rem;
  border-radius: 0 12px 12px 0;
  font-size: 1rem;
  color: var(--t321-mkt-ink);
  margin: 1.5rem 0 1.75rem;
  line-height: 1.6;
}

.t321-mkt-article__sign {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  margin-top: 2.5rem;
  background: #ffffff;
  border: 1px solid var(--t321-mkt-line);
  border-radius: 14px;
}
.t321-mkt-article__sign strong {
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
}
.t321-mkt-article__sign span {
  display: block;
  font-size: 0.82rem;
  color: var(--t321-mkt-ink-muted);
}

.t321-mkt-article__related {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}
.t321-mkt-article__related-card {
  padding: 0;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
}
.t321-mkt-article__related-art {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--t321-mkt-accent-wash);
  color: var(--t321-mkt-accent);
  font-size: 1.75rem;
}
.t321-mkt-article__related-art.is-tone-warn { background: var(--t321-mkt-warn-wash); color: var(--t321-mkt-warn); }
.t321-mkt-article__related-art.is-tone-positive { background: var(--t321-mkt-positive-wash); color: var(--t321-mkt-positive); }
.t321-mkt-article__related-art.is-tone-critical { background: #fbe2e4; color: var(--t321-mkt-critical); }
.t321-mkt-article__related-art.is-tone-purple { background: var(--t321-mkt-purple-wash); color: var(--t321-mkt-purple); }
.t321-mkt-article__related-card .t321-mkt-eyebrow,
.t321-mkt-article__related-card h3,
.t321-mkt-article__related-card p,
.t321-mkt-article__related-link {
  padding-left: 1.25rem;
  padding-right: 1.25rem;
}
.t321-mkt-article__related-card .t321-mkt-eyebrow { padding-top: 1.1rem; }
.t321-mkt-article__related-card h3 { margin: 0.4rem 0 0.5rem; font-size: 1.05rem; }
.t321-mkt-article__related-card p {
  margin: 0 0 1rem;
  font-size: 0.88rem;
  color: var(--t321-mkt-ink-muted);
  line-height: 1.55;
  flex: 1;
}
.t321-mkt-article__related-link {
  padding-bottom: 1.25rem;
  color: var(--t321-mkt-accent);
  font-weight: 500;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.t321-mkt-article__cta {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  align-items: center;
}
.t321-mkt-article__cta-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.t321-mkt-article__missing {
  padding: 5rem 0;
  text-align: center;
}
.t321-mkt-article__missing .t321-mkt-h2 { margin: 0.4rem 0 0.75rem; }
.t321-mkt-article__missing .t321-mkt-btn { margin-top: 1rem; }

@media (max-width: 991.98px) {
  .t321-mkt-article__body { grid-template-columns: 1fr; }
  .t321-mkt-article__share {
    position: static;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
  }
  .t321-mkt-article__share span { margin-bottom: 0; margin-right: 0.25rem; }
  .t321-mkt-article__related { grid-template-columns: 1fr; }
  .t321-mkt-article__cta { grid-template-columns: 1fr; }
}
</style>

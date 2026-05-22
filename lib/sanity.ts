// Sanity client + GROQ queries.
// Replaces the filesystem-based lib/content.ts. Pages await these helpers.

import { createClient } from "next-sanity";
import { defineLive } from "next-sanity/live";
import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";

// ── Types ────────────────────────────────────────────────────────────────

export type Course = {
  slug: string;
  title: string;
  eyebrow?: string;
  tagline?: string;
  category?: "food" | "alcohol" | "hr";
  color?: "amber" | "plum" | "emerald" | "neutral";
  icon?: string;
  image?: string; // URL string
  summary?: string;
  hero?: { stats?: Array<{ value: string; label: string }> };
  outcomes?: string[];
  modules?: Array<{ title: string; duration?: string }>;
  accreditations?: string[];
  certificate?: { delivery?: string; validity?: string; accepted?: string };
  priceFrom?: number;
  priceNote?: string;
  faqs?: Array<{ q: string; a: string }>;
  enrollId?: string;
  enrollUrl?: string;
};

export type BlogPost = {
  slug: string;
  body: string; // markdown string (converted from typed blocks)
  title: string;
  excerpt?: string;
  category?: string;
  author: { name: string; role?: string };
  publishedAt: string;
  readMinutes?: number;
  heroTone?: "accent" | "warn" | "positive" | "critical" | "purple";
  heroIcon?: string;
};

export type LegalPage = {
  slug: string;
  body: string; // markdown
  title: string;
  effectiveDate?: string;
  intro?: string;
};

export type FaqItem = { q: string; a: string };

export type FaqGroup = {
  category: string;
  order?: number;
  items: FaqItem[];
};

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role?: string;
  company?: string;
  stat?: { value: string; label: string };
  featured: boolean;
  order?: number;
};

export type TeamMember = {
  name: string;
  role?: string;
  bio?: string;
  linkedin?: string;
  twitter?: string;
  order?: number;
};

export type NavLink = { label: string; href: string };
export type FooterColumn = { title: string; links: NavLink[] };

export type Newsletter = {
  heading?: string;
  sub?: string;
  placeholder?: string;
  buttonLabel?: string;
  successText?: string;
};

export type TrustLogo = {
  name: string;
  label?: string;
  imageUrl?: string;
  url?: string;
};

export type SiteSettings = {
  siteName: string;
  tagline?: string;
  phone?: string;
  email?: string;
  supportEmail?: string;
  social?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
  footerTagline?: string;
  footerColumns?: FooterColumn[];
  footerLegalLinks?: NavLink[];
  newsletter?: Newsletter;
  companyStats?: Array<{ value: string; label: string }>;
  trustLogos?: TrustLogo[];
  enrollBaseUrl?: string;
};

// ── Reusable shapes used across page documents ──────────────────────────

export type Cta = { label?: string; to?: string };

export type CtaBlock = {
  eyebrow?: string;
  heading?: string;
  lede?: string;
  primaryCta?: Cta;
  secondaryCta?: Cta;
};

export type SectionHead = {
  eyebrow?: string;
  heading?: string;
  lede?: string;
  icon?: string;
};

export type PillarCard = {
  icon?: string;
  tone?: string;
  title?: string;
  body?: string;
  linkLabel?: string;
  linkHref?: string;
};

export type HowItWorksStep = { title?: string; body?: string };
export type QuickFaq = { q?: string; a?: string };
export type LabeledTile = {
  icon?: string;
  title?: string;
  sub?: string;
  linkLabel?: string;
  linkHref?: string;
};

// ── Page singletons ──────────────────────────────────────────────────────

export type AudienceCopyDoc = {
  eyebrow?: string;
  h1Pre?: string;
  h1Em?: string;
  lede?: string;
  ctaPrimary?: Cta;
  ctaGhost?: Cta & { icon?: string };
  trustLabel?: string;
  stepsTitle?: string;
  stepsLede?: string;
  steps?: HowItWorksStep[];
  bottomTitle?: string;
  bottomLede?: string;
  bottomCtaSecondary?: Cta;
};

export type HomePage = {
  // Legacy single-hero overrides
  heroEyebrow?: string;
  heroHeadline?: string;
  heroSubcopy?: string;
  heroPrimaryCta?: Cta;
  heroSecondaryCta?: Cta;
  heroTrustPills?: Array<{ icon?: string; label?: string }>;
  // Per-audience copy
  audienceTeam?: AudienceCopyDoc;
  audienceSelf?: AudienceCopyDoc;
  // Sections
  pillarsHead?: SectionHead;
  pillars?: PillarCard[];
  popularHead?: SectionHead;
  popularCtaLabel?: string;
  popularSlugs?: string[];
  howHead?: SectionHead;
  opinionsHead?: SectionHead;
  opinionsLinkLabel?: string;
  faqTeaserHead?: SectionHead;
  faqTeaserCtaLabel?: string;
  bottomCta?: CtaBlock;
};

export type ContactPage = {
  heroEyebrow?: string;
  heroHeading?: string;
  heroLede?: string;
  tiles?: LabeledTile[];
  formHeading?: string;
  formLede?: string;
  topicOptions?: string[];
  submitLabel?: string;
  submitSendingLabel?: string;
  successText?: string;
  quickFaqsHead?: SectionHead;
  quickFaqs?: QuickFaq[];
  bottomCta?: CtaBlock;
};

export type DemoPage = {
  heroEyebrow?: string;
  heroHeading?: string;
  heroLede?: string;
  heroBullets?: string[];
  formHeading?: string;
  teamSizeOptions?: string[];
  timeslotOptions?: string[];
  interestOptions?: string[];
  submitLabel?: string;
  submitSendingLabel?: string;
  successText?: string;
  disclaimer?: string;
  agendaHead?: SectionHead;
  agenda?: Array<{ time?: string; title?: string; desc?: string }>;
  faqHead?: SectionHead;
  faqs?: QuickFaq[];
  bottomCta?: CtaBlock;
};

export type ServicesTier = {
  name?: string;
  audience?: string;
  price?: string;
  priceSub?: string;
  featured?: boolean;
  features?: string[];
  ctaLabel?: string;
  ctaTo?: string;
};

export type ServicesPage = {
  heroEyebrow?: string;
  heroHeading?: string;
  heroLede?: string;
  tiers?: ServicesTier[];
  addonsHead?: SectionHead;
  addons?: PillarCard[];
  bottomCta?: CtaBlock;
};

export type AboutPage = {
  heroEyebrow?: string;
  heroHeading?: string;
  heroLede?: string;
  storyHead?: SectionHead;
  storyParagraphs?: string[];
  pillarsHead?: SectionHead;
  pillars?: PillarCard[];
  teamHead?: SectionHead;
  bottomCta?: CtaBlock;
};

export type BlogIndexPage = {
  heroEyebrow?: string;
  heroHeading?: string;
  heroLede?: string;
  searchPlaceholder?: string;
  allCategoryLabel?: string;
  emptyText?: string;
  recentHead?: SectionHead;
  newsletter?: { heading?: string; lede?: string; placeholder?: string; buttonLabel?: string };
};

export type FaqPage = {
  heroEyebrow?: string;
  heroHeading?: string;
  heroLede?: string;
  searchPlaceholder?: string;
  categoriesLabel?: string;
  emptyText?: string;
  bottomCta?: CtaBlock;
};

export type CatalogCategoryDef = { id?: string; label?: string; icon?: string };

export type CatalogPage = {
  heroEyebrow?: string;
  heroHeading?: string;
  heroLede?: string;
  searchPlaceholder?: string;
  categories?: CatalogCategoryDef[];
  sortOptions?: string[];
  emptyText?: string;
  clearFiltersLabel?: string;
  bottomCta?: CtaBlock;
};

export type TestimonialsPage = {
  heroEyebrow?: string;
  heroHeading?: string;
  heroLede?: string;
  heroStats?: Array<{ value: string; label: string }>;
  featuredHead?: SectionHead;
  moreHead?: SectionHead;
  trustHead?: SectionHead;
  bottomCta?: CtaBlock;
};

export type DetailPagesCopy = {
  // course
  courseCrumbHome?: string;
  courseCrumbCourses?: string;
  courseEnrollLabel?: string;
  courseBrowseLabel?: string;
  courseGetStartedLabel?: string;
  coursePriceFromLabel?: string;
  coursePriceUnitLabel?: string;
  coursePriceCustomAmt?: string;
  coursePriceCustomUnit?: string;
  courseGuarantee?: string;
  courseOverviewEyebrow?: string;
  courseOverviewHeading?: string;
  courseOutcomesHeading?: string;
  courseCurriculumEyebrow?: string;
  courseCurriculumHeading?: string;
  courseCurriculumLedeTpl?: string;
  courseCertEyebrow?: string;
  courseCertHeading?: string;
  courseCertVisualHead?: string;
  courseCertVisualMeta?: string;
  courseCertDeliveryLabel?: string;
  courseCertValidityLabel?: string;
  courseCertAcceptedLabel?: string;
  courseFaqEyebrow?: string;
  courseFaqHeading?: string;
  courseBottomCta?: CtaBlock;
  // blog
  blogCrumbJournal?: string;
  blogShareLabel?: string;
  blogReadingMinSuffix?: string;
  blogAuthorOrgSuffix?: string;
  blogRelatedHead?: SectionHead;
  blogRelatedReadLabel?: string;
  blogBottomCta?: CtaBlock;
  // legal
  legalCrumbHome?: string;
  legalEyebrow?: string;
  legalEffectivePrefix?: string;
  legalTocLabel?: string;
};

// ── Client ───────────────────────────────────────────────────────────────

const projectId =
  process.env.SANITY_PROJECT_ID ||
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  "";
const dataset =
  process.env.SANITY_DATASET ||
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  "production";

// Studio URL used for stega encoding (so click-to-edit jumps to the right host).
const STUDIO_URL =
  process.env.SANITY_STUDIO_URL || "https://studio.train321.com";

// Server-side token (never sent to the browser): read token preferred,
// write token as fallback.
const SERVER_TOKEN =
  process.env.SANITY_API_READ_TOKEN || process.env.SANITY_WRITE_TOKEN;

// Browser token IS exposed to the client during preview, so it must be a
// low-privilege Viewer token only — never the write token. If unset, live
// draft streaming falls back to server-side refetch.
const BROWSER_TOKEN = process.env.SANITY_API_READ_TOKEN;

// Default published client — used by the draft route + image URL builder.
// stega.studioUrl lets the Live API encode click-to-edit pointers in preview.
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: "2025-01-01",
  useCdn: true,
  perspective: "published",
  stega: { studioUrl: STUDIO_URL }
});

// Live Content API. sanityFetch streams real-time updates to the browser
// (including unpublished draft edits in the Presentation tool) and switches
// to the drafts perspective automatically when Next.js draft mode is on.
// <SanityLive /> (mounted in the layout) opens the live connection.
export const { sanityFetch, SanityLive } = defineLive({
  client: sanityClient.withConfig({ useCdn: false }),
  serverToken: SERVER_TOKEN,
  browserToken: BROWSER_TOKEN
});

// Back-compat shim. Every helper below calls (await getClient()).fetch(query,
// params); we route those through sanityFetch so they all get live updates
// and automatic draft/published perspective without rewriting each one.
async function getClient() {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetch: async <T = any>(
      query: string,
      params: Record<string, unknown> = {}
    ): Promise<T> => {
      try {
        const { data } = await sanityFetch({ query, params });
        return data as T;
      } catch (err) {
        // sanityFetch calls draftMode(), which throws when invoked outside a
        // request scope — e.g. generateStaticParams at build time. Fall back
        // to a direct published fetch there (no live/draft needed for params).
        if (
          err instanceof Error &&
          /draftMode|request scope/i.test(err.message)
        ) {
          return await sanityClient.fetch<T>(query, params);
        }
        throw err;
      }
    }
  };
}

const builder = createImageUrlBuilder({ projectId, dataset });
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

// ── Body block → markdown converter ──────────────────────────────────────
// Sanity stores body as an array of typed objects (blockParagraph,
// blockHeading2, blockBulletList, etc). The page templates render markdown
// via react-markdown. Convert the structured blocks back to a markdown string.

type AnyBlock = { _type: string; content?: string | string[] };

function blocksToMarkdown(blocks: AnyBlock[] | undefined | null): string {
  if (!blocks || !blocks.length) return "";
  const out: string[] = [];
  for (const b of blocks) {
    const c = b.content;
    switch (b._type) {
      case "blockHeading2":
        out.push(`## ${c as string}`);
        break;
      case "blockHeading3":
        out.push(`### ${c as string}`);
        break;
      case "blockBulletList":
        out.push((c as string[]).map((x) => `- ${x}`).join("\n"));
        break;
      case "blockOrderedList":
        out.push((c as string[]).map((x, i) => `${i + 1}. ${x}`).join("\n"));
        break;
      case "blockCallout":
        out.push(`> 💡 ${c as string}`);
        break;
      case "blockQuote":
        out.push(`> ${c as string}`);
        break;
      case "blockParagraph":
      default:
        out.push(c as string);
        break;
    }
  }
  return out.join("\n\n");
}

// ── Public helpers ───────────────────────────────────────────────────────

const COURSE_PROJECTION = `
  "slug": slug.current,
  title, eyebrow, tagline, category, color, icon,
  "image": imageUrl,
  summary,
  "hero": { "stats": heroStats[]{ value, label } },
  outcomes,
  modules[]{ title, duration },
  accreditations,
  certificate{ delivery, validity, accepted },
  priceFrom, priceNote,
  faqs[]{ q, a },
  enrollId, enrollUrl
`;

// ── LMS storefront pricing ───────────────────────────────────────────────
// Live per-seat prices from the Train321 API, keyed by course id (enrollId).
// Cached for 5 minutes via Next's fetch cache. Falls back silently if the API
// is unreachable so the marketing site never breaks on an LMS outage.

const LMS_COURSE_LIST_URL =
  "https://new-features-api.train321.com/course/public-list";

async function getLmsPriceMap(): Promise<Map<string, number>> {
  try {
    const res = await fetch(LMS_COURSE_LIST_URL, { next: { revalidate: 300 } });
    if (!res.ok) return new Map();
    const rows: Array<{ id: number | string; price?: number }> = await res.json();
    const map = new Map<string, number>();
    for (const r of rows) {
      if (r && r.id != null && typeof r.price === "number") {
        map.set(String(r.id), r.price);
      }
    }
    return map;
  } catch {
    return new Map();
  }
}

// Override the displayed price with the live LMS cost when the course is
// linked (has an enrollId) and the LMS reports a positive price. A cost of 0
// in the LMS is treated as "custom/contact us" — we leave the Sanity value.
function applyLmsPrice(course: Course, prices: Map<string, number>): Course {
  if (!course.enrollId) return course;
  const lms = prices.get(course.enrollId);
  if (lms != null && lms > 0) {
    return { ...course, priceFrom: lms };
  }
  return course;
}

export async function getCourses(): Promise<Course[]> {
  const [courses, prices] = await Promise.all([
    (await getClient()).fetch<Course[]>(
      `*[_type == "course"] | order(title asc) { ${COURSE_PROJECTION} }`
    ),
    getLmsPriceMap()
  ]);
  return courses.map((c) => applyLmsPrice(c, prices));
}

export async function getCourse(slug: string): Promise<Course | null> {
  const [course, prices] = await Promise.all([
    (await getClient()).fetch<Course | null>(
      `*[_type == "course" && slug.current == $slug][0] { ${COURSE_PROJECTION} }`,
      { slug }
    ),
    getLmsPriceMap()
  ]);
  if (!course) return null;
  return applyLmsPrice(course, prices);
}

const BLOG_PROJECTION = `
  "slug": slug.current,
  title, excerpt, category, publishedAt, readMinutes, heroTone, heroIcon,
  "author": { "name": authorName, "role": authorRole },
  "rawBody": body
`;

type BlogPostRow = Omit<BlogPost, "body"> & { rawBody: AnyBlock[] | null };

export async function getBlogPosts(): Promise<BlogPost[]> {
  const rows: BlogPostRow[] = await (await getClient()).fetch(
    `*[_type == "blogPost"] | order(publishedAt desc) { ${BLOG_PROJECTION} }`
  );
  return rows.map((r) => ({ ...r, body: blocksToMarkdown(r.rawBody) }));
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const r: BlogPostRow | null = await (await getClient()).fetch(
    `*[_type == "blogPost" && slug.current == $slug][0] { ${BLOG_PROJECTION} }`,
    { slug }
  );
  if (!r) return null;
  return { ...r, body: blocksToMarkdown(r.rawBody) };
}

const LEGAL_PROJECTION = `
  "slug": slug.current,
  title, effectiveDate, intro,
  "rawSections": sections[]{ heading, blocks }
`;

type LegalRow = Omit<LegalPage, "body"> & {
  rawSections: Array<{ heading: string; blocks: AnyBlock[] }> | null;
};

function legalSectionsToMarkdown(
  sections: Array<{ heading: string; blocks: AnyBlock[] }> | null | undefined
): string {
  if (!sections) return "";
  return sections
    .map((s) => `## ${s.heading}\n\n${blocksToMarkdown(s.blocks)}`)
    .join("\n\n");
}

export async function getLegalPages(): Promise<LegalPage[]> {
  const rows: LegalRow[] = await (await getClient()).fetch(
    `*[_type == "legalPage"] { ${LEGAL_PROJECTION} }`
  );
  return rows.map((r) => ({
    slug: r.slug,
    title: r.title,
    effectiveDate: r.effectiveDate,
    intro: r.intro,
    body: legalSectionsToMarkdown(r.rawSections)
  }));
}

export async function getLegalPage(slug: string): Promise<LegalPage | null> {
  const r: LegalRow | null = await (await getClient()).fetch(
    `*[_type == "legalPage" && slug.current == $slug][0] { ${LEGAL_PROJECTION} }`,
    { slug }
  );
  if (!r) return null;
  return {
    slug: r.slug,
    title: r.title,
    effectiveDate: r.effectiveDate,
    intro: r.intro,
    body: legalSectionsToMarkdown(r.rawSections)
  };
}

export async function getFaqGroups(): Promise<FaqGroup[]> {
  const items: Array<{
    q: string;
    a: string;
    category: string;
    categoryOrder?: number;
    order?: number;
  }> = await (await getClient()).fetch(
    `*[_type == "faqItem"] | order(categoryOrder asc, order asc) {
      "q": question, "a": answer, category, categoryOrder, order
    }`
  );
  const groups = new Map<string, FaqGroup>();
  for (const it of items) {
    if (!groups.has(it.category)) {
      groups.set(it.category, {
        category: it.category,
        order: it.categoryOrder ?? 0,
        items: []
      });
    }
    groups.get(it.category)!.items.push({ q: it.q, a: it.a });
  }
  return Array.from(groups.values()).sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return await (await getClient()).fetch(
    `*[_type == "testimonial"] | order(order asc) {
      "id": _id, quote, name, role, company,
      "stat": stat{ value, label },
      featured, order
    }`
  );
}

export async function getTeam(): Promise<TeamMember[]> {
  return await (await getClient()).fetch(
    `*[_type == "teamMember"] | order(order asc) {
      name, role, bio, linkedin, twitter, order
    }`
  );
}

const SETTINGS_DEFAULT: SiteSettings = {
  siteName: "Train321",
  tagline: "Online Food Safety Training",
  phone: "561-325-7300",
  email: "info@train321.com",
  social: {},
  companyStats: [],
  trustLogos: []
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const r: SiteSettings | null = await (await getClient()).fetch(
    `*[_id == "siteSettings"][0] {
      siteName, tagline, phone, email, supportEmail, social,
      footerTagline,
      footerColumns[]{ title, links[]{ label, href } },
      footerLegalLinks[]{ label, href },
      newsletter,
      companyStats[]{ value, label },
      trustLogos[]{
        name,
        label,
        url,
        // ?w=400&auto=format gets a 2x-retina-sized image in webp/avif when
        // the browser supports it. ~70% smaller than the original 512px PNG.
        "imageUrl": image.asset->url + "?w=400&auto=format"
      },
      enrollBaseUrl
    }`
  );
  return r ?? SETTINGS_DEFAULT;
}

// ── Page singletons ─────────────────────────────────────────────────────

const CTA_PROJ = `{ label, "to": url }`;
const CTA_BLOCK_PROJ = `{
  eyebrow, heading, lede,
  "primaryCta": primaryCta${CTA_PROJ},
  "secondaryCta": secondaryCta${CTA_PROJ}
}`;
const SECTION_HEAD_PROJ = `{ eyebrow, heading, lede, icon }`;
const PILLAR_PROJ = `{ icon, tone, title, body, linkLabel, linkHref }`;
const STEP_PROJ = `{ title, body }`;
const QFAQ_PROJ = `{ q, a }`;
const TILE_PROJ = `{ icon, title, sub, linkLabel, linkHref }`;

const AUDIENCE_PROJ = `{
  eyebrow, h1Pre, h1Em, lede,
  "ctaPrimary": ctaPrimary${CTA_PROJ},
  "ctaGhost": ctaGhost{ label, "to": url, "icon": coalesce(style, "") },
  trustLabel, stepsTitle, stepsLede,
  steps[]${STEP_PROJ},
  bottomTitle, bottomLede,
  "bottomCtaSecondary": bottomCtaSecondary${CTA_PROJ}
}`;

export async function getHomePage(): Promise<HomePage | null> {
  return (
    (await (await getClient()).fetch(
      `*[_id == "homePage"][0] {
        heroEyebrow, heroHeadline, heroSubcopy,
        "heroPrimaryCta": heroPrimaryCta${CTA_PROJ},
        "heroSecondaryCta": heroSecondaryCta${CTA_PROJ},
        heroTrustPills[]{ icon, label },
        "audienceTeam": audienceTeam${AUDIENCE_PROJ},
        "audienceSelf": audienceSelf${AUDIENCE_PROJ},
        "pillarsHead": pillarsHead${SECTION_HEAD_PROJ},
        pillars[]${PILLAR_PROJ},
        "popularHead": popularHead${SECTION_HEAD_PROJ},
        popularCtaLabel,
        popularSlugs,
        "howHead": howHead${SECTION_HEAD_PROJ},
        "opinionsHead": opinionsHead${SECTION_HEAD_PROJ},
        opinionsLinkLabel,
        "faqTeaserHead": faqTeaserHead${SECTION_HEAD_PROJ},
        faqTeaserCtaLabel,
        "bottomCta": bottomCta${CTA_BLOCK_PROJ}
      }`
    )) ?? null
  );
}

export async function getContactPage(): Promise<ContactPage | null> {
  return (
    (await (await getClient()).fetch(
      `*[_id == "contactPage"][0] {
        heroEyebrow, heroHeading, heroLede,
        tiles[]${TILE_PROJ},
        formHeading, formLede, topicOptions,
        submitLabel, submitSendingLabel, successText,
        "quickFaqsHead": quickFaqsHead${SECTION_HEAD_PROJ},
        quickFaqs[]${QFAQ_PROJ},
        "bottomCta": bottomCta${CTA_BLOCK_PROJ}
      }`
    )) ?? null
  );
}

export async function getDemoPage(): Promise<DemoPage | null> {
  return (
    (await (await getClient()).fetch(
      `*[_id == "demoPage"][0] {
        heroEyebrow, heroHeading, heroLede, heroBullets,
        formHeading, teamSizeOptions, timeslotOptions, interestOptions,
        submitLabel, submitSendingLabel, successText, disclaimer,
        "agendaHead": agendaHead${SECTION_HEAD_PROJ},
        agenda[]{ time, title, desc },
        "faqHead": faqHead${SECTION_HEAD_PROJ},
        faqs[]${QFAQ_PROJ},
        "bottomCta": bottomCta${CTA_BLOCK_PROJ}
      }`
    )) ?? null
  );
}

export async function getServicesPage(): Promise<ServicesPage | null> {
  return (
    (await (await getClient()).fetch(
      `*[_id == "servicesPage"][0] {
        heroEyebrow, heroHeading, heroLede,
        tiers[]{ name, audience, price, priceSub, featured, features, ctaLabel, ctaTo },
        "addonsHead": addonsHead${SECTION_HEAD_PROJ},
        addons[]${PILLAR_PROJ},
        "bottomCta": bottomCta${CTA_BLOCK_PROJ}
      }`
    )) ?? null
  );
}

export async function getAboutPage(): Promise<AboutPage | null> {
  return (
    (await (await getClient()).fetch(
      `*[_id == "aboutPage"][0] {
        heroEyebrow, heroHeading, heroLede,
        "storyHead": storyHead${SECTION_HEAD_PROJ},
        storyParagraphs,
        "pillarsHead": pillarsHead${SECTION_HEAD_PROJ},
        pillars[]${PILLAR_PROJ},
        "teamHead": teamHead${SECTION_HEAD_PROJ},
        "bottomCta": bottomCta${CTA_BLOCK_PROJ}
      }`
    )) ?? null
  );
}

export async function getBlogIndexPage(): Promise<BlogIndexPage | null> {
  return (
    (await (await getClient()).fetch(
      `*[_id == "blogIndexPage"][0] {
        heroEyebrow, heroHeading, heroLede,
        searchPlaceholder, allCategoryLabel, emptyText,
        "recentHead": recentHead${SECTION_HEAD_PROJ},
        newsletter
      }`
    )) ?? null
  );
}

export async function getFaqPage(): Promise<FaqPage | null> {
  return (
    (await (await getClient()).fetch(
      `*[_id == "faqPage"][0] {
        heroEyebrow, heroHeading, heroLede,
        searchPlaceholder, categoriesLabel, emptyText,
        "bottomCta": bottomCta${CTA_BLOCK_PROJ}
      }`
    )) ?? null
  );
}

export async function getCatalogPage(): Promise<CatalogPage | null> {
  return (
    (await (await getClient()).fetch(
      `*[_id == "catalogPage"][0] {
        heroEyebrow, heroHeading, heroLede,
        searchPlaceholder,
        categories[]{ id, label, icon },
        sortOptions, emptyText, clearFiltersLabel,
        "bottomCta": bottomCta${CTA_BLOCK_PROJ}
      }`
    )) ?? null
  );
}

export async function getTestimonialsPage(): Promise<TestimonialsPage | null> {
  return (
    (await (await getClient()).fetch(
      `*[_id == "testimonialsPage"][0] {
        heroEyebrow, heroHeading, heroLede,
        heroStats[]{ value, label },
        "featuredHead": featuredHead${SECTION_HEAD_PROJ},
        "moreHead": moreHead${SECTION_HEAD_PROJ},
        "trustHead": trustHead${SECTION_HEAD_PROJ},
        "bottomCta": bottomCta${CTA_BLOCK_PROJ}
      }`
    )) ?? null
  );
}

export async function getDetailPagesCopy(): Promise<DetailPagesCopy | null> {
  return (
    (await (await getClient()).fetch(
      `*[_id == "detailPagesCopy"][0] {
        courseCrumbHome, courseCrumbCourses, courseEnrollLabel, courseBrowseLabel,
        courseGetStartedLabel, coursePriceFromLabel, coursePriceUnitLabel,
        coursePriceCustomAmt, coursePriceCustomUnit, courseGuarantee,
        courseOverviewEyebrow, courseOverviewHeading, courseOutcomesHeading,
        courseCurriculumEyebrow, courseCurriculumHeading, courseCurriculumLedeTpl,
        courseCertEyebrow, courseCertHeading, courseCertVisualHead, courseCertVisualMeta,
        courseCertDeliveryLabel, courseCertValidityLabel, courseCertAcceptedLabel,
        courseFaqEyebrow, courseFaqHeading,
        "courseBottomCta": courseBottomCta${CTA_BLOCK_PROJ},
        blogCrumbJournal, blogShareLabel, blogReadingMinSuffix, blogAuthorOrgSuffix,
        "blogRelatedHead": blogRelatedHead${SECTION_HEAD_PROJ},
        blogRelatedReadLabel,
        "blogBottomCta": blogBottomCta${CTA_BLOCK_PROJ},
        legalCrumbHome, legalEyebrow, legalEffectivePrefix, legalTocLabel
      }`
    )) ?? null
  );
}

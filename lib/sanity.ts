// Sanity client + GROQ queries.
// Replaces the filesystem-based lib/content.ts. Pages await these helpers.

import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";
import { draftMode } from "next/headers";

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

export type SiteSettings = {
  siteName: string;
  tagline?: string;
  phone?: string;
  email?: string;
  social?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
  companyStats?: Array<{ value: string; label: string }>;
  trustLogos?: Array<{ name: string; label: string }>;
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

// Default published client — fast, CDN-cached, no auth, no stega.
// Used for static prerender + visitors not in draft mode.
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: "2025-01-01",
  useCdn: true,
  perspective: "published"
});

// Studio URL used for stega encoding (so click-to-edit jumps to the right host).
const STUDIO_URL =
  process.env.SANITY_STUDIO_URL || "https://studio.train321.com";

const READ_TOKEN =
  process.env.SANITY_API_READ_TOKEN || process.env.SANITY_WRITE_TOKEN;

// Returns the Sanity client to use for the current request.
// In Next.js draft mode: drafts perspective, no CDN, stega encoding ON so
// every rendered string carries an invisible pointer back to its field.
// Otherwise: the cached published client.
async function getClient() {
  let isDraft = false;
  try {
    isDraft = (await draftMode()).isEnabled;
  } catch {
    // draftMode() throws if called outside a request (e.g. at build time).
    // Treat that as not-draft.
  }
  if (isDraft && READ_TOKEN) {
    return sanityClient.withConfig({
      useCdn: false,
      token: READ_TOKEN,
      perspective: "drafts",
      stega: { enabled: true, studioUrl: STUDIO_URL }
    });
  }
  return sanityClient;
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
  enrollId
`;

export async function getCourses(): Promise<Course[]> {
  return await (await getClient()).fetch(
    `*[_type == "course"] | order(title asc) { ${COURSE_PROJECTION} }`
  );
}

export async function getCourse(slug: string): Promise<Course | null> {
  return (
    (await (await getClient()).fetch(
      `*[_type == "course" && slug.current == $slug][0] { ${COURSE_PROJECTION} }`,
      { slug }
    )) ?? null
  );
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
      siteName, tagline, phone, email, social,
      companyStats[]{ value, label },
      trustLogos[]{ name, label }
    }`
  );
  return r ?? SETTINGS_DEFAULT;
}

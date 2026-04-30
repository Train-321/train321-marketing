// Server-only content loader. Reads slug-keyed JSON and Markdown files from
// `content/`. Mirrors the Tina collections defined in `tina/config.ts`. Do not
// import this from a client component — it uses node:fs.

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// ── Types (mirrors tina/config.ts) ────────────────────────────────────────

export type Course = {
  slug: string;
  title: string;
  eyebrow?: string;
  tagline?: string;
  category?: "food" | "alcohol" | "hr";
  color?: "amber" | "plum" | "emerald" | "neutral";
  icon?: string;
  image?: string;
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
  body: string; // raw markdown
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
  body: string;
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

// ── Generic helpers ───────────────────────────────────────────────────────

const CONTENT_ROOT = path.join(process.cwd(), "content");

function contentDir(sub: string): string {
  return path.join(CONTENT_ROOT, sub);
}

function listFiles(dir: string, ext: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(ext))
    .sort();
}

function listJSON<T>(dir: string): T[] {
  return listFiles(dir, ".json").map((f) => {
    const raw = fs.readFileSync(path.join(dir, f), "utf8");
    return JSON.parse(raw) as T;
  });
}

function readJSON<T>(dir: string, slug: string): T | null {
  const file = path.join(dir, `${slug}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

function listMarkdown<T>(dir: string): Array<T & { slug: string; body: string }> {
  return listFiles(dir, ".md").map((f) => {
    const slug = f.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(dir, f), "utf8");
    const parsed = matter(raw);
    return { ...(parsed.data as T), slug, body: parsed.content };
  });
}

function readMarkdown<T>(
  dir: string,
  slug: string
): (T & { slug: string; body: string }) | null {
  const file = path.join(dir, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const parsed = matter(raw);
  return { ...(parsed.data as T), slug, body: parsed.content };
}

// ── Convenience wrappers ──────────────────────────────────────────────────

export function getCourses(): Course[] {
  const list = listJSON<Course>(contentDir("courses"));
  return list.sort((a, b) => a.title.localeCompare(b.title));
}

export function getCourse(slug: string): Course | null {
  return readJSON<Course>(contentDir("courses"), slug);
}

export function getBlogPosts(): BlogPost[] {
  const list = listMarkdown<Omit<BlogPost, "slug" | "body">>(contentDir("blog"));
  return (list as BlogPost[]).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getBlogPost(slug: string): BlogPost | null {
  return readMarkdown<Omit<BlogPost, "slug" | "body">>(
    contentDir("blog"),
    slug
  ) as BlogPost | null;
}

export function getLegalPages(): LegalPage[] {
  return listMarkdown<Omit<LegalPage, "slug" | "body">>(
    contentDir("legal")
  ) as LegalPage[];
}

export function getLegalPage(slug: string): LegalPage | null {
  return readMarkdown<Omit<LegalPage, "slug" | "body">>(
    contentDir("legal"),
    slug
  ) as LegalPage | null;
}

export function getFaqGroups(): FaqGroup[] {
  const list = listJSON<FaqGroup>(contentDir("faqs"));
  return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getTestimonials(): Testimonial[] {
  const list = listJSON<Testimonial>(contentDir("testimonials"));
  return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getTeam(): TeamMember[] {
  const list = listJSON<TeamMember>(contentDir("team"));
  return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getSiteSettings(): SiteSettings {
  const file = path.join(contentDir("site"), "index.json");
  return JSON.parse(fs.readFileSync(file, "utf8")) as SiteSettings;
}

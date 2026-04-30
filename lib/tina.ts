// Server-side Tina helpers.
//
// HAPPY PATH: when the Tina dev backend is up (`tinacms dev -c "next dev"`)
// or when the production self-hosted backend is configured, we use the
// Tina-generated `databaseClient` to fetch data and pass `{data, query,
// variables}` to client components that call `useTina`. The editor
// overlay then receives live updates from the Tina admin iframe.
//
// FALLBACK: if the Tina backend is unavailable (e.g. someone is running
// only `next dev`), each `tinaQuery*` helper catches the failure and
// rebuilds the same shape from the filesystem via `lib/content.ts`. The
// page renders normally but does not receive live updates from the
// editor. The fallback is also useful for static export / SSG when no
// backend is reachable at build time.
//
// DO NOT import this from a "use client" file — it pulls in node:fs.

import {
  getCourse,
  getCourses,
  getBlogPost,
  getBlogPosts,
  getLegalPage,
  getLegalPages,
  getFaqGroups,
  getTestimonials,
  getTeam,
  getSiteSettings,
  type Course,
  type BlogPost,
  type LegalPage,
  type FaqGroup,
  type Testimonial,
  type TeamMember
} from "@/lib/content";
import databaseClient from "@/tina/__generated__/databaseClient";

// ── Markdown → Tina rich-text AST shim ─────────────────────────────────
//
// Tina returns `body` for markdown collections as a parsed rich-text AST
// (`{type: "root", children: [...]}`) which TinaMarkdown can render. When
// we fall back to filesystem reads, we hold raw markdown. We can't fully
// reproduce Tina's parser but we can produce a workable AST that covers
// the elements actually used in our content (headings, paragraphs, lists,
// blockquotes, inline emphasis/strong, links). Anything we don't model
// is rendered as a plain paragraph.

type RichNode =
  | { type: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"; children: RichNode[] }
  | { type: "p"; children: RichNode[] }
  | { type: "blockquote"; children: RichNode[] }
  | { type: "ul" | "ol"; children: RichNode[] }
  | { type: "li"; children: RichNode[] }
  | { type: "lic"; children: RichNode[] } // list item child wrapper Tina uses
  | { type: "a"; url: string; children: RichNode[] }
  | { type: "text"; text: string; bold?: boolean; italic?: boolean; code?: boolean }
  | { type: "code_block"; lang?: string; value: string }
  | { type: "hr" };

function parseInline(text: string): RichNode[] {
  const out: RichNode[] = [];
  // [text](url)
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = linkRe.exec(text)) !== null) {
    if (m.index > last) out.push(...parseEmphasis(text.slice(last, m.index)));
    out.push({ type: "a", url: m[2], children: parseEmphasis(m[1]) });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(...parseEmphasis(text.slice(last)));
  return out;
}

function parseEmphasis(text: string): RichNode[] {
  // **bold**, *italic* / _italic_, `code`
  const out: RichNode[] = [];
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_|`([^`]+)`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push({ type: "text", text: text.slice(last, m.index) });
    if (m[2] != null) out.push({ type: "text", text: m[2], bold: true });
    else if (m[3] != null) out.push({ type: "text", text: m[3], italic: true });
    else if (m[4] != null) out.push({ type: "text", text: m[4], italic: true });
    else if (m[5] != null) out.push({ type: "text", text: m[5], code: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ type: "text", text: text.slice(last) });
  if (!out.length) out.push({ type: "text", text: "" });
  return out;
}

export function markdownToTinaAst(md: string): { type: "root"; children: RichNode[] } {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const children: RichNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    // Headings
    const h = /^(#{1,6})\s+(.+)$/.exec(line);
    if (h) {
      const level = h[1].length as 1 | 2 | 3 | 4 | 5 | 6;
      children.push({
        type: (`h${level}` as RichNode["type"]) as
          | "h1"
          | "h2"
          | "h3"
          | "h4"
          | "h5"
          | "h6",
        children: parseInline(h[2])
      });
      i++;
      continue;
    }
    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      children.push({ type: "hr" });
      i++;
      continue;
    }
    // Code fence
    if (/^```/.test(line.trim())) {
      const lang = line.trim().replace(/^```/, "").trim();
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        buf.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      children.push({ type: "code_block", lang: lang || undefined, value: buf.join("\n") });
      continue;
    }
    // Blockquote
    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      children.push({ type: "blockquote", children: parseInline(buf.join(" ")) });
      continue;
    }
    // Unordered / ordered list
    const ulMatch = /^[-*+]\s+(.+)$/.exec(line);
    const olMatch = /^\d+\.\s+(.+)$/.exec(line);
    if (ulMatch || olMatch) {
      const listType: "ul" | "ol" = ulMatch ? "ul" : "ol";
      const items: RichNode[] = [];
      const itemRe = listType === "ul" ? /^[-*+]\s+(.+)$/ : /^\d+\.\s+(.+)$/;
      while (i < lines.length) {
        const lm = itemRe.exec(lines[i]);
        if (!lm) break;
        items.push({
          type: "li",
          children: [{ type: "lic", children: parseInline(lm[1]) }]
        });
        i++;
      }
      children.push({ type: listType, children: items });
      continue;
    }
    // Paragraph (collect consecutive non-blank lines)
    const buf: string[] = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|>\s|[-*+]\s|\d+\.\s|```)/.test(lines[i])) {
      buf.push(lines[i]);
      i++;
    }
    children.push({ type: "p", children: parseInline(buf.join(" ")) });
  }
  return { type: "root", children };
}

// ── Helpers ────────────────────────────────────────────────────────────

function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

// Tina queries can hang forever when the local level server is down
// (the level client retries connect indefinitely). Wrap the query in a
// timeout race so the catch block can do its filesystem fallback.
const TINA_TIMEOUT_MS = Number(process.env.TINA_QUERY_TIMEOUT_MS || 4000);

// Strip class instances / non-plain bits from Tina's query result so Next 15
// can safely pass it from server → client component (plain-objects rule).
function serialize<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

function withTimeout<T>(p: Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`tina query timed out after ${TINA_TIMEOUT_MS}ms`)),
      TINA_TIMEOUT_MS
    );
    p.then(
      (v) => {
        clearTimeout(timer);
        resolve(serialize(v));
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });
}

function makeSys(slug: string, ext: "json" | "md") {
  return {
    __typename: "SystemInfo" as const,
    filename: slug,
    basename: `${slug}.${ext}`,
    hasReferences: null,
    breadcrumbs: [slug],
    path: `content/${slug}.${ext}`,
    relativePath: `${slug}.${ext}`,
    extension: ext
  };
}

// ── tinaQuery wrappers ────────────────────────────────────────────────
//
// Each wrapper returns the same shape Tina's generated client returns
// (`{ data, query, variables }`) so the result can be spread into a
// client component that calls `useTina`. Each one tries the live Tina
// backend first and falls back to filesystem reads when it fails.

export type TinaResult<TData, TVars> = {
  data: TData;
  query: string;
  variables: TVars;
};

// ── Course ────────────────────────────────────────────────────────────

function fsCourseToTinaShape(c: Course) {
  return {
    __typename: "Course" as const,
    id: `content/courses/${c.slug}.json`,
    slug: c.slug,
    title: c.title,
    eyebrow: c.eyebrow ?? null,
    tagline: c.tagline ?? null,
    category: c.category ?? null,
    color: c.color ?? null,
    icon: c.icon ?? null,
    image: c.image ?? null,
    summary: c.summary ?? null,
    outcomes: c.outcomes ?? null,
    accreditations: c.accreditations ?? null,
    priceFrom: c.priceFrom ?? null,
    priceNote: c.priceNote ?? null,
    enrollId: c.enrollId ?? null,
    _sys: { ...makeSys(c.slug, "json"), path: `content/courses/${c.slug}.json` },
    hero: c.hero
      ? {
          __typename: "CourseHero" as const,
          stats: (c.hero.stats || []).map((s) => ({
            __typename: "CourseHeroStats" as const,
            value: s.value,
            label: s.label
          }))
        }
      : null,
    modules: (c.modules || []).map((m) => ({
      __typename: "CourseModules" as const,
      title: m.title,
      duration: m.duration ?? null
    })),
    certificate: c.certificate
      ? {
          __typename: "CourseCertificate" as const,
          delivery: c.certificate.delivery ?? null,
          validity: c.certificate.validity ?? null,
          accepted: c.certificate.accepted ?? null
        }
      : null,
    faqs: (c.faqs || []).map((f) => ({
      __typename: "CourseFaqs" as const,
      q: f.q,
      a: f.a
    }))
  };
}

export async function tinaCourse(slug: string) {
  try {
    return await withTimeout(
      databaseClient.queries.course({ relativePath: `${slug}.json` })
    );
  } catch {
    const c = getCourse(slug);
    if (!c) return null;
    return {
      data: { course: fsCourseToTinaShape(c) },
      query: `query course($relativePath: String!) { course(relativePath: $relativePath) { ...CourseParts } }`,
      variables: { relativePath: `${slug}.json` }
    };
  }
}

export async function tinaCourseConnection() {
  try {
    return await withTimeout(databaseClient.queries.courseConnection());
  } catch {
    const courses = getCourses();
    return {
      data: {
        courseConnection: {
          totalCount: courses.length,
          pageInfo: { hasPreviousPage: false, hasNextPage: false, startCursor: "", endCursor: "" },
          edges: courses.map((c) => ({
            cursor: c.slug,
            node: fsCourseToTinaShape(c)
          }))
        }
      },
      query: `query courseConnection { courseConnection { edges { node { ...CourseParts } } } }`,
      variables: {}
    };
  }
}

// ── BlogPost ─────────────────────────────────────────────────────────

function fsBlogToTinaShape(p: BlogPost) {
  return {
    __typename: "BlogPost" as const,
    id: `content/blog/${p.slug}.md`,
    title: p.title,
    excerpt: p.excerpt ?? null,
    category: p.category ?? null,
    publishedAt: p.publishedAt,
    readMinutes: p.readMinutes ?? null,
    heroTone: p.heroTone ?? null,
    heroIcon: p.heroIcon ?? null,
    body: markdownToTinaAst(p.body || ""),
    _sys: { ...makeSys(p.slug, "md"), path: `content/blog/${p.slug}.md` },
    author: p.author
      ? {
          __typename: "BlogPostAuthor" as const,
          name: p.author.name,
          role: p.author.role ?? null
        }
      : null
  };
}

export async function tinaBlogPost(slug: string) {
  try {
    return await withTimeout(
      databaseClient.queries.blogPost({ relativePath: `${slug}.md` })
    );
  } catch {
    const p = getBlogPost(slug);
    if (!p) return null;
    return {
      data: { blogPost: fsBlogToTinaShape(p) },
      query: `query blogPost($relativePath: String!) { blogPost(relativePath: $relativePath) { ...BlogPostParts } }`,
      variables: { relativePath: `${slug}.md` }
    };
  }
}

export async function tinaBlogPostConnection() {
  try {
    return await withTimeout(databaseClient.queries.blogPostConnection());
  } catch {
    const posts = getBlogPosts();
    return {
      data: {
        blogPostConnection: {
          totalCount: posts.length,
          pageInfo: { hasPreviousPage: false, hasNextPage: false, startCursor: "", endCursor: "" },
          edges: posts.map((p) => ({
            cursor: p.slug,
            node: fsBlogToTinaShape(p)
          }))
        }
      },
      query: `query blogPostConnection { blogPostConnection { edges { node { ...BlogPostParts } } } }`,
      variables: {}
    };
  }
}

// ── LegalPage ────────────────────────────────────────────────────────

function fsLegalToTinaShape(p: LegalPage) {
  return {
    __typename: "LegalPage" as const,
    id: `content/legal/${p.slug}.md`,
    title: p.title,
    effectiveDate: p.effectiveDate ?? null,
    intro: p.intro ?? null,
    body: markdownToTinaAst(p.body || ""),
    _sys: { ...makeSys(p.slug, "md"), path: `content/legal/${p.slug}.md` }
  };
}

export async function tinaLegalPage(slug: string) {
  try {
    return await withTimeout(
      databaseClient.queries.legalPage({ relativePath: `${slug}.md` })
    );
  } catch {
    const p = getLegalPage(slug);
    if (!p) return null;
    return {
      data: { legalPage: fsLegalToTinaShape(p) },
      query: `query legalPage($relativePath: String!) { legalPage(relativePath: $relativePath) { ...LegalPageParts } }`,
      variables: { relativePath: `${slug}.md` }
    };
  }
}

export async function tinaLegalPageConnection() {
  try {
    return await withTimeout(databaseClient.queries.legalPageConnection());
  } catch {
    const pages = getLegalPages();
    return {
      data: {
        legalPageConnection: {
          totalCount: pages.length,
          pageInfo: { hasPreviousPage: false, hasNextPage: false, startCursor: "", endCursor: "" },
          edges: pages.map((p) => ({
            cursor: p.slug,
            node: fsLegalToTinaShape(p)
          }))
        }
      },
      query: `query legalPageConnection { legalPageConnection { edges { node { ...LegalPageParts } } } }`,
      variables: {}
    };
  }
}

// ── FaqGroup ─────────────────────────────────────────────────────────

function fsFaqToTinaShape(g: FaqGroup, idx: number) {
  const slug = `faq-${idx}`;
  return {
    __typename: "FaqGroup" as const,
    id: `content/faqs/${slug}.json`,
    category: g.category,
    order: g.order ?? null,
    _sys: { ...makeSys(slug, "json"), path: `content/faqs/${slug}.json` },
    items: (g.items || []).map((it) => ({
      __typename: "FaqGroupItems" as const,
      q: it.q,
      a: it.a
    }))
  };
}

export async function tinaFaqGroupConnection() {
  try {
    return await withTimeout(databaseClient.queries.faqGroupConnection());
  } catch {
    const groups = getFaqGroups();
    return {
      data: {
        faqGroupConnection: {
          totalCount: groups.length,
          pageInfo: { hasPreviousPage: false, hasNextPage: false, startCursor: "", endCursor: "" },
          edges: groups.map((g, i) => ({
            cursor: String(i),
            node: fsFaqToTinaShape(g, i)
          }))
        }
      },
      query: `query faqGroupConnection { faqGroupConnection { edges { node { ...FaqGroupParts } } } }`,
      variables: {}
    };
  }
}

// ── Testimonial ──────────────────────────────────────────────────────

function fsTestimonialToTinaShape(t: Testimonial) {
  const slug = t.id;
  return {
    __typename: "Testimonial" as const,
    id: `content/testimonials/${slug}.json`,
    quote: t.quote,
    name: t.name,
    role: t.role ?? null,
    company: t.company ?? null,
    featured: t.featured ?? null,
    order: t.order ?? null,
    _sys: { ...makeSys(slug, "json"), path: `content/testimonials/${slug}.json` },
    stat: t.stat
      ? {
          __typename: "TestimonialStat" as const,
          value: t.stat.value ?? null,
          label: t.stat.label ?? null
        }
      : null
  };
}

export async function tinaTestimonialConnection() {
  try {
    return await withTimeout(databaseClient.queries.testimonialConnection());
  } catch {
    const items = getTestimonials();
    return {
      data: {
        testimonialConnection: {
          totalCount: items.length,
          pageInfo: { hasPreviousPage: false, hasNextPage: false, startCursor: "", endCursor: "" },
          edges: items.map((t) => ({
            cursor: t.id,
            node: fsTestimonialToTinaShape(t)
          }))
        }
      },
      query: `query testimonialConnection { testimonialConnection { edges { node { ...TestimonialParts } } } }`,
      variables: {}
    };
  }
}

// ── TeamMember ───────────────────────────────────────────────────────

function fsTeamToTinaShape(m: TeamMember, idx: number) {
  const slug = (m.name || `member-${idx}`).toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return {
    __typename: "TeamMember" as const,
    id: `content/team/${slug}.json`,
    name: m.name,
    role: m.role ?? null,
    bio: m.bio ?? null,
    linkedin: m.linkedin ?? null,
    twitter: m.twitter ?? null,
    order: m.order ?? null,
    _sys: { ...makeSys(slug, "json"), path: `content/team/${slug}.json` }
  };
}

export async function tinaTeamMemberConnection() {
  try {
    return await withTimeout(databaseClient.queries.teamMemberConnection());
  } catch {
    const team = getTeam();
    return {
      data: {
        teamMemberConnection: {
          totalCount: team.length,
          pageInfo: { hasPreviousPage: false, hasNextPage: false, startCursor: "", endCursor: "" },
          edges: team.map((m, i) => ({
            cursor: String(i),
            node: fsTeamToTinaShape(m, i)
          }))
        }
      },
      query: `query teamMemberConnection { teamMemberConnection { edges { node { ...TeamMemberParts } } } }`,
      variables: {}
    };
  }
}

// ── SiteSettings ─────────────────────────────────────────────────────

export async function tinaSiteSettings() {
  try {
    return await withTimeout(
      databaseClient.queries.siteSettings({ relativePath: "index.json" })
    );
  } catch {
    const s = safe(() => getSiteSettings(), {
      siteName: "Train321",
      tagline: "",
      phone: "",
      email: "",
      social: {},
      companyStats: [],
      trustLogos: []
    } as ReturnType<typeof getSiteSettings>);
    return {
      data: {
        siteSettings: {
          __typename: "SiteSettings" as const,
          id: `content/site/index.json`,
          siteName: s.siteName ?? null,
          tagline: s.tagline ?? null,
          phone: s.phone ?? null,
          email: s.email ?? null,
          _sys: { ...makeSys("index", "json"), path: `content/site/index.json` },
          social: s.social
            ? {
                __typename: "SiteSettingsSocial" as const,
                facebook: s.social.facebook ?? null,
                twitter: s.social.twitter ?? null,
                linkedin: s.social.linkedin ?? null,
                instagram: s.social.instagram ?? null,
                youtube: s.social.youtube ?? null
              }
            : null,
          companyStats: (s.companyStats || []).map((cs) => ({
            __typename: "SiteSettingsCompanyStats" as const,
            value: cs.value,
            label: cs.label
          })),
          trustLogos: (s.trustLogos || []).map((tl) => ({
            __typename: "SiteSettingsTrustLogos" as const,
            name: tl.name,
            label: tl.label ?? null
          }))
        }
      },
      query: `query siteSettings($relativePath: String!) { siteSettings(relativePath: $relativePath) { ...SiteSettingsParts } }`,
      variables: { relativePath: "index.json" }
    };
  }
}

export default databaseClient;

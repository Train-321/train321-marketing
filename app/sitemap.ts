import type { MetadataRoute } from "next";
import {
  getCourses,
  getBlogPosts,
  getLegalPages,
  getServiceIndex
} from "@/lib/sanity";
import { STATIC_COURSES } from "@/lib/staticCourses";

/**
 * Sitemap for Google Search Console.
 *
 * Built from Sanity rather than hand-listed, so a course, service, post or
 * legal page added in Studio appears here without a code change. Revalidated
 * on the same window as the rest of the site.
 *
 * lastModified is the document's real Sanity edit time, or left out. It used
 * to be "now" on every entry, which tells Google the whole site changed every
 * hour — it learns to ignore that, and then ignores it on the pages that
 * really did change.
 *
 * Deliberately excluded: /checkout (transactional, nothing to index) and the
 * /v2 and /v3 design variants, which are noindex internal previews.
 */

export const revalidate = 3600;

const SITE = (process.env.SITE_URL || "https://www.train321.com").replace(/\/$/, "");

// Routes with no CMS-driven slug. Priority is relative within our own site —
// it only tells Google which of OUR pages matter most, not how we rank.
const STATIC_ROUTES: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/catalog", priority: 0.9, changeFrequency: "weekly" },
  { path: "/courses", priority: 0.9, changeFrequency: "weekly" },
  { path: "/services", priority: 0.8, changeFrequency: "monthly" },
  { path: "/demo", priority: 0.8, changeFrequency: "monthly" },
  { path: "/individuals", priority: 0.7, changeFrequency: "monthly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
  { path: "/blog", priority: 0.6, changeFrequency: "weekly" }
];

/** A Sanity timestamp as a Date, or nothing — never a made-up "now". */
const when = (iso?: string) => (iso ? { lastModified: new Date(iso) } : {});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // One slow source shouldn't cost us the whole sitemap — settle each
  // independently and emit whatever resolved.
  const [courses, posts, legal, services] = await Promise.allSettled([
    getCourses(),
    getBlogPosts(),
    getLegalPages(),
    getServiceIndex()
  ]);

  const ok = <T,>(r: PromiseSettledResult<T[]>): T[] =>
    r.status === "fulfilled" ? r.value : [];

  return [
    ...STATIC_ROUTES.map((r) => ({
      url: `${SITE}${r.path}`,
      changeFrequency: r.changeFrequency,
      priority: r.priority
    })),
    ...ok(courses).map((c) => ({
      url: `${SITE}/courses/${c.slug}`,
      ...when(c.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.9
    })),
    // Code-defined course pages (TABC, RBS) that have no Sanity document.
    ...Object.keys(STATIC_COURSES)
      .filter((slug) => !ok(courses).some((c) => c.slug === slug))
      .map((slug) => ({
        url: `${SITE}/courses/${slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.9
      })),
    ...ok(services).map((s) => ({
      url: `${SITE}/services/${s.slug}`,
      ...when(s.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8
    })),
    ...ok(posts).map((p) => ({
      url: `${SITE}/blog/${p.slug}`,
      // The last edit when there is one, else the publish date.
      ...when(p.updatedAt || p.publishedAt),
      changeFrequency: "yearly" as const,
      priority: 0.5
    })),
    ...ok(legal).map((l) => ({
      url: `${SITE}/legal/${l.slug}`,
      ...when(l.updatedAt),
      changeFrequency: "yearly" as const,
      priority: 0.3
    }))
  ];
}

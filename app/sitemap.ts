import type { MetadataRoute } from "next";
import {
  getCourses,
  getBlogPosts,
  getLegalPages,
  getServiceSlugs
} from "@/lib/sanity";

/**
 * Sitemap for Google Search Console.
 *
 * Built from Sanity rather than hand-listed, so a course, service, post or
 * legal page added in Studio appears here without a code change. Revalidated
 * on the same window as the rest of the site.
 *
 * Deliberately excluded: /checkout (transactional, nothing to index) and the
 * /v2 and /v3 design variants, which are internal previews.
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
  { path: "/services", priority: 0.8, changeFrequency: "monthly" },
  { path: "/demo", priority: 0.8, changeFrequency: "monthly" },
  { path: "/individuals", priority: 0.7, changeFrequency: "monthly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
  { path: "/blog", priority: 0.6, changeFrequency: "weekly" }
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // One slow source shouldn't cost us the whole sitemap — settle each
  // independently and emit whatever resolved.
  const [courses, posts, legal, services] = await Promise.allSettled([
    getCourses(),
    getBlogPosts(),
    getLegalPages(),
    getServiceSlugs()
  ]);

  const ok = <T,>(r: PromiseSettledResult<T[]>): T[] =>
    r.status === "fulfilled" ? r.value : [];

  const now = new Date();

  return [
    ...STATIC_ROUTES.map((r) => ({
      url: `${SITE}${r.path}`,
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority
    })),
    ...ok(courses).map((c) => ({
      url: `${SITE}/courses/${c.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9
    })),
    ...ok(services).map((slug) => ({
      url: `${SITE}/services/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8
    })),
    ...ok(posts).map((p) => ({
      url: `${SITE}/blog/${p.slug}`,
      // Real publish date, so Google can tell fresh posts from old ones.
      lastModified: p.publishedAt ? new Date(p.publishedAt) : now,
      changeFrequency: "yearly" as const,
      priority: 0.5
    })),
    ...ok(legal).map((l) => ({
      url: `${SITE}/legal/${l.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3
    }))
  ];
}

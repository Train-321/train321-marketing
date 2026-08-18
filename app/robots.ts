import type { MetadataRoute } from "next";

/**
 * robots.txt. Points crawlers at the sitemap and keeps them out of pages that
 * are transactional or internal — a checkout has nothing to index, and the
 * /v2 and /v3 design variants would read as duplicate content against the
 * live home page.
 */

const SITE = (process.env.SITE_URL || "https://www.train321.com").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/checkout", "/v2", "/v3"]
      }
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE
  };
}

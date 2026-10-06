import type { MetadataRoute } from "next";

/**
 * robots.txt. Points crawlers at the sitemap and keeps them out of pages that
 * are transactional or internal — a checkout has nothing to index.
 *
 * The /v2 and /v3 design variants are deliberately NOT listed: they carry a
 * noindex meta tag, and Google can only read that if it is allowed to fetch
 * the page. Blocking them here would leave any linked URL indexed as a bare
 * address with no snippet.
 */

const SITE = (process.env.SITE_URL || "https://www.train321.com").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/checkout"]
      }
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE
  };
}

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Course thumbnails are uploaded to the LMS at whatever size the editor had
  // (145–400 KB JPEGs for a 300px card). Routing them through the Next image
  // optimizer serves a right-sized WebP/AVIF instead; see lib/images.ts.
  images: {
    formats: ["image/avif", "image/webp"],
    // Thumbnails rarely change once uploaded — keep optimized copies for a
    // month rather than the 60s default, so repeat views never re-encode.
    minimumCacheTTL: 2678400,
    remotePatterns: [
      { protocol: "https", hostname: "api.train321.com" },
      { protocol: "https", hostname: "new-features-api.train321.com" },
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "images.unsplash.com" }
    ]
  },

  // Tina's auth + datalayer ship CommonJS deps (color-string, mongodb-level
  // transitive deps) that Turbopack mis-bundles for the server runtime —
  // marking them external makes Node load them directly from node_modules,
  // which is what they're built for.
  serverExternalPackages: [
    "tinacms-authjs",
    "@tinacms/datalayer",
    "tinacms-gitprovider-github",
    "mongodb-level",
    "next-auth",
    "color-string"
  ],

  // Some pages link to legacy URLs from the old Nuxt site (/food-handler, /privacy-policy, etc).
  // Permanent redirects preserve any inbound SEO juice and avoid 404s on old bookmarks.
  async redirects() {
    return [
      // Legacy course slugs → /courses/<slug>
      ...[
        "food-handler",
        "food-manager",
        "alcohol",
        "bar-basics",
        "service-basics",
        "safety-basics",
        "security-host",
        "human-resources",
        "sexual-harassment",
        "california-sexual-harassment",
        "illinois-sexual-harassment",
        "new-york-sexual-harassment",
        "human-trafficking",
        "additional-courses",
        "custom-courses"
      ].map((slug) => ({
        source: `/${slug}`,
        destination: `/courses/${slug}`,
        permanent: true
      })),
      // Services. These were course documents until they moved to the services
      // template, so both the bare legacy slug and the old /courses/ address
      // have to land on /services/<slug>.
      ...["licensing", "white-labeling"].flatMap((slug) => [
        { source: `/${slug}`, destination: `/services/${slug}`, permanent: true },
        { source: `/courses/${slug}`, destination: `/services/${slug}`, permanent: true }
      ]),
      // Legacy legal slugs → /legal/<slug>
      ...[
        "privacy-policy",
        "terms-conditions",
        "accessibility",
        "non-discrimination",
        "complaints-appeals"
      ].map((slug) => ({
        source: `/${slug}`,
        destination: `/legal/${slug}`,
        permanent: true
      })),
      // Short/alternate legal slugs (used by some CMS-managed footer links)
      // → the canonical legal documents.
      { source: "/legal/terms", destination: "/legal/terms-conditions", permanent: true },
      { source: "/legal/terms-of-service", destination: "/legal/terms-conditions", permanent: true },
      { source: "/legal/privacy", destination: "/legal/privacy-policy", permanent: true },
      // There is no accredited-food-handler course document; the accredited
      // program lives on the food-handler page.
      { source: "/accredited-food-handler", destination: "/courses/food-handler", permanent: true },
      // Short shareable link for the California RBS sign-up page. Temporary on
      // purpose — the campaign target can be repointed without waiting out
      // browser-cached permanent redirects.
      { source: "/rbs", destination: "/courses/rbs", permanent: false },
      // Addresses that are linked (from Studio-managed footer/CTA copy) or
      // guessed by visitors but have no page of their own. /testimonials used
      // to be a route; the quotes now live on the home page. /enroll was the
      // old "start a plan" target — buying starts from the catalog.
      { source: "/testimonials", destination: "/#testimonials", permanent: true },
      { source: "/enroll", destination: "/catalog", permanent: true },
      // The pre-2026 static train321.com served bare .html files (mostly
      // underscore-named). One entry per old URL so search results and
      // inbound links keep resolving after the Vercel cutover.
      ...Object.entries({
        "index.html": "/",
        "index-1.html": "/",
        "index_old.html": "/",
        "home.html": "/",
        "about_us.html": "/about",
        "about.html": "/about",
        "testimonials.html": "/",
        "faqs.html": "/faq",
        "faq.html": "/faq",
        // Still in Google's index from the old site (found in the Sept 2026
        // SEO audit) — each was returning 404.
        "tabc.html": "/courses/tabc",
        "rbs.html": "/courses/rbs",
        "blog.html": "/blog",
        "pricing.html": "/services",
        "contact.html": "/contact",
        "demo.html": "/demo",
        "services.html": "/services",
        "licensing.html": "/services/licensing",
        "white_labeling.html": "/services/white-labeling",
        "custom_courses.html": "/courses/custom-courses",
        "additional-courses.html": "/courses/additional-courses",
        "food_handler.html": "/courses/food-handler",
        "accredited-food-handler.html": "/courses/food-handler",
        "food_manager.html": "/courses/food-manager",
        "alcohol.html": "/courses/alcohol",
        // ATAP = the old Alcohol Training Awareness Program page.
        "atap.html": "/courses/alcohol",
        "bar_basics.html": "/courses/bar-basics",
        "safety_basics.html": "/courses/safety-basics",
        "service_basics.html": "/courses/service-basics",
        "security_host.html": "/courses/security-host",
        "human_resources.html": "/courses/human-resources",
        "human_trafficking.html": "/courses/human-trafficking",
        "sexual_harassment.html": "/courses/sexual-harassment",
        "california-sexual-harassment.html": "/courses/california-sexual-harassment",
        "illinois-sexual-harassment.html": "/courses/illinois-sexual-harassment",
        "new-york-sexual-harassment.html": "/courses/new-york-sexual-harassment",
        "privacy-policy.html": "/legal/privacy-policy",
        "terms-conditions.html": "/legal/terms-conditions",
        // No refund-policy document on the new site; terms covers refunds.
        "refund-policy.html": "/legal/terms-conditions",
        "accessibility.html": "/legal/accessibility",
        "non-discrimination.html": "/legal/non-discrimination",
        "complaints-appeals.html": "/legal/complaints-appeals"
      }).map(([src, destination]) => ({
        source: `/${src}`,
        destination,
        permanent: true
      }))
    ];
  }
};

export default nextConfig;

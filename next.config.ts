import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tina's auth + datalayer ship CommonJS deps (color-string, mongodb-level
  // transitive deps) that Turbopack mis-bundles for the server runtime —
  // marking them external makes Node load them directly from node_modules,
  // which is what they're built for.
  serverExternalPackages: [
    "tinacms-authjs",
    "@tinacms/datalayer",
    "tinacms-gitprovider-github",
    "mongodb-level",
    "next-auth"
  ],

  // Some pages link to legacy URLs from the old Nuxt site (/food-handler, /privacy-policy, etc).
  // Permanent redirects preserve any inbound SEO juice and avoid 404s on old bookmarks.
  async redirects() {
    return [
      // Legacy course slugs → /courses/<slug>
      ...[
        "food-handler",
        "food-manager",
        "accredited-food-handler",
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
        "custom-courses",
        "licensing",
        "white-labeling"
      ].map((slug) => ({
        source: `/${slug}`,
        destination: `/courses/${slug}`,
        permanent: true
      })),
      // Legacy legal slugs → /legal/<slug>
      ...[
        "privacy-policy",
        "terms-conditions",
        "refund-policy",
        "accessibility",
        "non-discrimination",
        "complaints-appeals"
      ].map((slug) => ({
        source: `/${slug}`,
        destination: `/legal/${slug}`,
        permanent: true
      }))
    ];
  }
};

export default nextConfig;

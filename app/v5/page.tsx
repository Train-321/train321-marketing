import type { Metadata } from "next";
import HomeV5 from "@/components/v5/HomeV5";
import { getMarketplaceCatalog } from "@/lib/newFeatures";
import {
  getCourses,
  getTestimonials,
  getFaqGroups,
  getSiteSettings,
  getHomePage
} from "@/lib/sanity";

// Photo-first homepage redesign: hero-as-finder with an industry accordion,
// a state map + in-memory course explorer, popular rail, role marquee, team
// dashboard, and the usual proof. The canonical homepage (app/page.tsx) and
// the /v2 and /v3 previews are untouched.

export const metadata: Metadata = {
  title: "Food Handler, Alcohol & Compliance Training — Certified Today",
  description:
    "ANSI-accredited food handler, food manager, alcohol server and HR compliance courses. Pick your state, finish on your phone in about an hour, certificate the same day.",
  alternates: { canonical: "/v5" },
  // Internal preview of a home-page design — duplicate content against "/".
  robots: { index: false, follow: true },
  openGraph: {
    title: "Get certified before your next shift — Train 321",
    description:
      "Pick your state and see only the courses accepted there. Food, alcohol and HR compliance training from $10, certificate the moment you pass.",
    type: "website"
  }
};

export default async function Page() {
  const [courses, testimonials, faqs, settings, home, catalog] = await Promise.all([
    getCourses(),
    getTestimonials(),
    getFaqGroups(),
    getSiteSettings(),
    getHomePage(),
    // The whole catalog, variants included: the finder filters by state in
    // the browser, so it needs every version to choose from.
    getMarketplaceCatalog({ perPage: 500, keepVariants: true })
  ]);

  return (
    <HomeV5
      courses={courses}
      testimonials={testimonials}
      faqs={faqs}
      companyStats={settings.companyStats || []}
      trustLogos={settings.trustLogos || []}
      home={home}
      marketplace={{
        courses: catalog.courses,
        groups: catalog.groups,
        categories: catalog.categories,
        total: catalog.total
      }}
      phone={settings.phone || "561-325-7300"}
      email={settings.email || "info@train321.com"}
    />
  );
}

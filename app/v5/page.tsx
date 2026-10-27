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

// Title and description are the home page's own, from Studio (Site Settings →
// "Search & social sharing"), so this preview reads like the page it may replace.
export async function generateMetadata(): Promise<Metadata> {
  const { defaultSeo: seo } = await getSiteSettings();
  return {
    // Absolute: the Studio title already carries the brand, and the layout's
    // "%s | Train 321" template would add it a second time on this child route.
    title: {
      absolute: seo?.metaTitle || "Online Food Handler, Alcohol & Compliance Training for Restaurants | Train 321"
    },
    description:
      seo?.metaDescription ||
      "Food handler, food manager, alcohol server and workplace compliance courses. Pick your state, finish on your phone, and download your certificate when you pass.",
    alternates: { canonical: "/v5" },
    // Internal preview of a home-page design — duplicate content against "/".
    robots: { index: false, follow: true }
  };
}

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

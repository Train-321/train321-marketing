import type { Metadata } from "next";
import HomePage from "@/components/HomePage";
import { getMarketplaceCatalog } from "@/lib/newFeatures";
import {
  getCourses,
  getTestimonials,
  getFaqGroups,
  getSiteSettings,
  getHomePage
} from "@/lib/sanity";

// The home page is what a bare https://www.train321.com/ link unfurls to on
// WhatsApp, Facebook, LinkedIn, etc. Its title and description are managed in
// Studio (Site Settings → "Search & social sharing"); the strings below only
// show while those fields are empty.
export async function generateMetadata(): Promise<Metadata> {
  const { defaultSeo: seo } = await getSiteSettings();
  return {
    title: seo?.metaTitle || "Train 321 — Compliance training your team actually finishes",
    description:
      seo?.metaDescription ||
      "ANSI-accredited courses for food safety, alcohol service, and HR compliance. Rolled out across your team in under an hour. Accepted in all 50 states.",
    alternates: { canonical: "/" }
  };
}

export default async function Page() {
  const [courses, testimonials, faqs, settings, home, catalog] = await Promise.all([
    getCourses(),
    getTestimonials(),
    getFaqGroups(),
    getSiteSettings(),
    getHomePage(),
    getMarketplaceCatalog()
  ]);
  return (
    <HomePage
      forcedAudience={null}
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
    />
  );
}

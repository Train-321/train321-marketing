import type { Metadata } from "next";
import HomeV6 from "@/components/v6/HomeV6";
import { getMarketplaceCatalog } from "@/lib/newFeatures";
import { getCourses, getTestimonials, getFaqGroups, getSiteSettings, getHomePage } from "@/lib/sanity";

// Product-led homepage preview: a live certificate in the hero that fills
// in from the finder, a drifting photo mosaic of roles, and the v5 course
// finder underneath. Preview only; the canonical homepage is untouched.

export const metadata: Metadata = {
  title: "Food Handler, Alcohol & Compliance Training — Certificate the Moment You Pass",
  description:
    "ANSI-accredited food handler, food manager, alcohol server and HR compliance courses. Pick your state, finish on your phone in about an hour, certificate issued instantly.",
  alternates: { canonical: "/v6" },
  // Internal preview of a home-page design — duplicate content against "/".
  robots: { index: false, follow: true },
  openGraph: {
    title: "The certificate your job needs, issued the moment you pass — Train 321",
    description:
      "Pick your state and see only the courses accepted there. Food, alcohol and HR compliance training from $10.",
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
    getMarketplaceCatalog({ perPage: 500, keepVariants: true })
  ]);

  return (
    <HomeV6
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

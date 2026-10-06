import HomePage from "@/components/HomePage";
import { getMarketplaceCatalog } from "@/lib/newFeatures";
import {
  getCourses,
  getTestimonials,
  getFaqGroups,
  getSiteSettings,
  getHomePage
} from "@/lib/sanity";

export const metadata = {
  // Approved title (Week 1 on-site SEO document, section 4). "Accepted in
  // all 50 states" dropped from the description: acceptance is per course and
  // per state, and the per-state wording is waiting on Christina's list.
  title: "Get Your Food Handler or Alcohol Certificate Online Today",
  description:
    "ANSI-accredited courses for food safety, alcohol service, and HR compliance. Take it on your phone and download your certificate the same day you pass.",
  alternates: { canonical: "/individuals" }
};

export default async function IndividualsPage() {
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
      forcedAudience="self"
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

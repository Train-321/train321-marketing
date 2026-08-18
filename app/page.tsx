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
  title: "Train 321 — Compliance training your team actually finishes",
  description:
    "ANSI-accredited courses for food safety, alcohol service, and HR compliance. Rolled out across your team in under an hour. Accepted in all 50 states."
};

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
        categories: catalog.categories,
        total: catalog.total
      }}
    />
  );
}

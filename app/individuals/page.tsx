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
  title: "Get certified in under an hour — Train321",
  description:
    "ANSI-accredited courses for food safety, alcohol service, and HR compliance. Take it on your phone, get your certificate the same day. Accepted in all 50 states."
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
        categories: catalog.categories,
        total: catalog.total
      }}
    />
  );
}

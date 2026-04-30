import HomePage from "@/components/HomePage";
import {
  getCourses,
  getTestimonials,
  getFaqGroups,
  getSiteSettings
} from "@/lib/sanity";

export const metadata = {
  title: "Get certified in under an hour — Train321",
  description:
    "ANSI-accredited courses for food safety, alcohol service, and HR compliance. Take it on your phone, get your certificate the same day. Accepted in all 50 states."
};

export default async function IndividualsPage() {
  const [courses, testimonials, faqs, settings] = await Promise.all([
    getCourses(),
    getTestimonials(),
    getFaqGroups(),
    getSiteSettings()
  ]);
  const companyStats = settings.companyStats || [];
  return (
    <HomePage
      forcedAudience="self"
      courses={courses}
      testimonials={testimonials}
      faqs={faqs}
      companyStats={companyStats}
    />
  );
}

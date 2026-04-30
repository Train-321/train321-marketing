import HomePage from "@/components/HomePage";
import {
  getCourses,
  getTestimonials,
  getFaqGroups,
  getSiteSettings
} from "@/lib/sanity";

export const metadata = {
  title: "Train321 — Compliance training your team actually finishes",
  description:
    "ANSI-accredited courses for food safety, alcohol service, and HR compliance. Rolled out across your team in under an hour. Accepted in all 50 states."
};

export default async function Page() {
  const [courses, testimonials, faqs, settings] = await Promise.all([
    getCourses(),
    getTestimonials(),
    getFaqGroups(),
    getSiteSettings()
  ]);
  const companyStats = settings.companyStats || [];
  return (
    <HomePage
      forcedAudience={null}
      courses={courses}
      testimonials={testimonials}
      faqs={faqs}
      companyStats={companyStats}
    />
  );
}

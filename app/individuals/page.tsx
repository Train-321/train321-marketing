import HomePage from "@/components/HomePage";
import {
  getCourses,
  getTestimonials,
  getFaqGroups,
  getSiteSettings
} from "@/lib/content";

export const metadata = {
  title: "Get certified in under an hour — Train321",
  description:
    "ANSI-accredited courses for food safety, alcohol service, and HR compliance. Take it on your phone, get your certificate the same day. Accepted in all 50 states."
};

export default function IndividualsPage() {
  const courses = getCourses();
  const testimonials = getTestimonials();
  const faqs = getFaqGroups();
  const companyStats = getSiteSettings().companyStats || [];
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

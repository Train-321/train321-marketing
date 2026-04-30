import HomePage from "@/components/HomePage";
import {
  tinaCourseConnection,
  tinaTestimonialConnection,
  tinaFaqGroupConnection,
  tinaSiteSettings
} from "@/lib/tina";

export const metadata = {
  title: "Get certified in under an hour — Train321",
  description:
    "ANSI-accredited courses for food safety, alcohol service, and HR compliance. Take it on your phone, get your certificate the same day. Accepted in all 50 states."
};

export default async function IndividualsPage() {
  const [coursesRes, testimonialsRes, faqsRes, settingsRes] = await Promise.all([
    tinaCourseConnection(),
    tinaTestimonialConnection(),
    tinaFaqGroupConnection(),
    tinaSiteSettings()
  ]);
  return (
    <HomePage
      forcedAudience="self"
      coursesRes={coursesRes}
      testimonialsRes={testimonialsRes}
      faqsRes={faqsRes}
      settingsRes={settingsRes}
    />
  );
}

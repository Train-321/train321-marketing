import HomePage from "@/components/HomePage";
import {
  tinaCourseConnection,
  tinaTestimonialConnection,
  tinaFaqGroupConnection,
  tinaSiteSettings
} from "@/lib/tina";

export const metadata = {
  title: "Train321 — Compliance training your team actually finishes",
  description:
    "ANSI-accredited courses for food safety, alcohol service, and HR compliance. Rolled out across your team in under an hour. Accepted in all 50 states."
};

export default async function Page() {
  const [coursesRes, testimonialsRes, faqsRes, settingsRes] = await Promise.all([
    tinaCourseConnection(),
    tinaTestimonialConnection(),
    tinaFaqGroupConnection(),
    tinaSiteSettings()
  ]);
  return (
    <HomePage
      forcedAudience={null}
      coursesRes={coursesRes}
      testimonialsRes={testimonialsRes}
      faqsRes={faqsRes}
      settingsRes={settingsRes}
    />
  );
}

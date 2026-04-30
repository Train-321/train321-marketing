import { tinaTestimonialConnection, tinaSiteSettings } from "@/lib/tina";
import TestimonialsClient from "./TestimonialsClient";

export const metadata = {
  title: "Testimonials — Train321",
  description: "What operators say about Train321."
};

export default async function TestimonialsPage() {
  const [testRes, settingsRes] = await Promise.all([
    tinaTestimonialConnection(),
    tinaSiteSettings()
  ]);
  return <TestimonialsClient testRes={testRes} settingsRes={settingsRes} />;
}

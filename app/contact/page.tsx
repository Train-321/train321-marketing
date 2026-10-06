import { getContactPage, getSiteSettings } from "@/lib/sanity";
import ContactClient from "./ContactClient";

export const metadata = {
  title: "Contact Us: Sales & Support",
  description:
    "Questions about a course, a team plan or a certificate? Call 561-325-7300, email info@train321.com or send a message and a real person at Train 321 will reply.",
  alternates: { canonical: "/contact" }
};

export default async function ContactPage() {
  const [page, settings] = await Promise.all([
    getContactPage(),
    getSiteSettings()
  ]);
  return <ContactClient page={page} settings={settings} />;
}

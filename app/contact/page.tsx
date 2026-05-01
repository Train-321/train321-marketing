import { getContactPage, getSiteSettings } from "@/lib/sanity";
import ContactClient from "./ContactClient";

export const metadata = {
  title: "Contact — Train321",
  description: "Talk to a real human at Train321."
};

export default async function ContactPage() {
  const [page, settings] = await Promise.all([
    getContactPage(),
    getSiteSettings()
  ]);
  return <ContactClient page={page} settings={settings} />;
}

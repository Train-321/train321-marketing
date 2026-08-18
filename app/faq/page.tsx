import { getFaqGroups, getFaqPage, getSiteSettings } from "@/lib/sanity";
import FaqClient from "./FaqClient";

export const metadata = {
  title: "FAQ — Train 321",
  description: "Answers to the questions we hear most often."
};

export default async function FaqPage() {
  const [faqs, page, settings] = await Promise.all([
    getFaqGroups(),
    getFaqPage(),
    getSiteSettings()
  ]);
  return <FaqClient faqs={faqs} page={page} settings={settings} />;
}

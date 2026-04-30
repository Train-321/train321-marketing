import { getFaqGroups } from "@/lib/sanity";
import FaqClient from "./FaqClient";

export const metadata = {
  title: "FAQ — Train321",
  description: "Answers to the questions we hear most often."
};

export default async function FaqPage() {
  const faqs = await getFaqGroups();
  return <FaqClient faqs={faqs} />;
}

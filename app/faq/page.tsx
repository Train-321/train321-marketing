import { getFaqGroups } from "@/lib/content";
import FaqClient from "./FaqClient";

export const metadata = {
  title: "FAQ — Train321",
  description: "Answers to the questions we hear most often."
};

export default function FaqPage() {
  const faqs = getFaqGroups();
  return <FaqClient faqs={faqs} />;
}

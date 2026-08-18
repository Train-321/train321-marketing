import { getFaqGroups, getFaqPage, getSiteSettings } from "@/lib/sanity";
import JsonLd from "@/components/JsonLd";
import { plainText } from "@/lib/seo";
import FaqClient from "./FaqClient";

export const metadata = {
  title: "FAQ — Train 321",
  description: "Answers to the questions we hear most often.",
  alternates: { canonical: "/faq" }
};

export default async function FaqPage() {
  const [faqs, page, settings] = await Promise.all([
    getFaqGroups(),
    getFaqPage(),
    getSiteSettings()
  ]);

  // FAQ rich-result schema — every published Q&A, flattened across categories.
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.flatMap((g) =>
      g.items.map((it) => ({
        "@type": "Question",
        name: plainText(it.q),
        acceptedAnswer: { "@type": "Answer", text: plainText(it.a) }
      }))
    )
  };

  return (
    <>
      <JsonLd data={faqLd} />
      <FaqClient faqs={faqs} page={page} settings={settings} />
    </>
  );
}

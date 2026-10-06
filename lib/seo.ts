// Shared SEO constants + JSON-LD builders. Rendered through
// components/JsonLd.tsx on the pages that qualify for rich results.

export const SITE_URL = process.env.SITE_URL || "https://www.train321.com";

export const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Train 321",
  url: SITE_URL,
  logo: `${SITE_URL}/img/logos/train321_logo.png`,
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+1-561-325-7300",
    contactType: "customer service",
    email: "info@train321.com"
  }
};

/** Strip HTML tags and collapse whitespace — JSON-LD text fields must be plain. */
export function plainText(html: string | undefined | null): string {
  return (html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Trim a description to what a search result actually shows (~155 chars),
 * cutting at a word boundary. Course summaries run 200–580 characters; left
 * alone, Google truncates them mid-sentence.
 */
export function clampDescription(text: string | undefined | null, max = 158): string {
  const plain = plainText(text);
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:—–-]+$/, "")}…`;
}

/** BreadcrumbList for a page's trail. Paths are site-relative ("/courses"). */
export function breadcrumbLd(trail: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: `${SITE_URL}${t.path === "/" ? "" : t.path}`
    }))
  };
}

/** FAQPage for a list of visible question/answer pairs. Null when empty. */
export function faqLd(faqs: Array<{ q?: string; a?: string }> | undefined | null) {
  const items = (faqs || []).filter((f) => plainText(f.q) && plainText(f.a));
  if (items.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: plainText(f.q),
      acceptedAnswer: { "@type": "Answer", text: plainText(f.a) }
    }))
  };
}

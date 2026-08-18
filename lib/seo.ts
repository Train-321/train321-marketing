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

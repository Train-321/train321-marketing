import type { Metadata } from "next";
import HomePage from "@/components/HomePage";
import HomeV5 from "@/components/v5/HomeV5";
import JsonLd from "@/components/JsonLd";
import { WEBSITE_LD } from "@/lib/seo";
import { getMarketplaceCatalog } from "@/lib/newFeatures";
import {
  getCourses,
  getTestimonials,
  getFaqGroups,
  getSiteSettings,
  getHomePage
} from "@/lib/sanity";

// The home page is what a bare https://www.train321.com/ link unfurls to on
// WhatsApp, Facebook, LinkedIn, etc. Its title and description are managed in
// Studio (Site Settings → "Search & social sharing"); the strings below only
// show while those fields are empty.
export async function generateMetadata(): Promise<Metadata> {
  const { defaultSeo: seo } = await getSiteSettings();
  return {
    title: seo?.metaTitle || "Online Food Handler, Alcohol & Compliance Training for Restaurants | Train 321",
    description:
      seo?.metaDescription ||
      "ANSI-accredited courses for food safety, alcohol service, and HR compliance. Rolled out across your team in under an hour, with certificates the same day.",
    alternates: { canonical: "/" }
  };
}

// ── TEMPORARY: Halloween promo takeover ──────────────────────────────────
// While the promo is live, the homepage — still at "/" — renders the v5 event
// page with the Halloween bar + decor + 20% off forced on (no redirect, the
// URL stays "/"). It auto-reverts to the normal homepage after the offer ends,
// so it needs no cleanup; to turn it off sooner, delete this constant and the
// `if (promoLive)` block below. The end date mirrors HALLOWEEN.endsAt in
// components/v5/halloween/event.ts.
const HALLOWEEN_HOME_ENDS = Date.parse("2026-11-01T03:59:59Z");

export default async function Page() {
  const promoLive = Date.now() < HALLOWEEN_HOME_ENDS;

  if (promoLive) {
    const [courses, testimonials, faqs, settings, home, catalog] = await Promise.all([
      getCourses(),
      getTestimonials(),
      getFaqGroups(),
      getSiteSettings(),
      getHomePage(),
      // The v5 finder filters by state in the browser, so it needs every variant.
      getMarketplaceCatalog({ perPage: 500, keepVariants: true })
    ]);
    return (
      <HomeV5
        courses={courses}
        testimonials={testimonials}
        faqs={faqs}
        companyStats={settings.companyStats || []}
        trustLogos={settings.trustLogos || []}
        home={home}
        marketplace={{
          courses: catalog.courses,
          groups: catalog.groups,
          categories: catalog.categories,
          total: catalog.total
        }}
        phone={settings.phone || "561-325-7300"}
        email={settings.email || "info@train321.com"}
        forceEvent
      />
    );
  }

  const [courses, testimonials, faqs, settings, home, catalog] = await Promise.all([
    getCourses(),
    getTestimonials(),
    getFaqGroups(),
    getSiteSettings(),
    getHomePage(),
    getMarketplaceCatalog()
  ]);
  return (
    <>
      {/* WebSite node lives on the home page only; Organization is in the layout. */}
      <JsonLd data={WEBSITE_LD} />
      <HomePage
        forcedAudience={null}
        courses={courses}
        testimonials={testimonials}
        faqs={faqs}
        companyStats={settings.companyStats || []}
        trustLogos={settings.trustLogos || []}
        home={home}
        marketplace={{
          courses: catalog.courses,
          groups: catalog.groups,
          categories: catalog.categories,
          total: catalog.total
        }}
      />
    </>
  );
}

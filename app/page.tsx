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

// ── Homepage = the v5 design; Halloween theme follows the promo code ─────
// The homepage — still at "/" — renders the v5 page (no redirect, the URL
// stays "/"). `forceEvent` lets the Halloween theme + offer bar appear here
// WITHOUT ?event=halloween, but only while the HALLOWEEN promo code in the
// LMS is active and not expired (see useHalloween). Deactivate or expire the
// code in Promo Codes and the homepage is plain v5 again — no deploy needed.
// Flip HOME_V5 to false to return to the classic homepage (its render below
// is untouched). The /v5 route itself is unaffected either way.
const HOME_V5 = true;

export default async function Page() {
  if (HOME_V5) {
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
      <>
        {/* WebSite node lives on the home page only; Organization is in the layout. */}
        <JsonLd data={WEBSITE_LD} />
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
      </>
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

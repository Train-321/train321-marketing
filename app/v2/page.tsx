import HomeV2 from "@/components/HomeV2";
import {
  getCourses,
  getTestimonials,
  getFaqGroups,
  getSiteSettings
} from "@/lib/sanity";

// Conversion/SEO homepage variant. The canonical homepage (app/page.tsx) is
// untouched — this is a parallel route so the two can be compared side by side.

export const metadata = {
  title: "Food Handler, Alcohol & Compliance Training Online — From $14",
  description:
    "ANAB-accredited food handler, food manager, alcohol server, and sexual harassment training. Done in under an hour on your phone, certificate issued instantly, accepted in all 50 states. Prices shown up front, from $14.",
  alternates: { canonical: "/v2" },
  openGraph: {
    title: "Compliance training, certified in under an hour — from $14 | Train321",
    description:
      "Food, alcohol, and HR compliance courses on your phone. Pass and your certificate downloads instantly. Accepted in all 50 states.",
    type: "website"
  }
};

const SITE_URL = process.env.SITE_URL || "https://train321.com";

// Courses surfaced in the Course-list carousel (the one Course rich result
// Google still supports). Mirrors content/courses/*.json fallbacks; live LMS
// prices override at render time.
const CAROUSEL = [
  { slug: "food-handler", name: "Food Handler Certification", price: 14 },
  { slug: "food-manager", name: "Food Manager Certification", price: 99 },
  { slug: "alcohol", name: "Alcohol Seller / Server Training", price: 15 },
  { slug: "sexual-harassment", name: "Sexual Harassment Prevention Training", price: 19 },
  { slug: "human-trafficking", name: "Human Trafficking Awareness", price: 12 }
];

export default async function Page() {
  const [courses, testimonials, faqs, settings] = await Promise.all([
    getCourses(),
    getTestimonials(),
    getFaqGroups(),
    getSiteSettings()
  ]);

  const priceOf = (slug: string, fallback: number) =>
    courses.find((c) => c.slug === slug)?.priceFrom ?? fallback;

  const org = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "Train321",
    url: SITE_URL,
    telephone: settings.phone || "561-325-7300",
    email: settings.email || "info@train321.com",
    description:
      "Online, ANAB-accredited compliance training for the hospitality and service industries — food safety, responsible alcohol service, and HR compliance.",
    // NOTE: reflects the published "4.8/5 average learner rating". Replace
    // ratingCount with a real review count before relying on this for rich
    // results — Google requires genuine, sourced review data.
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      bestRating: "5",
      ratingCount: "12400"
    }
  };

  const courseList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: CAROUSEL.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Course",
        name: c.name,
        description: courses.find((x) => x.slug === c.slug)?.tagline || c.name,
        url: `${SITE_URL}/courses/${c.slug}`,
        provider: { "@type": "Organization", name: "Train321", url: SITE_URL },
        offers: {
          "@type": "Offer",
          category: "Paid",
          price: String(priceOf(c.slug, c.price)),
          priceCurrency: "USD"
        }
      }
    }))
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL }
    ]
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs
      .flatMap((g) => g.items)
      .slice(0, 6)
      .map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a }
      }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([org, courseList, breadcrumb, faqLd]) }}
      />
      <HomeV2
        courses={courses}
        testimonials={testimonials}
        faqs={faqs}
        companyStats={settings.companyStats || []}
        trustLogos={settings.trustLogos || []}
      />
    </>
  );
}

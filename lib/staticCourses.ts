import type { Course } from "@/lib/sanity";

// Course detail pages normally come from Sanity. These are code-defined
// fallbacks for courses that don't have a Sanity document yet — the course
// detail route falls back to one of these when Sanity returns nothing for the
// slug, so /courses/<slug> renders the same layout without any CMS change.
//
// Keyed by slug. enrollId is the LMS course the Enroll button adds to the cart
// (and the source of the live "from $X" price), same as a Sanity course's.
/**
 * Resolve the course to render for a slug, merging a Sanity document OVER its
 * code-defined base when one exists.
 *
 * - Slug has no static base (every normal course) → return the Sanity course
 *   untouched.
 * - Slug has a static base (e.g. TABC) and no Sanity doc → pure code version.
 * - Slug has a static base AND a Sanity doc → static is the base and only the
 *   fields the Studio doc actually sets override it. So a minimal TABC document
 *   (title + an uploaded image) adds just the image while the modules, FAQs and
 *   the TABC certificate keep coming from code — instead of a half-empty Studio
 *   doc blanking the page.
 */
export function resolveCourse(slug: string, sanityCourse: Course | null): Course | null {
  const base = STATIC_COURSES[slug];
  if (!base) return sanityCourse;
  if (!sanityCourse) return base;
  const merged: Course = { ...base };
  for (const [key, value] of Object.entries(sanityCourse)) {
    if (value == null) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    if (Array.isArray(value) && value.length === 0) continue;
    (merged as Record<string, unknown>)[key] = value;
  }
  return merged;
}

export const STATIC_COURSES: Record<string, Course> = {
  // Dedicated California RBS sign-up page — a shareable link for individual
  // servers/bartenders. Sells LMS course 692 directly (directEnroll skips the
  // Alcohol Safety group's state picker: the state is already decided), and
  // the cart starts in individual mode for everyone who lands here.
  rbs: {
    slug: "rbs",
    title: "California Responsible Beverage Service (RBS) Training",
    eyebrow: "Alcohol Service · California",
    tagline:
      "The RBS training California servers, bartenders, and managers need before the ABC exam — online, from any device.",
    category: "alcohol",
    color: "amber",
    icon: "fas fa-wine-glass-alt",
    summary:
      "Need to serve alcohol in California? Complete your required Responsible Beverage Service training online from your phone, tablet, or computer. Built for busy servers, bartenders, and managers who need California RBS training before taking the ABC Alcohol Server Certification Exam. When you finish, your completion is reported to California ABC within 24 hours — then you take the ABC exam in the RBS Portal and pass with 70% or higher within 30 days.",
    hero: {
      stats: [
        { value: "Online", label: "Self-paced, any device" },
        { value: "24 hrs", label: "Reported to CA ABC" },
        { value: "70%+", label: "ABC exam pass mark" }
      ]
    },
    outcomes: [
      "Meet California's RBS training requirement for alcohol servers and managers",
      "Check IDs and spot false identification",
      "Recognize signs of intoxication and refuse service responsibly",
      "Walk into the ABC certification exam prepared to pass"
    ],
    accreditations: [
      "Completion reported to California ABC within 24 hours",
      "Take the ABC exam in the RBS Portal after training"
    ],
    certificate: {
      delivery: "Completion reported to California ABC within 24 hours",
      validity: "Per California ABC certification terms",
      accepted: "California Department of Alcoholic Beverage Control (ABC)",
      // RBS certification runs on the ABC's own cycle — the course completion
      // certificate carries no expiration date, so the preview shows none.
      hideExpiration: true
    },
    priceFrom: 15,
    // LMS "California Responsible Beverage Service (RBS) Training" — drives
    // the live price and what the Enroll button adds to the cart.
    enrollId: "692",
    directEnroll: true,
    forceAudience: "individual",
    faqs: [
      {
        q: "Who needs RBS training in California?",
        a: "Anyone who serves alcoholic beverages — or manages people who do — at an ABC-licensed on-premises business needs to be RBS certified."
      },
      {
        q: "What happens after I finish the course?",
        a: "Your completion is reported to California ABC within 24 hours. You then log in to the ABC's RBS Portal and pass the certification exam with a score of 70% or higher within 30 days."
      },
      {
        q: "Can I take it on my phone?",
        a: "Yes — the course works on your phone, tablet, or computer, and your progress saves automatically so you can stop and pick back up anytime."
      }
    ]
  },
  tabc: {
    slug: "tabc",
    title: "TABC Certification",
    eyebrow: "Alcohol Service · Texas",
    tagline: "The Texas seller/server certification, online in about two hours.",
    category: "alcohol",
    color: "amber",
    icon: "fas fa-wine-bottle",
    // No default image. Like every other course, the hero image only appears
    // if the client uploads one in Studio (or sets an Image URL there).
    summary:
      "The TABC-approved seller/server course every Texas bar, restaurant, and store relies on. Learn to check IDs, spot fake identification, recognize intoxication, and refuse a sale the right way — then download your certificate the same day.",
    hero: {
      stats: [
        { value: "~2 hrs", label: "Average time" },
        { value: "Online", label: "Self-paced" },
        { value: "2 yrs", label: "Certificate validity" }
      ]
    },
    outcomes: [
      "Check IDs and spot fake or altered identification",
      "Recognize the signs of intoxication before they become a problem",
      "Refuse a sale calmly and within the law",
      "Understand seller/server liability under Texas law"
    ],
    modules: [
      { title: "Alcohol laws and seller/server responsibility", duration: "25 min" },
      { title: "Checking IDs and spotting fake identification", duration: "30 min" },
      { title: "Recognizing the signs of intoxication", duration: "25 min" },
      { title: "Refusing a sale and handling difficult situations", duration: "20 min" },
      { title: "Final assessment and certificate", duration: "20 min" }
    ],
    accreditations: ["TABC-approved", "Accepted statewide in Texas"],
    certificate: {
      delivery: "Instant download on pass",
      validity: "2 years",
      accepted: "Texas Alcoholic Beverage Commission"
    },
    // Show the TABC seller/server certificate design (with sample data) in the
    // certificate section instead of the generic Train 321 one.
    certificateVariant: "tabc",
    priceFrom: 15,
    // LMS "TABC Seller Server Training" — drives the live price and what the
    // Enroll button adds to the cart. Confirm this id exists in the production
    // LMS before going live; it may differ from staging.
    enrollId: "370",
    faqs: [
      {
        q: "Is this course TABC-approved?",
        a: "Yes — it's an approved seller/server training program, accepted throughout Texas."
      },
      {
        q: "How long does it take?",
        a: "Most people finish in about two hours, and you can stop and pick back up anytime."
      },
      {
        q: "When do I get my certificate?",
        a: "The moment you pass the final, your certificate is ready to download and send to your employer."
      }
    ]
  }
};

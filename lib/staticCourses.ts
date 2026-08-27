import type { Course } from "@/lib/sanity";

// Course detail pages normally come from Sanity. These are code-defined
// fallbacks for courses that don't have a Sanity document yet — the course
// detail route falls back to one of these when Sanity returns nothing for the
// slug, so /courses/<slug> renders the same layout without any CMS change.
//
// Keyed by slug. enrollId is the LMS course the Enroll button adds to the cart
// (and the source of the live "from $X" price), same as a Sanity course's.
export const STATIC_COURSES: Record<string, Course> = {
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

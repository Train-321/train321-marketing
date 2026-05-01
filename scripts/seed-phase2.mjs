// Phase 2 seeder: create all new page singletons with the default copy
// extracted from the original hardcoded files. Safe to re-run — it uses
// createIfNotExists so it won't overwrite edits made in the studio.
//
// Run: node scripts/seed-phase2.mjs

import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
try {
  const txt = readFileSync(resolve(__dirname, "..", ".env"), "utf8");
  for (const line of txt.split(/\r?\n/)) {
    const m = /^([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
} catch {}

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || "production",
  apiVersion: "2025-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false
});

const cta = (label, url, style = "primary") => ({ _type: "callToAction", label, url, style });

const ctaBlock = (heading, lede, primary, secondary) => ({
  _type: "ctaBlock",
  heading,
  lede,
  ...(primary && { primaryCta: cta(primary[0], primary[1], "accent") }),
  ...(secondary && { secondaryCta: cta(secondary[0], secondary[1], "ghost") })
});

const head = (eyebrow, heading, lede, icon) => ({
  _type: "sectionHead",
  ...(eyebrow && { eyebrow }),
  ...(heading && { heading }),
  ...(lede && { lede }),
  ...(icon && { icon })
});

const docs = [
  // ── Contact ─────────────────────────────────────────────────────────────
  {
    _id: "contactPage",
    _type: "contactPage",
    heroEyebrow: "Get in touch",
    heroHeading: "We'd love to hear from you.",
    heroLede: "Real humans. Real answers. Typical reply in under two hours during business hours.",
    tiles: [
      { _key: "call", _type: "labeledTile", icon: "fas fa-phone", title: "Call us", sub: "Mon-Fri · 7am-7pm CT", linkLabel: "PHONE", linkHref: "PHONE" },
      { _key: "email", _type: "labeledTile", icon: "fas fa-envelope", title: "Email us", sub: "Typical reply · under 2 hrs", linkLabel: "EMAIL", linkHref: "EMAIL" },
      { _key: "chat", _type: "labeledTile", icon: "fas fa-comment-dots", title: "Live chat", sub: "Avg wait · 42 sec", linkLabel: "Start a conversation", linkHref: "#" },
      { _key: "faq", _type: "labeledTile", icon: "fas fa-book-open", title: "Browse FAQs", sub: "Certificates, refunds, billing", linkLabel: "50+ answers", linkHref: "/faq" }
    ],
    formHeading: "Send us a message",
    formLede: "Fill out the form below and the right person on our team will pick it up.",
    topicOptions: ["Sales & pricing", "Account support", "Certificate issue", "Billing question", "Custom / white-label", "Press", "Other"],
    submitLabel: "Send message",
    submitSendingLabel: "Message sent",
    successText: "We'll reply within 2 business hours.",
    quickFaqsHead: head("Quick answers", "The things most people ask first", "", "fas fa-question-circle"),
    quickFaqs: [
      { _key: "f1", _type: "quickFaq", q: "I can't log in", a: "Try a password reset first — it sends a link to your email in under a minute. If the email doesn't arrive, check spam, then email support@train321.com with your username and we'll help within 2 business hours." },
      { _key: "f2", _type: "quickFaq", q: "I need a copy of my certificate", a: "Log in to your account and go to Certificates — every certificate you've earned is there as a PDF. If you can't log in, email support@train321.com with the email you used when you enrolled." },
      { _key: "f3", _type: "quickFaq", q: "I enrolled someone by mistake", a: "If the learner hasn't started the course, we can transfer the seat at no cost. Email support@train321.com with both names." },
      { _key: "f4", _type: "quickFaq", q: "I need a receipt for accounting", a: "All receipts are in your dashboard under Billing. For corporate accounts, we also email a monthly summary to your admin contact." }
    ]
  },

  // ── Demo ────────────────────────────────────────────────────────────────
  {
    _id: "demoPage",
    _type: "demoPage",
    heroEyebrow: "Book a walkthrough",
    heroHeading: "See Train321 with your courses already loaded.",
    heroLede: "Pick a 20-minute slot. We'll share a screen, walk through the learner flow, the manager dashboard, and the reporting you'd use on day one — using sample data that matches your operation.",
    heroBullets: ["20-minute live walkthrough", "Real platform, not a slideshow", "Custom pricing quote within 24 hours", "No sales pressure — we just want a fit"],
    formHeading: "Request a time",
    teamSizeOptions: ["1-10", "11-50", "51-200", "201-500", "500+"],
    timeslotOptions: ["Tomorrow morning (9am-12pm CT)", "Tomorrow afternoon (1pm-5pm CT)", "This week — flexible", "Next week — flexible", "Just send me a Calendly link"],
    interestOptions: ["Food Handler", "Food Manager", "Alcohol / TIPS", "Sexual Harassment", "Allergen Awareness", "Custom / SOP"],
    submitLabel: "Book my demo",
    submitSendingLabel: "Request received",
    successText: "Thanks {name} — we'll email you within 2 business hours.",
    disclaimer: "We'll never share your info. Expect a reply from a real human within 2 business hours.",
    agendaHead: head("What we'll cover", "The 20-minute agenda", "", "fas fa-route"),
    agenda: [
      { _key: "a1", _type: "agendaItem", time: "0-3 min", title: "Tell us about your team", desc: "Size, locations, current training vendor, and the compliance deadlines actually on your calendar." },
      { _key: "a2", _type: "agendaItem", time: "3-10 min", title: "Learner flow walkthrough", desc: "We show the actual course, the mobile experience, the auto-save, and the certificate delivery. On a phone, not a mockup." },
      { _key: "a3", _type: "agendaItem", time: "10-15 min", title: "Manager dashboard & reporting", desc: "CSV import, seat assignment, progress filters, and the reports your auditor will ask for — walked end-to-end." },
      { _key: "a4", _type: "agendaItem", time: "15-20 min", title: "Pricing & next steps", desc: "Your volume-discounted quote, your rollout timeline, and whether we're the right fit. If we're not, we'll say so." }
    ],
    faqHead: head("Common questions", "What people ask before the call", "", "fas fa-question-circle"),
    faqs: [
      { _key: "d1", _type: "quickFaq", q: "Do I have to commit to anything on the call?", a: "No. We've built our whole sales process around the answer being \"we'll think about it\" — no contracts, no proposals, no closing pressure on the call. You get a written quote by email; decide in your own time." },
      { _key: "d2", _type: "quickFaq", q: "Can I bring teammates?", a: "Absolutely — most customers bring their ops lead and HR lead. The demo is built for a mixed audience." },
      { _key: "d3", _type: "quickFaq", q: "What if my team is under 10 people?", a: "We'll happily still do a demo, but honestly — most small teams don't need a sales conversation. Go to the catalog, buy what you need, and email us if you hit a snag." },
      { _key: "d4", _type: "quickFaq", q: "Do you sign BAA / DPAs?", a: "Yes. We have a standard DPA ready for EU data and a BAA on request. Both get sent after the demo." },
      { _key: "d5", _type: "quickFaq", q: "How fast can we roll out?", a: "For teams under 100 people: same-day self-serve. For teams 100-1,000: 3-5 business days with CSV import and SSO. For larger rollouts: 2-3 weeks with a named onboarding lead." }
    ],
    bottomCta: ctaBlock(
      "Rather just try it yourself?",
      "Any individual course is buyable in two clicks — no sales call required.",
      ["Browse the catalog", "/catalog"],
      ["Contact sales", "/contact"]
    )
  },

  // ── Services ────────────────────────────────────────────────────────────
  {
    _id: "servicesPage",
    _type: "servicesPage",
    heroEyebrow: "Services",
    heroHeading: "Built for teams of every size.",
    heroLede: "Whether you're a single-location owner training five people or a franchise deploying across hundreds of units, we have a plan — and a set of services — that fits how you actually work.",
    tiers: [
      { _key: "ind", _type: "tier", name: "Individual", audience: "Single learners", price: "From $12", priceSub: "per course", featured: false, features: ["Any course in the catalog", "Instant certificate on pass", "Mobile-friendly course player", "Email support within 2 hours"], ctaLabel: "Browse courses", ctaTo: "/catalog" },
      { _key: "team", _type: "tier", name: "Team", audience: "5-100 seats", price: "From $99/mo", priceSub: "+ per-seat pricing", featured: true, features: ["All courses included", "Manager dashboard & reporting", "CSV learner import", "Volume discounts at 10, 25, 50, 100 seats", "Phone & chat support"], ctaLabel: "Start a team plan", ctaTo: "/enroll" },
      { _key: "biz", _type: "tier", name: "Business", audience: "100+ seats, multi-unit", price: "Custom", priceSub: "annual pricing", featured: false, features: ["Everything in Team", "SSO (Okta, Google, Azure AD)", "SCORM / xAPI export to your LMS", "Custom reporting & API access", "Named customer success manager"], ctaLabel: "Talk to sales", ctaTo: "/contact" }
    ],
    addonsHead: head("Additional services", "Beyond the standard catalog", "For operators with specific needs — branding, reporting integrations, or proprietary SOPs — we offer hands-on professional services.", "fas fa-cogs"),
    addons: [
      { _key: "custom", _type: "pillarCard", icon: "fas fa-sliders-h", tone: "amber", title: "Custom course production", body: "We script, record, and deploy custom courses from your SOPs in 4-6 weeks. You own the content; we host it.", linkLabel: "Learn more", linkHref: "/courses/custom-courses" },
      { _key: "wl", _type: "pillarCard", icon: "fas fa-paint-brush", tone: "plum", title: "White-label deployment", body: "Every course, delivered in your colors, at your URL, with your logo on every certificate.", linkLabel: "Learn more", linkHref: "/courses/white-labeling" },
      { _key: "lic", _type: "pillarCard", icon: "fas fa-id-card", tone: "emerald", title: "Association licensing", body: "State restaurant associations and trade groups license our catalog as the engine behind their member training.", linkLabel: "Learn more", linkHref: "/courses/licensing" },
      { _key: "spec", _type: "pillarCard", icon: "fas fa-plus-circle", tone: "neutral", title: "Specialized training", body: "Cash handling, active-shooter response, data privacy, workplace violence — beyond the core compliance catalog.", linkLabel: "Learn more", linkHref: "/courses/additional-courses" }
    ],
    bottomCta: ctaBlock(
      "Not sure which fits?",
      "Tell us about your team — we'll point you to the right plan (and the discount that applies to your headcount).",
      ["Talk to sales", "/contact"],
      null
    )
  },

  // ── About ───────────────────────────────────────────────────────────────
  {
    _id: "aboutPage",
    _type: "aboutPage",
    heroEyebrow: "Our story",
    heroHeading: "Compliance training shouldn't feel like a tax.",
    heroLede: "We started Train321 in 2018 because the alternatives felt built for lawyers, not for line cooks. Six years later, we've issued over 500,000 certificates to teams who actually finished the course.",
    storyHead: head("The mission", "Make training so good, teams finish it"),
    storyParagraphs: [
      "The hospitality industry spends billions of dollars a year on compliance training that nobody watches. Vendors produce 1997-era slideshows, teams click through on autopilot, and the paperwork gets filed. Then an inspector shows up, and the only thing that's actually changed is a folder full of certificates.",
      "We're building the other thing. Short, direct, written by people who worked the line. Mobile-first because our learners are taking it on their phone between a prep shift and a dinner rush. Updated the day a law changes — not the quarter after.",
      "That's our whole thesis. If we can make training so good that people actually learn from it, compliance takes care of itself."
    ],
    pillarsHead: head("What we believe", "Three things we refuse to compromise on", "", "fas fa-compass"),
    pillars: [
      { _key: "p1", _type: "pillarCard", icon: "fas fa-microscope", tone: "accent", title: "Content accuracy", body: "Every course is written by a subject-matter expert and reviewed annually. When laws change, our courses change the same week. No ghost-written freelance copy; no auto-translated modules." },
      { _key: "p2", _type: "pillarCard", icon: "fas fa-mobile-alt", tone: "warn", title: "Learner experience", body: "If a cook can't finish a course on their phone during prep, we've failed. Every course is playable in 15-minute chunks, saves progress automatically, and works on a $80 Android with a cracked screen." },
      { _key: "p3", _type: "pillarCard", icon: "fas fa-dollar-sign", tone: "positive", title: "Pricing transparency", body: "No \"contact us for pricing.\" No per-feature upsells. You see the price on every course page, volume discounts apply automatically, and unused seats are refundable for 60 days." }
    ],
    teamHead: head("The team", "People behind the platform", "A small team — around 30 of us — split between curriculum, customer success, and engineering. Most of us have worked the line.", "fas fa-user-friends"),
    bottomCta: ctaBlock(
      "Want to see how we work?",
      "Book a 20-minute demo. We'll show you the platform with your courses already loaded.",
      ["Book a demo", "/demo"],
      ["Contact us", "/contact"]
    )
  },

  // ── Blog index ──────────────────────────────────────────────────────────
  {
    _id: "blogIndexPage",
    _type: "blogIndexPage",
    heroEyebrow: "Field notes",
    heroHeading: "The Train321 journal.",
    heroLede: "Compliance updates, operator playbooks, and the lessons we collect from thousands of rollouts — written by the people who run the platform.",
    searchPlaceholder: "Search articles…",
    allCategoryLabel: "All",
    emptyText: "No articles match your filters.",
    recentHead: head("Recent", "More from the journal"),
    newsletter: {
      heading: "One email a month. No fluff.",
      lede: "Compliance updates, operator interviews, and things we learned the hard way. Unsubscribe any time.",
      placeholder: "you@work.com",
      buttonLabel: "Subscribe"
    }
  },

  // ── FAQ ─────────────────────────────────────────────────────────────────
  {
    _id: "faqPage",
    _type: "faqPage",
    heroEyebrow: "Frequently asked",
    heroHeading: "Questions we hear a lot.",
    heroLede: "Can't find what you need? Drop us a line — a real person will reply within 2 business hours.",
    searchPlaceholder: "Search FAQs…",
    categoriesLabel: "Categories",
    emptyText: "No matching questions.",
    bottomCta: ctaBlock(
      "We're here to help.",
      "Email, phone, or live chat — whichever works. Most replies land within 2 business hours.",
      ["Contact support", "/contact"],
      ["561-325-7300", "tel:+15613257300"]
    )
  },

  // ── Catalog ─────────────────────────────────────────────────────────────
  {
    _id: "catalogPage",
    _type: "catalogPage",
    heroEyebrow: "Course library",
    heroHeading: "Every course, one page.",
    heroLede: "Browse our full catalog — courses across food safety, alcohol service, HR compliance, and specialized training.",
    searchPlaceholder: "Search courses…",
    categories: [
      { _key: "all", _type: "categoryDef", id: "all", label: "All", icon: "fas fa-th" },
      { _key: "food", _type: "categoryDef", id: "food", label: "Food safety", icon: "fas fa-utensils" },
      { _key: "alcohol", _type: "categoryDef", id: "alcohol", label: "Alcohol", icon: "fas fa-wine-glass-alt" },
      { _key: "hr", _type: "categoryDef", id: "hr", label: "HR & compliance", icon: "fas fa-users-cog" }
    ],
    sortOptions: ["A-Z", "Z-A", "Price: low to high", "Price: high to low"],
    emptyText: "No courses match your search.",
    clearFiltersLabel: "Clear search & filters",
    bottomCta: ctaBlock(
      "Need something we don't offer?",
      "We build custom courses to your SOPs and brand. Typical delivery in 4-6 weeks.",
      ["Talk to us", "/contact"],
      null
    )
  },

  // ── Testimonials ────────────────────────────────────────────────────────
  {
    _id: "testimonialsPage",
    _type: "testimonialsPage",
    heroEyebrow: "Customer stories",
    heroHeading: "Real words from real operators.",
    heroLede: "We don't write our testimonials. These are emails, calls, and Slack messages from operators running actual restaurants, bars, and multi-unit groups.",
    heroStats: [
      { _key: "s1", _type: "labeledStat", value: "500K+", label: "Certificates issued" },
      { _key: "s2", _type: "labeledStat", value: "97%", label: "Average completion rate" },
      { _key: "s3", _type: "labeledStat", value: "4.8/5", label: "Operator satisfaction" },
      { _key: "s4", _type: "labeledStat", value: "2 hrs", label: "Avg. support reply" }
    ],
    featuredHead: head("Featured", "The one we print on the wall"),
    moreHead: head("Operator voices", "More from the field", "", "fas fa-users"),
    trustHead: head("Trusted by", "Associations and operators who partner with us", "", "fas fa-award"),
    bottomCta: ctaBlock(
      "Want a reference call?",
      "We'll happily introduce you to an operator running Train321 at roughly your scale. No scripts, no pitches — just a peer conversation.",
      ["Request a reference", "/contact"],
      null
    )
  },

  // ── Detail Pages chrome ─────────────────────────────────────────────────
  {
    _id: "detailPagesCopy",
    _type: "detailPagesCopy",
    courseCrumbHome: "Home",
    courseCrumbCourses: "Courses",
    courseEnrollLabel: "Enroll now",
    courseBrowseLabel: "Browse all courses",
    courseGetStartedLabel: "Get started",
    coursePriceFromLabel: "From",
    coursePriceUnitLabel: "per seat",
    coursePriceCustomAmt: "Custom",
    coursePriceCustomUnit: "pricing",
    courseGuarantee: "60-day money-back guarantee on unused seats",
    courseOverviewEyebrow: "Course overview",
    courseOverviewHeading: "What you'll get",
    courseOutcomesHeading: "By the end, you'll be able to",
    courseCurriculumEyebrow: "Curriculum",
    courseCurriculumHeading: "Inside the course",
    courseCurriculumLedeTpl: "{n} modules — self-paced, with progress that saves automatically.",
    courseCertEyebrow: "Your certificate",
    courseCertHeading: "Official, instant, accepted",
    courseCertVisualHead: "Certificate of Completion",
    courseCertVisualMeta: "Train321 · ANSI-accredited",
    courseCertDeliveryLabel: "Delivery",
    courseCertValidityLabel: "Validity",
    courseCertAcceptedLabel: "Accepted by",
    courseFaqEyebrow: "FAQ",
    courseFaqHeading: "Common questions",
    courseBottomCta: ctaBlock(
      "Ready to get your team certified?",
      "Buy seats in under a minute. Invite learners by email or CSV. Track completion from a single dashboard.",
      ["Enroll now", "/enroll"],
      ["See a demo", "/demo"]
    ),
    blogCrumbJournal: "Journal",
    blogShareLabel: "Share",
    blogReadingMinSuffix: "min read",
    blogAuthorOrgSuffix: "Train321",
    blogRelatedHead: head("Keep reading", "More in the journal"),
    blogRelatedReadLabel: "Read article",
    blogBottomCta: ctaBlock(
      "Ready to see the platform?",
      "Book a 20-minute walkthrough with a real human. No slides, no pressure.",
      ["Book a demo", "/demo"],
      ["Browse courses", "/catalog"]
    ),
    legalCrumbHome: "Home",
    legalEyebrow: "Policy",
    legalEffectivePrefix: "Effective",
    legalTocLabel: "On this page"
  }
];

// ── HomePage extension (audience copy + pillars + sections) ────────────────
const homePagePatch = {
  audienceTeam: {
    _type: "object",
    eyebrow: "The faster way to certified staff",
    h1Pre: "Compliance training your team",
    h1Em: "actually finishes.",
    lede: "ANSI-accredited courses for food safety, alcohol service, and HR compliance. Rolled out across your whole team in under an hour. Accepted in all 50 states.",
    ctaPrimary: cta("Browse courses", "/catalog", "primary"),
    ctaGhost: cta("Watch a 2-minute demo", "/demo", "ghost"),
    trustLabel: "Trusted by state restaurant associations and multi-unit operators nationwide",
    stepsTitle: "Certified in under an hour of your time",
    stepsLede: "Three steps. Your team does most of the work on their phones during prep.",
    steps: [
      { _key: "t1", _type: "howItWorksStep", title: "Pick your courses", body: "Browse the catalog, choose seat counts. Volume pricing kicks in automatically at 10, 25, 50, and 100 seats." },
      { _key: "t2", _type: "howItWorksStep", title: "Invite your team", body: "Add learners one at a time or upload a CSV. Every learner gets a personal link and can start the same day." },
      { _key: "t3", _type: "howItWorksStep", title: "Track completion", body: "Your dashboard shows who's done, who's in progress, and who hasn't started. Certificates auto-issue on pass." }
    ],
    bottomTitle: "Ready to get your team certified?",
    bottomLede: "You're less than an hour away. Pick your courses, add your team, start today.",
    bottomCtaSecondary: cta("Talk to sales", "/contact", "ghost")
  },
  audienceSelf: {
    _type: "object",
    eyebrow: "Get certified on your phone, on your schedule",
    h1Pre: "Get certified",
    h1Em: "in under an hour.",
    lede: "ANSI-accredited courses for food safety, alcohol service, and HR compliance. Take it on your phone, get your certificate the same day. Accepted in all 50 states.",
    ctaPrimary: cta("Find my course", "/catalog", "primary"),
    ctaGhost: cta("See how it works", "/demo", "ghost"),
    trustLabel: "Accepted by employers and health departments in all 50 states",
    stepsTitle: "Certified in under an hour",
    stepsLede: "Three steps. Most people finish in one sitting on their phone.",
    steps: [
      { _key: "s1", _type: "howItWorksStep", title: "Pick your course", body: "Tell us your state and what your job needs. We'll show you exactly the right course — no guesswork." },
      { _key: "s2", _type: "howItWorksStep", title: "Take it on your phone", body: "Short video lessons, mobile-first. Pause whenever, pick up where you left off. Most people finish in one sitting." },
      { _key: "s3", _type: "howItWorksStep", title: "Get your certificate", body: "Pass the final and your certificate downloads instantly. Email it to your employer the same day." }
    ],
    bottomTitle: "Ready to get certified?",
    bottomLede: "You're less than an hour away. Pick your course, take it on your phone, certificate today.",
    bottomCtaSecondary: cta("Have questions?", "/contact", "ghost")
  },
  heroTrustPills: [
    { _key: "tp1", _type: "trustPill", icon: "fas fa-shield-alt", label: "ANSI-accredited" },
    { _key: "tp2", _type: "trustPill", icon: "fas fa-flag-usa", label: "Accepted in 50 states" },
    { _key: "tp3", _type: "trustPill", icon: "fas fa-bolt", label: "Instant certificate" }
  ],
  pillarsHead: head("What we do", "Three categories. One platform.", "Everything compliance-sensitive in the hospitality and service industries — under one login, one dashboard, one invoice.", "fas fa-tag"),
  pillars: [
    { _key: "ph1", _type: "pillarCard", icon: "fas fa-utensils", tone: "amber", title: "Food safety", body: "Food Handler, Food Manager, accredited variants. Accepted by every state health department.", linkLabel: "Browse food safety", linkHref: "/food-handler" },
    { _key: "ph2", _type: "pillarCard", icon: "fas fa-wine-glass-alt", tone: "plum", title: "Alcohol & service", body: "TIPS-equivalent alcohol server training plus bar basics, service basics, and security host.", linkLabel: "Browse alcohol & service", linkHref: "/alcohol" },
    { _key: "ph3", _type: "pillarCard", icon: "fas fa-users-cog", tone: "emerald", title: "HR & compliance", body: "Sexual harassment (state-specific), human trafficking, and practical HR for managers.", linkLabel: "Browse HR & compliance", linkHref: "/human-resources" }
  ],
  popularHead: head("Most enrolled", "Popular courses", "The courses most operators start with. Click any to see details or enroll now.", "fas fa-fire"),
  popularCtaLabel: "Browse the full catalog",
  popularSlugs: ["food-handler", "alcohol", "sexual-harassment", "food-manager"],
  howHead: head("How it works", "", "", "fas fa-magic"),
  opinionsHead: head("What operators say", "Real quotes from real customers", "", "fas fa-quote-right"),
  opinionsLinkLabel: "Read more stories",
  faqTeaserHead: head("Frequently asked", "Questions we hear a lot", "Quick answers to the things most buyers ask us. More detail on our FAQ page.", "fas fa-question-circle"),
  faqTeaserCtaLabel: "See all questions",
  bottomCta: ctaBlock(
    "Ready to get your team certified?",
    "You're less than an hour away. Pick your courses, add your team, start today.",
    ["Browse courses", "/catalog"],
    ["Talk to sales", "/contact"]
  )
};

async function main() {
  console.log("Seeding page singletons (createIfNotExists — won't overwrite edits)...");
  for (const doc of docs) {
    await client.createIfNotExists(doc);
    console.log(`  ✓ ${doc._id}`);
  }

  console.log("\nPatching homePage with new fields (only if missing)...");
  await client
    .patch("homePage")
    .setIfMissing(homePagePatch)
    .commit();
  console.log("  ✓ homePage extended");

  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

// One-off: load the title tags and meta descriptions approved from the
// "Train 321 Week 1 - On-Site SEO" document (28 Sept 2026, section 4) into
// Studio, so editors own them from here on. Prices were left out of the
// titles on Christina's instruction (6 Oct 2026).
//
// Course titles/descriptions go into each course's SEO tab and are only
// written where the field is still empty — an editor's own value is never
// overwritten. The home H1, catalog H1 and site title are replaced outright,
// since the document called those out as slogans to rewrite.
//
//   node scripts/seo-titles-2026-10.mjs           # dry run: prints what would change
//   node scripts/seo-titles-2026-10.mjs --apply   # writes to Sanity
//
// Needs SANITY_PROJECT_ID / SANITY_DATASET / SANITY_WRITE_TOKEN (.env).

import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";

for (const f of [".env", ".env.local"]) {
  try {
    for (const line of readFileSync(f, "utf8").split("\n")) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
    }
  } catch {}
}

const APPLY = process.argv.includes("--apply");
const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || "production",
  apiVersion: "2025-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false
});

const BRAND = " | Train 321";

// slug → [title (without brand), description]. Descriptions keep the
// keyword in the first ~90 characters and run 140–160 in total.
const COURSES = {
  "food-handler": [
    "Food Handler Card Online – ANSI-Accredited, Same-Day Certificate",
    "Food handler card online from Train 321: an ANAB-accredited course on hygiene, safe temperatures, allergens and cross-contamination. Certificate when you pass."
  ],
  "food-manager": [
    "Food Manager Certification Online – ANAB-Accredited, Valid 5 Years",
    "Prepare for the ANAB-accredited Food Manager Certification exam online: video lessons, study materials, a 300-question practice test and a proctored exam."
  ],
  alcohol: [
    "Alcohol Server Training Online – Same-Day Certificate",
    "Alcohol server training online: spot fake IDs, recognize intoxication and refuse a sale the right way, with the laws and liability behind each."
  ],
  rbs: [
    "California RBS Certification Online – ABC-Approved Provider",
    "California RBS training online from an approved ABC provider. Completion reported to California ABC within 24 hours, then take the ABC exam in the RBS Portal."
  ],
  tabc: [
    "TABC Certification Online – Texas Seller-Server Course, TABC-Approved",
    "TABC certification online: the Texas seller-server course for anyone who sells or serves alcohol. About two hours, resume anytime, certificate when you pass."
  ],
  "sexual-harassment": [
    "Sexual Harassment Prevention Training Online – CA/NY/IL/CT/DE Compliant",
    "Sexual harassment prevention training online for restaurants, pre-configured for CA, NY, IL, CT and DE mandates. Employee and supervisor versions."
  ],
  "california-sexual-harassment": [
    "California Sexual Harassment Training Online – SB 1343 Compliant, 1 & 2 Hour",
    "California sexual harassment training online that satisfies SB 1343: 1 hour for employees, 2 hours for supervisors, every two years."
  ],
  "illinois-sexual-harassment": [
    "Illinois Sexual Harassment Training Online – Annual, Includes the Restaurant Rule",
    "Illinois sexual harassment training online for every Illinois employer: the annual SHPA requirement plus the restaurant supplement, in one course."
  ],
  "new-york-sexual-harassment": [
    "New York Sexual Harassment Training Online – State & NYC Compliant",
    "New York sexual harassment training online meeting the State's annual requirement and the NYC Stop Sexual Harassment Act, bystander content included."
  ],
  "human-trafficking": [
    "Human Trafficking Awareness Training for Hotels & Restaurants – FL, CA, TX",
    "Human trafficking awareness training for hotels and restaurants: recognize trafficking, respond safely and report. Satisfies FL, CA, TX and CT mandates."
  ],
  "security-host": [
    "Security Host & Door Host Training Online",
    "Security host and door host training online for bars, clubs and venues: de-escalation, crowd management and lawful refusal that protect guests and the license."
  ],
  "bar-basics": [
    "Bar Basics: Bartender & Barback Training Online",
    "Bar Basics: online training for new bartenders and barbacks, from stocking the well to closing the books. Pairs with Alcohol Safety for full compliance."
  ],
  "service-basics": [
    "Restaurant Server Training Online – Service Basics Course",
    "Restaurant server training online: greeting, table management, upselling without pushing, handling complaints and running a busy section."
  ],
  "safety-basics": [
    "Restaurant Workplace Safety Training Online – Safety Basics",
    "Restaurant workplace safety training online, OSHA-aligned: slips, burns, lifts, knife cuts, fires and first aid, built around real restaurant incidents."
  ],
  "human-resources": [
    "HR Training for Restaurant Managers Online",
    "HR training for restaurant managers online: hiring, discipline, documentation, wage-and-hour rules and the discrimination blind spots that cost money."
  ],
  "additional-courses": [
    "Restaurant Compliance Courses: Active Shooter, OSHA Signs, Cash Handling",
    "Restaurant compliance courses beyond the core catalog: active-shooter response, cash handling, PCI basics, workplace violence prevention, data privacy."
  ],
  "custom-courses": [
    "Custom Training Courses for Restaurants & Hospitality Brands",
    "Custom training courses for restaurants and hospitality brands: scripted, recorded, assessed and hosted on our LMS from your SOPs. Ships in 4–6 weeks."
  ]
  // california-alcohol-safety-training: deliberately absent — the document
  // left it pending Christina's answer on whether it is a separate product
  // or should redirect to /courses/rbs.
};

const SITE_TITLE = "Online Food Handler, Alcohol & Compliance Training for Restaurants" + BRAND;
const CATALOG_H1 = "Every Train 321 Course, by State";
// The hero H1 is split into a plain part and an italic part in Studio.
const HOME_H1 = {
  // "For myself" is the default view, so it carries the document's H1.
  audienceSelf: { h1Pre: "Online Food Handler, Alcohol & Compliance Training", h1Em: "for Restaurants." },
  audienceTeam: { h1Pre: "Online Compliance Training", h1Em: "for Restaurant Teams." }
};

const docs = await client.fetch(
  `*[_type == "course" || _id in ["homePage","drafts.homePage","catalogPage","drafts.catalogPage","siteSettings","drafts.siteSettings"]]{
    _id, _type, "slug": slug.current, seo, heroHeading, defaultSeo, audienceSelf, audienceTeam
  }`
);

for (const [slug, [, description]] of Object.entries(COURSES)) {
  if (description.length > 160) throw new Error(`${slug}: description is ${description.length} chars (max 160)`);
}

const tx = client.transaction();
let changes = 0;
const log = (id, field, from, to) => {
  changes++;
  console.log(`${id}\n  ${field}: ${JSON.stringify(from ?? null)}\n   → ${JSON.stringify(to)}`);
};

for (const d of docs) {
  if (d._type === "course") {
    const entry = COURSES[d.slug];
    if (!entry) continue;
    const [title, description] = entry;
    const p = client.patch(d._id).setIfMissing({ seo: { _type: "seo" } });
    let touched = false;
    if (!d.seo?.metaTitle) {
      p.setIfMissing({ "seo.metaTitle": title + BRAND });
      log(d._id, "seo.metaTitle", d.seo?.metaTitle, title + BRAND);
      touched = true;
    }
    if (!d.seo?.metaDescription) {
      p.setIfMissing({ "seo.metaDescription": description });
      log(d._id, `seo.metaDescription (${description.length} chars)`, d.seo?.metaDescription, description);
      touched = true;
    }
    if (touched) tx.patch(p);
  } else if (d._id.endsWith("siteSettings")) {
    if (d.defaultSeo?.metaTitle !== SITE_TITLE) {
      tx.patch(client.patch(d._id).set({ "defaultSeo.metaTitle": SITE_TITLE }));
      log(d._id, "defaultSeo.metaTitle", d.defaultSeo?.metaTitle, SITE_TITLE);
    }
  } else if (d._id.endsWith("catalogPage")) {
    if (d.heroHeading !== CATALOG_H1) {
      tx.patch(client.patch(d._id).set({ heroHeading: CATALOG_H1 }));
      log(d._id, "heroHeading", d.heroHeading, CATALOG_H1);
    }
  } else if (d._id.endsWith("homePage")) {
    const set = {};
    for (const aud of ["audienceSelf", "audienceTeam"]) {
      for (const k of ["h1Pre", "h1Em"]) {
        if (d[aud]?.[k] !== HOME_H1[aud][k]) {
          set[`${aud}.${k}`] = HOME_H1[aud][k];
          log(d._id, `${aud}.${k}`, d[aud]?.[k], HOME_H1[aud][k]);
        }
      }
    }
    if (Object.keys(set).length) tx.patch(client.patch(d._id).set(set));
  }
}

const missing = Object.keys(COURSES).filter((s) => !docs.some((d) => d.slug === s));
if (missing.length) console.log("No Sanity document for:", missing.join(", "));

if (!changes) {
  console.log("Nothing to change.");
} else if (APPLY) {
  await tx.commit();
  console.log(`\nApplied ${changes} field changes.`);
} else {
  console.log(`\nDry run: ${changes} field changes. Re-run with --apply to write them.`);
}

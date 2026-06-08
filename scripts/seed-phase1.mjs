// Phase 1 seeder: extend siteSettings with footer columns, footer tagline,
// support email, newsletter copy, and trust logos (image upload).
// Also seed homePage with default hero copy.
//
// Run: node scripts/seed-phase1.mjs
// Requires SANITY_PROJECT_ID, SANITY_DATASET, SANITY_WRITE_TOKEN in env.

import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import https from "node:https";
import http from "node:http";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env");
try {
  const txt = readFileSync(envPath, "utf8");
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

// Logos used by the home-page carousel (was hardcoded in HomePage.tsx).
const TRUST_LOGOS = [
  { name: "California Restaurant Association", label: "California Restaurant Association",
    src: "https://www.calrest.org/sites/default/themes/dtheme/img/calrest-logo.svg" },
  { name: "Delaware Restaurant Association", label: "Delaware Restaurant Association",
    src: "https://dra.train321.com/img/logos/dra_logo.png" },
  { name: "Massachusetts Restaurant Association", label: "Massachusetts Restaurant Association",
    src: "https://www.train321.com/images/logos/MRA.png" },
  { name: "Oregon Restaurant & Lodging Association", label: "Oregon Restaurant & Lodging Association",
    src: "https://www.train321.com/images/logos/orla.png" },
  { name: "New Mexico Restaurant Association", label: "New Mexico Restaurant Association",
    src: "https://www.train321.com/images/logos/nmra.png" },
  { name: "Denny's", label: "Denny's",
    src: "https://companieslogo.com/img/orig/DENN_BIG-c9a931d8.png?t=1720244491" },
  { name: "Jack in the Box", label: "Jack in the Box",
    src: "https://www.train321.com/images/logos/jack-in-the-box.png" },
  { name: "Taco Cabana", label: "Taco Cabana",
    src: "https://tacocabana.train321.com/taco-cabana.png" }
];

function fetchBuf(url) {
  return new Promise((resolveP, reject) => {
    const lib = url.startsWith("https") ? https : http;
    lib
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchBuf(res.headers.location).then(resolveP, reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolveP(Buffer.concat(chunks)));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

async function uploadLogo(logo) {
  console.log(`  fetching ${logo.src}`);
  let buf;
  try {
    buf = await fetchBuf(logo.src);
  } catch (e) {
    console.warn(`  ! failed (${e.message}); skipping image, name only`);
    return { name: logo.name, label: logo.label };
  }
  const ext = logo.src.toLowerCase().endsWith(".svg") ? "svg" : logo.src.split(".").pop().split("?")[0];
  const filename = `${logo.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.${ext}`;
  const asset = await client.assets.upload("image", buf, { filename });
  return {
    _key: logo.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    _type: "trustLogo",
    name: logo.name,
    label: logo.label,
    image: { _type: "image", asset: { _type: "reference", _ref: asset._id } }
  };
}

async function main() {
  console.log("Uploading trust logos...");
  const logos = [];
  for (const l of TRUST_LOGOS) {
    try {
      logos.push(await uploadLogo(l));
    } catch (e) {
      console.warn(`  ! ${l.name}: ${e.message}`);
    }
  }
  console.log(`  uploaded ${logos.length} logos`);

  console.log("\nPatching siteSettings...");
  const settingsPatch = {
    supportEmail: "support@train321.com",
    footerTagline:
      "Compliance training your team will actually finish. Built for restaurants, retailers, and service businesses that need certified staff — without the hassle.",
    social: {
      facebook: "https://facebook.com/train321",
      twitter: "https://twitter.com/train321",
      linkedin: "https://www.linkedin.com/company/train321",
      instagram: "https://instagram.com/train321",
      youtube: "https://youtube.com/@train321"
    },
    footerColumns: [
      {
        _key: "company",
        _type: "footerColumn",
        title: "Company",
        links: [
          { _key: "about", _type: "navLink", label: "About", href: "/about" },
          { _key: "testimonials", _type: "navLink", label: "Testimonials", href: "/testimonials" },
          { _key: "blog", _type: "navLink", label: "Journal", href: "/blog" },
          { _key: "contact", _type: "navLink", label: "Contact", href: "/contact" }
        ]
      },
      {
        _key: "support",
        _type: "footerColumn",
        title: "Support",
        links: [
          { _key: "faq", _type: "navLink", label: "FAQ", href: "/faq" },
          { _key: "demo", _type: "navLink", label: "Book a demo", href: "/demo" },
          { _key: "catalog", _type: "navLink", label: "Catalog", href: "/catalog" },
          { _key: "services", _type: "navLink", label: "Pricing", href: "/services" }
        ]
      }
    ],
    footerLegalLinks: [
      { _key: "terms", _type: "navLink", label: "Terms", href: "/legal/terms" },
      { _key: "privacy", _type: "navLink", label: "Privacy", href: "/legal/privacy" },
      { _key: "accessibility", _type: "navLink", label: "Accessibility", href: "/legal/accessibility" }
    ],
    newsletter: {
      _type: "newsletter",
      heading: "Stay in the loop",
      sub: "Monthly tips on compliance deadlines, state-law changes, and training ROI.",
      placeholder: "you@work.com",
      buttonLabel: "Subscribe",
      successText: "Thanks — you're on the list."
    },
    trustLogos: logos
  };

  await client
    .patch("siteSettings")
    .setIfMissing({ siteName: "Train321" })
    .set(settingsPatch)
    .commit();
  console.log("  siteSettings patched");

  console.log("\nSeeding homePage hero (only if missing)...");
  await client
    .createIfNotExists({
      _id: "homePage",
      _type: "homePage",
      heroEyebrow: "The faster way to certified staff",
      heroHeadline: "Compliance training your team actually finishes.",
      heroSubcopy:
        "ANSI-accredited courses for food safety, alcohol service, and HR compliance. Rolled out across your whole team in under an hour. Accepted in all 50 states.",
      heroPrimaryCta: { _type: "callToAction", label: "Browse courses", url: "/catalog", style: "primary" },
      heroSecondaryCta: { _type: "callToAction", label: "Watch a 2-minute demo", url: "/demo", style: "ghost" }
    });
  console.log("  homePage ensured");

  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

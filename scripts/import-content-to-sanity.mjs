// One-shot import: content/<collection>/*.{json,md} -> Sanity dataset.
// Run: node scripts/import-content-to-sanity.mjs
// Reads SANITY_PROJECT_ID, SANITY_DATASET, SANITY_WRITE_TOKEN from .env

import { createClient } from "@sanity/client";
import matter from "gray-matter";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, basename } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// Load .env
const env = Object.fromEntries(
  readFileSync(resolve(root, ".env"), "utf8")
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const projectId = env.SANITY_PROJECT_ID;
const dataset = env.SANITY_DATASET || "production";
const token = env.SANITY_WRITE_TOKEN;

if (!projectId || !token) {
  console.error("Missing SANITY_PROJECT_ID or SANITY_WRITE_TOKEN in .env");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2025-01-01",
  token,
  useCdn: false
});

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Parse markdown body into typed body blocks (reverse of the migration that
// flattened typed blocks to standard markdown).
function markdownToBlocks(md) {
  const blocks = [];
  let i = 0;
  const lines = md.split("\n");

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }

    // Heading
    const h2 = line.match(/^##\s+(.+)$/);
    const h3 = line.match(/^###\s+(.+)$/);
    if (h2) {
      blocks.push({ _type: "blockHeading2", _key: `b${blocks.length}`, content: h2[1].trim() });
      i++;
      continue;
    }
    if (h3) {
      blocks.push({ _type: "blockHeading3", _key: `b${blocks.length}`, content: h3[1].trim() });
      i++;
      continue;
    }

    // Blockquote (callout if starts with 💡, else quote)
    if (line.startsWith(">")) {
      const text = line.replace(/^>\s*/, "").trim();
      if (text.startsWith("💡")) {
        blocks.push({
          _type: "blockCallout",
          _key: `b${blocks.length}`,
          content: text.replace(/^💡\s*/, "").trim()
        });
      } else {
        blocks.push({ _type: "blockQuote", _key: `b${blocks.length}`, content: text });
      }
      i++;
      continue;
    }

    // Bullet list
    if (line.match(/^[-*]\s+/)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^[-*]\s+/)) {
        items.push(lines[i].replace(/^[-*]\s+/, "").trim());
        i++;
      }
      blocks.push({ _type: "blockBulletList", _key: `b${blocks.length}`, content: items });
      continue;
    }

    // Numbered list
    if (line.match(/^\d+\.\s+/)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s+/)) {
        items.push(lines[i].replace(/^\d+\.\s+/, "").trim());
        i++;
      }
      blocks.push({ _type: "blockOrderedList", _key: `b${blocks.length}`, content: items });
      continue;
    }

    // Paragraph (collect contiguous non-empty lines)
    const paraLines = [];
    while (i < lines.length && lines[i].trim() && !lines[i].match(/^(##|>|[-*]\s|\d+\.\s)/)) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length) {
      blocks.push({
        _type: "blockParagraph",
        _key: `b${blocks.length}`,
        content: paraLines.join(" ").trim()
      });
    }
  }
  return blocks;
}

const withKeys = (arr, prefix) =>
  (arr || []).map((item, i) => ({ ...item, _key: `${prefix}${i}` }));

function readJSON(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function readMD(file) {
  const raw = readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  return { ...data, body: content };
}

async function importAll() {
  const tx = client.transaction();
  let count = 0;

  // ── siteSettings ────────────────────────────────────────────────────
  const site = readJSON(resolve(root, "content/site/index.json"));
  tx.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    siteName: site.siteName,
    tagline: site.tagline,
    phone: site.phone,
    email: site.email,
    social: site.social,
    companyStats: withKeys(site.companyStats, "cs"),
    trustLogos: withKeys(site.trustLogos, "tl")
  });
  count++;

  // ── courses ──────────────────────────────────────────────────────────
  const courseDir = resolve(root, "content/courses");
  for (const f of readdirSync(courseDir)) {
    if (!f.endsWith(".json")) continue;
    const c = readJSON(resolve(courseDir, f));
    const slug = basename(f, ".json");
    tx.createOrReplace({
      _id: `course-${slug}`,
      _type: "course",
      title: c.title,
      slug: { _type: "slug", current: slug },
      eyebrow: c.eyebrow ?? null,
      tagline: c.tagline ?? null,
      category: c.category ?? null,
      color: c.color ?? null,
      icon: c.icon ?? null,
      imageUrl: c.image ?? null,
      summary: c.summary ?? null,
      heroStats: withKeys(c.hero?.stats, "hs"),
      outcomes: c.outcomes ?? [],
      modules: withKeys(c.modules, "m"),
      accreditations: c.accreditations ?? [],
      certificate: c.certificate
        ? {
            _type: "certificateInfo",
            delivery: c.certificate.delivery ?? null,
            validity: c.certificate.validity ?? null,
            accepted: c.certificate.accepted ?? null
          }
        : null,
      priceFrom: c.priceFrom ?? null,
      priceNote: c.priceNote ?? null,
      faqs: withKeys(c.faqs, "f"),
      enrollId: c.enrollId ?? null
    });
    count++;
  }

  // ── faqItems (flatten faq groups) ────────────────────────────────────
  const faqDir = resolve(root, "content/faqs");
  let faqGroupIndex = 0;
  for (const f of readdirSync(faqDir).sort()) {
    if (!f.endsWith(".json")) continue;
    const group = readJSON(resolve(faqDir, f));
    group.items.forEach((item, ii) => {
      tx.createOrReplace({
        _id: `faq-${slugify(group.category)}-${ii}`,
        _type: "faqItem",
        question: item.q,
        answer: item.a,
        category: group.category,
        categoryOrder: group.order ?? faqGroupIndex,
        order: ii
      });
      count++;
    });
    faqGroupIndex++;
  }

  // ── blog posts ───────────────────────────────────────────────────────
  const blogDir = resolve(root, "content/blog");
  for (const f of readdirSync(blogDir)) {
    if (!f.endsWith(".md")) continue;
    const p = readMD(resolve(blogDir, f));
    const slug = basename(f, ".md");
    tx.createOrReplace({
      _id: `blogPost-${slug}`,
      _type: "blogPost",
      title: p.title,
      slug: { _type: "slug", current: slug },
      excerpt: p.excerpt ?? null,
      category: p.category ?? null,
      authorName: p.author?.name ?? null,
      authorRole: p.author?.role ?? null,
      publishedAt: p.publishedAt ? new Date(p.publishedAt).toISOString() : null,
      readMinutes: p.readMinutes ?? null,
      heroTone: p.heroTone ?? null,
      heroIcon: p.heroIcon ?? null,
      body: markdownToBlocks(p.body)
    });
    count++;
  }

  // ── legal pages ──────────────────────────────────────────────────────
  // The flattened markdown lost the section structure. We reconstruct
  // sections by splitting on `##` h2 headings. Each section becomes
  // { heading, blocks: [...rest until next h2...] }.
  const legalDir = resolve(root, "content/legal");
  for (const f of readdirSync(legalDir)) {
    if (!f.endsWith(".md")) continue;
    const lp = readMD(resolve(legalDir, f));
    const slug = basename(f, ".md");

    const sections = [];
    let current = null;
    for (const line of lp.body.split("\n")) {
      const h2 = line.match(/^##\s+(.+)$/);
      if (h2) {
        if (current) sections.push(current);
        current = { heading: h2[1].trim(), bodyLines: [] };
      } else if (current) {
        current.bodyLines.push(line);
      }
    }
    if (current) sections.push(current);

    tx.createOrReplace({
      _id: `legalPage-${slug}`,
      _type: "legalPage",
      title: lp.title,
      slug: { _type: "slug", current: slug },
      effectiveDate: lp.effectiveDate
        ? new Date(lp.effectiveDate).toISOString().slice(0, 10)
        : null,
      intro: lp.intro ?? null,
      sections: sections.map((s, i) => ({
        _type: "legalSection",
        _key: `s${i}`,
        heading: s.heading,
        blocks: markdownToBlocks(s.bodyLines.join("\n").trim())
      }))
    });
    count++;
  }

  // ── team members ─────────────────────────────────────────────────────
  const teamDir = resolve(root, "content/team");
  for (const f of readdirSync(teamDir)) {
    if (!f.endsWith(".json")) continue;
    const m = readJSON(resolve(teamDir, f));
    tx.createOrReplace({
      _id: `team-${slugify(m.name)}`,
      _type: "teamMember",
      name: m.name,
      role: m.role ?? null,
      bio: m.bio ?? null,
      linkedin: m.linkedin ?? null,
      twitter: m.twitter ?? null,
      order: m.order ?? 0
    });
    count++;
  }

  // ── testimonials ─────────────────────────────────────────────────────
  const testimonialDir = resolve(root, "content/testimonials");
  for (const f of readdirSync(testimonialDir)) {
    if (!f.endsWith(".json")) continue;
    const t = readJSON(resolve(testimonialDir, f));
    const id = basename(f, ".json");
    tx.createOrReplace({
      _id: `testimonial-${id}`,
      _type: "testimonial",
      quote: t.quote,
      name: t.name,
      role: t.role ?? null,
      company: t.company ?? null,
      stat: t.stat
        ? { _type: "testimonialStat", value: t.stat.value, label: t.stat.label }
        : null,
      featured: t.featured ?? false,
      order: t.order ?? 0
    });
    count++;
  }

  console.log(`Committing ${count} documents…`);
  const result = await tx.commit();
  console.log(`✓ Imported ${result.results.length} documents to Sanity (${dataset})`);
}

importAll().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});

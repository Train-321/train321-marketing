// Migrate assets/data/*.js → content/<collection>/*.{json,md}
// Run with: node scripts/migrate-to-content.mjs
// Reads source modules by copying them to a temporary .mjs file (since the
// project package.json has no "type":"module"), then imports dynamically.

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "assets", "data");
const OUT = path.join(ROOT, "content");

// ─── Helpers ──────────────────────────────────────────────────────────────

async function importAsModule(srcFile) {
  // Copy to a tmp .mjs path, then dynamic import.
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "t321-migrate-"));
  const tmpFile = path.join(tmpDir, path.basename(srcFile, ".js") + ".mjs");
  fs.copyFileSync(srcFile, tmpFile);
  return import(pathToFileURL(tmpFile).href);
}

function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Strip object keys whose values are null/undefined/empty-string,
// recurse into objects and arrays.
function pruneEmpty(value) {
  if (Array.isArray(value)) {
    return value.map(pruneEmpty);
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (v === null || v === undefined) continue;
      if (typeof v === "string" && v === "") continue;
      const cleaned = pruneEmpty(v);
      // Drop empty objects/arrays entirely
      if (
        cleaned !== null &&
        typeof cleaned === "object" &&
        !Array.isArray(cleaned) &&
        Object.keys(cleaned).length === 0
      ) {
        continue;
      }
      out[k] = cleaned;
    }
    return out;
  }
  return value;
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

// ─── Markdown helpers ─────────────────────────────────────────────────────

// Convert a single typed block to markdown text (no trailing newline).
function blockToMarkdown(block) {
  switch (block.type) {
    case "p":
      return block.content;
    case "h2":
      return `## ${block.content}`;
    case "h3":
      return `### ${block.content}`;
    case "ul":
      return block.content.map((s) => `- ${s}`).join("\n");
    case "ol":
      return block.content.map((s, i) => `${i + 1}. ${s}`).join("\n");
    case "quote":
      return `> ${block.content}`;
    case "callout":
      return `> 💡 ${block.content}`;
    default:
      throw new Error(`Unknown block type: ${block.type}`);
  }
}

function blocksToMarkdown(blocks) {
  return blocks.map(blockToMarkdown).join("\n\n");
}

// Minimal YAML frontmatter writer. We control the inputs, so we don't need
// the full YAML spec — just safe escaping for strings, numbers, ISO dates,
// and one level of nested object (author).
function yamlString(val) {
  if (val === null || val === undefined) return "";
  if (typeof val === "number") return String(val);
  if (typeof val === "boolean") return String(val);
  // Always quote strings so colons, hashes, and other YAML-significant
  // characters in titles or excerpts don't break parsing.
  const escaped = String(val).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${escaped}"`;
}

function frontmatter(obj) {
  const lines = ["---"];
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) continue;
    if (typeof v === "string" && v === "") continue;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      // nested object (e.g. author: { name, role })
      const inner = Object.entries(v).filter(
        ([, vv]) => vv !== null && vv !== undefined && vv !== ""
      );
      if (inner.length === 0) continue;
      lines.push(`${k}:`);
      for (const [kk, vv] of inner) {
        lines.push(`  ${kk}: ${yamlString(vv)}`);
      }
    } else {
      lines.push(`${k}: ${yamlString(v)}`);
    }
  }
  lines.push("---");
  return lines.join("\n");
}

function writeMarkdown(filePath, fmObj, body) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const out = frontmatter(fmObj) + "\n\n" + body + "\n";
  fs.writeFileSync(filePath, out, "utf8");
}

// ─── Migrations ───────────────────────────────────────────────────────────

async function migrateCourses() {
  const mod = await importAsModule(path.join(DATA, "courses.js"));
  const families = mod.courseFamilies;
  const dir = path.join(OUT, "courses");
  let count = 0;
  for (const [slug, course] of Object.entries(families)) {
    // Schema field order: slug, title, eyebrow, tagline, category, color,
    // icon, image, summary, hero, outcomes, modules, accreditations,
    // certificate, priceFrom, priceNote, faqs, enrollId.
    const out = pruneEmpty({
      slug: course.slug,
      title: course.title,
      eyebrow: course.eyebrow,
      tagline: course.tagline,
      category: course.category,
      color: course.color,
      icon: course.icon,
      image: course.image,
      summary: course.summary,
      hero: course.hero,
      outcomes: course.outcomes,
      modules: course.modules,
      accreditations: course.accreditations,
      certificate: course.certificate,
      priceFrom: course.priceFrom,
      priceNote: course.priceNote,
      faqs: course.faqs,
      enrollId: course.enrollId,
    });
    writeJson(path.join(dir, `${slug}.json`), out);
    count++;
  }
  return count;
}

async function migrateBlog() {
  const mod = await importAsModule(path.join(DATA, "blog.js"));
  const posts = mod.blogPosts;
  const dir = path.join(OUT, "blog");
  let count = 0;
  for (const post of posts) {
    // publishedAt → ISO datetime. Source uses "YYYY-MM-DD"; expand to a
    // full ISO string at midnight UTC so Tina's `datetime` field parses.
    const publishedAtISO = /^\d{4}-\d{2}-\d{2}$/.test(post.publishedAt)
      ? `${post.publishedAt}T00:00:00.000Z`
      : post.publishedAt;

    const fm = {
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      author: post.author,
      publishedAt: publishedAtISO,
      readMinutes: post.readMinutes,
      heroTone: post.heroTone,
      heroIcon: post.heroIcon,
    };
    const body = blocksToMarkdown(post.body);
    writeMarkdown(path.join(dir, `${post.slug}.md`), fm, body);
    count++;
  }
  return count;
}

async function migrateLegal() {
  const mod = await importAsModule(path.join(DATA, "legal.js"));
  const pages = mod.legalPages;
  const dir = path.join(OUT, "legal");
  let count = 0;
  for (const [slug, page] of Object.entries(pages)) {
    const effectiveISO = /^\d{4}-\d{2}-\d{2}$/.test(page.effectiveDate)
      ? `${page.effectiveDate}T00:00:00.000Z`
      : page.effectiveDate;

    const fm = {
      title: page.title,
      effectiveDate: effectiveISO,
      intro: page.intro,
    };

    // Body: each section's heading → "## heading", followed by its blocks.
    const bodyParts = [];
    for (const section of page.sections) {
      bodyParts.push(`## ${section.heading}`);
      bodyParts.push(blocksToMarkdown(section.blocks));
    }
    const body = bodyParts.join("\n\n");
    writeMarkdown(path.join(dir, `${slug}.md`), fm, body);
    count++;
  }
  return count;
}

async function migrateFaqs() {
  const mod = await importAsModule(path.join(DATA, "faqs.js"));
  const groups = mod.faqs;
  const dir = path.join(OUT, "faqs");
  let count = 0;
  groups.forEach((group, idx) => {
    const fileSlug = slugify(group.category);
    const out = {
      category: group.category,
      order: idx,
      items: group.items.map((it) => ({ q: it.q, a: it.a })),
    };
    writeJson(path.join(dir, `${fileSlug}.json`), out);
    count++;
  });
  return count;
}

async function migrateTestimonials() {
  const mod = await importAsModule(path.join(DATA, "testimonials.js"));
  const items = mod.testimonials;
  const dir = path.join(OUT, "testimonials");
  let count = 0;
  items.forEach((t, idx) => {
    const out = pruneEmpty({
      id: t.id,
      quote: t.quote,
      name: t.name,
      role: t.role,
      company: t.company,
      stat: t.stat,
      featured: idx < 3, // first three were featured on home
      order: idx,
    });
    writeJson(path.join(dir, `${t.id}.json`), out);
    count++;
  });
  return count;
}

async function migrateTeam() {
  const mod = await importAsModule(path.join(DATA, "team.js"));
  const members = mod.team;
  const dir = path.join(OUT, "team");
  let count = 0;
  members.forEach((m, idx) => {
    const out = pruneEmpty({
      name: m.name,
      role: m.role,
      bio: m.bio,
      // Source uses "#" placeholders. Treat those as empty.
      linkedin: m.linkedin === "#" ? "" : m.linkedin,
      twitter: m.twitter === "#" ? "" : m.twitter,
      order: idx,
    });
    writeJson(path.join(dir, `${slugify(m.name)}.json`), out);
    count++;
  });
  return count;
}

async function migrateSite() {
  const teamMod = await importAsModule(path.join(DATA, "team.js"));
  const tMod = await importAsModule(path.join(DATA, "testimonials.js"));
  const out = {
    siteName: "Train321",
    tagline: "Online Food Safety Training",
    phone: "561-325-7300",
    email: "info@train321.com",
    social: {
      facebook: "",
      twitter: "",
      linkedin: "",
      instagram: "",
      youtube: "",
    },
    companyStats: teamMod.companyStats,
    trustLogos: tMod.trustLogos,
  };
  writeJson(path.join(OUT, "site", "index.json"), out);
  return 1;
}

// ─── Run ──────────────────────────────────────────────────────────────────

const results = {
  courses: await migrateCourses(),
  blog: await migrateBlog(),
  legal: await migrateLegal(),
  faqs: await migrateFaqs(),
  testimonials: await migrateTestimonials(),
  team: await migrateTeam(),
  site: await migrateSite(),
};

console.log("Migration complete:");
for (const [k, v] of Object.entries(results)) {
  console.log(`  ${k}: ${v}`);
}

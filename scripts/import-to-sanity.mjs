// One-shot import: static data files -> Sanity dataset.
// Run: node scripts/import-to-sanity.mjs
// Requires: SANITY_PROJECT_ID, SANITY_DATASET, SANITY_WRITE_TOKEN in .env

import { createClient } from '@sanity/client'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '..', '.env')
const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter((l) => l.trim() && !l.startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    })
)

const projectId = env.SANITY_PROJECT_ID
const dataset = env.SANITY_DATASET || 'production'
const token = env.SANITY_WRITE_TOKEN

if (!projectId || !token) {
  console.error('Missing SANITY_PROJECT_ID or SANITY_WRITE_TOKEN in .env')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2025-01-01',
  token,
  useCdn: false
})

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

// Convert a static body (array of {type, content}) into Sanity body blocks.
function toBodyBlocks(body) {
  if (!Array.isArray(body)) return []
  return body.map((b, i) => {
    const _key = `b${i}`
    switch (b.type) {
      case 'p':
        return { _type: 'blockParagraph', _key, content: b.content }
      case 'h2':
        return { _type: 'blockHeading2', _key, content: b.content }
      case 'h3':
        return { _type: 'blockHeading3', _key, content: b.content }
      case 'ul':
        return { _type: 'blockBulletList', _key, content: b.content }
      case 'ol':
        return { _type: 'blockOrderedList', _key, content: b.content }
      case 'callout':
        return { _type: 'blockCallout', _key, content: b.content }
      case 'quote':
        return { _type: 'blockQuote', _key, content: b.content }
      default:
        console.warn('Unknown block type:', b.type)
        return { _type: 'blockParagraph', _key, content: String(b.content) }
    }
  })
}

const withKeys = (arr, prefix) =>
  (arr || []).map((item, i) => ({ ...item, _key: `${prefix}${i}` }))

async function importAll() {
  const data = {
    courses: await import('../assets/data/courses.js'),
    faqs: await import('../assets/data/faqs.js'),
    blog: await import('../assets/data/blog.js'),
    legal: await import('../assets/data/legal.js'),
    team: await import('../assets/data/team.js'),
    testimonials: await import('../assets/data/testimonials.js')
  }

  const tx = client.transaction()
  let count = 0

  // ── siteSettings (singleton) ────────────────────────────────────────
  tx.createOrReplace({
    _id: 'siteSettings',
    _type: 'siteSettings',
    siteName: 'Train321',
    tagline: 'Online Food Safety Training',
    phone: '561-325-7300',
    email: 'info@train321.com',
    companyStats: withKeys(data.team.companyStats, 'cs'),
    trustLogos: withKeys(data.testimonials.trustLogos, 'tl')
  })
  count++

  // ── courses ──────────────────────────────────────────────────────────
  for (const c of data.courses.courseFamilyList) {
    tx.createOrReplace({
      _id: `course-${c.slug}`,
      _type: 'course',
      title: c.title,
      slug: { _type: 'slug', current: c.slug },
      eyebrow: c.eyebrow ?? null,
      tagline: c.tagline ?? null,
      category: c.category ?? null,
      color: c.color ?? null,
      icon: c.icon ?? null,
      imageUrl: c.image ?? null,
      summary: c.summary ?? null,
      heroStats: withKeys(c.hero?.stats, 'hs'),
      outcomes: c.outcomes ?? [],
      modules: withKeys(c.modules, 'm'),
      accreditations: c.accreditations ?? [],
      certificate: c.certificate
        ? {
            _type: 'certificateInfo',
            delivery: c.certificate.delivery ?? null,
            validity: c.certificate.validity ?? null,
            accepted: c.certificate.accepted ?? null
          }
        : null,
      priceFrom: c.priceFrom ?? null,
      priceNote: c.priceNote ?? null,
      faqs: withKeys(c.faqs, 'f'),
      enrollId: c.enrollId ?? null
    })
    count++
  }

  // ── faqItems (flatten the grouped structure) ─────────────────────────
  data.faqs.faqs.forEach((group, gi) => {
    group.items.forEach((item, ii) => {
      tx.createOrReplace({
        _id: `faq-${slugify(group.category)}-${ii}`,
        _type: 'faqItem',
        question: item.q,
        answer: item.a,
        category: group.category,
        categoryOrder: gi,
        order: ii
      })
      count++
    })
  })

  // ── blog posts ───────────────────────────────────────────────────────
  for (const p of data.blog.blogPosts) {
    tx.createOrReplace({
      _id: `blogPost-${p.slug}`,
      _type: 'blogPost',
      title: p.title,
      slug: { _type: 'slug', current: p.slug },
      excerpt: p.excerpt ?? null,
      category: p.category ?? null,
      authorName: p.author?.name ?? null,
      authorRole: p.author?.role ?? null,
      publishedAt: p.publishedAt ? new Date(p.publishedAt).toISOString() : null,
      readMinutes: p.readMinutes ?? null,
      heroTone: p.heroTone ?? null,
      heroIcon: p.heroIcon ?? null,
      body: toBodyBlocks(p.body)
    })
    count++
  }

  // ── legal pages ──────────────────────────────────────────────────────
  for (const lp of data.legal.legalList) {
    tx.createOrReplace({
      _id: `legalPage-${lp.slug}`,
      _type: 'legalPage',
      title: lp.title,
      slug: { _type: 'slug', current: lp.slug },
      effectiveDate: lp.effectiveDate ?? null,
      intro: lp.intro ?? null,
      sections: (lp.sections || []).map((s, i) => ({
        _type: 'legalSection',
        _key: `s${i}`,
        heading: s.heading,
        blocks: toBodyBlocks(s.blocks)
      }))
    })
    count++
  }

  // ── team members ─────────────────────────────────────────────────────
  data.team.team.forEach((m, i) => {
    tx.createOrReplace({
      _id: `team-${slugify(m.name)}`,
      _type: 'teamMember',
      name: m.name,
      role: m.role ?? null,
      bio: m.bio ?? null,
      linkedin: m.linkedin ?? null,
      twitter: m.twitter ?? null,
      order: i
    })
    count++
  })

  // ── testimonials ─────────────────────────────────────────────────────
  data.testimonials.testimonials.forEach((t, i) => {
    tx.createOrReplace({
      _id: `testimonial-${t.id}`,
      _type: 'testimonial',
      quote: t.quote,
      name: t.name,
      role: t.role ?? null,
      company: t.company ?? null,
      stat: t.stat ? { _type: 'testimonialStat', value: t.stat.value, label: t.stat.label } : null,
      featured: i < 3,
      order: i
    })
    count++
  })

  console.log(`Committing ${count} documents…`)
  const result = await tx.commit()
  console.log(`✓ Imported ${result.results.length} documents to Sanity (${dataset})`)
}

importAll().catch((err) => {
  console.error('Import failed:', err)
  process.exit(1)
})

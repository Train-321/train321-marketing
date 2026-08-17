import { defineType, defineField } from 'sanity'

/**
 * A service we sell (custom course development, white labeling, licensing).
 *
 * Deliberately NOT a course: these pages have no enrollment, price, module
 * count, curriculum or certificate. They used to borrow the course document
 * and so inherited all of that furniture — the fields below give them their
 * own shape instead, and app/services/[slug] renders only what is here.
 *
 * The original title/slug/icon/shortDescription/longDescription/features/image
 * fields are kept as-is so existing documents keep their content; everything
 * new is additive and optional, and any section left empty simply doesn't
 * render.
 */
export default defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero', default: true },
    { name: 'body', title: 'Sections' },
    { name: 'faq', title: 'FAQ' },
    { name: 'seo', title: 'SEO' }
  ],
  fields: [
    defineField({ name: 'title', type: 'string', validation: (Rule) => Rule.required(), group: 'hero' }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      description: 'Page lives at /services/<slug>',
      group: 'hero'
    }),
    defineField({ name: 'icon', type: 'string', description: 'Font Awesome class, e.g. fas fa-sliders-h', group: 'hero' }),

    // ── Hero ──────────────────────────────────────────────────────────────
    defineField({ name: 'eyebrow', type: 'string', description: 'Small line above the heading', group: 'hero' }),
    defineField({
      name: 'heading',
      type: 'string',
      description: 'Page heading. Falls back to the title when blank.',
      group: 'hero'
    }),
    defineField({
      name: 'lede',
      type: 'text',
      rows: 3,
      title: 'Intro / lede',
      group: 'hero'
    }),
    defineField({
      name: 'primaryCta',
      type: 'object',
      title: 'Primary CTA',
      fields: [
        { name: 'label', type: 'string' },
        { name: 'to', type: 'string', description: 'e.g. /contact' }
      ],
      group: 'hero'
    }),
    defineField({
      name: 'secondaryCta',
      type: 'object',
      title: 'Secondary CTA',
      fields: [
        { name: 'label', type: 'string' },
        { name: 'to', type: 'string' }
      ],
      group: 'hero'
    }),
    defineField({ name: 'image', type: 'image', options: { hotspot: true }, group: 'hero' }),

    // ── Body sections ─────────────────────────────────────────────────────
    defineField({ name: 'shortDescription', type: 'text', rows: 3, description: 'Used on the services index card.', group: 'body' }),
    defineField({
      name: 'overviewHeading',
      type: 'string',
      title: 'Overview heading',
      group: 'body'
    }),
    defineField({
      name: 'longDescription',
      type: 'array',
      title: 'Overview body',
      of: [{ type: 'block' }],
      group: 'body'
    }),

    defineField({
      name: 'benefitsHeading',
      type: 'string',
      title: 'Benefits heading',
      group: 'body'
    }),
    defineField({
      name: 'benefits',
      type: 'array',
      title: 'Benefits / key outcomes',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', type: 'string' },
            { name: 'body', type: 'text', rows: 2 },
            { name: 'icon', type: 'string', description: 'Font Awesome class' }
          ],
          preview: { select: { title: 'title', subtitle: 'body' } }
        }
      ],
      group: 'body'
    }),

    defineField({
      name: 'capabilitiesHeading',
      type: 'string',
      title: 'Capabilities heading',
      group: 'body'
    }),
    defineField({
      name: 'capabilities',
      type: 'array',
      title: 'Capabilities / what we do',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', type: 'string' },
            { name: 'body', type: 'text', rows: 2 },
            { name: 'icon', type: 'string' }
          ],
          preview: { select: { title: 'title', subtitle: 'body' } }
        }
      ],
      group: 'body'
    }),

    defineField({
      name: 'processHeading',
      type: 'string',
      title: 'Process heading',
      description: 'e.g. How it works',
      group: 'body'
    }),
    defineField({
      name: 'process',
      type: 'array',
      title: 'Process steps',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', type: 'string' },
            { name: 'body', type: 'text', rows: 2 }
          ],
          preview: { select: { title: 'title', subtitle: 'body' } }
        }
      ],
      group: 'body'
    }),

    defineField({
      name: 'deliveryHeading',
      type: 'string',
      title: 'Delivery heading',
      group: 'body'
    }),
    defineField({
      name: 'deliveryOptions',
      type: 'array',
      title: 'Delivery options',
      description: 'e.g. hosted in Train 321, or delivered for use in another LMS (SCORM).',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', type: 'string' },
            { name: 'body', type: 'text', rows: 3 },
            { name: 'icon', type: 'string' }
          ],
          preview: { select: { title: 'title', subtitle: 'body' } }
        }
      ],
      group: 'body'
    }),

    defineField({
      name: 'examplesHeading',
      type: 'string',
      title: 'Examples heading',
      group: 'body'
    }),
    defineField({
      name: 'examples',
      type: 'array',
      title: 'Examples / portfolio',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', type: 'string' },
            { name: 'body', type: 'text', rows: 2 },
            { name: 'image', type: 'image', options: { hotspot: true } },
            { name: 'to', type: 'string', title: 'Link', description: 'Optional. Where the card goes.' }
          ],
          preview: { select: { title: 'title', subtitle: 'body', media: 'image' } }
        }
      ],
      group: 'body'
    }),

    defineField({
      name: 'features',
      type: 'array',
      of: [{ type: 'string' }],
      title: 'Feature bullets',
      description: 'Legacy list, still rendered under the overview when present.',
      group: 'body'
    }),

    // ── FAQ ───────────────────────────────────────────────────────────────
    defineField({ name: 'faqHeading', type: 'string', title: 'FAQ heading', group: 'faq' }),
    defineField({
      name: 'faqs',
      type: 'array',
      title: 'FAQ',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'q', type: 'string', title: 'Question' },
            { name: 'a', type: 'text', rows: 3, title: 'Answer' }
          ],
          preview: { select: { title: 'q', subtitle: 'a' } }
        }
      ],
      group: 'faq'
    }),

    // ── Final CTA ─────────────────────────────────────────────────────────
    defineField({
      name: 'finalCta',
      type: 'object',
      title: 'Final CTA',
      fields: [
        { name: 'heading', type: 'string' },
        { name: 'lede', type: 'text', rows: 2 },
        { name: 'primaryLabel', type: 'string' },
        { name: 'primaryTo', type: 'string' },
        { name: 'secondaryLabel', type: 'string' },
        { name: 'secondaryTo', type: 'string' }
      ],
      group: 'body'
    }),

    defineField({ name: 'seo', type: 'seo', group: 'seo' })
  ],
  preview: { select: { title: 'title', subtitle: 'eyebrow', media: 'image' } }
})

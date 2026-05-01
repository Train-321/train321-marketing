import { defineType, defineField } from 'sanity'

// Reusable "bottom CTA band" used on most pages.
export default defineType({
  name: 'ctaBlock',
  title: 'CTA block',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', type: 'string' }),
    defineField({ name: 'heading', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'lede', type: 'text', rows: 2 }),
    defineField({ name: 'primaryCta', type: 'callToAction', title: 'Primary button' }),
    defineField({ name: 'secondaryCta', type: 'callToAction', title: 'Secondary button' })
  ],
  preview: { select: { title: 'heading', subtitle: 'lede' } }
})

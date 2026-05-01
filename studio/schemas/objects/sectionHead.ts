import { defineType, defineField } from 'sanity'

// Reusable section header (eyebrow + h2 + lede + optional icon).
export default defineType({
  name: 'sectionHead',
  title: 'Section head',
  type: 'object',
  fields: [
    defineField({ name: 'eyebrow', type: 'string' }),
    defineField({ name: 'heading', type: 'string' }),
    defineField({ name: 'lede', type: 'text', rows: 2 }),
    defineField({
      name: 'icon',
      type: 'string',
      title: 'Icon class',
      description: 'Font Awesome class, e.g. "fas fa-bolt".'
    })
  ],
  preview: { select: { title: 'heading', subtitle: 'eyebrow' } }
})

import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'legalPage',
  title: 'Legal Page',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (R) => R.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (R) => R.required()
    }),
    defineField({ name: 'effectiveDate', type: 'date', title: 'Effective date' }),
    defineField({ name: 'intro', type: 'text', rows: 4 }),
    defineField({
      name: 'sections',
      type: 'array',
      of: [{ type: 'legalSection' }]
    }),
    defineField({ name: 'seo', type: 'seo' })
  ],
  preview: { select: { title: 'title', subtitle: 'effectiveDate' } }
})

import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'faqPage',
  title: 'FAQ Page',
  type: 'document',
  fields: [
    defineField({ name: 'heroEyebrow', type: 'string' }),
    defineField({ name: 'heroHeading', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'heroLede', type: 'text', rows: 3 }),
    defineField({ name: 'searchPlaceholder', type: 'string', initialValue: 'Search the FAQ' }),
    defineField({ name: 'categoriesLabel', type: 'string', initialValue: 'Categories' }),
    defineField({ name: 'emptyText', type: 'text', rows: 2 }),
    defineField({ name: 'bottomCta', type: 'ctaBlock', title: 'Bottom CTA' })
  ]
})

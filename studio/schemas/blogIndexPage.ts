import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'blogIndexPage',
  title: 'Blog Index (Journal)',
  type: 'document',
  fields: [
    defineField({ name: 'heroEyebrow', type: 'string' }),
    defineField({ name: 'heroHeading', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'heroLede', type: 'text', rows: 3 }),
    defineField({ name: 'searchPlaceholder', type: 'string', initialValue: 'Search articles' }),
    defineField({ name: 'allCategoryLabel', type: 'string', initialValue: 'All' }),
    defineField({ name: 'emptyText', type: 'text', rows: 2 }),
    defineField({ name: 'recentHead', type: 'sectionHead', title: 'Recent / more section head' }),

    defineField({
      name: 'newsletter',
      type: 'object',
      title: 'Newsletter CTA block (mid-page)',
      fields: [
        { name: 'heading', type: 'string' },
        { name: 'lede', type: 'text', rows: 2 },
        { name: 'placeholder', type: 'string' },
        { name: 'buttonLabel', type: 'string' }
      ]
    })
  ]
})

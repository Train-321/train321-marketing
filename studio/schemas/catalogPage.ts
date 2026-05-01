import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'catalogPage',
  title: 'Catalog Page',
  type: 'document',
  fields: [
    defineField({ name: 'heroEyebrow', type: 'string' }),
    defineField({ name: 'heroHeading', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'heroLede', type: 'text', rows: 3 }),
    defineField({ name: 'searchPlaceholder', type: 'string', initialValue: 'Search courses' }),
    defineField({
      name: 'categories',
      type: 'array',
      title: 'Category filter chips',
      of: [
        {
          type: 'object',
          name: 'categoryDef',
          fields: [
            { name: 'id', type: 'string', title: 'ID (matches course.category)' },
            { name: 'label', type: 'string' },
            { name: 'icon', type: 'string', title: 'Icon class' }
          ],
          preview: { select: { title: 'label', subtitle: 'id' } }
        }
      ]
    }),
    defineField({
      name: 'sortOptions',
      type: 'array',
      title: 'Sort dropdown labels',
      description: '4 items: A-Z, Z-A, price asc, price desc',
      of: [{ type: 'string' }]
    }),
    defineField({ name: 'emptyText', type: 'text', rows: 2 }),
    defineField({ name: 'clearFiltersLabel', type: 'string', initialValue: 'Clear search & filters' }),
    defineField({ name: 'bottomCta', type: 'ctaBlock', title: 'Bottom CTA' })
  ]
})

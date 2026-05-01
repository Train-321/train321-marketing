import { defineType, defineField } from 'sanity'

// Generic "icon + title + sub + link" tile used on contact/about/etc.
export default defineType({
  name: 'labeledTile',
  title: 'Labeled tile',
  type: 'object',
  fields: [
    defineField({ name: 'icon', type: 'string', title: 'Icon class' }),
    defineField({ name: 'title', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'sub', type: 'string', title: 'Sub-text' }),
    defineField({ name: 'linkLabel', type: 'string' }),
    defineField({ name: 'linkHref', type: 'string', title: 'Link URL' })
  ],
  preview: { select: { title: 'title', subtitle: 'sub' } }
})

import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'howItWorksStep',
  title: 'How-it-works step',
  type: 'object',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'body', type: 'text', rows: 3 })
  ],
  preview: { select: { title: 'title', subtitle: 'body' } }
})

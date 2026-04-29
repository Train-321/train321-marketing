import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'courseFaq',
  title: 'Course FAQ',
  type: 'object',
  fields: [
    defineField({ name: 'q', title: 'Question', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'a', title: 'Answer', type: 'text', rows: 4, validation: (R) => R.required() })
  ],
  preview: { select: { title: 'q', subtitle: 'a' } }
})

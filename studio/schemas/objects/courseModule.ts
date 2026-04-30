import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'courseModule',
  title: 'Module',
  type: 'object',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'duration', type: 'string', description: 'Free-form, e.g. "18 min" or "2 hrs"' })
  ],
  preview: { select: { title: 'title', subtitle: 'duration' } }
})

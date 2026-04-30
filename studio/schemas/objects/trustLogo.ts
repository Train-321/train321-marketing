import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'trustLogo',
  title: 'Trust logo',
  type: 'object',
  fields: [
    defineField({ name: 'name', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'label', type: 'string', description: 'Long-form name, e.g. "California Restaurant Association"' }),
    defineField({ name: 'image', type: 'image', options: { hotspot: true } })
  ],
  preview: { select: { title: 'name', subtitle: 'label', media: 'image' } }
})

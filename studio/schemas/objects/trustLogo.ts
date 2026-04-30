import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'trustLogo',
  title: 'Trust logo',
  type: 'object',
  fields: [
    defineField({ name: 'name', type: 'string', title: 'Short name', validation: (R) => R.required() }),
    defineField({
      name: 'label',
      type: 'string',
      title: 'Long name (a11y / tooltip)',
      description: 'Long-form name, e.g. "California Restaurant Association"'
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Logo',
      options: { hotspot: true },
      description: 'PNG or SVG. Will be color-tinted to neutral grey on the site.'
    }),
    defineField({
      name: 'url',
      type: 'url',
      title: 'Link (optional)',
      description: 'If set, the logo becomes a click-through link.'
    })
  ],
  preview: { select: { title: 'name', subtitle: 'label', media: 'image' } }
})

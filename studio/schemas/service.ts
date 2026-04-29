import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' }
    }),
    defineField({ name: 'icon', type: 'string', description: 'Font Awesome class, e.g. fas fa-utensils' }),
    defineField({ name: 'shortDescription', type: 'text', rows: 3 }),
    defineField({
      name: 'longDescription',
      type: 'array',
      of: [{ type: 'block' }]
    }),
    defineField({
      name: 'features',
      type: 'array',
      of: [{ type: 'string' }],
      title: 'Feature bullets'
    }),
    defineField({ name: 'image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'seo', type: 'seo' })
  ],
  preview: { select: { title: 'title', media: 'image' } }
})

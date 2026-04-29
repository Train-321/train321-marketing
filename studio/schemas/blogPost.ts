import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      title: 'Published at',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'author',
      type: 'reference',
      to: [{ type: 'teamMember' }]
    }),
    defineField({
      name: 'category',
      type: 'string',
      options: {
        list: ['Compliance', 'Industry News', 'Training Tips', 'Customer Stories']
      }
    }),
    defineField({ name: 'excerpt', type: 'text', rows: 3 }),
    defineField({
      name: 'coverImage',
      type: 'image',
      options: { hotspot: true }
    }),
    defineField({
      name: 'body',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true } }
      ]
    }),
    defineField({ name: 'seo', type: 'seo' })
  ],
  preview: {
    select: { title: 'title', subtitle: 'publishedAt', media: 'coverImage' }
  }
})

import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({ name: 'quote', type: 'text', rows: 4, validation: (Rule) => Rule.required() }),
    defineField({ name: 'authorName', type: 'string' }),
    defineField({ name: 'authorRole', type: 'string', title: 'Role / company' }),
    defineField({ name: 'authorImage', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'rating',
      type: 'number',
      validation: (Rule) => Rule.min(1).max(5),
      initialValue: 5
    }),
    defineField({ name: 'featured', type: 'boolean', initialValue: false })
  ],
  preview: {
    select: { title: 'authorName', subtitle: 'authorRole', media: 'authorImage' }
  }
})

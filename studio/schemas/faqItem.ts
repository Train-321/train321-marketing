import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'faqItem',
  title: 'FAQ Item',
  type: 'document',
  fields: [
    defineField({ name: 'question', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'answer',
      type: 'array',
      of: [{ type: 'block' }]
    }),
    defineField({
      name: 'category',
      type: 'string',
      options: {
        list: ['General', 'Pricing', 'Certification', 'Technical', 'Refunds']
      }
    }),
    defineField({
      name: 'order',
      type: 'number',
      title: 'Sort order',
      description: 'Lower numbers appear first within their category.'
    })
  ],
  preview: {
    select: { title: 'question', subtitle: 'category' }
  }
})

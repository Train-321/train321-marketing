import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'faqItem',
  title: 'FAQ Item',
  type: 'document',
  fields: [
    defineField({ name: 'question', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'answer', type: 'text', rows: 4, validation: (R) => R.required() }),
    defineField({
      name: 'category',
      type: 'string',
      description: 'Free-form group label (e.g. "Getting started", "Certificates & compliance")',
      validation: (R) => R.required()
    }),
    defineField({
      name: 'categoryOrder',
      type: 'number',
      description: 'Lower numbers appear earlier in the list'
    }),
    defineField({
      name: 'order',
      type: 'number',
      description: 'Sort within the category'
    })
  ],
  preview: {
    select: { title: 'question', subtitle: 'category' }
  }
})

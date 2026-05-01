import { defineType, defineField } from 'sanity'

// Lightweight inline FAQ used on contact/demo/etc. — separate from the
// global faqItem document type which is the source for the FAQ page.
export default defineType({
  name: 'quickFaq',
  title: 'Quick FAQ',
  type: 'object',
  fields: [
    defineField({ name: 'q', type: 'string', title: 'Question', validation: (R) => R.required() }),
    defineField({ name: 'a', type: 'text', rows: 3, title: 'Answer' })
  ],
  preview: { select: { title: 'q', subtitle: 'a' } }
})

import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'contactPage',
  title: 'Contact Page',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero' },
    { name: 'tiles', title: 'Contact tiles' },
    { name: 'form', title: 'Form' },
    { name: 'faq', title: 'Quick FAQs' }
  ],
  fields: [
    defineField({ name: 'heroEyebrow', type: 'string', group: 'hero' }),
    defineField({ name: 'heroHeading', type: 'string', group: 'hero', validation: (R) => R.required() }),
    defineField({ name: 'heroLede', type: 'text', rows: 3, group: 'hero' }),

    defineField({
      name: 'tiles',
      type: 'array',
      title: 'Contact tiles (icon + title + sub + link)',
      group: 'tiles',
      of: [{ type: 'labeledTile' }]
    }),

    defineField({ name: 'formHeading', type: 'string', title: 'Form heading', group: 'form' }),
    defineField({ name: 'formLede', type: 'text', rows: 2, title: 'Form lede', group: 'form' }),
    defineField({
      name: 'topicOptions',
      type: 'array',
      title: 'Topic dropdown options',
      group: 'form',
      of: [{ type: 'string' }]
    }),
    defineField({ name: 'submitLabel', type: 'string', initialValue: 'Send message', group: 'form' }),
    defineField({ name: 'submitSendingLabel', type: 'string', initialValue: 'Sending…', group: 'form' }),
    defineField({ name: 'successText', type: 'text', rows: 2, group: 'form' }),

    defineField({ name: 'quickFaqsHead', type: 'sectionHead', title: 'Quick FAQs section head', group: 'faq' }),
    defineField({ name: 'quickFaqs', type: 'array', group: 'faq', of: [{ type: 'quickFaq' }] }),

    defineField({ name: 'bottomCta', type: 'ctaBlock', title: 'Bottom CTA' })
  ]
})

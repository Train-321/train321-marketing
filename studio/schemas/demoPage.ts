import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'demoPage',
  title: 'Demo Page',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero' },
    { name: 'form', title: 'Booking form' },
    { name: 'agenda', title: 'Agenda' },
    { name: 'faq', title: 'FAQs' }
  ],
  fields: [
    defineField({ name: 'heroEyebrow', type: 'string', group: 'hero' }),
    defineField({ name: 'heroHeading', type: 'string', group: 'hero', validation: (R) => R.required() }),
    defineField({ name: 'heroLede', type: 'text', rows: 3, group: 'hero' }),
    defineField({
      name: 'heroBullets',
      type: 'array',
      title: 'Hero bullet list',
      group: 'hero',
      of: [{ type: 'string' }]
    }),

    defineField({ name: 'formHeading', type: 'string', group: 'form' }),
    defineField({
      name: 'teamSizeOptions',
      type: 'array',
      title: 'Team-size dropdown options',
      group: 'form',
      of: [{ type: 'string' }]
    }),
    defineField({
      name: 'timeslotOptions',
      type: 'array',
      title: 'Time-slot dropdown options',
      group: 'form',
      of: [{ type: 'string' }]
    }),
    defineField({
      name: 'interestOptions',
      type: 'array',
      title: 'Interest chips',
      group: 'form',
      of: [{ type: 'string' }]
    }),
    defineField({
      name: 'notesPlaceholder',
      type: 'string',
      title: 'Notes field placeholder',
      description:
        'Grey hint inside the "Anything we should know?" box. Leave blank to use the built-in default.',
      initialValue:
        'Tell us about your training needs, timeline, integrations, or anything specific you would like us to cover.',
      group: 'form'
    }),
    defineField({ name: 'submitLabel', type: 'string', initialValue: 'Book my demo', group: 'form' }),
    defineField({ name: 'submitSendingLabel', type: 'string', initialValue: 'Booking…', group: 'form' }),
    defineField({ name: 'successText', type: 'text', rows: 2, group: 'form' }),
    defineField({ name: 'disclaimer', type: 'text', rows: 2, group: 'form' }),

    defineField({ name: 'agendaHead', type: 'sectionHead', title: 'Agenda section head', group: 'agenda' }),
    defineField({
      name: 'agenda',
      type: 'array',
      group: 'agenda',
      of: [
        {
          type: 'object',
          name: 'agendaItem',
          fields: [
            { name: 'time', type: 'string', title: 'Duration / time' },
            { name: 'title', type: 'string' },
            { name: 'desc', type: 'text', rows: 2 }
          ],
          preview: { select: { title: 'title', subtitle: 'time' } }
        }
      ]
    }),

    defineField({ name: 'faqHead', type: 'sectionHead', title: 'FAQs section head', group: 'faq' }),
    defineField({ name: 'faqs', type: 'array', group: 'faq', of: [{ type: 'quickFaq' }] }),

    defineField({ name: 'bottomCta', type: 'ctaBlock', title: 'Bottom CTA' })
  ]
})

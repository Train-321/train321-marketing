import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'demoPage',
  title: 'Demo Page',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero' },
    { name: 'form', title: 'Booking form' },
    { name: 'gallery', title: 'Demo gallery' },
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

    // ── Demo gallery ──────────────────────────────────────────────────────
    // The cards themselves come from the LMS (api/tour/demovideos) so the two
    // stay in step by default. Adding any card below takes over the gallery
    // completely, which is the escape hatch when the marketing site needs to
    // show something the LMS feed doesn't carry.
    defineField({
      name: 'demoHead',
      type: 'sectionHead',
      title: 'Demo gallery section head',
      group: 'gallery'
    }),
    defineField({
      name: 'demoVideos',
      type: 'array',
      title: 'Demo cards',
      description:
        'Leave empty to show the videos managed in the LMS. Add cards here to replace that list entirely.',
      group: 'gallery',
      of: [
        {
          type: 'object',
          name: 'demoVideo',
          fields: [
            { name: 'title', type: 'string', validation: (R) => R.required() },
            {
              name: 'videoUrl',
              type: 'url',
              title: 'Video URL',
              description:
                'The Vimeo link for this demo, e.g. https://vimeo.com/123456789. Copy it from the address bar on the video’s Vimeo page.',
              // The player is Vimeo-only and pulls the numeric id out of the
              // URL. Without one the card is dropped at render, so catch it
              // here rather than letting it vanish from the page unexplained.
              validation: (R) =>
                R.required().custom((url?: string) =>
                  !url || /(\d{6,})/.test(url)
                    ? true
                    : 'This card will not appear on the page — no Vimeo video id found in the link. Paste the full Vimeo URL (e.g. https://vimeo.com/123456789). YouTube and other hosts are not supported yet.'
                )
            },
            {
              name: 'image',
              type: 'image',
              title: 'Thumbnail',
              options: { hotspot: true },
              description: 'Optional. Falls back to the Vimeo thumbnail.'
            },
            {
              name: 'order',
              type: 'number',
              title: 'Display order',
              description: 'Lower numbers first. Ties keep list order.'
            },
            {
              name: 'hidden',
              type: 'boolean',
              title: 'Hide this card',
              initialValue: false
            }
          ],
          preview: { select: { title: 'title', subtitle: 'videoUrl', media: 'image' } }
        }
      ]
    }),

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

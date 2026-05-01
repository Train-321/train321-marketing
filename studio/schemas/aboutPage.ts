import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  fields: [
    defineField({ name: 'heroEyebrow', type: 'string' }),
    defineField({ name: 'heroHeading', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'heroLede', type: 'text', rows: 3 }),

    defineField({ name: 'storyHead', type: 'sectionHead', title: 'Story section head' }),
    defineField({
      name: 'storyParagraphs',
      type: 'array',
      title: 'Story paragraphs',
      description: 'One paragraph per array item.',
      of: [{ type: 'text', rows: 4 }]
    }),

    defineField({ name: 'pillarsHead', type: 'sectionHead', title: 'Pillars section head' }),
    defineField({
      name: 'pillars',
      type: 'array',
      title: 'Pillars (the things we refuse to compromise on)',
      of: [{ type: 'pillarCard' }]
    }),

    defineField({ name: 'teamHead', type: 'sectionHead', title: 'Team section head' }),

    defineField({ name: 'bottomCta', type: 'ctaBlock', title: 'Bottom CTA' })
  ]
})

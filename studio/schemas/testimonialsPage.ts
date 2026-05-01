import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'testimonialsPage',
  title: 'Testimonials Page',
  type: 'document',
  fields: [
    defineField({ name: 'heroEyebrow', type: 'string' }),
    defineField({ name: 'heroHeading', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'heroLede', type: 'text', rows: 3 }),
    defineField({
      name: 'heroStats',
      type: 'array',
      title: 'Hero stats',
      of: [{ type: 'labeledStat' }]
    }),
    defineField({ name: 'featuredHead', type: 'sectionHead', title: 'Featured-quote section head' }),
    defineField({ name: 'moreHead', type: 'sectionHead', title: 'More-from-the-field section head' }),
    defineField({ name: 'trustHead', type: 'sectionHead', title: 'Trusted-by section head' }),
    defineField({ name: 'bottomCta', type: 'ctaBlock', title: 'Bottom CTA' })
  ]
})

import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'course',
  title: 'Course',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (R) => R.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (R) => R.required()
    }),
    defineField({ name: 'eyebrow', type: 'string', description: 'Small line above the headline' }),
    defineField({ name: 'tagline', type: 'text', rows: 2 }),
    defineField({
      name: 'category',
      type: 'string',
      options: {
        list: [
          { title: 'Food', value: 'food' },
          { title: 'Alcohol', value: 'alcohol' },
          { title: 'HR', value: 'hr' }
        ]
      }
    }),
    defineField({
      name: 'color',
      type: 'string',
      description: 'Card accent color',
      options: {
        list: [
          { title: 'Amber', value: 'amber' },
          { title: 'Plum', value: 'plum' },
          { title: 'Emerald', value: 'emerald' },
          { title: 'Neutral', value: 'neutral' }
        ]
      }
    }),
    defineField({ name: 'icon', type: 'string', description: 'Font Awesome class, e.g. fas fa-utensils' }),
    defineField({ name: 'imageUrl', type: 'url', title: 'Image URL', description: 'Use this for external image URLs (e.g. Unsplash). Leave blank if uploading via the field below.' }),
    defineField({ name: 'image', type: 'image', title: 'Image (uploaded)', options: { hotspot: true } }),
    defineField({ name: 'summary', type: 'text', rows: 4 }),
    defineField({
      name: 'heroStats',
      title: 'Hero stats',
      type: 'array',
      of: [{ type: 'heroStat' }],
      validation: (R) => R.max(4)
    }),
    defineField({
      name: 'outcomes',
      title: 'Learning outcomes',
      type: 'array',
      of: [{ type: 'string' }]
    }),
    defineField({
      name: 'modules',
      type: 'array',
      of: [{ type: 'courseModule' }]
    }),
    defineField({
      name: 'accreditations',
      type: 'array',
      of: [{ type: 'string' }]
    }),
    defineField({
      name: 'certificate',
      type: 'certificateInfo',
      title: 'Certificate'
    }),
    defineField({ name: 'priceFrom', type: 'number', title: 'Price from (USD)', description: 'Display price; leave blank for "contact us" pricing' }),
    defineField({ name: 'priceNote', type: 'string', description: 'Replaces price when no priceFrom is set, or supplements it' }),
    defineField({
      name: 'faqs',
      title: 'Course-specific FAQs',
      type: 'array',
      of: [{ type: 'courseFaq' }]
    }),
    defineField({ name: 'enrollId', type: 'string', description: 'Identifier passed to the LMS enroll URL' }),
    defineField({ name: 'enrollUrl', type: 'url', description: 'Override enroll URL (otherwise built from enrollId)' }),
    defineField({ name: 'seo', type: 'seo' })
  ],
  preview: {
    select: { title: 'title', subtitle: 'category', media: 'image' }
  }
})

import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'course',
  title: 'Course',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'family',
      type: 'string',
      title: 'Course family',
      options: {
        list: [
          { title: 'Food Handler', value: 'food-handler' },
          { title: 'Food Manager', value: 'food-manager' },
          { title: 'Alcohol Server', value: 'alcohol-server' },
          { title: 'Allergen Awareness', value: 'allergen' },
          { title: 'HACCP', value: 'haccp' }
        ]
      }
    }),
    defineField({
      name: 'state',
      type: 'string',
      title: 'State / jurisdiction',
      description: 'Two-letter code (FL, TX, NY) or "national".'
    }),
    defineField({
      name: 'shortDescription',
      type: 'text',
      rows: 3,
      title: 'Short description',
      description: 'Shown on cards and listings.'
    }),
    defineField({
      name: 'longDescription',
      type: 'array',
      title: 'Full description',
      of: [{ type: 'block' }, { type: 'image' }],
      description: 'Rich text for the course detail page.'
    }),
    defineField({
      name: 'durationMinutes',
      type: 'number',
      title: 'Duration (minutes)'
    }),
    defineField({
      name: 'price',
      type: 'number',
      title: 'Price (USD)',
      description: 'Display price. Live pricing can override via API — see README.'
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Course image',
      options: { hotspot: true }
    }),
    defineField({
      name: 'accreditations',
      type: 'array',
      title: 'Accreditations / approvals',
      of: [{ type: 'string' }]
    }),
    defineField({
      name: 'whatYouLearn',
      type: 'array',
      title: 'What you\'ll learn (bullets)',
      of: [{ type: 'string' }]
    }),
    defineField({
      name: 'enrollUrl',
      type: 'string',
      title: 'Enroll URL',
      description: 'Where the Enroll button links to (defaults to /enroll?course=<slug>).'
    }),
    defineField({ name: 'seo', type: 'seo' })
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'state',
      media: 'image'
    }
  }
})

import { defineType, defineField, defineArrayMember } from 'sanity'
import CoursePickerInput from '../components/CoursePickerInput'

export default defineType({
  name: 'course',
  title: 'Course',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'enroll', title: 'Enrollment' },
    { name: 'seo', title: 'SEO' }
  ],
  fields: [
    defineField({ name: 'title', type: 'string', validation: (R) => R.required(), group: 'content' }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (R) => R.required(),
      group: 'content'
    }),
    defineField({ name: 'eyebrow', type: 'string', description: 'Small line above the headline', group: 'content' }),
    defineField({ name: 'tagline', type: 'text', rows: 2, group: 'content' }),
    defineField({
      name: 'category',
      type: 'string',
      group: 'content',
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
      group: 'content',
      options: {
        list: [
          { title: 'Amber', value: 'amber' },
          { title: 'Plum', value: 'plum' },
          { title: 'Emerald', value: 'emerald' },
          { title: 'Neutral', value: 'neutral' }
        ]
      }
    }),
    defineField({ name: 'icon', type: 'string', description: 'Font Awesome class, e.g. fas fa-utensils', group: 'content' }),
    defineField({ name: 'imageUrl', type: 'url', title: 'Image URL', description: 'Use this for external image URLs (e.g. Unsplash). Leave blank if uploading via the field below.', group: 'content' }),
    defineField({ name: 'image', type: 'image', title: 'Image (uploaded)', options: { hotspot: true }, group: 'content' }),
    defineField({ name: 'summary', type: 'text', rows: 4, group: 'content' }),
    defineField({
      name: 'heroStats',
      title: 'Hero stats',
      type: 'array',
      of: [{ type: 'heroStat' }],
      validation: (R) => R.max(4),
      group: 'content'
    }),
    defineField({
      name: 'outcomes',
      title: 'Learning outcomes',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'content'
    }),
    defineField({
      name: 'modules',
      type: 'array',
      of: [{ type: 'courseModule' }],
      group: 'content'
    }),
    defineField({
      name: 'accreditations',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'content'
    }),
    defineField({
      name: 'certificate',
      type: 'certificateInfo',
      title: 'Certificate',
      group: 'content'
    }),
    defineField({ name: 'priceFrom', type: 'number', title: 'Price from (USD)', description: 'Fallback price only. When a Course ID is linked (Enrollment tab), the live LMS price is used automatically and this value is ignored. Leave blank for "contact us" pricing.', group: 'content' }),
    defineField({ name: 'priceNote', type: 'string', description: 'Replaces price when no priceFrom is set, or supplements it', group: 'content' }),
    defineField({
      name: 'faqs',
      title: 'Course-specific FAQs',
      type: 'array',
      of: [{ type: 'courseFaq' }],
      group: 'content'
    }),

    defineField({
      name: 'enrollId',
      title: 'Course ID',
      type: 'string',
      group: 'enroll',
      description: 'Search the live Train321 storefront and pick a course. Its ID is stored here and appended as ?add=<id>&checkout=1 on every Enroll Now button.',
      components: { input: CoursePickerInput }
    }),
    defineField({
      name: 'enrollUrl',
      title: 'Override enroll URL',
      type: 'url',
      group: 'enroll',
      description: 'Optional. If set, Enroll Now buttons link directly here instead of building the URL from Course ID above.'
    }),

    defineField({
      name: 'stateVariants',
      title: 'State / regional versions',
      type: 'array',
      group: 'enroll',
      description:
        'Turn this course into a group. When one or more rows are set, the Enroll buttons on this course open a state picker; choosing a state sends the learner straight to that version’s enrollment (using the linked course’s Course ID / enroll URL). Leave empty for a normal single-enroll course.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'stateVariant',
          title: 'State version',
          fields: [
            defineField({
              name: 'state',
              title: 'State / label',
              type: 'string',
              description: 'Shown in the picker, e.g. "California" or "All other states".',
              validation: (R) => R.required()
            }),
            defineField({
              name: 'course',
              title: 'Links to course',
              type: 'reference',
              to: [{ type: 'course' }],
              description: 'The course this state enrolls into. Its Course ID / enroll URL is used.',
              validation: (R) => R.required()
            })
          ],
          preview: {
            select: { title: 'state', subtitle: 'course.title' }
          }
        })
      ]
    }),

    defineField({ name: 'seo', type: 'seo', group: 'seo' })
  ],
  preview: {
    select: { title: 'title', subtitle: 'category', media: 'image' }
  }
})

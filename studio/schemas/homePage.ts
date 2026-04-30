import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  fields: [
    defineField({
      name: 'heroEyebrow',
      type: 'string',
      title: 'Hero eyebrow',
      description: 'Small line above the hero headline.'
    }),
    defineField({
      name: 'heroHeadline',
      type: 'string',
      title: 'Hero headline',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'heroSubcopy',
      type: 'text',
      rows: 3,
      title: 'Hero subcopy'
    }),
    defineField({
      name: 'heroPrimaryCta',
      type: 'callToAction',
      title: 'Primary button'
    }),
    defineField({
      name: 'heroSecondaryCta',
      type: 'callToAction',
      title: 'Secondary button'
    }),
    defineField({
      name: 'heroImage',
      type: 'image',
      title: 'Hero image',
      options: { hotspot: true }
    }),
    defineField({
      name: 'featuredCourses',
      type: 'array',
      title: 'Featured courses',
      description: 'Courses highlighted on the home page.',
      of: [{ type: 'reference', to: [{ type: 'course' }] }]
    }),
    defineField({
      name: 'featuredTestimonials',
      type: 'array',
      title: 'Featured testimonials',
      of: [{ type: 'reference', to: [{ type: 'testimonial' }] }]
    }),
    defineField({ name: 'seo', type: 'seo' })
  ]
})

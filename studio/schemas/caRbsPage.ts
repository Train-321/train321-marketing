import { defineType, defineField, defineArrayMember } from 'sanity'
import { CourseIdNumberInput } from '../components/CoursePickerInput'

// The California RBS ad landing page (/california-rbs). Every field is
// optional: leave one blank and the page keeps its built-in wording, so the
// page looks exactly the same until someone edits it here.

const courseIdList = (description: string) =>
  defineField({
    name: 'placeholder',
    type: 'array',
    of: [
      defineArrayMember({
        type: 'number',
        title: 'Course',
        components: { input: CourseIdNumberInput },
        validation: (R) => R.integer().positive()
      })
    ],
    description
  })

export default defineType({
  name: 'caRbsPage',
  title: 'California RBS Ad Page',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Left side', default: true },
    { name: 'checkout', title: 'Checkout' },
    { name: 'faq', title: 'FAQ' },
    { name: 'closer', title: 'Closing band' },
    { name: 'top', title: 'Top ribbon' },
    { name: 'seo', title: 'SEO' }
  ],
  fields: [
    // ── Left side ──────────────────────────────────────────────────────
    defineField({
      name: 'heroTitle',
      title: 'Heading',
      type: 'string',
      group: 'hero',
      description: 'Blank → "California RBS Certification Training".'
    }),
    defineField({
      name: 'heroDescription',
      title: 'Description',
      type: 'text',
      rows: 3,
      group: 'hero',
      description:
        'Line under the heading. Blank → "Complete your required Responsible Beverage Service training online with Train 321, an approved California RBS training provider."'
    }),
    defineField({
      name: 'proofPoints',
      title: 'Checkmarks under the certificate',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      group: 'hero',
      description: 'Up to 3 short points. Blank → "Approved California provider", "Reported to ABC within 24 hrs", "Self-paced, any device".',
      validation: (R) => R.max(3)
    }),
    defineField({
      name: 'certificateNote',
      title: 'Certificate note',
      type: 'text',
      rows: 2,
      group: 'hero',
      description:
        'Small note under the checkmarks. Blank → "Your official California Alcohol Server Certification is issued by California ABC after you pass the state exam."'
    }),

    // ── Checkout ───────────────────────────────────────────────────────
    defineField({
      name: 'checkoutHeading',
      title: 'Checkout heading',
      type: 'string',
      group: 'checkout',
      description: 'Blank → "Complete your enrollment".'
    }),
    defineField({
      ...courseIdList(
        'Courses the ad link sells when it has no ?ids= of its own. Blank → the LMS finds the California RBS course by itself. ' +
          'Only change this if the RBS course should be a different one.'
      ),
      name: 'defaultCourseIds',
      title: 'Courses to sell',
      group: 'checkout',
      validation: (R) => R.max(10)
    }),
    defineField({
      ...courseIdList(
        'The "Often added" chips. Blank → the same Popular courses as the Enrollment Page. Up to 3 show before "+ more".'
      ),
      name: 'popularCourseIds',
      title: 'Often added courses',
      group: 'checkout',
      validation: (R) => R.max(6)
    }),

    // ── FAQ ────────────────────────────────────────────────────────────
    defineField({
      name: 'faqHeading',
      title: 'FAQ heading',
      type: 'string',
      group: 'faq',
      description: 'Blank → "Questions, answered".'
    }),
    defineField({
      name: 'faqItems',
      title: 'Questions',
      type: 'array',
      group: 'faq',
      description: 'Blank → the 5 built-in California RBS questions.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'caRbsFaq',
          title: 'Question',
          fields: [
            defineField({ name: 'question', type: 'string', validation: (R) => R.required() }),
            defineField({ name: 'answer', type: 'text', rows: 3, validation: (R) => R.required() })
          ],
          preview: { select: { title: 'question', subtitle: 'answer' } }
        })
      ]
    }),

    // ── Closing band ───────────────────────────────────────────────────
    defineField({
      name: 'closerHeading',
      title: 'Heading',
      type: 'string',
      group: 'closer',
      description: 'Blank → "Get your California RBS training done today."'
    }),
    defineField({
      name: 'closerSub',
      title: 'Sub-line',
      type: 'string',
      group: 'closer',
      description: 'Blank → "Approved provider · Reported to ABC within 24 hours".'
    }),
    defineField({
      name: 'closerButton',
      title: 'Button label',
      type: 'string',
      group: 'closer',
      description: 'The price is added after it automatically. Blank → "Enroll now".'
    }),

    // ── Top ribbon ─────────────────────────────────────────────────────
    defineField({
      name: 'ribbonText',
      title: 'Ribbon text',
      type: 'string',
      group: 'top',
      description: 'Navy strip at the very top. Blank → "Approved California Responsible Beverage Service (RBS) training provider".'
    }),

    // ── SEO (the page stays out of search results either way) ─────────
    defineField({
      name: 'seoTitle',
      title: 'Browser tab title',
      type: 'string',
      group: 'seo',
      description: '" | Train 321" is added automatically. Blank → "California RBS Certification Training Online".'
    }),
    defineField({
      name: 'seoDescription',
      title: 'Description (link previews)',
      type: 'text',
      rows: 2,
      group: 'seo'
    })
  ],
  preview: { prepare: () => ({ title: 'California RBS Ad Page' }) }
})

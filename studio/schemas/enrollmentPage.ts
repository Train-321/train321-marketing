import { defineType, defineField, defineArrayMember } from 'sanity'
import { CourseIdNumberInput } from '../components/CoursePickerInput'

// The email-first checkout page (/enrollment). Today it manages the
// "highlights" shown under the certificate preview — the four icon + title +
// sub-line rows — site-wide defaults plus per-course overrides keyed by the
// LMS course id. Leave everything empty and the page keeps its built-in four.

const highlight = defineArrayMember({
  type: 'object',
  name: 'enrollHighlight',
  title: 'Highlight',
  fields: [
    defineField({ name: 'icon', type: 'string', description: 'Font Awesome class, e.g. fas fa-shield-halved' }),
    defineField({ name: 'title', type: 'string', description: 'Bold lead, e.g. "ANSI-accredited"' }),
    defineField({ name: 'sub', type: 'string', description: 'Quiet sub-line, e.g. "nationally recognized training"' })
  ],
  preview: { select: { title: 'title', subtitle: 'sub' } }
})

export default defineType({
  name: 'enrollmentPage',
  title: 'Enrollment Page',
  type: 'document',
  groups: [
    { name: 'empty', title: 'No course in link', default: true },
    { name: 'addons', title: 'Add to your order' },
    { name: 'highlights', title: 'Highlights' }
  ],
  fields: [
    // What /enrollment shows when the URL carries no course (ids / group).
    defineField({
      name: 'emptyTitle',
      title: 'Title',
      type: 'string',
      group: 'empty',
      description: 'Headline when the page is opened without a course. Blank → "This link is missing its course".'
    }),
    defineField({
      name: 'emptyLede',
      title: 'Description',
      type: 'text',
      rows: 3,
      group: 'empty',
      description: 'Paragraph under the title. Blank → the built-in "find your course in our catalog" copy.'
    }),
    defineField({
      name: 'defaultCourseIds',
      title: 'Courses to offer',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'number',
          title: 'Course',
          components: { input: CourseIdNumberInput },
          validation: (R) => R.integer().positive()
        })
      ],
      group: 'empty',
      description:
        'Pick the course(s) to put in the checkout when the link has no course. ' +
        'With at least one, the page shows the real checkout for these; empty → only the button below.'
    }),
    defineField({
      name: 'popularCourseIds',
      title: 'Popular courses',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'number',
          title: 'Course',
          components: { input: CourseIdNumberInput },
          validation: (R) => R.integer().positive()
        })
      ],
      group: 'addons',
      description:
        'Shown in the "add to your order" box when the course in the link has no state. ' +
        'With a state, the box offers that state\'s other courses automatically. Up to 3 are shown; ' +
        'empty → the nationwide food handler / alcohol / harassment courses.',
      validation: (R) => R.max(6)
    }),
    defineField({
      name: 'emptyCtaLabel',
      title: 'Button label',
      type: 'string',
      group: 'empty',
      description: 'Blank → "Browse courses".'
    }),
    defineField({
      name: 'emptyCtaHref',
      title: 'Button link',
      type: 'string',
      group: 'empty',
      description: 'Path or URL the button opens. Blank → /catalog.'
    }),

    defineField({
      name: 'defaultHighlights',
      title: 'Default highlights',
      group: 'highlights',
      type: 'array',
      of: [highlight],
      description:
        'Shown under the certificate for every course that has no entry below. ' +
        'Leave empty to keep the built-in four.',
      validation: (R) => R.max(6)
    }),
    defineField({
      name: 'courseHighlights',
      title: 'Per-course highlights',
      group: 'highlights',
      type: 'array',
      description: 'Override the highlights for a specific LMS course id (the number from the admin Courses list).',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'courseHighlightSet',
          title: 'Course',
          fields: [
            defineField({ name: 'courseId', type: 'number', title: 'LMS course id', validation: (R) => R.required().integer().positive() }),
            defineField({ name: 'label', type: 'string', description: 'Your note, e.g. the course name — not shown on the site.' }),
            defineField({ name: 'highlights', type: 'array', of: [highlight], validation: (R) => R.max(6) })
          ],
          preview: {
            select: { id: 'courseId', label: 'label', items: 'highlights' },
            prepare({ id, label, items }: { id?: number; label?: string; items?: unknown[] }) {
              return { title: label || `Course ${id ?? ''}`, subtitle: `id ${id ?? '?'} · ${items?.length ?? 0} highlights` }
            }
          }
        })
      ]
    })
  ],
  preview: { prepare: () => ({ title: 'Enrollment Page' }) }
})

import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'footerColumn',
  title: 'Footer column',
  type: 'object',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (R) => R.required() }),
    defineField({
      name: 'links',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'navLink',
          fields: [
            { name: 'label', type: 'string', validation: (R) => R.required() },
            { name: 'href', type: 'string', title: 'URL or path', validation: (R) => R.required() }
          ],
          preview: { select: { title: 'label', subtitle: 'href' } }
        }
      ]
    })
  ],
  preview: {
    select: { title: 'title', n: 'links.length' },
    prepare: ({ title, n }) => ({ title, subtitle: `${n || 0} link${n === 1 ? '' : 's'}` })
  }
})

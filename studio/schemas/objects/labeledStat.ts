import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'labeledStat',
  title: 'Labeled stat',
  type: 'object',
  fields: [
    defineField({ name: 'value', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'label', type: 'string', validation: (R) => R.required() })
  ],
  preview: { select: { title: 'value', subtitle: 'label' } }
})

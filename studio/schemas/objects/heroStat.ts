import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'heroStat',
  title: 'Stat',
  type: 'object',
  fields: [
    defineField({ name: 'value', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'label', type: 'string', validation: (R) => R.required() })
  ],
  preview: { select: { value: 'value', label: 'label' }, prepare: ({ value, label }) => ({ title: value, subtitle: label }) }
})

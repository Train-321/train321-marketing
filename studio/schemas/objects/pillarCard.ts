import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'pillarCard',
  title: 'Pillar card',
  type: 'object',
  fields: [
    defineField({ name: 'icon', type: 'string', title: 'Icon class' }),
    defineField({
      name: 'tone',
      type: 'string',
      options: {
        list: ['amber', 'plum', 'emerald', 'neutral', 'sky'],
        layout: 'radio'
      },
      initialValue: 'neutral'
    }),
    defineField({ name: 'title', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'body', type: 'text', rows: 3 }),
    defineField({ name: 'linkLabel', type: 'string', title: 'Link label (optional)' }),
    defineField({ name: 'linkHref', type: 'string', title: 'Link URL (optional)' })
  ],
  preview: { select: { title: 'title', subtitle: 'body' } }
})

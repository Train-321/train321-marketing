import { defineType, defineField } from 'sanity'
import { bodyBlockTypes } from './bodyBlock'

export default defineType({
  name: 'legalSection',
  title: 'Section',
  type: 'object',
  fields: [
    defineField({ name: 'heading', type: 'string', validation: (R) => R.required() }),
    defineField({
      name: 'blocks',
      title: 'Content blocks',
      type: 'array',
      of: bodyBlockTypes
    })
  ],
  preview: { select: { title: 'heading' } }
})

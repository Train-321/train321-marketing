import { defineType, defineField } from 'sanity'

export const blockParagraph = defineType({
  name: 'blockParagraph',
  title: 'Paragraph',
  type: 'object',
  fields: [
    defineField({ name: 'content', type: 'text', rows: 3, validation: (R) => R.required() })
  ],
  preview: { select: { title: 'content' }, prepare: ({ title }) => ({ title: title?.slice(0, 80) || '(empty)' }) }
})

export const blockHeading2 = defineType({
  name: 'blockHeading2',
  title: 'Heading 2',
  type: 'object',
  fields: [defineField({ name: 'content', type: 'string', validation: (R) => R.required() })],
  preview: { select: { title: 'content' }, prepare: ({ title }) => ({ title: `H2: ${title}` }) }
})

export const blockHeading3 = defineType({
  name: 'blockHeading3',
  title: 'Heading 3',
  type: 'object',
  fields: [defineField({ name: 'content', type: 'string', validation: (R) => R.required() })],
  preview: { select: { title: 'content' }, prepare: ({ title }) => ({ title: `H3: ${title}` }) }
})

export const blockBulletList = defineType({
  name: 'blockBulletList',
  title: 'Bullet list',
  type: 'object',
  fields: [
    defineField({
      name: 'content',
      title: 'Items',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (R) => R.min(1)
    })
  ],
  preview: { select: { items: 'content' }, prepare: ({ items }) => ({ title: `Bullets: ${(items || []).length} items` }) }
})

export const blockOrderedList = defineType({
  name: 'blockOrderedList',
  title: 'Numbered list',
  type: 'object',
  fields: [
    defineField({
      name: 'content',
      title: 'Items',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (R) => R.min(1)
    })
  ],
  preview: { select: { items: 'content' }, prepare: ({ items }) => ({ title: `Numbered: ${(items || []).length} items` }) }
})

export const blockCallout = defineType({
  name: 'blockCallout',
  title: 'Callout',
  type: 'object',
  fields: [defineField({ name: 'content', type: 'text', rows: 2, validation: (R) => R.required() })],
  preview: { select: { title: 'content' }, prepare: ({ title }) => ({ title: `Callout: ${title?.slice(0, 60)}` }) }
})

export const blockQuote = defineType({
  name: 'blockQuote',
  title: 'Quote',
  type: 'object',
  fields: [defineField({ name: 'content', type: 'text', rows: 2, validation: (R) => R.required() })],
  preview: { select: { title: 'content' }, prepare: ({ title }) => ({ title: `Quote: ${title?.slice(0, 60)}` }) }
})

export const bodyBlockTypes = [
  { type: 'blockParagraph' as const },
  { type: 'blockHeading2' as const },
  { type: 'blockHeading3' as const },
  { type: 'blockBulletList' as const },
  { type: 'blockOrderedList' as const },
  { type: 'blockCallout' as const },
  { type: 'blockQuote' as const }
]

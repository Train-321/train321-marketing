import { defineType, defineField } from 'sanity'
import { bodyBlockTypes } from './objects/bodyBlock'

export default defineType({
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (R) => R.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (R) => R.required()
    }),
    defineField({ name: 'excerpt', type: 'text', rows: 3 }),
    defineField({ name: 'category', type: 'string', description: 'e.g. "Compliance", "Food safety", "Operations"' }),
    defineField({
      name: 'author',
      type: 'reference',
      to: [{ type: 'teamMember' }]
    }),
    defineField({
      name: 'authorName',
      type: 'string',
      description: 'Free-text author name (used if no author reference is set)'
    }),
    defineField({
      name: 'authorRole',
      type: 'string',
      description: 'Free-text author role (used with authorName)'
    }),
    defineField({ name: 'publishedAt', type: 'datetime', validation: (R) => R.required() }),
    defineField({ name: 'readMinutes', type: 'number', title: 'Read time (minutes)' }),
    defineField({
      name: 'heroTone',
      type: 'string',
      description: 'Visual tone of the article hero',
      options: {
        list: [
          { title: 'Accent', value: 'accent' },
          { title: 'Warn', value: 'warn' },
          { title: 'Positive', value: 'positive' },
          { title: 'Critical', value: 'critical' }
        ]
      }
    }),
    defineField({ name: 'heroIcon', type: 'string', description: 'Font Awesome class' }),
    defineField({ name: 'coverImage', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'body',
      type: 'array',
      of: bodyBlockTypes
    }),
    defineField({ name: 'seo', type: 'seo' })
  ],
  preview: {
    select: { title: 'title', subtitle: 'publishedAt', media: 'coverImage' }
  }
})

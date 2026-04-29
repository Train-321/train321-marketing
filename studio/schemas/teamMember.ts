import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'teamMember',
  title: 'Team Member',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'role', type: 'string' }),
    defineField({ name: 'bio', type: 'text', rows: 4 }),
    defineField({ name: 'photo', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'linkedin', type: 'url' }),
    defineField({ name: 'order', type: 'number' })
  ],
  preview: { select: { title: 'name', subtitle: 'role', media: 'photo' } }
})

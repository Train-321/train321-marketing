import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta title',
      type: 'string',
      description: 'Shown in browser tabs and Google search results. ~60 chars max.',
      validation: (Rule) => Rule.max(70).warning('Longer titles get truncated by Google.')
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      description: 'The summary Google shows under the title. ~155 chars max.',
      validation: (Rule) => Rule.max(160).warning('Longer descriptions get truncated.')
    }),
    defineField({
      name: 'ogImage',
      title: 'Social share image',
      type: 'image',
      description: '1200x630 recommended. Used for Facebook, Twitter, LinkedIn previews.',
      options: { hotspot: true }
    }),
    defineField({
      name: 'noIndex',
      title: 'Hide from search engines',
      type: 'boolean',
      description: 'Turn on to prevent Google from indexing this page.',
      initialValue: false
    })
  ]
})

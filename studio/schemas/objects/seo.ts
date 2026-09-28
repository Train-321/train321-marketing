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
      description: 'Shown in browser tabs, Google search results and link previews (WhatsApp, Facebook, LinkedIn). ~60 chars max.',
      validation: (Rule) => Rule.max(70).warning('Longer titles get truncated by Google.')
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      description: 'The summary shown under the title in Google and in link previews. ~155 chars max.',
      validation: (Rule) => Rule.max(160).warning('Longer descriptions get truncated.')
    }),
    defineField({
      name: 'ogImage',
      title: 'Social share image',
      type: 'image',
      description: '1200x630 recommended. Used for WhatsApp, Facebook, Twitter, LinkedIn previews.',
      options: { hotspot: true }
    }),
    defineField({
      name: 'noIndex',
      title: 'Hide from search engines',
      type: 'boolean',
      description: 'Turn on to prevent Google from indexing this page.',
      initialValue: false,
      // Site-wide settings reuse this object for the default title, description
      // and share image. A site-wide no-index would pull the whole site out of
      // Google, so the toggle is hidden there (and ignored by the site).
      hidden: ({ document }) => document?._type === 'siteSettings'
    })
  ]
})

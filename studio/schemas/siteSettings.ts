import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({ name: 'siteName', type: 'string', initialValue: 'Train321' }),
    defineField({ name: 'tagline', type: 'string' }),
    defineField({ name: 'phone', type: 'string', initialValue: '561-325-7300' }),
    defineField({ name: 'email', type: 'string', initialValue: 'info@train321.com' }),
    defineField({
      name: 'social',
      type: 'object',
      fields: [
        { name: 'facebook', type: 'url' },
        { name: 'twitter', type: 'url' },
        { name: 'linkedin', type: 'url' },
        { name: 'instagram', type: 'url' },
        { name: 'youtube', type: 'url' }
      ]
    }),
    defineField({ name: 'defaultSeo', type: 'seo', title: 'Default SEO' })
  ]
})

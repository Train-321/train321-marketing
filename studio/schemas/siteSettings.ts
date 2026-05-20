import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  groups: [
    { name: 'identity', title: 'Identity' },
    { name: 'contact', title: 'Contact' },
    { name: 'footer', title: 'Footer' },
    { name: 'misc', title: 'Misc' }
  ],
  fields: [
    defineField({ name: 'siteName', type: 'string', initialValue: 'Train321', group: 'identity' }),
    defineField({ name: 'tagline', type: 'string', group: 'identity' }),

    defineField({ name: 'phone', type: 'string', initialValue: '561-325-7300', group: 'contact' }),
    defineField({ name: 'email', type: 'string', title: 'General email', initialValue: 'info@train321.com', group: 'contact' }),
    defineField({ name: 'supportEmail', type: 'string', initialValue: 'support@train321.com', group: 'contact' }),
    defineField({
      name: 'social',
      type: 'object',
      group: 'contact',
      fields: [
        { name: 'facebook', type: 'url' },
        { name: 'twitter', type: 'url' },
        { name: 'linkedin', type: 'url' },
        { name: 'instagram', type: 'url' },
        { name: 'youtube', type: 'url' }
      ]
    }),

    defineField({
      name: 'footerTagline',
      type: 'text',
      rows: 3,
      title: 'Footer tagline',
      group: 'footer',
      description: 'Short paragraph next to the logo at the bottom of every page.'
    }),
    defineField({
      name: 'footerColumns',
      type: 'array',
      title: 'Footer columns',
      group: 'footer',
      of: [{ type: 'footerColumn' }],
      description: 'Each column = a heading + a list of links.'
    }),
    defineField({
      name: 'footerLegalLinks',
      type: 'array',
      title: 'Footer legal links (bottom strip)',
      group: 'footer',
      of: [
        {
          type: 'object',
          name: 'navLink',
          fields: [
            { name: 'label', type: 'string' },
            { name: 'href', type: 'string', title: 'URL or path' }
          ],
          preview: { select: { title: 'label', subtitle: 'href' } }
        }
      ]
    }),
    defineField({
      name: 'newsletter',
      type: 'newsletter',
      title: 'Newsletter block',
      group: 'footer'
    }),

    defineField({
      name: 'companyStats',
      title: 'Company stats (about page)',
      type: 'array',
      group: 'misc',
      of: [{ type: 'labeledStat' }]
    }),
    defineField({
      name: 'trustLogos',
      title: 'Trust logos',
      type: 'array',
      group: 'misc',
      of: [{ type: 'trustLogo' }],
      description: 'Used by the home-page logo carousel and the testimonials page.'
    }),
    defineField({
      name: 'enrollBaseUrl',
      type: 'url',
      title: 'Enroll base URL',
      group: 'misc',
      initialValue: 'http://new-features.train321.com/#/enroll',
      description: 'Base URL for all "Enroll now" buttons. Query params like ?add=<id>&checkout=1 are appended automatically.'
    }),
    defineField({ name: 'defaultSeo', type: 'seo', title: 'Default SEO', group: 'misc' })
  ]
})

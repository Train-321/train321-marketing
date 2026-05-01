import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'servicesPage',
  title: 'Services / Pricing Page',
  type: 'document',
  fields: [
    defineField({ name: 'heroEyebrow', type: 'string' }),
    defineField({ name: 'heroHeading', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'heroLede', type: 'text', rows: 3 }),

    defineField({
      name: 'tiers',
      type: 'array',
      title: 'Pricing tiers',
      of: [
        {
          type: 'object',
          name: 'tier',
          fields: [
            { name: 'name', type: 'string', validation: (R) => R.required() },
            { name: 'audience', type: 'string', title: 'Audience tagline' },
            { name: 'price', type: 'string', title: 'Headline price' },
            { name: 'priceSub', type: 'string', title: 'Price sub-text' },
            { name: 'featured', type: 'boolean', title: 'Highlight as "Most popular"', initialValue: false },
            { name: 'features', type: 'array', of: [{ type: 'string' }] },
            { name: 'ctaLabel', type: 'string' },
            { name: 'ctaTo', type: 'string', title: 'CTA URL' }
          ],
          preview: { select: { title: 'name', subtitle: 'price' } }
        }
      ]
    }),

    defineField({ name: 'addonsHead', type: 'sectionHead', title: 'Add-ons section head' }),
    defineField({
      name: 'addons',
      type: 'array',
      title: 'Add-ons',
      of: [{ type: 'pillarCard' }]
    }),

    defineField({ name: 'bottomCta', type: 'ctaBlock', title: 'Bottom CTA' })
  ]
})

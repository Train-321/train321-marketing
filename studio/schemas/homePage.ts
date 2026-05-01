import { defineType, defineField } from 'sanity'

// One singleton, lots of content. Per-audience copy (self / team) lives in
// nested objects so the in-page audience toggle still works.
const audienceCopyFields = [
  defineField({ name: 'eyebrow', type: 'string' }),
  defineField({ name: 'h1Pre', type: 'string', title: 'Headline (first part)' }),
  defineField({ name: 'h1Em', type: 'string', title: 'Headline (italic part)' }),
  defineField({ name: 'lede', type: 'text', rows: 3 }),
  defineField({ name: 'ctaPrimary', type: 'callToAction', title: 'Primary CTA' }),
  defineField({ name: 'ctaGhost', type: 'callToAction', title: 'Secondary (ghost) CTA' }),
  defineField({ name: 'trustLabel', type: 'text', rows: 2, title: 'Logo-band tagline' }),
  defineField({ name: 'stepsTitle', type: 'string' }),
  defineField({ name: 'stepsLede', type: 'text', rows: 2 }),
  defineField({
    name: 'steps',
    type: 'array',
    title: 'How-it-works steps (3)',
    of: [{ type: 'howItWorksStep' }],
    validation: (R) => R.min(0).max(4)
  }),
  defineField({ name: 'bottomTitle', type: 'string' }),
  defineField({ name: 'bottomLede', type: 'text', rows: 2 }),
  defineField({ name: 'bottomCtaSecondary', type: 'callToAction', title: 'Bottom secondary CTA' })
]

export default defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero' },
    { name: 'audienceTeam', title: 'For-teams audience' },
    { name: 'audienceSelf', title: 'For-myself audience' },
    { name: 'pillars', title: 'Pillars' },
    { name: 'sections', title: 'Sections' }
  ],
  fields: [
    // Legacy/simple hero overrides (kept for backward compat). When the
    // per-audience nested objects below are filled, those take precedence.
    defineField({ name: 'heroEyebrow', type: 'string', group: 'hero' }),
    defineField({ name: 'heroHeadline', type: 'string', group: 'hero' }),
    defineField({ name: 'heroSubcopy', type: 'text', rows: 3, group: 'hero' }),
    defineField({ name: 'heroPrimaryCta', type: 'callToAction', group: 'hero' }),
    defineField({ name: 'heroSecondaryCta', type: 'callToAction', group: 'hero' }),
    defineField({ name: 'heroImage', type: 'image', options: { hotspot: true }, group: 'hero' }),

    defineField({
      name: 'heroTrustPills',
      type: 'array',
      title: 'Hero trust pills (under buttons)',
      group: 'hero',
      of: [
        {
          type: 'object',
          name: 'trustPill',
          fields: [
            { name: 'icon', type: 'string', title: 'Icon class' },
            { name: 'label', type: 'string' }
          ],
          preview: { select: { title: 'label', subtitle: 'icon' } }
        }
      ]
    }),

    defineField({
      name: 'audienceTeam',
      type: 'object',
      title: 'For-teams audience',
      group: 'audienceTeam',
      fields: audienceCopyFields
    }),
    defineField({
      name: 'audienceSelf',
      type: 'object',
      title: 'For-myself audience',
      group: 'audienceSelf',
      fields: audienceCopyFields
    }),

    defineField({ name: 'pillarsHead', type: 'sectionHead', title: 'Pillars section head', group: 'pillars' }),
    defineField({
      name: 'pillars',
      type: 'array',
      title: 'Pillar cards',
      group: 'pillars',
      of: [{ type: 'pillarCard' }]
    }),

    defineField({ name: 'popularHead', type: 'sectionHead', title: 'Popular courses section head', group: 'sections' }),
    defineField({ name: 'popularCtaLabel', type: 'string', title: 'Popular section "see all" label', group: 'sections', initialValue: 'See all courses' }),
    defineField({
      name: 'popularSlugs',
      type: 'array',
      title: 'Popular course slugs',
      description: 'Course slugs to surface in the home-page popular block (4 recommended).',
      group: 'sections',
      of: [{ type: 'string' }]
    }),

    defineField({ name: 'howHead', type: 'sectionHead', title: 'How-it-works section head', group: 'sections' }),

    defineField({ name: 'opinionsHead', type: 'sectionHead', title: 'What operators say (testimonials) section head', group: 'sections' }),
    defineField({ name: 'opinionsLinkLabel', type: 'string', initialValue: 'See all testimonials', group: 'sections' }),

    defineField({ name: 'faqTeaserHead', type: 'sectionHead', title: 'FAQ teaser section head', group: 'sections' }),
    defineField({ name: 'faqTeaserCtaLabel', type: 'string', initialValue: 'See all questions', group: 'sections' }),

    defineField({ name: 'bottomCta', type: 'ctaBlock', title: 'Bottom CTA band', group: 'sections' }),
    defineField({ name: 'seo', type: 'seo' })
  ]
})

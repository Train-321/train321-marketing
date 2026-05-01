import { defineType, defineField } from 'sanity'

// Shared copy for the course / blog / legal DETAIL templates.
// Per-document (course, blog post, legal page) content lives on the doc itself;
// the surrounding chrome (breadcrumbs, section eyebrows, sticky CTAs) lives here
// because it's the same on every detail page.
export default defineType({
  name: 'detailPagesCopy',
  title: 'Detail Pages (chrome copy)',
  type: 'document',
  groups: [
    { name: 'course', title: 'Course detail' },
    { name: 'blog', title: 'Blog post detail' },
    { name: 'legal', title: 'Legal page detail' }
  ],
  fields: [
    // ── Course ────────────────────────────────────────────────────────────
    defineField({ name: 'courseCrumbHome', type: 'string', initialValue: 'Home', group: 'course' }),
    defineField({ name: 'courseCrumbCourses', type: 'string', initialValue: 'Courses', group: 'course' }),
    defineField({ name: 'courseEnrollLabel', type: 'string', initialValue: 'Enroll now', group: 'course' }),
    defineField({ name: 'courseBrowseLabel', type: 'string', initialValue: 'Browse all courses', group: 'course' }),
    defineField({ name: 'courseGetStartedLabel', type: 'string', initialValue: 'Get started', group: 'course' }),
    defineField({ name: 'coursePriceFromLabel', type: 'string', initialValue: 'From', group: 'course' }),
    defineField({ name: 'coursePriceUnitLabel', type: 'string', initialValue: 'per seat', group: 'course' }),
    defineField({ name: 'coursePriceCustomAmt', type: 'string', initialValue: 'Custom', group: 'course' }),
    defineField({ name: 'coursePriceCustomUnit', type: 'string', initialValue: 'pricing', group: 'course' }),
    defineField({ name: 'courseGuarantee', type: 'string', title: 'Money-back guarantee line', initialValue: '60-day money-back guarantee on unused seats', group: 'course' }),
    defineField({ name: 'courseOverviewEyebrow', type: 'string', initialValue: 'Course overview', group: 'course' }),
    defineField({ name: 'courseOverviewHeading', type: 'string', initialValue: "What you'll get", group: 'course' }),
    defineField({ name: 'courseOutcomesHeading', type: 'string', initialValue: "By the end, you'll be able to", group: 'course' }),
    defineField({ name: 'courseCurriculumEyebrow', type: 'string', initialValue: 'Curriculum', group: 'course' }),
    defineField({ name: 'courseCurriculumHeading', type: 'string', initialValue: 'Inside the course', group: 'course' }),
    defineField({ name: 'courseCurriculumLedeTpl', type: 'string', title: 'Curriculum lede template', description: 'Use {n} for module count.', initialValue: '{n} modules — self-paced, with progress that saves automatically.', group: 'course' }),
    defineField({ name: 'courseCertEyebrow', type: 'string', initialValue: 'Your certificate', group: 'course' }),
    defineField({ name: 'courseCertHeading', type: 'string', initialValue: 'Official, instant, accepted', group: 'course' }),
    defineField({ name: 'courseCertVisualHead', type: 'string', initialValue: 'Certificate of Completion', group: 'course' }),
    defineField({ name: 'courseCertVisualMeta', type: 'string', initialValue: 'Train321 · ANSI-accredited', group: 'course' }),
    defineField({ name: 'courseCertDeliveryLabel', type: 'string', initialValue: 'Delivery', group: 'course' }),
    defineField({ name: 'courseCertValidityLabel', type: 'string', initialValue: 'Validity', group: 'course' }),
    defineField({ name: 'courseCertAcceptedLabel', type: 'string', initialValue: 'Accepted by', group: 'course' }),
    defineField({ name: 'courseFaqEyebrow', type: 'string', initialValue: 'FAQ', group: 'course' }),
    defineField({ name: 'courseFaqHeading', type: 'string', initialValue: 'Common questions', group: 'course' }),
    defineField({ name: 'courseBottomCta', type: 'ctaBlock', title: 'Course bottom CTA', group: 'course' }),

    // ── Blog ──────────────────────────────────────────────────────────────
    defineField({ name: 'blogCrumbJournal', type: 'string', initialValue: 'Journal', group: 'blog' }),
    defineField({ name: 'blogShareLabel', type: 'string', initialValue: 'Share', group: 'blog' }),
    defineField({ name: 'blogReadingMinSuffix', type: 'string', initialValue: 'min read', group: 'blog' }),
    defineField({ name: 'blogAuthorOrgSuffix', type: 'string', initialValue: 'Train321', group: 'blog' }),
    defineField({ name: 'blogRelatedHead', type: 'sectionHead', title: 'Related posts section head', group: 'blog' }),
    defineField({ name: 'blogRelatedReadLabel', type: 'string', initialValue: 'Read article', group: 'blog' }),
    defineField({ name: 'blogBottomCta', type: 'ctaBlock', title: 'Blog post bottom CTA', group: 'blog' }),

    // ── Legal ─────────────────────────────────────────────────────────────
    defineField({ name: 'legalCrumbHome', type: 'string', initialValue: 'Home', group: 'legal' }),
    defineField({ name: 'legalEyebrow', type: 'string', initialValue: 'Policy', group: 'legal' }),
    defineField({ name: 'legalEffectivePrefix', type: 'string', initialValue: 'Effective', group: 'legal' }),
    defineField({ name: 'legalTocLabel', type: 'string', initialValue: 'On this page', group: 'legal' })
  ]
})

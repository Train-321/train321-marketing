import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { presentationTool } from 'sanity/presentation'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas'
import { pexelsAssetSource } from './components/PexelsAssetSource'

const previewUrl = process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:3000'

export default defineConfig({
  name: 'train321-studio',
  title: 'Train321',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'your-project-id',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [
    structureTool({
      structure: (S) => {
        const single = (id: string, type: string, title: string) =>
          S.listItem()
            .title(title)
            .child(S.document().schemaType(type).documentId(id))

        const newestFirst = [{ field: 'publishedAt', direction: 'desc' as const }]

        // Posts split by live state. Sanity keeps an unpublished edit as a
        // separate `drafts.<id>` document, so "is it live?" is the same
        // question as "does a non-draft copy exist?" — and a draft whose
        // published twin is missing has never been published at all.
        const isDraft = '_id in path("drafts.**")'
        const hasPublishedTwin =
          'defined(*[_id == string::split(^._id, "drafts.")[1]][0]._id)'

        const postList = (title: string, filter: string) =>
          S.listItem()
            .title(title)
            .child(
              S.documentTypeList('blogPost')
                .title(title)
                .filter(`_type == "blogPost" && ${filter}`)
                .defaultOrdering(newestFirst)
            )

        const blog = S.listItem()
          .title('Blog')
          .child(
            S.list()
              .title('Blog')
              .items([
                postList('All posts', 'true'),
                postList('Published — live on the site', `!(${isDraft})`),
                postList('Drafts — not published yet', `${isDraft} && !${hasPublishedTwin}`),
                postList('Edited since publishing', `${isDraft} && ${hasPublishedTwin}`),
                postList('Featured on the Journal', 'featured == true'),
                S.divider(),
                single('blogIndexPage', 'blogIndexPage', 'Journal page settings')
              ])
          )

        return S.list()
          .title('Content')
          .items([
            single('siteSettings', 'siteSettings', 'Site Settings'),
            S.divider(),
            single('homePage', 'homePage', 'Home Page'),
            single('contactPage', 'contactPage', 'Contact Page'),
            single('demoPage', 'demoPage', 'Demo Page'),
            single('servicesPage', 'servicesPage', 'Services / Pricing Page'),
            single('aboutPage', 'aboutPage', 'About Page'),
            single('faqPage', 'faqPage', 'FAQ Page'),
            single('catalogPage', 'catalogPage', 'Catalog Page'),
            single('testimonialsPage', 'testimonialsPage', 'Testimonials Page'),
            single('detailPagesCopy', 'detailPagesCopy', 'Detail Pages (chrome)'),
            S.divider(),
            blog,
            S.divider(),
            S.documentTypeListItem('course').title('Courses'),
            S.documentTypeListItem('testimonial').title('Testimonials'),
            S.documentTypeListItem('faqItem').title('FAQ Items'),
            S.documentTypeListItem('service').title('Services'),
            S.documentTypeListItem('legalPage').title('Legal Pages'),
            S.documentTypeListItem('teamMember').title('Team Members')
          ])
      }
    }),
    presentationTool({
      previewUrl: {
        origin: previewUrl,
        previewMode: { enable: '/api/draft' }
      },
      resolve: {
        locations: {
          course: {
            select: { title: 'title', slug: 'slug.current' },
            resolve: (doc) => ({
              locations: [
                { title: doc?.title || 'Course', href: `/courses/${doc?.slug}` },
                { title: 'Catalog', href: '/catalog' }
              ]
            })
          },
          blogPost: {
            select: { title: 'title', slug: 'slug.current' },
            resolve: (doc) => ({
              locations: [
                { title: doc?.title || 'Post', href: `/blog/${doc?.slug}` },
                { title: 'Journal', href: '/blog' }
              ]
            })
          },
          legalPage: {
            select: { title: 'title', slug: 'slug.current' },
            resolve: (doc) => ({
              locations: [{ title: doc?.title || 'Page', href: `/legal/${doc?.slug}` }]
            })
          },
          testimonial: {
            select: { name: 'name' },
            resolve: () => ({ locations: [{ title: 'Testimonials', href: '/testimonials' }] })
          },
          faqItem: {
            select: { question: 'question' },
            resolve: () => ({ locations: [{ title: 'FAQ', href: '/faq' }] })
          },
          teamMember: {
            select: { name: 'name' },
            resolve: () => ({ locations: [{ title: 'About', href: '/about' }] })
          }
        }
      }
    }),
    visionTool()
  ],

  schema: {
    types: schemaTypes
  },

  form: {
    image: {
      // Adds a "Pexels" tab alongside Upload and Media library in every image
      // field, so a course hero can be filled from stock without a download /
      // re-upload round trip.
      assetSources: (prev) => [...prev, pexelsAssetSource]
    }
  }
})

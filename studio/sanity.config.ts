import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { presentationTool } from 'sanity/presentation'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas'

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
            single('blogIndexPage', 'blogIndexPage', 'Blog Index'),
            single('faqPage', 'faqPage', 'FAQ Page'),
            single('catalogPage', 'catalogPage', 'Catalog Page'),
            single('testimonialsPage', 'testimonialsPage', 'Testimonials Page'),
            single('detailPagesCopy', 'detailPagesCopy', 'Detail Pages (chrome)'),
            S.divider(),
            S.documentTypeListItem('course').title('Courses'),
            S.documentTypeListItem('blogPost').title('Blog Posts'),
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
  }
})

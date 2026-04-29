import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas'

export default defineConfig({
  name: 'train321-studio',
  title: 'Train321',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'your-project-id',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Site Settings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
              ),
            S.listItem()
              .title('Home Page')
              .child(
                S.document()
                  .schemaType('homePage')
                  .documentId('homePage')
              ),
            S.divider(),
            S.documentTypeListItem('course').title('Courses'),
            S.documentTypeListItem('blogPost').title('Blog Posts'),
            S.documentTypeListItem('testimonial').title('Testimonials'),
            S.documentTypeListItem('faqItem').title('FAQ Items'),
            S.documentTypeListItem('service').title('Services'),
            S.documentTypeListItem('legalPage').title('Legal Pages'),
            S.documentTypeListItem('teamMember').title('Team Members')
          ])
    }),
    visionTool()
  ],

  schema: {
    types: schemaTypes
  }
})

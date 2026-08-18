import { defineType, defineField } from 'sanity'
import { blogBodyMembers } from './objects/blogBody'

// One post shows in the big hero card at the top of /blog. Editors tick
// "featured" to choose it; without a pick the newest post takes the slot.
// Two featured posts is a mistake rather than an error, so this warns instead
// of blocking the publish.
const onlyOneFeatured = (R: any) =>
  R.custom(async (isFeatured: boolean | undefined, ctx: any) => {
    if (!isFeatured) return true
    const id = (ctx.document?._id || '').replace(/^drafts\./, '')
    const client = ctx.getClient({ apiVersion: '2025-01-01' })
    const other = await client.fetch(
      `*[_type == "blogPost" && featured == true && !(_id in [$id, $draftId])][0].title`,
      { id, draftId: `drafts.${id}` }
    )
    return other
      ? `"${other}" is also set as the featured post. Untick it there, or this one wins by publish date.`
      : true
  }).warning()

export default defineType({
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'media', title: 'Image' },
    { name: 'publishing', title: 'Publishing' },
    { name: 'seo', title: 'SEO' }
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      group: 'content',
      validation: (R) => R.required()
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      group: 'content',
      description: 'The address of the post: /blog/<slug>. Click Generate to build it from the title.',
      options: { source: 'title', maxLength: 96 },
      validation: (R) => R.required()
    }),
    defineField({
      name: 'excerpt',
      title: 'Subhead',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'One or two sentences. Shows under the title on the article and on the Journal cards.'
    }),
    defineField({
      name: 'category',
      type: 'string',
      group: 'content',
      description: 'Becomes a filter button on the Journal page. Reuse an existing name to group posts together.',
      options: {
        list: [
          { title: 'Compliance', value: 'Compliance' },
          { title: 'Food safety', value: 'Food safety' },
          { title: 'Alcohol service', value: 'Alcohol service' },
          { title: 'Operations', value: 'Operations' },
          { title: 'Company', value: 'Company' }
        ]
      }
    }),

    defineField({
      name: 'author',
      title: 'Author (team member)',
      type: 'reference',
      group: 'content',
      description: 'Pick a real person from Team Members. Leave empty to type a name by hand below.',
      to: [{ type: 'teamMember' }]
    }),
    defineField({
      name: 'authorName',
      title: 'Author name (if not a team member)',
      type: 'string',
      group: 'content',
      hidden: ({ document }) => Boolean(document?.author)
    }),
    defineField({
      name: 'authorRole',
      title: 'Author role (if not a team member)',
      type: 'string',
      group: 'content',
      hidden: ({ document }) => Boolean(document?.author)
    }),

    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      group: 'content',
      description:
        'Write like a document: style text with the toolbar, and use the + button to insert images, videos, or callout boxes anywhere.',
      of: blogBodyMembers
    }),

    defineField({
      name: 'coverImage',
      title: 'Featured image',
      type: 'image',
      group: 'media',
      description:
        'Shows on the Journal cards and at the top of the article. Landscape works best (roughly 1600×900). Without one, the coloured tile and icon below are used instead.',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Describes the image for screen readers and search engines.'
        })
      ]
    }),
    defineField({
      name: 'heroTone',
      title: 'Fallback tile colour',
      type: 'string',
      group: 'media',
      description: 'Used only when there is no featured image.',
      initialValue: 'accent',
      options: {
        list: [
          { title: 'Accent (blue)', value: 'accent' },
          { title: 'Warn (amber)', value: 'warn' },
          { title: 'Positive (green)', value: 'positive' },
          { title: 'Critical (red)', value: 'critical' }
        ]
      }
    }),
    defineField({
      name: 'heroIcon',
      title: 'Fallback tile icon',
      type: 'string',
      group: 'media',
      description: 'A Font Awesome class, e.g. "fas fa-clipboard-check". Used only when there is no featured image.',
      initialValue: 'fas fa-feather-alt'
    }),

    defineField({
      name: 'publishedAt',
      title: 'Publish date',
      type: 'datetime',
      group: 'publishing',
      description: 'Shown on the post and used to order the Journal — newest first.',
      initialValue: () => new Date().toISOString(),
      validation: (R) => R.required()
    }),
    defineField({
      name: 'featured',
      title: 'Feature this post on the Journal page',
      type: 'boolean',
      group: 'publishing',
      description: 'Puts this post in the large card at the top of /blog. Only one post can hold the slot.',
      initialValue: false,
      validation: onlyOneFeatured
    }),
    defineField({
      name: 'readMinutes',
      title: 'Read time (minutes)',
      type: 'number',
      group: 'publishing',
      validation: (R) => R.min(1).max(120)
    }),

    defineField({ name: 'seo', type: 'seo', group: 'seo' })
  ],

  orderings: [
    {
      title: 'Publish date, newest first',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }]
    },
    {
      title: 'Publish date, oldest first',
      name: 'publishedAtAsc',
      by: [{ field: 'publishedAt', direction: 'asc' }]
    },
    {
      title: 'Title A–Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }]
    }
  ],

  preview: {
    select: {
      title: 'title',
      category: 'category',
      publishedAt: 'publishedAt',
      featured: 'featured',
      media: 'coverImage',
      refAuthor: 'author.name',
      textAuthor: 'authorName'
    },
    prepare({ title, category, publishedAt, featured, media, refAuthor, textAuthor }) {
      const date = publishedAt
        ? new Date(publishedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
        : 'No date'
      const parts = [date, category, refAuthor || textAuthor].filter(Boolean)
      return {
        title: featured ? `★ ${title}` : title,
        subtitle: parts.join(' · '),
        media
      }
    }
  }
})

import { defineType, defineField, defineArrayMember } from 'sanity'

// Rich blog body: a real rich-text editor (Portable Text) instead of the old
// one-object-per-paragraph block list. Editors write continuously, style text
// inline (bold/italic/links), and drop images, videos or callouts anywhere in
// the flow. Legal pages still use the old bodyBlock list — this is blog-only.

export const videoEmbed = defineType({
  name: 'videoEmbed',
  title: 'Video',
  type: 'object',
  fields: [
    defineField({
      name: 'url',
      title: 'Video URL',
      type: 'url',
      description: 'A YouTube or Vimeo link, or a direct .mp4 file URL.',
      validation: (R) => R.required()
    }),
    defineField({
      name: 'caption',
      type: 'string',
      description: 'Optional caption shown under the video.'
    })
  ],
  preview: {
    select: { url: 'url', caption: 'caption' },
    prepare: ({ url, caption }) => ({
      title: caption || 'Video',
      subtitle: url
    })
  }
})

export const callout = defineType({
  name: 'callout',
  title: 'Callout',
  type: 'object',
  description: 'A highlighted tip box, set apart from the running text.',
  fields: [
    defineField({
      name: 'text',
      type: 'text',
      rows: 3,
      validation: (R) => R.required()
    })
  ],
  preview: {
    select: { title: 'text' },
    prepare: ({ title }) => ({ title: `💡 ${(title || '').slice(0, 70)}` })
  }
})

export const blogBodyMembers = [
  defineArrayMember({
    type: 'block',
    styles: [
      { title: 'Normal', value: 'normal' },
      { title: 'Heading 2', value: 'h2' },
      { title: 'Heading 3', value: 'h3' },
      { title: 'Quote', value: 'blockquote' }
    ],
    lists: [
      { title: 'Bullets', value: 'bullet' },
      { title: 'Numbers', value: 'number' }
    ],
    marks: {
      decorators: [
        { title: 'Bold', value: 'strong' },
        { title: 'Italic', value: 'em' },
        { title: 'Underline', value: 'underline' }
      ],
      annotations: [
        defineArrayMember({
          name: 'link',
          title: 'Link',
          type: 'object',
          fields: [
            defineField({
              name: 'href',
              title: 'URL',
              type: 'url',
              validation: (R) =>
                R.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] })
            })
          ]
        })
      ]
    }
  }),
  defineArrayMember({
    type: 'image',
    options: { hotspot: true },
    fields: [
      defineField({
        name: 'alt',
        title: 'Alt text',
        type: 'string',
        description: 'Describes the image for screen readers and search engines.'
      }),
      defineField({
        name: 'caption',
        type: 'string',
        description: 'Optional caption shown under the image.'
      })
    ]
  }),
  defineArrayMember({ type: 'videoEmbed' }),
  defineArrayMember({ type: 'callout' })
]

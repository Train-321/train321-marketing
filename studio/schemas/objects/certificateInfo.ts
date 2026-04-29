import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'certificateInfo',
  title: 'Certificate info',
  type: 'object',
  fields: [
    defineField({ name: 'delivery', type: 'string', description: 'e.g. "Instant digital PDF"' }),
    defineField({ name: 'validity', type: 'string', description: 'e.g. "3 years"' }),
    defineField({ name: 'accepted', type: 'string', description: 'Where the certificate is accepted' })
  ]
})

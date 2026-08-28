import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'certificateInfo',
  title: 'Certificate info',
  type: 'object',
  fields: [
    defineField({ name: 'delivery', type: 'string', description: 'e.g. "Instant digital PDF"' }),
    defineField({ name: 'validity', type: 'string', description: 'e.g. "3 years"' }),
    defineField({ name: 'accepted', type: 'string', description: 'Where the certificate is accepted' }),
    defineField({
      name: 'hideExpiration',
      title: 'Hide the expiration date on the sample certificate',
      type: 'boolean',
      description:
        'Tick this for courses whose real certificate carries no expiry date — California RBS, for example, runs on the ABC\'s own certification cycle. The sample certificate shown on the course page then lists only the completion date.',
      initialValue: false
    })
  ]
})

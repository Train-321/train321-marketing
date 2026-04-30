import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'newsletter',
  title: 'Newsletter block',
  type: 'object',
  fields: [
    defineField({ name: 'heading', type: 'string', initialValue: 'Stay in the loop' }),
    defineField({ name: 'sub', type: 'text', rows: 2, title: 'Subheading' }),
    defineField({ name: 'placeholder', type: 'string', initialValue: 'you@work.com' }),
    defineField({ name: 'buttonLabel', type: 'string', initialValue: 'Subscribe' }),
    defineField({ name: 'successText', type: 'string', initialValue: "Thanks — you're on the list." })
  ]
})

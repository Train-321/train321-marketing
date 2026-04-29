import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'callToAction',
  title: 'Call to action',
  type: 'object',
  fields: [
    defineField({ name: 'label', type: 'string', title: 'Button label' }),
    defineField({ name: 'url', type: 'string', title: 'Link URL' }),
    defineField({
      name: 'style',
      type: 'string',
      title: 'Style',
      options: {
        list: [
          { title: 'Primary', value: 'primary' },
          { title: 'Ghost', value: 'ghost' }
        ],
        layout: 'radio'
      },
      initialValue: 'primary'
    })
  ]
})

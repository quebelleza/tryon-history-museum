import {defineType, defineField} from 'sanity'

export const boardMember = defineType({
  name: 'boardMember',
  title: 'Board Member',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role / Title',
      type: 'string',
      options: {
        list: [
          {title: 'President', value: 'President'},
          {title: 'Vice President', value: 'Vice President'},
          {title: 'Treasurer', value: 'Treasurer'},
          {title: 'Secretary', value: 'Secretary'},
          {title: 'Board Member', value: 'Board Member'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'term',
      title: 'Term Year',
      type: 'string',
      description: 'e.g. "2026" or "2027"',
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'bio',
      title: 'Biography',
      type: 'text',
      rows: 6,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first',
      initialValue: 10,
    }),
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'role',
      media: 'photo',
    },
  },
})

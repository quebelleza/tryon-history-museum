import {defineType, defineField} from 'sanity'

export const membershipTier = defineType({
  name: 'membershipTier',
  title: 'Membership Tier',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Tier Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      description: 'Annual price in dollars (e.g. 50)',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'perks',
      title: 'Perks',
      type: 'text',
      rows: 3,
      description: 'Comma-separated list of benefits',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Featured Tier',
      type: 'boolean',
      initialValue: false,
      description: 'Highlight this tier visually',
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
      price: 'price',
    },
    prepare({title, price}) {
      return {
        title,
        subtitle: price ? `$${price}/year` : '',
      }
    },
  },
})

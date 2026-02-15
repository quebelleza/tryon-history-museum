import {defineType, defineField} from 'sanity'

export const event = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
      description: 'URL-friendly name for the event detail page',
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'time',
      title: 'Time',
      type: 'string',
      description: 'e.g. "2:00 PM" or "11:00 AM - 1:00 PM"',
    }),
    defineField({
      name: 'eventType',
      title: 'Event Type',
      type: 'string',
      options: {
        list: [
          {title: 'Lecture Series', value: 'Lecture Series'},
          {title: 'Walking Tour', value: 'Walking Tour'},
          {title: 'Presentation', value: 'Presentation'},
          {title: 'Special Exhibit Opening', value: 'Special Exhibit Opening'},
          {title: 'Community Event', value: 'Community Event'},
          {title: 'Member Event', value: 'Member Event'},
          {title: 'Tales of Tryon', value: 'Tales of Tryon'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'Leave blank if at the museum',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'featured',
      title: 'Featured on Homepage',
      type: 'boolean',
      initialValue: true,
      description: 'Show this event on the homepage',
    }),
  ],
  orderings: [
    {
      title: 'Event Date',
      name: 'dateAsc',
      by: [{field: 'date', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      date: 'date',
      eventType: 'eventType',
      media: 'image',
    },
    prepare({title, date, eventType, media}) {
      return {
        title,
        subtitle: `${date || 'No date'} — ${eventType || ''}`,
        media,
      }
    },
  },
})

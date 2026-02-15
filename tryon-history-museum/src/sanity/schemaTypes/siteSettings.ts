import {defineType, defineField} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'museumName',
      title: 'Museum Name',
      type: 'string',
      initialValue: 'Tryon History Museum & Visitor Center',
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'object',
      fields: [
        defineField({name: 'street', title: 'Street', type: 'string'}),
        defineField({name: 'city', title: 'City', type: 'string'}),
        defineField({name: 'state', title: 'State', type: 'string'}),
        defineField({name: 'zip', title: 'ZIP Code', type: 'string'}),
      ],
    }),
    defineField({
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
    }),
    defineField({
      name: 'hours',
      title: 'Operating Hours',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'day',
              title: 'Day(s)',
              type: 'string',
              description: 'e.g. "Wednesday" or "Sunday – Tuesday"',
            }),
            defineField({
              name: 'time',
              title: 'Hours',
              type: 'string',
              description: 'e.g. "1:00 PM – 4:00 PM" or "Closed"',
            }),
            defineField({
              name: 'dayOfWeek',
              title: 'Day of Week Number (0=Sun, 1=Mon, ...6=Sat)',
              type: 'number',
              description: 'Used for "Today\'s Hours" display. Leave blank for multi-day rows.',
            }),
          ],
          preview: {
            select: {
              title: 'day',
              subtitle: 'time',
            },
          },
        },
      ],
    }),
    defineField({
      name: 'admissionNote',
      title: 'Admission Note',
      type: 'string',
      description: 'e.g. "Free admission — donations gratefully accepted"',
    }),
    defineField({
      name: 'facebookUrl',
      title: 'Facebook URL',
      type: 'url',
    }),
    defineField({
      name: 'instagramUrl',
      title: 'Instagram URL',
      type: 'url',
    }),
    defineField({
      name: 'mapEmbedUrl',
      title: 'Google Maps Embed URL',
      type: 'url',
      description: 'The full embed URL for the Google Maps iframe',
    }),
    defineField({
      name: 'visitorCenterNote',
      title: 'Visitor Center Note',
      type: 'text',
      rows: 3,
      description: 'Short description about the museum also being a visitor center',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Site Settings',
      }
    },
  },
})

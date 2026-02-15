import { client } from './client'

export async function getUpcomingEvents(limit = 4) {
  const today = new Date().toISOString().split('T')[0]
  
  const query = `*[_type == "event" && date >= $today] | order(date asc) [0...$limit] {
    _id,
    title,
    slug,
    date,
    time,
    eventType,
    description,
    location,
    featured,
    image,
    "imageUrl": image.asset->url
  }`

  try {
    const events = await client.fetch(query, { today, limit })
    return events
  } catch (error) {
    console.error('Error fetching events from Sanity:', error)
    return []
  }
}

export async function getAllEvents() {
  const query = `*[_type == "event"] | order(date asc) {
    _id,
    title,
    slug,
    date,
    time,
    eventType,
    description,
    location,
    featured,
    image,
    "imageUrl": image.asset->url
  }`

  try {
    const events = await client.fetch(query)
    return events
  } catch (error) {
    console.error('Error fetching events from Sanity:', error)
    return []
  }
}

export async function getEventBySlug(slug) {
  const query = `*[_type == "event" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    date,
    time,
    eventType,
    description,
    location,
    featured,
    image,
    "imageUrl": image.asset->url
  }`

  try {
    const event = await client.fetch(query, { slug })
    return event
  } catch (error) {
    console.error('Error fetching event from Sanity:', error)
    return null
  }
}

import { client } from './client'
import { todayInEventZone, partitionEvents } from '@/lib/events/status'

export async function getUpcomingEvents(limit = 4) {
  const today = todayInEventZone()
  
  const query = `*[_type == "event" && date >= $today] | order(date asc) {
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
    const events = await client.fetch(query, { today })
    // Same status rule as the Events page: in-progress events stay upcoming
    // until their actual end time (America/New_York).
    return partitionEvents(events).upcoming.slice(0, limit)
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

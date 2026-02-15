import { client } from './client'

export async function getAllExhibits() {
  const query = `*[_type == "exhibit"] | order(order asc) {
    _id,
    title,
    slug,
    description,
    startDate,
    endDate,
    isPermanent,
    featured,
    order,
    "coverImageUrl": coverImage.asset->url
  }`

  try {
    const exhibits = await client.fetch(query)
    return exhibits
  } catch (error) {
    console.error('Error fetching exhibits from Sanity:', error)
    return []
  }
}

export async function getExhibitBySlug(slug) {
  const query = `*[_type == "exhibit" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    longDescription,
    startDate,
    endDate,
    isPermanent,
    featured,
    "coverImageUrl": coverImage.asset->url,
    gallery[] {
      caption,
      "url": asset->url
    }
  }`

  try {
    const exhibit = await client.fetch(query, { slug })
    return exhibit
  } catch (error) {
    console.error('Error fetching exhibit from Sanity:', error)
    return null
  }
}

export async function getFeaturedExhibits() {
  const query = `*[_type == "exhibit" && featured == true] | order(order asc) {
    _id,
    title,
    slug,
    description,
    isPermanent,
    "coverImageUrl": coverImage.asset->url
  }`

  try {
    const exhibits = await client.fetch(query)
    return exhibits
  } catch (error) {
    console.error('Error fetching featured exhibits from Sanity:', error)
    return []
  }
}

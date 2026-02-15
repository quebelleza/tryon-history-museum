import { client } from './client'

export async function getSiteSettings() {
  const query = `*[_type == "siteSettings" && _id == "siteSettings"][0] {
    museumName,
    address,
    phone,
    email,
    hours,
    admissionNote,
    facebookUrl,
    instagramUrl,
    mapEmbedUrl,
    visitorCenterNote
  }`

  try {
    const settings = await client.fetch(query)
    return settings
  } catch (error) {
    console.error('Error fetching site settings from Sanity:', error)
    return null
  }
}

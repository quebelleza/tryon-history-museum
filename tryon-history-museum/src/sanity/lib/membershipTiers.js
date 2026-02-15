import { client } from './client'

export async function getAllMembershipTiers() {
  const query = `*[_type == "membershipTier"] | order(order asc) {
    _id,
    name,
    price,
    perks,
    featured,
    order
  }`

  try {
    const tiers = await client.fetch(query)
    return tiers
  } catch (error) {
    console.error('Error fetching membership tiers from Sanity:', error)
    return []
  }
}

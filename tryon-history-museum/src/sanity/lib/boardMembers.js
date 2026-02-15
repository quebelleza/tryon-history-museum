import { client } from './client'

export async function getAllBoardMembers() {
  const query = `*[_type == "boardMember"] | order(order asc) {
    _id,
    name,
    role,
    term,
    bio,
    order,
    "photoUrl": photo.asset->url
  }`

  try {
    const members = await client.fetch(query)
    return members
  } catch (error) {
    console.error('Error fetching board members from Sanity:', error)
    return []
  }
}

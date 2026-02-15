import {page} from './page'
import {event} from './event'
import {boardMember} from './boardMember'
import {membershipTier} from './membershipTier'
import {siteSettings} from './siteSettings'
import {exhibit} from './exhibit'

export const schema = {
  types: [page, event, boardMember, membershipTier, siteSettings, exhibit],
}

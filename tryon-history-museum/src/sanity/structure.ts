import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // Site Settings singleton
      S.listItem()
        .title('Site Settings')
        .id('siteSettings')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
        ),
      S.divider(),
      // Content types
      S.documentTypeListItem('event').title('Events'),
      S.documentTypeListItem('exhibit').title('Exhibits'),
      S.documentTypeListItem('boardMember').title('Board Members'),
      S.documentTypeListItem('membershipTier').title('Membership Tiers'),
      S.divider(),
      S.documentTypeListItem('page').title('Pages'),
    ])

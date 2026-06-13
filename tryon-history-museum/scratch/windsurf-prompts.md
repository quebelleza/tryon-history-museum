# Windsurf Prompts for Tryon History Museum Site

You'll paste these into Windsurf's Cascade (one at a time). Each prompt is self-contained
and gives Windsurf the context it needs. Before you run the prompts, place the three
component files in a scratch location Windsurf can reference:

  - tales-of-tryon.jsx
  - history-bits-hub.jsx
  - history-bits-category.jsx

I recommend placing them in a `/tmp/` or `/scratch/` folder at the root of your repo,
or just pasting the file contents inline with each prompt.

---

## PROMPT 1 — Tales of Tryon Page

Copy everything between the ===== lines into Cascade.

=====

I need to add a new page at `/tales-of-tryon` to our Next.js App Router project
(Tryon History Museum site, deployed on Vercel).

I have a complete, working React component in `tales-of-tryon.jsx` (in the scratch
directory — please read it before starting). It's a single default-exported functional
component. It uses Tailwind CSS, lucide-react icons, and the fonts Cormorant Garamond
and DM Sans loaded inline via a Google Fonts `@import` inside a `<style>` tag.

Please do the following:

1. **Create the route** at `app/tales-of-tryon/page.jsx` (or `.tsx` if the rest of the
   project is TypeScript — match the existing convention). Look at
   `app/board/page.jsx` or whichever existing page is closest in structure to see how
   we wire pages in this codebase, and match that pattern exactly.

2. **Move the component contents** from the scratch file into the new page file.
   Keep the component structure intact. If the codebase uses `'use client'`, add that
   at the top since the component uses `useState` and `useMemo`.

3. **Remove the inline `@import` for Google Fonts** from the `<style>` block and
   instead load Cormorant Garamond and DM Sans using `next/font/google` in the root
   `layout.jsx` (if they aren't already loaded). If they are already loaded, just
   reference the existing CSS variables — don't duplicate font loading.

4. **Keep the `.line-clamp-3` utility** either in the page's `<style>` block or move
   it to the global CSS. It's needed for the card descriptions.

5. **Verify `lucide-react` is installed.** If not, add it to `package.json`.

6. **Update the site navigation** so the Events menu item "Tales of Tryon" points to
   `/tales-of-tryon` (it currently points to `/events`). Check `components/Header.jsx`
   or wherever the nav is defined and wire it up. Also update any footer nav links.

7. **Do not modify the `lectures` array or the component logic.** The content is final.

8. **SEO metadata.** Add a `metadata` export or `generateMetadata` function to the
   page with:
     - Title: "Tales of Tryon — Lecture Archive | Tryon History Museum"
     - Description: "A growing archive of 31 recorded lectures with historians,
       residents, and scholars on the people, places, and stories of Tryon, North
       Carolina."

9. **Test locally** by running `npm run dev` and visiting `/tales-of-tryon`. Verify
   all YouTube thumbnails load, the filter bar works, and clicking any card opens
   the modal with the embedded video.

Match the conventions already in the codebase. Don't introduce new patterns unless
the existing ones are broken. When finished, summarize what you changed in a short
commit-message-style list.

=====

---

## PROMPT 2 — History Bits Hub Page

Copy everything between the ===== lines into Cascade.

=====

I need to add a new page at `/history-bits` to our Next.js App Router project.

I have a complete, working React component in `history-bits-hub.jsx` (in the scratch
directory — please read it before starting). It's the landing page that routes to
three sub-categories: Notable People, Cultural History, and Historic Places.

Please do the following:

1. **Create the route** at `app/history-bits/page.jsx`, matching the file extension
   convention of the existing pages.

2. **Move the component contents** into the page file. Add `'use client'` at the top
   if the project uses client components by default for anything interactive.
   This component doesn't strictly need it (no hooks), but match the rest of the site.

3. **Replace the inline Google Fonts `@import`** with references to the fonts loaded
   in `layout.jsx` via `next/font/google`. Don't duplicate font loading.

4. **Category images.** The component currently references external Squarespace CDN
   URLs as placeholder images. Download these three images and save them locally in
   the `public/history-bits/` folder, then update the `image` field in each category
   object to reference the local path:
     - Notable People → `public/history-bits/notable-people-hero.jpg` (currently
       points to a Nina Simone image)
     - Cultural History → `public/history-bits/cultural-history-hero.jpg`
       (currently a Morris the Horse image)
     - Historic Places → `public/history-bits/historic-places-hero.jpg` (currently
       a Lanier Library image)
   If downloading isn't easy in this environment, leave the external URLs in place
   and note that as a TODO.

5. **Update the site navigation** so the Events menu item "History Bits" points to
   `/history-bits` (it currently points to `#`). Check `components/Header.jsx` or
   wherever the nav is defined.

6. **SEO metadata.** Add:
     - Title: "History Bits | Tryon History Museum"
     - Description: "An informal companion to the museum's collection — the people,
       places, and traditions that make up Tryon's story."

7. **Test locally** at `/history-bits`. Verify all three category rows render, the
   hover states work, and the "Explore" links point to `/history-bits/notable-people`,
   `/history-bits/cultural-history`, and `/history-bits/historic-places`.

Match the conventions already in the codebase.

=====

---

## PROMPT 3 — History Bits Category Pages (all three)

Copy everything between the ===== lines into Cascade.

=====

I need to add three category listing pages under `/history-bits` to our Next.js App
Router project.

I have a single reusable React component in `history-bits-category.jsx` (in the
scratch directory — please read it before starting). The component accepts a
`categorySlug` prop and renders the page for that category. The three categories are:
  - `notable-people` (15 entries)
  - `cultural-history` (3 entries)
  - `historic-places` (3 entries)

Please do the following:

1. **Create a dynamic route** at `app/history-bits/[category]/page.jsx`. This single
   route file should handle all three categories by reading the slug from params.

2. **Refactor the component** so that instead of a `categorySlug` prop with a
   URL-hash-driven preview selector, it reads the category from the URL params.
   REMOVE the "Category Selector" div near the top of the file marked with the
   comment `{/* Category Selector (for this artifact preview only - remove in real app) */}`.
   That was just for the preview artifact — it has no business being on the live site.

3. **Generate static params** for the three valid category slugs using
   `generateStaticParams` so Next.js pre-renders all three at build time.
   Return 404 (via `notFound()`) for any slug that isn't one of the three.

4. **Move the `categories` data object** out of the component file and into a shared
   module — ideally `lib/historyBitsData.js` or similar. That way the hub page, the
   category page, and any future detail pages can all import from the same source.

5. **The entry cards currently link to external Squarespace URLs** (`entry.oldSiteUrl`)
   as a temporary fallback since detail pages haven't been built yet. Keep this
   behavior for now, but:
     - Leave a clear `// TODO:` comment where the link is set up
     - When we build detail pages later, we'll swap `oldSiteUrl` for a real route
       like `/history-bits/{categorySlug}/{entry.slug}`
     - For now the link should `target="_blank"` and `rel="noopener noreferrer"`

6. **Entry images.** All 21 entries reference external Squarespace CDN URLs. For
   now, leave them pointing at the external URLs — migrating all 21 images is a
   separate task we'll do when we build the detail pages. Just note this as a TODO.

7. **Replace the inline Google Fonts `@import`** with the `next/font/google` setup
   from layout.jsx.

8. **SEO metadata.** Use `generateMetadata` to dynamically set the page title based
   on the category slug:
     - `/history-bits/notable-people` → "Notable People | History Bits | Tryon History Museum"
     - `/history-bits/cultural-history` → "Cultural History | History Bits | Tryon History Museum"
     - `/history-bits/historic-places` → "Historic Places | History Bits | Tryon History Museum"

9. **Test locally** — visit each of the three category URLs, verify the grid renders
   with all entries, and confirm each card opens the correct Squarespace page in a
   new tab.

Match the conventions already in the codebase.

=====

---

## AFTER ALL THREE PROMPTS ARE DONE

Please run these final checks manually (or ask Windsurf to):

1. `npm run build` — no build errors
2. `npm run lint` — no lint errors
3. All nav links resolve (no `#` placeholders remaining in the top nav for these three
   pages)
4. On the homepage, update the Events section nav to point to:
     - "Tales of Tryon" → `/tales-of-tryon`
     - "History Bits" → `/history-bits`
5. Commit with a clear message like: "Migrate Tales of Tryon + History Bits from old
   site. Adds /tales-of-tryon, /history-bits, and /history-bits/[category] routes with
   31 lectures and 21 content entries."
6. Push to main; Vercel will deploy.

---

## NOTES ON FOLLOW-UP SESSIONS

The 21 detail pages under History Bits (Nina Simone, Morris the Horse, the Lanier
Library, etc.) still exist on the old Squarespace site and are the next piece of
migration work. Each entry's `oldSiteUrl` in `lib/historyBitsData.js` points to the
source material. We'll migrate these 3–5 at a time in follow-up sessions so each gets
a proper editorial rewrite rather than a rushed copy-paste.

Known content items still to verify with Heather:
  - Dr. M.C. Palmer on current homepage vs. Dr. Marion Palmer in the archive
    (may be the same person, may be an upcoming separate event)
  - Lanier Library founding date (I wrote 1890 in the History Bits entry; verify)
  - Good Shepherd Episcopal Church — racial/community history claim
  - Dorothy Mabel Reed Mendenhall — "retired to Tryon" claim
  - Lilian Jackson Braun — Tryon residency timeline
  - The Rosenwald Schools — Polk County specificity

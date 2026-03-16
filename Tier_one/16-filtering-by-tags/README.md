# Step 16 - Filtering by Tags

Query-parameter filtering with a `TagFilter` UI and a Prisma index for performance.

## Goal

Let users filter entries by tag. The server accepts `?tag=react` on the entries
endpoint and returns only matching rows. A new `/api/entries/tags` endpoint
supplies the list of available tags. On the frontend a `<select>` dropdown and
`useSearchParams` keep the active filter in the URL.

## What You'll Practice

| Concept               | Where it appears                     |
| --------------------- | ------------------------------------ |
| Query parameters      | `server/routes/entries.ts` `GET /`   |
| New API endpoint      | `GET /api/entries/tags`              |
| Prisma `contains`     | `entries.ts` – `findMany` where      |
| Database indexing      | `prisma/schema.prisma` `@@index`     |
| `useSearchParams`     | `TagFilter.tsx`, `App.tsx`           |
| Controlled `<select>` | `TagFilter.tsx`                      |
| Re-fetching on change | `App.tsx` – `loadEntries(tag)`       |

## Key Changes from Step 15

### Backend - `server/routes/entries.ts`

1. **`GET /`** now reads `req.query.tag`. When a tag is present, Prisma filters
   with `{ tags: { contains: tag } }`.
2. **`GET /tags`** (new) queries every entry, splits the comma-separated `tags`
   column, de-duplicates, and returns a sorted array.
3. The `/tags` route is registered **before** `/:id` so Express doesn't treat
   `"tags"` as an ID.

### Backend - `prisma/schema.prisma`

Added `@@index([tags], name: "idx_entry_tags")` to speed up `contains` queries.

### Frontend - `src/api/entries.ts`

- `fetchEntries(tag?)` appends `?tag=` when a tag is provided.
- New `fetchTags()` function calls `GET /api/entries/tags`.

### Frontend - `src/components/TagFilter.tsx` (new)

A `<select>` dropdown that lists every tag. Selecting a tag updates
`searchParams` via `useSearchParams` and calls `onTagChange(tag)`.

### Frontend - `src/components/EntryCard.tsx`

Tag badges are now clickable buttons. Clicking one triggers `onTagClick(tag)`
which sets the filter to that tag.

### Frontend - `src/App.tsx`

- `EntriesPage` receives `onReload` and calls `loadEntries(tag)` whenever the
  filter changes.
- The heading reflects the active filter and count.

## Steps

1. Copy `.env` from a previous full-stack step and update if needed.
2. `npm install`
3. `npx prisma generate`
4. `npx prisma db push` - creates the new index on the `tags` column.
5. `npm run dev`
6. Open <http://localhost:5173> → Entries → use the tag dropdown to filter.
7. Click a tag badge on any entry card - the filter updates.
8. Check the URL: it should show `?tag=react` (or whichever tag you picked).

## ✅ Check Your Work

- [ ] `GET /api/entries?tag=react` returns only entries whose tags contain "react".
- [ ] `GET /api/entries/tags` returns a sorted, de-duplicated array of tag strings.
- [ ] The tag dropdown lists every tag in the database.
- [ ] Selecting "All tags" clears the filter and reloads everything.
- [ ] Clicking a tag badge on an entry card activates that filter.
- [ ] The URL `?tag=` updates when filtering and is removed when clearing.
- [ ] `npm run build` succeeds with no errors.

## 🚫 Don't

- Don't filter on the client side - filtering happens in Prisma on the server.
- Don't store the filter in React state alone - keep it in `searchParams` so the
  URL is shareable.
- Don't forget `@@index` - without it, `contains` does a full table scan.

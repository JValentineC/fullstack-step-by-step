# Step 17 - Pagination and Sorting

Server-side pagination with `skip`/`take`, sortable columns, and frontend controls.

## Goal

Return entries in pages instead of all at once. The API accepts `page`, `limit`,
`sort`, and `order` query parameters and returns a paginated envelope. The
frontend shows **Previous / Next** buttons, a sort dropdown, and keeps
everything in the URL via `useSearchParams`.

## What You'll Practice

| Concept                 | Where it appears                          |
| ----------------------- | ----------------------------------------- |
| `skip` / `take`         | `server/routes/entries.ts` – `findMany`   |
| `prisma.count`          | `entries.ts` – total count for page math  |
| `Promise.all`           | Run `findMany` + `count` in parallel      |
| Sort-column whitelist   | `entries.ts` – prevent injection          |
| `@@index([createdAt])`  | `prisma/schema.prisma` – pagination perf  |
| Paginated JSON envelope | `{ data, page, limit, total, totalPages }`|
| `Pagination` component  | `src/components/Pagination.tsx`           |
| `SortControls` component| `src/components/SortControls.tsx`         |
| `useSearchParams`       | `App.tsx` – all controls sync to the URL  |
| `URLSearchParams`       | `src/api/entries.ts` – build query string |

## Key Changes from Step 16

### Backend - `server/routes/entries.ts`

1. **`GET /`** now reads `page`, `limit`, `sort`, `order` query params in
   addition to `tag`.
2. **Sort whitelist** - only `createdAt`, `title`, `mood` are allowed; anything
   else defaults to `createdAt`. This prevents arbitrary column access.
3. **`limit` is capped** at 100 and floored at 1.
4. Two Prisma calls run in parallel via `Promise.all`:
   - `findMany` with `skip`, `take`, `orderBy`, and optional `where`
   - `count` with the same `where`
5. Response shape changes from a flat array to:
   ```json
   { "data": [...], "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
   ```

### Backend - `prisma/schema.prisma`

Added `@@index([createdAt], name: "idx_entry_created")` for efficient
`ORDER BY createdAt` pagination.

### Frontend - `src/data/entries.ts`

New `PaginatedResponse` interface matching the server envelope.

### Frontend - `src/api/entries.ts`

- `fetchEntries` now accepts a `FetchEntriesParams` object (`tag`, `page`,
  `limit`, `sort`, `order`) and builds a dynamic query string.
- Returns `PaginatedResponse` instead of `ApiEntry[]`.

### Frontend - `src/components/Pagination.tsx` (new)

Previous / Next buttons with "Page X of Y (N entries)" text. Hidden when
there's only one page.

### Frontend - `src/components/SortControls.tsx` (new)

Two `<select>` dropdowns: sort field (Date / Title / Mood) and order
(Newest first / Oldest first).

### Frontend - `src/components/TagFilter.tsx`

Updated to preserve other search params when changing the tag, and resets
`page` to 1 on filter change.

### Frontend - `src/App.tsx`

- `EntriesPage` reads `sort`, `order`, `page` from `searchParams`.
- All controls (tag, sort, order, pagination) call `updateParams` which
  merges into `searchParams` and triggers `onReload`.
- Pagination rendered above and below the entry list.
- `loadEntries` accepts `FetchEntriesParams` and updates `page`, `totalPages`,
  `total` state from the envelope.
- After creating an entry, `loadEntries()` is called to refresh the first page.

## Steps

1. Copy `.env` from a previous full-stack step and update if needed.
2. `npm install`
3. `npx prisma generate`
4. `npx prisma db push` - creates the new `idx_entry_created` index.
5. `npm run dev`
6. Open <http://localhost:5173> → Entries.
7. Try the sort dropdowns - switch between Date / Title / Mood.
8. If you have more than 10 entries, use Previous / Next to paginate.
9. Combine tag filter + sorting + pagination - the URL updates for each.

## Helpful Hints

- `skip = (page - 1) * limit` - this is the standard offset formula.
- `Promise.all([findMany, count])` runs both queries at the same time, which is
  faster than running them one after another.
- Always whitelist sort columns. Never pass user input directly to `orderBy`.
- Capping `limit` at 100 prevents a client from requesting the entire table.

## ✅ Check Your Work

- [ ] `GET /api/entries` returns `{ data, page, limit, total, totalPages }`.
- [ ] `GET /api/entries?page=2&limit=5` returns the second page of 5 items.
- [ ] `GET /api/entries?sort=title&order=asc` returns entries sorted by title A–Z.
- [ ] `GET /api/entries?tag=react&page=1` filters and paginates together.
- [ ] An invalid `sort` value (e.g. `?sort=password`) defaults to `createdAt`.
- [ ] Pagination buttons appear only when there's more than one page.
- [ ] Clicking Next / Previous updates the URL `?page=` and fetches new data.
- [ ] Sort and order dropdowns update the URL and re-fetch.
- [ ] `npm run build` succeeds with no errors.

## 🚫 Don't

- Don't pass user input directly to `orderBy` - always whitelist columns.
- Don't skip `count` - without it you can't compute `totalPages`.
- Don't paginate on the client - filtering and pagination happen on the server.
- Don't forget `@@index([createdAt])` - it speeds up the most common sort.

## Stretch

- Add a "per page" dropdown (5 / 10 / 25) that updates `limit` in the URL.
- Show page numbers (1, 2, 3 …) instead of just Previous / Next.

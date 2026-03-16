# Step 31 - Show Entry Author

## Goal

Display the **username** of whoever created each entry. On the backend,
JOIN the User table when querying entries so the API returns an `author`
field. On the frontend, update the types and render "by username" on
every entry card.

## What You'll Practice

| Skill | How |
|---|---|
| SQL JOINs | LEFT JOIN User on Entry.userId to include the author name |
| Aliasing columns | `u.username AS author` adds a virtual column to results |
| Updating TypeScript types | Add `author` to both `ApiEntry` and `Entry` interfaces |
| Null handling | Entries without a userId display no author (LEFT JOIN returns NULL) |
| Conditional rendering | Only show "by username" when `author` is not null |

## Prerequisites

- Completed **Step 30** (Responsive Navbar with Hamburger Menu)
- Familiar with SQL SELECT and JOIN syntax
- Understand TypeScript interfaces and optional/nullable fields

## Step-by-Step Instructions

### 1. Copy the previous step

```bash
cp -r 30-responsive-navbar 31-show-entry-author
cd 31-show-entry-author
npm install
```

### 2. Update the entry list query with a LEFT JOIN

Open `server/routes/entries.ts`. The current `GET /` route selects all
columns from `Entry`:

```ts
// Before
const dataSql = `SELECT * FROM Entry${whereClause} ORDER BY ...`
```

Change it to JOIN the User table and return the author's username:

```ts
// After
const dataSql = `SELECT e.*, u.username AS author FROM Entry e LEFT JOIN User u ON e.userId = u.id${whereClause} ORDER BY e.`${sort}` ${order} LIMIT ? OFFSET ?`
const countSql = `SELECT COUNT(*) AS total FROM Entry e${whereClause}`
```

Also update the WHERE clause to use the `e.` alias:

```ts
whereClause = ' WHERE e.tags LIKE ?'
```

**Why LEFT JOIN?** Some entries may have `userId = NULL` (e.g., entries
created before authentication was added). A LEFT JOIN returns those
entries with `author = null` instead of dropping them entirely.

### 3. Update the single-entry query

In the same file, update `GET /:id`:

```ts
// Before
'SELECT * FROM Entry WHERE id = ?'

// After
'SELECT e.*, u.username AS author FROM Entry e LEFT JOIN User u ON e.userId = u.id WHERE e.id = ?'
```

### 4. Return author on create and update

After an INSERT or UPDATE, the re-fetch query that returns the new entry
also needs the JOIN:

```ts
// After INSERT (POST /)
'SELECT e.*, u.username AS author FROM Entry e LEFT JOIN User u ON e.userId = u.id WHERE e.id = ?'

// After UPDATE (PUT /:id)
'SELECT e.*, u.username AS author FROM Entry e LEFT JOIN User u ON e.userId = u.id WHERE e.id = ?'
```

### 5. Add `author` to the frontend types

Open `src/data/entries.ts`. Add `author` to both interfaces:

```ts
export interface Entry {
  id: number
  title: string
  summary: string
  mood: Mood
  tags: string[]
  createdAt: string
  updatedAt: string
  author: string | null       // <- NEW
}

export interface ApiEntry {
  id: number
  title: string
  summary: string
  mood: string
  tags: string
  createdAt: string
  updatedAt: string
  author: string | null       // <- NEW
}
```

Update `toEntry()` to pass the author through:

```ts
export function toEntry(raw: ApiEntry): Entry {
  return {
    ...raw,
    mood: raw.mood as Mood,
    tags: raw.tags
      ? raw.tags.split(',').map((t) => t.trim()).filter((t) => t !== '')
      : [],
    author: raw.author ?? null,   // <- NEW
  }
}
```

### 6. Display the author on EntryCard

Open `src/components/EntryCard.tsx`. Add the author between the date
and the mood badge:

```tsx
<p className="text-sm opacity-70">
  <time dateTime={entry.createdAt}>
    {new Date(entry.createdAt).toLocaleDateString()}
  </time>
  {entry.author && <>{' · '}<span>by {entry.author}</span></>}
  {' · '}
  <span className="badge badge-outline badge-sm">{entry.mood}</span>
</p>
```

The `entry.author &&` guard means entries with no author (NULL) simply
skip the "by ..." text - no "by undefined" or empty space.

## Helpful Hints

<details>
<summary>What does LEFT JOIN vs INNER JOIN mean here?</summary>

- **LEFT JOIN**: Return all entries, even if they have no matching user
  (`userId IS NULL`). The `author` column will be `null` for those rows.
- **INNER JOIN**: Only return entries that have a matching user. Orphan
  entries would be silently dropped from results.

Since some entries may predate the auth system, LEFT JOIN is safer.
</details>

<details>
<summary>Why alias the tables?</summary>

Using `Entry e` and `User u` keeps the query shorter and avoids
ambiguity. Without aliases, `SELECT *, username FROM Entry LEFT JOIN User ...`
would work, but `SELECT *` from two tables can produce duplicate column
names (`id`, `createdAt`). Using `e.*` ensures you only get Entry
columns, plus the explicit `u.username AS author`.
</details>

<details>
<summary>Do I need to change the database schema?</summary>

No. The `userId` foreign key on Entry and the `username` column on User
already exist from Steps 18 and 26. This step only changes the SELECT
queries - no ALTER TABLE or migration needed.
</details>

## Do / Don't

| Do | Don't |
|---|---|
| Use LEFT JOIN to keep entries with no author | Use INNER JOIN (you'd lose orphan entries) |
| Alias tables (`Entry e`, `User u`) for clarity | Mix aliased and unaliased column references |
| Use `e.tags` in WHERE clauses after adding the alias | Leave bare `tags` (ambiguous when joining) |
| Guard with `entry.author &&` before rendering | Show "by null" or "by undefined" on the card |
| Add `author` to both `ApiEntry` and `Entry` types | Forget one - TypeScript will catch you |

## Check Your Work

- [ ] Start the backend: `npm run dev`
- [ ] Open the entries list - each card should show "by username" after the date
- [ ] Entries created before auth was added should show the date and mood with no author text (no "by null")
- [ ] Create a new entry while logged in - it should immediately show your username
- [ ] Check the API directly: `curl http://localhost:4000/api/entries` - each object in `data` should have an `"author"` field

## Stretch

- Show the author's avatar or initials next to their name (you'll need
  to add a `profileUrl` or `initials` field to User in a future step).
- Make the author name a clickable link that filters entries by that user
  (add a `?userId=` query parameter to the entries API).

# Step 36 -- Entry Visibility

## Goal

Add a visibility selector (Public / Friends / Private) to the entry form, show visibility icons on entry cards, and persist the value through the backend.

## What You'll Practice

- Adding a new field to a form component and threading it through callbacks
- Validating and whitelisting enum values on the backend
- Conditional rendering of badges/icons based on data
- Updating an API layer and demo-data layer in parallel
- Building dynamic SQL (conditionally including a column in UPDATE)

## Prerequisites

- Step 35 completed (user profiles frontend)
- The `visibility` column already exists on the Entry table (added in Step 33)

## Step-by-Step Instructions

### 1. Copy the previous step

```bash
cp -r 35-user-profiles-frontend 36-entry-visibility
cd 36-entry-visibility
```

### 2. Add visibility selector to EntryForm

Open `src/components/EntryForm.tsx`. Add a `VISIBILITIES` constant and a `Visibility` type, then wire a new `<select>` into the form.

**Add the constant and type after the MOODS array:**

```tsx
const VISIBILITIES = ['PUBLIC', 'FRIENDS', 'PRIVATE'] as const
type Visibility = (typeof VISIBILITIES)[number]
```

**Update the `EntryFormProps` interface** to accept and emit visibility:

```tsx
interface EntryFormProps {
  initial?: { title: string; content: string; mood: Mood; tags: string; visibility?: string }
  onSubmit: (title: string, content: string, mood: Mood, tags: string[], visibility: string) => void
  submitLabel?: string
}
```

**Add visibility state** inside the component:

```tsx
const [visibility, setVisibility] = useState<Visibility>(
  (initial?.visibility as Visibility) ?? 'PUBLIC'
)
```

**Pass visibility to `onSubmit`:**

```tsx
onSubmit(title.trim(), content.trim(), mood, tags, visibility)
```

**Add the visibility `<select>` below the tags input:**

```tsx
<div className="form-control">
  <label htmlFor="entry-visibility" className="label">
    <span className="label-text">Visibility</span>
  </label>
  <select
    id="entry-visibility"
    className="select select-bordered w-full"
    value={visibility}
    onChange={(e) => setVisibility(e.target.value as Visibility)}
  >
    {VISIBILITIES.map((v) => (
      <option key={v} value={v}>
        {v === 'PUBLIC' ? 'Public -- everyone can see' : v === 'FRIENDS' ? 'Friends -- friends only' : 'Private -- only you'}
      </option>
    ))}
  </select>
</div>
```

### 3. Show visibility icons on EntryCard

Open `src/components/EntryCard.tsx`. Add a badge that shows a lock icon for Private or a people icon for Friends entries. Public entries show nothing extra.

**Inside the `collapse-title` span, before the `<time>` element:**

```tsx
{entry.visibility && entry.visibility !== 'PUBLIC' && (
  <span
    className="badge badge-outline badge-xs gap-0.5"
    title={entry.visibility === 'PRIVATE' ? 'Private' : 'Friends only'}
  >
    {entry.visibility === 'PRIVATE' ? '\u{1F512}' : '\u{1F465}'}{' '}
    {entry.visibility === 'PRIVATE' ? 'Private' : 'Friends'}
  </span>
)}
```

### 4. Update the API layer

Open `src/api/entries.ts`. Add `visibility: string` to the body type of `createEntry` and `updateEntry`:

```tsx
export async function createEntry(
  body: { title: string; summary: string; mood: string; tags: string; visibility: string },
  token: string | null,
): Promise<ApiEntry> { ... }

export async function updateEntry(
  id: number,
  body: { title: string; summary: string; mood: string; tags: string; visibility: string },
  token: string | null,
): Promise<ApiEntry> { ... }
```

### 5. Update demo-data.ts

In `src/data/demo-data.ts`, update `createEntry` and `updateEntry` to accept an optional `visibility` field:

```tsx
async createEntry(body: {
  title: string; summary: string; mood: string; tags: string; visibility?: string;
}): Promise<ApiEntry> {
  // ... existing code ...
  const entry: Entry = {
    // ...
    visibility: body.visibility ?? "PUBLIC",
    // ...
  };
```

```tsx
async updateEntry(
  id: number,
  body: { title: string; summary: string; mood: string; tags: string; visibility?: string },
): Promise<ApiEntry | null> {
  // ...
  const updated: Entry = {
    // ...
    visibility: body.visibility ?? logs[idx].visibility ?? 'PUBLIC',
  };
```

### 6. Thread visibility through App.tsx

Update `handleAddEntry`, `handleUpdateEntry`, `NewEntryPage`, and `EditEntryPage` to include the `visibility` parameter in all callbacks and API calls.

Key changes:
- Both handler signatures gain a `visibility: string` parameter
- `createEntry` and `apiUpdateEntry` calls include `visibility` in the body
- `EditEntryPage` passes `visibility: entry.visibility` in the `initial` prop

### 7. Update the backend entries routes

Open `server/routes/entries.ts`.

**Add a visibility whitelist:**

```ts
const VALID_VISIBILITY = ['PUBLIC', 'FRIENDS', 'PRIVATE'] as const
```

**POST handler** -- extract and validate visibility:

```ts
const { title, summary, mood, tags, visibility } = req.body
const vis = VALID_VISIBILITY.includes(visibility) ? visibility : 'PUBLIC'

// Include vis in the INSERT
'INSERT INTO Entry (title, summary, mood, tags, visibility, userId, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(3))'
```

**PUT handler** -- conditionally include visibility in UPDATE:

```ts
const vis = VALID_VISIBILITY.includes(visibility) ? visibility : undefined

await pool.execute<ResultSetHeader>(
  'UPDATE Entry SET title = ?, summary = ?, mood = ?, tags = ?'
    + (vis ? ', visibility = ?' : '')
    + ', updatedAt = NOW(3) WHERE id = ?',
  vis
    ? [String(title), String(summary), String(mood), String(tags ?? ''), vis, id]
    : [String(title), String(summary), String(mood), String(tags ?? ''), id]
)
```

### 8. Build and verify

```bash
npm run build
```

## Helpful Hints

- **Whitelist on the server** -- never trust client-sent enum values. The `VALID_VISIBILITY.includes()` check ensures only valid values reach the database.
- **Conditional SQL** -- the PUT route only updates visibility when a valid value is provided, so existing entries keep their current visibility if the field is omitted.
- **Unicode icons** -- `\u{1F512}` is the lock emoji, `\u{1F465}` is the busts-in-silhouette emoji. They work everywhere modern browsers do.
- **Default PUBLIC** -- both the frontend and backend default to PUBLIC when no visibility is specified, keeping backward compatibility with older entries.

## Do / Don't

| Do | Don't |
|---|---|
| Validate visibility on the server with a whitelist | Trust client-sent values without validation |
| Default to PUBLIC when visibility is missing | Reject requests that omit visibility |
| Show icons only for non-public entries (less visual noise) | Show a "public" badge on every entry |
| Thread the value through every layer (form -> API -> backend) | Skip a layer and let it silently drop the field |

## Check Your Work

1. Create a new entry with visibility set to "Private" -- it should appear with a lock badge
2. Edit the entry and change visibility to "Friends" -- the badge should update to show the people icon
3. Create a "Public" entry -- no visibility badge should appear
4. Check the network tab -- the POST/PUT request body should include the `visibility` field

## Stretch

- Add server-side filtering so the GET /api/entries endpoint only returns PUBLIC entries to unauthenticated users
- Add a filter dropdown on the entries page to show "My Private" or "Friends Only" entries

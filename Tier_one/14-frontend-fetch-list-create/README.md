# Step 14 - Frontend: Fetch List + Create

## Goal

Connect the React front end to the Express API from Step 13. Replace local
seed data with **`fetch`** calls so entries are read from and written to the
database. When you open the app you will see real entries from SQL Server, and
the "New Entry" form will POST to the API.

## What You'll Practice

| Skill | How |
|---|---|
| `fetch` API | GET and POST requests from the browser |
| `useEffect` | Fetch data on mount |
| `async`/`await` | Handle promises in event handlers |
| Vite proxy | Forward `/api` requests to `localhost:4000` during development |
| Data mapping | Convert API shape (tags as string) to UI shape (tags as array) |
| Loading state | Show "Loading…" while the fetch is in progress |

## Prerequisites

- Completed **Step 13** (CRUD API running on port 4000)
- SQL Server running with the `Entry` table
- **Node ≥ 20** and **npm**

## Step-by-Step Instructions

### 1. Copy the previous frontend step

```bash
cp -r 10-tags-and-mood-fields 14-frontend-fetch-list-create
cd 14-frontend-fetch-list-create
npm install
```

### 2. Add a Vite proxy

Open `vite.config.ts` and add a `server.proxy` section so `/api` requests are
forwarded to the Express server:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
```

This means `fetch('/api/entries')` in the browser will be proxied to
`http://localhost:4000/api/entries`. No CORS issues during dev.

### 3. Update the Entry types - `src/data/entries.ts`

The API returns tags as a comma-separated **string**, but the UI works with an
**array**. Add an `ApiEntry` type and a converter:

```ts
export type Mood = 'happy' | 'curious' | 'frustrated' | 'neutral'

export interface Entry {
  id: number
  title: string
  summary: string
  mood: Mood
  tags: string[]
  createdAt: string
  updatedAt: string
}

/** Shape returned by the API (tags is a comma-separated string) */
export interface ApiEntry {
  id: number
  title: string
  summary: string
  mood: string
  tags: string
  createdAt: string
  updatedAt: string
}

/** Convert an API entry (tags as string) to a UI entry (tags as array) */
export function toEntry(raw: ApiEntry): Entry {
  return {
    ...raw,
    mood: raw.mood as Mood,
    tags: raw.tags
      ? raw.tags.split(',').map((t) => t.trim()).filter((t) => t !== '')
      : [],
  }
}
```

Remove the `seedEntries` default export - we no longer need hardcoded data.

### 4. Create the API client - `src/api/entries.ts`

```ts
import type { ApiEntry } from '../data/entries.ts'

const BASE = '/api'

export async function fetchEntries(): Promise<ApiEntry[]> {
  const res = await fetch(`${BASE}/entries`)
  if (!res.ok) throw new Error(`GET /api/entries failed: ${res.status}`)
  return res.json()
}

export async function createEntry(body: {
  title: string
  summary: string
  mood: string
  tags: string
}): Promise<ApiEntry> {
  const res = await fetch(`${BASE}/entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`POST /api/entries failed: ${res.status}`)
  return res.json()
}
```

### 5. Update `src/App.tsx`

Replace the local state with fetch calls:

```tsx
import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Header from './components/Header'
import AboutSection from './components/AboutSection'
import Footer from './components/Footer'
import EntryCard from './components/EntryCard'
import NewEntryForm from './components/NewEntryForm'
import { fetchEntries, createEntry } from './api/entries.ts'
import { toEntry } from './data/entries.ts'
import type { Entry, Mood } from './data/entries.ts'

// ... (Home, EntriesPage, NewEntryPage, About unchanged - see below)

function App() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchEntries()
      .then((raw) => setEntries(raw.map(toEntry)))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  async function handleAddEntry(title: string, content: string, mood: Mood, tags: string[]) {
    const raw = await createEntry({
      title,
      summary: content,
      mood,
      tags: tags.join(','),
    })
    setEntries((prev) => [toEntry(raw), ...prev])
    navigate('/entries')
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/entries" element={<EntriesPage entries={entries} loading={loading} />} />
      <Route path="/entries/new" element={<NewEntryPage onAddEntry={handleAddEntry} />} />
      <Route path="/about" element={<About />} />
    </Routes>
  )
}
```

Key changes from Step 10:
1. **`useState<Entry[]>([])`** - starts empty (no seed data)
2. **`useEffect` + `fetchEntries()`** - loads entries from the API on mount
3. **`loading` state** - passed to `EntriesPage` to show "Loading…"
4. **`handleAddEntry` is now `async`** - calls `createEntry()` then prepends
   the new entry to local state

The `EntriesPage` component adds a loading check:

```tsx
function EntriesPage({ entries, loading }: { entries: Entry[]; loading: boolean }) {
  return (
    <>
      <Header />
      <main>
        <h2>All Entries ({entries.length})</h2>
        {loading && <p>Loading…</p>}
        {!loading && entries.length === 0 && <p>No entries yet. Add one!</p>}
        {entries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </main>
      <Footer />
    </>
  )
}
```

### 6. Build & run

Start the **backend** first (in one terminal):

```bash
cd ../13-crud-entries
npm run dev
```

Then start the **frontend** (in another terminal):

```bash
cd ../14-frontend-fetch-list-create
npm run dev
```

Open `http://localhost:5173` in your browser.

### 7. Verify

```bash
npm run build    # 0 errors
```

1. Navigate to **Entries** - you should see entries from the database (or "No
   entries yet" if the table is empty)
2. Navigate to **New Entry** - fill the form and submit
3. You should be redirected to **Entries** and see the new entry at the top
4. Refresh the page - the entry persists (it's in the database now!)

## File Tree

```
14-frontend-fetch-list-create/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts              ← UPDATED - adds server.proxy
├── eslint.config.js
├── public/
│   └── profile.jpg
└── src/
    ├── main.tsx
    ├── App.tsx                 ← UPDATED - useEffect + fetch, async handleAddEntry
    ├── index.css
    ├── vite-env.d.ts
    ├── api/
    │   └── entries.ts          ← NEW - fetchEntries(), createEntry()
    ├── components/
    │   ├── Header.tsx
    │   ├── AboutSection.tsx
    │   ├── EntryCard.tsx
    │   ├── Footer.tsx
    │   └── NewEntryForm.tsx
    └── data/
        └── entries.ts          ← UPDATED - ApiEntry type, toEntry(), no seed data
```

## Hints

<details>
<summary>What is a Vite proxy?</summary>

During development, Vite runs on `localhost:5173` and Express runs on
`localhost:4000`. Browsers block cross-origin requests by default (CORS). The
Vite proxy intercepts requests to `/api` and forwards them to port 4000
server-side, so the browser thinks everything comes from the same origin.

In production you would either serve the frontend from the same domain as the
API, or configure CORS properly.

</details>

<details>
<summary>Why two Entry types (Entry and ApiEntry)?</summary>

The database stores `tags` as a comma-separated **string** (SQL Server doesn't
support arrays). The UI works with a `string[]` for easier rendering. The
`toEntry()` function converts between the two shapes. This keeps components
clean - they always work with `Entry` (tags as array).

</details>

<details>
<summary>Why <code>useEffect</code> with an empty dependency array?</summary>

`useEffect(() => { ... }, [])` runs once after the first render - like
"on mount." This is the standard pattern for fetching data when a component
loads. The empty `[]` means "no dependencies - don't re-run."

</details>

<details>
<summary>What happens if the backend is not running?</summary>

The `fetchEntries()` call will fail and the `.catch()` will log the error.
The page will show "No entries yet" because the entries array stays empty.
In a production app you would show a proper error message - we'll improve
this in later steps.

</details>

## Do ✅ / Don't ❌

| Do ✅ | Don't ❌ |
|---|---|
| Use the Vite proxy for dev (`/api` → `localhost:4000`) | Hardcode `http://localhost:4000` in `fetch` calls |
| Convert API response shape to UI shape with `toEntry()` | Assume the API returns the exact same shape as the UI |
| Add a loading state while fetching | Show a blank page during the request |
| Handle fetch errors with `.catch()` | Ignore errors and let the app crash |
| Start the backend before the frontend | Forget to run `npm run dev` in the backend folder |

## Check Your Work

- [ ] `npm run build` completes with **0 errors**
- [ ] Backend (Step 13) is running on port 4000
- [ ] Frontend dev server starts on port 5173
- [ ] **Entries** page loads entries from the database
- [ ] **New Entry** form creates an entry via POST
- [ ] New entry appears in the list after creation
- [ ] Refreshing the page shows the same entries (persisted in DB)
- [ ] "Loading…" text appears briefly while entries are fetched

## Stretch

- Add error handling UI: if `fetchEntries()` fails, show an error message
  instead of "No entries yet."
- Add a "Refresh" button on the entries page that re-fetches from the API.
- Open the **Network** tab in DevTools and watch the `fetch` requests go
  through the proxy to understand how the data flows.

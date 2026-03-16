# Step 15 - Edit & Delete Flows

## Goal

Add **edit** and **delete** functionality to the DevLog UI. When a user edits or deletes an entry the change appears instantly (**optimistic update**) and a **toast notification** confirms the result - or rolls the change back if the server request fails.

## What You'll Practice

- Building a reusable form component that works for both **create** and **edit**
- Handling **PUT** and **DELETE** requests from the frontend
- **Optimistic updates** - update the UI first, rollback on error
- Showing **toast notifications** for user feedback
- Wiring a new route with **URL params** (`/entries/:id/edit`)

## Prerequisites

- Completed Step 14 (or understand how the full-stack proxy works)
- Familiarity with `fetch`, `useState`, and React Router

## File Tree

```
15-edit-delete-flows/
├── server/
│   ├── index.ts              ← Express server (unchanged from 14)
│   ├── lib/prisma.ts         ← Prisma singleton
│   └── routes/entries.ts     ← Full CRUD routes
├── prisma/
│   └── schema.prisma         ← Entry model
├── src/
│   ├── api/entries.ts         ← NEW: fetchEntry, updateEntry, deleteEntry
│   ├── components/
│   │   ├── AboutSection.tsx
│   │   ├── EntryCard.tsx      ← CHANGED: Edit link + Delete button
│   │   ├── EntryForm.tsx      ← NEW: reusable form (create + edit)
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   └── Toast.tsx          ← NEW: toast notification component
│   ├── data/entries.ts
│   ├── App.tsx                ← CHANGED: edit route, optimistic updates, toasts
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env.example
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── tsconfig.server.json
└── vite.config.ts
```

## Steps

### 1. Copy the folder (or start fresh)

```bash
# If starting from Step 14, copy the folder:
cp -r 14-frontend-fetch-list-create 15-edit-delete-flows
cd 15-edit-delete-flows
```

### 2. Environment setup

```bash
cp .env.example .env
# Fill in your DATABASE_URL with real credentials
npm install
npx prisma generate
```

### 3. Add new API functions - `src/api/entries.ts`

You already have `fetchEntries` and `createEntry`. Add three more:

```ts
export async function fetchEntry(id: number): Promise<ApiEntry> {
  const res = await fetch(`${BASE}/entries/${id}`)
  if (!res.ok) throw new Error(`GET /api/entries/${id} failed: ${res.status}`)
  return res.json()
}

export async function updateEntry(
  id: number,
  body: { title: string; summary: string; mood: string; tags: string },
): Promise<ApiEntry> {
  const res = await fetch(`${BASE}/entries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`PUT /api/entries/${id} failed: ${res.status}`)
  return res.json()
}

export async function deleteEntry(id: number): Promise<void> {
  const res = await fetch(`${BASE}/entries/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`DELETE /api/entries/${id} failed: ${res.status}`)
}
```

### 4. Create a reusable `EntryForm` component

Instead of duplicating the form for create and edit, extract a shared `EntryForm`:

```tsx
// src/components/EntryForm.tsx
interface EntryFormProps {
  initial?: { title: string; content: string; mood: Mood; tags: string }
  onSubmit: (title: string, content: string, mood: Mood, tags: string[]) => void
  submitLabel?: string
}
```

- When `initial` is provided → the form is pre-filled for **editing**
- When omitted → the form starts blank for **creating**

### 5. Add Edit and Delete to `EntryCard`

```tsx
<Link to={`/entries/${entry.id}/edit`}>Edit</Link>
<button type="button" onClick={handleDelete}>Delete</button>
```

The delete button uses `window.confirm()` before calling `onDelete`.

### 6. Create a `Toast` component

```tsx
// src/components/Toast.tsx
export interface ToastMessage {
  id: number
  text: string
  type: 'success' | 'error'
}
```

Each toast auto-dismisses after 3 seconds with `setTimeout` inside a `useEffect`.

### 7. Wire everything in `App.tsx`

**New route:**
```tsx
<Route path="/entries/:id/edit" element={<EditEntryPage ... />} />
```

**Optimistic update (edit):**
1. Update the entry in state **immediately**
2. Navigate to `/entries` and show a success toast
3. Send `PUT` to the server - if it fails, **rollback** state and show an error toast

**Optimistic delete:**
1. Remove the entry from state **immediately**
2. Show a success toast
3. Send `DELETE` to the server - if it fails, **rollback** state and show an error toast

### 8. Run it

```bash
npm run dev
```

This starts both the Vite dev server (port 5173) and Express API (port 4000).

## Helpful Hints

| Concept | Hint |
|---------|------|
| **Optimistic update** | Save the previous state _before_ mutating, so you can rollback: `const previous = entries` |
| **Rollback** | In the `catch` block, call `setEntries(previous)` to restore the old list |
| **Reusable form** | Use an `initial` prop with default values (`?? ''`) so the same form works for create and edit |
| **Toast auto-dismiss** | `useEffect(() => { const t = setTimeout(...); return () => clearTimeout(t) }, [])` |
| **URL params** | `useParams<{ id: string }>()` gives you the `:id` from the route |

## Do ✅ / Don't ❌

| Do ✅ | Don't ❌ |
|-------|---------|
| Confirm before deleting (`window.confirm`) | Delete without any confirmation |
| Show feedback (toast) for every action | Silently fail or succeed |
| Roll back on error so the UI stays correct | Leave stale data if the server call fails |
| Reuse `EntryForm` for both create and edit | Copy-paste the entire form into a second component |
| Keep toast state simple (array + id counter) | Over-engineer a toast library |

## Check Your Work

- [ ] `npm run build` completes with **0 errors**
- [ ] `npm run dev` starts both frontend and backend
- [ ] Entries list shows **Edit** and **Delete** on each entry
- [ ] Clicking **Edit** navigates to `/entries/:id/edit` with a pre-filled form
- [ ] Submitting the edit form updates the entry and shows a success toast
- [ ] Clicking **Delete** shows a confirmation dialog, then removes the entry
- [ ] If you disconnect the server and try to delete, the entry reappears (rollback)
- [ ] Toasts auto-dismiss after ~3 seconds

## Stretch

- Add a **"Cancel"** link on the edit page that navigates back without saving
- Add a **loading spinner** on the "Update Entry" button while the PUT is in-flight
- Make the toast slide in/out with a CSS transition
- Add a **keyboard shortcut** (Escape) to dismiss toasts early

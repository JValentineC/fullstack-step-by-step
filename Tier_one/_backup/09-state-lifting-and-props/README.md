# Step 09 - State Lifting and Props

## Goal

**Lift** the entries array out of the hardcoded data file and into React state
inside `App`. Pass that state **down** to the Entries page as a prop, and pass
an `onAddEntry` callback **down** to the New Entry form. When the form submits,
the new entry actually appears on the All Entries page - the app is interactive
for the first time.

## What You'll Practice

| Skill | How |
|---|---|
| Lifting state up | Move shared data to the nearest common ancestor (`App`) |
| Props (data down) | Pass the `entries` array to `EntriesPage` |
| Callback props (actions up) | Pass `onAddEntry` to `NewEntryForm` so child can update parent state |
| Immutable state updates | Use the spread operator / functional `setEntries` to add entries |
| Programmatic navigation | Use `useNavigate()` to redirect after saving |

## Prerequisites

- Completed **Step 08** (form validation with controlled inputs)
- Understand `useState`, props, and how data flows in React (parent → child)

## Step-by-Step Instructions

### 1. Copy the previous step

```bash
cp -r 08-form-validation-minimal 09-state-lifting-and-props
cd 09-state-lifting-and-props
npm install
```

### 2. Rename the default export in `entries.ts`

Open `src/data/entries.ts` and rename the exported array from `entries` to
`seedEntries`. This clarifies that it provides initial data, not live state:

```ts
const seedEntries: Entry[] = [ ... ]
export default seedEntries
```

### 3. Add `useState` in `App`

Inside `src/App.tsx`, import `useState` and create the state:

```tsx
import { useState } from 'react'
import seedEntries from './data/entries'
import type { Entry } from './data/entries'

function App() {
  const [entries, setEntries] = useState<Entry[]>(seedEntries)
  // ...
}
```

`entries` is now the **single source of truth** for the entire app.

### 4. Write the `handleAddEntry` function

Still inside `App`, create a function that builds a new `Entry` object and
prepends it to the array:

```tsx
const navigate = useNavigate()

function handleAddEntry(title: string, content: string) {
  const newEntry: Entry = {
    id: Date.now(),
    title,
    date: new Date().toISOString().slice(0, 10),
    summary: content,
  }
  setEntries((prev) => [newEntry, ...prev])
  navigate('/entries')
}
```

Key points:
- `Date.now()` generates a unique-enough ID for now (no database yet)
- The functional updater `(prev) => [newEntry, ...prev]` is the safest way to
  update state based on the previous value
- `navigate('/entries')` redirects the user to see their new entry

### 5. Pass props to page components

Update the route elements to pass data down:

```tsx
<Route path="/entries" element={<EntriesPage entries={entries} />} />
<Route path="/entries/new" element={<NewEntryPage onAddEntry={handleAddEntry} />} />
```

Update the `EntriesPage` component to accept props:

```tsx
function EntriesPage({ entries }: { entries: Entry[] }) {
  return (
    <>
      <Header />
      <main>
        <h2>All Entries ({entries.length})</h2>
        {entries.length === 0 && <p>No entries yet. Add one!</p>}
        {entries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </main>
      <Footer />
    </>
  )
}
```

### 6. Accept the callback in `NewEntryForm`

Open `src/components/NewEntryForm.tsx`. Define a props interface and replace the
`console.log` call with the callback:

```tsx
interface NewEntryFormProps {
  onAddEntry: (title: string, content: string) => void
}

function NewEntryForm({ onAddEntry }: NewEntryFormProps) {
  // ... existing state and validation ...

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (!isValid) return

    onAddEntry(title.trim(), content.trim())   // ← instead of console.log
    setTitle('')
    setContent('')
    setSubmitted(false)
  }
  // ...
}
```

### 7. Verify

```bash
npm run build   # 0 errors
npm run dev     # open browser
```

1. Click **New Entry**, fill in both fields, click **Save Entry**
2. You should be redirected to the **All Entries** page
3. Your new entry should appear at the top of the list
4. The entry count in the heading should increase

## File Tree

```
09-state-lifting-and-props/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── eslint.config.js
├── public/
│   └── profile.jpg
└── src/
    ├── main.tsx
    ├── App.tsx                 ← UPDATED (useState, handleAddEntry, props)
    ├── index.css
    ├── vite-env.d.ts
    ├── components/
    │   ├── Header.tsx
    │   ├── AboutSection.tsx
    │   ├── EntryCard.tsx
    │   ├── Footer.tsx
    │   └── NewEntryForm.tsx    ← UPDATED (accepts onAddEntry prop)
    └── data/
        └── entries.ts          ← UPDATED (renamed to seedEntries)
```

## Hints

<details>
<summary>What does "lifting state up" mean?</summary>

When two or more components need access to the same data, you move that data to
their nearest common ancestor. In this step, both `EntriesPage` (reads entries)
and `NewEntryForm` (adds entries) need the entries array - so it lives in `App`,
which is above both of them in the component tree.

</details>

<details>
<summary>Why use a functional updater with `setEntries`?</summary>

`setEntries((prev) => [newEntry, ...prev])` ensures you're always working with
the latest state. If you wrote `setEntries([newEntry, ...entries])`, you'd be
closing over a potentially stale `entries` variable. The functional form is
safer, especially when multiple updates could happen in quick succession.

</details>

<details>
<summary>Why `Date.now()` for the ID?</summary>

It returns the current timestamp in milliseconds - good enough for a unique
client-side ID when there's no database. Later, the database will generate real
IDs. This is a temporary solution that keeps things simple.

</details>

<details>
<summary>What is `useNavigate()`?</summary>

It's a hook from `react-router-dom` that returns a function you can call to
programmatically change the URL. `navigate('/entries')` sends the user to the
entries page without them clicking a link.

</details>

<details>
<summary>Why show an empty-state message?</summary>

If the user hasn't added any entries and the seed data is removed, the page
would be blank. The `{entries.length === 0 && <p>No entries yet.</p>}` pattern
is a common UX improvement - always tell the user what's happening.

</details>

## Do / Don't

| Do | Don't |
|---|---|
| Keep state in the nearest common ancestor (`App`) | Store entries in every component that uses them |
| Pass data down via props | Import the data file directly in child components |
| Use a callback prop (`onAddEntry`) for child-to-parent communication | Mutate the entries array directly |
| Use the functional updater `(prev) => ...` with `setEntries` | Spread a potentially stale closure variable |
| Navigate programmatically after adding an entry | Leave the user on the form page after saving |
| Show an empty-state message when there are no entries | Render a blank page |

## Check Your Work

- [ ] `npm run build` completes with zero errors
- [ ] The entries state lives in `App`, not in any child component
- [ ] `EntriesPage` receives `entries` as a prop and renders them
- [ ] `NewEntryForm` receives `onAddEntry` as a prop and calls it on submit
- [ ] Submitting a new entry redirects to `/entries`
- [ ] The new entry appears at the top of the list
- [ ] The heading shows the correct entry count: `All Entries (6)`
- [ ] Validation from Step 08 still works (required fields, disabled button)
- [ ] An empty-state message shows when there are zero entries

## Stretch Goals

- Remove the seed data and start with an empty array - verify the empty state
- Add a "Clear All" button on the entries page that resets the array
- After saving, show a brief "Entry added!" message (use `setTimeout` to auto-hide)
- Pass `entries.length` to the Home page and display "You have X entries"

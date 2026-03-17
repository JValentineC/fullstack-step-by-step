# Step 10 - Tags and Mood Fields

## Goal

Extend the `Entry` shape with three new fields: **`mood`** (a union type
selected via `<select>`), **`tags`** (a string array entered as comma-separated
text), and **`createdAt`** (a full ISO timestamp). Update the form to collect
these fields and the entry card to display them.

## What You'll Practice

| Skill | How |
|---|---|
| TypeScript union types | Define `Mood = 'happy' \| 'curious' \| 'frustrated' \| 'neutral'` |
| Controlled `<select>` | Bind a dropdown to state with `value` + `onChange` |
| String → array parsing | Split comma-separated input, trim, filter blanks |
| Evolving an interface | Add fields to `Entry` and update every consumer |
| ISO timestamps | Use `new Date().toISOString()` and `toLocaleDateString()` |

## Prerequisites

- Completed **Step 09** (state lifting - entries in `App`, callback props)
- Comfortable with TypeScript interfaces

## Step-by-Step Instructions

### 1. Copy the previous step

```bash
cp -r 09-state-lifting-and-props 10-tags-and-mood-fields
cd 10-tags-and-mood-fields
npm install
```

### 2. Update the `Entry` interface

Open `src/data/entries.ts`. Add the `Mood` type and extend `Entry`:

```ts
export type Mood = 'happy' | 'curious' | 'frustrated' | 'neutral'

export interface Entry {
  id: number
  title: string
  summary: string
  mood: Mood
  tags: string[]
  createdAt: string   // full ISO timestamp
}
```

Note: the old `date` field is replaced by `createdAt`.

### 3. Update seed data

Update each seed entry to include the new fields:

```ts
{
  id: 1,
  title: 'Set up my DevLog project',
  summary: 'Scaffolded a Vite + React + TypeScript app...',
  mood: 'happy',
  tags: ['setup', 'vite'],
  createdAt: '2025-06-01T09:00:00.000Z',
},
```

### 4. Update `EntryCard`

Open `src/components/EntryCard.tsx`. Display the mood next to the date and
render tags with a `#` prefix:

```tsx
<article>
  <h3>{entry.title}</h3>
  <p>
    <time dateTime={entry.createdAt}>
      {new Date(entry.createdAt).toLocaleDateString()}
    </time>
    {' · '}
    {entry.mood}
  </p>
  <p>{entry.summary}</p>
  {entry.tags.length > 0 && (
    <p>
      {entry.tags.map((tag) => (
        <small key={tag}>{' '}#{tag}</small>
      ))}
    </p>
  )}
</article>
```

### 5. Add mood and tags to the form

Open `src/components/NewEntryForm.tsx`:

1. Import `Mood` from the data file
2. Add state: `mood` (default `'neutral'`) and `tagsInput` (string, default `''`)
3. Add a `<select>` with the four mood options
4. Add a text `<input>` for tags with a placeholder like `"e.g. react, routing, css"`
5. In `handleSubmit`, parse tags before calling `onAddEntry`:

```tsx
const tags = tagsInput
  .split(',')
  .map((t) => t.trim().toLowerCase())
  .filter((t) => t !== '')

onAddEntry(title.trim(), content.trim(), mood, tags)
```

6. Update the `onAddEntry` prop signature:

```tsx
interface NewEntryFormProps {
  onAddEntry: (title: string, content: string, mood: Mood, tags: string[]) => void
}
```

### 6. Update `handleAddEntry` in `App`

Open `src/App.tsx` and update the callback to accept the new fields:

```tsx
function handleAddEntry(title: string, content: string, mood: Mood, tags: string[]) {
  const newEntry: Entry = {
    id: Date.now(),
    title,
    summary: content,
    mood,
    tags,
    createdAt: new Date().toISOString(),
  }
  setEntries((prev) => [newEntry, ...prev])
  navigate('/entries')
}
```

### 7. Verify

```bash
npm run build   # 0 errors
npm run dev     # open browser
```

1. Check the entries page - each card shows a date, mood, summary, and tags
2. Create a new entry with a mood and comma-separated tags
3. Verify the new entry appears with all fields displayed

## File Tree

```
10-tags-and-mood-fields/
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
    ├── App.tsx                 ← UPDATED (handleAddEntry accepts mood + tags)
    ├── index.css
    ├── vite-env.d.ts
    ├── components/
    │   ├── Header.tsx
    │   ├── AboutSection.tsx
    │   ├── EntryCard.tsx       ← UPDATED (displays mood, tags, createdAt)
    │   ├── Footer.tsx
    │   └── NewEntryForm.tsx    ← UPDATED (mood select, tags input)
    └── data/
        └── entries.ts          ← UPDATED (Mood type, extended Entry interface)
```

## Hints

<details>
<summary>What is a union type?</summary>

A union type like `'happy' | 'curious' | 'frustrated' | 'neutral'` means the
value must be exactly one of those strings. TypeScript will catch it if you try
to assign `'sad'` - it's not in the union. This is much safer than using a
plain `string`.

</details>

<details>
<summary>How do I use a `<select>` as a controlled input?</summary>

Same pattern as `<input>`: bind `value` to state and update on `onChange`:

```tsx
<select value={mood} onChange={(e) => setMood(e.target.value as Mood)}>
  <option value="happy">happy</option>
  ...
</select>
```

The `as Mood` cast is safe because the `<option>` values match the union.

</details>

<details>
<summary>Why split, trim, and filter the tags input?</summary>

Users might type `"react, , routing , "`. Splitting on `,` gives
`["react", " ", " routing ", " "]`. Trimming removes whitespace, and filtering
removes empty strings. The result is a clean `["react", "routing"]`.

</details>

<details>
<summary>What is `toLocaleDateString()`?</summary>

It formats a `Date` object using the user's locale. In the US, it produces
something like `"6/1/2025"`. It's a quick way to show human-readable dates
without pulling in a date library.

</details>

<details>
<summary>Why replace `date` with `createdAt`?</summary>

A full ISO timestamp (`2025-06-01T09:00:00.000Z`) carries both date and time
information and can be sorted accurately. The old `date` string (`"2025-06-01"`)
was date-only. The name `createdAt` is a common convention in databases - it
prepares the shape for the backend steps ahead.

</details>

## Do / Don't

| Do | Don't |
|---|---|
| Use a TypeScript union type for mood values | Use a plain `string` - you lose compile-time safety |
| Parse comma-separated tags into a clean array | Store the raw comma-separated string in the entry |
| Use `toISOString()` for `createdAt` | Store a human-formatted date string |
| Display `toLocaleDateString()` for the user | Show raw ISO strings in the UI |
| Update **every** consumer when you change the interface | Leave old code referencing the removed `date` field |
| Keep mood and tags optional in the UI (no validation needed) | Require tags - they're a nice-to-have, not mandatory |

## Check Your Work

- [ ] `npm run build` completes with zero errors
- [ ] `Entry` interface has `mood`, `tags`, and `createdAt` fields
- [ ] `Mood` is a union type, not a plain `string`
- [ ] The form has a mood `<select>` with four options
- [ ] The form has a tags text input
- [ ] Tags are parsed: split on commas, trimmed, lowercased, blanks removed
- [ ] `EntryCard` displays mood, formatted date, and tags
- [ ] Seed entries include all new fields
- [ ] Creating a new entry populates `createdAt` with the current timestamp

## Stretch Goals

- Map each mood to an emoji and display it in the card (e.g., happy → 😊)
- Add a mood filter on the entries page using a `<select>` that narrows the list
- Show tags as clickable items (no filtering yet - just visual distinction)
- Add a `<datalist>` to the tags input that suggests previously used tags

# Step 06 - Static Entries List

## Goal

Add an **All Entries** page that renders a list of hardcoded dev-log entries.
Each entry is displayed with its own `EntryCard` component. No state management
yet - the data lives in a simple TypeScript module.

## What You'll Practice

| Skill | How |
|---|---|
| Typed data modules | Export an `Entry` interface and a default array from `src/data/entries.ts` |
| Mapping over arrays | Use `Array.map()` to render a list of components |
| Props with TypeScript | Pass an `Entry` object to `EntryCard` via props |
| Semantic HTML | Use `<article>`, `<time>`, and `<h3>` inside each card |
| Adding a new route | Wire `/entries` into the existing `Routes` |

## Prerequisites

- Completed **Step 05** (extracted Header, AboutSection, Footer components)
- Comfortable importing/exporting modules
- Familiar with `Array.map()` in JavaScript

## Step-by-Step Instructions

### 1. Copy the previous step

Duplicate `05-extract-simple-components/` into a new folder called
`06-static-entries-list/` and install dependencies:

```bash
cp -r 05-extract-simple-components 06-static-entries-list
cd 06-static-entries-list
npm install
```

### 2. Create the entries data file

Create `src/data/entries.ts`. Define an `Entry` interface and export a
hardcoded array:

```
src/
  data/
    entries.ts      ← NEW
```

```ts
export interface Entry {
  id: number
  title: string
  date: string   // ISO date string, e.g. "2025-06-01"
  summary: string
}
```

Export a default array of 3–5 entries that read like short journal notes about
what you learned in previous steps.

### 3. Create the `EntryCard` component

Create `src/components/EntryCard.tsx`. It receives a single `entry` prop and
renders an `<article>` containing the title, date, and summary:

```
src/
  components/
    EntryCard.tsx   ← NEW
```

- Use `<h3>` for the title
- Use `<time dateTime={entry.date}>` for the date
- Use `<p>` for the summary

### 4. Build the Entries page

Inside `src/App.tsx`, create an `Entries` function component:

1. Import `entries` from `./data/entries`
2. Import `EntryCard` from `./components/EntryCard`
3. Render `<Header />`, then `<main>` with an `<h2>All Entries</h2>` heading
4. Map over the entries array: `entries.map(e => <EntryCard key={e.id} entry={e} />)`
5. Render `<Footer />`

### 5. Add the route

Add a new `<Route>` for the entries page:

```tsx
<Route path="/entries" element={<Entries />} />
```

### 6. Update the Header nav

Open `src/components/Header.tsx` and add an **Entries** link between Home and
About:

```tsx
<Link to="/">Home</Link>{' '}
<Link to="/entries">Entries</Link>{' '}
<Link to="/about">About</Link>
```

### 7. Verify

```bash
npm run build   # should complete with 0 errors
npm run dev     # open browser → click "Entries" → see all cards
```

## File Tree

```
06-static-entries-list/
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
    ├── App.tsx
    ├── index.css
    ├── vite-env.d.ts
    ├── components/
    │   ├── Header.tsx
    │   ├── AboutSection.tsx
    │   ├── EntryCard.tsx        ← NEW
    │   └── Footer.tsx
    └── data/
        └── entries.ts           ← NEW
```

## Hints

<details>
<summary>How do I type the props for EntryCard?</summary>

Use an inline object type referencing your `Entry` interface:

```tsx
function EntryCard({ entry }: { entry: Entry }) {
```

</details>

<details>
<summary>Why use `key={entry.id}` when mapping?</summary>

React needs a stable, unique key for each item in a list so it can efficiently
update the DOM when items change. The `id` field is perfect for this.

</details>

<details>
<summary>What is the `<time>` element for?</summary>

The HTML `<time>` element represents a date or time. The `dateTime` attribute
holds a machine-readable value (ISO format), while the visible text can be any
human-friendly format.

</details>

## Do / Don't

| Do | Don't |
|---|---|
| Export a named `Entry` interface so other files can import it | Use `any` or untyped objects for entry data |
| Use `key` on every mapped element | Forget the `key` prop - React will warn you |
| Keep entries hardcoded in a `.ts` file | Fetch from an API or use `useState` (that comes later) |
| Use semantic elements (`article`, `time`) | Use generic `<div>` and `<span>` for everything |

## Check Your Work

- [ ] `npm run build` completes with zero errors
- [ ] Browser shows Home, Entries, and About links in the nav
- [ ] Clicking **Entries** shows multiple entry cards
- [ ] Each card displays a title, date, and summary
- [ ] `EntryCard` receives a typed `entry` prop (no `any`)
- [ ] `entries.ts` exports both the `Entry` interface and a default array
- [ ] The `<time>` element has a `dateTime` attribute

## Stretch Goals

- Add a sixth entry about this step itself
- Sort entries by date (newest first) before rendering
- Show the total entry count next to the heading: `All Entries (5)`
- Create a `src/types.ts` file and move the `Entry` interface there so both
  `entries.ts` and `EntryCard.tsx` import from that shared location

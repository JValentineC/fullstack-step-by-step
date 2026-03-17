# Step 07 - Controlled Form Basics

## Goal

Add a **New Entry** page with a form that uses React **controlled inputs** for
`title` and `content`. Submitting the form logs the values to the console and
resets the fields. No entries are saved anywhere yet - the focus is purely on
learning `useState` with form elements.

## What You'll Practice

| Skill | How |
|---|---|
| `useState` hook | Store `title` and `content` as component state |
| Controlled inputs | Bind `value` + `onChange` on `<input>` and `<textarea>` |
| Form submission | Handle `onSubmit`, call `preventDefault()`, read state |
| Labels & accessibility | Associate `<label>` with inputs via `htmlFor` / `id` |
| Adding a new route | Wire `/entries/new` into the existing `Routes` |

## Prerequisites

- Completed **Step 06** (static entries list with `EntryCard`)
- Basic understanding of JavaScript events (`event.preventDefault()`)

## Step-by-Step Instructions

### 1. Copy the previous step

Duplicate `06-static-entries-list/` into a new folder called
`07-controlled-form-basics/` and install dependencies:

```bash
cp -r 06-static-entries-list 07-controlled-form-basics
cd 07-controlled-form-basics
npm install
```

### 2. Create the `NewEntryForm` component

Create `src/components/NewEntryForm.tsx`:

```
src/
  components/
    NewEntryForm.tsx   ← NEW
```

Inside the component:

1. Import `useState` from React
2. Create two pieces of state: `title` (string, default `''`) and `content`
   (string, default `''`)
3. Render a `<form>` with:
   - A `<label>` + `<input type="text">` for the title
   - A `<label>` + `<textarea>` for the content
   - A `<button type="submit">` that says "Save Entry"
4. Bind each input's `value` to its state variable and `onChange` to update it
5. In the form's `onSubmit` handler:
   - Call `event.preventDefault()` to stop the page from reloading
   - `console.log` the title and content
   - Reset both fields to empty strings

### 3. Build the New Entry page

In `src/App.tsx`, create a `NewEntry` function component that renders:

```tsx
<Header />
<main>
  <h2>New Entry</h2>
  <NewEntryForm />
</main>
<Footer />
```

### 4. Add the route

Add a new `<Route>` inside the existing `<Routes>`:

```tsx
<Route path="/entries/new" element={<NewEntry />} />
```

> **Tip:** Place the `/entries/new` route *after* `/entries` so React Router
> matches correctly.

### 5. Update the Header nav

Open `src/components/Header.tsx` and add a **New Entry** link:

```tsx
<Link to="/">Home</Link>{' '}
<Link to="/entries">Entries</Link>{' '}
<Link to="/entries/new">New Entry</Link>{' '}
<Link to="/about">About</Link>
```

### 6. Verify

```bash
npm run build    # should complete with 0 errors
npm run dev      # open browser → click "New Entry"
```

- Type in both fields - the values should appear as you type
- Click **Save Entry** - check the browser console for the logged object
- Both fields should clear after submission

## File Tree

```
07-controlled-form-basics/
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
    │   ├── Header.tsx          ← updated (added New Entry link)
    │   ├── AboutSection.tsx
    │   ├── EntryCard.tsx
    │   ├── Footer.tsx
    │   └── NewEntryForm.tsx    ← NEW
    └── data/
        └── entries.ts
```

## Hints

<details>
<summary>What is a "controlled input"?</summary>

A controlled input is one where React state is the single source of truth. You
pass the state variable as `value` and update it via `onChange`:

```tsx
const [name, setName] = useState('')

<input value={name} onChange={(e) => setName(e.target.value)} />
```

The input always reflects the state, and every keystroke updates the state.

</details>

<details>
<summary>Why call `event.preventDefault()`?</summary>

Without it, the browser performs a traditional form submission - a full page
reload with query parameters in the URL. In a single-page React app, you handle
submission in JavaScript instead.

</details>

<details>
<summary>Why use `htmlFor` instead of `for` on labels?</summary>

In JSX, `for` is a reserved JavaScript keyword (used in `for` loops). React
uses `htmlFor` as the equivalent of the HTML `for` attribute, which links a
`<label>` to its `<input>` by matching the input's `id`.

</details>

<details>
<summary>How do I type the form event?</summary>

Import the type and annotate the parameter:

```tsx
import type { FormEvent } from 'react'

function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()
  // ...
}
```

</details>

## Do / Don't

| Do | Don't |
|---|---|
| Use `useState` for each form field | Use `useRef` or uncontrolled inputs (that's a different pattern) |
| Call `event.preventDefault()` in `onSubmit` | Let the browser reload the page on submit |
| Use `<label htmlFor="...">` paired with `id` on the input | Leave inputs without labels (bad accessibility) |
| Log the values to the console for now | Try to save entries to state or an array (that's Step 09) |
| Keep the form in its own component (`NewEntryForm`) | Put all the form logic directly inside `App.tsx` |

## Check Your Work

- [ ] `npm run build` completes with zero errors
- [ ] Nav bar shows Home, Entries, New Entry, and About links
- [ ] Clicking **New Entry** loads the form page
- [ ] Typing in the title field updates the input in real time
- [ ] Typing in the content textarea updates it in real time
- [ ] Clicking **Save Entry** logs `{ title, content }` to the console
- [ ] Both fields reset to empty after submission
- [ ] Each input has an associated `<label>` with `htmlFor`

## Stretch Goals

- Add a third field: a `<select>` dropdown for "mood" (e.g., Happy, Frustrated,
  Curious) - also controlled with `useState`
- Show a live preview below the form that displays what the entry will look like
  (render the title and content as you type)
- Disable the **Save Entry** button when both fields are empty (sneak peek at
  Step 08's validation topic)

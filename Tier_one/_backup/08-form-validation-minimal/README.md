# Step 08 - Form Validation (Minimal)

## Goal

Add **client-side validation** to the New Entry form. Both title and content are
required - show inline error messages after the first submit attempt and
**disable the Submit button** while errors exist. No external libraries; just
`useState` and derived values.

## What You'll Practice

| Skill | How |
|---|---|
| Derived state | Compute `titleError` and `contentError` from current state instead of storing them |
| Conditional rendering | Show error messages only after the user has attempted to submit |
| Disabling a button | Set `disabled` based on a boolean expression |
| Accessible errors | Use `aria-invalid`, `aria-describedby`, and `role="alert"` |
| Guard clauses | Return early from the submit handler when the form is invalid |

## Prerequisites

- Completed **Step 07** (controlled form with title and content)
- Understand `useState` and controlled inputs

## Step-by-Step Instructions

### 1. Copy the previous step

```bash
cp -r 07-controlled-form-basics 08-form-validation-minimal
cd 08-form-validation-minimal
npm install
```

### 2. Add a `submitted` flag

Inside `NewEntryForm`, add a third piece of state:

```tsx
const [submitted, setSubmitted] = useState(false)
```

This flag tracks whether the user has clicked **Save Entry** at least once. You
only show error messages *after* the first submission attempt so the form isn't
covered in red before the user has had a chance to type.

### 3. Derive error messages

Instead of storing errors in state, compute them on every render:

```tsx
const titleError = title.trim() === '' ? 'Title is required.' : ''
const contentError = content.trim() === '' ? 'Content is required.' : ''
const isValid = titleError === '' && contentError === ''
```

These variables recalculate automatically whenever `title` or `content` change -
no extra `useEffect` needed.

### 4. Update the submit handler

```tsx
function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()
  setSubmitted(true)

  if (!isValid) return          // ← guard clause: stop if invalid

  console.log('Submitted:', { title: title.trim(), content: content.trim() })
  setTitle('')
  setContent('')
  setSubmitted(false)           // ← reset so errors hide for the next entry
}
```

### 5. Show inline error messages

Below each input, conditionally render the error when `submitted` is true and
the error string is non-empty:

```tsx
{submitted && titleError && (
  <strong id="title-error" role="alert">{titleError}</strong>
)}
```

Repeat the same pattern for `contentError` with `id="content-error"`.

### 6. Wire up ARIA attributes

On each input, add:

```tsx
aria-invalid={submitted && titleError !== '' ? true : undefined}
aria-describedby={submitted && titleError ? 'title-error' : undefined}
```

Screen readers will announce the input as invalid and read the associated error
message.

### 7. Disable the button

```tsx
<button type="submit" disabled={submitted && !isValid}>
  Save Entry
</button>
```

The button is only disabled *after* a failed submit. On initial load the button
is enabled so the user can click it to trigger validation.

### 8. Verify

```bash
npm run build   # 0 errors
npm run dev     # open browser → New Entry page
```

- Click **Save Entry** with empty fields - errors appear, button disables
- Type a title - title error disappears, button stays disabled (content still empty)
- Type content - content error disappears, button re-enables
- Submit - console logs values, fields clear, errors hidden

## File Tree

```
08-form-validation-minimal/
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
    │   ├── EntryCard.tsx
    │   ├── Footer.tsx
    │   └── NewEntryForm.tsx    ← UPDATED (validation added)
    └── data/
        └── entries.ts
```

## Hints

<details>
<summary>Why derive errors instead of storing them in state?</summary>

Storing errors in state creates a "sync problem" - you'd have to update the
error state every time `title` or `content` changes. Derived values are
calculated from the current state on every render, so they're always in sync
automatically. This is a core React pattern: **derive what you can, store only
what you must.**

</details>

<details>
<summary>Why wait until after the first submit to show errors?</summary>

Showing errors before the user has had a chance to type is a poor user
experience. The `submitted` flag ensures errors only appear after the user
clicks **Save Entry**, giving them a chance to fill out the form first.

</details>

<details>
<summary>What does `aria-invalid` do?</summary>

It tells assistive technology that the input's current value is invalid. Screen
readers announce this to the user. Set it to `true` when there's an error, and
`undefined` (not `false`) when there isn't - `undefined` removes the attribute
from the DOM entirely.

</details>

<details>
<summary>What does `aria-describedby` do?</summary>

It links an input to another element (by `id`) that provides additional context.
When the input receives focus, screen readers read the linked element's text
aloud - in this case, the error message.

</details>

## Do / Don't

| Do | Don't |
|---|---|
| Derive error strings from state on every render | Store errors in a separate `useState` (unnecessary sync) |
| Use a `submitted` flag to delay error display | Show errors immediately on first render |
| Use `trim()` before checking for empty strings | Accept whitespace-only input as valid |
| Add `aria-invalid` and `aria-describedby` | Rely only on visual cues - screen readers need ARIA |
| Disable the button only after a failed submit | Disable the button on initial load (user can't discover validation) |
| Use `role="alert"` on error messages | Hide errors from assistive technology |

## Check Your Work

- [ ] `npm run build` completes with zero errors
- [ ] Clicking **Save Entry** with empty fields shows both error messages
- [ ] The **Save Entry** button becomes disabled after a failed submit
- [ ] Typing in a field clears its error and re-enables the button once both are valid
- [ ] Submitting with valid data logs to the console, clears fields, and hides errors
- [ ] Each error message has `role="alert"` for screen readers
- [ ] Inputs have `aria-invalid` and `aria-describedby` when errors are shown
- [ ] No errors are visible on the initial (fresh) page load

## Stretch Goals

- Add a minimum-length check: title must be at least 3 characters
- Add a maximum-length check: content must be under 500 characters - show a
  live character count below the textarea
- Show a success message (e.g., "Entry saved!") for 2 seconds after a
  successful submit using `setTimeout`
- Extract the validation logic into a `useFormValidation` custom hook (a preview
  of custom hooks)

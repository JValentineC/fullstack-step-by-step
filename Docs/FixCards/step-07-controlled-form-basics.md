# Fix Cards -- Step 07: Controlled Form Basics

Five Fix Cards aligned to the core skills in Step 07. Each card targets one failure mode so you can pull the right small group.

---

## Fix Card 1: useState for Form Fields

**Skill or Task**

Declare and use `useState` to store form field values (`title` and `content`).

**Done**

Done = Intern can create two `useState` hooks (one for `title`, one for `content`) with empty-string defaults AND `npm run build` passes with zero errors.

**Bucket**

- Broken:
- Almost:
- Solid:

**Fix Type**

Explain

**Show**

Demo a minimal component with one `useState` hook. Show the three parts: the import, the declaration (`const [title, setTitle] = useState('')`), and where the value gets used. Point out the destructured array pattern and that the default is an empty string, not `undefined`.

**Do**

Intern adds a second `useState` hook for `content` in their `NewEntryForm.tsx`. They write it from scratch -- no copy-paste from the first one. Run `npm run build` to check for errors.

**Prove**

Expected Output -- `npm run build` completes with 0 errors AND the component file contains two separate `useState('')` declarations.

**If Interns Fail**

Narrow the scope: have them write just the import line and one `useState` call on a blank file. Confirm the destructuring syntax before adding the second hook.

---

## Fix Card 2: Controlled Inputs (value + onChange)

**Skill or Task**

Bind `value` and `onChange` on `<input>` and `<textarea>` so React state is the single source of truth.

**Done**

Done = Intern can wire `value` and `onChange` on both the title input and content textarea AND typing in the browser updates the field in real time (no frozen inputs, no console errors).

**Bucket**

- Broken:
- Almost:
- Solid:

**Fix Type**

Walkthrough

**Show**

Demo the common mistake first: an input with `value={title}` but no `onChange`. Type in it -- nothing happens (frozen input). Then add the `onChange={(e) => setTitle(e.target.value)}` and show it working. Emphasize: "value without onChange = frozen input."

**Do**

Intern wires both the `<input>` and the `<textarea>` in their `NewEntryForm.tsx`. They must:

1. Set `value` to the matching state variable
2. Set `onChange` to update that state variable using `e.target.value`

Run `npm run dev`, type in both fields, confirm real-time updates.

**Prove**

Behavior Check --

- Scenario 1: Type "Hello" in the title field -> the input displays "Hello" as you type.
- Scenario 2: Type a paragraph in the content textarea -> the textarea displays it as you type.
- Scenario 3: No errors in the browser console.

**If Interns Fail**

Isolate the problem: have them wire just the title input first. If still stuck, write the `onChange` handler as a named function instead of inline so they can add a `console.log` inside it to see `e.target.value` on each keystroke.

---

## Fix Card 3: Form Submission (onSubmit + preventDefault)

**Skill or Task**

Handle form submission with `onSubmit`, call `event.preventDefault()`, log the form data, and reset the fields.

**Done**

Done = Intern can submit the form AND the console logs `{ title, content }` without the page reloading AND both fields reset to empty after submission.

**Bucket**

- Broken:
- Almost:
- Solid:

**Fix Type**

Troubleshoot

**Show**

Demo the wrong way first: remove `event.preventDefault()` and submit the form. Watch the page reload and the URL change to include query params. Then add `preventDefault()` back and submit again -- no reload, values logged to console. "One line prevents the browser from hijacking your form."

**Do**

Intern writes the `handleSubmit` function from scratch:

1. Accept the event parameter (typed as `FormEvent<HTMLFormElement>`)
2. Call `event.preventDefault()`
3. `console.log({ title, content })`
4. Reset both state values to empty strings

Attach it to the form's `onSubmit`. Fill in both fields, click Save Entry.

**Prove**

Expected Output --

1. Open browser DevTools console
2. Type "Test Title" in title, "Test Content" in content
3. Click Save Entry
4. Console shows: `{ title: "Test Title", content: "Test Content" }`
5. Both fields are now empty
6. Page did NOT reload (URL stays the same, no query params)

**If Interns Fail**

Break it into two rounds. Round 1: just get `preventDefault()` and `console.log` working (skip the reset). Round 2: add the two `set` calls to clear the fields. Confirm each round separately.

---

## Fix Card 4: Labels and Accessibility (htmlFor + id)

**Skill or Task**

Associate each `<label>` with its input using `htmlFor` on the label and a matching `id` on the input.

**Done**

Done = Intern can pair every label with its input using `htmlFor`/`id` AND clicking the label text focuses the corresponding input.

**Bucket**

- Broken:
- Almost:
- Solid:

**Fix Type**

Explain

**Show**

Show two versions side by side:

- Wrong: `<label>Title</label> <input />` -- click the label text, nothing happens.
- Right: `<label htmlFor="title">Title</label> <input id="title" />` -- click the label text, the input focuses.

Explain why JSX uses `htmlFor` instead of `for` (it is a reserved word in JavaScript).

**Do**

Intern adds `htmlFor` and matching `id` attributes to both the title label/input pair and the content label/textarea pair. They must use different `id` values for each (e.g., `"title"` and `"content"`).

**Prove**

Behavior Check --

- Scenario 1: Click the text "Title" (the label) -> the title input receives focus.
- Scenario 2: Click the text "Content" (the label) -> the content textarea receives focus.
- Scenario 3: Inspect the HTML in DevTools -> each `<label>` has `for` (rendered from `htmlFor`) matching an input's `id`.

**If Interns Fail**

Have them inspect one label-input pair in DevTools. Check that the `for` attribute value on the label exactly matches the `id` on the input (case-sensitive). Fix any mismatch, then repeat for the second pair.

---

## Fix Card 5: Adding a New Route

**Skill or Task**

Add a `/entries/new` route in React Router and link to it from the nav bar.

**Done**

Done = Intern can add the route and nav link AND clicking "New Entry" in the nav navigates to the form page without a full page reload.

**Bucket**

- Broken:
- Almost:
- Solid:

**Fix Type**

Walkthrough

**Show**

Open `App.tsx` and point to the existing `<Route>` entries. Show the pattern: `<Route path="..." element={<Component />} />`. Then show the `Header.tsx` nav and the existing `<Link>` components. "Adding a route is two steps: register the path, then link to it."

**Do**

Intern does both steps:

1. In `App.tsx`: add `<Route path="/entries/new" element={<NewEntry />} />` inside the existing `<Routes>` block
2. In `Header.tsx`: add `<Link to="/entries/new">New Entry</Link>` to the nav

Run `npm run dev` and click the new link.

**Prove**

Behavior Check --

- Scenario 1: Click "New Entry" in the nav -> URL changes to `/entries/new` and the form page renders.
- Scenario 2: The page does NOT do a full reload (no white flash, React state is preserved).
- Scenario 3: Click "Home" -> returns to `/`. Click "New Entry" again -> returns to `/entries/new`. Navigation works in both directions.

**If Interns Fail**

Check for common issues: Did they import `NewEntry`? Is the route inside `<Routes>`? Is the `Link` using `to` (not `href`)? Fix one issue at a time and re-test after each.

---

## Quick Reference: Which Card to Pull

| Observed Failure                                           | Card to Use               |
| ---------------------------------------------------------- | ------------------------- |
| Intern does not know how to declare state for a form field | Card 1: useState          |
| Input appears frozen or does not update when typing        | Card 2: Controlled Inputs |
| Page reloads on submit, or fields do not clear             | Card 3: Form Submission   |
| Labels are not linked to inputs, no focus on click         | Card 4: Labels / a11y     |
| New Entry link is missing or route shows a blank page      | Card 5: Adding a Route    |

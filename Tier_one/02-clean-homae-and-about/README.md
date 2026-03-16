# Step 02 - Clean Template + Home & About (No classNames)

## Goal

Strip out the Vite starter template UI and replace it with a clean **Home page** and **About Me section** using only semantic HTML tags - no `className` attributes yet.

## What You'll Practice

- Deleting template boilerplate safely (logos, counter, unused imports)
- Writing semantic HTML in React: `<header>`, `<main>`, `<section>`, `<footer>`
- Understanding the difference between template CSS (`App.css`) and global CSS (`index.css`)
- Thinking about page structure *before* styling

## Prerequisites

- Step 01 completed and running

## Steps

### 1. Start from a copy of Step 01

Copy the Step 01 folder (or scaffold fresh with `npm create vite@latest devlog-02 -- --template react-ts`). Install dependencies:

```bash
cd 02-clean-homae-and-about
npm install
```

### 2. Delete unused template files

Remove these files - they belong to the Vite demo and we won't need them:

| File | Why it's safe to delete |
|---|---|
| `src/App.css` | All the `.logo`, `.card`, `.read-the-docs` styles are for the demo counter UI. |
| `src/assets/react.svg` | The spinning React logo - we're replacing the whole page. |

### 3. Simplify `index.css`

Open `src/index.css` and keep **only** the base resets - remove button styles, link colors, logo animations, and anything tied to the demo UI. A minimal version:

```css
:root {
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
}
```

### 4. Rewrite `App.tsx`

Replace everything in `src/App.tsx` with semantic HTML - **no `className`, no `useState`, no imports except the default export**:

```tsx
function App() {
  return (
    <>
      <header>
        <h1>DevLog</h1>
        <p>A developer's learning journal</p>
      </header>

      <main>
        <section>
          <h2>Home</h2>
          <p>Welcome to my DevLog! This is where I document what I'm learning as a developer.</p>
        </section>

        <section>
          <h2>About Me</h2>
          <p>
            Hi! I'm a software engineering intern learning to build full-stack web apps.
            I'm currently working through the SERN stack: SQL Server, Express, React, and Node.
          </p>
          <p>
            This DevLog tracks my progress step by step - from scaffolding a Vite project
            all the way to deploying on GitHub Pages.
          </p>
        </section>
      </main>

      <footer>
        <p>&copy; 2026 DevLog</p>
      </footer>
    </>
  )
}

export default App
```

### 5. Run and verify

```bash
npm run dev
```

Open the browser. You should see plain text with:
- A **header** with "DevLog" and a tagline
- A **Home** section and an **About Me** section
- A **footer** at the bottom

No logos, no counter, no spinning animations - just clean semantic markup.

## Helpful Hints

- **Semantic HTML** means using tags that describe the *meaning* of the content, not how it looks. `<header>` tells the browser (and screen readers) "this is the page header," while a generic `<div>` says nothing.
- Common semantic tags and when to use them:
  | Tag | Purpose |
  |---|---|
  | `<header>` | Introductory content or navigation (usually at the top) |
  | `<main>` | The primary content of the page (only one per page) |
  | `<section>` | A thematic grouping of content, usually with a heading |
  | `<footer>` | Footer content (copyright, links, etc.) |
  | `<nav>` | A block of navigation links (we'll add this in a later step) |
- The **fragment** `<> ... </>` lets you return multiple sibling elements from a component without adding an extra `<div>` to the DOM.
- We removed `App.css` entirely because every style in it was tied to the demo UI. `index.css` stays because it has useful global resets (font, body margin, color scheme).
- **No `className` yet!** We'll introduce styling in a future step. For now, semantic HTML alone gives us a clear content hierarchy.

## Do ✅ / Don't ❌

| ✅ Do | ❌ Don't |
|---|---|
| Use semantic tags: `header`, `main`, `section`, `footer`. | Add `className` attributes - that's a future step. |
| Remove *all* demo code: logos, counter, `useState`. | Leave dead imports (e.g., `import './App.css'` for a deleted file). |
| Keep `index.css` with just base resets. | Delete `index.css` entirely - we still want sensible font and color defaults. |
| Commit: `feat(step-02): strip template and add About section`. | Import new libraries or add routing yet. |
| Personalize the About Me text with your own info. | Worry about how it looks - styling comes later. |

## Check Your Work

- [ ] `npm run dev` starts without errors.
- [ ] The page shows **DevLog** as the main heading.
- [ ] There are **two sections**: Home and About Me, each with an `<h2>`.
- [ ] There is a **footer** with a copyright line.
- [ ] **No logos**, counter button, or spinning animations remain.
- [ ] `src/App.css` and `src/assets/react.svg` are gone.
- [ ] No `className` attributes appear anywhere in `App.tsx`.

## Stretch

1. Open the browser's **DevTools → Elements** tab and inspect the DOM tree. Can you see the `<header>`, `<main>`, `<section>`, and `<footer>` tags? Notice how they match your JSX exactly.
2. Add a third `<section>` - maybe "What I'm Learning" - and list a few technologies using a `<ul>` with `<li>` items.
3. Try using the **Accessibility** tab in DevTools (or the Lighthouse audit). Does the page have a logical heading hierarchy (`h1` → `h2`)?
4. Read about [HTML semantic elements on MDN](https://developer.mozilla.org/en-US/docs/Glossary/Semantics#semantics_in_html) to deepen your understanding.

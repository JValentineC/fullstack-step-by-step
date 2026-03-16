# Step 04 - Basic Routing (One Link to a Second Page)

## Goal

Introduce **client-side routing** using `react-router-dom`. Add exactly one link on the Home page that navigates to a separate About page - no full-page reload. We use **`HashRouter`** so the app will work on GitHub Pages later.

## What You'll Practice

- Installing a new npm package (`react-router-dom`)
- Wrapping the app in `HashRouter` for hash-based routing
- Defining routes with `<Routes>` and `<Route>`
- Navigating between pages with `<Link>` (instead of `<a>`)
- Keeping two "page" components in a single file (for now)

## Prerequisites

- Step 03 completed - header with profile photo

## Steps

### 1. Start from a copy of Step 03

Copy your Step 03 folder (or start fresh). Install dependencies:

```bash
cd 04-basic-routing-one-link
npm install
```

### 2. Install React Router

```bash
npm install react-router-dom
```

This adds `react-router-dom` to `dependencies` in your `package.json`.

### 3. Wrap the app in `HashRouter`

Open `src/main.tsx` and wrap `<App />` with `<HashRouter>`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
```

> **Why `HashRouter`?** GitHub Pages serves static files and doesn't support server-side URL rewriting. `HashRouter` puts routes after a `#` in the URL (e.g., `https://you.github.io/devlog/#/about`), so the server always serves `index.html` and the router handles the rest in the browser.

### 4. Create two page components and define routes

Replace `src/App.tsx` with a `Home` component, an `About` component, and a route map:

```tsx
import { Routes, Route, Link } from 'react-router-dom'

function Home() {
  return (
    <>
      <header>
        <img src="/profile.jpg" alt="Profile photo of Intern Name" width="96" height="96" />
        <h1>DevLog</h1>
        <nav>
          <Link to="/about">Go to About Page</Link>
        </nav>
      </header>

      <main>
        <section>
          <h2>Welcome</h2>
          <p>This is the Home page of my DevLog.</p>
        </section>
      </main>

      <footer>
        <p>&copy; {new Date().getFullYear()} DevLog</p>
      </footer>
    </>
  )
}

function About() {
  return (
    <>
      <header>
        <nav>
          <Link to="/">Back to Home</Link>
        </nav>
      </header>

      <main>
        <section>
          <h2>About</h2>
          <p>
            Hi! I'm a software engineering intern learning to build full-stack web apps.
            I'm currently working through the SERN stack: SQL Server, Express, React, and Node.
          </p>
        </section>
      </main>
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
    </Routes>
  )
}
```

### 5. Run and verify

```bash
npm run dev
```

- The Home page shows at `http://localhost:5173/#/`
- Click **"Go to About Page"** - the URL changes to `/#/about` and the About content appears, **without a page reload**
- Click **"Back to Home"** to return

## Helpful Hints

- **`<Link to="/about">`** vs **`<a href="/about">`** - `<Link>` is a React Router component that navigates *within* the app without reloading the page. A regular `<a>` would cause a full page reload and bypass the router.
- **`<Routes>`** is the container that looks at the current URL and renders the matching `<Route>`.
- **`<Route path="/" element={<Home />} />`** means "when the URL path is `/`, render the `Home` component."
- **Hash routing URLs** look like `http://localhost:5173/#/about`. Everything after the `#` is handled by JavaScript, not the server. This is why it works on GitHub Pages without any server config.
- **`new Date().getFullYear()`** in the footer dynamically shows the current year - no need to update it manually each January.
- Both `Home` and `About` are in the same file for now. In a future step, we'll extract them into separate files.

## Do ✅ / Don't ❌

| ✅ Do | ❌ Don't |
|---|---|
| Use `<Link>` from React Router for navigation. | Use `<a href="...">` for internal links - that bypasses the router. |
| Wrap the app in `<HashRouter>` in `main.tsx`. | Put the router inside `App.tsx` - it should wrap the entire app at the entry point. |
| Keep both page components in `App.tsx` for now. | Create separate files yet - that's a future step. |
| Add a "Back to Home" link on the About page. | Leave the user stranded with no way back. |
| Commit: `feat(step-04): add routing with HashRouter and About page`. | Use `BrowserRouter` - it won't work on GitHub Pages without extra config. |

## Check Your Work

- [ ] `npm run dev` starts without errors.
- [ ] The Home page loads at `/#/` with your profile photo, heading, and a **"Go to About Page"** link.
- [ ] Clicking the link navigates to `/#/about` - the About content appears.
- [ ] The **page does not reload** during navigation (watch the browser tab - no spinner).
- [ ] The About page has a **"Back to Home"** link that works.
- [ ] The URL bar shows `/#/` and `/#/about` (hash-based routing).
- [ ] No `className` attributes anywhere in `App.tsx`.
- [ ] `react-router-dom` appears in `package.json` under `dependencies`.

## Stretch

1. **Add a 404 page:** Add a catch-all route `<Route path="*" element={<p>Page not found!</p>} />` at the bottom of your `<Routes>`. Navigate to `/#/nonsense` - what happens?
2. **Inspect the DOM:** Click the navigation link and watch the Elements panel in DevTools. Does the entire page get replaced, or just the content inside `#root`?
3. **Try `BrowserRouter`:** Temporarily swap `HashRouter` for `BrowserRouter` in `main.tsx`. Navigate to `/about` and hit refresh. What happens? (Swap it back to `HashRouter` when done.)
4. **Read the docs:** Check out the [React Router tutorial](https://reactrouter.com/start/framework/routing) to see what else routes can do (nested routes, URL params, loaders).

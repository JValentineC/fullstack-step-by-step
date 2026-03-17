# Step 05 - Extract Simple Components

## Goal

Refactor the monolithic `App.tsx` by extracting **`<Header />`**, **`<AboutSection />`**, and **`<Footer />`** into their own files inside a `src/components/` folder. The app looks and behaves **exactly the same** as Step 04 - but the code is now organized into reusable pieces.

## What You'll Practice

- Creating a `components/` folder and individual component files
- Writing a component as a function that returns JSX
- Using `export default` and `import` to wire components together
- Understanding that extracting components doesn't change what the user sees - it improves code organization

## Prerequisites

- Step 04 completed - routing with Home and About pages

## Steps

### 1. Start from a copy of Step 04

Copy your Step 04 folder. Install dependencies:

```bash
cd 05-extract-simple-components
npm install
```

### 2. Create the `src/components/` folder

```
src/
└── components/
    ├── Header.tsx
    ├── AboutSection.tsx
    └── Footer.tsx
```

### 3. Create `Header.tsx`

Move the `<header>` block (profile photo, heading, nav link) from the `Home` function into its own file:

```tsx
// src/components/Header.tsx
import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header>
      <img src="/profile.jpg" alt="Profile photo of Intern Name" width="96" height="96" />
      <h1>DevLog</h1>
      <nav>
        <Link to="/about">Go to About Page</Link>
      </nav>
    </header>
  )
}
```

### 4. Create `AboutSection.tsx`

Move the About `<section>` into its own file:

```tsx
// src/components/AboutSection.tsx
export default function AboutSection() {
  return (
    <section>
      <h2>About</h2>
      <p>
        Hi! I'm a software engineering intern learning to build full-stack web apps.
        I'm currently working through the SERN stack: SQL Server, Express, React, and Node.
      </p>
    </section>
  )
}
```

### 5. Create `Footer.tsx`

Move the `<footer>` into its own file:

```tsx
// src/components/Footer.tsx
export default function Footer() {
  return (
    <footer>
      <p>&copy; {new Date().getFullYear()} DevLog</p>
    </footer>
  )
}
```

### 6. Update `App.tsx` to import and use the components

Replace the inline JSX with the new components:

```tsx
// src/App.tsx
import { Routes, Route, Link } from 'react-router-dom'
import Header from './components/Header.tsx'
import AboutSection from './components/AboutSection.tsx'
import Footer from './components/Footer.tsx'

function Home() {
  return (
    <>
      <Header />

      <main>
        <section>
          <h2>Welcome</h2>
          <p>This is the Home page of my DevLog.</p>
        </section>
      </main>

      <Footer />
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
        <AboutSection />
      </main>

      <Footer />
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

### 7. Run and verify

```bash
npm run dev
```

The app should look and behave **identically** to Step 04. The only difference is how the code is organized.

## Helpful Hints

- **What is a component?** A function that returns JSX. That's it. `Header()` returns the header markup, `Footer()` returns the footer markup. React renders whatever the function returns.
- **`export default`** makes the component available to other files. **`import Header from './components/Header.tsx'`** brings it in. The name after `import` can be anything (it's a default export), but by convention we match the filename.
- **Why extract components?**
  - **Readability** - `<Header />` is easier to scan than 10 lines of header markup.
  - **Reusability** - `<Footer />` is used on both the Home *and* About pages. Change it once, it updates everywhere.
  - **Separation of concerns** - each file has one job.
- **The `components/` folder** is a convention, not a requirement. React doesn't care where files live. But organizing by type (`components/`, `pages/`, etc.) helps teams find things quickly.
- **Nothing changes visually** - this is a *refactor*. The user sees the exact same app. Refactoring means improving code structure without changing behavior.
- **`<Footer />` appears on both pages** now via import - if you update the copyright text in `Footer.tsx`, both pages get the change automatically.

## Do ✅ / Don't ❌

| ✅ Do | ❌ Don't |
|---|---|
| Create one file per component in `src/components/`. | Dump all components into a single file. |
| Use `export default` for each component. | Forget to export - you'll get an import error. |
| Import components at the top of `App.tsx`. | Use `require()` - that's CommonJS, not ES modules. |
| Verify the app looks identical to Step 04 after refactoring. | Add new features or UI changes - this step is *only* about extraction. |
| Reuse `<Footer />` on both pages. | Copy-paste footer markup into both pages. |
| Commit: `feat(step-05): extract Header, AboutSection, Footer components`. | Add `className` or styling - still not yet. |

## Check Your Work

- [ ] `npm run dev` starts without errors.
- [ ] The Home page looks identical to Step 04 (profile photo, heading, nav link, welcome section, footer).
- [ ] The About page shows the about content and footer.
- [ ] Navigation between pages works (no page reload).
- [ ] `src/components/Header.tsx` exists and exports the header component.
- [ ] `src/components/AboutSection.tsx` exists and exports the about section component.
- [ ] `src/components/Footer.tsx` exists and exports the footer component.
- [ ] `App.tsx` imports all three components - no inline header/footer markup remains in `Home`.
- [ ] `<Footer />` is used on **both** the Home and About pages.

## Stretch

1. **Create a `WelcomeSection.tsx`** component for the Home page's welcome `<section>`. Import it in `Home` just like the others.
2. **Try renaming a component file** (e.g., `Footer.tsx` → `SiteFooter.tsx`). What breaks? Fix the imports and confirm it works again.
3. **Count the lines in `App.tsx`** before and after extraction (compare with Step 04). How much shorter is it? Which version is easier to read?
4. **Open two component files side by side** in VS Code (right-click a tab → Split Right). Notice how each file is small, focused, and self-contained.

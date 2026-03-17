# Step 22 - Accessibility and Polish

## Goal

Make the DevLog app more accessible and polished. Add keyboard navigation support, screen reader improvements, better color contrast, focus management, and a proper 404 page. This is the final step - we'll also look back at what we've built.

## What You'll Practice

| Concept | Where |
|---|---|
| Skip-to-content link | `src/components/SkipLink.tsx` (new) |
| Focus management on route changes | `src/components/ScrollToTop.tsx` (new), `<main id="main-content" tabIndex={-1}>` |
| `NavLink` with automatic `aria-current` | `src/components/Header.tsx` |
| Focus-visible keyboard outlines | `src/index.css` (`:focus-visible`) |
| Focus first invalid field on form error | `src/components/EntryForm.tsx` |
| Screen-reader-only utility class | `src/index.css` (`.sr-only`) |
| Toast live regions (polite vs assertive) | `src/components/Toast.tsx` |
| Login error focus management | `src/components/LoginPage.tsx` |
| Color contrast (WCAG AA) | `src/index.css` (link colors) |
| 404 / catch-all route | `src/components/NotFound.tsx` (new), `src/App.tsx` |
| Meta description | `index.html` |

## Prerequisites

- Step 21 completed (testing and CI)

## What Changed from Step 21

| File | What Changed |
|---|---|
| `index.html` | Added `<meta name="description">` |
| `src/index.css` | Added link colors with AA contrast, skip-link styles, `:focus-visible` outlines, `.sr-only` class, light-mode overrides |
| `src/App.tsx` | Added `SkipLink`, `ScrollToTop`, `NotFound` (404) route; all `<main>` elements get `id="main-content" tabIndex={-1}`; loading states have `aria-live`; better empty state message |
| `src/components/Header.tsx` | Switched `Link` → `NavLink` (auto `aria-current="page"`); added `aria-label="Main navigation"` to `<nav>` |
| `src/components/EntryForm.tsx` | Focus first invalid field on validation failure; added `noValidate` to `<form>` (we handle validation ourselves) |
| `src/components/LoginPage.tsx` | Focus the error message on failed login; `<main>` gets `id="main-content"` |
| `src/components/Toast.tsx` | Split toasts by type: success uses `aria-live="polite"`, errors use `aria-live="assertive"` |
| `src/components/SkipLink.tsx` | **New** - skip-to-content link |
| `src/components/ScrollToTop.tsx` | **New** - scrolls to top on route change |
| `src/components/NotFound.tsx` | **New** - 404 page with link home |
| `src/components/__tests__/SkipLink.test.tsx` | **New** - tests skip link renders |
| `src/components/__tests__/NotFound.test.tsx` | **New** - tests 404 heading, link, and focusable main |
| `src/components/__tests__/EntryForm.test.tsx` | Updated - verifies focus moves to first invalid field |
| `package.json` | Name updated to `devlog-22` |
| `.github/workflows/ci.yml` | Updated working directory to `22-a11y-and-polish` |

Everything else is unchanged from Step 21.

## Setup

```bash
cd 22-a11y-and-polish
npm install
```

Copy your `.env` from Step 21:

```bash
cp ../21-testing-and-ci/.env .env
npx prisma generate
```

Run the test suite:

```bash
npm test
```

## Steps

### 1. Add a skip-to-content link

Users who navigate by keyboard (Tab key) or screen reader must tab through the entire header and navigation on every page before reaching the main content. A **skip link** lets them jump straight to it.

`src/components/SkipLink.tsx`:

```tsx
function SkipLink() {
  return (
    <a href="#main-content" className="skip-link">
      Skip to main content
    </a>
  )
}
```

The link is visually hidden by default and becomes visible when focused:

```css
.skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  padding: 0.5rem 1rem;
  background: #005fcc;
  color: #fff;
  z-index: 9999;
}

.skip-link:focus {
  left: 0;
}
```

The target is `<main id="main-content" tabIndex={-1}>` on every page. `tabIndex={-1}` makes the element focusable via JavaScript/anchor without adding it to the Tab order.

### 2. Add focus-visible outlines

By default, browsers show a focus ring on clicked elements, which annoys mouse users. `:focus-visible` only shows the outline when the user navigates with the keyboard:

```css
:focus-visible {
  outline: 3px solid #6eb3f7;
  outline-offset: 2px;
}
```

This gives keyboard users a clear, consistent focus indicator on every interactive element - links, buttons, inputs, selects.

### 3. Use NavLink for aria-current

React Router's `NavLink` automatically adds `aria-current="page"` to the active link. Screen readers announce this, so users know which page they're on:

```tsx
// Before (Step 21)
<Link to="/entries">Entries</Link>

// After (Step 22)
<NavLink to="/entries">Entries</NavLink>
```

We also added `aria-label="Main navigation"` to the `<nav>` so screen readers can distinguish it from other nav elements (like pagination).

### 4. Focus the first invalid field on form errors

When a user submits an invalid form, the error messages appear - but keyboard/screen reader users may not notice them. Moving focus to the first invalid field makes the error immediately obvious:

```tsx
const titleRef = useRef<HTMLInputElement>(null)
const contentRef = useRef<HTMLTextAreaElement>(null)

function handleSubmit(event: FormEvent) {
  event.preventDefault()
  setSubmitted(true)

  if (!isValid) {
    if (titleError) {
      titleRef.current?.focus()
    } else if (contentError) {
      contentRef.current?.focus()
    }
    return
  }
  // ...
}
```

The field has `aria-invalid="true"` and `aria-describedby` pointing to the error message, so the screen reader announces both the field name and the error text.

### 5. Split toast live regions by severity

Screen readers have two urgency levels for dynamic content:

- **`aria-live="polite"`** - waits until the user is idle, then announces. Good for success messages.
- **`aria-live="assertive"`** - interrupts immediately. Good for errors.

```tsx
<div role="status" aria-live="polite">
  {successToasts.map(/* ... */)}
</div>
<div role="alert" aria-live="assertive">
  {errorToasts.map(/* ... */)}
</div>
```

This ensures error toasts are announced immediately, while success toasts don't interrupt the user's flow.

### 6. Focus login error messages

When login fails, the error message appears - but screen reader users won't hear it unless focus moves to it:

```tsx
const errorRef = useRef<HTMLParagraphElement>(null)

// In the catch block:
setError(msg)
requestAnimationFrame(() => errorRef.current?.focus())
```

`requestAnimationFrame` ensures the element is rendered before we try to focus it.

### 7. Improve color contrast

WCAG AA requires a contrast ratio of at least **4.5:1** for normal text. We added explicit link colors that meet this threshold:

| Mode | Color | Background | Ratio |
|---|---|---|---|
| Dark | `#6eb3f7` | `#242424` | 7.2:1 |
| Light | `#0055bb` | `#ffffff` | 7.5:1 |

### 8. Add a screen-reader-only class

`.sr-only` hides content visually but keeps it accessible to screen readers. Use it when you need to provide extra context that's obvious to sighted users but not to screen reader users:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### 9. Scroll to top on route change

SPAs don't scroll to the top when navigating - the browser only does that for full page loads. `ScrollToTop` fixes this:

```tsx
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
```

This is a "renderless" component - it hooks into the router but doesn't produce any DOM output.

### 10. Add a 404 page

Without a catch-all route, navigating to a non-existent URL shows a blank page. Now we have `NotFound`:

```tsx
<Route path="*" element={<NotFound />} />
```

The `*` path matches anything that wasn't matched by previous routes.

### 11. Add a meta description

Search engines and social previews use `<meta name="description">`:

```html
<meta name="description" content="DevLog - a developer journal built with the SERN stack." />
```

## Helpful Hints

- **Tab through your app** - press Tab repeatedly from the top of the page. Can you reach every interactive element? Can you see where focus is?
- **Screen reader testing** - on Windows, use Narrator (Win+Ctrl+Enter) or NVDA (free). On Mac, use VoiceOver (Cmd+F5).
- **Color contrast checker** - use browser DevTools (Chrome → Inspect → Color picker shows contrast ratio) or [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).
- **`tabIndex={-1}`** means "focusable by JavaScript, but not in the Tab order." Use it on containers you want to focus programmatically (like `<main>`).
- **`aria-current="page"`** is set automatically by `NavLink` - you don't need to add it yourself.
- **Don't remove focus outlines** - if the default outline looks bad, replace it with `:focus-visible` styles. Never set `outline: none` without a replacement.

## ✅ Do

- Test with keyboard only (no mouse) - every feature should be usable
- Use semantic HTML elements (`<main>`, `<nav>`, `<header>`, `<footer>`, `<article>`)
- Label all form inputs with `<label htmlFor="...">`
- Use `aria-invalid` + `aria-describedby` for form error messages
- Provide visible focus indicators for all interactive elements
- Use `aria-live` regions for dynamic content (toasts, loading states)
- Focus the first invalid field when form validation fails

## ❌ Don't

- Don't set `outline: none` without providing an alternative focus style
- Don't rely on color alone to convey meaning (add text or icons too)
- Don't use `aria-label` when visible text already labels the element
- Don't add `role` attributes to elements that already have the correct implicit role (`<button>` already has `role="button"`)
- Don't forget `alt` text on images - if the image is decorative, use `alt=""`
- Don't use `tabIndex` values greater than 0 - they break the natural tab order

## Check Your Work

1. `npm test` → all 15 tests pass (7 test files)
2. `npm run build` → no TypeScript errors
3. **Keyboard test**: Press Tab from the top of each page - you should see a clear blue focus ring on every link, button, and form input
4. **Skip link**: Press Tab once on any page - the "Skip to main content" link appears at the top
5. **404 page**: Navigate to `/#/nonexistent` - you should see the "Page Not Found" page
6. **Form focus**: Submit an empty entry form - focus should move to the Title field

## Retrospective

Congratulations - you've built a complete full-stack application! Here's what the DevLog project covers across all 22 steps:

| Area | What You Learned |
|---|---|
| **Frontend** | React components, props, state, controlled forms, routing (HashRouter), context (auth), optimistic updates, environment variables, GitHub Pages deploy |
| **Backend** | Express REST API, middleware, CORS, environment variables, health checks, graceful shutdown, production hosting |
| **Database** | Prisma ORM, SQL Server, schema modeling, migrations, indexes, pagination, filtering, sorting |
| **Auth** | Password hashing (bcrypt), JWT tokens, protected routes, auth context, login/register flows |
| **Testing** | Vitest, React Testing Library, supertest, test setup, globals, mocking, CI pipeline |
| **DevOps** | GitHub Actions CI, GitHub Pages deploy, environment management, build pipelines |
| **Accessibility** | Skip links, focus management, ARIA attributes, keyboard navigation, color contrast, live regions, semantic HTML |

### What to explore next

- **Styling**: Add CSS Modules, Tailwind, or a component library (Radix, shadcn/ui)
- **State management**: Try Zustand or TanStack Query for server state
- **Real-time**: Add WebSockets for live-updating entries
- **File uploads**: Let users attach images to entries
- **Search**: Full-text search with SQL Server or Elasticsearch
- **Monitoring**: Add error tracking (Sentry) and analytics
- **Docker**: Containerize the app for consistent dev/deploy environments

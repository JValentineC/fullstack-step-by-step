# Step 23 - Tailwind CSS + daisyUI Setup

## Goal

Install **Tailwind CSS v4** and **daisyUI v5**, configure the build pipeline, and restyle the app's **layout shell** (navbar, footer, page containers) using daisyUI component classes. By the end of this step the app has a polished, theme-aware layout while every inner component (cards, forms, pagination) still uses plain HTML - we'll style those in Step 24.

## What You'll Practice

- Installing and configuring Tailwind CSS v4 with the Vite plugin
- Adding daisyUI as a Tailwind plugin via `@plugin`
- Using daisyUI's **navbar**, **menu**, **footer**, and **container** classes
- Tailwind utility classes for flex layout (`min-h-screen`, `flex`, `flex-col`, `flex-1`)
- Keeping accessibility features (skip-link, focus-visible) working with Tailwind's `@apply`

## Prerequisites

- Completed **Step 22** (a11y & polish)
- Node ≥ 20, npm

## Steps

### 1. Install Tailwind CSS and daisyUI

```bash
npm install tailwindcss @tailwindcss/vite daisyui
```

### 2. Add the Tailwind Vite plugin

Open `vite.config.ts` and import + add the plugin:

```ts
import tailwindcss from '@tailwindcss/vite'

// inside the plugins array:
plugins: [react(), tailwindcss()],
```

### 3. Replace `index.css` with Tailwind directives

Replace the entire contents of `src/index.css`:

```css
@import "tailwindcss";
@plugin "daisyui";

/* ── Skip link (a11y - kept from step 22) ─────────── */
.skip-link {
  @apply absolute -left-[9999px] top-0 z-[9999] px-4 py-2 bg-primary text-primary-content font-semibold no-underline;
}

.skip-link:focus {
  @apply left-0;
}
```

> **What happened?** The old hand-written CSS (colors, fonts, dark mode media queries, `.sr-only`) is all replaced by Tailwind's built-in utilities and daisyUI's theme system. Dark mode "just works" - daisyUI detects `prefers-color-scheme` automatically.

### 4. Restyle `Header.tsx` → daisyUI **navbar + menu**

Replace the plain `<header>` with daisyUI's `navbar` and `menu menu-horizontal` classes. Key changes:

- `<header className="navbar bg-base-200 shadow-sm px-4">`
- Profile image gets `className="rounded-full"` and smaller size (40�-40)
- Nav links go inside `<ul className="menu menu-horizontal px-1 gap-1">`
- Log Out button becomes `btn btn-ghost btn-sm`

### 5. Restyle `Footer.tsx` → daisyUI **footer**

```tsx
<footer className="footer footer-center p-4 bg-base-200 text-base-content mt-auto">
```

The `mt-auto` pushes the footer to the bottom inside the flex container.

### 6. Wrap every page in a layout container

In `App.tsx` (and `NotFound.tsx`, `LoginPage.tsx`), wrap each page's JSX:

```tsx
<div className="min-h-screen flex flex-col">
  <Header />
  <main id="main-content" tabIndex={-1} className="flex-1 container mx-auto px-4 py-8">
    {/* page content */}
  </main>
  <Footer />
</div>
```

This gives every page a sticky footer and centered, padded content area.

### 7. Verify

```bash
npm run dev
```

Open the app. You should see:
- A themed **navbar** with your profile photo, nav links, and auth controls
- Content centered in a max-width container with padding
- A **footer** that sticks to the bottom of the viewport
- Automatic **dark mode** if your OS is in dark mode

## Helpful Hints

| Topic | Hint |
|-------|------|
| **Tailwind v4 setup** | No `tailwind.config.js` needed - Tailwind v4 uses CSS-first configuration with `@import "tailwindcss"` and `@plugin`. |
| **daisyUI themes** | daisyUI ships with `light` and `dark` themes by default. You can add more via `@plugin "daisyui" { themes: [...] }` in your CSS. |
| **`@apply`** | Use `@apply` sparingly - it's useful for the skip-link class that must exist as a real CSS class, but prefer inline `className` in JSX. |
| **`container`** | Tailwind's `container` class centers content and caps `max-width` at each breakpoint. |
| **`menu` vs `btn`** | daisyUI `menu` is for navigation link lists. `btn` is for action buttons. Don't mix them in the same element. |

## Do ✅ / Don't ❌

| ✅ Do | ❌ Don't |
|-------|----------|
| Use daisyUI semantic classes (`navbar`, `menu`, `footer`, `btn`) | Don't write raw CSS for things daisyUI already provides |
| Keep `@apply` for skip-link and similar a11y classes | Don't use `@apply` for everything - prefer `className` in JSX |
| Let daisyUI handle dark mode automatically via themes | Don't write manual `@media (prefers-color-scheme)` rules |
| Keep `aria-label`, skip-link, and focus management from step 22 | Don't remove a11y attributes when adding classes |
| Wrap pages in `min-h-screen flex flex-col` for sticky footer | Don't set `height: 100vh` on body - it breaks on mobile |

## Check Your Work

- [ ] `npm run dev` starts without errors
- [ ] Navbar shows profile photo, nav links, and auth controls
- [ ] Footer is at the bottom of every page (even short pages)
- [ ] Toggle OS dark mode - the theme changes automatically
- [ ] Skip link still works: press **Tab** on page load → "Skip to main content" appears
- [ ] All existing routes still work (`/`, `/entries`, `/about`, `/login`, `/entries/new`, etc.)

## Stretch

- Try adding a custom daisyUI theme in your CSS:
  ```css
  @plugin "daisyui" {
    themes: light --default, dark --prefersDark, cyberpunk
  }
  ```
  Then add a theme switcher dropdown in the navbar.
- Add `drawer` classes to make the navbar collapse into a hamburger menu on mobile.

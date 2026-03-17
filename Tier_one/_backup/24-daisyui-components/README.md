# Step 24 - daisyUI Component Styling

## Goal

Restyle every remaining component with **daisyUI classes**: entry cards, forms, pagination, filters, sort controls, toasts, and the login form. By the end of this step the entire UI uses daisyUI's design system - no inline `style={{…}}` or bare HTML elements left.

## What You'll Practice

- daisyUI **card** component (`card`, `card-body`, `card-title`, `card-actions`)
- daisyUI **form controls** (`form-control`, `input`, `textarea`, `select`, `label`)
- daisyUI **badge** component for tags and mood
- daisyUI **join** + **btn** for pagination
- daisyUI **alert** for toast notifications
- daisyUI **btn-link** for inline text-style buttons
- Keeping accessibility (`aria-*`, `role`, focus management) intact while restyling

## Prerequisites

- Completed **Step 23** (Tailwind + daisyUI setup with layout shell)
- Node ≥ 20, npm

## Steps

### 1. Restyle `EntryCard.tsx` → daisyUI **card**

Replace the plain `<article>` with a card:

```tsx
<article className="card bg-base-100 shadow-md">
  <div className="card-body">
    <h3 className="card-title">{entry.title}</h3>
    {/* mood as a badge */}
    <span className="badge badge-outline badge-sm">{entry.mood}</span>
    {/* tags as clickable badges */}
    <button className="badge badge-primary badge-sm cursor-pointer">#{tag}</button>
    {/* action buttons */}
    <div className="card-actions justify-end">
      <Link className="btn btn-sm btn-ghost">Edit</Link>
      <button className="btn btn-sm btn-error">Delete</button>
    </div>
  </div>
</article>
```

### 2. Restyle `EntryForm.tsx` → daisyUI **form controls**

Replace `<p>` + `<label>` + `<br/>` + `<input>` patterns with:

```tsx
<form className="space-y-4 max-w-lg">
  <div className="form-control">
    <label className="label"><span className="label-text">Title</span></label>
    <input className="input input-bordered w-full" />
    {/* error */}
    <label className="label">
      <span className="label-text-alt text-error">Title is required.</span>
    </label>
  </div>
  {/* textarea, select, etc. follow the same pattern */}
  <button className="btn btn-primary">Save Entry</button>
</form>
```

Key classes:
- `input input-bordered` → styled text input
- `input-error` → red border on validation error
- `textarea textarea-bordered` → styled textarea
- `select select-bordered` → styled dropdown
- `label-text-alt text-error` → error hint text

### 3. Restyle `LoginPage.tsx` form

Same `form-control` pattern as EntryForm, plus:
- Error message uses `alert alert-error` instead of `<strong>`
- Toggle button uses `btn btn-link btn-sm`

### 4. Restyle `Pagination.tsx` → daisyUI **join + btn**

```tsx
<div className="join">
  <button className="join-item btn btn-sm">« Previous</button>
  <button className="join-item btn btn-sm btn-disabled">Page 1 of 3</button>
  <button className="join-item btn btn-sm">Next »</button>
</div>
```

### 5. Restyle `TagFilter.tsx` and `SortControls.tsx`

Replace `<p>` wrappers with flex layout + `select select-bordered select-sm`:

```tsx
<div className="flex flex-wrap items-center gap-2 mb-4">
  <label className="text-sm font-medium">Filter by tag:</label>
  <select className="select select-bordered select-sm">...</select>
  <button className="btn btn-ghost btn-sm">Clear filter</button>
</div>
```

### 6. Restyle `Toast.tsx` → daisyUI **toast + alert**

Replace inline `style={{…}}` with:

```tsx
<div className="toast toast-end toast-top z-50">
  <div className="alert alert-success shadow-lg mb-2">...</div>
  <div className="alert alert-error shadow-lg mb-2">...</div>
</div>
```

### 7. Verify

```bash
npm run dev
```

Check every page:
- **Entries list**: cards with shadows, badges for mood/tags, join pagination
- **New/Edit Entry**: styled form with input borders, error states in red
- **Login**: styled form, error alert, link-style toggle
- **Toasts**: colored alerts sliding in from top-right

## Helpful Hints

| Topic | Hint |
|-------|------|
| **`card-body`** | Always wrap card content in `card-body` - it adds padding and flex layout. |
| **`form-control`** | This is the wrapper that ties `label`, `input`, and error text together in daisyUI. |
| **`input-error`** | Add conditionally: `` className={`input input-bordered${hasError ? ' input-error' : ''}`} `` |
| **`badge` variants** | `badge-primary`, `badge-outline`, `badge-sm` - combine them freely. |
| **`join`** | Groups child elements visually (shared borders). Each child needs `join-item`. |
| **`toast` positioning** | `toast-end toast-top` places toasts at top-right. daisyUI handles the fixed positioning. |

## Do ✅ / Don't ❌

| ✅ Do | ❌ Don't |
|-------|----------|
| Use `form-control` + `label` + `input` together | Don't use `<br />` between labels and inputs |
| Use `badge` for small metadata (mood, tags) | Don't use `<small>` with inline styles for tags |
| Use `alert` for toast messages | Don't use inline `style={{…}}` for colors/layout |
| Use `btn btn-sm` variants for small action buttons | Don't mix `btn` classes on non-button elements |
| Keep all `aria-*`, `role`, and `id` attributes intact | Don't remove a11y attributes when adding daisyUI classes |

## Check Your Work

- [ ] `npm run dev` starts without errors
- [ ] Entry cards show with shadows, rounded corners, and proper card layout
- [ ] Tags render as clickable colored badges
- [ ] Mood shows as an outline badge
- [ ] Forms have bordered inputs with proper label spacing
- [ ] Validation errors show in red with `text-error`
- [ ] Pagination buttons are joined together in a button group
- [ ] Toast notifications use colored alert styles
- [ ] Login page has styled form with alert-style errors
- [ ] All keyboard navigation and screen reader support still works

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| **`@prisma/client did not initialize yet`** | Prisma needs a code-generation step after `npm install`. The generated client lives inside `node_modules/.prisma/client` and won't exist until you run the generator. | Run `npx prisma generate` then restart the dev server. |
| **`ECONNREFUSED` proxy errors in the Vite terminal** | The Express server crashed (or never started), so Vite's `/api` proxy has nothing to connect to. | Check the `[dev:server]` output for the real error. Fix it (usually the Prisma issue above or a missing `.env` variable), then restart. |
| **500 errors on `/api/entries` or `/api/entries/tags`** | The server is running but can't reach the database. | Make sure SQL Server is running and your `DATABASE_URL` in `.env` is correct. Run `npx prisma db push` to sync the schema if needed. |
| **Missing `.env` variables** | The server startup guard checks for `CORS_ORIGIN`, `DATABASE_URL`, and `JWT_SECRET`. | Copy `.env.example` to `.env` (or create `.env` manually) and fill in all three values. |
| **Styles not showing / no daisyUI classes** | Tailwind or daisyUI isn't wired up. | Confirm `@tailwindcss/vite` is in `vite.config.ts` plugins and `src/index.css` contains `@import "tailwindcss"` and `@plugin "daisyui"`. |

## Using the daisyUI Docs

The best way to learn daisyUI is to browse the official documentation:

👉 **[https://daisyui.com/components/](https://daisyui.com/components/)**

Every component page shows live previews, the required HTML/class structure, and all available variants. Here's how to get the most out of it:

1. **Search by component name** - Need a card? Go to the Card page. Need a modal? Search "modal." Each page is self-contained.
2. **Copy the class list, not the HTML** - daisyUI docs show plain HTML examples, but you're writing JSX. Copy the class names and apply them to your React components.
3. **Check the "Modifiers" section** - Most components have size (`btn-sm`, `btn-lg`), color (`btn-primary`, `btn-error`), and state (`btn-disabled`, `btn-active`) variants listed at the bottom of the page.
4. **Use the theme generator** - The [Theme Generator](https://daisyui.com/theme-generator/) lets you create a custom color palette and export it as CSS you can drop into your `index.css`.

## Make It Your Own 🎨

**Congratulations - you've built a full-stack application from scratch!** You have a working backend, a styled frontend, authentication, tests, and deployment.

Now it's time to stop following steps and start creating. This is **your** Dev Log. Make it reflect who you are:

- **Pick a theme** - Try different daisyUI themes (`cyberpunk`, `retro`, `synthwave`, `nord`) or build a custom one with the theme generator. Change the `@plugin "daisyui"` line in your CSS to set a default.
- **Add your personality** - Change the profile photo, write a real about page, pick colors that feel like you.
- **Build a feature** - What would make this app more useful to *you*? Markdown support? Image uploads? A dashboard with charts? Search? Dark mode toggle? Go build it.
- **Break things and fix them** - That's how you learn. You have Git, you have tests, you have everything you need to experiment safely.

The 24 steps got you here. What you build next is up to you. Ship something you're proud of. 🚀

## Stretch

- Add `loading loading-spinner` to the submit button while saving.
- Use `modal` to confirm deletion instead of `window.confirm()`.
- Add `tooltip` on tag badges showing "Click to filter by this tag".

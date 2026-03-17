# Step 03 - Header with Profile Photo

## Goal

Add a **profile image** inside the `<header>`, displayed before your name. The image lives in the `public/` folder and is referenced with an absolute path - still **no `className`** attributes.

## What You'll Practice

- Adding static assets to the Vite `public/` folder
- Using the `<img>` element with `src`, `alt`, `width`, and `height` attributes
- Writing meaningful `alt` text for accessibility
- Understanding why `public/` files use root-relative paths (`/profile.jpg`)

## Prerequisites

- Step 02 completed - clean semantic Home + About page

## Steps

### 1. Start from a copy of Step 02

Copy your Step 02 folder (or start fresh). Install dependencies:

```bash
cd 03-header-with-profile-photo
npm install
```

### 2. Add your photo to `public/`

Copy a profile photo into the `public/` folder and name it `profile.jpg` (or `profile.png`):

```
public/
└── profile.jpg   ← your photo goes here
```

> **Tip:** Use a small, square-ish image. A 200�-200 to 400�-400 pixel photo works well. You can resize with any image editor or an online tool.

### 3. Add the `<img>` to the header in `App.tsx`

Open `src/App.tsx` and add an `<img>` tag **above** your `<h1>` inside the `<header>`:

```tsx
<header>
  <img
    src="/profile.jpg"
    alt="Profile photo of Intern Name"
    width="96"
    height="96"
  />
  <h1>DevLog</h1>
  <p>A developer's learning journal</p>
</header>
```

The full file should now look like this:

```tsx
function App() {
  return (
    <>
      <header>
        <img
          src="/profile.jpg"
          alt="Profile photo of Intern Name"
          width="96"
          height="96"
        />
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

### 4. Run and verify

```bash
npm run dev
```

Open the browser. You should see your profile photo in the header, followed by "DevLog" and the tagline. The photo will appear at its natural position (above the heading, since there's no layout CSS yet).

## Helpful Hints

- **`public/` folder** - Any file placed here is served from the site root at runtime. So `public/profile.jpg` becomes `/profile.jpg` in the browser. Vite does **not** process these files (no hashing, no optimization) - they're copied as-is to the build output.
- **`src/assets/` vs `public/`** - Files in `src/assets/` get imported as modules and get hashed filenames in production (good for cache-busting). Files in `public/` keep their original name. For early steps, `public/` is simpler because you don't need `import` syntax.
- **`width` and `height` attributes** - Always include these on `<img>` tags. They tell the browser how much space to reserve *before* the image loads, preventing layout shift (the page jumping around as images pop in).
- **`alt` text** - Screen readers read this aloud for visually impaired users. Write something descriptive: "Profile photo of Jane Doe" is better than "photo" or "image". If an image is purely decorative, use `alt=""` (empty string) - but a profile photo is *not* decorative.
- **Why no `className` yet?** - The photo will stack vertically above the heading (default block layout). That's fine! We'll add layout CSS in a future step to place the photo side-by-side with the name.

## Do ✅ / Don't ❌

| ✅ Do | ❌ Don't |
|---|---|
| Place your image in `public/` and reference it as `/profile.jpg`. | Use `import` syntax for the image - that's `src/assets/` style, not needed here. |
| Include `width`, `height`, and a descriptive `alt` on the `<img>`. | Skip `alt` text - that's an accessibility failure. |
| Use a reasonably sized photo (under ~200 KB). | Commit a 5 MB uncompressed photo. |
| Keep the image above `<h1>` inside `<header>`. | Add `className` or inline `style` attributes - styling comes later. |
| Commit: `feat(step-03): add profile photo to header`. | Worry about side-by-side layout - that's a future step. |

## Check Your Work

- [ ] `npm run dev` starts without errors.
- [ ] A **profile photo** appears in the header area of the page.
- [ ] The image is **96�-96 pixels** (or whatever size you chose).
- [ ] Inspecting the `<img>` in DevTools shows a meaningful `alt` attribute.
- [ ] The `<img>` tag has both `width` and `height` attributes.
- [ ] The file `public/profile.jpg` exists (check with DevTools Network tab - it should load as `/profile.jpg`).
- [ ] No `className` attributes anywhere in `App.tsx`.

## Stretch

1. **Try a different format:** Rename your photo to `profile.png` or `profile.webp`, update the `src` in `App.tsx`, and confirm it still loads. Which format has the smallest file size?
2. **Break the `alt` text:** Temporarily remove the `alt` attribute and run a Lighthouse accessibility audit in DevTools. What score do you get? Add it back and re-run.
3. **Inspect the Network tab:** Open DevTools → Network, reload the page, and find `profile.jpg` in the list. What's the HTTP status code? What's the file size the browser downloaded?
4. **Check the build output:** Run `npm run build` and look in `dist/`. Is `profile.jpg` in there? Notice it keeps its original filename (unlike files imported from `src/assets/`).

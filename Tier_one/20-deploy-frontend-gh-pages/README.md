# Step 20 - Deploy Frontend to GitHub Pages

## Goal

Deploy the React frontend to **GitHub Pages** while keeping it connected to a separately-hosted backend. Learn how to configure the Vite base path, use environment variables for the API URL, and automate the deploy with the `gh-pages` package.

## What You'll Practice

| Concept | Where |
|---|---|
| Vite `base` path for subdirectory hosting | `vite.config.ts` |
| `VITE_*` environment variables (build-time) | `src/api/entries.ts`, `src/api/auth.ts` |
| `import.meta.env.BASE_URL` for static assets | `src/components/Header.tsx` |
| `.env.production` for production-only values | `.env.production.example` |
| `gh-pages` package for one-command deploy | `package.json` (`deploy` script) |
| HashRouter for static-file hosting | `src/main.tsx` (unchanged - already in place) |
| Separating frontend and backend deploys | Architecture overview |

## Prerequisites

- Step 19 completed (production-ready backend)
- A GitHub repository (you already have one)
- A deployed backend with a public URL (Azure, Railway, Render, etc.)

## What Changed from Step 19

| File | What Changed |
|---|---|
| `vite.config.ts` | Reads `VITE_BASE` from env to set Vite's `base` path for GitHub Pages |
| `src/api/entries.ts` | Uses `import.meta.env.VITE_API_URL` instead of hardcoded `/api` |
| `src/api/auth.ts` | Uses `import.meta.env.VITE_API_URL` instead of hardcoded `/api/auth` |
| `src/components/Header.tsx` | Uses `import.meta.env.BASE_URL` for the profile image path |
| `package.json` | Added `gh-pages` dev dependency + `"deploy"` script |
| `.env.production.example` | New file - template for production env vars |
| `.gitignore` | Added `.env.production` to ignored files |

Everything else is unchanged from Step 19.

## Setup

```bash
cd 20-deploy-frontend-gh-pages
npm install
```

Copy your `.env` from Step 19 for local development:

```bash
cp ../19-deploy-backend/.env .env
npx prisma generate
```

## Steps

### 1. Understand the problem

GitHub Pages serves **static files** - there's no Node.js server. Your React app needs to:

- Know its own URL path (e.g. `https://jvalentinec.github.io/fullstack-step-by-step/`)
- Know where the API lives (e.g. `https://your-backend.example.com`)

We solve both with **environment variables** that Vite bakes into the build.

### 2. Configure the Vite base path

GitHub Pages hosts your site at `https://<user>.github.io/<repo>/`. Vite needs to know this so asset paths (JS, CSS, images) are correct.

In `vite.config.ts`:

```ts
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: env.VITE_BASE ?? '/',
    // ...
  }
})
```

> **Why `loadEnv`?** Vite's `.env.*` files aren't loaded into `process.env` - they're only available via `import.meta.env` in source code. The config file runs in Node before that happens, so we use Vite's `loadEnv` helper to read `.env.production` ourselves.

- **Local dev**: `VITE_BASE` is not set → falls back to `'/'`
- **Production build**: Set `VITE_BASE=/fullstack-step-by-step/` in `.env.production`

### 3. Make API calls configurable

In `src/api/entries.ts` and `src/api/auth.ts`, the base URL now reads from `VITE_API_URL`:

```ts
const BASE = `${import.meta.env.VITE_API_URL ?? ''}/api`
```

- **Local dev**: `VITE_API_URL` is not set → falls back to `''` → requests go to `/api` → Vite proxy forwards to `localhost:4000`
- **Production**: `VITE_API_URL=https://your-backend.example.com` → requests go directly to the deployed backend

### 4. Fix static asset paths with `BASE_URL`

Images in `public/` (like `profile.jpg`) are referenced with absolute paths. When your app is at `/DevLog/`, the path `/profile.jpg` won't work - it needs to be `/DevLog/profile.jpg`.

Vite provides `import.meta.env.BASE_URL` (set automatically from the `base` config). Use it for any static asset reference:

```tsx
// ❌ Breaks on GitHub Pages - resolves to /profile.jpg
<img src="/profile.jpg" />

// ✅ Resolves to /DevLog/profile.jpg in production
<img src={`${import.meta.env.BASE_URL}profile.jpg`} />
```

> **Note**: `import.meta.env.BASE_URL` always has a trailing slash, so don't add one before the filename.

### 5. Create `.env.production`

Copy `.env.production.example` and fill in your real values:

```bash
cp .env.production.example .env.production
```

```env
VITE_BASE=/fullstack-step-by-step/
VITE_API_URL=https://your-backend.example.com
```

> **Important**: Vite automatically loads `.env.production` during `vite build`. You don't need to do anything special.

### 6. Why HashRouter?

GitHub Pages doesn't have a server to handle SPA fallback routing. With `BrowserRouter`, visiting `https://user.github.io/fullstack-step-by-step/entries` directly would return a 404.

`HashRouter` puts routes after `#`, so all URLs load `index.html`:

```
https://jvalentinec.github.io/fullstack-step-by-step/#/entries       ✅ works
https://jvalentinec.github.io/fullstack-step-by-step/entries          ❌ 404
```

We've been using `HashRouter` since Step 04 - no changes needed.

### 7. Deploy with `gh-pages`

The `gh-pages` package pushes the `dist/` folder to a `gh-pages` branch:

```bash
npm run deploy
```

This runs `npm run build && gh-pages -d dist` which:

1. Builds the React app with production env vars
2. Pushes the `dist/` folder to the `gh-pages` branch
3. GitHub Pages serves from that branch automatically

### 8. Enable GitHub Pages

1. Go to your repo on GitHub → **Settings** → **Pages**
2. Under **Source**, select the `gh-pages` branch and `/ (root)` folder
3. Click **Save**
4. Wait a minute - your site will be live at `https://<user>.github.io/<repo>/`

## Architecture After Deploy

```
┌──────────────────────────┐         ┌──────────────────────────┐
│   GitHub Pages           │  fetch  │   Backend Host           │
│   (static files)         │ ──────→ │   (Azure / Railway /     │
│                          │         │    Render / etc.)         │
│   React app (dist/)      │         │   Express + Prisma       │
│   HashRouter             │  CORS   │   SQL Server             │
│   VITE_API_URL           │ ←────── │   CORS_ORIGIN =          │
│                          │         │     GH Pages URL         │
└──────────────────────────┘         └──────────────────────────┘
```

## CORS Configuration

Once deployed, update the backend's `CORS_ORIGIN` env var to match your GitHub Pages URL:

```
CORS_ORIGIN=https://jvalentinec.github.io
```

Without this, the browser will block API requests from the frontend.

## Helpful Hints

- **`VITE_` prefix is required** - Vite only exposes env vars that start with `VITE_` to client-side code. This prevents accidentally leaking server secrets.
- **`.env.production` is loaded automatically** - Vite reads `.env.production` when you run `vite build` (or `npm run build`).
- **No trailing slash on `VITE_API_URL`** - the code adds `/api` after it.
- **Build output goes to `dist/`** - `gh-pages` pushes only this folder, so your source code stays private.
- **The `gh-pages` branch is auto-created** - you don't need to create it manually.
- **`import.meta.env.BASE_URL`** - Vite sets this automatically from your `base` config. Use it for any `public/` asset reference in JSX (images, favicons, etc.).

## ✅ Do

- Use `VITE_API_URL` for the backend URL - never hardcode it
- Use `import.meta.env.BASE_URL` for static asset paths - don't hardcode `/`
- Use `HashRouter` for GitHub Pages compatibility
- Set `CORS_ORIGIN` on the backend to your GitHub Pages URL
- Keep `.env.production` in `.gitignore` - it may contain your backend URL
- Test the production build locally before deploying (`npm run preview`)

## ❌ Don't

- Don't forget the `VITE_` prefix on env vars - they won't be available without it
- Don't use `BrowserRouter` with GitHub Pages (no server-side fallback)
- Don't set `CORS_ORIGIN` to `*` in production
- Don't hardcode `base: '/fullstack-step-by-step/'` in `vite.config.ts` - use the env var so it's flexible
- Don't commit `.env.production` with real backend URLs to public repos
- Don't use absolute paths like `"/profile.jpg"` - they ignore the base path

## Check Your Work

### Local development (unchanged)
1. `npm run dev` → app works at `http://localhost:5173`
2. API calls go through Vite proxy to `localhost:4000`

### Production build (local test)
1. Create `.env.production` from the example
2. `npm run build` → check `dist/` folder exists
3. `npm run preview` → app loads with correct asset paths

### Full deploy
1. `npm run deploy` → pushes to `gh-pages` branch
2. Enable GitHub Pages in repo settings
3. Visit `https://<user>.github.io/<repo>/` → React app loads
4. Login, create entries → API calls reach the deployed backend
5. Page refresh on any route → still works (HashRouter)

## Stretch

- Set up a GitHub Actions workflow that auto-deploys on push to `main`
- Add a custom domain to your GitHub Pages site
- Create a `404.html` in `public/` that redirects to `index.html` (lets `BrowserRouter` work on GH Pages)

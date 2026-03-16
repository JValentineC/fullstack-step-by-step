# Step 27 – Demo Mode for GitHub Pages

## Goal

Make the app fully functional on **GitHub Pages without a backend**. Create seed data files, a `DemoData` layer that uses `localStorage` for persistence, and auto-detect demo mode in the API modules so **zero changes** are needed in components.

## What You'll Practice

- Static JSON seed data (`dummy-logs.json`, `dummy-users.json`)
- `localStorage` as a lightweight persistence layer
- Conditional logic based on Vite env vars (`VITE_API_URL`)
- Maintaining identical function signatures across real and demo API paths

## Prerequisites

- Completed **Step 26** (backend deployed to NFSN)
- Node ≥ 20, npm

## Files Added / Changed

| File | Action | Purpose |
|------|--------|---------|
| `public/data/dummy-logs.json` | **New** | 26 seed log entries (one per step), written as JVC dev-log posts |
| `public/data/dummy-users.json` | **New** | 4 demo users (`jvc` admin + 3 interns) with plain-text passwords |
| `src/data/demo-data.ts` | **New** | `DemoData` object — mirrors the real API with localStorage caching |
| `src/api/entries.ts` | **Modified** | Added `DEMO` flag + delegates to `DemoData` when true |
| `src/api/auth.ts` | **Modified** | Added `DEMO` flag + delegates to `DemoData` when true |
| `.env.production` | **New** | Sets `VITE_BASE` only, omits `VITE_API_URL` to activate demo mode |

## Steps

### 1. Create the seed data files

Create `public/data/dummy-logs.json` — an array of `Entry` objects, one per repo step:

```json
[
  {
    "id": 1,
    "title": "Step 01 – Getting Started with Vite + React + TypeScript",
    "summary": "Hey interns! Welcome to Step 1 — we just scaffolded...",
    "mood": "happy",
    "tags": ["vite", "react", "typescript", "scaffold"],
    "createdAt": "2026-01-06T09:00:00.000Z",
    "updatedAt": "2026-01-06T09:00:00.000Z"
  }
]
```

Create `public/data/dummy-users.json`:

```json
[
  {
    "id": 1,
    "username": "jvc",
    "password": "hashedpassword_demo_jvc2026",
    "displayName": "Jonathan V. Castillo",
    "role": "admin",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
]
```

### 2. Create `src/data/demo-data.ts`

This module:
- Fetches the seed JSONs from `public/data/` on first load
- Merges any entries the user added/edited from `localStorage`
- Exposes `DemoData.fetchEntries()`, `.createEntry()`, `.updateEntry()`, `.deleteEntry()`, `.fetchTags()`, `.fetchEntry()` — same shapes as the real API
- Exposes `DemoData.login()`, `.register()`, `.fetchMe()` using fake base64 tokens
- Provides `DemoData.reset()` to wipe localStorage back to seed data

Key pattern — **localStorage merge**:

```ts
const merged = new Map<number, Entry>()
for (const e of seed) merged.set(e.id, e)
for (const e of local) merged.set(e.id, e)  // local wins
```

### 3. Wire `src/api/entries.ts` for auto-detection

Add at the top:

```ts
import { DemoData } from '../data/demo-data.ts'
const DEMO = !import.meta.env.VITE_API_URL
```

Then in every exported function, add an early return:

```ts
export async function fetchEntries(params = {}) {
  if (DEMO) return DemoData.fetchEntries(params)
  // ... existing fetch() code unchanged
}
```

### 4. Wire `src/api/auth.ts` the same way

```ts
import { DemoData } from '../data/demo-data.ts'
const DEMO = !import.meta.env.VITE_API_URL

export async function login(username, password) {
  if (DEMO) return DemoData.login(username, password)
  // ... existing fetch() code
}
```

### 5. Create `.env.production` for GitHub Pages

```env
# Demo mode — no backend
VITE_BASE=/fullstack-step-by-step/
```

By **omitting** `VITE_API_URL`, the build activates demo mode automatically.

### 6. Deploy

```bash
npm run deploy
```

## How It Works

```
VITE_API_URL set?
  ├── YES → real fetch() to Express backend (dev / prod)
  └── NO  → DemoData layer (GitHub Pages)
              ├── Seed: public/data/dummy-logs.json
              ├── Cache: localStorage
              └── Auth: fake base64 tokens
```

## Key Concepts

- **Environment-based feature flags** — `!import.meta.env.VITE_API_URL` is evaluated at build time by Vite, so dead code is tree-shaken in production
- **localStorage as a demo DB** — entries survive page reloads but not clearing site data
- **Transparent fallback** — components don't know or care whether they're hitting a real API or the demo layer

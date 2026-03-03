---
description: "Workflow for implementing a new step: code in jvc-dev-log, create step folder, update demo data, deploy GitHub Pages, commit & push."
applyTo: "**"
---

# Step Implementation Workflow

When the user asks to "do step NN", follow these phases in order.

## Phase 1 — Implement in jvc-dev-log

1. **Read the root README** to confirm the step title and description.
2. **Identify the files** that need to change (backend, frontend, types, tests).
3. **Make the code changes** in `jvc-dev-log/`.
4. **Run `npm run build`** inside `jvc-dev-log/` to verify zero TypeScript errors.

## Phase 2 — Update Demo Layer

If the step adds or changes data shapes:

1. **Update `src/data/demo-data.ts`** — keep DemoData functions in sync with real API shapes.
2. **Update `public/data/dummy-logs.json`** — add a new seed entry for this step (dad-joke style, matching existing tone).
3. **Update `public/data/dummy-users.json`** — only if User model changes.
4. **Rebuild** to confirm demo-data compiles.

## Phase 3 — Create Step Folder

1. **Copy only changed/new files** into `NN-step-name/` (see `step-generation.instructions.md` for README template).
2. The step folder contains **only the diff** — files the learner would modify — plus structural files (`package.json`, configs, `index.html`).
3. **Write the step README** following the standard template.

## Phase 4 — Deploy GitHub Pages

```powershell
cd C:\Users\JonathanRamirez\Documents\Applications\DevLog\jvc-dev-log
npm run deploy
```

This builds with `.env.production` (no `VITE_API_URL` → demo mode) and publishes to GitHub Pages.

> **NFSN deploy** is handled manually by the user:
> ```powershell
> & "C:\Program Files\Git\bin\bash.exe" deploy-nfsn.sh
> ```

## Phase 5 — Git Commit & Push

```powershell
cd C:\Users\JonathanRamirez\Documents\Applications\DevLog
git add -A
git commit -m "Step NN: short description"
git push origin main
```

## Key Rules

- **Always build before deploying** — `npm run build` must pass clean.
- **Demo data stays in sync** — every type change must be reflected in `demo-data.ts`.
- **One step = one commit** — bundle step folder + jvc-dev-log changes + README updates together.
- **`.env.production`** must NOT contain `VITE_API_URL` (that activates demo mode for GH Pages).
- **`deploy-nfsn.sh`** sets `VITE_API_URL=https://icstarslog.nfshost.com` at build time for the live version.
- **Author field** — new entries created in demo mode should use the logged-in demo user's username.
- **dummy-logs.json entry** for each step follows the JVC dad-joke format with `~jv` sign-off.

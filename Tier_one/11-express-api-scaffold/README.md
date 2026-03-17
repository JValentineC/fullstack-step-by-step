# Step 11 - Express API Scaffold

## Goal

Add a **back-end Express + TypeScript** server to your existing front-end project
with a single `/api/health` endpoint. This is the first back-end step -- no
database yet. You will learn how to set up environment variables, CORS, and a
startup guard so the server fails fast when configuration is missing.

## What You'll Practice

| Skill | How |
|---|---|
| Express 5 basics | Create an app, add middleware, define a route, listen on a port |
| TypeScript on the server | Compile with `tsc`, run with `tsx` in dev mode |
| Environment variables | Read config from `.env` via `dotenv` |
| Startup guards | Exit with a helpful message when a required var is missing |
| CORS configuration | Allow only a specific origin read from `.env` |
| Health-check pattern | Expose `GET /api/health` -- useful for monitoring and smoke tests |
| Concurrently | Run front-end and back-end dev servers with a single command |

## Prerequisites

- Completed **Step 10** (front-end is feature-complete for now)
- **Node >= 20** and **npm** installed
- A terminal / code editor you are comfortable with

## Step-by-Step Instructions

### 1. Install and explore

This folder already contains the completed code from Step 10 -- the frontend app
with tags, mood fields, and state lifted to App. Install dependencies and start
the dev server:

```bash
npm install
npm run dev
```

Explore the existing code. You have a working React front end -- now you will add
a back-end API alongside it.

### 2. Install back-end dependencies

Add Express, CORS, dotenv, and the dev tools needed for TypeScript on the server:

```bash
npm install express cors dotenv
npm install -D typescript tsx @types/express @types/cors @types/node concurrently
```

### 3. Create the `server/` directory

Your back-end code lives in `server/` (separate from the front-end `src/`):

```
server/
  index.ts         <- Express server + health endpoint
```

### 4. Create `tsconfig.server.json`

Add a separate TypeScript config for the server alongside the existing front-end
configs:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "dist-server",
    "rootDir": "server",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "verbatimModuleSyntax": true
  },
  "include": ["server"],
  "exclude": ["node_modules", "dist-server"]
}
```

### 5. Set up environment variables

Create `.env.example` (committed to Git) with **placeholders only**:

```
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

Then copy it to `.env` (which is **git-ignored**):

```bash
cp .env.example .env
```

> **Important:** Never commit `.env` -- it may contain secrets in later steps.

### 6. Update `.gitignore`

Add back-end specific entries to `.gitignore`:

```
dist-server
.env
```

### 7. Write the server -- `server/index.ts`

```ts
import 'dotenv/config'
import express from 'express'
import cors from 'cors'

// --- Startup guard -------------------------------------------
const required = ['CORS_ORIGIN'] as const
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`)
    console.error('   Copy .env.example to .env and fill in the values.')
    process.exit(1)
  }
}

// --- App -----------------------------------------------------
const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({ origin: process.env.CORS_ORIGIN }))
app.use(express.json())

// --- Routes --------------------------------------------------
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// --- Listen --------------------------------------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`   Health check: http://localhost:${PORT}/api/health`)
})
```

### 8. Update `package.json` scripts

Add scripts to run both the front-end and back-end together:

```jsonc
{
  "scripts": {
    "dev": "concurrently \"npm:dev:client\" \"npm:dev:server\"",
    "dev:client": "vite",
    "dev:server": "tsx watch server/index.ts",
    "build": "tsc -b && vite build",
    "build:server": "tsc -p tsconfig.server.json",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

### 9. Build and run

```bash
npm run dev
```

This starts **both** the Vite dev server (port 5173) and the Express server
(port 4000) using `concurrently`. Open a second terminal and test:

```bash
curl http://localhost:4000/api/health
# -> { "status": "ok", "timestamp": "2025-..." }
```

## File Tree

```
11-express-api-scaffold/
├── .env.example         ← committed; placeholders only
├── .gitignore           ← ignores .env, node_modules, dist
├── package.json
├── tsconfig.json
└── src/
    └── index.ts         ← Express server + health endpoint
```

## Hints

<details>
<summary>What does <code>"type": "module"</code> mean?</summary>

It tells Node to treat `.js` files as ES Modules (using `import`/`export`)
instead of CommonJS (`require`/`module.exports`). Because we compile TypeScript
with `"module": "ESNext"`, the output uses `import` syntax and Node needs this
flag to understand it.

</details>

<details>
<summary>Why <code>tsx watch</code> instead of <code>node</code>?</summary>

`tsx` runs TypeScript directly without a separate compile step. The `watch` flag
restarts the server automatically whenever you save a file - great for
development. For production you would compile with `tsc` and run with
`node dist/index.js`.

</details>

<details>
<summary>What is a startup guard?</summary>

A small check that runs before the server starts listening. If a required
environment variable is missing, it logs a clear error and calls
`process.exit(1)` so you find out immediately instead of getting a cryptic
runtime error later.

</details>

<details>
<summary>Why is <code>CORS_ORIGIN</code> an env var?</summary>

In development the front end runs on `http://localhost:5173` (Vite's default),
but in production it will be on a different domain. Reading the origin from
`.env` lets you change it per environment without touching code.

</details>

## Do ✅ / Don't ❌

| Do ✅ | Don't ❌ |
|---|---|
| Read **all** config from `process.env` | Hard-code URLs, ports, or secrets |
| Keep `.env` out of Git (`.gitignore`) | Commit `.env` with real credentials |
| Commit `.env.example` with placeholder values | Skip the example file |
| Add a startup guard for required vars | Let the app crash with a confusing error |
| Use `express.json()` middleware early | Forget to parse JSON bodies (needed in future steps) |

## Check Your Work

- [ ] `npm run build` completes with **0 errors**
- [ ] `npm run dev` starts and prints the URL
- [ ] `GET http://localhost:4000/api/health` returns `{ "status": "ok", "timestamp": "..." }`
- [ ] Removing `CORS_ORIGIN` from `.env` and restarting shows the guard error
- [ ] `.env` is **not** tracked by Git

## Stretch

- Add a `GET /api/health/ready` endpoint that returns `503 Service Unavailable`
  for now (it will return `200` once a database is connected in Step 12).
- Add `morgan` for request logging (`npm install morgan @types/morgan`) and see
  each request printed in the terminal.
- Try running `npm start` (the production command) after `npm run build` and
  verify the health check still works.

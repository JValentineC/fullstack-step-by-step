# Step 11 - Express API Scaffold

## Goal

Create a standalone **Express + TypeScript** server with a single `/api/health`
endpoint. This is the first back-end step - no database yet. You will learn how
to set up environment variables, CORS, and a startup guard so the server fails
fast when configuration is missing.

## What You'll Practice

| Skill | How |
|---|---|
| Express 5 basics | Create an app, add middleware, define a route, listen on a port |
| TypeScript on the server | Compile with `tsc`, run with `tsx` in dev mode |
| Environment variables | Read config from `.env` via `dotenv` |
| Startup guards | Exit with a helpful message when a required var is missing |
| CORS configuration | Allow only a specific origin read from `.env` |
| Health-check pattern | Expose `GET /api/health` - useful for monitoring and smoke tests |

## Prerequisites

- Completed **Step 10** (front-end is feature-complete for now)
- **Node ≥ 20** and **npm** installed
- A terminal / code editor you are comfortable with

## Step-by-Step Instructions

### 1. Create the project folder

```bash
mkdir 11-express-api-scaffold
cd 11-express-api-scaffold
```

### 2. Initialise `package.json`

Create `package.json` with `"type": "module"` (ESM) and four scripts:

```jsonc
{
  "name": "devlog-server-11",
  "private": true,
  "type": "module",
  "scripts": {
    "dev":   "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint":  "eslint ."
  }
}
```

### 3. Install dependencies

```bash
npm install express cors dotenv
npm install -D typescript tsx @types/express @types/cors @types/node
```

### 4. Create `tsconfig.json`

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true
  },
  "include": ["src"]
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

> **Important:** Never commit `.env` - it may contain secrets in later steps.
> Ensure your `.gitignore` includes `.env`.

### 6. Create `.gitignore`

```
node_modules
dist
.env
```

### 7. Write the server - `src/index.ts`

```ts
import 'dotenv/config'
import express from 'express'
import cors from 'cors'

// --- Startup guard -------------------------------------------
const required = ['CORS_ORIGIN'] as const
for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌  Missing required env var: ${key}`)
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
  console.log(`✅  Server running on http://localhost:${PORT}`)
  console.log(`   Health check: http://localhost:${PORT}/api/health`)
})
```

### 8. Build & run

```bash
npm run build          # compiles to dist/ - should produce 0 errors
npm run dev            # starts with tsx in watch mode
```

Open a second terminal and test the health endpoint:

```bash
curl http://localhost:4000/api/health
# → { "status": "ok", "timestamp": "2025-..." }
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

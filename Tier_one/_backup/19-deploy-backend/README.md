# Step 19 - Deploy Backend

## Goal

Make the Express server **production-ready** by adding request logging, serving the Vite build as static files, handling graceful shutdown, and introducing a `start` script - everything a hosting platform needs to run your app.

## What You'll Practice

| Concept | Where |
|---|---|
| HTTP request logging with **morgan** | `server/index.ts` |
| Serving static files in production | `server/index.ts` (SPA fallback) |
| Graceful shutdown (SIGTERM / SIGINT) | `server/index.ts` |
| Production `start` script | `package.json` |
| Environment-based behaviour (`NODE_ENV`) | `server/index.ts` |
| Health check with DB connectivity | `/api/health/ready` |

## Prerequisites

- Step 18 completed (auth basics)
- Node ≥ 20, npm

## What Changed from Step 18

| File | What Changed |
|---|---|
| `server/index.ts` | Added **morgan** logging, **static file serving** for `dist/` in production, **graceful shutdown** on SIGTERM/SIGINT, `IS_PROD` flag |
| `package.json` | Added `morgan` + `@types/morgan`; added `"start"` script (`node dist-server/index.js`) |
| `.env.example` | Organised with section comments |

Everything else is unchanged from Step 18.

## Setup

```bash
cd 19-deploy-backend
npm install
```

Copy your `.env` from Step 18 (or from `.env.example` and fill in the values):

```bash
cp ../.env .env       # or copy manually
```

Push the schema (no changes from Step 18, but needed for this folder's `node_modules`):

```bash
npx prisma generate
npx prisma db push --accept-data-loss
```

## Steps

### 1. Add morgan for request logging

```bash
npm install morgan
npm install -D @types/morgan
```

In `server/index.ts`:

```ts
import morgan from 'morgan'

const IS_PROD = process.env.NODE_ENV === 'production'

// "dev" = coloured, concise output for local work
// "combined" = Apache-style logs for production
app.use(morgan(IS_PROD ? 'combined' : 'dev'))
```

Every HTTP request now shows in the console:

```
GET /api/entries 200 12.345 ms
POST /api/auth/login 200 45.678 ms
```

### 2. Serve the Vite build in production

After running `npm run build`, the compiled React app lives in `dist/`. In production, Express serves those files so you only deploy **one process**:

```ts
import path from 'node:path'
import { fileURLToPath } from 'node:url'

if (IS_PROD) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const clientDist = path.join(__dirname, '..', 'dist')

  app.use(express.static(clientDist))

  // SPA fallback - let React Router handle client-side routes
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}
```

> **Why after API routes?** Express matches routes top-down. API routes are registered first so `/api/*` requests never fall through to the SPA fallback.

### 3. Graceful shutdown

Hosting platforms send `SIGTERM` when they want your process to stop. A graceful shutdown:

1. Stops accepting new connections
2. Waits for in-flight requests to finish
3. Disconnects Prisma
4. Exits cleanly

```ts
function shutdown() {
  console.log('\n🛑  Shutting down gracefully…')
  server.close(async () => {
    await prisma.$disconnect()
    console.log('   Prisma disconnected. Bye!')
    process.exit(0)
  })
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
```

### 4. Add the production `start` script

In `package.json`, the new `start` script runs the **compiled** server:

```json
"start": "node dist-server/index.js"
```

The full production build sequence is:

```bash
npm run build           # Vite → dist/
npm run build:server    # TypeScript → dist-server/
npm start               # Runs dist-server/index.js
```

### 5. Health check endpoints

Two endpoints are available for monitoring:

| Endpoint | Purpose |
|---|---|
| `GET /api/health` | Always returns `{ status: "ok" }` - proves the process is alive |
| `GET /api/health/ready` | Pings the database - returns `{ status: "ready" }` or `503` if the DB is down |

Hosting platforms can use `/api/health` for liveness checks and `/api/health/ready` for readiness checks.

## Running in Production Mode Locally

```bash
# 1. Build everything
npm run build
npm run build:server

# 2. Set NODE_ENV
$env:NODE_ENV = "production"      # PowerShell
# export NODE_ENV=production      # bash/zsh

# 3. Start
npm start
```

Now visit `http://localhost:4000` - Express serves both the API and the React app from a single port.

## Deployment Checklist

When deploying to **any** platform (Azure App Service, Railway, Render, etc.):

| Item | Value |
|---|---|
| **Build command** | `npm run build && npm run build:server && npx prisma generate` |
| **Start command** | `npm start` |
| **Port** | Set `PORT` env var (most platforms inject this automatically) |
| **NODE_ENV** | `production` |
| **CORS_ORIGIN** | Your frontend URL (e.g. `https://yourapp.github.io`) |
| **DATABASE_URL** | Your production SQL Server connection string |
| **JWT_SECRET** | A long, random secret (different from local!) |

## Helpful Hints

- **morgan "dev" vs "combined"**: `dev` is coloured and concise for local development. `combined` includes IP, user-agent, and referrer - useful for production logs.
- **Static files only in production**: In development, Vite's dev server handles the frontend and proxies `/api` to Express. In production there's no Vite - Express serves everything.
- **Graceful shutdown**: Without it, in-flight requests get dropped and database connections leak when the host restarts your server.
- **`dist-server/`**: The compiled JavaScript output of your TypeScript server. `dist/` is the Vite-built frontend.

## ✅ Do

- Use `morgan` for logging - every request should be visible
- Serve static files only when `NODE_ENV === 'production'`
- Handle `SIGTERM` and `SIGINT` for graceful shutdown
- Use separate health endpoints for liveness vs readiness
- Keep secrets in environment variables, never in code

## ❌ Don't

- Don't skip `npm run build:server` - `npm start` needs the compiled JS
- Don't hardcode `PORT` - hosting platforms inject it via env var
- Don't set `CORS_ORIGIN` to `*` in production (use the exact frontend URL)
- Don't forget to set `NODE_ENV=production` on your host
- Don't log sensitive data (passwords, tokens) in morgan output

## Check Your Work

1. `npm run build` and `npm run build:server` both succeed
2. `npm start` starts the server (locally with `NODE_ENV=production`)
3. Visit `http://localhost:4000` - you see the React app
4. `http://localhost:4000/api/health` returns `{ "status": "ok" }`
5. `http://localhost:4000/api/health/ready` returns `{ "status": "ready" }`
6. Request logs appear in the console for every API call
7. Press Ctrl+C - the server shuts down cleanly with "Prisma disconnected"

## Stretch

- Add a `Dockerfile` that builds and runs the app in a container
- Add a `PORT` health-check to your hosting platform's dashboard
- Configure a custom morgan format that includes a request ID

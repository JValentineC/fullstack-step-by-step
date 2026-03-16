# Step 12 - Prisma + SQL Server Setup

## Goal

Add **Prisma ORM** to the Express server and connect it to a **SQL Server**
database. Define the `Entry` model, generate the Prisma client, and push the
schema to create the table. By the end of this step, the server has two health endpoints:
`/api/health` (always 200) and `/api/health/ready` (200 only when the database
is reachable).

## What You'll Practice

| Skill | How |
|---|---|
| Prisma setup | Install, init, configure `schema.prisma` with the SQL Server provider |
| Data modelling | Define an `Entry` model with typed fields and defaults |
| SQL Server connection string | Build a JDBC-style URL with `DATABASE_URL` |
| Environment variables | Add `DATABASE_URL` to `.env.example` and the startup guard |
| Schema sync | Run `prisma db push` to create the table |
| Singleton pattern | Export one `PrismaClient` instance to avoid connection leaks |
| Readiness check | A second health endpoint that pings the database |

## Prerequisites

- Completed **Step 11** (Express API scaffold)
- **SQL Server** running locally (SQL Server Developer, Express, or Docker)
- A database and login ready (e.g. `icstarsdevlog` / `devlog_user`)
- **Node ≥ 20** and **npm**

## Step-by-Step Instructions

### 1. Copy the previous step

```bash
cp -r 11-express-api-scaffold 12-prisma-sqlserver-setup
cd 12-prisma-sqlserver-setup
```

### 2. Install Prisma

```bash
npm install @prisma/client
npm install -D prisma
```

### 3. Initialise Prisma

```bash
npx prisma init --datasource-provider sqlserver
```

This creates `prisma/schema.prisma` and adds `DATABASE_URL` to `.env`. We will
edit both files next.

### 4. Fill your `.env` from `.env.example`

Copy the example file and replace the placeholder values:

```bash
cp .env.example .env
```

Open `.env` and update `DATABASE_URL` with your **real credentials**:

```
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
DATABASE_URL="sqlserver://localhost:1433;database=icstarsdevlog;user=devlog_user;password=YOUR_REAL_PASSWORD;encrypt=true;trustServerCertificate=true"
```

> **Never commit `.env`** - it contains secrets. Only `.env.example` (with
> placeholders) goes into Git.

### 5. Define the `Entry` model

Open `prisma/schema.prisma` and replace its contents with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlserver"
  url      = env("DATABASE_URL")
}

model Entry {
  id        Int      @id @default(autoincrement())
  title     String   @db.NVarChar(255)
  summary   String   @db.NVarChar(Max)
  mood      String   @db.NVarChar(50)
  tags      String   @db.NVarChar(500) // comma-separated; parsed in app code
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Why `NVarChar`?** SQL Server uses `NVarChar` for Unicode text. Prisma maps
`String` to `NVarChar(1000)` by default - we override with explicit lengths for
clarity.

**Why store tags as a string?** Prisma's SQL Server connector does not support
scalar arrays. We store comma-separated tags and parse them in application code
(the front end already does this).

### 6. Generate the Prisma client

```bash
npx prisma generate
```

This reads `schema.prisma` and generates TypeScript types + client into
`node_modules/@prisma/client`.

### 7. Create the Prisma singleton - `src/lib/prisma.ts`

```ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

Storing the client on `globalThis` prevents `tsx watch` from creating a new
connection pool on every reload.

### 8. Update `src/index.ts`

Three changes from Step 11:

1. Import the Prisma singleton
2. Add `DATABASE_URL` to the startup guard
3. Add `GET /api/health/ready` that pings the database

```ts
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { prisma } from './lib/prisma.js'

// --- Startup guard -------------------------------------------
const required = ['CORS_ORIGIN', 'DATABASE_URL'] as const
for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌  Missing required env var: ${key}`)
    console.error('   Copy .env.example to .env and fill in the values.')
    process.exit(1)
  }
}

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({ origin: process.env.CORS_ORIGIN }))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/api/health/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ready', timestamp: new Date().toISOString() })
  } catch {
    res.status(503).json({ status: 'unavailable', timestamp: new Date().toISOString() })
  }
})

app.listen(PORT, () => {
  console.log(`✅  Server running on http://localhost:${PORT}`)
  console.log(`   Health:  http://localhost:${PORT}/api/health`)
  console.log(`   Ready:   http://localhost:${PORT}/api/health/ready`)
})
```

### 9. Add helper scripts to `package.json`

```jsonc
"scripts": {
  "dev":         "tsx watch src/index.ts",
  "build":       "tsc",
  "start":       "node dist/index.js",
  "lint":        "eslint .",
  "db:generate": "prisma generate",
  "db:push":     "prisma db push",
  "db:studio":   "prisma studio"
}
```

### 10. Push the schema to the database

Make sure your SQL Server is running and `.env` has the correct `DATABASE_URL`,
then:

```bash
npm run db:push
```

Prisma will:
1. Compare your `schema.prisma` with the live database
2. Create or alter the `Entry` table to match
3. Re-generate the client

> **Why `db push` instead of `migrate dev`?** `prisma migrate dev` requires
> CREATE DATABASE permission (for a shadow database). If your SQL login has that
> permission, you can use migrations instead - they are better for production
> workflows. For local dev learning, `db push` is simpler.

### 11. Verify

```bash
npm run build          # 0 errors
npm run dev            # start the server
```

In another terminal:

```bash
curl http://localhost:4000/api/health
# → { "status": "ok", ... }

curl http://localhost:4000/api/health/ready
# → { "status": "ready", ... }   (if DB is up)
# → 503 { "status": "unavailable", ... }  (if DB is down)
```

Open Prisma Studio to inspect the empty `Entry` table:

```bash
npm run db:studio
```

## File Tree

```
12-prisma-sqlserver-setup/
├── .env.example            ← committed; includes DATABASE_URL placeholder
├── .gitignore              ← ignores .env, node_modules, dist
├── package.json            ← adds @prisma/client + prisma + db:* scripts
├── tsconfig.json
├── prisma/
│   └── schema.prisma       ← NEW - Entry model, SQL Server provider
└── src/
    ├── index.ts            ← UPDATED - imports prisma, guards DATABASE_URL, /ready
    └── lib/
        └── prisma.ts       ← NEW - PrismaClient singleton
```

## Hints

<details>
<summary>How do I get SQL Server running locally?</summary>

**Option A - Docker (recommended):**

```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStr0ng!Pass" \
  -p 1433:1433 --name sqlserver \
  -d mcr.microsoft.com/mssql/server:2022-latest
```

Then create the database and user with `sqlcmd` or Azure Data Studio.

**Option B - SQL Server Express:** Download the free Express edition from
Microsoft's site and install it with the default instance.

</details>

<details>
<summary>What does the connection string mean?</summary>

```
sqlserver://localhost:1433;database=icstarsdevlog;user=devlog_user;password=...;encrypt=true;trustServerCertificate=true
```

| Part | Meaning |
|---|---|
| `localhost:1433` | Server host and port (1433 is the SQL Server default) |
| `database=icstarsdevlog` | The database name |
| `user=devlog_user` | SQL login |
| `password=...` | SQL login password |
| `encrypt=true` | Use TLS encryption |
| `trustServerCertificate=true` | Accept self-signed certs (local dev only) |

</details>

<details>
<summary>Why a singleton for PrismaClient?</summary>

Each `new PrismaClient()` opens a connection pool. In development, `tsx watch`
restarts the module on every save - without the singleton, you would leak
connections until the database refuses new ones. Storing the instance on
`globalThis` keeps a single pool alive across reloads.

</details>

<details>
<summary>What if <code>prisma db push</code> fails?</summary>

Common causes:
- **SQL Server not running** - start the service or Docker container
- **Wrong password** - double-check `DATABASE_URL` in `.env`
- **Database doesn't exist** - create it first: `CREATE DATABASE icstarsdevlog;`
- **Firewall** - make sure port 1433 is open on localhost

</details>

## Do ✅ / Don't ❌

| Do ✅ | Don't ❌ |
|---|---|
| Keep `DATABASE_URL` in `.env` only | Hardcode the connection string in code |
| Commit `.env.example` with `REPLACE_ME` placeholder | Commit `.env` with real passwords |
| Use `@db.NVarChar(...)` for explicit column sizes | Rely on Prisma's default `NVarChar(1000)` for every field |
| Use the singleton pattern for `PrismaClient` | Create `new PrismaClient()` in every file |
| Add `DATABASE_URL` to the startup guard | Let the app crash with a Prisma connection error |
| Run `prisma generate` after changing the schema | Forget to regenerate and get stale types |

## Check Your Work

- [ ] `npx prisma generate` succeeds
- [ ] `npm run build` completes with **0 errors**
- [ ] `npm run db:push` creates the `Entry` table (requires running SQL Server)
- [ ] `GET /api/health` returns `{ "status": "ok" }`
- [ ] `GET /api/health/ready` returns `{ "status": "ready" }` when DB is up
- [ ] `GET /api/health/ready` returns **503** when DB is down
- [ ] `npm run db:studio` opens Prisma Studio showing the empty `Entry` table
- [ ] `.env` is **not** tracked by Git
- [ ] Removing `DATABASE_URL` from `.env` and restarting shows the guard error

## Stretch

- Add a `createdAt` index to the `Entry` model (`@@index([createdAt])`) and run
  a new migration to see how Prisma handles incremental changes.
- Write a small seed script (`prisma/seed.ts`) that inserts two sample entries.
  Register it in `package.json` under `"prisma": { "seed": "tsx prisma/seed.ts" }`
  and run `npx prisma db seed`.
- Try `npx prisma db pull` on an existing database to see how Prisma
  introspects tables into a schema.

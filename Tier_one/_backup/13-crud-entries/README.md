# Step 13 - CRUD Entries

## Goal

Add five REST endpoints for **creating, reading, updating, and deleting** dev
log entries. By the end of this step the API supports the full CRUD lifecycle
through Prisma and SQL Server.

| Verb | Path | Purpose |
|---|---|---|
| `GET` | `/api/entries` | List all entries (newest first) |
| `GET` | `/api/entries/:id` | Get a single entry |
| `POST` | `/api/entries` | Create a new entry |
| `PUT` | `/api/entries/:id` | Update an existing entry |
| `DELETE` | `/api/entries/:id` | Delete an entry |

## What You'll Practice

| Skill | How |
|---|---|
| Express Router | Extract routes into a separate file and mount with `app.use` |
| Prisma queries | `findMany`, `findUnique`, `create`, `update`, `delete` |
| Request validation | Check required fields; return `400` with a clear message |
| HTTP status codes | `200` OK, `201` Created, `204` No Content, `400` Bad Request, `404` Not Found |
| REST conventions | Resource naming, verb semantics, JSON responses |

## Prerequisites

- Completed **Step 12** (Prisma + SQL Server - `Entry` table exists)
- SQL Server running with the `Entry` table pushed
- **Node ≥ 20** and **npm**

## Step-by-Step Instructions

### 1. Copy the previous step

```bash
cp -r 12-prisma-sqlserver-setup 13-crud-entries
cd 13-crud-entries
npm install
```

### 2. Fill your `.env` from `.env.example`

```bash
cp .env.example .env
```

Update `DATABASE_URL` with your real credentials (same as Step 12).

### 3. Generate the Prisma client

```bash
npx prisma generate
npx prisma db push        # idempotent - table already exists
```

### 4. Create the entries router - `src/routes/entries.ts`

Create a new file `src/routes/entries.ts`:

```ts
import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

const router = Router()

// GET /api/entries - list all entries (newest first)
router.get('/', async (_req, res) => {
  const entries = await prisma.entry.findMany({
    orderBy: { createdAt: 'desc' },
  })
  res.json(entries)
})

// GET /api/entries/:id - get one entry
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'id must be a number' })
    return
  }

  const entry = await prisma.entry.findUnique({ where: { id } })
  if (!entry) {
    res.status(404).json({ error: 'Entry not found' })
    return
  }
  res.json(entry)
})

// POST /api/entries - create a new entry
router.post('/', async (req, res) => {
  const { title, summary, mood, tags } = req.body

  if (!title || !summary || !mood) {
    res.status(400).json({ error: 'title, summary, and mood are required' })
    return
  }

  const entry = await prisma.entry.create({
    data: {
      title: String(title),
      summary: String(summary),
      mood: String(mood),
      tags: String(tags ?? ''),
    },
  })
  res.status(201).json(entry)
})

// PUT /api/entries/:id - update an entry
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'id must be a number' })
    return
  }

  const { title, summary, mood, tags } = req.body

  if (!title || !summary || !mood) {
    res.status(400).json({ error: 'title, summary, and mood are required' })
    return
  }

  const existing = await prisma.entry.findUnique({ where: { id } })
  if (!existing) {
    res.status(404).json({ error: 'Entry not found' })
    return
  }

  const entry = await prisma.entry.update({
    where: { id },
    data: {
      title: String(title),
      summary: String(summary),
      mood: String(mood),
      tags: String(tags ?? ''),
    },
  })
  res.json(entry)
})

// DELETE /api/entries/:id - delete an entry
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'id must be a number' })
    return
  }

  const existing = await prisma.entry.findUnique({ where: { id } })
  if (!existing) {
    res.status(404).json({ error: 'Entry not found' })
    return
  }

  await prisma.entry.delete({ where: { id } })
  res.status(204).end()
})

export default router
```

### 5. Mount the router in `src/index.ts`

Add two lines to `src/index.ts`:

1. Import the router at the top:

```ts
import entriesRouter from './routes/entries.js'
```

2. Mount it after the health routes:

```ts
app.use('/api/entries', entriesRouter)
```

The full updated `index.ts`:

```ts
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { prisma } from './lib/prisma.js'
import entriesRouter from './routes/entries.js'

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

app.use('/api/entries', entriesRouter)

app.listen(PORT, () => {
  console.log(`✅  Server running on http://localhost:${PORT}`)
  console.log(`   Health:  http://localhost:${PORT}/api/health`)
  console.log(`   Ready:   http://localhost:${PORT}/api/health/ready`)
  console.log(`   Entries: http://localhost:${PORT}/api/entries`)
})
```

### 6. Build & run

```bash
npm run build          # 0 errors
npm run dev            # start the server
```

### 7. Test every endpoint

Open a second terminal and run these commands:

**Create:**

```bash
curl -X POST http://localhost:4000/api/entries \
  -H "Content-Type: application/json" \
  -d '{"title":"First entry","summary":"Testing CRUD","mood":"happy","tags":"test,crud"}'
# → 201 { id: 1, title: "First entry", ... }
```

**List:**

```bash
curl http://localhost:4000/api/entries
# → [ { id: 1, ... } ]
```

**Get one:**

```bash
curl http://localhost:4000/api/entries/1
# → { id: 1, title: "First entry", ... }
```

**Update:**

```bash
curl -X PUT http://localhost:4000/api/entries/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated entry","summary":"Now with edits","mood":"curious","tags":"test,updated"}'
# → 200 { id: 1, title: "Updated entry", ... }
```

**Delete:**

```bash
curl -X DELETE http://localhost:4000/api/entries/1
# → 204 No Content
```

## File Tree

```
13-crud-entries/
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── prisma/
│   └── schema.prisma
└── src/
    ├── index.ts            ← UPDATED - mounts entriesRouter
    ├── lib/
    │   └── prisma.ts
    └── routes/
        └── entries.ts      ← NEW - all five CRUD handlers
```

## Hints

<details>
<summary>What is an Express Router?</summary>

A `Router` is like a mini-app that handles a group of related routes. You define
routes on the router with `router.get(...)`, `router.post(...)`, etc., then
mount it on a path:

```ts
app.use('/api/entries', entriesRouter)
```

All routes defined in the router are now relative to `/api/entries`. So
`router.get('/:id', ...)` becomes `GET /api/entries/:id`.

</details>

<details>
<summary>Why return early after sending a response?</summary>

Express does not stop executing after `res.json(...)` or `res.status(...).json(...)`.
If you don't `return`, the code continues and may try to send a second response,
which throws "Cannot set headers after they are sent." Using `return` after each
error response prevents this.

</details>

<details>
<summary>Why <code>String(title)</code> instead of just <code>title</code>?</summary>

`req.body` is typed as `any`. Wrapping values in `String()` ensures Prisma gets
a string even if someone sends a number. This is a lightweight safety measure -
in a production app you would use a validation library like Zod.

</details>

<details>
<summary>What does 204 No Content mean?</summary>

HTTP 204 means "the request succeeded, but there is no body to return." It is
the standard response for a successful DELETE - the resource is gone, so there
is nothing to send back.

</details>

## Do ✅ / Don't ❌

| Do ✅ | Don't ❌ |
|---|---|
| Extract routes into `src/routes/` | Put all route handlers in `index.ts` |
| Validate required fields before calling Prisma | Let Prisma throw a cryptic database error |
| Return proper HTTP status codes (201, 204, 400, 404) | Return 200 for everything |
| Check if the entry exists before update/delete | Let Prisma throw a "Record not found" error |
| Use `return` after sending an error response | Forget to return and risk sending double responses |

## Check Your Work

- [ ] `npm run build` completes with **0 errors**
- [ ] `POST /api/entries` with valid body → **201** + entry JSON
- [ ] `POST /api/entries` with missing fields → **400** + error message
- [ ] `GET /api/entries` → **200** + array of entries
- [ ] `GET /api/entries/:id` with valid id → **200** + entry JSON
- [ ] `GET /api/entries/999` → **404** + error message
- [ ] `PUT /api/entries/:id` with valid body → **200** + updated entry
- [ ] `DELETE /api/entries/:id` → **204** No Content
- [ ] `DELETE /api/entries/999` → **404** + error message
- [ ] `GET /api/entries/abc` → **400** "id must be a number"

## Stretch

- Add a `PATCH /api/entries/:id` endpoint that accepts partial updates (only the
  fields provided in the body are changed).
- Add request logging with `morgan` to see each HTTP method and status code in
  the terminal.
- Use a validation library like **Zod** to define a schema for the request body
  and replace the manual `if (!title || ...)` checks.

# Step 25 - Prisma MySQL / MariaDB Migration

## Goal

Switch the database layer from **SQL Server** to **MySQL / MariaDB**. Update
the Prisma schema, translate the native column types, generate the migration
SQL, and apply it to the new database. By the end of this step the existing
Express API connects to MySQL with zero changes to route or front-end code.

## What You'll Practice

| Skill | How |
|---|---|
| Prisma provider swap | Change `provider` from `sqlserver` to `mysql` |
| Native type mapping | Replace `@db.NVarChar(...)` with `@db.VarChar(...)` / `@db.Text` |
| Offline migration | Use `prisma migrate diff` to generate SQL without a live database |
| phpMyAdmin workflow | Apply migration SQL through a web panel when direct access is blocked |
| SSH tunneling (optional) | Forward a local port to a remote MySQL server for local development |
| Connection string format | Build a MySQL `DATABASE_URL` with percent-encoded special characters |

## Prerequisites

- Completed **Step 24** (daisyUI components)
- A **MySQL or MariaDB** database (local, Docker, or hosted)
- Database credentials (user, password, host, port, database name)
- **Node >= 20** and **npm**

## Why switch from SQL Server?

SQL Server is great for enterprise environments, but many hosting providers
(NearlyFreeSpeech.NET, PlanetScale, Railway, shared hosts) offer **MySQL or
MariaDB** instead. Moving to MySQL makes deployment simpler and cheaper for
personal projects.

The good news: Prisma abstracts most differences. Only the schema file and
connection string change - your Express routes, React components, and API
calls stay the same.

## Step-by-Step Instructions

### 1. Copy the previous step

```bash
cp -r 24-daisyui-components 25-prisma-mysql-migration
cd 25-prisma-mysql-migration
npm install
```

### 2. Update the Prisma schema provider

Open `prisma/schema.prisma` and change the `datasource` block:

**Before (SQL Server):**
```prisma
datasource db {
  provider = "sqlserver"
  url      = env("DATABASE_URL")
}
```

**After (MySQL):**
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

### 3. Translate the native column types

SQL Server and MySQL use different type names. Here is the mapping:

| SQL Server | MySQL | Why |
|---|---|---|
| `@db.NVarChar(100)` | `@db.VarChar(100)` | MySQL `VARCHAR` is already UTF-8 with `utf8mb4` |
| `@db.NVarChar(255)` | `@db.VarChar(255)` | Same conversion |
| `@db.NVarChar(4000)` | `@db.Text` | MySQL `TEXT` holds up to 65 535 bytes - better for long content |
| `@db.NVarChar(500)` | `@db.VarChar(500)` | Same conversion |
| `@db.NVarChar(50)` | `@db.VarChar(50)` | Same conversion |

Apply these changes to both models:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique @db.VarChar(100)
  password  String   @db.VarChar(255)
  createdAt DateTime @default(now())

  entries Entry[]
}

model Entry {
  id        Int      @id @default(autoincrement())
  title     String   @db.VarChar(255)
  summary   String   @db.Text
  mood      String   @db.VarChar(50)
  tags      String   @default("") @db.VarChar(500)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  userId Int?
  user   User? @relation(fields: [userId], references: [id])

  @@index([tags], name: "idx_entry_tags")
  @@index([createdAt], name: "idx_entry_created")
  @@index([userId], name: "idx_entry_user")
}
```

### 4. Add indexes

Notice the three `@@index` lines at the bottom of the `Entry` model. These
speed up filtering by tags, sorting by date, and looking up entries by user.
SQL Server had implicit indexes on some fields; MySQL benefits from explicit
ones.

### 5. Update the connection string

Open `.env` and replace the SQL Server connection string with a MySQL one:

**Before:**
```
DATABASE_URL="sqlserver://localhost:1433;database=icstarsdevlog;user=devlog_user;password=PASS;encrypt=true;trustServerCertificate=true"
```

**After:**
```
DATABASE_URL="mysql://your_user:your_password@127.0.0.1:3306/your_database"
```

The format is: `mysql://USER:PASSWORD@HOST:PORT/DATABASE`

> **Special characters in passwords** must be percent-encoded in the URL.
> For example `"` becomes `%22` and `:` becomes `%3A`.

### 6. Validate the schema

```bash
npx prisma validate
```

This checks for syntax errors without needing a database connection.

### 7. Generate the Prisma client

```bash
npx prisma generate
```

### 8. Generate the migration SQL (offline)

If you have direct database access:

```bash
npx prisma migrate dev --name init
```

If the database is remote and unreachable from your machine (common with shared
hosts), generate the SQL file without connecting:

```bash
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script
```

This prints the full `CREATE TABLE` SQL to your terminal. Save it or copy it
for the next step.

### 9. Apply the migration

**Option A - Direct access (local MySQL or SSH tunnel):**

`prisma migrate dev --name init` already applied it. You are done.

**Option B - phpMyAdmin (shared hosting):**

1. Log in to phpMyAdmin on your host
2. Select your database
3. Click the **SQL** tab
4. Paste the `CREATE TABLE` statements from Step 8
5. Click **Go**
6. Also create the Prisma migration tracking table:

```sql
CREATE TABLE `_prisma_migrations` (
    `id` VARCHAR(36) NOT NULL,
    `checksum` VARCHAR(64) NOT NULL,
    `finished_at` DATETIME(3) NULL,
    `migration_name` VARCHAR(255) NOT NULL,
    `logs` TEXT NULL,
    `rolled_back_at` DATETIME(3) NULL,
    `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `applied_steps_count` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 10. Verify

```bash
npm run build          # 0 errors
npm run dev            # start the server
```

Test the health endpoints:

```bash
curl http://localhost:4000/api/health
# { "status": "ok", ... }

curl http://localhost:4000/api/health/ready
# { "status": "ready", ... }   (if DB is reachable)
```

## SSH Tunneling (Optional)

If your MySQL server is hosted remotely and blocks direct port 3306 access,
use an SSH tunnel to make it appear local:

```bash
ssh -N -L 3307:your-dsn.db:3306 your_user@ssh.your-host.net
```

Then point Prisma at the tunnel:

```
DATABASE_URL="mysql://db_user:db_password@127.0.0.1:3307/your_database"
```

Keep the SSH window open while developing. The `-N` flag means "no remote
command - just forward the port."

## File Tree

```
25-prisma-mysql-migration/
├── .env.example            <- updated: MySQL connection string
├── prisma/
│   ├── schema.prisma       <- CHANGED: mysql provider, VarChar/Text types, indexes
│   └── migrations/
│       ├── migration_lock.toml
│       └── 20260301000000_init/
│           └── migration.sql  <- NEW: CREATE TABLE SQL for MySQL
├── server/                 <- NO CHANGES (Prisma abstracts the DB)
│   ├── index.ts
│   ├── app.ts
│   ├── lib/prisma.ts
│   ├── middleware/auth.ts
│   └── routes/
│       ├── entries.ts
│       └── auth.ts
└── src/                    <- NO CHANGES (frontend is DB-agnostic)
```

## Hints

<details>
<summary>Why didn't any route code change?</summary>

Prisma is a database abstraction layer. Your routes use `prisma.entry.create()`,
`prisma.entry.findMany()`, etc. Those methods work identically on SQL Server,
MySQL, PostgreSQL, and SQLite. Only the schema file and connection string are
database-specific.
</details>

<details>
<summary>What if I get "Access denied" from MySQL?</summary>

Check that:
- The user exists: `SELECT User FROM mysql.user;`
- The user has privileges on the database: `SHOW GRANTS FOR 'your_user'@'%';`
- The password is correct (use the raw password in `mysql` CLI, percent-encoded in URLs)
- The host allows remote connections (some hosts restrict to `localhost` only)
</details>

<details>
<summary>What is the <code>_prisma_migrations</code> table?</summary>

Prisma uses this table to track which migrations have been applied. When you run
`prisma migrate dev`, it records each migration's name, timestamp, and checksum.
If you apply migrations manually (via phpMyAdmin), you must create this table
yourself so Prisma knows the schema is up to date.
</details>

<details>
<summary>Can I use <code>prisma db push</code> instead of migrations?</summary>

Yes. `prisma db push` syncs your schema to the database without creating
migration files. It is simpler for prototyping but does not keep a history of
changes. For production workflows, migrations are preferred.
</details>

<details>
<summary>NVarChar vs VarChar - what changed?</summary>

SQL Server uses `NVarChar` for Unicode strings and `VarChar` for ASCII. MySQL's
`VarChar` with `utf8mb4` character set already supports full Unicode (including
emoji), so `NVarChar` is not needed. We also replaced `NVarChar(4000)` with
`TEXT` since MySQL `TEXT` is a better fit for long-form content.
</details>

<details>
<summary>What about FreeBSD hosting (e.g., NearlyFreeSpeech.NET)?</summary>

Prisma's query engine is a compiled Rust binary with **no prebuilt binaries for
FreeBSD**. If you deploy to a FreeBSD host, `npx prisma generate` will fail
because the engine can't be downloaded. There is also no official MySQL driver
adapter (`@prisma/adapter-mysql` does not exist on npm).

The solution is to replace the Prisma runtime with **mysql2** — a pure-JavaScript
MySQL driver that works on any platform. Your Prisma schema is still useful for
defining the data model and generating migration SQL, but the server code uses
`mysql2/promise` for all queries. Step 26 covers this migration in detail.
</details>

## Do / Don't

| Do | Don't |
|---|---|
| Run `prisma validate` after changing the schema | Push broken schemas to the database |
| Use `prisma migrate diff` when you have no database access | Guess at the SQL syntax |
| Percent-encode special characters in `DATABASE_URL` | Put raw `"` or `:` in the password field |
| Use `@db.Text` for long content fields | Use `@db.VarChar(4000)` (MySQL has a row-size limit) |
| Add `@@index` for columns you filter or sort by | Skip indexes and wonder why queries are slow |
| Keep the SSH tunnel window open during development | Close it and get "connection refused" errors |

## Check Your Work

- [ ] `prisma/schema.prisma` uses `provider = "mysql"`
- [ ] All `@db.NVarChar(...)` annotations are replaced with `@db.VarChar(...)` or `@db.Text`
- [ ] `npx prisma validate` passes
- [ ] `npx prisma generate` succeeds
- [ ] `.env` has a valid MySQL `DATABASE_URL`
- [ ] The `User` and `Entry` tables exist in the MySQL database
- [ ] `GET /api/health` returns `{ "status": "ok" }`
- [ ] `GET /api/health/ready` returns `{ "status": "ready" }` when the DB is reachable
- [ ] No route or component code was changed
- [ ] `.env` is not tracked by Git

## Stretch

- Try connecting to your MySQL database with `npx prisma studio` and add a
  test entry through the GUI.
- Write a seed script (`prisma/seed.ts`) that inserts a sample user and two
  entries. Register it in `package.json` under `"prisma": { "seed": "tsx prisma/seed.ts" }`
  and run `npx prisma db seed`.
- If you have access to both SQL Server and MySQL, run `prisma migrate diff`
  against each and compare the generated SQL to see how Prisma adapts.
- Set up an SSH tunnel and run `prisma migrate dev` through it to experience
  the automated migration workflow.

# Step 26 - Deploy Backend to NearlyFreeSpeech.NET

## Goal

Deploy the Express backend to **NearlyFreeSpeech.NET (NFSN)** so the
API is live on the internet. Along the way, replace **Prisma** with the
**mysql2** driver because NFSN runs **FreeBSD** and Prisma has no prebuilt
engine binary for that OS. By the end of this step the app is live at
`https://your-site.nfshost.com` with a real MySQL database.

## What You'll Practice

| Skill | How |
|---|---|
| Prisma → mysql2 migration | Replace the Prisma runtime with raw parameterized SQL via `mysql2/promise` |
| NFSN site setup | Create a Custom site, enable a daemon, set up a proxy |
| Build pipeline | Build locally, upload compiled JS + `node_modules` via WinSCP/SFTP |
| Daemon management | Use `run.sh` in `/home/protected/` to start Node as a persistent process |
| Proxy configuration | Route Apache on port 80 → your Node daemon on port 8080 |
| CORS configuration | Allow your frontend origin to call the API |
| FreeBSD gotchas | `#!/bin/sh` (not `#!/bin/bash`), POSIX line endings, daemon user permissions |

## Prerequisites

- Completed **Step 25** (Prisma MySQL migration — schema is MySQL-ready)
- A **NearlyFreeSpeech.NET** account with:
  - A **Custom** site created (e.g., `icstarslog`)
  - A **MySQL process** created (e.g., DSN: `icstarslog.db`)
  - SSH access enabled
- Database tables already created (from Step 25 via phpMyAdmin)
- **Node >= 20** and **npm** on your local machine

## Why replace Prisma with mysql2?

NFSN runs **FreeBSD 14**. Prisma's query engine is a compiled Rust binary and
there are **no prebuilt binaries for FreeBSD**. There is also no official MySQL
driver adapter (`@prisma/adapter-mysql` does not exist on npm). The solution is
to replace the Prisma runtime with **mysql2** — a pure-JavaScript MySQL driver
that works on any platform Node.js runs on. Your route logic stays almost
identical; only the data-access calls change.

## How NFSN hosting works

NFSN is a pay-as-you-go shared host. Key concepts:

| Concept | What it means |
|---|---|
| **Site** | Your web application. Must be **Custom** server type for daemons. |
| **Daemon** | A long-running process (your Node server). Runs your `run.sh` script. |
| **Proxy** | Apache routes incoming HTTP to your daemon's port (e.g., 8080). |
| **MySQL process** | MariaDB with an internal DSN like `icstarslog.db`. Only reachable from within NFSN. |
| **SSH** | Connect via `ssh user@ssh.nyc1.nearlyfreespeech.net` to manage files. |
| `/home/protected` | Not web-accessible. Store `run.sh` (daemon script) here. |
| `/home/public` | The web root. `dist/`, `dist-server/`, `node_modules/`, `package.json` go here. |

## Step-by-Step Instructions

### 1. Copy the previous step

```bash
cp -r 25-prisma-mysql-migration 26-deploy-backend-nfsn
cd 26-deploy-backend-nfsn
npm install
```

### 2. Install mysql2 and remove Prisma runtime dependency

```bash
npm install mysql2
```

You can leave `@prisma/client` in `package.json` for schema management, but
the server will no longer import it at runtime.

### 3. Create `server/lib/db.ts` — the mysql2 connection pool

Replace `server/lib/prisma.ts` with a new `server/lib/db.ts`:

```ts
import mysql from 'mysql2/promise'
import type { RowDataPacket } from 'mysql2/promise'

function parseUrl(url: string) {
  const u = new URL(url)
  return {
    host: u.hostname,
    port: parseInt(u.port) || 3306,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.slice(1),
    waitForConnections: true,
    connectionLimit: 10,
    timezone: '+00:00',
  }
}

let _pool: mysql.Pool | undefined

export function getPool(): mysql.Pool {
  if (!_pool) {
    _pool = mysql.createPool(parseUrl(process.env.DATABASE_URL!))
  }
  return _pool
}

// Lazy proxy — pool is created on first property access, not at import time.
// This lets vitest import the module without DATABASE_URL being set.
export const pool = new Proxy({} as mysql.Pool, {
  get(_target, prop) {
    const p = getPool()
    const val = (p as any)[prop]
    return typeof val === 'function' ? val.bind(p) : val
  },
})

export interface UserRow extends RowDataPacket {
  id: number; username: string; password: string; createdAt: Date
}
export interface EntryRow extends RowDataPacket {
  id: number; title: string; summary: string; mood: string
  tags: string; createdAt: Date; updatedAt: Date; userId: number | null
}
```

### 4. Rewrite routes to use mysql2

Update `server/routes/entries.ts` and `server/routes/auth.ts` to import from
`../lib/db.js` instead of `../lib/prisma.js`. Replace every `prisma.*` call
with parameterized `pool.execute()` queries. For example:

```ts
// Before (Prisma)
const entry = await prisma.entry.findUnique({ where: { id } })

// After (mysql2)
const [rows] = await pool.execute<EntryRow[]>(
  'SELECT * FROM Entry WHERE id = ?', [id]
)
const entry = rows[0]
```

### 5. Update `server/app.ts` and `server/index.ts`

- Import `pool` from `./lib/db.js` instead of `prisma` from `./lib/prisma.js`
- Health check: `pool.query('SELECT 1')` instead of `prisma.$queryRaw`
- Shutdown: `pool.end()` instead of `prisma.$disconnect()`
- Express 5 SPA wildcard: `'{*splat}'` instead of `'*'`

### 6. Create the daemon startup script — `run.sh`

Create `run.sh` in your project root. This will be placed at
`/home/protected/run.sh` on NFSN (not `/home/public/`):

```sh
#!/bin/sh
export NODE_ENV=production
export PORT=8080
export CORS_ORIGIN=https://your-site.nfshost.com
export DATABASE_URL="mysql://user:password@your-dsn.db:3306/your_database"
export JWT_SECRET="your-production-secret"

cd /home/public
exec /usr/local/bin/node dist-server/index.js
```

> **Critical lessons learned:**
> - Use `#!/bin/sh` — FreeBSD may not have `/bin/bash` (it's at `/usr/local/bin/bash`)
> - **Hardcode env vars directly in run.sh** — the daemon process cannot reliably
>   access `/home/private/.env` due to user permission restrictions
> - `PORT=8080` — NFSN daemons cannot bind port 80. Use a proxy instead.
> - `cd /home/public` — the daemon starts in `/`, so relative paths won't work
> - **Create this file on the server via SSH** (`cat > file << 'EOF'`) to avoid
>   Windows `\r\n` line endings that break shell scripts on FreeBSD

### 7. Build locally

```bash
npm run build           # Vite builds frontend → dist/
npm run build:server    # TypeScript compiles server → dist-server/
```

Note: **no `npx prisma generate` needed** — we no longer use the Prisma runtime.

### 8. Upload to NFSN

Upload these directories to `/home/public/` via **WinSCP** (or any SFTP client):

| Local | Remote | What |
|---|---|---|
| `dist-server/` | `/home/public/dist-server/` | Compiled Express server |
| `dist/` | `/home/public/dist/` | Built React frontend |
| `package.json` | `/home/public/package.json` | Dependency manifest |
| `package-lock.json` | `/home/public/package-lock.json` | Locked versions |

> Do **not** upload `node_modules/` — install on the server instead.

### 9. Install dependencies on NFSN

SSH into your site and install production-only dependencies:

```bash
ssh jvc_icstarslog@ssh.nyc1.nearlyfreespeech.net
cd /home/public
npm install --omit=dev
```

No `prisma generate` needed — mysql2 is a pure JS driver with no native binary.

### 10. Create `run.sh` on the server

**Do not upload run.sh from Windows** — it will have `\r\n` line endings that
break on FreeBSD. Create it directly on the server via SSH:

```bash
cat > /home/protected/run.sh << 'EOF'
#!/bin/sh
export NODE_ENV=production
export PORT=8080
export CORS_ORIGIN=https://icstarslog.nfshost.com
export DATABASE_URL="mysql://icstars_log_admin:YOUR_ENCODED_PASSWORD@icstarslog.db:3306/icstarslog"
export JWT_SECRET="your-production-secret"

cd /home/public
exec /usr/local/bin/node dist-server/index.js
EOF
chmod 755 /home/protected/run.sh
```

### 11. Set up the proxy

In the NFSN site panel, add a **Proxy**:

| Field | Value |
|---|---|
| Protocol | `http` |
| Base URI | `/` |
| Document Root | `/` |
| Port | `8080` |

This tells Apache to forward all HTTP requests to your Node daemon on port 8080.

### 12. Enable the daemon

In the NFSN site panel under **Daemons**, click **Add a Daemon**:

| Field | Value |
|---|---|
| Tag | `node` |
| Command | `/home/protected/run.sh` |
| Run Daemon As | `me` (your site user, **not** `web`) |

> **Critical**: the "Run Daemon As" dropdown must be set to your site user.
> The `web` user cannot read files owned by your account and the daemon will
> fail with "Cannot find module" errors.

### 13. Verify

Test the live API:

```bash
curl https://icstarslog.nfshost.com/api/health
# { "status": "ok", ... }

curl https://icstarslog.nfshost.com/api/health/ready
# { "status": "ready", ... }
```

If the daemon fails, check the log:

```bash
ssh jvc_icstarslog@ssh.nyc1.nearlyfreespeech.net
cat /home/logs/daemon_node.log
```

## File Tree

```
26-deploy-backend-nfsn/
├── .env.example              <- local dev env template
├── .env.nfsn.example         <- NFSN production env template
├── .env.production.example   <- frontend build env template
├── run.sh                    <- NFSN daemon startup script (reference copy)
├── deploy-nfsn.sh            <- automated deploy script
├── prisma/
│   └── schema.prisma         <- schema kept for documentation
├── server/
│   ├── index.ts              <- UPDATED: pool.end(), '{*splat}' wildcard
│   ├── app.ts                <- UPDATED: pool.query('SELECT 1')
│   ├── lib/
│   │   └── db.ts             <- NEW: mysql2 connection pool (replaces prisma.ts)
│   ├── middleware/auth.ts
│   └── routes/
│       ├── entries.ts        <- REWRITTEN: parameterized SQL via mysql2
│       └── auth.ts           <- REWRITTEN: parameterized SQL via mysql2
└── src/
    └── api/
        ├── entries.ts
        └── auth.ts
```

## Hints

<details>
<summary>How do I check if Node is installed on NFSN?</summary>

SSH in and run:

```bash
node -v
npm -v
which node
```

If Node is not installed, you may need to enable it through the NFSN member
panel under **Site Information** > **Server Type** or install it via their
package manager.
</details>

<details>
<summary>How do I see daemon logs?</summary>

NFSN writes daemon output to `/home/logs/daemon_TAG.log`. Check with:

```bash
ssh jvc_icstarslog@ssh.nyc1.nearlyfreespeech.net
cat /home/logs/daemon_node.log
```

You can also check the **Daemon** section in the NFSN site panel for status.
</details>

<details>
<summary>What if the daemon keeps crashing?</summary>

Common causes and fixes:
- **Missing env vars / CORS_ORIGIN** — hardcode env vars directly in `run.sh` rather than
  sourcing `/home/private/.env` (the daemon user may not have access to that directory)
- **MODULE_NOT_FOUND** — add `cd /home/public` before the `exec node` line in `run.sh`
  (the daemon starts in `/`)
- **Wrong daemon user** — change "Run Daemon As" from `web` to `me` in the NFSN panel.
  The `web` user can't read files owned by your account.
- **Windows line endings** — if you uploaded `run.sh` from Windows, recreate it on the
  server using `cat > /home/protected/run.sh << 'EOF'` so it has Unix line endings
- **Wrong shebang** — use `#!/bin/sh`, not `#!/bin/bash` (FreeBSD has bash at
  `/usr/local/bin/bash`, not `/bin/bash`)
- **Port conflict** — use port 8080 with a proxy, not port 80
- **Missing dependencies** — run `npm install --omit=dev` in `/home/public`
- **Stale failure count** — remove the daemon and re-add it to reset the counter
</details>
</details>

<details>
<summary>Why not source /home/private/.env?</summary>

In theory, `/home/private` should be accessible to your site user. In practice,
the NFSN daemon process may run with different privileges that prevent reading
files there. Hardcoding env vars in `/home/protected/run.sh` is simpler and
more reliable. The `/home/protected/` directory is not web-accessible, so
secrets stored there are safe from HTTP requests.
</details>

<details>
<summary>Can I use SFTP instead of rsync?</summary>

Yes. Use any SFTP client (FileZilla, WinSCP, `sftp` CLI) to upload the same
files. WinSCP works well on Windows and shows both local and remote file trees
side by side.
</details>

<details>
<summary>What about HTTPS?</summary>

NFSN provides free TLS certificates for `*.nfshost.com` subdomains. If you use
a custom domain, you can enable Let's Encrypt through the NFSN panel under
**Site Information** > **TLS**.
</details>

## Do / Don't

| Do | Don't |
|---|---|
| Store secrets in `run.sh` inside `/home/protected/` | Put secrets in `/home/public/` where the web can serve them |
| Create `run.sh` on the server via SSH (Unix line endings) | Upload `run.sh` from Windows (CRLF line endings break FreeBSD) |
| Use `#!/bin/sh` in your shebang | Use `#!/bin/bash` (not at `/bin/bash` on FreeBSD) |
| Set daemon "Run Daemon As" to `me` | Leave it as `web` (can't read your files) |
| Use port 8080 + proxy | Try to bind port 80 directly (not allowed for user daemons) |
| Use `mysql2` (pure JS, works everywhere) | Use Prisma runtime on FreeBSD (no engine binary exists) |
| Run `npm install --omit=dev` on the server | Install dev dependencies in production |
| Use the full path `/usr/local/bin/node` in `run.sh` | Assume `node` is on the default PATH |
| Test `/api/health` and `/api/health/ready` after deploy | Assume it works without checking |

## Check Your Work

- [ ] `mysql2` installed, Prisma runtime no longer imported in server code
- [ ] `run.sh` created **on the server** at `/home/protected/run.sh` with Unix line endings
- [ ] `run.sh` uses `#!/bin/sh`, `PORT=8080`, `cd /home/public`, hardcoded env vars
- [ ] `npm install --omit=dev` completed on the server in `/home/public`
- [ ] Proxy configured: `http / → port 8080`
- [ ] Daemon configured: command = `/home/protected/run.sh`, Run Daemon As = `me`
- [ ] `curl https://your-site.nfshost.com/api/health` returns `{ "status": "ok" }`
- [ ] `curl https://your-site.nfshost.com/api/health/ready` returns `{ "status": "ready" }`
- [ ] `.env` files with real secrets are **not** committed to Git

## Stretch

- Set up a custom domain for your NFSN site and enable HTTPS with Let's Encrypt.
- Create a GitHub Action that builds and deploys to NFSN automatically on push
  (you will need to add your SSH key as a repository secret).
- Add a `/api/health/version` endpoint that returns the current Git commit hash
  (embed it at build time via an environment variable).
- Write a simple monitoring script that pings `/api/health/ready` every 5 minutes
  and alerts you (via email or webhook) if the database goes down.

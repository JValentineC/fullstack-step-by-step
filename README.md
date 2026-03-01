# DevLog — Learn Full-Stack Web Development Step by Step

A hands-on tutorial that teaches interns how to build a **Dev Log** application from scratch using the **SERN stack** (SQL Server, Express, React, Node). Each step lives in its own folder with a working app and a beginner-friendly README.

## Who This Is For

- Software engineering interns starting their first web project
- Self-taught developers learning React and full-stack basics
- Anyone who prefers **small, incremental steps** over giant boilerplate tutorials

## Prerequisites

| Requirement | Minimum Version | Check |
|---|---|---|
| Node.js | 20+ | `node -v` |
| npm | (comes with Node) | `npm -v` |
| Git | any recent version | `git --version` |
| Code editor | VS Code recommended | — |

## How to Use This Repo

### Run any step

```bash
cd 04-basic-routing-one-link   # pick a step folder
npm install
npm run dev
```

Open the URL printed in the terminal (usually http://localhost:5173).

### Follow the progression

Each folder is a self-contained step. Work through them in order:

| # | Folder | What You'll Learn |
|---|---|---|
| 01 | `01-getting-started` | Scaffold a Vite + React + TypeScript app |
| 02 | `02-clean-home-and-about` | Strip template, write semantic HTML |
| 03 | `03-header-with-profile-photo` | Add static assets via `public/` |
| 04 | `04-basic-routing-one-link` | Client-side routing with HashRouter |
| 05 | `05-extract-simple-components` | Split into reusable components |
| 06 | `06-static-entries-list` | Hardcoded data list (no state yet) |
| 07 | `07-controlled-form-basics` | Controlled inputs: title, content |
| 08 | `08-form-validation-minimal` | Required fields + client-side validation |
| 09 | `09-state-lifting-and-props` | Lift state to parent, pass via props |
| 10 | `10-tags-and-mood-fields` | Extend data shape: tags, mood, createdAt |
| 11 | `11-express-api-scaffold` | Backend: Node + Express skeleton |
| 12 | `12-prisma-sqlserver-setup` | Prisma schema, migrations, seed script |
| 13 | `13-crud-endpoints` | REST API: POST/GET/PUT/DELETE with Zod |
| 14 | `14-frontend-fetch-list-create` | Frontend calls API: create + list |
| 15 | `15-edit-delete-flows` | Edit & delete from UI |
| 16 | `16-filtering-by-tags` | Query params and UI filters |
| 17 | `17-pagination-and-sorting` | Server-side pagination + UI controls |
| 18 | `18-auth-basics` | Users, password hashing, JWT/sessions |
| 19 | `19-deploy-backend` | Deploy API: env vars, CORS, health check |
| 20 | `20-deploy-frontend-gh-pages` | Vite build + GitHub Pages deploy |
| 21 | `21-testing-and-ci` | Vitest + RTL + GitHub Actions |
| 22 | `22-a11y-and-polish` | Accessibility, polish, retrospective |

### Compare steps

To see what changed between any two steps, diff the folders:

```bash
diff -r 03-header-with-profile-photo/src 04-basic-routing-one-link/src
```

Or in VS Code, right-click two files and choose **Compare Selected**.

## Every Step README Follows the Same Outline

- **Goal** — What you're building
- **What You'll Practice** — Skills introduced
- **Prerequisites** — What must be done first
- **Steps** — Numbered instructions with code
- **Helpful Hints** — Context and explanations
- **Do ✅ / Don't ❌** — Common pitfalls
- **Check Your Work** — Verification checklist
- **Stretch** — Optional challenges

## Teaching Philosophy

- **One concept at a time** — small wins build confidence
- **Semantic HTML first** — accessibility from the start
- **No frameworks early** — styling comes after structure and routing
- **Repeatable patterns** — same README format every step
- **Commit discipline** — one commit per step, message explains the "why"

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript, Vite 7 |
| Routing | React Router (HashRouter → BrowserRouter) |
| Backend | Node.js, Express |
| Database | SQL Server (MSSQL), Prisma ORM |
| Deployment | GitHub Pages (frontend), TBD (backend) |
| Testing | Vitest, React Testing Library |
| CI | GitHub Actions |

## License

This project is for educational purposes.

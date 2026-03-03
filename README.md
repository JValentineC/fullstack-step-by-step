# fullstack-step-by-step — Learn Full-Stack Web Development Step by Step

**Live site:** [https://icstarslog.nfshost.com/](https://icstarslog.nfshost.com/) | **GitHub Pages:** [https://jvalentinec.github.io/fullstack-step-by-step/](https://jvalentinec.github.io/fullstack-step-by-step/)

A hands-on tutorial that guides interns how to build a **Dev Log** application from scratch using the **SERN stack** (SQL Server, Express, React, Node). Each step lives in its own folder with a working app and a beginner-friendly README.

## Who This Is For

- i.c.Stars interns starting their first web project
- Self-taught developers learning React and full-stack basics
- Anyone who prefers **small, incremental steps** over giant boilerplate tutorials

## About the Author

My name is **Jonathan Ramirez**, a proud graduate of [i.c.Stars](https://www.icstars.org/) Cycle 53. i.c.Stars is a nonprofit organization that has been transforming lives through technology for over 25 years - training young adults from underserved communities and launching them into tech careers.

After commencing, I went on to work as a **Program Manager at United Airlines**. When my contract ended, I dove into self-learning and self-development - sharpening my skills in full-stack development, leadership, and mentoring. Today I hold a position at i.c.Stars as a **Tech Fellow**, where I help interns reach their potential and support the program team in any way I can.

This curriculum is a direct result of that journey. Every step in this repo was built with i.c.Stars interns in mind - people who are hungry to learn, willing to put in the work, and deserve clear, honest instruction.

If you'd like to learn more about i.c.Stars - or know someone whose life could be changed by joining - visit **[https://www.icstars.org/](https://www.icstars.org/)**.

## Prerequisites

| Requirement | Minimum Version     | Check           |
| ----------- | ------------------- | --------------- |
| Node.js     | 20+                 | `node -v`       |
| npm         | (comes with Node)   | `npm -v`        |
| Git         | any recent version  | `git --version` |
| Code editor | VS Code recommended | -               |

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

| #   | Folder                          | What You'll Learn                                             |
| --- | ------------------------------- | ------------------------------------------------------------- |
| 01  | `01-getting-started`            | Scaffold a Vite + React + TypeScript app                      |
| 02  | `02-clean-home-and-about`       | Strip template, write semantic HTML                           |
| 03  | `03-header-with-profile-photo`  | Add static assets via `public/`                               |
| 04  | `04-basic-routing-one-link`     | Client-side routing with HashRouter                           |
| 05  | `05-extract-simple-components`  | Split into reusable components                                |
| 06  | `06-static-entries-list`        | Hardcoded data list (no state yet)                            |
| 07  | `07-controlled-form-basics`     | Controlled inputs: title, content                             |
| 08  | `08-form-validation-minimal`    | Required fields + client-side validation                      |
| 09  | `09-state-lifting-and-props`    | Lift state to parent, pass via props                          |
| 10  | `10-tags-and-mood-fields`       | Extend data shape: tags, mood, createdAt                      |
| 11  | `11-express-api-scaffold`       | Backend: Node + Express skeleton                              |
| 12  | `12-prisma-sqlserver-setup`     | Prisma schema, migrations, seed script                        |
| 13  | `13-crud-endpoints`             | REST API: POST/GET/PUT/DELETE with Zod                        |
| 14  | `14-frontend-fetch-list-create` | Frontend calls API: create + list                             |
| 15  | `15-edit-delete-flows`          | Edit & delete from UI                                         |
| 16  | `16-filtering-by-tags`          | Query params and UI filters                                   |
| 17  | `17-pagination-and-sorting`     | Server-side pagination + UI controls                          |
| 18  | `18-auth-basics`                | Users, password hashing, JWT/sessions                         |
| 19  | `19-deploy-backend`             | Deploy API: env vars, CORS, health check                      |
| 20  | `20-deploy-frontend-gh-pages`   | Vite build + GitHub Pages deploy                              |
| 21  | `21-testing-and-ci`             | Vitest + RTL + GitHub Actions                                 |
| 22  | `22-a11y-and-polish`            | Accessibility, polish, retrospective                          |
| 23  | `23-tailwind-daisyui-setup`     | Install Tailwind CSS v4 + daisyUI; restyle layout shell       |
| 24  | `24-daisyui-components`         | Restyle all inner components with daisyUI classes             |
| 25  | `25-prisma-mysql-migration`     | Switch Prisma from SQL Server to MySQL / MariaDB              |
| 26  | `26-deploy-backend-nfsn`        | Deploy Express API to NearlyFreeSpeech.NET                    |
| 27  | `27-demo-mode-setup`            | Offline demo mode: dummy data, localStorage, auto-detect flag |
| 28  | `28-demo-credentials-login`     | Show sample credentials on the login page in demo mode        |
| 29  | `29-accordion-entries-sort`     | Accordion entry cards + oldest-first default sort             |
| 30  | `30-responsive-navbar`          | Responsive navbar: desktop text links, mobile hamburger menu  |
| 31  | `31-show-entry-author`          | JOIN User on entry queries, display author name               |
| 32  | `32-add-email-to-user`          | Add email column to User table, update registration           |
| 33  | `33-social-schema-migrations`   | Add handle/bio/avatar to User, visibility to Entry, Friendship table |
| 34  | `34-user-profiles-backend`      | Profile CRUD endpoints, handle slug lookup                    |
| 35  | `35-user-profiles-frontend`     | `/u/:handle` profile route, profile card UI, edit profile     |
| 36  | `36-entry-visibility`           | Visibility selector in entry form, visibility icons on cards  |
| 37  | `37-friendships-backend`        | Friend request/respond/delete/list endpoints, pair normalize  |
| 38  | `38-users-directory`            | `/users` route, search by name/handle, friend action buttons  |
| 39  | `39-social-feed-privacy`        | Viewer-aware feed queries, access rules, privacy badges       |
| 40  | `40-profile-entries`            | Profile page entries list with per-viewer privacy filtering   |
| 41  | `41-email-verification-backend` | Verification codes, Nodemailer, confirm before active         |
| 42  | `42-email-verification-frontend`| Two-phase registration UI, code entry form                    |
| 43  | `43-add-user-roles`             | Add role column (user/admin), seed admin account              |
| 44  | `44-admin-middleware-stats-api`  | requireAdmin middleware, GET /api/admin/stats                  |
| 45  | `45-admin-dashboard-stats-ui`   | Admin dashboard page with stat cards and charts               |
| 46  | `46-user-management-api`        | Admin user list, role changes, disable/enable                 |
| 47  | `47-user-management-ui`         | Users table on admin dashboard                                |
| 48  | `48-activity-log-backend`       | ActivityLog table, auto-log actions, admin query              |
| 49  | `49-activity-log-ui`            | Activity feed panel on admin dashboard                        |
| 50  | `50-content-moderation-backend` | Admin CRUD on all entries, flag system                        |
| 51  | `51-content-moderation-ui`      | Moderation tab on admin dashboard                             |

### Compare steps

To see what changed between any two steps, diff the folders:

```bash
diff -r 03-header-with-profile-photo/src 04-basic-routing-one-link/src
```

Or in VS Code, right-click two files and choose **Compare Selected**.

## Every Step README Follows the Same Outline

- **Goal** - What you're building
- **What You'll Practice** - Skills introduced
- **Prerequisites** - What must be done first
- **Steps** - Numbered instructions with code
- **Helpful Hints** - Context and explanations
- **Do ✅ / Don't ❌** - Common pitfalls
- **Check Your Work** - Verification checklist
- **Stretch** - Optional challenges

## Teaching Philosophy

- **One concept at a time** - small wins build confidence
- **Semantic HTML first** - accessibility from the start
- **No frameworks early** - styling comes after structure and routing
- **Repeatable patterns** - same README format every step
- **Commit discipline** - one commit per step, message explains the "why"

## Tech Stack

| Layer      | Technology                                |
| ---------- | ----------------------------------------- |
| Frontend   | React 19 + TypeScript, Vite 7             |
| Styling    | Tailwind CSS 4, daisyUI 5                 |
| Routing    | React Router (HashRouter → BrowserRouter) |
| Backend    | Node.js, Express                          |
| Database   | SQL Server (MSSQL), Prisma ORM            |
| Deployment | GitHub Pages (frontend), TBD (backend)    |
| Testing    | Vitest, React Testing Library             |
| CI         | GitHub Actions                            |

## License

This project is for educational purposes. Have fun!

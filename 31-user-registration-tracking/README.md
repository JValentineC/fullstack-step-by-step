# Step 31 — User Registration Tracking

## Goal

Add a **Users** page that lets authenticated users see who has registered on the
platform — username, registration date, and how many entries each user has
created.

---

## What Changed

| Layer    | File                           | Change                                                              |
| -------- | ------------------------------ | ------------------------------------------------------------------- |
| Backend  | `server/routes/auth.ts`        | New `GET /api/auth/users` endpoint (auth required) with entry count |
| Frontend | `src/api/auth.ts`              | `fetchUsers()` helper + `RegisteredUser` type                       |
| Frontend | `src/data/demo-data.ts`        | `DemoData.fetchUsers()` for GitHub Pages demo mode                  |
| Frontend | `src/components/UsersPage.tsx` | New page component — table of registered users                      |
| Frontend | `src/components/Header.tsx`    | "Users" link in desktop + mobile nav (visible when logged in)       |
| Frontend | `src/App.tsx`                  | `/users` route wrapped in `RequireAuth`                             |

---

## Setup

```bash
cd jvc-dev-log
npm install
```

Copy your `.env` from Step 30 (no new env vars needed).

Run:

```bash
npm run dev
```

---

## How It Works

### Backend — `GET /api/auth/users`

Added a new route in `server/routes/auth.ts` (before `/me` so Express doesn't
treat `users` as a `:id` param). It:

- Requires a valid JWT (`requireAuth` middleware).
- Joins `User` with `Entry` using a `LEFT JOIN` + `GROUP BY` to count each user's entries.
- Returns an array of `{ id, username, createdAt, entryCount }`.

### Frontend API — `fetchUsers()`

In `src/api/auth.ts`:

- New `RegisteredUser` interface with `id`, `username`, `createdAt`, `entryCount`.
- `fetchUsers(token)` calls the backend or falls back to `DemoData.fetchUsers()`
  when `VITE_API_URL` is not set (GitHub Pages demo mode).

### Demo Data

`DemoData.fetchUsers()` in `src/data/demo-data.ts` reads the demo users JSON
and returns them with `entryCount: 0` (demo mode doesn't track user–entry
relationships).

### `UsersPage` Component

A table page at `/users`:

- Fetches the user list on mount using the auth token.
- Shows a DaisyUI `table-zebra` with ID, Username, Registered date, and entry
  count badge.
- Handles loading, error, and empty states.

### Navigation

- **Desktop nav**: "Users" text link appears after "New Entry" when logged in.
- **Mobile nav**: "Users" icon link (people icon) appears after "New Entry" when
  logged in.

### Routing

`/users` is wrapped in `<RequireAuth>` so only logged-in users can access it.

---

## ✅ Do

- Keep the users endpoint behind auth
- Use a `LEFT JOIN` so users with 0 entries still show
- Show a loading state while fetching
- Format dates for readability

## ❌ Don't

- Expose user data publicly (no auth = no user list)
- Use N+1 queries (one query per user to count entries)
- Leave the page blank during load
- Show raw ISO timestamps — format them nicely

---

## Check Your Work

1. Log in → "Users" link appears in the nav bar
2. `/users` page shows a table of all registered users
3. Each row shows ID, username, formatted registration date, and entry count
4. Visiting `/users` while logged out redirects to `/login`
5. Demo mode (GitHub Pages) shows the seed demo users
6. Test on production: `https://icstarslog.nfshost.com/` — log in and visit Users page

# Step 18 - Auth Basics

## Goal

Add user authentication so only registered users can create, edit, and delete entries. Anyone can still **read** entries without logging in.

## What You'll Practice

| Concept | Where |
|---|---|
| Password hashing with **bcrypt** | `server/routes/auth.ts` |
| JSON Web Tokens (JWT) | `server/routes/auth.ts`, `server/middleware/auth.ts` |
| Express middleware for auth | `server/middleware/auth.ts` |
| React Context for global state | `src/context/AuthContext.tsx` |
| `localStorage` for token persistence | `src/context/AuthContext.tsx` |
| Protected routes with `<Navigate>` | `src/App.tsx` (`RequireAuth` wrapper) |
| Sending auth headers with `fetch` | `src/api/entries.ts` |
| Login / Register form with toggle | `src/components/LoginPage.tsx` |

## New Files

```
18-auth-basics/
  prisma/schema.prisma          ← User model + userId on Entry
  server/middleware/auth.ts      ← requireAuth middleware (JWT verify)
  server/routes/auth.ts          ← POST /register, POST /login, GET /me
  src/api/auth.ts                ← register(), login(), fetchMe()
  src/context/AuthContext.tsx     ← AuthProvider + useAuth hook
  src/components/LoginPage.tsx    ← Login / Register toggle form
```

## Changed Files

| File | What Changed |
|---|---|
| `server/routes/entries.ts` | POST, PUT, DELETE now require auth; POST sets `userId` |
| `server/index.ts` | Mounts `/api/auth` router; requires `JWT_SECRET` on startup |
| `src/api/entries.ts` | Write operations send `Authorization: Bearer <token>` header |
| `src/App.tsx` | `/login` route added; `/entries/new` and `/entries/:id/edit` wrapped in `RequireAuth` |
| `src/main.tsx` | Wraps `<App>` with `<AuthProvider>` |
| `src/components/Header.tsx` | Shows username + Log Out when authenticated; hides New Entry when not |
| `src/components/EntryCard.tsx` | Edit/Delete buttons only render when `onDelete` is provided (i.e. user is logged in) |

## Setup

```bash
cd 18-auth-basics
npm install
```

Copy your `.env` from Step 17 and add a JWT secret:

```
JWT_SECRET="pick-a-long-random-string-here"
```

Push the schema (creates the `User` table):

```bash
npx prisma db push --accept-data-loss
```

Run:

```bash
npm run dev
```

## How It Works

### Backend

1. **User model** - `id`, `username` (unique), `password` (hashed), `createdAt`, plus a relation to entries.
2. **POST /api/auth/register** - Validates input, hashes the password with `bcrypt` (10 salt rounds), creates the user, and returns a JWT (24 h expiry).
3. **POST /api/auth/login** - Looks up the user, compares the password with `bcrypt.compare`, and returns a JWT.
4. **GET /api/auth/me** - Verifies the token from the `Authorization` header and returns the user info. Used by the frontend to restore sessions on page reload.
5. **`requireAuth` middleware** - Reads `Authorization: Bearer <token>`, verifies with `jwt.verify`, and attaches `req.user` (`userId`, `username`). Applied to POST/PUT/DELETE entry routes.

### Frontend

1. **`AuthContext`** - Stores `user`, `token`, `loading` in React state. Persists the token in `localStorage`. On mount, calls `/api/auth/me` to restore the session.
2. **`LoginPage`** - Toggles between Login and Register mode. On success, calls `setAuth(user, token)` and navigates to `/entries`.
3. **`RequireAuth`** - A wrapper component that redirects to `/login` if the user isn't authenticated.
4. **`entries.ts` API** - `createEntry`, `updateEntry`, `deleteEntry` now accept a `token` parameter and send it as `Authorization: Bearer <token>`.
5. **`Header`** - When logged in, shows the username and a Log Out button. When not logged in, shows a Log In link and hides "New Entry".
6. **`EntryCard`** - Edit/Delete only render when `onDelete` is provided (the entries list page only passes `onDelete` when a user is logged in).

## ✅ Do

- Use `bcrypt` for password hashing - **never** store plain-text passwords
- Keep JWT secrets in `.env`, never in source code
- Set a reasonable token expiry (we use 24 hours)
- Make read endpoints public so anyone can browse entries

## ❌ Don't

- Don't store passwords in plain text
- Don't put the JWT secret in client-side code
- Don't skip input validation on register/login
- Don't forget to add `JWT_SECRET` to your `.env` before running

## Check Your Work

1. Open `http://localhost:5173`
2. Click **Log In** in the header
3. Register a new account → you should be redirected to `/entries`
4. The header should show your username and a **Log Out** button
5. Create a new entry - it should save successfully
6. Edit and delete entries - both should work
7. Click **Log Out** → "New Entry" disappears from the nav, Edit/Delete buttons vanish from cards
8. Try navigating to `/#/entries/new` while logged out → you should be redirected to `/login`

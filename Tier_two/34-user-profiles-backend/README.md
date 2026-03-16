# Step 34 — User Profiles Backend

## Goal

Create the profile API endpoints: look up any user by handle and let authenticated users update their own profile.

## What You'll Practice

- Creating a new Express router and mounting it in the app
- Writing parameterized SQL queries with handle slug lookup
- Protecting write endpoints with `requireAuth` middleware
- Extending the demo layer with new API functions
- Keeping backend and frontend API shapes in sync

## Prerequisites

- Step 33 completed (User table has `handle`, `displayName`, `bio`, `avatarUrl`)
- Database migration from step 33 already applied

## Step-by-Step Instructions

### 1. Copy the previous step

```bash
cp -r 33-social-schema-migrations 34-user-profiles-backend
cd 34-user-profiles-backend
npm install
```

### 2. Create the users route file

```ts
// server/routes/users.ts

import { Router } from 'express'
import type { ResultSetHeader } from 'mysql2/promise'
import { pool, type UserRow } from '../lib/db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// GET /api/users/:handle — public profile lookup
router.get('/:handle', async (req, res) => {
  const handle = String(req.params.handle).toLowerCase()

  const [rows] = await pool.execute<UserRow[]>(
    'SELECT id, username, email, handle, displayName, bio, avatarUrl, createdAt FROM `User` WHERE handle = ?',
    [handle]
  )

  if (rows.length === 0) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  const u = rows[0]
  res.json({
    id: u.id,
    username: u.username,
    handle: u.handle,
    displayName: u.displayName,
    bio: u.bio,
    avatarUrl: u.avatarUrl,
    createdAt: u.createdAt,
  })
})

// PUT /api/users/me/profile — update own profile (auth required)
router.put('/me/profile', requireAuth, async (req, res) => {
  const userId = req.user!.userId
  const { displayName, bio, avatarUrl } = req.body

  // Validate lengths
  if (displayName !== undefined && displayName !== null
      && String(displayName).length > 200) {
    res.status(400).json({ error: 'displayName must be 200 characters or fewer' })
    return
  }
  if (bio !== undefined && bio !== null && String(bio).length > 2000) {
    res.status(400).json({ error: 'bio must be 2000 characters or fewer' })
    return
  }
  if (avatarUrl !== undefined && avatarUrl !== null
      && String(avatarUrl).length > 500) {
    res.status(400).json({ error: 'avatarUrl must be 500 characters or fewer' })
    return
  }

  await pool.execute<ResultSetHeader>(
    'UPDATE `User` SET displayName = ?, bio = ?, avatarUrl = ? WHERE id = ?',
    [
      displayName != null ? String(displayName) : null,
      bio != null ? String(bio) : null,
      avatarUrl != null ? String(avatarUrl) : null,
      userId,
    ]
  )

  // Return updated profile
  const [rows] = await pool.execute<UserRow[]>(
    'SELECT id, username, email, handle, displayName, bio, avatarUrl, createdAt FROM `User` WHERE id = ?',
    [userId]
  )

  const u = rows[0]
  res.json({
    id: u.id,
    username: u.username,
    email: u.email,
    handle: u.handle,
    displayName: u.displayName,
    bio: u.bio,
    avatarUrl: u.avatarUrl,
    createdAt: u.createdAt,
  })
})

export default router
```

### 3. Mount the router in app.ts

```ts
// server/app.ts — add the import and mount
import usersRouter from './routes/users.js'

// ... existing routes ...
app.use('/api/users', usersRouter)
```

### 4. Create the frontend API module

```ts
// src/api/users.ts

import { DemoData } from "../data/demo-data.ts";

const DEMO = !import.meta.env.VITE_API_URL;
const BASE = `${import.meta.env.VITE_API_URL ?? ""}/api/users`;

export interface UserProfile {
  id: number;
  username: string;
  handle: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export async function fetchProfile(handle: string): Promise<UserProfile> {
  if (DEMO) return DemoData.fetchProfile(handle);

  const res = await fetch(`${BASE}/${encodeURIComponent(handle)}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "User not found" }));
    throw new Error(body.error ?? `Fetch profile failed: ${res.status}`);
  }
  return res.json();
}

export async function updateProfile(
  token: string,
  data: { displayName?: string | null; bio?: string | null; avatarUrl?: string | null },
): Promise<UserProfile & { email: string }> {
  if (DEMO) return DemoData.updateProfile(data);

  const res = await fetch(`${BASE}/me/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Update failed" }));
    throw new Error(body.error ?? `Update profile failed: ${res.status}`);
  }
  return res.json();
}
```

### 5. Add demo layer functions

Add `fetchProfile` and `updateProfile` to the `DemoData` object in `src/data/demo-data.ts`:

```ts
// Inside DemoData object, before the utility section

async fetchProfile(handle: string) {
  const users = await loadUsers();
  const user = users.find((u) => u.handle === handle.toLowerCase());
  if (!user) throw new Error("User not found");
  return {
    id: user.id,
    username: user.username,
    handle: user.handle,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };
},

async updateProfile(data) {
  // reads AUTH_KEY from localStorage, finds user, updates fields,
  // persists to localStorage, returns updated profile
},
```

## Helpful Hints

- **Route order matters:** The `/:handle` param route would match `me` literally. Express tries routes in order, so `PUT /me/profile` is defined **before** `GET /:handle` — but since they use different HTTP methods, there's no conflict. If you add `GET /me` later, define it before `GET /:handle`.
- **Public GET, private PUT:** Anyone can look up a profile by handle, but only the authenticated user can edit their own.
- The GET endpoint intentionally **excludes `email`** from the response — email is private data. The PUT endpoint returns email since it's the user's own data.

## Do / Don't

| Do | Don't |
|---|---|
| Use parameterized queries for the handle lookup | Interpolate user input into SQL strings |
| Validate string lengths before writing to DB | Trust that the client will send valid lengths |
| Return the updated profile after PUT so the UI can refresh | Make the client re-fetch separately after every update |
| Exclude email from the public GET response | Expose email to anyone who knows a handle |

## Check Your Work

1. `npm run build` — zero TypeScript errors
2. Start the dev server and call `GET /api/users/jvc` — returns profile data without email
3. Call `PUT /api/users/me/profile` with a valid token — updates and returns profile with email
4. Call `GET /api/users/nonexistent` — returns 404
5. Demo mode: `DemoData.fetchProfile("jvc")` returns jvc's profile from dummy data

## Stretch

- Add a `GET /api/users/me` convenience endpoint that returns the full profile for the authenticated user (like `/me` in auth but with all profile fields)
- Add rate limiting to the PUT endpoint to prevent abuse

# Step 38 -- Users Directory

## Goal

Build a `/users` directory page with search-by-name/handle and inline friend action buttons so users can discover and connect with each other without leaving the page.

## What You'll Practice

- Adding a new `GET /api/users` backend endpoint with optional `?search=` query param
- SQL `LIKE` queries for partial-match searching across multiple columns
- Debounced search input with a custom `useDebounce` hook
- Fetching and combining two data sources in parallel (`Promise.all`)
- Rendering user cards in a responsive CSS grid
- Inline friend action buttons that map friendship status to UI state

## Prerequisites

- Step 37 completed (friendships backend with send/respond/delete/list endpoints)
- Your Prisma/MySQL `User` table has `handle`, `displayName`, `bio`, `avatarUrl` columns
- The friendship API (`/api/friendships`) is fully functional

## Step-by-Step Instructions

### 1. Copy the previous step

```bash
cp -r 37-friendships-backend 38-users-directory
cd 38-users-directory
```

### 2. Add a directory listing endpoint to the users router

Open `server/routes/users.ts`. Add a new `GET /` route **before** the existing `GET /:handle` route (order matters -- Express matches top-to-bottom, and `/:handle` would swallow `/` if it came first).

```ts
// server/routes/users.ts
import { Router } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool, type UserRow } from "../lib/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/users — directory listing with optional search (auth required)
router.get("/", requireAuth, async (req, res) => {
  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : "";

  let sql = `
    SELECT u.id, u.username, u.handle, u.displayName, u.bio, u.avatarUrl, u.createdAt,
           COUNT(e.id) AS entryCount
    FROM \`User\` u
    LEFT JOIN \`Entry\` e ON e.userId = u.id`;

  const params: string[] = [];

  if (search) {
    sql += `
    WHERE u.username LIKE ? OR u.handle LIKE ? OR u.displayName LIKE ?`;
    const like = `%${search}%`;
    params.push(like, like, like);
  }

  sql += `
    GROUP BY u.id
    ORDER BY u.username ASC`;

  const [rows] = await pool.execute<(UserRow & RowDataPacket)[]>(sql, params);

  res.json(
    rows.map((r: any) => ({
      id: r.id,
      username: r.username,
      handle: r.handle,
      displayName: r.displayName,
      bio: r.bio,
      avatarUrl: r.avatarUrl,
      createdAt: r.createdAt,
      entryCount: Number(r.entryCount),
    })),
  );
});

// ... existing /:handle and /me/profile routes remain below
```

Key points:

- Uses `LEFT JOIN Entry` to get each user's entry count
- `GROUP BY u.id` is required because of the aggregate `COUNT`
- Three `LIKE` clauses let you search by username, handle, or display name
- The endpoint requires auth (`requireAuth`) since this is a logged-in feature

### 3. Add the `DirectoryUser` type and `fetchUserDirectory` to the API layer

Open `src/api/users.ts` and add the new interface and fetch function:

```ts
// src/api/users.ts — add after the UserProfile interface

export interface DirectoryUser {
  id: number;
  username: string;
  handle: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
  entryCount: number;
}

export async function fetchUserDirectory(
  token: string,
  search?: string,
): Promise<DirectoryUser[]> {
  if (DEMO) return DemoData.fetchUserDirectory(search);

  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const res = await fetch(`${BASE}${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res
      .json()
      .catch(() => ({ error: "Failed to load users" }));
    throw new Error(body.error ?? `Fetch users failed: ${res.status}`);
  }
  return res.json();
}
```

### 4. Add `fetchUserDirectory` to demo-data (for GitHub Pages mode)

In `src/data/demo-data.ts`, add a new method to the `DemoData` object after `fetchUsers`:

```ts
// src/data/demo-data.ts — inside the DemoData object

async fetchUserDirectory(
  search?: string,
): Promise<{
  id: number; username: string; handle: string;
  displayName: string | null; bio: string | null;
  avatarUrl: string | null; createdAt: string; entryCount: number;
}[]> {
  const users = await loadUsers();
  const logs = await loadLogs();

  let filtered = users;
  if (search) {
    const q = search.toLowerCase();
    filtered = users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.handle.toLowerCase().includes(q) ||
        (u.displayName && u.displayName.toLowerCase().includes(q)),
    );
  }

  return filtered
    .map((u) => ({
      id: u.id,
      username: u.username,
      handle: u.handle,
      displayName: u.displayName,
      bio: u.bio,
      avatarUrl: u.avatarUrl,
      createdAt: u.createdAt,
      entryCount: logs.filter((e) => e.author === u.username).length,
    }))
    .sort((a, b) => a.username.localeCompare(b.username));
},
```

### 5. Rewrite `UsersPage.tsx` with search, cards, and friend buttons

Replace the entire contents of `src/components/UsersPage.tsx`:

```tsx
// src/components/UsersPage.tsx
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { fetchUserDirectory } from "../api/users";
import type { DirectoryUser } from "../api/users";
import {
  fetchFriendships,
  sendFriendRequest,
  deleteFriendship,
} from "../api/friendships";
import type { Friendship } from "../api/friendships";
import { useAuth } from "../context/AuthContext";
import Header from "./Header";
import Footer from "./Footer";

/** Debounce helper — returns value after delay ms of inactivity */
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/** Determine the friendship status between current user and another user */
function getFriendInfo(
  userId: number,
  myId: number,
  friendships: Friendship[],
): { status: string; friendshipId?: number } {
  const f = friendships.find(
    (fr) =>
      fr.userAId === Math.min(myId, userId) &&
      fr.userBId === Math.max(myId, userId),
  );
  if (!f) return { status: "NONE" };
  return { status: f.status, friendshipId: f.id };
}
```

The `useDebounce` hook waits 300 ms after the user stops typing before firing the search -- this prevents a request on every keystroke.

`getFriendInfo` uses the pair-normalization logic from Step 37 (smaller ID is always `userAId`) to look up friendship status from the flat list.

Now the main component:

```tsx
function UsersPage() {
  const { user, token } = useAuth();
  const [users, setUsers] = useState<DirectoryUser[]>([]);
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const loadData = useCallback(
    async (query?: string) => {
      if (!token) return;
      setLoading(true);
      setError("");
      try {
        const [userList, friendList] = await Promise.all([
          fetchUserDirectory(token, query),
          fetchFriendships(token),
        ]);
        setUsers(userList);
        setFriendships(friendList);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load users");
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    loadData(debouncedSearch || undefined);
  }, [debouncedSearch, loadData]);
```

`Promise.all` fetches users and friendships simultaneously -- two requests, one wait.

The friend action handlers:

```tsx
async function handleAddFriend(targetUserId: number) {
  if (!token) return;
  setActionLoading(targetUserId);
  try {
    await sendFriendRequest(token, targetUserId);
    await loadData(debouncedSearch || undefined);
  } catch (err: unknown) {
    setError(err instanceof Error ? err.message : "Failed to send request");
  } finally {
    setActionLoading(null);
  }
}

async function handleRemoveFriend(friendshipId: number) {
  if (!token) return;
  setActionLoading(friendshipId);
  try {
    await deleteFriendship(token, friendshipId);
    await loadData(debouncedSearch || undefined);
  } catch (err: unknown) {
    setError(err instanceof Error ? err.message : "Failed to remove");
  } finally {
    setActionLoading(null);
  }
}
```

And the JSX with the card grid, search input, and conditional friend buttons:

```tsx
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main id="main-content" tabIndex={-1}
            className="flex-1 container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">Users Directory</h2>

        {/* Search input */}
        <label className="form-control w-full max-w-md mb-6">
          <div className="label">
            <span className="label-text">Search by name or handle</span>
          </div>
          <input
            type="search"
            className="input input-bordered w-full"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search users by name or handle"
          />
        </label>

        {loading && <p aria-live="polite">Loading users...</p>}
        {error && (
          <div className="alert alert-error mb-4">
            <span role="alert">{error}</span>
          </div>
        )}
        {!loading && !error && users.length === 0 && (
          <p>{search ? "No users match your search." : "No registered users yet."}</p>
        )}

        {!loading && users.length > 0 && (
          <>
            <p className="mb-4 text-sm opacity-70">
              {users.length} user{users.length !== 1 ? "s" : ""} found
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {users.map((u) => {
                const isMe = user?.id === u.id;
                const info = user
                  ? getFriendInfo(u.id, user.id, friendships)
                  : { status: "NONE" };
                return (
                  <div key={u.id} className="card bg-base-200 shadow-md">
                    <div className="card-body items-center text-center">
                      {/* Avatar or initial */}
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl}
                             alt={`${u.displayName ?? u.username}'s avatar`}
                             className="w-16 h-16 rounded-full object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-neutral text-neutral-content
                                        flex items-center justify-center text-xl font-bold">
                          {(u.displayName ?? u.username).charAt(0).toUpperCase()}
                        </div>
                      )}

                      {/* Name links to profile */}
                      <Link to={`/u/${u.handle}`}
                            className="card-title text-lg link link-hover">
                        {u.displayName ?? u.username}
                      </Link>
                      <p className="text-sm opacity-60">@{u.handle}</p>

                      {u.bio && <p className="text-sm mt-1 line-clamp-2">{u.bio}</p>}

                      <div className="flex gap-3 mt-2 text-xs opacity-60">
                        <span>{u.entryCount} entries</span>
                        <span>Joined {new Date(u.createdAt)
                          .toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                      </div>

                      {/* Friend action buttons */}
                      {!isMe && user && (
                        <div className="card-actions mt-3">
                          {info.status === "NONE" && (
                            <button type="button" className="btn btn-primary btn-sm"
                                    disabled={actionLoading === u.id}
                                    onClick={() => handleAddFriend(u.id)}>
                              {actionLoading === u.id ? "Sending..." : "Add Friend"}
                            </button>
                          )}
                          {info.status === "PENDING" && (
                            <button type="button" className="btn btn-warning btn-sm btn-outline"
                                    disabled={actionLoading === info.friendshipId}
                                    onClick={() => handleRemoveFriend(info.friendshipId!)}>
                              {actionLoading === info.friendshipId ? "Canceling..." : "Pending -- Cancel"}
                            </button>
                          )}
                          {info.status === "ACCEPTED" && (
                            <button type="button" className="btn btn-success btn-sm btn-outline"
                                    disabled={actionLoading === info.friendshipId}
                                    onClick={() => handleRemoveFriend(info.friendshipId!)}>
                              {actionLoading === info.friendshipId ? "Removing..." : "Friends -- Unfriend"}
                            </button>
                          )}
                          {info.status === "DECLINED" && (
                            <button type="button" className="btn btn-primary btn-sm"
                                    disabled={actionLoading === u.id}
                                    onClick={() => handleAddFriend(u.id)}>
                              {actionLoading === u.id ? "Sending..." : "Send Request Again"}
                            </button>
                          )}
                        </div>
                      )}
                      {isMe && <span className="badge badge-ghost mt-3">You</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default UsersPage;
```

## Helpful Hints

- **Route order matters in Express.** `GET /` must come before `GET /:handle` because Express matches top-to-bottom. If `/:handle` were first it would try to match the empty segment.
- **SQL `LIKE` with `%` wildcards** matches partial strings anywhere in the column. The `?` placeholders prevent SQL injection -- never interpolate user input directly into SQL.
- **`useDebounce` prevents excessive requests.** Without it, every keystroke would send a fetch. The 300 ms delay waits until the user pauses before searching.
- **`Promise.all` runs fetches in parallel.** The directory needs both the user list AND the friendship list to render correctly. Running them simultaneously halves the wait time compared to sequential fetches.

## Do / Don't

| Do                                               | Don't                                              |
| ------------------------------------------------ | -------------------------------------------------- |
| Use parameterized queries (`?`) for search terms | Concatenate user input into SQL strings            |
| Debounce the search so you don't flood the API   | Fire a new fetch on every keystroke                |
| Show a "You" badge on your own card              | Show friend buttons for yourself                   |
| Disable buttons while an action is in progress   | Let users double-click and send duplicate requests |
| Use `aria-label` on the search input             | Rely on placeholder text as the only label         |

## Check Your Work

1. Log in and navigate to `/users` -- you should see all registered users as cards in a grid
2. Type a name or handle into the search box -- the grid filters after ~300 ms
3. Clear the search -- all users reappear
4. Click "Add Friend" on another user's card -- the button changes to "Pending -- Cancel"
5. Click "Pending -- Cancel" -- the button reverts to "Add Friend"
6. Click a user's name -- it navigates to their `/u/:handle` profile page
7. Your own card shows a "You" badge instead of friend buttons
8. Resize the window -- the grid adjusts from 3 columns to 2 to 1

## Stretch

- Add pagination to the directory if you have many users (e.g. 50+ cards)
- Show a "mutual friends" count on each card by cross-referencing the friendships list

# Step 37 -- Friendships Backend

## Goal
Build the complete friendships REST API with pair-normalized storage, request/respond/delete/list endpoints, and a matching demo-mode data layer.

## What You'll Practice
- Designing a self-referencing many-to-many relationship API
- Pair normalization (always storing the smaller user id as `userAId`)
- Express route CRUD with auth middleware
- Conflict detection (409 responses for duplicates)
- Frontend API + demo-data mirroring pattern

## Prerequisites
- Step 36 completed
- Friendship model already exists in Prisma schema and database

## Step-by-Step Instructions

### 1. Copy the previous step
Copy your working `jvc-dev-log/` folder (or continue from Step 36).

### 2. Create `server/routes/friendships.ts`

This is the main new file. It provides five endpoints -- all require authentication.

**Pair normalization helper** -- always store the lower userId as `userAId`:

```ts
// server/routes/friendships.ts
function pairNormalize(a: number, b: number): [number, number] {
  return a < b ? [a, b] : [b, a]
}
```

**POST /api/friendships/request** -- Send a friend request:

```ts
router.post('/request', requireAuth, async (req, res) => {
  const userId = req.user!.userId
  const targetId = Number(req.body.targetUserId)

  if (!Number.isFinite(targetId) || targetId <= 0) {
    res.status(400).json({ error: 'targetUserId is required and must be a positive integer' })
    return
  }

  if (targetId === userId) {
    res.status(400).json({ error: 'Cannot send a friend request to yourself' })
    return
  }

  // Verify target user exists
  const [targetRows] = await pool.execute<RowDataPacket[]>(
    'SELECT id FROM `User` WHERE id = ?', [targetId]
  )
  if (targetRows.length === 0) {
    res.status(404).json({ error: 'Target user not found' })
    return
  }

  const [userAId, userBId] = pairNormalize(userId, targetId)

  // Check for existing friendship row
  const [existing] = await pool.execute<FriendshipRow[]>(
    'SELECT * FROM `Friendship` WHERE userAId = ? AND userBId = ?',
    [userAId, userBId]
  )

  if (existing.length > 0) {
    const row = existing[0]
    if (row.status === 'ACCEPTED') {
      res.status(409).json({ error: 'Already friends' })
      return
    }
    if (row.status === 'PENDING') {
      res.status(409).json({ error: 'Friend request already pending' })
      return
    }
    // DECLINED -- allow re-request by resetting to PENDING
    await pool.execute<ResultSetHeader>(
      'UPDATE `Friendship` SET status = ?, updatedAt = NOW(3) WHERE id = ?',
      ['PENDING', row.id]
    )
    const [updated] = await pool.execute<FriendshipRow[]>(
      'SELECT * FROM `Friendship` WHERE id = ?', [row.id]
    )
    res.json(updated[0])
    return
  }

  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO `Friendship` (userAId, userBId, status, updatedAt) VALUES (?, ?, ?, NOW(3))',
    [userAId, userBId, 'PENDING']
  )

  const [rows] = await pool.execute<FriendshipRow[]>(
    'SELECT * FROM `Friendship` WHERE id = ?', [result.insertId]
  )
  res.status(201).json(rows[0])
})
```

**PUT /api/friendships/:id/respond** -- Accept or decline:

```ts
router.put('/:id/respond', requireAuth, async (req, res) => {
  const friendshipId = Number(req.params.id)
  const { status } = req.body  // 'ACCEPTED' or 'DECLINED'

  // Validate status is ACCEPTED or DECLINED
  // Verify friendship exists, is PENDING, and belongs to user
  // Update and return the updated row
})
```

**DELETE /api/friendships/:id** -- Remove/cancel:

```ts
router.delete('/:id', requireAuth, async (req, res) => {
  // Verify friendship exists and belongs to user
  // Delete and return 204
})
```

**GET /api/friendships** -- List with optional status filter:

```ts
router.get('/', requireAuth, async (req, res) => {
  // JOIN with User table to get usernames and handles
  // Optionally filter by ?status=PENDING|ACCEPTED|DECLINED
  // Return array sorted by updatedAt DESC
})
```

**GET /api/friendships/status/:userId** -- Check status with a specific user:

```ts
router.get('/status/:userId', requireAuth, async (req, res) => {
  // Pair-normalize and look up the row
  // Return { status: 'NONE' } if no row exists
})
```

### 3. Register the router in `server/app.ts`

```ts
// server/app.ts
import friendshipsRouter from './routes/friendships.js'

// Add after the other routes:
app.use('/api/friendships', friendshipsRouter)
```

### 4. Create `src/api/friendships.ts`

Mirror the backend endpoints in the frontend API layer with the DEMO fallback pattern:

```ts
// src/api/friendships.ts
import { DemoData } from "../data/demo-data.ts";

const DEMO = !import.meta.env.VITE_API_URL;
const BASE = `${import.meta.env.VITE_API_URL ?? ""}/api/friendships`;

export async function sendFriendRequest(token: string, targetUserId: number): Promise<Friendship> {
  if (DEMO) return DemoData.sendFriendRequest(targetUserId);
  // POST to /api/friendships/request
}

export async function respondToFriendRequest(token: string, friendshipId: number, status: "ACCEPTED" | "DECLINED"): Promise<Friendship> {
  if (DEMO) return DemoData.respondToFriendRequest(friendshipId, status);
  // PUT to /api/friendships/:id/respond
}

export async function deleteFriendship(token: string, friendshipId: number): Promise<void> {
  if (DEMO) return DemoData.deleteFriendship(friendshipId);
  // DELETE to /api/friendships/:id
}

export async function fetchFriendships(token: string, status?: string): Promise<Friendship[]> {
  if (DEMO) return DemoData.fetchFriendships(status);
  // GET /api/friendships?status=...
}

export async function fetchFriendshipStatus(token: string, userId: number): Promise<FriendshipStatus> {
  if (DEMO) return DemoData.fetchFriendshipStatus(userId);
  // GET /api/friendships/status/:userId
}
```

### 5. Update `src/data/demo-data.ts`

Add friendship demo functions using localStorage for persistence:

- `sendFriendRequest(targetUserId)` -- pair-normalize, check conflicts, persist
- `respondToFriendRequest(friendshipId, status)` -- validate PENDING, update
- `deleteFriendship(friendshipId)` -- ownership check, splice
- `fetchFriendships(status?)` -- filter by current user, enrich with usernames
- `fetchFriendshipStatus(otherUserId)` -- pair-normalize lookup

Also add `FRIENDS_KEY` constant and clear it in `reset()`.

## Helpful Hints
- Pair normalization prevents duplicate rows -- `(1,3)` and `(3,1)` both map to `userAId=1, userBId=3`
- The `@@unique([userAId, userBId])` constraint in Prisma enforces this at the database level
- Use 409 Conflict for "already friends" or "already pending" -- not 400
- The status check endpoint (`GET /status/:userId`) returns `{ status: 'NONE' }` when no row exists

## Do / Don't
| Do | Don't |
|---|---|
| Pair-normalize before every INSERT/SELECT | Store user ids in arbitrary order |
| Validate that target user exists before creating | Blindly insert friendships for non-existent users |
| Use 409 for duplicate conflicts | Use 400 for "already exists" scenarios |
| Allow re-request after DECLINED | Block users permanently after one decline |
| Return enriched data (usernames) on list | Return only raw ids with no context |

## Check Your Work
1. Start your dev server and log in
2. Use a REST client (or curl) to send a friend request: `POST /api/friendships/request` with `{ "targetUserId": 2 }`
3. Verify the response includes pair-normalized ids and status `PENDING`
4. Try sending a duplicate -- you should get 409
5. Respond to it: `PUT /api/friendships/:id/respond` with `{ "status": "ACCEPTED" }`
6. List friendships: `GET /api/friendships` -- should include usernames
7. Check status: `GET /api/friendships/status/2` -- should show `ACCEPTED`
8. Delete it: `DELETE /api/friendships/:id` -- should return 204
9. Verify the demo layer works on GitHub Pages too

## Stretch
- Add pagination to the friendships list endpoint
- Track which user in the pair initiated the request (add a `requesterId` column)

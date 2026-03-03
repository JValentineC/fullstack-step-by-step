# Test Plan -- Step 37: Friendships Backend

## New Concept: Testing Many-to-Many Relationship APIs

Friendship endpoints introduce **pair normalization** -- a pattern where
two user ids are always stored in a canonical order so that the pair
(1, 3) and (3, 1) map to the same row. This affects how you write tests:
you need to verify the normalization logic, not just the CRUD operations.

### Pair Normalization

```
User 5 sends request to User 2:
  -> stored as userAId = 2, userBId = 5  (lower id first)

User 2 sends request to User 5:
  -> looks up userAId = 2, userBId = 5   (same row!)
  -> returns 409 "Already pending"
```

### API Endpoints Overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/friendships/request | Yes | Send friend request |
| PUT | /api/friendships/:id/respond | Yes | Accept or decline |
| DELETE | /api/friendships/:id | Yes | Remove or cancel |
| GET | /api/friendships | Yes | List user's friendships |
| GET | /api/friendships/status/:userId | Yes | Check status with a user |

### Testing Conflict Detection (409)

```ts
// First request -> 201 Created
const first = await request(app)
  .post('/api/friendships/request')
  .set('Authorization', `Bearer ${token}`)
  .send({ targetUserId: 2 });
expect(first.status).toBe(201);

// Duplicate request -> 409 Conflict
const second = await request(app)
  .post('/api/friendships/request')
  .set('Authorization', `Bearer ${token}`)
  .send({ targetUserId: 2 });
expect(second.status).toBe(409);
expect(second.body.error).toMatch(/pending/i);
```

### Testing Authorization Boundaries

```ts
// User 3 tries to delete friendship between users 1 and 2 -> 403
const res = await request(app)
  .delete(`/api/friendships/${friendshipId}`)
  .set('Authorization', `Bearer ${user3Token}`);
expect(res.status).toBe(403);
```

### Testing State Machine Transitions

```
PENDING -> ACCEPTED  (via PUT /respond)
PENDING -> DECLINED  (via PUT /respond)
DECLINED -> PENDING  (via POST /request -- re-request)
ACCEPTED -> deleted  (via DELETE)
```

---

## Manual QA Checklist

| # | Action | Expected Result | Pass |
|---|--------|----------------|------|
| 1 | POST /request with valid targetUserId | 201, row created with PENDING | [ ] |
| 2 | POST /request with same targetUserId again | 409, "already pending" | [ ] |
| 3 | POST /request with own userId | 400, "cannot friend yourself" | [ ] |
| 4 | POST /request with non-existent userId | 404, "target not found" | [ ] |
| 5 | PUT /:id/respond with ACCEPTED | 200, status updated | [ ] |
| 6 | PUT /:id/respond on non-PENDING | 400, "only PENDING" | [ ] |
| 7 | PUT /:id/respond on someone else's | 403, "not yours" | [ ] |
| 8 | DELETE /:id as owner | 204 | [ ] |
| 9 | DELETE /:id as non-owner | 403 | [ ] |
| 10 | GET / returns enriched friendships | 200, array with usernames | [ ] |
| 11 | GET /?status=ACCEPTED | Only accepted friendships | [ ] |
| 12 | GET /status/:userId with friend | Returns friendship row | [ ] |
| 13 | GET /status/:userId with stranger | Returns { status: "NONE" } | [ ] |
| 14 | All endpoints without auth header | 401 | [ ] |

---

## What's Next

Step 38 will build the frontend UI for friendships -- a friends list page,
friend request buttons on profiles, and notification badges for pending
requests.

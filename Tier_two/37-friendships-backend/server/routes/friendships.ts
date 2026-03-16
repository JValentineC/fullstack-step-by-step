import { Router } from 'express'
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { pool, type FriendshipRow } from '../lib/db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const VALID_RESPONSES = ['ACCEPTED', 'DECLINED'] as const

// Pair-normalize: always store the smaller userId as userAId
function pairNormalize(a: number, b: number): [number, number] {
  return a < b ? [a, b] : [b, a]
}

// POST /api/friendships/request — send a friend request
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
    // DECLINED — allow re-request by resetting to PENDING
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

// PUT /api/friendships/:id/respond — accept or decline a friend request
router.put('/:id/respond', requireAuth, async (req, res) => {
  const userId = req.user!.userId
  const friendshipId = Number(req.params.id)
  const { status } = req.body

  if (!Number.isFinite(friendshipId)) {
    res.status(400).json({ error: 'Invalid friendship id' })
    return
  }

  if (!VALID_RESPONSES.includes(status)) {
    res.status(400).json({ error: 'status must be ACCEPTED or DECLINED' })
    return
  }

  const [rows] = await pool.execute<FriendshipRow[]>(
    'SELECT * FROM `Friendship` WHERE id = ?', [friendshipId]
  )
  if (rows.length === 0) {
    res.status(404).json({ error: 'Friendship not found' })
    return
  }

  const friendship = rows[0]

  if (friendship.status !== 'PENDING') {
    res.status(400).json({ error: 'Can only respond to PENDING requests' })
    return
  }

  // Only the other user in the pair can respond (not the requester)
  if (friendship.userAId !== userId && friendship.userBId !== userId) {
    res.status(403).json({ error: 'Not your friendship request' })
    return
  }

  await pool.execute<ResultSetHeader>(
    'UPDATE `Friendship` SET status = ?, updatedAt = NOW(3) WHERE id = ?',
    [status, friendshipId]
  )

  const [updated] = await pool.execute<FriendshipRow[]>(
    'SELECT * FROM `Friendship` WHERE id = ?', [friendshipId]
  )
  res.json(updated[0])
})

// DELETE /api/friendships/:id — remove friendship or cancel request
router.delete('/:id', requireAuth, async (req, res) => {
  const userId = req.user!.userId
  const friendshipId = Number(req.params.id)

  if (!Number.isFinite(friendshipId)) {
    res.status(400).json({ error: 'Invalid friendship id' })
    return
  }

  const [rows] = await pool.execute<FriendshipRow[]>(
    'SELECT * FROM `Friendship` WHERE id = ?', [friendshipId]
  )
  if (rows.length === 0) {
    res.status(404).json({ error: 'Friendship not found' })
    return
  }

  const friendship = rows[0]
  if (friendship.userAId !== userId && friendship.userBId !== userId) {
    res.status(403).json({ error: 'Not your friendship' })
    return
  }

  await pool.execute<ResultSetHeader>(
    'DELETE FROM `Friendship` WHERE id = ?', [friendshipId]
  )
  res.status(204).end()
})

// GET /api/friendships — list current user's friendships (optionally filtered by status)
router.get('/', requireAuth, async (req, res) => {
  const userId = req.user!.userId
  const statusFilter = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : null

  let sql = `
    SELECT f.*, 
           ua.username AS userAUsername, ua.handle AS userAHandle,
           ub.username AS userBUsername, ub.handle AS userBHandle
    FROM \`Friendship\` f
    JOIN \`User\` ua ON f.userAId = ua.id
    JOIN \`User\` ub ON f.userBId = ub.id
    WHERE (f.userAId = ? OR f.userBId = ?)`

  const params: (string | number)[] = [userId, userId]

  if (statusFilter) {
    sql += ' AND f.status = ?'
    params.push(statusFilter)
  }

  sql += ' ORDER BY f.updatedAt DESC'

  const [rows] = await pool.execute<(FriendshipRow & RowDataPacket)[]>(sql, params)
  res.json(rows)
})

// GET /api/friendships/status/:userId — check friendship status with a specific user
router.get('/status/:userId', requireAuth, async (req, res) => {
  const userId = req.user!.userId
  const otherId = Number(req.params.userId)

  if (!Number.isFinite(otherId) || otherId <= 0) {
    res.status(400).json({ error: 'userId must be a positive integer' })
    return
  }

  const [userAId, userBId] = pairNormalize(userId, otherId)

  const [rows] = await pool.execute<FriendshipRow[]>(
    'SELECT * FROM `Friendship` WHERE userAId = ? AND userBId = ?',
    [userAId, userBId]
  )

  if (rows.length === 0) {
    res.json({ status: 'NONE' })
    return
  }

  res.json(rows[0])
})

export default router

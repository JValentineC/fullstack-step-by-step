import { Router } from 'express'
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { pool, type EntryRow } from '../lib/db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// Allowed sort columns (whitelist to prevent injection)
const SORT_COLUMNS = ['createdAt', 'title', 'mood'] as const
type SortColumn = (typeof SORT_COLUMNS)[number]

function isSortColumn(value: string): value is SortColumn {
  return (SORT_COLUMNS as readonly string[]).includes(value)
}

// GET /api/entries — paginated, sortable, filterable by tag (public)
router.get('/', async (req, res) => {
  const tag = typeof req.query.tag === 'string' ? req.query.tag.trim() : ''

  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10))
  const skip = (page - 1) * limit

  const sortParam = typeof req.query.sort === 'string' ? req.query.sort : 'createdAt'
  const sort: SortColumn = isSortColumn(sortParam) ? sortParam : 'createdAt'
  const order = req.query.order === 'asc' ? 'asc' : 'desc'

  const params: (string | number)[] = []
  let whereClause = ''
  if (tag) {
    whereClause = ' WHERE e.tags LIKE ?'
    params.push(`%${tag}%`)
  }

  // sort and order are validated above (whitelist + literal check)
  const dataSql = `SELECT e.*, u.username AS author FROM Entry e LEFT JOIN User u ON e.userId = u.id${whereClause} ORDER BY e.\`${sort}\` ${order} LIMIT ? OFFSET ?`
  const countSql = `SELECT COUNT(*) AS total FROM Entry e${whereClause}`

  const [entries, countRows] = await Promise.all([
    pool.execute<EntryRow[]>(dataSql, [...params, limit, skip]),
    pool.execute<(RowDataPacket & { total: number })[]>(countSql, params.length ? params : undefined),
  ])

  const total = countRows[0][0].total

  res.json({
    data: entries[0],
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  })
})

// GET /api/entries/tags — unique tags (public)
router.get('/tags', async (_req, res) => {
  const [rows] = await pool.execute<(RowDataPacket & { tags: string })[]>(
    'SELECT tags FROM Entry'
  )

  const tagSet = new Set<string>()
  for (const row of rows) {
    if (row.tags) {
      for (const t of row.tags.split(',')) {
        const trimmed = t.trim().toLowerCase()
        if (trimmed) tagSet.add(trimmed)
      }
    }
  }

  res.json([...tagSet].sort())
})

// GET /api/entries/:id — single entry (public)
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'id must be a number' })
    return
  }

  const [rows] = await pool.execute<EntryRow[]>(
    'SELECT e.*, u.username AS author FROM Entry e LEFT JOIN User u ON e.userId = u.id WHERE e.id = ?', [id]
  )
  if (rows.length === 0) {
    res.status(404).json({ error: 'Entry not found' })
    return
  }
  res.json(rows[0])
})

// ── Write operations require authentication ──────────────────

// POST /api/entries — create (auth required)
router.post('/', requireAuth, async (req, res) => {
  const { title, summary, mood, tags } = req.body

  if (!title || !summary || !mood) {
    res.status(400).json({ error: 'title, summary, and mood are required' })
    return
  }

  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO Entry (title, summary, mood, tags, userId, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(3))',
    [String(title), String(summary), String(mood), String(tags ?? ''), req.user!.userId]
  )

  const [rows] = await pool.execute<EntryRow[]>(
    'SELECT e.*, u.username AS author FROM Entry e LEFT JOIN User u ON e.userId = u.id WHERE e.id = ?', [result.insertId]
  )
  res.status(201).json(rows[0])
})

// PUT /api/entries/:id — update (auth required)
router.put('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'id must be a number' })
    return
  }

  const { title, summary, mood, tags } = req.body

  if (!title || !summary || !mood) {
    res.status(400).json({ error: 'title, summary, and mood are required' })
    return
  }

  const [existing] = await pool.execute<EntryRow[]>(
    'SELECT id FROM Entry WHERE id = ?', [id]
  )
  if (existing.length === 0) {
    res.status(404).json({ error: 'Entry not found' })
    return
  }

  await pool.execute<ResultSetHeader>(
    'UPDATE Entry SET title = ?, summary = ?, mood = ?, tags = ?, updatedAt = NOW(3) WHERE id = ?',
    [String(title), String(summary), String(mood), String(tags ?? ''), id]
  )

  const [rows] = await pool.execute<EntryRow[]>(
    'SELECT e.*, u.username AS author FROM Entry e LEFT JOIN User u ON e.userId = u.id WHERE e.id = ?', [id]
  )
  res.json(rows[0])
})

// DELETE /api/entries/:id — delete (auth required)
router.delete('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'id must be a number' })
    return
  }

  const [existing] = await pool.execute<EntryRow[]>(
    'SELECT id FROM Entry WHERE id = ?', [id]
  )
  if (existing.length === 0) {
    res.status(404).json({ error: 'Entry not found' })
    return
  }

  await pool.execute<ResultSetHeader>('DELETE FROM Entry WHERE id = ?', [id])
  res.status(204).end()
})

export default router

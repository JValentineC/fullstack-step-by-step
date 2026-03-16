import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
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

  const where = tag ? { tags: { contains: tag } } : undefined

  const [entries, total] = await Promise.all([
    prisma.entry.findMany({
      where,
      orderBy: { [sort]: order },
      skip,
      take: limit,
    }),
    prisma.entry.count({ where }),
  ])

  res.json({
    data: entries,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  })
})

// GET /api/entries/tags — unique tags (public)
router.get('/tags', async (_req, res) => {
  const entries = await prisma.entry.findMany({
    select: { tags: true },
  })

  const tagSet = new Set<string>()
  for (const entry of entries) {
    if (entry.tags) {
      for (const t of entry.tags.split(',')) {
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

  const entry = await prisma.entry.findUnique({ where: { id } })
  if (!entry) {
    res.status(404).json({ error: 'Entry not found' })
    return
  }
  res.json(entry)
})

// ── Write operations require authentication ──────────────────

// POST /api/entries — create (auth required)
router.post('/', requireAuth, async (req, res) => {
  const { title, summary, mood, tags } = req.body

  if (!title || !summary || !mood) {
    res.status(400).json({ error: 'title, summary, and mood are required' })
    return
  }

  const entry = await prisma.entry.create({
    data: {
      title: String(title),
      summary: String(summary),
      mood: String(mood),
      tags: String(tags ?? ''),
      userId: req.user!.userId,
    },
  })
  res.status(201).json(entry)
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

  const existing = await prisma.entry.findUnique({ where: { id } })
  if (!existing) {
    res.status(404).json({ error: 'Entry not found' })
    return
  }

  const entry = await prisma.entry.update({
    where: { id },
    data: {
      title: String(title),
      summary: String(summary),
      mood: String(mood),
      tags: String(tags ?? ''),
    },
  })
  res.json(entry)
})

// DELETE /api/entries/:id — delete (auth required)
router.delete('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id)
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'id must be a number' })
    return
  }

  const existing = await prisma.entry.findUnique({ where: { id } })
  if (!existing) {
    res.status(404).json({ error: 'Entry not found' })
    return
  }

  await prisma.entry.delete({ where: { id } })
  res.status(204).end()
})

export default router

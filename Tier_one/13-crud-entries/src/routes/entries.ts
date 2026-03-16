import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

const router = Router()

// GET /api/entries — list all entries (newest first)
router.get('/', async (_req, res) => {
  const entries = await prisma.entry.findMany({
    orderBy: { createdAt: 'desc' },
  })
  res.json(entries)
})

// GET /api/entries/:id — get one entry
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

// POST /api/entries — create a new entry
router.post('/', async (req, res) => {
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
    },
  })
  res.status(201).json(entry)
})

// PUT /api/entries/:id — update an entry
router.put('/:id', async (req, res) => {
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

// DELETE /api/entries/:id — delete an entry
router.delete('/:id', async (req, res) => {
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

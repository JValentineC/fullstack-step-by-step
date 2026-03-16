import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import type { ResultSetHeader } from 'mysql2/promise'
import { pool, type UserRow } from '../lib/db.js'
import type { AuthPayload } from '../middleware/auth.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET ?? ''
const SALT_ROUNDS = 10

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    res.status(400).json({ error: 'username and password are required' })
    return
  }

  if (String(password).length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' })
    return
  }

  const [existing] = await pool.execute<UserRow[]>(
    'SELECT id FROM User WHERE username = ?', [String(username)]
  )
  if (existing.length > 0) {
    res.status(409).json({ error: 'Username already taken' })
    return
  }

  const hashed = await bcrypt.hash(String(password), SALT_ROUNDS)

  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO User (username, password) VALUES (?, ?)',
    [String(username), hashed]
  )

  const payload: AuthPayload = { userId: result.insertId, username: String(username) }
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })

  res.status(201).json({ token, user: { id: result.insertId, username: String(username) } })
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    res.status(400).json({ error: 'username and password are required' })
    return
  }

  const [rows] = await pool.execute<UserRow[]>(
    'SELECT id, username, password FROM User WHERE username = ?',
    [String(username)]
  )
  const user = rows[0]
  if (!user) {
    res.status(401).json({ error: 'Invalid username or password' })
    return
  }

  const valid = await bcrypt.compare(String(password), user.password)
  if (!valid) {
    res.status(401).json({ error: 'Invalid username or password' })
    return
  }

  const payload: AuthPayload = { userId: user.id, username: user.username }
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })

  res.json({ token, user: { id: user.id, username: user.username } })
})

// GET /api/auth/me — return current user from token
router.get('/me', async (req, res) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Not authenticated' })
    return
  }

  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as AuthPayload
    res.json({ id: payload.userId, username: payload.username })
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
})

export default router

import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { prisma } from './lib/prisma.js'
import authRouter from './routes/auth.js'
import entriesRouter from './routes/entries.js'

const app = express()
const IS_PROD = process.env.NODE_ENV === 'production'

// Disable request logging during tests
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(IS_PROD ? 'combined' : 'dev'))
}

app.use(cors({ origin: process.env.CORS_ORIGIN }))
app.use(express.json())

// --- Health checks -------------------------------------------
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/api/health/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ready', timestamp: new Date().toISOString() })
  } catch {
    res.status(503).json({ status: 'unavailable', timestamp: new Date().toISOString() })
  }
})

// --- API routes ----------------------------------------------
app.use('/api/auth', authRouter)
app.use('/api/entries', entriesRouter)

export default app

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { prisma } from './lib/prisma.js'
import entriesRouter from './routes/entries.js'

// --- Startup guard -------------------------------------------
const required = ['CORS_ORIGIN', 'DATABASE_URL'] as const
for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌  Missing required env var: ${key}`)
    console.error('   Copy .env.example to .env and fill in the values.')
    process.exit(1)
  }
}

// --- App -----------------------------------------------------
const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({ origin: process.env.CORS_ORIGIN }))
app.use(express.json())

// --- Routes --------------------------------------------------
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

app.use('/api/entries', entriesRouter)

// --- Listen --------------------------------------------------
app.listen(PORT, () => {
  console.log(`✅  Server running on http://localhost:${PORT}`)
  console.log(`   Health:  http://localhost:${PORT}/api/health`)
  console.log(`   Ready:   http://localhost:${PORT}/api/health/ready`)
  console.log(`   Entries: http://localhost:${PORT}/api/entries`)
})

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { prisma } from './lib/prisma.js'
import authRouter from './routes/auth.js'
import entriesRouter from './routes/entries.js'

// --- Startup guard -------------------------------------------
const required = ['CORS_ORIGIN', 'DATABASE_URL', 'JWT_SECRET'] as const
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
const IS_PROD = process.env.NODE_ENV === 'production'

// --- Logging (morgan) ----------------------------------------
// "dev" format in development shows coloured status codes;
// "combined" in production outputs Apache-style access logs.
app.use(morgan(IS_PROD ? 'combined' : 'dev'))

// --- CORS ----------------------------------------------------
// In production the origin comes from CORS_ORIGIN.
// In development Vite's proxy handles same-origin requests,
// but we still honour the env var for direct API calls.
app.use(cors({ origin: process.env.CORS_ORIGIN }))

app.use(express.json())

// --- API routes ----------------------------------------------
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

app.use('/api/auth', authRouter)
app.use('/api/entries', entriesRouter)

// --- Static files (production) --------------------------------
// After `npm run build` the Vite output lives in dist/.
// In production the Express server itself serves those files
// so you only need to deploy ONE process.
if (IS_PROD) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const clientDist = path.join(__dirname, '..', 'dist')

  app.use(express.static(clientDist))

  // SPA fallback — let React Router handle client-side routes
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

// --- Start ---------------------------------------------------
const server = app.listen(PORT, () => {
  console.log(`✅  Server running on http://localhost:${PORT}`)
  console.log(`   Mode:    ${IS_PROD ? 'production' : 'development'}`)
  console.log(`   Health:  http://localhost:${PORT}/api/health`)
  console.log(`   Auth:    http://localhost:${PORT}/api/auth`)
  console.log(`   Entries: http://localhost:${PORT}/api/entries`)
})

// --- Graceful shutdown ----------------------------------------
// When the host (Azure, Railway, Render, etc.) sends SIGTERM
// we close the HTTP server and disconnect Prisma cleanly.
function shutdown() {
  console.log('\n🛑  Shutting down gracefully…')
  server.close(async () => {
    await prisma.$disconnect()
    console.log('   Prisma disconnected. Bye!')
    process.exit(0)
  })
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

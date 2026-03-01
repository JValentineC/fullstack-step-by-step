import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { prisma } from './lib/prisma.js'
import app from './app.js'

// --- Startup guard -------------------------------------------
const required = ['CORS_ORIGIN', 'DATABASE_URL', 'JWT_SECRET'] as const
for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌  Missing required env var: ${key}`)
    console.error('   Copy .env.example to .env and fill in the values.')
    process.exit(1)
  }
}

// --- Static files (production) --------------------------------
const PORT = process.env.PORT || 4000
const IS_PROD = process.env.NODE_ENV === 'production'

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

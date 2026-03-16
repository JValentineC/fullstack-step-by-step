import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const required = ['CORS_ORIGIN'] as const
for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌  Missing required env var: ${key}`)
    console.error('   Copy .env.example to .env and fill in the values.')
    process.exit(1)
  }
}

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({ origin: process.env.CORS_ORIGIN }))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`✅  Server running on http://localhost:${PORT}`)
  console.log(`   Health check: http://localhost:${PORT}/api/health`)
})

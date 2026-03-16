import mysql from 'mysql2/promise'
import type { RowDataPacket } from 'mysql2/promise'

function parseUrl(url: string) {
  const u = new URL(url)
  return {
    host: u.hostname,
    port: parseInt(u.port) || 3306,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.slice(1),
    waitForConnections: true,
    connectionLimit: 10,
    timezone: '+00:00',
  }
}

// Lazy singleton — pool is created on first use so the module can be imported
// safely in environments where DATABASE_URL is not yet set (e.g. vitest).
let _pool: mysql.Pool | undefined

export function getPool(): mysql.Pool {
  if (!_pool) {
    _pool = mysql.createPool(parseUrl(process.env.DATABASE_URL!))
  }
  return _pool
}

export const pool = new Proxy({} as mysql.Pool, {
  get(_target, prop) {
    const p = getPool()
    const val = (p as any)[prop]
    return typeof val === 'function' ? val.bind(p) : val
  },
})

export interface UserRow extends RowDataPacket {
  id: number
  username: string
  password: string
  createdAt: Date
}

export interface EntryRow extends RowDataPacket {
  id: number
  title: string
  summary: string
  mood: string
  tags: string
  createdAt: Date
  updatedAt: Date
  userId: number | null
}

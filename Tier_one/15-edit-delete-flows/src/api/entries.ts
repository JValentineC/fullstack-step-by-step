import type { ApiEntry } from '../data/entries.ts'

const BASE = '/api'

export async function fetchEntries(): Promise<ApiEntry[]> {
  const res = await fetch(`${BASE}/entries`)
  if (!res.ok) throw new Error(`GET /api/entries failed: ${res.status}`)
  return res.json()
}

export async function createEntry(body: {
  title: string
  summary: string
  mood: string
  tags: string
}): Promise<ApiEntry> {
  const res = await fetch(`${BASE}/entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`POST /api/entries failed: ${res.status}`)
  return res.json()
}

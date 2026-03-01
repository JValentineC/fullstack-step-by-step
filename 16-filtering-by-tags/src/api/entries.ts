import type { ApiEntry } from '../data/entries.ts'

const BASE = '/api'

export async function fetchEntries(tag?: string): Promise<ApiEntry[]> {
  const url = tag ? `${BASE}/entries?tag=${encodeURIComponent(tag)}` : `${BASE}/entries`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`)
  return res.json()
}

export async function fetchTags(): Promise<string[]> {
  const res = await fetch(`${BASE}/entries/tags`)
  if (!res.ok) throw new Error(`GET /api/entries/tags failed: ${res.status}`)
  return res.json()
}

export async function fetchEntry(id: number): Promise<ApiEntry> {
  const res = await fetch(`${BASE}/entries/${id}`)
  if (!res.ok) throw new Error(`GET /api/entries/${id} failed: ${res.status}`)
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

export async function updateEntry(
  id: number,
  body: { title: string; summary: string; mood: string; tags: string },
): Promise<ApiEntry> {
  const res = await fetch(`${BASE}/entries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`PUT /api/entries/${id} failed: ${res.status}`)
  return res.json()
}

export async function deleteEntry(id: number): Promise<void> {
  const res = await fetch(`${BASE}/entries/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`DELETE /api/entries/${id} failed: ${res.status}`)
}

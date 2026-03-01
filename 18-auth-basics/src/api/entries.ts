import type { ApiEntry, PaginatedResponse } from '../data/entries.ts'

const BASE = '/api'

export interface FetchEntriesParams {
  tag?: string
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

function authHeaders(token: string | null): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

export async function fetchEntries(params: FetchEntriesParams = {}): Promise<PaginatedResponse> {
  const query = new URLSearchParams()
  if (params.tag) query.set('tag', params.tag)
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.sort) query.set('sort', params.sort)
  if (params.order) query.set('order', params.order)

  const qs = query.toString()
  const url = `${BASE}/entries${qs ? `?${qs}` : ''}`
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

export async function createEntry(
  body: { title: string; summary: string; mood: string; tags: string },
  token: string | null,
): Promise<ApiEntry> {
  const res = await fetch(`${BASE}/entries`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`POST /api/entries failed: ${res.status}`)
  return res.json()
}

export async function updateEntry(
  id: number,
  body: { title: string; summary: string; mood: string; tags: string },
  token: string | null,
): Promise<ApiEntry> {
  const res = await fetch(`${BASE}/entries/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`PUT /api/entries/${id} failed: ${res.status}`)
  return res.json()
}

export async function deleteEntry(id: number, token: string | null): Promise<void> {
  const res = await fetch(`${BASE}/entries/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  if (!res.ok) throw new Error(`DELETE /api/entries/${id} failed: ${res.status}`)
}

export type Mood = 'happy' | 'curious' | 'frustrated' | 'neutral'

export interface Entry {
  id: number
  title: string
  summary: string
  mood: Mood
  tags: string[]
  createdAt: string
  updatedAt: string
  author: string | null
}

/** Shape returned by the API (tags is a comma-separated string) */
export interface ApiEntry {
  id: number
  title: string
  summary: string
  mood: string
  tags: string
  createdAt: string
  updatedAt: string
  author: string | null
}

/** Paginated response from GET /api/entries */
export interface PaginatedResponse {
  data: ApiEntry[]
  page: number
  limit: number
  total: number
  totalPages: number
}

/** Convert an API entry (tags as string) to a UI entry (tags as array) */
export function toEntry(raw: ApiEntry): Entry {
  return {
    ...raw,
    mood: raw.mood as Mood,
    tags: raw.tags
      ? raw.tags.split(',').map((t) => t.trim()).filter((t) => t !== '')
      : [],
    author: raw.author ?? null,
  }
}

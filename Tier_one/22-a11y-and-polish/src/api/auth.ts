// In development Vite proxies /api → localhost:4000.
// In production (GH Pages) VITE_API_URL points to the deployed backend.
const BASE = `${import.meta.env.VITE_API_URL ?? ''}/api/auth`

export interface AuthUser {
  id: number
  username: string
}

export interface AuthResponse {
  token: string
  user: AuthUser
}

export async function register(username: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Registration failed' }))
    throw new Error(body.error ?? `Register failed: ${res.status}`)
  }
  return res.json()
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Login failed' }))
    throw new Error(body.error ?? `Login failed: ${res.status}`)
  }
  return res.json()
}

export async function fetchMe(token: string): Promise<AuthUser> {
  const res = await fetch(`${BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Not authenticated')
  return res.json()
}

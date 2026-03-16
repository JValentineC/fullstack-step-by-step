import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, useNavigate, useParams, useSearchParams, Navigate } from 'react-router-dom'
import Header from './components/Header'
import AboutSection from './components/AboutSection'
import Footer from './components/Footer'
import EntryCard from './components/EntryCard'
import EntryForm from './components/EntryForm'
import TagFilter from './components/TagFilter'
import SortControls from './components/SortControls'
import Pagination from './components/Pagination'
import Toast from './components/Toast'
import LoginPage from './components/LoginPage'
import SkipLink from './components/SkipLink'
import ScrollToTop from './components/ScrollToTop'
import NotFound from './components/NotFound'
import type { ToastMessage } from './components/Toast'
import { useAuth } from './context/AuthContext.tsx'
import {
  fetchEntries,
  fetchEntry,
  createEntry,
  updateEntry as apiUpdateEntry,
  deleteEntry as apiDeleteEntry,
} from './api/entries.ts'
import type { FetchEntriesParams } from './api/entries.ts'
import { toEntry } from './data/entries.ts'
import type { Entry, Mood } from './data/entries.ts'

// ── Shared page shells ────────────────────────────────────────

function Home() {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <section>
          <h2>Welcome</h2>
          <p>A developer journal powered by the SERN stack.</p>
        </section>
      </main>
      <Footer />
    </>
  )
}

function About() {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <AboutSection />
      </main>
      <Footer />
    </>
  )
}

// ── Require auth wrapper ──────────────────────────────────────

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <p aria-live="polite">Loading…</p>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

// ── Entries list page ─────────────────────────────────────────

function EntriesPage({
  entries,
  loading,
  page,
  totalPages,
  total,
  onDelete,
  onReload,
}: {
  entries: Entry[]
  loading: boolean
  page: number
  totalPages: number
  total: number
  onDelete: (id: number) => void
  onReload: (params: FetchEntriesParams) => void
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTag = searchParams.get('tag') ?? ''
  const sort = searchParams.get('sort') ?? 'createdAt'
  const order = (searchParams.get('order') ?? 'desc') as 'asc' | 'desc'
  const { user } = useAuth()

  function updateParams(updates: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        next.set(key, value)
      } else {
        next.delete(key)
      }
    }
    setSearchParams(next)

    onReload({
      tag: next.get('tag') || undefined,
      page: Number(next.get('page')) || 1,
      sort: next.get('sort') || 'createdAt',
      order: (next.get('order') || 'desc') as 'asc' | 'desc',
    })
  }

  function handleTagChange(tag: string) {
    updateParams({ tag: tag || undefined, page: undefined })
  }

  function handleTagClick(tag: string) {
    updateParams({ tag, page: undefined })
  }

  function handleSortChange(newSort: string) {
    updateParams({ sort: newSort, page: undefined })
  }

  function handleOrderChange(newOrder: 'asc' | 'desc') {
    updateParams({ order: newOrder, page: undefined })
  }

  function handlePageChange(newPage: number) {
    updateParams({ page: String(newPage) })
  }

  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <h2>
          {activeTag
            ? `Entries tagged "${activeTag}" (${total})`
            : `All Entries (${total})`}
        </h2>
        <TagFilter onTagChange={handleTagChange} />
        <SortControls
          sort={sort}
          order={order}
          onSortChange={handleSortChange}
          onOrderChange={handleOrderChange}
        />
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={handlePageChange}
        />
        {loading && <p aria-live="polite">Loading…</p>}
        {!loading && entries.length === 0 && <p>No entries yet. Be the first to write one!</p>}
        {entries.map((entry) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            onDelete={user ? onDelete : undefined}
            onTagClick={handleTagClick}
          />
        ))}
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={handlePageChange}
        />
      </main>
      <Footer />
    </>
  )
}

// ── New entry page ────────────────────────────────────────────

function NewEntryPage({
  onAddEntry,
}: {
  onAddEntry: (title: string, content: string, mood: Mood, tags: string[]) => void
}) {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <h2>New Entry</h2>
        <EntryForm onSubmit={onAddEntry} submitLabel="Save Entry" />
      </main>
      <Footer />
    </>
  )
}

// ── Edit entry page ───────────────────────────────────────────

function EditEntryPage({
  entries,
  onUpdateEntry,
}: {
  entries: Entry[]
  onUpdateEntry: (id: number, title: string, content: string, mood: Mood, tags: string[]) => void
}) {
  const { id } = useParams<{ id: string }>()
  const [entry, setEntry] = useState<Entry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const numericId = Number(id)
    const cached = entries.find((e) => e.id === numericId)
    if (cached) {
      setEntry(cached)
      setLoading(false)
      return
    }

    fetchEntry(numericId)
      .then((raw) => setEntry(toEntry(raw)))
      .catch(() => setError('Entry not found.'))
      .finally(() => setLoading(false))
  }, [id, entries])

  function handleSubmit(title: string, content: string, mood: Mood, tags: string[]) {
    onUpdateEntry(Number(id), title, content, mood, tags)
  }

  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <h2>Edit Entry</h2>
        {loading && <p aria-live="polite">Loading…</p>}
        {error && <p><strong>{error}</strong></p>}
        {entry && (
          <EntryForm
            initial={{
              title: entry.title,
              content: entry.summary,
              mood: entry.mood,
              tags: entry.tags.join(', '),
            }}
            onSubmit={handleSubmit}
            submitLabel="Update Entry"
          />
        )}
      </main>
      <Footer />
    </>
  )
}

// ── App (state + routing) ─────────────────────────────────────

let nextToastId = 0

function App() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const navigate = useNavigate()
  const { token } = useAuth()

  // ── Toast helpers ──────────────────────────────────────────

  const addToast = useCallback((text: string, type: 'success' | 'error') => {
    setToasts((prev) => [...prev, { id: ++nextToastId, text, type }])
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // ── Load entries ───────────────────────────────────────────

  const loadEntries = useCallback((params: FetchEntriesParams = {}) => {
    setLoading(true)
    fetchEntries(params)
      .then((res) => {
        setEntries(res.data.map(toEntry))
        setPage(res.page)
        setTotalPages(res.totalPages)
        setTotal(res.total)
      })
      .catch((err) => {
        console.error(err)
        addToast('Failed to load entries.', 'error')
      })
      .finally(() => setLoading(false))
  }, [addToast])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  // ── Create ────────────────────────────────────────────────

  async function handleAddEntry(title: string, content: string, mood: Mood, tags: string[]) {
    try {
      await createEntry({
        title,
        summary: content,
        mood,
        tags: tags.join(','),
      }, token)
      addToast('Entry created!', 'success')
      navigate('/entries')
      loadEntries()
    } catch {
      addToast('Failed to create entry.', 'error')
    }
  }

  // ── Update (optimistic) ───────────────────────────────────

  async function handleUpdateEntry(id: number, title: string, content: string, mood: Mood, tags: string[]) {
    const previous = entries

    setEntries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, title, summary: content, mood, tags } : e,
      ),
    )
    navigate('/entries')
    addToast('Entry updated!', 'success')

    try {
      const raw = await apiUpdateEntry(id, {
        title,
        summary: content,
        mood,
        tags: tags.join(','),
      }, token)
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? toEntry(raw) : e)),
      )
    } catch {
      setEntries(previous)
      addToast('Failed to update entry — rolled back.', 'error')
    }
  }

  // ── Delete (optimistic) ───────────────────────────────────

  async function handleDeleteEntry(id: number) {
    const previous = entries
    const prevTotal = total

    setEntries((prev) => prev.filter((e) => e.id !== id))
    setTotal((prev) => prev - 1)
    addToast('Entry deleted.', 'success')

    try {
      await apiDeleteEntry(id, token)
    } catch {
      setEntries(previous)
      setTotal(prevTotal)
      addToast('Failed to delete entry — rolled back.', 'error')
    }
  }

  // ── Render ────────────────────────────────────────────────

  return (
    <>
      <SkipLink />
      <ScrollToTop />
      <Toast toasts={toasts} onDismiss={dismissToast} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/entries"
          element={
            <EntriesPage
              entries={entries}
              loading={loading}
              page={page}
              totalPages={totalPages}
              total={total}
              onDelete={handleDeleteEntry}
              onReload={loadEntries}
            />
          }
        />
        <Route
          path="/entries/new"
          element={
            <RequireAuth>
              <NewEntryPage onAddEntry={handleAddEntry} />
            </RequireAuth>
          }
        />
        <Route
          path="/entries/:id/edit"
          element={
            <RequireAuth>
              <EditEntryPage entries={entries} onUpdateEntry={handleUpdateEntry} />
            </RequireAuth>
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App

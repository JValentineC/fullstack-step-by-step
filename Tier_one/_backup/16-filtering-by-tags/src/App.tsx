import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Header from './components/Header'
import AboutSection from './components/AboutSection'
import Footer from './components/Footer'
import EntryCard from './components/EntryCard'
import EntryForm from './components/EntryForm'
import TagFilter from './components/TagFilter'
import Toast from './components/Toast'
import type { ToastMessage } from './components/Toast'
import {
  fetchEntries,
  fetchEntry,
  createEntry,
  updateEntry as apiUpdateEntry,
  deleteEntry as apiDeleteEntry,
} from './api/entries.ts'
import { toEntry } from './data/entries.ts'
import type { Entry, Mood } from './data/entries.ts'

// ── Shared page shells ────────────────────────────────────────

function Home() {
  return (
    <>
      <Header />
      <main>
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
      <main>
        <AboutSection />
      </main>
      <Footer />
    </>
  )
}

// ── Entries list page ─────────────────────────────────────────

function EntriesPage({
  entries,
  loading,
  onDelete,
  onReload,
}: {
  entries: Entry[]
  loading: boolean
  onDelete: (id: number) => void
  onReload: (tag?: string) => void
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTag = searchParams.get('tag') ?? ''

  function handleTagClick(tag: string) {
    setSearchParams({ tag })
    onReload(tag)
  }

  return (
    <>
      <Header />
      <main>
        <h2>
          {activeTag
            ? `Entries tagged "${activeTag}" (${entries.length})`
            : `All Entries (${entries.length})`}
        </h2>
        <TagFilter onTagChange={(tag) => onReload(tag)} />
        {loading && <p>Loading…</p>}
        {!loading && entries.length === 0 && <p>No entries found.</p>}
        {entries.map((entry) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            onDelete={onDelete}
            onTagClick={handleTagClick}
          />
        ))}
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
      <main>
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
      <main>
        <h2>Edit Entry</h2>
        {loading && <p>Loading…</p>}
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
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const navigate = useNavigate()

  // ── Toast helpers ──────────────────────────────────────────

  const addToast = useCallback((text: string, type: 'success' | 'error') => {
    setToasts((prev) => [...prev, { id: ++nextToastId, text, type }])
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // ── Load entries ───────────────────────────────────────────

  const loadEntries = useCallback((tag?: string) => {
    setLoading(true)
    fetchEntries(tag)
      .then((raw) => setEntries(raw.map(toEntry)))
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
      const raw = await createEntry({
        title,
        summary: content,
        mood,
        tags: tags.join(','),
      })
      setEntries((prev) => [toEntry(raw), ...prev])
      addToast('Entry created!', 'success')
      navigate('/entries')
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
      })
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

    setEntries((prev) => prev.filter((e) => e.id !== id))
    addToast('Entry deleted.', 'success')

    try {
      await apiDeleteEntry(id)
    } catch {
      setEntries(previous)
      addToast('Failed to delete entry — rolled back.', 'error')
    }
  }

  // ── Render ────────────────────────────────────────────────

  return (
    <>
      <Toast toasts={toasts} onDismiss={dismissToast} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/entries"
          element={
            <EntriesPage
              entries={entries}
              loading={loading}
              onDelete={handleDeleteEntry}
              onReload={loadEntries}
            />
          }
        />
        <Route path="/entries/new" element={<NewEntryPage onAddEntry={handleAddEntry} />} />
        <Route
          path="/entries/:id/edit"
          element={<EditEntryPage entries={entries} onUpdateEntry={handleUpdateEntry} />}
        />
        <Route path="/about" element={<About />} />
      </Routes>
    </>
  )
}

export default App

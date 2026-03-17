import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Header from './components/Header'
import AboutSection from './components/AboutSection'
import Footer from './components/Footer'
import EntryCard from './components/EntryCard'
import NewEntryForm from './components/NewEntryForm'
import { fetchEntries, createEntry } from './api/entries.ts'
import { toEntry } from './data/entries.ts'
import type { Entry, Mood } from './data/entries.ts'

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

function EntriesPage({ entries, loading }: { entries: Entry[]; loading: boolean }) {
  return (
    <>
      <Header />
      <main>
        <h2>All Entries ({entries.length})</h2>
        {loading && <p>Loading…</p>}
        {!loading && entries.length === 0 && <p>No entries yet. Add one!</p>}
        {entries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </main>
      <Footer />
    </>
  )
}

function NewEntryPage({ onAddEntry }: { onAddEntry: (title: string, content: string, mood: Mood, tags: string[]) => void }) {
  return (
    <>
      <Header />
      <main>
        <h2>New Entry</h2>
        <NewEntryForm onAddEntry={onAddEntry} />
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

function App() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchEntries()
      .then((raw) => setEntries(raw.map(toEntry)))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  async function handleAddEntry(title: string, content: string, mood: Mood, tags: string[]) {
    const raw = await createEntry({
      title,
      summary: content,
      mood,
      tags: tags.join(','),
    })
    setEntries((prev) => [toEntry(raw), ...prev])
    navigate('/entries')
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/entries" element={<EntriesPage entries={entries} loading={loading} />} />
      <Route path="/entries/new" element={<NewEntryPage onAddEntry={handleAddEntry} />} />
      <Route path="/about" element={<About />} />
    </Routes>
  )
}

export default App

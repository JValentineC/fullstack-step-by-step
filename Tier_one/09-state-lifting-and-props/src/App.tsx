import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Header from './components/Header'
import AboutSection from './components/AboutSection'
import Footer from './components/Footer'
import EntryCard from './components/EntryCard'
import NewEntryForm from './components/NewEntryForm'
import seedEntries from './data/entries'
import type { Entry } from './data/entries'

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

function EntriesPage({ entries }: { entries: Entry[] }) {
  return (
    <>
      <Header />
      <main>
        <h2>All Entries ({entries.length})</h2>
        {entries.length === 0 && <p>No entries yet. Add one!</p>}
        {entries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </main>
      <Footer />
    </>
  )
}

function NewEntryPage({ onAddEntry }: { onAddEntry: (title: string, content: string) => void }) {
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
  const [entries, setEntries] = useState<Entry[]>(seedEntries)
  const navigate = useNavigate()

  function handleAddEntry(title: string, content: string) {
    const newEntry: Entry = {
      id: Date.now(),
      title,
      date: new Date().toISOString().slice(0, 10),
      summary: content,
    }
    setEntries((prev) => [newEntry, ...prev])
    navigate('/entries')
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/entries" element={<EntriesPage entries={entries} />} />
      <Route path="/entries/new" element={<NewEntryPage onAddEntry={handleAddEntry} />} />
      <Route path="/about" element={<About />} />
    </Routes>
  )
}

export default App

import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import AboutSection from './components/AboutSection'
import Footer from './components/Footer'
import EntryCard from './components/EntryCard'
import NewEntryForm from './components/NewEntryForm'
import entries from './data/entries'

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

function Entries() {
  return (
    <>
      <Header />
      <main>
        <h2>All Entries</h2>
        {entries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </main>
      <Footer />
    </>
  )
}

function NewEntry() {
  return (
    <>
      <Header />
      <main>
        <h2>New Entry</h2>
        <NewEntryForm />
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
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/entries" element={<Entries />} />
      <Route path="/entries/new" element={<NewEntry />} />
      <Route path="/about" element={<About />} />
    </Routes>
  )
}

export default App

import { Routes, Route, Link } from 'react-router-dom'

function Home() {
  return (
    <>
      <header>
        <img src="/profile.jpg" alt="Profile photo of Intern Name" width="96" height="96" />
        <h1>DevLog</h1>
        <nav>
          <Link to="/about">Go to About Page</Link>
        </nav>
      </header>

      <main>
        <section>
          <h2>Welcome</h2>
          <p>This is the Home page of my DevLog.</p>
        </section>
      </main>

      <footer>
        <p>&copy; {new Date().getFullYear()} DevLog</p>
      </footer>
    </>
  )
}

function About() {
  return (
    <>
      <header>
        <nav>
          <Link to="/">Back to Home</Link>
        </nav>
      </header>

      <main>
        <section>
          <h2>About</h2>
          <p>
            Hi! I'm a software engineering intern learning to build full-stack web apps.
            I'm currently working through the SERN stack: SQL Server, Express, React, and Node.
          </p>
        </section>
      </main>
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
    </Routes>
  )
}

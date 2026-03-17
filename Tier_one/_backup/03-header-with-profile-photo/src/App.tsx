function App() {
  return (
    <>
      <header>
        <img src="/profile.jpg" alt="Profile photo of Intern Name" width="96" height="96" />
        <h1>DevLog</h1>
        <p>A developer's learning journal</p>
      </header>

      <main>
        <section>
          <h2>Home</h2>
          <p>Welcome to my DevLog! This is where I document what I'm learning as a developer.</p>
        </section>

        <section>
          <h2>About Me</h2>
          <p>
            Hi! I'm a software engineering intern learning to build full-stack web apps.
            I'm currently working through the SERN stack: SQL Server, Express, React, and Node.
          </p>
          <p>
            This DevLog tracks my progress step by step — from scaffolding a Vite project
            all the way to deploying on GitHub Pages.
          </p>
        </section>
      </main>

      <footer>
        <p>&copy; 2026 DevLog</p>
      </footer>
    </>
  )
}

export default App

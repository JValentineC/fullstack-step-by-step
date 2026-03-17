import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header>
      <img src="/profile.jpg" alt="Profile photo of Intern Name" width="96" height="96" />
      <h1>DevLog</h1>
      <nav>
        <Link to="/about">Go to About Page</Link>
      </nav>
    </header>
  )
}

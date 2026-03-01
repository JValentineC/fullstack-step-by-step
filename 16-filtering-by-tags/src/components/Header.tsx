import { Link } from 'react-router-dom'

function Header() {
  return (
    <header>
      <img src="/profile.jpg" alt="Profile photo" width="96" height="96" />
      <h1>DevLog</h1>
      <nav>
        <Link to="/">Home</Link>{' '}
        <Link to="/entries">Entries</Link>{' '}
        <Link to="/entries/new">New Entry</Link>{' '}
        <Link to="/about">About</Link>
      </nav>
    </header>
  )
}

export default Header

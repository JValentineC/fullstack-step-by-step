import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Header() {
  const { user, logout } = useAuth()

  return (
    <header>
      <img src="/profile.jpg" alt="Profile photo" width="96" height="96" />
      <h1>DevLog</h1>
      <nav>
        <Link to="/">Home</Link>{' '}
        <Link to="/entries">Entries</Link>{' '}
        {user && <><Link to="/entries/new">New Entry</Link>{' '}</>}
        <Link to="/about">About</Link>{' '}
        {user ? (
          <>
            <em>{user.username}</em>{' '}
            <button type="button" onClick={logout}>Log Out</button>
          </>
        ) : (
          <Link to="/login">Log In</Link>
        )}
      </nav>
    </header>
  )
}

export default Header

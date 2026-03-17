import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Header() {
  const { user, logout } = useAuth()

  return (
    <header>
      <img src={`${import.meta.env.BASE_URL}profile.jpg`} alt="Profile photo" width="96" height="96" />
      <h1>DevLog</h1>
      <nav aria-label="Main navigation">
        <NavLink to="/">Home</NavLink>{' '}
        <NavLink to="/entries">Entries</NavLink>{' '}
        {user && <><NavLink to="/entries/new">New Entry</NavLink>{' '}</>}
        <NavLink to="/about">About</NavLink>{' '}
        {user ? (
          <>
            <em>{user.username}</em>{' '}
            <button type="button" onClick={logout}>Log Out</button>
          </>
        ) : (
          <NavLink to="/login">Log In</NavLink>
        )}
      </nav>
    </header>
  )
}

export default Header

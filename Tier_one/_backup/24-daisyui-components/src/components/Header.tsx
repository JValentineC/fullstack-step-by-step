import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="navbar bg-base-200 shadow-sm px-4">
      <div className="flex-1 gap-3">
        <img
          src={`${import.meta.env.BASE_URL}profile.jpg`}
          alt="Profile photo"
          width="40"
          height="40"
          className="rounded-full"
        />
        <NavLink to="/" className="text-xl font-bold">DevLog</NavLink>
      </div>
      <nav aria-label="Main navigation" className="flex-none">
        <ul className="menu menu-horizontal px-1 gap-1">
          <li><NavLink to="/">Home</NavLink></li>
          <li><NavLink to="/entries">Entries</NavLink></li>
          {user && <li><NavLink to="/entries/new">New Entry</NavLink></li>}
          <li><NavLink to="/about">About</NavLink></li>
          {user ? (
            <>
              <li className="flex items-center"><em>{user.username}</em></li>
              <li>
                <button type="button" onClick={logout} className="btn btn-ghost btn-sm">
                  Log Out
                </button>
              </li>
            </>
          ) : (
            <li><NavLink to="/login">Log In</NavLink></li>
          )}
        </ul>
      </nav>
    </header>
  )
}

export default Header

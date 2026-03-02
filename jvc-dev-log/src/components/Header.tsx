import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Header() {
  const { user, logout } = useAuth();

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
        <NavLink to="/" className="text-xl font-bold">
          DevLog
        </NavLink>
      </div>
      <nav aria-label="Main navigation" className="flex-none">
        {/* ── Desktop: horizontal text links ── */}
        <ul className="menu menu-horizontal px-1 gap-1 hidden md:flex">
          <li>
            <NavLink to="/">Home</NavLink>
          </li>
          <li>
            <NavLink to="/entries">Entries</NavLink>
          </li>
          {user && (
            <li>
              <NavLink to="/entries/new">New Entry</NavLink>
            </li>
          )}
          <li>
            <NavLink to="/about">About</NavLink>
          </li>
          {user ? (
            <>
              <li className="flex items-center">
                <em>{user.username}</em>
              </li>
              <li>
                <button
                  type="button"
                  onClick={logout}
                  className="btn btn-ghost btn-sm"
                >
                  Log Out
                </button>
              </li>
            </>
          ) : (
            <li>
              <NavLink to="/login">Log In</NavLink>
            </li>
          )}
        </ul>

        {/* ── Mobile: hamburger dropdown with icon links ── */}
        <div className="dropdown dropdown-end md:hidden">
          <button
            tabIndex={0}
            className="btn btn-square btn-ghost"
            aria-label="Open menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block h-5 w-5 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-10 w-52 p-2 shadow-lg"
          >
            <li>
              <NavLink to="/">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/entries">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Entries
              </NavLink>
            </li>
            {user && (
              <li>
                <NavLink to="/entries/new">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  New Entry
                </NavLink>
              </li>
            )}
            <li>
              <NavLink to="/about">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                About
              </NavLink>
            </li>
            {user ? (
              <>
                <li className="menu-title">
                  <em>{user.username}</em>
                </li>
                <li>
                  <button type="button" onClick={logout}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Log Out
                  </button>
                </li>
              </>
            ) : (
              <li>
                <NavLink to="/login">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Log In
                </NavLink>
              </li>
            )}
          </ul>
        </div>
      </nav>
    </header>
  );
}

export default Header;

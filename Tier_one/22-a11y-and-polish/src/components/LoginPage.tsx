import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login, register } from '../api/auth'
import Header from './Header'
import Footer from './Footer'

function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { setAuth } = useAuth()
  const navigate = useNavigate()
  const errorRef = useRef<HTMLParagraphElement>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const result = mode === 'login'
        ? await login(username, password)
        : await register(username, password)

      setAuth(result.token, result.user)
      navigate('/entries')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
      // Focus the error message so screen readers announce it
      requestAnimationFrame(() => errorRef.current?.focus())
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <h2>{mode === 'login' ? 'Log In' : 'Register'}</h2>

        <form onSubmit={handleSubmit}>
          <p>
            <label htmlFor="auth-username">Username</label>
            <br />
            <input
              id="auth-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </p>

          <p>
            <label htmlFor="auth-password">Password</label>
            <br />
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={8}
              required
            />
          </p>

          {error && (
            <p ref={errorRef} tabIndex={-1}>
              <strong role="alert">{error}</strong>
            </p>
          )}

          <p>
            <button type="submit" disabled={submitting}>
              {submitting ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Register'}
            </button>
          </p>
        </form>

        <p>
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <button type="button" onClick={() => { setMode('register'); setError('') }}>
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" onClick={() => { setMode('login'); setError('') }}>
                Log In
              </button>
            </>
          )}
        </p>
      </main>
      <Footer />
    </>
  )
}

export default LoginPage

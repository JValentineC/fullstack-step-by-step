import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NotFound from '../NotFound'

// Mock AuthContext so Header doesn't break
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: null, token: null, loading: false, setAuth: vi.fn(), logout: vi.fn() }),
}))

describe('NotFound', () => {
  it('renders a 404 heading and a link home', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'Page Not Found' })).toBeInTheDocument()
    expect(screen.getByText('Go back home')).toHaveAttribute('href', '/')
  })

  it('has a focusable main landmark', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    )
    const main = screen.getByRole('main')
    expect(main).toHaveAttribute('id', 'main-content')
    expect(main).toHaveAttribute('tabindex', '-1')
  })
})

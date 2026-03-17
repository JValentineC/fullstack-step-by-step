import { render, screen } from '@testing-library/react'
import Footer from '../Footer'

describe('Footer', () => {
  it('renders the copyright with current year', () => {
    render(<Footer />)
    expect(screen.getByText(/© \d{4} DevLog/)).toBeInTheDocument()
  })
})

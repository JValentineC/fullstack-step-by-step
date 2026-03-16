import { render, screen } from '@testing-library/react'
import AboutSection from '../AboutSection'

describe('AboutSection', () => {
  it('renders the about heading', () => {
    render(<AboutSection />)
    expect(screen.getByRole('heading', { name: 'About' })).toBeInTheDocument()
  })

  it('mentions the SERN stack', () => {
    render(<AboutSection />)
    expect(screen.getByText(/SERN stack/)).toBeInTheDocument()
  })
})

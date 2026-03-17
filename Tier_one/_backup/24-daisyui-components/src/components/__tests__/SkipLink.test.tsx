import { render, screen } from '@testing-library/react'
import SkipLink from '../SkipLink'

describe('SkipLink', () => {
  it('renders a link targeting #main-content', () => {
    render(<SkipLink />)
    const link = screen.getByText('Skip to main content')
    expect(link).toHaveAttribute('href', '#main-content')
    expect(link).toHaveClass('skip-link')
  })
})

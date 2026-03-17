import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import EntryCard from '../EntryCard'
import type { Entry } from '../../data/entries'

const entry: Entry = {
  id: 1,
  title: 'Test Entry',
  summary: 'This is a test entry.',
  mood: 'happy',
  tags: ['react', 'testing'],
  createdAt: '2026-01-15T12:00:00Z',
  updatedAt: '2026-01-15T12:00:00Z',
}

function renderCard(props: { onDelete?: (id: number) => void; onTagClick?: (tag: string) => void } = {}) {
  return render(
    <MemoryRouter>
      <EntryCard entry={entry} {...props} />
    </MemoryRouter>,
  )
}

describe('EntryCard', () => {
  it('renders title and summary', () => {
    renderCard()
    expect(screen.getByText('Test Entry')).toBeInTheDocument()
    expect(screen.getByText('This is a test entry.')).toBeInTheDocument()
  })

  it('renders tags', () => {
    renderCard()
    expect(screen.getByText('#react')).toBeInTheDocument()
    expect(screen.getByText('#testing')).toBeInTheDocument()
  })

  it('renders mood', () => {
    renderCard()
    expect(screen.getByText(/happy/)).toBeInTheDocument()
  })

  it('calls onDelete when delete is confirmed', async () => {
    const onDelete = vi.fn()
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    renderCard({ onDelete })

    await userEvent.click(screen.getByText('Delete'))
    expect(onDelete).toHaveBeenCalledWith(1)
  })

  it('does not show delete/edit when onDelete is not provided', () => {
    renderCard()
    expect(screen.queryByText('Delete')).not.toBeInTheDocument()
    expect(screen.queryByText('Edit')).not.toBeInTheDocument()
  })
})

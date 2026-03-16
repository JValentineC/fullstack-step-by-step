import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EntryForm from '../EntryForm'

describe('EntryForm', () => {
  it('shows validation errors when submitted empty', async () => {
    const onSubmit = vi.fn()
    render(<EntryForm onSubmit={onSubmit} />)

    await userEvent.click(screen.getByText('Save Entry'))

    expect(screen.getByText('Title is required.')).toBeInTheDocument()
    expect(screen.getByText('Content is required.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()

    // Focus should move to the first invalid field
    expect(screen.getByLabelText('Title')).toHaveFocus()
  })

  it('calls onSubmit with form data when valid', async () => {
    const onSubmit = vi.fn()
    render(<EntryForm onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText('Title'), 'My Entry')
    await userEvent.type(screen.getByLabelText('Content'), 'Some content')
    await userEvent.selectOptions(screen.getByLabelText('Mood'), 'happy')
    await userEvent.type(screen.getByLabelText(/Tags/), 'react, testing')
    await userEvent.click(screen.getByText('Save Entry'))

    expect(onSubmit).toHaveBeenCalledWith(
      'My Entry',
      'Some content',
      'happy',
      ['react', 'testing'],
    )
  })

  it('pre-fills values in edit mode', () => {
    render(
      <EntryForm
        initial={{ title: 'Existing', content: 'Body text', mood: 'curious', tags: 'css' }}
        onSubmit={vi.fn()}
        submitLabel="Update Entry"
      />,
    )

    expect(screen.getByLabelText('Title')).toHaveValue('Existing')
    expect(screen.getByLabelText('Content')).toHaveValue('Body text')
    expect(screen.getByLabelText('Mood')).toHaveValue('curious')
    expect(screen.getByLabelText(/Tags/)).toHaveValue('css')
    expect(screen.getByText('Update Entry')).toBeInTheDocument()
  })
})

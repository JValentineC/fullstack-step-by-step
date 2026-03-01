import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Mood } from '../data/entries'

const MOODS: Mood[] = ['happy', 'curious', 'frustrated', 'neutral']

interface NewEntryFormProps {
  onAddEntry: (title: string, content: string, mood: Mood, tags: string[]) => void
}

function NewEntryForm({ onAddEntry }: NewEntryFormProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<Mood>('neutral')
  const [tagsInput, setTagsInput] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const titleError = title.trim() === '' ? 'Title is required.' : ''
  const contentError = content.trim() === '' ? 'Content is required.' : ''
  const isValid = titleError === '' && contentError === ''

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)

    if (!isValid) return

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t !== '')

    onAddEntry(title.trim(), content.trim(), mood, tags)
    setTitle('')
    setContent('')
    setMood('neutral')
    setTagsInput('')
    setSubmitted(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <p>
        <label htmlFor="entry-title">Title</label>
        <br />
        <input
          id="entry-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={submitted && titleError !== '' ? true : undefined}
          aria-describedby={submitted && titleError ? 'title-error' : undefined}
        />
        {submitted && titleError && (
          <br />
        )}
        {submitted && titleError && (
          <strong id="title-error" role="alert">{titleError}</strong>
        )}
      </p>

      <p>
        <label htmlFor="entry-content">Content</label>
        <br />
        <textarea
          id="entry-content"
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          aria-invalid={submitted && contentError !== '' ? true : undefined}
          aria-describedby={submitted && contentError ? 'content-error' : undefined}
        />
        {submitted && contentError && (
          <br />
        )}
        {submitted && contentError && (
          <strong id="content-error" role="alert">{contentError}</strong>
        )}
      </p>

      <p>
        <label htmlFor="entry-mood">Mood</label>
        <br />
        <select
          id="entry-mood"
          value={mood}
          onChange={(e) => setMood(e.target.value as Mood)}
        >
          {MOODS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </p>

      <p>
        <label htmlFor="entry-tags">Tags (comma-separated)</label>
        <br />
        <input
          id="entry-tags"
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="e.g. react, routing, css"
        />
      </p>

      <p>
        <button type="submit" disabled={submitted && !isValid}>
          Save Entry
        </button>
      </p>
    </form>
  )
}

export default NewEntryForm

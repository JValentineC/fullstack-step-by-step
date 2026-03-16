import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { Mood } from '../data/entries'

const MOODS: Mood[] = ['happy', 'curious', 'frustrated', 'neutral']

interface EntryFormProps {
  /** When provided, the form is in "edit" mode with pre-filled values */
  initial?: { title: string; content: string; mood: Mood; tags: string }
  onSubmit: (title: string, content: string, mood: Mood, tags: string[]) => void
  submitLabel?: string
}

function EntryForm({ initial, onSubmit, submitLabel = 'Save Entry' }: EntryFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [mood, setMood] = useState<Mood>(initial?.mood ?? 'neutral')
  const [tagsInput, setTagsInput] = useState(initial?.tags ?? '')
  const [submitted, setSubmitted] = useState(false)

  const titleRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  const titleError = title.trim() === '' ? 'Title is required.' : ''
  const contentError = content.trim() === '' ? 'Content is required.' : ''
  const isValid = titleError === '' && contentError === ''

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)

    if (!isValid) {
      // Focus the first invalid field so screen readers announce the error
      if (titleError) {
        titleRef.current?.focus()
      } else if (contentError) {
        contentRef.current?.focus()
      }
      return
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t !== '')

    onSubmit(title.trim(), content.trim(), mood, tags)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 max-w-lg">
      <div className="form-control">
        <label htmlFor="entry-title" className="label">
          <span className="label-text">Title</span>
        </label>
        <input
          ref={titleRef}
          id="entry-title"
          type="text"
          className={`input input-bordered w-full${submitted && titleError ? ' input-error' : ''}`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={submitted && titleError !== '' ? true : undefined}
          aria-describedby={submitted && titleError ? 'title-error' : undefined}
        />
        {submitted && titleError && (
          <label className="label">
            <span id="title-error" role="alert" className="label-text-alt text-error">{titleError}</span>
          </label>
        )}
      </div>

      <div className="form-control">
        <label htmlFor="entry-content" className="label">
          <span className="label-text">Content</span>
        </label>
        <textarea
          ref={contentRef}
          id="entry-content"
          className={`textarea textarea-bordered w-full${submitted && contentError ? ' textarea-error' : ''}`}
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          aria-invalid={submitted && contentError !== '' ? true : undefined}
          aria-describedby={submitted && contentError ? 'content-error' : undefined}
        />
        {submitted && contentError && (
          <label className="label">
            <span id="content-error" role="alert" className="label-text-alt text-error">{contentError}</span>
          </label>
        )}
      </div>

      <div className="form-control">
        <label htmlFor="entry-mood" className="label">
          <span className="label-text">Mood</span>
        </label>
        <select
          id="entry-mood"
          className="select select-bordered w-full"
          value={mood}
          onChange={(e) => setMood(e.target.value as Mood)}
        >
          {MOODS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="form-control">
        <label htmlFor="entry-tags" className="label">
          <span className="label-text">Tags (comma-separated)</span>
        </label>
        <input
          id="entry-tags"
          type="text"
          className="input input-bordered w-full"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="e.g. react, routing, css"
        />
      </div>

      <div className="form-control mt-6">
        <button type="submit" className="btn btn-primary" disabled={submitted && !isValid}>
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

export default EntryForm

import { Link } from 'react-router-dom'
import type { Entry } from '../data/entries'

interface EntryCardProps {
  entry: Entry
  onDelete: (id: number) => void
}

function EntryCard({ entry, onDelete }: EntryCardProps) {
  function handleDelete() {
    if (window.confirm(`Delete "${entry.title}"?`)) {
      onDelete(entry.id)
    }
  }

  return (
    <article>
      <h3>{entry.title}</h3>
      <p>
        <time dateTime={entry.createdAt}>
          {new Date(entry.createdAt).toLocaleDateString()}
        </time>
        {' · '}
        {entry.mood}
      </p>
      <p>{entry.summary}</p>
      {entry.tags.length > 0 && (
        <p>
          {entry.tags.map((tag) => (
            <small key={tag}>{' '}#{tag}</small>
          ))}
        </p>
      )}
      <p>
        <Link to={`/entries/${entry.id}/edit`}>Edit</Link>
        {' '}
        <button type="button" onClick={handleDelete}>Delete</button>
      </p>
    </article>
  )
}

export default EntryCard

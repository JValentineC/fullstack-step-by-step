import { Link } from 'react-router-dom'
import type { Entry } from '../data/entries'

interface EntryCardProps {
  entry: Entry
  onDelete?: (id: number) => void
  onTagClick?: (tag: string) => void
}

function EntryCard({ entry, onDelete, onTagClick }: EntryCardProps) {
  function handleDelete() {
    if (window.confirm(`Delete "${entry.title}"?`)) {
      onDelete?.(entry.id)
    }
  }

  return (
    <article className="card bg-base-100 shadow-md">
      <div className="card-body">
        <h3 className="card-title">{entry.title}</h3>
        <p className="text-sm opacity-70">
          <time dateTime={entry.createdAt}>
            {new Date(entry.createdAt).toLocaleDateString()}
          </time>
          {entry.author && <>{' · '}<span>by {entry.author}</span></>}
          {' · '}
          <span className="badge badge-outline badge-sm">{entry.mood}</span>
        </p>
        <p>{entry.summary}</p>
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {entry.tags.map((tag) => (
              onTagClick ? (
                <button
                  key={tag}
                  type="button"
                  className="badge badge-primary badge-sm cursor-pointer"
                  onClick={() => onTagClick(tag)}
                >
                  #{tag}
                </button>
              ) : (
                <span key={tag} className="badge badge-sm">#{tag}</span>
              )
            ))}
          </div>
        )}
        {onDelete && (
          <div className="card-actions justify-end mt-2">
            <Link to={`/entries/${entry.id}/edit`} className="btn btn-sm btn-ghost">Edit</Link>
            <button type="button" className="btn btn-sm btn-error" onClick={handleDelete}>Delete</button>
          </div>
        )}
      </div>
    </article>
  )
}

export default EntryCard

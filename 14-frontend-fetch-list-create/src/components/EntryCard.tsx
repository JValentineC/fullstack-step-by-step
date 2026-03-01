import type { Entry } from '../data/entries'

function EntryCard({ entry }: { entry: Entry }) {
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
    </article>
  )
}

export default EntryCard

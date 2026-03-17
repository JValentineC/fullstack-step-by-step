import type { Entry } from '../data/entries'

function EntryCard({ entry }: { entry: Entry }) {
  return (
    <article>
      <h3>{entry.title}</h3>
      <time dateTime={entry.date}>{entry.date}</time>
      <p>{entry.summary}</p>
    </article>
  )
}

export default EntryCard

interface SortControlsProps {
  sort: string
  order: 'asc' | 'desc'
  onSortChange: (sort: string) => void
  onOrderChange: (order: 'asc' | 'desc') => void
}

function SortControls({ sort, order, onSortChange, onOrderChange }: SortControlsProps) {
  return (
    <p>
      <label htmlFor="sort-field">Sort by:{' '}</label>
      <select
        id="sort-field"
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
      >
        <option value="createdAt">Date</option>
        <option value="title">Title</option>
        <option value="mood">Mood</option>
      </select>
      {' '}
      <label htmlFor="sort-order">Order:{' '}</label>
      <select
        id="sort-order"
        value={order}
        onChange={(e) => onOrderChange(e.target.value as 'asc' | 'desc')}
      >
        <option value="desc">Newest first</option>
        <option value="asc">Oldest first</option>
      </select>
    </p>
  )
}

export default SortControls

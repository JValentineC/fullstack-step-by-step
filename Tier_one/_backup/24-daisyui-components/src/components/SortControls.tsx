interface SortControlsProps {
  sort: string
  order: 'asc' | 'desc'
  onSortChange: (sort: string) => void
  onOrderChange: (order: 'asc' | 'desc') => void
}

function SortControls({ sort, order, onSortChange, onOrderChange }: SortControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <label htmlFor="sort-field" className="text-sm font-medium">Sort by:</label>
      <select
        id="sort-field"
        className="select select-bordered select-sm"
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
      >
        <option value="createdAt">Date</option>
        <option value="title">Title</option>
        <option value="mood">Mood</option>
      </select>
      <label htmlFor="sort-order" className="text-sm font-medium">Order:</label>
      <select
        id="sort-order"
        className="select select-bordered select-sm"
        value={order}
        onChange={(e) => onOrderChange(e.target.value as 'asc' | 'desc')}
      >
        <option value="desc">Newest first</option>
        <option value="asc">Oldest first</option>
      </select>
    </div>
  )
}

export default SortControls

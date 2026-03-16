interface PaginationProps {
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
}

function Pagination({ page, totalPages, total, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Pagination" className="my-4">
      <div className="flex items-center gap-2">
        <div className="join">
          <button
            type="button"
            className="join-item btn btn-sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            « Previous
          </button>
          <button className="join-item btn btn-sm btn-disabled">
            Page {page} of {totalPages}
          </button>
          <button
            type="button"
            className="join-item btn btn-sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next »
          </button>
        </div>
        <span className="text-sm opacity-70">({total} entries)</span>
      </div>
    </nav>
  )
}

export default Pagination

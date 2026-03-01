import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchTags } from '../api/entries'

interface TagFilterProps {
  onTagChange: (tag: string) => void
}

function TagFilter({ onTagChange }: TagFilterProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [tags, setTags] = useState<string[]>([])
  const activeTag = searchParams.get('tag') ?? ''

  useEffect(() => {
    fetchTags()
      .then(setTags)
      .catch((err) => console.error('Failed to load tags', err))
  }, [])

  function handleChange(tag: string) {
    const next = new URLSearchParams(searchParams)
    if (tag) {
      next.set('tag', tag)
    } else {
      next.delete('tag')
    }
    // Reset to page 1 when tag changes
    next.delete('page')
    setSearchParams(next)
    onTagChange(tag)
  }

  return (
    <p>
      <label htmlFor="tag-filter">Filter by tag:{' '}</label>
      <select
        id="tag-filter"
        value={activeTag}
        onChange={(e) => handleChange(e.target.value)}
      >
        <option value="">All tags</option>
        {tags.map((tag) => (
          <option key={tag} value={tag}>
            #{tag}
          </option>
        ))}
      </select>
      {activeTag && (
        <>
          {' '}
          <button type="button" onClick={() => handleChange('')}>
            Clear filter
          </button>
        </>
      )}
    </p>
  )
}

export default TagFilter

'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
export default function UniversalSearchBar({ placeholder = 'Search...' }) {
  const [query, setQuery] = useState('')
  const router = useRouter()
  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={placeholder}
        style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc' }}
      />
      <button type="submit" style={{ padding: '8px 16px' }}>Search</button>
    </form>
  )
}

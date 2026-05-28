'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function UniversalSearchBar({ placeholder = 'Search or Ask...', initialValue = '' }) {
  const [query, setQuery] = useState(initialValue)
  const [results, setResults] = useState({ nodes: [], pyqs: [], news: [] })
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    setQuery(initialValue)
  }, [initialValue])

  // Debounced search for autocomplete
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ nodes: [], pyqs: [], news: [] })
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      const fetchUrl = `/api/search?q=${encodeURIComponent(query.trim())}`;
      try {
        const res = await fetch(fetchUrl)
        console.log(`[Autocomplete] Fetch URL: ${fetchUrl}`);
        console.log(`[Autocomplete] Status: ${res.status}`);
        
        const data = await res.json()
        console.log(`[Autocomplete] Parsed JSON:`, data);
        
        setResults(data)
      } catch (err) {
        console.error('Autocomplete fetch error:', err)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Create flattened list for keyboard navigation
  const flattenedSuggestions = [];
  results.streaks?.slice(0, 3).forEach(s => {
    flattenedSuggestions.push({ ...s, category: 'NEWS STREAK', icon: '⚡' });
  });
  results.editorials?.slice(0, 3).forEach(e => {
    flattenedSuggestions.push({ ...e, category: 'EDITORIAL', icon: '🗞️' });
  });
  results.news?.slice(0, 3).forEach(n => {
    flattenedSuggestions.push({ ...n, category: 'NEWS', icon: '📰' });
  });
  if (results.nodes?.length > 0) {
    flattenedSuggestions.push({ ...results.nodes[0], category: 'ANSWER', icon: '🧠' });
    results.nodes.slice(1, 5).forEach(n => {
      flattenedSuggestions.push({ ...n, category: 'NODE', icon: '🏛️' });
    });
  }
  results.pyqs?.slice(0, 3).forEach(p => {
    flattenedSuggestions.push({ ...p, category: 'PYQ', icon: '🎯' });
  });

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      inputRef.current?.focus()
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < flattenedSuggestions.length - 1 ? prev + 1 : prev))
      setShowSuggestions(true)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > -1 ? prev - 1 : -1))
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && flattenedSuggestions[selectedIndex]) {
        e.preventDefault()
        const item = flattenedSuggestions[selectedIndex]
        handleNavigate(item)
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      inputRef.current?.blur()
    }
  }

  const handleNavigate = (item) => {
    setShowSuggestions(false)
    if (item.category === 'ANSWER' || item.category === 'NODE') {
      router.push(`/node/${item.slug}`)
    } else if (item.category === 'PYQ') {
      router.push(`/search?q=${encodeURIComponent(query)}&tab=PYQ`)
    } else if (item.category === 'NEWS STREAK') {
      router.push(`/news?streakId=${item.id}`)
    } else if (item.category === 'NEWS' || item.category === 'EDITORIAL') {
      router.push(`/news/article/${item.id}`)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      setShowSuggestions(false)
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !inputRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="universal-search-container" ref={dropdownRef}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', width: '100%' }}>
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => {
              setQuery(e.target.value)
              setShowSuggestions(true)
              setSelectedIndex(-1)
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="search-input-premium"
          />
          <div className="shortcut-hint">
            <kbd>⌘</kbd> K
          </div>
          
          {/* Autocomplete Dropdown */}
          {showSuggestions && (query.trim().length >= 2) && (flattenedSuggestions.length > 0 || loading) && (
            <div className="autocomplete-dropdown">
              {loading ? (
                <div className="dropdown-loading">Synchronizing Intelligence...</div>
              ) : (
                <div className="dropdown-content">
                  {/* Categorized Render */}
                  {['NEWS STREAK', 'EDITORIAL', 'NEWS', 'ANSWER', 'NODE', 'PYQ'].map(cat => {
                    const catItems = flattenedSuggestions.filter(i => i.category === cat);
                    if (catItems.length === 0) return null;

                    return (
                      <div key={cat} className="dropdown-section">
                        <div className="section-label">{cat === 'ANSWER' ? 'Best Match' : cat}</div>
                        {catItems.map((item) => {
                          const flatIndex = flattenedSuggestions.indexOf(item);
                          return (
                            <div
                              key={item.id}
                              className={`suggestion-item ${selectedIndex === flatIndex ? 'active' : ''}`}
                              onClick={() => handleNavigate(item)}
                              onMouseEnter={() => setSelectedIndex(flatIndex)}
                            >
                              <div className="suggestion-main">
                                <span className="suggestion-icon">{item.icon}</span>
                                <div className="suggestion-text">
                                  <div className="suggestion-title">{item.title || item.question?.substring(0, 60) + '...'}</div>
                                  <div className="suggestion-subtitle">
                                    {item.category === 'NODE' && `${item.domain} • ${item.gsPapers?.[0] || 'GS'}`}
                                    {item.category === 'PYQ' && `${item.year} · ${item.paper}`}
                                    {item.category === 'NEWS STREAK' && `Updated ${new Date(item.updatedAt).toLocaleDateString()}`}
                                    {(item.category === 'NEWS' || item.category === 'EDITORIAL') && `${item.source || 'News'} · ${new Date(item.publishedAt).toLocaleDateString()}`}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        <button type="submit" className="search-submit-btn">
          Go
        </button>
      </form>

      <style jsx>{`
        .universal-search-container {
          width: 100%;
          max-width: 700px;
          position: relative;
          overflow: visible !important; /* Ensure dropdown isn't clipped */
        }

        .search-input-wrapper {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
          overflow: visible !important;
        }

        .search-icon {
          position: absolute;
          left: 20px;
          font-size: 1.2rem;
          opacity: 0.6;
          z-index: 2;
        }

        .search-input-premium {
          width: 100%;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          padding: 18px 60px 18px 56px;
          border-radius: 20px;
          color: var(--text-primary);
          font-size: 1.15rem;
          font-weight: 500;
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(20px);
        }

        .search-input-premium:focus {
          border-color: var(--neural-blue);
          background: var(--bg-hover);
          box-shadow: 0 0 0 4px var(--neural-glow), 0 20px 50px rgba(0, 0, 0, 0.5);
        }

        .shortcut-hint {
          position: absolute;
          right: 20px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--text-muted);
          background: var(--bg-input);
          padding: 4px 10px;
          border-radius: 8px;
          pointer-events: none;
        }

        .search-submit-btn {
          padding: 0 32px;
          background: linear-gradient(135deg, #38bdf8, #818cf8);
          border: none;
          border-radius: 20px;
          color: #0f172a;
          font-weight: 900;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(56, 189, 248, 0.4);
        }

        .autocomplete-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          left: 0;
          right: 0;
          background: var(--bg-hover);
          border: 1px solid var(--border-color);
          border-radius: 24px;
          overflow: hidden;
          z-index: 1000; /* High enough to be above other elements */
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(30px);
          animation: slideDown 0.25s cubic-bezier(0.23, 1, 0.32, 1);
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dropdown-section {
          padding-top: 12px;
        }

        .section-label {
          padding: 8px 24px;
          font-size: 0.7rem;
          font-weight: 900;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 1.5px;
        }

        .suggestion-item {
          padding: 12px 24px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .suggestion-item.active {
          background: var(--bg-hover);
          border-left: 4px solid var(--neural-blue);
          padding-left: 28px;
        }

        .suggestion-main {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .suggestion-icon {
          font-size: 1.3rem;
          margin-top: 2px;
        }

        .suggestion-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.3;
        }

        .suggestion-subtitle {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-top: 4px;
          font-weight: 600;
        }

        .dropdown-loading {
          padding: 32px;
          text-align: center;
          color: var(--neural-blue);
          font-size: 0.9rem;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  )
}

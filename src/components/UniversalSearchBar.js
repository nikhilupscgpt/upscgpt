"use client"

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UniversalSearchBar({ initialValue = '', placeholder = "Search across nodes...", className = "" }) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const router = useRouter();

  // Handle clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        fetch(`/api/search/suggest?q=${encodeURIComponent(query.trim())}`)
          .then(res => res.json())
          .then(data => {
            setSuggestions(data.suggestions || []);
            setShowDropdown(true);
          })
          .catch(err => console.error("Suggest error:", err));
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 200); // 200ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      setShowDropdown(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setActiveIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      setActiveIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0) {
        const selected = suggestions[activeIndex];
        setQuery(selected.text);
        setShowDropdown(false);
        router.push(selected.link);
      } else {
        handleSubmit();
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  return (
    <div className={`universal-search-container ${className}`} style={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowDropdown(true)}
          placeholder={placeholder}
          className="search-input"
          autoComplete="off"
          style={{ 
            padding: '12px 20px', 
            fontSize: '1.1rem', 
            fontWeight: 'bold', 
            borderRadius: '12px', 
            border: '2px solid rgba(255,255,255,0.4)', 
            background: 'rgba(255,255,255,0.1)', 
            color: 'var(--text-primary)', 
            width: '100%',
            outline: 'none'
          }}
        />
        <button type="submit" className="search-btn" style={{ padding: '12px 24px', fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '12px', background: 'linear-gradient(135deg, #38bdf8, #8b5cf6)', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
          Search
        </button>
      </form>

      {showDropdown && suggestions.length > 0 && (
        <div 
          ref={dropdownRef}
          className="search-dropdown" 
          style={{ 
            position: 'absolute', 
            top: 'calc(100% + 8px)', 
            left: 0, 
            right: 0, 
            background: 'rgba(15, 23, 42, 0.95)', 
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            zIndex: 1000,
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}
        >
          {suggestions.map((s, idx) => (
            <Link 
              key={`${s.id}-${idx}`}
              href={s.link}
              className={`suggestion-item ${activeIndex === idx ? 'active' : ''}`}
              onClick={() => setShowDropdown(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                textDecoration: 'none',
                background: activeIndex === idx ? 'rgba(255,255,255,0.05)' : 'transparent',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ opacity: 0.5 }}>{s.type === 'ISSUE' ? '🗞️' : s.type === 'ATLAS' ? '🧭' : '📚'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>{s.text}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{s.sub}</div>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>↵</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

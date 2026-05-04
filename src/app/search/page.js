"use client"

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import UniversalSearchBar from '@/components/UniversalSearchBar';
import { useIsClient } from '@/lib/useIsClient';
import './search.css';

const FILTERS = [
  { id: 'ALL', label: 'All Results', icon: '✨' },
  { id: 'ISSUE', label: 'Current Affairs', icon: '🗞️' },
  { id: 'CONTENT', label: 'Study Material', icon: '📚' },
  { id: 'PYQ', label: 'PYQs', icon: '🎯' },
  { id: 'ATLAS', label: 'Atlas', icon: '🧭' }
];

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const isClient = useIsClient();

  const highlightText = (text, q) => {
    if (!q || !text) return text;
    const parts = text.split(new RegExp(`(${q})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === q.toLowerCase() ? 
          <mark key={i} className="highlight-tag">{part}</mark> : 
          part
        )}
      </span>
    );
  };

  const filteredResults = activeFilter === 'ALL' 
    ? null
    : null;

  if (!isClient) return null;

  return <SearchResultsInner key={query || ''} query={query} activeFilter={activeFilter} setActiveFilter={setActiveFilter} highlightText={highlightText} />;
}

function SearchResultsInner({ query, activeFilter, setActiveFilter, highlightText }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(Boolean(query));
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingMessages = [
    "Initializing neural uplink...",
    "Scouring 545 syllabus nodes...",
    "Analyzing semantic vector space...",
    "Indexing historical PYQ database...",
    "Mapping global strategic nodes..."
  ];

  useEffect(() => {
    if (!query) return;

    const stepTimer = setInterval(() => {
      setLoadingStep(prev => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
    }, 400);

    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        setResults(data.results || []);
        setLoading(false);
        clearInterval(stepTimer);
      })
      .catch(err => {
        console.error("Search fetch error:", err);
        setLoading(false);
        clearInterval(stepTimer);
      });

    return () => clearInterval(stepTimer);
  }, [query, loadingMessages.length]);

  const filteredResults = activeFilter === 'ALL'
    ? results
    : results.filter(r => r.type === activeFilter);

  return (
    <div className="search-page">
      <div className="search-header">
        <UniversalSearchBar initialValue={query} className="search-bar-inline" />
        
        {/* Modern Filter Chips */}
        <div className="filter-chips-container">
          {FILTERS.map(f => (
            <button 
              key={f.id}
              className={`filter-chip ${activeFilter === f.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(f.id)}
            >
              <span className="filter-icon">{f.icon}</span>
              {f.label}
            </button>
          ))}
        </div>

        <div className="search-meta-info">
          Showing {filteredResults.length} results for <span className="query-text">&quot;{query}&quot;</span>
        </div>
      </div>

      <div className="search-results-container">
        {loading ? (
          <div className="neural-loading-container">
            <div className="neural-pulse-visual">
              <div className="pulse-ring"></div>
              <div className="pulse-ring"></div>
              <div className="pulse-dot-center"></div>
            </div>
            <div className="neural-message-ticker">
              <div className="message-current">{loadingMessages[loadingStep]}</div>
              <div className="progress-bar-minimal">
                <div className="progress-fill" style={{ width: `${(loadingStep + 1) * 20}%` }}></div>
              </div>
            </div>
          </div>
        ) : filteredResults.length > 0 ? (
          filteredResults.map((result, idx) => (
            <Link key={`${result.type}-${result.id}-${idx}`} href={result.link} className="result-card-premium">
              <div className="result-main">
                <div className="result-meta">
                  <span className="result-icon-small">{result.icon}</span>
                  <span className="result-type-label">{result.type}</span>
                </div>
                <h3 className="result-title-premium">{highlightText(result.title, query)}</h3>
                <p className="result-snippet">{highlightText(result.subtitle, query)}</p>
              </div>
              <div className="result-action">
                <div className="arrow-circle">→</div>
              </div>
            </Link>
          ))
        ) : (
          <div className="no-results-premium">
            <div className="no-results-icon">📡</div>
            <h3>No specific intelligence matches found</h3>
            <p>Try broad keywords like &quot;Governance&quot;, &quot;Economy&quot;, or &quot;World Theatre&quot;.</p>
            <div className="suggested-actions">
              <Link href="/issues" className="suggested-btn">Explore Issues</Link>
              <Link href="/atlas" className="suggested-btn">Open Mapping Command</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UniversalSearchPage() {
  return (
    <Suspense fallback={<div className="search-page"><div className="loading-skeleton">Synchronizing Neural Uplink...</div></div>}>
      <SearchResults />
    </Suspense>
  );
}

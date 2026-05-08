"use client"

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import UniversalSearchBar from '../../components/UniversalSearchBar';
import AnswerCard from '../../components/search/AnswerCard';
import { useIsClient } from '../../lib/useIsClient';
import './search.css';

const TABS = [
  { id: 'ANSWER', label: 'Answer', icon: '🧠' },
  { id: 'NOTE', label: 'Note', icon: '🏛️' },
  { id: 'PYQ', label: 'PYQ', icon: '🎯' },
  { id: 'LINKED', label: 'Linked Topics', icon: '🔗' },
  { id: 'NEWS', label: 'Latest News', icon: '📰' }
];

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const isClient = useIsClient();

  const highlightText = (text, q) => {
    if (!q || !text) return text;
    const escapedQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedQ})`, 'gi'));
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

  if (!isClient) return null;

  return (
    <SearchResultsInner 
      key={query || ''} 
      query={query} 
      highlightText={highlightText} 
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="skeleton-container">
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-line title"></div>
          <div className="skeleton-line meta"></div>
          <div className="skeleton-line text"></div>
        </div>
      ))}
    </div>
  );
}

function SearchResultsInner({ query, highlightText }) {
  const [nodes, setNodes] = useState([]);
  const [pyqs, setPyqs] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(Boolean(query));
  const [activeTab, setActiveTab] = useState('NOTE');

  useEffect(() => {
    if (!query) return;

    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        setNodes(data.nodes || []);
        setPyqs(data.pyqs || []);
        setNews(data.news || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Search fetch error:", err);
        setLoading(false);
      });
  }, [query]);

  const topNode = nodes.length > 0 ? nodes[0] : null;
  const remainingNodes = nodes.length > 1 ? nodes.slice(1) : [];
  
  // Filter for Linked Topics: Same gsPaper as topNode, excluding topNode
  const linkedTopics = topNode ? nodes.filter(n => 
    n.id !== topNode.id && 
    n.gsPapers?.some(p => topNode.gsPapers?.includes(p))
  ) : [];

  return (
    <div className="search-page">
      <div className="search-header">
        <div className="search-bar-outer">
          <UniversalSearchBar initialValue={query} />
        </div>
        
        {/* Tab Bar */}
        <div className="tab-bar-discovery">
          {TABS.map(tab => (
            <button 
              key={tab.id}
              className={`discovery-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        {!loading && query && activeTab === 'NOTE' && (
          <div className="search-meta-info">
            Universal Intelligence Search Results for <span className="query-text">&quot;{query}&quot;</span>
          </div>
        )}
      </div>

      <div className="search-results-container">
        {loading ? (
          <LoadingSkeleton />
        ) : query ? (
          <div className="tab-content-area">
            
            {/* Tab: ANSWER */}
            {activeTab === 'ANSWER' && (
              <div className="answer-tab-prompt">
                <div className="ask-atlas-card">
                  <div className="ask-icon">🤖</div>
                  <h3>Ask Atlas about {query}</h3>
                  <p>Get a deep-dive AI analysis synthesized from multiple sources.</p>
                  <Link href={`/ask?q=${encodeURIComponent(query)}`} className="ask-btn">
                    Initialize AI Deep-Dive →
                  </Link>
                </div>
              </div>
            )}

            {/* Tab: NOTE (Current Nodes UI) */}
            {activeTab === 'NOTE' && (
              <div className="note-tab-results">
                {topNode ? (
                  <>
                    <AnswerCard node={topNode} query={query} highlightText={highlightText} />
                    {remainingNodes.length > 0 && (
                      <div className="remaining-nodes-list">
                        <h4 className="secondary-results-title">Additional Syllabus Nodes</h4>
                        {remainingNodes.map(node => (
                          <Link key={node.id} href={`/node/${node.slug}`} className="node-card-mini">
                            <div className="node-card-content">
                              <div className="node-card-meta">
                                <span className="gs-tag">{node.gsPapers?.[0] || 'GS'}</span>
                                <span className="type-tag">{node.nodeType}</span>
                              </div>
                              <h3 className="node-title-mini">{highlightText(node.title, query)}</h3>
                              <p className="node-themes-mini">{(node.metadata?.keyThemes || []).slice(0, 3).join(' • ')}</p>
                            </div>
                            <span className="arrow-icon">→</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="empty-state-tab">
                    <p>No syllabus nodes found for this topic.</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: PYQ */}
            {activeTab === 'PYQ' && (
              <div className="pyq-tab-results">
                {pyqs.length > 0 ? (
                  <div className="pyq-stack">
                    {pyqs.map(pyq => (
                      <div key={pyq.id} className="pyq-result-card">
                        <div className="pyq-card-header">
                          <span className="pyq-year-tag">{pyq.year}</span>
                          <span className="pyq-paper-tag">Paper {pyq.paper}</span>
                        </div>
                        <p className="pyq-text">{highlightText(pyq.question, query)}</p>
                        <div className="pyq-footer">
                          <Link href="/prelims" className="pyq-analyze-btn">View Analysis</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state-tab">
                    <p>PYQs for this topic are being indexed. Check back soon.</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: LINKED TOPICS */}
            {activeTab === 'LINKED' && (
              <div className="linked-tab-results">
                {linkedTopics.length > 0 ? (
                  <div className="node-list">
                    {linkedTopics.map(node => (
                      <Link key={node.id} href={`/node/${node.slug}`} className="node-card-mini">
                        <div className="node-card-content">
                          <div className="node-card-meta">
                            <span className="gs-tag">{node.gsPapers?.[0] || 'GS'}</span>
                            <span className="type-tag">{node.nodeType}</span>
                          </div>
                          <h3 className="node-title-mini">{highlightText(node.title, query)}</h3>
                          <p className="node-themes-mini">{(node.metadata?.keyThemes || []).slice(0, 3).join(' • ')}</p>
                        </div>
                        <span className="arrow-icon">→</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state-tab">
                    <p>No linked topics found.</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: NEWS */}
            {activeTab === 'NEWS' && (
              <div className="news-tab-results">
                {news.length > 0 ? (
                  <div className="news-stack">
                    {news.map(item => (
                      <div key={item.id} className="news-result-card">
                        <div className="news-meta">
                          <span className="news-source">{item.source}</span>
                          <span className="news-date">{new Date(item.publishedAt).toLocaleDateString()}</span>
                        </div>
                        <h3 className="news-title">{highlightText(item.title, query)}</h3>
                        <div className="news-footer">
                          <span className="news-link-placeholder">Read Full Analysis →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state-tab">
                    <p>News articles for this topic are coming soon.</p>
                  </div>
                )}
              </div>
            )}

          </div>
        ) : (
          <div className="search-empty-state-large">
            <div className="empty-visual">📡</div>
            <h2>Enter a topic to begin research</h2>
            <p>Try "Article 356", "Indus Valley", or "Green Hydrogen"</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .search-page {
          max-width: 900px;
          margin: 0 auto;
          padding: 120px 20px 80px;
        }
        .search-bar-outer {
          display: flex;
          justify-content: center;
          margin-bottom: 32px;
        }
        
        /* Tab Bar Styling */
        .tab-bar-discovery {
          display: flex;
          gap: 8px;
          margin-bottom: 32px;
          overflow-x: auto;
          padding-bottom: 8px;
          scrollbar-width: none;
        }
        .tab-bar-discovery::-webkit-scrollbar { display: none; }

        .discovery-tab {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 10px 20px;
          border-radius: 100px;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        }

        .discovery-tab:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .discovery-tab.active {
          background: rgba(56, 189, 248, 0.1);
          border-color: #38bdf8;
          color: #38bdf8;
          box-shadow: 0 0 15px rgba(56, 189, 248, 0.15);
        }

        .tab-icon { font-size: 1rem; }

        .search-meta-info {
          text-align: center;
          color: rgba(255, 255, 255, 0.3);
          font-size: 0.85rem;
          margin-bottom: 32px;
          font-weight: 600;
        }
        .query-text { color: white; font-weight: 800; }

        /* Ask Atlas Card */
        .ask-atlas-card {
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(129, 140, 248, 0.1));
          border: 1px solid rgba(56, 189, 248, 0.3);
          padding: 40px;
          border-radius: 24px;
          text-align: center;
          animation: slideUp 0.4s ease-out;
        }
        .ask-icon { font-size: 3rem; margin-bottom: 20px; }
        .ask-atlas-card h3 { font-size: 1.8rem; font-weight: 800; color: white; margin-bottom: 12px; }
        .ask-atlas-card p { color: rgba(255, 255, 255, 0.6); margin-bottom: 32px; font-size: 1.1rem; }
        .ask-btn {
          display: inline-block;
          background: #38bdf8;
          color: #0f172a;
          padding: 14px 32px;
          border-radius: 12px;
          font-weight: 800;
          text-decoration: none;
          transition: all 0.3s;
        }
        .ask-btn:hover { background: white; transform: translateY(-2px); }

        /* Mini Node Cards */
        .secondary-results-title {
          font-size: 0.75rem;
          font-weight: 900;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.3);
          margin: 48px 0 16px 0;
          letter-spacing: 1px;
        }
        .node-card-mini {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 20px 24px;
          border-radius: 16px;
          text-decoration: none;
          margin-bottom: 12px;
          transition: all 0.3s;
        }
        .node-card-mini:hover {
          background: rgba(255, 255, 255, 0.02);
          border-color: rgba(56, 189, 248, 0.3);
          transform: translateX(8px);
        }
        .node-card-meta { display: flex; gap: 8px; margin-bottom: 8px; }
        .gs-tag { font-size: 0.65rem; font-weight: 800; color: #38bdf8; }
        .type-tag { font-size: 0.65rem; font-weight: 800; color: rgba(255, 255, 255, 0.3); text-transform: uppercase; }
        .node-title-mini { font-size: 1.15rem; font-weight: 800; color: white; margin: 0; }
        .node-themes-mini { font-size: 0.85rem; color: rgba(255, 255, 255, 0.4); margin: 4px 0 0 0; }
        .arrow-icon { color: rgba(255, 255, 255, 0.1); font-size: 1.2rem; }

        /* PYQ / News Stacks */
        .pyq-stack, .news-stack { display: flex; flex-direction: column; gap: 16px; }
        .pyq-result-card, .news-result-card {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 24px;
          border-radius: 20px;
        }
        .pyq-year-tag { color: #38bdf8; font-weight: 800; margin-right: 12px; }
        .pyq-paper-tag { color: rgba(255, 255, 255, 0.3); font-weight: 700; }
        .pyq-text { color: rgba(255, 255, 255, 0.8); line-height: 1.6; margin: 16px 0; }
        .pyq-analyze-btn { color: #38bdf8; text-decoration: none; font-weight: 700; font-size: 0.9rem; }
        
        .news-meta { display: flex; justify-content: space-between; margin-bottom: 12px; }
        .news-source { color: #818cf8; font-weight: 800; font-size: 0.8rem; }
        .news-date { color: rgba(255, 255, 255, 0.3); font-size: 0.8rem; }
        .news-title { font-size: 1.15rem; font-weight: 800; color: white; margin-bottom: 16px; }
        .news-link-placeholder { color: rgba(255, 255, 255, 0.4); font-size: 0.85rem; font-weight: 700; }

        .empty-state-tab {
          text-align: center;
          padding: 80px 20px;
          color: rgba(255, 255, 255, 0.3);
          font-style: italic;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 640px) {
          .ask-atlas-card { padding: 24px; }
          .ask-atlas-card h3 { font-size: 1.4rem; }
        }
      `}</style>
    </div>
  );
}

export default function UniversalSearchPage() {
  return (
    <Suspense fallback={<div className="search-page"><div className="loading-skeleton">Initializing Neural Uplink...</div></div>}>
      <SearchResults />
    </Suspense>
  );
}

"use client"

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import UniversalSearchBar from '../../components/UniversalSearchBar';
import AnswerCard from '../../components/search/AnswerCard';
import { useIsClient } from '../../lib/useIsClient';
import './search.css';

const TABS = [
  { id: 'ALL', label: 'All Results', icon: '🔍' },
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
  const [streaks, setStreaks] = useState([]);
  const [editorials, setEditorials] = useState([]);
  const [loading, setLoading] = useState(Boolean(query));
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    if (!query) return;

    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        setNodes(data.nodes || []);
        setPyqs(data.pyqs || []);
        setNews(data.news || []);
        setStreaks(data.streaks || []);
        setEditorials(data.editorials || []);
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
            
            {/* Tab: ALL (Unified SERP Layout) */}
            {activeTab === 'ALL' && (
              <div className="serp-layout">
                {/* Left Column: Search Results List */}
                <div className="serp-left-column">
                  
                  {/* Results: News Streaks */}
                  {streaks.map(streak => (
                    <div key={streak.id} className="serp-result-item">
                      <div className="serp-item-meta">
                        <span className="serp-item-tag streak">News Streak</span>
                        <span className="serp-item-breadcrumb">upscgpt.com &gt; News &gt; Streaks</span>
                      </div>
                      <Link href={`/news?streakId=${streak.id}`} className="serp-item-title">
                        {highlightText(streak.title, query)}
                      </Link>
                      <p className="serp-item-snippet">
                        {streak.livingSummary ? (
                          highlightText(streak.livingSummary.substring(0, 180) + '...', query)
                        ) : (
                          'Follow this evolving news streak detailing recent UPSC-relevant timeline updates and comprehensive mains questions.'
                        )}
                      </p>
                    </div>
                  ))}

                  {/* Results: Editorials */}
                  {editorials.map(item => (
                    <div key={item.id} className="serp-result-item">
                      <div className="serp-item-meta">
                        <span className="serp-item-tag editorial">Editorial</span>
                        <span className="serp-item-breadcrumb">upscgpt.com &gt; News &gt; {item.source || 'Editorials'}</span>
                      </div>
                      <Link href={`/news/article/${item.id}`} className="serp-item-title">
                        {highlightText(item.title, query)}
                      </Link>
                      <p className="serp-item-snippet">
                        {item.rawContent ? (
                          highlightText(item.rawContent.substring(0, 180) + '...', query)
                        ) : (
                          'Read the full UPSC current affairs editorial analysis and structured outline highlights.'
                        )}
                      </p>
                    </div>
                  ))}

                  {/* Results: News Articles */}
                  {news.map(item => (
                    <div key={item.id} className="serp-result-item">
                      <div className="serp-item-meta">
                        <span className="serp-item-tag news">News Article</span>
                        <span className="serp-item-breadcrumb">upscgpt.com &gt; News &gt; {item.source || 'Articles'}</span>
                      </div>
                      <Link href={`/news/article/${item.id}`} className="serp-item-title">
                        {highlightText(item.title, query)}
                      </Link>
                      <p className="serp-item-snippet">
                        {item.rawContent ? (
                          highlightText(item.rawContent.substring(0, 180) + '...', query)
                        ) : (
                          'Read the full current affairs summary briefing, micro-notes, and geographical context.'
                        )}
                      </p>
                    </div>
                  ))}

                  {/* Results: Syllabus/Issue Nodes */}
                  {nodes.map(node => (
                    <div key={node.id} className="serp-result-item">
                      <div className="serp-item-meta">
                        <span className="serp-item-tag node">Syllabus Node</span>
                        <span className="serp-item-breadcrumb">upscgpt.com &gt; Syllabus &gt; {node.gsPapers?.[0] || 'GS'} &gt; {node.domain}</span>
                      </div>
                      <Link href={`/node/${node.slug}`} className="serp-item-title">
                        {highlightText(node.title, query)}
                      </Link>
                      <p className="serp-item-snippet">
                        {node.metadata?.keyThemes ? (
                          <span>Key Themes: <strong>{highlightText(node.metadata.keyThemes.join(' • '), query)}</strong>. Read structured topper-grade note outlines and geographical linkages.</span>
                        ) : (
                          'Access comprehensive topper-grade UPSC syllabus notes, value-addition cards, and key arguments.'
                        )}
                      </p>
                    </div>
                  ))}

                  {/* Results: PYQs */}
                  {pyqs.map(pyq => (
                    <div key={pyq.id} className="serp-result-item">
                      <div className="serp-item-meta">
                        <span className="serp-item-tag pyq">Previous Year Q</span>
                        <span className="serp-item-breadcrumb">upscgpt.com &gt; Prelims &gt; {pyq.year} &gt; Paper {pyq.paper}</span>
                      </div>
                      <Link href={`/prelims`} className="serp-item-title">
                        UPSC Prelims {pyq.year} Question - Paper {pyq.paper}
                      </Link>
                      <p className="serp-item-snippet" style={{ fontStyle: 'italic' }}>
                        &quot;{highlightText(pyq.question, query)}&quot;
                      </p>
                    </div>
                  ))}

                  {streaks.length === 0 && news.length === 0 && editorials.length === 0 && nodes.length === 0 && pyqs.length === 0 && (
                    <div className="no-results-premium">
                      <div className="no-results-icon">📡</div>
                      <h2>No matches found for your search query</h2>
                      <p>Try searching for a different term or syllabus topic.</p>
                    </div>
                  )}

                </div>

                {/* Right Column: Syllabus Knowledge Panel */}
                <div className="serp-right-column">
                  {topNode ? (
                    <div className="serp-knowledge-panel">
                      <div className="kp-header">
                        <span className="kp-source-label">Syllabus Knowledge Base</span>
                        <h3 className="kp-title">{topNode.title}</h3>
                        <div className="kp-meta-tags">
                          <span className="kp-tag">{topNode.gsPapers?.[0] || 'GS'}</span>
                          <span className="kp-tag" style={{ textTransform: 'uppercase' }}>{topNode.nodeType}</span>
                          <span className="kp-tag">{topNode.domain}</span>
                        </div>
                      </div>

                      <div className="kp-section">
                        <h4 className="kp-overview-title">Quick Overview</h4>
                        <p className="kp-overview-text">
                          This syllabus node is categorized under **{topNode.domain}** ({topNode.gsPapers?.[0] || 'General Studies'}). It represents a core conceptual theme frequently tested in both UPSC Prelims and Mains.
                        </p>
                      </div>

                      {topNode.metadata?.keyThemes?.length > 0 && (
                        <div className="kp-section">
                          <h4 className="kp-section-title">Key Themes</h4>
                          <ul className="kp-list">
                            {topNode.metadata.keyThemes.slice(0, 4).map((theme, i) => (
                              <li key={i}>{theme}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {topNode.linkedPyqs?.length > 0 && (
                        <div className="kp-section">
                          <h4 className="kp-section-title">Linked PYQs</h4>
                          <ul className="kp-list" style={{ listStyleType: 'circle' }}>
                            {topNode.linkedPyqs.slice(0, 2).map((pyq, i) => (
                              <li key={i} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                <strong>{pyq.year} (Paper {pyq.paper}):</strong> &quot;{pyq.questionText?.substring(0, 60)}...&quot;
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="kp-actions">
                        <Link href={`/node/${topNode.slug}`} className="kp-btn primary">
                          Start Studying Outline →
                        </Link>
                        <Link href={`/atlas/graph?focus=${topNode.slug}`} className="kp-btn secondary">
                          View Graphic Context 🕸️
                        </Link>
                        <Link href={`/atlas?node=${topNode.slug}`} className="kp-btn secondary">
                          View Location on Map 🗺️
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="serp-knowledge-panel" style={{ background: 'rgba(255,255,255,0.01)', borderStyle: 'dashed', textAlign: 'center', opacity: 0.7 }}>
                      <span style={{ fontSize: '2rem', display: 'block', marginBottom: '12px' }}>💡</span>
                      <h4 className="kp-title" style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>No Specific Knowledge Panel</h4>
                      <p className="kp-overview-text" style={{ fontSize: '0.78rem' }}>
                        Search for a core UPSC syllabus topic like "Preamble", "Monsoon", or "Finance Commission" to display a dedicated study panel.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

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

            {/* Global Discovery Footer (Persistent across tabs) */}
            {topNode && (
              <div className="discovery-global-footer">
                <Link href={`/issues/${topNode.slug}`} className="discovery-cta primary">
                  Open Full Node →
                </Link>
                <Link href={`/atlas/graph?focus=${topNode.slug}`} className="discovery-cta secondary">
                  View on Graph 🕸️
                </Link>
                <Link href={`/atlas?node=${topNode.slug}`} className="discovery-cta secondary">
                  View on Map 🗺️
                </Link>
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
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          padding: 10px 20px;
          border-radius: 100px;
          color: var(--text-secondary);
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
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .discovery-tab.active {
          background: var(--bg-active-tab, rgba(56, 189, 248, 0.1));
          border-color: var(--color-link);
          color: var(--color-link);
          box-shadow: 0 0 15px var(--neural-glow);
        }

        .discovery-global-footer {
          display: flex;
          gap: 16px;
          margin-top: 40px;
          padding-top: 32px;
          border-top: 1px solid var(--border-color);
          background: linear-gradient(to top, var(--bg-card), transparent);
          border-radius: 0 0 24px 24px;
        }

        .discovery-cta {
          padding: 12px 28px;
          border-radius: 12px;
          font-weight: 800;
          text-decoration: none;
          font-size: 0.9rem;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .discovery-cta.primary {
          background: var(--btn-primary-bg);
          color: var(--btn-primary-text);
          box-shadow: 0 4px 20px var(--neural-glow);
        }

        .discovery-cta.primary:hover {
          background: var(--btn-primary-hover-bg);
          transform: translateY(-2px);
        }

        .discovery-cta.secondary {
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
        }

        .discovery-cta.secondary:hover {
          background: var(--bg-hover);
          transform: translateY(-2px);
          border-color: var(--border-hover);
        }

        .tab-icon { font-size: 1rem; }

        .search-meta-info {
          text-align: center;
          color: var(--text-muted);
          font-size: 0.85rem;
          margin-bottom: 32px;
          font-weight: 600;
        }
        .query-text { color: var(--text-primary); font-weight: 800; }

        /* Ask Atlas Card */
        .ask-atlas-card {
          background: linear-gradient(135deg, var(--bg-card), var(--bg-input));
          border: 1px solid var(--border-color);
          padding: 40px;
          border-radius: 24px;
          text-align: center;
          animation: slideUp 0.4s ease-out;
        }
        .ask-icon { font-size: 3rem; margin-bottom: 20px; }
        .ask-atlas-card h3 { font-size: 1.8rem; font-weight: 800; color: var(--text-primary); margin-bottom: 12px; }
        .ask-atlas-card p { color: var(--text-secondary); margin-bottom: 32px; font-size: 1.1rem; }
        .ask-btn {
          display: inline-block;
          background: var(--btn-primary-bg);
          color: var(--btn-primary-text);
          padding: 14px 32px;
          border-radius: 12px;
          font-weight: 800;
          text-decoration: none;
          transition: all 0.3s;
        }
        .ask-btn:hover { background: var(--btn-primary-hover-bg); transform: translateY(-2px); }

        /* Mini Node Cards */
        .secondary-results-title {
          font-size: 0.75rem;
          font-weight: 900;
          text-transform: uppercase;
          color: var(--text-muted);
          margin: 48px 0 16px 0;
          letter-spacing: 1px;
        }
        .node-card-mini {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          padding: 20px 24px;
          border-radius: 16px;
          text-decoration: none;
          margin-bottom: 12px;
          transition: all 0.3s;
        }
        .node-card-mini:hover {
          background: var(--bg-hover);
          border-color: var(--color-link);
          transform: translateX(8px);
        }
        .node-card-meta { display: flex; gap: 8px; margin-bottom: 8px; }
        .gs-tag { font-size: 0.65rem; font-weight: 800; color: var(--color-link); }
        .type-tag { font-size: 0.65rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; }
        .node-title-mini { font-size: 1.15rem; font-weight: 800; color: var(--text-primary); margin: 0; }
        .node-themes-mini { font-size: 0.85rem; color: var(--text-muted); margin: 4px 0 0 0; }
        .arrow-icon { color: var(--text-muted); font-size: 1.2rem; }

        /* PYQ / News Stacks */
        .pyq-stack, .news-stack { display: flex; flex-direction: column; gap: 16px; }
        .pyq-result-card, .news-result-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          padding: 24px;
          border-radius: 20px;
        }
        .pyq-year-tag { color: var(--color-link); font-weight: 800; margin-right: 12px; }
        .pyq-paper-tag { color: var(--text-muted); font-weight: 700; }
        .pyq-text { color: var(--text-primary); line-height: 1.6; margin: 16px 0; }
        .pyq-analyze-btn { color: var(--color-link); text-decoration: none; font-weight: 700; font-size: 0.9rem; }
        
        .news-meta { display: flex; justify-content: space-between; margin-bottom: 12px; }
        .news-source { color: var(--badge-editorial-text); font-weight: 800; font-size: 0.8rem; }
        .news-date { color: var(--text-muted); font-size: 0.8rem; }
        .news-title { font-size: 1.15rem; font-weight: 800; color: var(--text-primary); margin-bottom: 16px; }
        .news-link-placeholder { color: var(--text-muted); font-size: 0.85rem; font-weight: 700; }

        .empty-state-tab {
          text-align: center;
          padding: 80px 20px;
          color: var(--text-muted);
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

"use client"
import { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export default function NewsTicker({ regionKey, onArticleSelect, drawerOpen, onCloseDrawer }) {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [entryDetails, setEntryDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    let isMounted = true
    fetch(`/api/news?region=${regionKey}`)
      .then(r => r.json())
      .then(data => {
        if (isMounted) {
          if (data.articles) setArticles(data.articles)
          setLoading(false)
        }
      })
      .catch(err => {
        console.error("News fetch error", err)
        if (isMounted) setLoading(false)
      })
    return () => { isMounted = false }
  }, [regionKey])

  const handleArticleClick = async (article) => {
    // Close right drawer to prevent overlap
    if (onCloseDrawer) onCloseDrawer()
    
    setSelectedArticle(article)
    setEntryDetails(null)
    onArticleSelect && onArticleSelect(article)

    // Load enriched entry details from DB if we have an entryId
    if (article.entryId) {
      setLoadingDetails(true)
      try {
        const res = await fetch(`/api/entries/${article.entryId}`)
        if (res.ok) {
          const entry = await res.json()
          setEntryDetails(entry)
        }
      } catch (e) {
        console.error("Failed to load entry details", e)
      } finally {
        setLoadingDetails(false)
      }
    }
  }

  if (loading) return null
  if (articles.length === 0) return null

  const marqueeContent = [...articles, ...articles]

  // Extract source domain from URL for badge
  const getSourceName = (url) => {
    try {
      const host = new URL(url).hostname.replace('www.', '')
      const SOURCE_MAP = {
        'thehindu.com': 'The Hindu',
        'indianexpress.com': 'Indian Express',
        'nytimes.com': 'NYT',
        'washingtonpost.com': 'WaPo',
        'livemint.com': 'LiveMint',
        'business-standard.com': 'Biz Standard',
        'thediplomat.com': 'The Diplomat',
        'bbc.com': 'BBC',
        'bbc.co.uk': 'BBC',
        'aljazeera.com': 'Al Jazeera',
        'economictimes.indiatimes.com': 'ET',
        'economictimes.com': 'ET',
      }
      return SOURCE_MAP[host] || host.split('.')[0].charAt(0).toUpperCase() + host.split('.')[0].slice(1)
    } catch { return '' }
  }

  return (
    <>
      {/* ── NEWS DETAIL PANEL ─────────────────────────────────────────── */}
      {selectedArticle && (
        <div style={{
          position: 'absolute', bottom: '80px', left: '20px',
          width: 'calc(100% - 40px)', maxWidth: '680px', zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.97)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)', fontFamily: "'Outfit', sans-serif",
          maxHeight: '50vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
          animation: 'slideUp 0.3s ease'
        }}>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(20px); }
              to   { opacity: 1; transform: translateY(0); }
            }
            .news-md ul { margin: 8px 0; padding-left: 20px; }
            .news-md li { color: #cbd5e1; font-size: 0.82rem; line-height: 1.8; margin-bottom: 6px; }
            .news-md li::marker { color: #38bdf8; }
            .news-md strong { color: #38bdf8; font-weight: 700; }
            .news-md p { color: #94a3b8; font-size: 0.82rem; line-height: 1.8; margin: 6px 0; }
            .news-md h3 { color: #e2e8f0; font-size: 0.85rem; margin: 14px 0 6px; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 6px; }
            .news-md a { color: #38bdf8; text-decoration: none; font-weight: 600; }
            .news-md a:hover { text-decoration: underline; }
            .news-md hr { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 12px 0; }
            .news-detail-scroll::-webkit-scrollbar { width: 4px; }
            .news-detail-scroll::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.3); border-radius: 4px; }
            .news-detail-scroll::-webkit-scrollbar-track { background: transparent; }
          `}} />

          {/* Header */}
          <div style={{
            padding: '14px 18px 10px', borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexShrink: 0
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                {selectedArticle.locationName && (
                  <span style={{
                    fontSize: '0.65rem', padding: '2px 8px', borderRadius: '20px', fontWeight: 800,
                    background: 'rgba(56,189,248,0.15)', color: '#38bdf8',
                    border: '1px solid rgba(56,189,248,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px'
                  }}>📍 {selectedArticle.locationName}</span>
                )}
                {selectedArticle.url && (
                  <span style={{
                    fontSize: '0.65rem', padding: '2px 8px', borderRadius: '20px', fontWeight: 700,
                    background: 'rgba(245,158,11,0.15)', color: '#f59e0b',
                    border: '1px solid rgba(245,158,11,0.3)',
                  }}>{getSourceName(selectedArticle.url)}</span>
                )}
                <span style={{ fontSize: '0.65rem', color: '#475569', fontWeight: 600 }}>
                  {new Date(selectedArticle.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <h3 style={{ color: '#f1f5f9', fontSize: '0.95rem', fontWeight: 800, margin: 0, lineHeight: 1.4 }}>
                {selectedArticle.title}
              </h3>
            </div>
            <button
              onClick={() => setSelectedArticle(null)}
              style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#94a3b8', width: '28px', height: '28px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >✕</button>
          </div>

          {/* Content — scrollable */}
          <div className="news-detail-scroll" style={{ padding: '14px 18px', overflowY: 'auto', flex: 1 }}>

            {/* Article Description */}
            {selectedArticle.description && (
              <div style={{ marginBottom: '14px', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', borderLeft: '3px solid rgba(56,189,248,0.5)' }}>
                <div style={{ fontSize: '0.65rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>📰 Summary</div>
                <p style={{ color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.7, margin: 0 }}>{selectedArticle.description}</p>
              </div>
            )}

            {/* UPSC Crux from DB */}
            {loadingDetails ? (
              <div style={{ padding: '16px', textAlign: 'center' }}>
                <div style={{ color: '#38bdf8', fontSize: '0.82rem', fontWeight: 700 }}>
                  <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: '8px' }}>⚙️</span>
                  Loading UPSC Intelligence...
                </div>
              </div>
            ) : entryDetails?.newsMentions ? (
              <div style={{ padding: '10px 14px', background: 'rgba(56,189,248,0.05)', borderRadius: '10px', border: '1px solid rgba(56,189,248,0.15)' }}>
                <div style={{ fontSize: '0.65rem', color: '#0ea5e9', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  🎯 UPSC Intelligence Log
                </div>
                <div className="news-md">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    transformLinkUri={(uri) => {
                      const protocols = ['http', 'https', 'mailto', 'tel'];
                      try {
                        const parsed = new URL(uri, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
                        if (protocols.includes(parsed.protocol.replace(':', ''))) return uri;
                        return '#';
                      } catch {
                        return uri.startsWith('/') ? uri : '#';
                      }
                    }}
                    disallowedElements={['script', 'iframe', 'object', 'embed']}
                  >
                    {entryDetails.newsMentions}
                  </ReactMarkdown>
                </div>
              </div>
            ) : entryDetails && !entryDetails.newsMentions ? (
              <div style={{ padding: '12px 14px', background: 'rgba(245,158,11,0.05)', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.15)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.3rem', marginBottom: '4px' }}>🤖</div>
                <p style={{ color: '#92400e', fontSize: '0.78rem', fontWeight: 700, margin: 0 }}>AI is still processing this article.</p>
                <p style={{ color: '#78716c', fontSize: '0.72rem', margin: '4px 0 0' }}>Refresh in ~60 seconds for the UPSC Crux.</p>
              </div>
            ) : !selectedArticle.entryId ? (
              <div style={{ padding: '12px 14px', background: 'rgba(139,92,246,0.05)', borderRadius: '10px', border: '1px solid rgba(139,92,246,0.15)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.3rem', marginBottom: '4px' }}>🗺️</div>
                <p style={{ color: '#7c3aed', fontSize: '0.78rem', fontWeight: 700, margin: 0 }}>AI is auto-mapping this location.</p>
                <p style={{ color: '#78716c', fontSize: '0.72rem', margin: '4px 0 0' }}>A new map node appears after ~60s.</p>
              </div>
            ) : null}

            {/* Footer Link */}
            <div style={{ marginTop: '12px', textAlign: 'right' }}>
              <a href={selectedArticle.url} target="_blank" rel="noreferrer" style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700, textDecoration: 'none', padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', transition: 'all 0.2s' }}>
                Read Full Article →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── TICKER BAR ────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
        width: '85%', maxWidth: '1100px', zIndex: 999,
        background: 'rgba(15, 23, 42, 0.88)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px',
        overflow: 'hidden', display: 'flex', alignItems: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)', fontFamily: "'Outfit', sans-serif"
      }}>
        {/* Badge */}
        <div style={{
          padding: '10px 16px', background: 'linear-gradient(135deg, #38bdf8, #8b5cf6)',
          color: 'white', fontWeight: 900, fontSize: '0.72rem', letterSpacing: '1px',
          textTransform: 'uppercase', flexShrink: 0, zIndex: 10, position: 'relative',
          boxShadow: '4px 0 10px rgba(0,0,0,0.2)'
        }}>
          LIVE INTEL
        </div>

        {/* Scrolling Track — SLOWER */}
        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', position: 'relative', flex: 1 }}>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes scroll-ticker {
              0%   { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .ticker-track { animation: scroll-ticker 90s linear infinite; }
            .ticker-track:hover { animation-play-state: paused; }
            .ticker-item { transition: color 0.2s, background 0.2s; padding: 2px 6px; border-radius: 4px; }
            .ticker-item:hover { color: #f8fafc !important; background: rgba(139,92,246,0.2); }
          `}} />
          <div className="ticker-track" style={{ display: 'inline-block', paddingLeft: '16px' }}>
            {marqueeContent.map((article, idx) => {
              const source = article.url ? getSourceName(article.url) : ''
              return (
                <span key={idx} style={{ display: 'inline-flex', alignItems: 'center' }}>
                  {article.lat && article.lon && (
                    <span style={{ fontSize: '0.8rem', marginRight: '4px' }}>📍</span>
                  )}
                  {source && (
                    <span style={{
                      fontSize: '0.6rem', padding: '1px 5px', borderRadius: '4px', fontWeight: 800,
                      background: 'rgba(245,158,11,0.2)', color: '#fbbf24', marginRight: '5px',
                      textTransform: 'uppercase', letterSpacing: '0.3px'
                    }}>{source}</span>
                  )}
                  <span
                    className="ticker-item"
                    onClick={() => handleArticleClick(article)}
                    style={{
                      color: article.lat ? '#38bdf8' : '#cbd5e1',
                      fontSize: '0.85rem', fontWeight: article.lat ? 700 : 500,
                      cursor: 'pointer',
                    }}
                  >
                    {article.title}
                  </span>
                  <span style={{ margin: '0 20px', color: '#334155', fontSize: '0.6rem' }}>◆</span>
                </span>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

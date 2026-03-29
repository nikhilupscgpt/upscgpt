"use client"
import { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export default function NewsTicker({ regionKey, onArticleSelect }) {
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

  return (
    <>
      {/* ── NEWS DETAIL PANEL ─────────────────────────────────────────── */}
      {selectedArticle && (
        <div style={{
          position: 'absolute', bottom: '90px', left: '50%', transform: 'translateX(-50%)',
          width: '80%', maxWidth: '780px', zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.97)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)', fontFamily: "'Outfit', sans-serif",
          maxHeight: '420px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
          animation: 'slideUp 0.3s ease'
        }}>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes slideUp {
              from { opacity: 0; transform: translateX(-50%) translateY(20px); }
              to   { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
            .news-md ul { margin: 8px 0; padding-left: 20px; }
            .news-md li { color: #cbd5e1; font-size: 0.88rem; line-height: 1.7; margin-bottom: 4px; }
            .news-md strong { color: #38bdf8; }
            .news-md p { color: #94a3b8; font-size: 0.88rem; line-height: 1.7; margin: 6px 0; }
            .news-md h3 { color: #f8fafc; font-size: 0.9rem; margin: 12px 0 4px; }
            .news-md a { color: #38bdf8; }
          `}} />

          {/* Header */}
          <div style={{
            padding: '16px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexShrink: 0
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                {selectedArticle.locationName && (
                  <span style={{
                    fontSize: '0.7rem', padding: '3px 10px', borderRadius: '20px', fontWeight: 800,
                    background: 'rgba(56,189,248,0.15)', color: '#38bdf8',
                    border: '1px solid rgba(56,189,248,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px'
                  }}>📍 {selectedArticle.locationName}</span>
                )}
                <span style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600 }}>
                  {new Date(selectedArticle.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <h3 style={{ color: '#f1f5f9', fontSize: '1rem', fontWeight: 800, margin: 0, lineHeight: 1.4 }}>
                {selectedArticle.title}
              </h3>
            </div>
            <button
              onClick={() => setSelectedArticle(null)}
              style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#94a3b8', width: '30px', height: '30px', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >✕</button>
          </div>

          {/* Content */}
          <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>

            {/* Article Description */}
            {selectedArticle.description && (
              <div style={{ marginBottom: '16px', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', borderLeft: '3px solid rgba(56,189,248,0.5)' }}>
                <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>📰 Article Summary</div>
                <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>{selectedArticle.description}</p>
              </div>
            )}

            {/* UPSC Crux from DB */}
            {loadingDetails ? (
              <div style={{ padding: '16px', textAlign: 'center' }}>
                <div style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 700 }}>
                  <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: '8px' }}>⚙️</span>
                  Loading UPSC Intelligence...
                </div>
                <p style={{ color: '#475569', fontSize: '0.78rem', marginTop: '6px' }}>Fetching AI-generated analysis from database</p>
              </div>
            ) : entryDetails?.newsMentions ? (
              <div style={{ padding: '12px 16px', background: 'rgba(56,189,248,0.05)', borderRadius: '10px', border: '1px solid rgba(56,189,248,0.15)' }}>
                <div style={{ fontSize: '0.7rem', color: '#0ea5e9', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                  🎯 UPSC Intelligence Log
                </div>
                <div className="news-md">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {entryDetails.newsMentions}
                  </ReactMarkdown>
                </div>
              </div>
            ) : entryDetails && !entryDetails.newsMentions ? (
              <div style={{ padding: '12px 16px', background: 'rgba(245,158,11,0.05)', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.15)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>🤖</div>
                <p style={{ color: '#92400e', fontSize: '0.82rem', fontWeight: 700, margin: 0 }}>AI is still processing this article in the background.</p>
                <p style={{ color: '#78716c', fontSize: '0.75rem', margin: '4px 0 0' }}>Refresh the map in ~60 seconds to see the UPSC Crux.</p>
              </div>
            ) : !selectedArticle.entryId ? (
              <div style={{ padding: '12px 16px', background: 'rgba(139,92,246,0.05)', borderRadius: '10px', border: '1px solid rgba(139,92,246,0.15)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>🗺️</div>
                <p style={{ color: '#7c3aed', fontSize: '0.82rem', fontWeight: 700, margin: 0 }}>AI is auto-mapping this location for the first time.</p>
                <p style={{ color: '#78716c', fontSize: '0.75rem', margin: '4px 0 0' }}>A new map node will appear after background processing completes (~60s).</p>
              </div>
            ) : null}

            {/* Footer Link */}
            <div style={{ marginTop: '14px', textAlign: 'right' }}>
              <a href={selectedArticle.url} target="_blank" rel="noreferrer" style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none', padding: '5px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', transition: 'all 0.2s' }}>
                Read Full Article →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── TICKER BAR ────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
        width: '80%', maxWidth: '1000px', zIndex: 999,
        background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px',
        overflow: 'hidden', display: 'flex', alignItems: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)', fontFamily: "'Outfit', sans-serif"
      }}>
        {/* Badge */}
        <div style={{
          padding: '12px 20px', background: 'linear-gradient(135deg, #38bdf8, #8b5cf6)',
          color: 'white', fontWeight: 900, fontSize: '0.8rem', letterSpacing: '1px',
          textTransform: 'uppercase', flexShrink: 0, zIndex: 10, position: 'relative',
          boxShadow: '4px 0 10px rgba(0,0,0,0.2)'
        }}>
          LIVE INTEL
        </div>

        {/* Scrolling Track */}
        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', position: 'relative', flex: 1 }}>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes scroll-ticker {
              0%   { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .ticker-track { animation: scroll-ticker 40s linear infinite; }
            .ticker-track:hover { animation-play-state: paused; }
            .ticker-item:hover { color: #8b5cf6 !important; }
          `}} />
          <div className="ticker-track" style={{ display: 'inline-block', paddingLeft: '20px' }}>
            {marqueeContent.map((article, idx) => (
              <span key={idx} style={{ display: 'inline-flex', alignItems: 'center' }}>
                {article.lat && article.lon && (
                  <span style={{ fontSize: '0.9rem', marginRight: '6px' }}>📍</span>
                )}
                <span
                  className="ticker-item"
                  onClick={() => handleArticleClick(article)}
                  style={{
                    color: article.lat ? '#38bdf8' : '#e2e8f0',
                    fontSize: '0.92rem', fontWeight: article.lat ? 700 : 500,
                    cursor: 'pointer', transition: 'color 0.2s'
                  }}
                >
                  {article.title}
                </span>
                <span style={{ margin: '0 24px', color: '#64748b', fontSize: '1.2rem' }}>•</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

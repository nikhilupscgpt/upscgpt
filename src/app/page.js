"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'


export default function UPSCGPTMasterPortal() {
  const [stats, setStats] = useState({ entries: 0, categories: 0, newsToday: 0 })

  useEffect(() => {
    fetch('/api/entries')
      .then((response) => response.json())
      .then((data) => {
        const entries = Array.isArray(data) ? data : []
        const now = new Date()
        const todayCount = entries.filter((entry) => {
          if (!entry.lastNewsDate) return false
          return (now - new Date(entry.lastNewsDate)) / (1000 * 60 * 60 * 24) <= 1
        }).length

        setStats({
          entries: entries.length,
          categories: [...new Set(entries.map((entry) => entry.category))].length,
          newsToday: todayCount,
        })
      })
      .catch(() => {})
  }, [])

  const commandCenters = [
    {
      id: 'mapping',
      title: 'Mapping Command Center',
      subtitle: 'World + India Strategic Mapping',
      description:
        'Map intelligence now starts with two tracks. Use World Atlas for global theatres and India Atlas for domestic strategy, geography, and policy-linked map revision.',
      icon: '🧭',
      gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
      accentColor: '#8b5cf6',
      href: '/atlas/select',
      status: 'live',
      features: ['World Theatre Mapping', 'India-Focused Drilldown', 'AI Map Tutor', 'Revision Layers'],
      stat: { value: stats.entries, label: 'Map Nodes' },
    },
    {
      id: 'current-affairs',
      title: 'Current Affairs Command Center',
      subtitle: 'Daily Intelligence Loop',
      description:
        'Retention-first current affairs flow with daily briefs, map-linked developments, and quick revision hooks designed to pull aspirants back every day.',
      icon: '🗞️',
      gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
      accentColor: '#22d3ee',
      href: '/issues',
      status: 'live',
      features: ['Daily Briefing', 'Map-Linked News', 'Revision Hooks', 'Streak-Ready Flow'],
      stat: { value: stats.newsToday, label: 'News in 24h' },
    },
    {
      id: 'prelims',
      title: 'Prelims Command Center',
      subtitle: 'MCQ Intelligence System',
      description:
        'A precision-engineered MCQ practice stack powered by current affairs + static mapping and PYQ pattern framing, calibrated to the latest UPSC Prelims rubric.',
      icon: '🎯',
      gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
      accentColor: '#f59e0b',
      href: '/mock-test',
      status: 'live',
      features: ['AI-Generated MCQs', 'PYQ Pattern Analysis', 'Difficulty Calibration', 'Performance Analytics'],
      stat: null,
    },
    {
      id: 'mains',
      title: 'Mains Command Center',
      subtitle: 'Answer Evaluation Studio',
      description:
        'Upload handwritten or typed answers for structured AI evaluation aligned to UPSC Mains expectations, with keyword depth checks and model answer guidance.',
      icon: '✍️',
      gradient: 'linear-gradient(135deg, #10b981, #0ea5e9)',
      accentColor: '#10b981',
      href: '/mains',
      status: 'live',
      features: ['Answer Evaluation Studio', 'GS/Optional Content Node', 'Essay Guidance', 'Mains Neural Search'],
      stat: null,
    },
  ]

  return (
    <div
      style={{
        minHeight: '100vh',
        fontFamily: "'Outfit', sans-serif",
        background: 'linear-gradient(135deg, #020617 0%, #0f172a 40%, #1e1b4b 70%, #020617 100%)',
        color: 'white',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div
          style={{
            position: 'absolute',
            top: '-15%',
            left: '-10%',
            width: '55vw',
            height: '55vw',
            background: 'radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 55%)',
            filter: 'blur(80px)',
            animation: 'float1 20s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-15%',
            right: '-10%',
            width: '55vw',
            height: '55vw',
            background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 55%)',
            filter: 'blur(80px)',
            animation: 'float2 25s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            width: '30vw',
            height: '30vw',
            background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 50%)',
            filter: 'blur(60px)',
            animation: 'float3 18s ease-in-out infinite',
          }}
        />
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes float1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(30px,-40px); } }
        @keyframes float2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-40px,30px); } }
        @keyframes float3 { 0%,100% { transform: translate(-50%,-50%); } 50% { transform: translate(-50%,-50%) translate(20px,-20px); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .command-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
        .module-card { transition: all 0.4s cubic-bezier(0.4,0,0.2,1); }
        .module-card:hover { transform: translateY(-8px) scale(1.02); }
        .module-card:hover .card-glow { opacity: 1; }
        .card-glow { position: absolute; inset: -1px; border-radius: 25px; opacity: 0; transition: opacity 0.4s; pointer-events: none; z-index: 0; }
        .stat-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 20px; font-size: 0.78rem; font-weight: 800; }
        .feature-tag { padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.08); transition: all 0.2s; }
        .feature-tag:hover { background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.8); }
        .mapping-primary-cta { margin-top: 16px; display: inline-flex; align-items: center; justify-content: center; width: 100%; border-radius: 12px; padding: 11px 12px; font-size: 0.76rem; font-weight: 800; letter-spacing: 0.55px; text-transform: uppercase; text-decoration: none; color: white; border: 1px solid rgba(125,211,252,0.36); background: linear-gradient(135deg, rgba(8,47,73,0.95), rgba(30,64,175,0.92)); }
        @media (max-width: 1100px) { .command-grid { grid-template-columns: 1fr; } }
      `,
        }}
      />


      <main style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto' }} className="main-responsive-padding">
        <div style={{ textAlign: 'center', marginBottom: '60px' }} className="hero-section">
          <div style={{ marginTop: '40px' }}></div>

          <h2 className="main-title">
            The Future of
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #38bdf8 0%, #8b5cf6 40%, #f59e0b 100%)',
                backgroundSize: '200% auto',
                animation: 'shimmer 6s linear infinite',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              UPSC Preparation.
            </span>
          </h2>
          <p className="main-subtitle">
            A unified UPSC preparation operating system with four command centers: Mapping, Current Affairs, Prelims, and Mains.
          </p>
        </div>

        <style jsx>{`
          .main-responsive-padding { padding: 70px 20px 40px; }
          .main-title { 
            font-size: 5rem; 
            font-weight: 950; 
            line-height: 1.02; 
            margin: 0 0 24px; 
            letter-spacing: -3.5px; 
            text-shadow: 0 10px 30px rgba(0,0,0,0.3);
          }
          .main-subtitle { fontSize: 1.15rem; color: #94a3b8; maxWidth: 640px; margin: 0 auto; lineHeight: 1.7; }

          @media (max-width: 768px) {
            .main-responsive-padding { padding: 40px 15px; }
            .hero-section { margin-bottom: 40px; }
            .main-title { font-size: 2.2rem; letter-spacing: -1px; }
            .main-subtitle { font-size: 0.95rem; }
            .platform-badge { padding: 4px 12px; }
            .platform-badge span { font-size: 0.65rem; }
          }
        `}</style>

        <div className="command-grid">
          {commandCenters.map((center) => {
            const isLive = center.status === 'live'
            const isCardLinked = Boolean(isLive && center.href)
            const Wrapper = isCardLinked ? Link : 'div'

            return (
              <Wrapper
                key={center.id}
                {...(isCardLinked ? { href: center.href, style: { textDecoration: 'none', color: 'inherit' } } : {})}
              >
                <div
                  className="module-card"
                  style={{
                    position: 'relative',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '24px',
                    padding: '36px 28px 28px',
                    cursor: isCardLinked ? 'pointer' : 'default',
                    opacity: isLive ? 1 : 0.75,
                    overflow: 'hidden',
                    minHeight: '380px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div className="card-glow" style={{ background: center.gradient, filter: 'blur(40px)', opacity: 0 }} />
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: center.gradient }} />

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '20px',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: center.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.8rem',
                        boxShadow: `0 8px 24px ${center.accentColor}44`,
                        filter: isLive ? 'none' : 'grayscale(0.5)',
                      }}
                    >
                      {center.icon}
                    </div>
                    <span
                      className="stat-chip"
                      style={{
                        background: isLive ? `${center.accentColor}22` : 'rgba(255,255,255,0.05)',
                        color: isLive ? center.accentColor : '#64748b',
                        border: `1px solid ${isLive ? `${center.accentColor}44` : 'rgba(255,255,255,0.08)'}`,
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: isLive ? '#22c55e' : '#475569',
                          boxShadow: isLive ? '0 0 6px #22c55e' : 'none',
                        }}
                      />
                      {isLive ? 'LIVE' : 'IN PIPELINE'}
                    </span>
                  </div>

                  <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
                    <p
                      style={{
                        fontSize: '0.72rem',
                        color: center.accentColor,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        margin: '0 0 6px',
                      }}
                    >
                      {center.subtitle}
                    </p>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 12px', color: 'white', letterSpacing: '-0.3px' }}>
                      {center.title}
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '0 0 20px', lineHeight: 1.6 }}>{center.description}</p>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', position: 'relative', zIndex: 1, marginTop: 'auto' }}>
                    {center.features.map((feature) => (
                      <span key={feature} className="feature-tag">
                        {feature}
                      </span>
                    ))}
                  </div>

                  {(center.id === 'mapping' || center.id === 'current-affairs' || center.id === 'prelims') && (
                    <div className="mapping-primary-cta">
                      Open {center.title}
                    </div>
                  )}

                  {center.stat && center.stat.value > 0 && (
                    <div
                      style={{
                        marginTop: '16px',
                        paddingTop: '16px',
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white' }}>{center.stat.value}</span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: '#64748b',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {center.stat.label}
                      </span>
                    </div>
                  )}
                </div>
              </Wrapper>
            )
          })}
        </div>

        <div
          style={{
            marginTop: '48px',
            padding: '20px 32px',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            justifyContent: 'center',
            gap: '48px',
            flexWrap: 'wrap',
          }}
        >
          {[
            { icon: '🌍', val: stats.entries, label: 'Atlas Nodes' },
            { icon: '📊', val: stats.categories, label: 'Categories' },
            { icon: '🔥', val: stats.newsToday, label: 'News Today' },
            { icon: '🏛️', val: 4, label: 'Command Centers' },
          ].map((item, index) => (
            <div key={index} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{item.icon}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{item.val}</div>
              <div
                style={{
                  fontSize: '0.65rem',
                  color: '#64748b',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  marginTop: '4px',
                }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: '40px 20px',
          borderTop: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        <p style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, marginBottom: '16px' }}>
          UPSCGPT · Built with care for serious aspirants · Powered by strategic intelligence
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <Link
            href="/admin-login"
            style={{
              color: '#1e293b',
              fontSize: '0.7rem',
              textDecoration: 'none',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Instructor Vault
          </Link>
          <span style={{ color: '#1e293b' }}>•</span>
          <span
            style={{
              color: '#1e293b',
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Privacy Policy
          </span>
        </div>
      </footer>
    </div>
  )
}

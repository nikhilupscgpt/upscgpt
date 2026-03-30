"use client"
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'

export default function UPSCGPTMasterPortal() {
  const { data: session, status } = useSession()
  const loading = status === "loading"
  const [stats, setStats] = useState({ entries: 0, categories: 0, newsToday: 0 })

  useEffect(() => {
    fetch('/api/entries')
      .then(r => r.json())
      .then(data => {
        const now = new Date()
        const todayCount = data.filter(e => {
          if (!e.lastNewsDate) return false
          return (now - new Date(e.lastNewsDate)) / (1000 * 60 * 60 * 24) <= 1
        }).length
        setStats({
          entries: data.length,
          categories: [...new Set(data.map(e => e.category))].length,
          newsToday: todayCount
        })
      })
      .catch(() => {})
  }, [])

  const modules = [
    {
      id: 'mapping',
      title: 'Global Strategic Atlas',
      subtitle: 'Interactive Mapping Engine',
      description: 'Master geographical dimensions of international relations, conflicts, maritime chokepoints, and strategic resources — all placed on an interactive ArcGIS-powered map with AI-enriched daily intelligence.',
      icon: '🌍',
      gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
      accentColor: '#8b5cf6',
      href: '/atlas',
      status: 'live',
      features: ['Region-wise drill down', 'AI News Integration', 'PDF Export', 'Heatmap Mode'],
      stat: { value: stats.entries, label: 'Map Nodes' },
    },
    {
      id: 'prelims',
      title: 'Prelims Command Center',
      subtitle: 'MCQ Intelligence System',
      description: 'A precision-engineered MCQ practice engine powered by AI-generated questions from current affairs, static geography, and PYQ pattern analysis — calibrated to the latest UPSC Prelims rubric.',
      icon: '🎯',
      gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
      accentColor: '#f59e0b',
      href: null,
      status: 'pipeline',
      features: ['AI-Generated MCQs', 'PYQ Pattern Analysis', 'Difficulty Calibration', 'Performance Analytics'],
      stat: null,
    },
    {
      id: 'mains',
      title: 'Mains Answer Lab',
      subtitle: 'AI Answer Evaluation',
      description: 'Upload handwritten or typed answers for sophisticated AI evaluation aligned with the latest UPSC Mains marking scheme — with structural feedback, keyword analysis, and model answer generation.',
      icon: '✍️',
      gradient: 'linear-gradient(135deg, #10b981, #0ea5e9)',
      accentColor: '#10b981',
      href: null,
      status: 'pipeline',
      features: ['Answer Upload & Scan', 'AI Rubric Scoring', 'Model Answer Gen', 'Progress Dashboard'],
      stat: null,
    },
  ]

  return (
    <div style={{
      minHeight: '100vh', fontFamily: "'Outfit', sans-serif",
      background: 'linear-gradient(135deg, #020617 0%, #0f172a 40%, #1e1b4b 70%, #020617 100%)',
      color: 'white', overflow: 'hidden', position: 'relative'
    }}>
      {/* Animated Background Orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: '55vw', height: '55vw', background: 'radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 55%)', filter: 'blur(80px)', animation: 'float1 20s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-15%', right: '-10%', width: '55vw', height: '55vw', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 55%)', filter: 'blur(80px)', animation: 'float2 25s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '40%', left: '50%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 50%)', filter: 'blur(60px)', animation: 'float3 18s ease-in-out infinite' }} />
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(30px,-40px); } }
        @keyframes float2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-40px,30px); } }
        @keyframes float3 { 0%,100% { transform: translate(-50%,-50%); } 50% { transform: translate(-50%,-50%) translate(20px,-20px); } }
        @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 20px rgba(56,189,248,0.3); } 50% { box-shadow: 0 0 40px rgba(139,92,246,0.5); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .module-card { transition: all 0.4s cubic-bezier(0.4,0,0.2,1); }
        .module-card:hover { transform: translateY(-8px) scale(1.02); }
        .module-card:hover .card-glow { opacity: 1; }
        .card-glow { position: absolute; inset: -1px; border-radius: 25px; opacity: 0; transition: opacity 0.4s; pointer-events: none; z-index: 0; }
        .stat-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 20px; font-size: 0.78rem; font-weight: 800; }
        .feature-tag { padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.08); transition: all 0.2s; }
        .feature-tag:hover { background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.8); }
      `}} />

      {/* Navbar */}
      <nav style={{ position: 'relative', zIndex: 10, padding: '20px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #38bdf8, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(139,92,246,0.4)',
            fontSize: '1.5rem', fontWeight: 900,
            animation: 'pulseGlow 4s ease-in-out infinite'
          }}>✨</div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>UPSCGPT</h1>
            <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Unified Pedagogy System</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {!loading && !session ? (
            <button onClick={() => signIn('google')} style={{
              padding: '10px 24px', borderRadius: '12px', border: 'none',
              background: 'white', color: '#0f172a', fontWeight: 700, fontSize: '0.9rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 4px 14px rgba(255,255,255,0.2)', transition: 'all 0.3s'
            }}>
              <Image src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="G" width={16} height={16} unoptimized />
              Sign in with Google
            </button>
          ) : session ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{session.user.name || session.user.email}</div>
                <div style={{ fontSize: '0.7rem', color: session.user.tier === 'PREMIUM' ? '#f59e0b' : '#94a3b8', fontWeight: 800 }}>
                  {session.user.tier} · {session.user.role}
                </div>
              </div>
              <button onClick={() => signOut()} style={{
                padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)', color: 'white', fontWeight: 600, fontSize: '0.8rem',
                cursor: 'pointer'
              }}>Logout</button>
            </div>
          ) : null}
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto', padding: '70px 20px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          {/* Pill Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 16px', borderRadius: '24px', marginBottom: '24px',
            background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
            <span style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
              Platform Active · {stats.entries} Intelligence Nodes
            </span>
          </div>

          <h2 style={{ fontSize: '4rem', fontWeight: 900, lineHeight: 1.08, margin: '0 0 20px', letterSpacing: '-2px' }}>
            The Future of<br/>
            <span style={{ 
              background: 'linear-gradient(135deg, #38bdf8 0%, #8b5cf6 40%, #f59e0b 100%)',
              backgroundSize: '200% auto',
              animation: 'shimmer 6s linear infinite',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>UPSC Preparation.</span>
          </h2>
          <p style={{ fontSize: '1.15rem', color: '#94a3b8', maxWidth: '580px', margin: '0 auto', lineHeight: 1.7 }}>
            An AI-driven ecosystem featuring strategic mapping, precision MCQs, and intelligent answer evaluation — built for serious aspirants.
          </p>
        </div>

        {/* Module Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {modules.map((mod) => {
            const isLive = mod.status === 'live'
            const Wrapper = isLive ? Link : 'div'
            const wrapperProps = isLive ? { href: mod.href, style: { textDecoration: 'none', color: 'inherit' } } : {}
            
            return (
              <Wrapper key={mod.id} {...wrapperProps}>
                <div className="module-card" style={{
                  position: 'relative',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '24px', padding: '36px 28px 28px',
                  cursor: isLive ? 'pointer' : 'default',
                  opacity: isLive ? 1 : 0.75,
                  overflow: 'hidden',
                  minHeight: '380px',
                  display: 'flex', flexDirection: 'column',
                }}>
                  {/* Hover glow */}
                  <div className="card-glow" style={{ background: mod.gradient, filter: 'blur(40px)', opacity: 0 }} />
                  
                  {/* Top accent bar */}
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: mod.gradient }} />
                  
                  {/* Icon + Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '16px',
                      background: mod.gradient,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.8rem',
                      boxShadow: `0 8px 24px ${mod.accentColor}44`,
                      filter: isLive ? 'none' : 'grayscale(0.5)',
                    }}>{mod.icon}</div>
                    <span className="stat-chip" style={{
                      background: isLive ? `${mod.accentColor}22` : 'rgba(255,255,255,0.05)',
                      color: isLive ? mod.accentColor : '#64748b',
                      border: `1px solid ${isLive ? mod.accentColor + '44' : 'rgba(255,255,255,0.08)'}`,
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isLive ? '#22c55e' : '#475569', boxShadow: isLive ? '0 0 6px #22c55e' : 'none' }} />
                      {isLive ? 'LIVE' : 'IN PIPELINE'}
                    </span>
                  </div>
                  
                  {/* Title & Description */}
                  <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
                    <p style={{ fontSize: '0.72rem', color: mod.accentColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px' }}>
                      {mod.subtitle}
                    </p>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 12px', color: 'white', letterSpacing: '-0.3px' }}>
                      {mod.title}
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '0 0 20px', lineHeight: 1.6 }}>
                      {mod.description}
                    </p>
                  </div>
                  
                  {/* Features */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', position: 'relative', zIndex: 1, marginTop: 'auto' }}>
                    {mod.features.map(f => (
                      <span key={f} className="feature-tag">{f}</span>
                    ))}
                  </div>

                  {/* Stat footer for live modules */}
                  {mod.stat && mod.stat.value > 0 && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 1 }}>
                      <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white' }}>{mod.stat.value}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{mod.stat.label}</span>
                    </div>
                  )}
                </div>
              </Wrapper>
            )
          })}
        </div>

        {/* Bottom Stats Bar */}
        <div style={{
          marginTop: '48px', padding: '20px 32px', borderRadius: '16px',
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', justifyContent: 'center', gap: '48px',
        }}>
          {[
            { icon: '🌍', val: stats.entries, label: 'Atlas Nodes' },
            { icon: '📊', val: stats.categories, label: 'Categories' },
            { icon: '🔥', val: stats.newsToday, label: 'News Today' },
            { icon: '🤖', val: 3, label: 'AI Modules' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{s.icon}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '40px 20px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <p style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, marginBottom: '16px' }}>
          UPSCGPT · Built with ✨ for serious aspirants · Powered by Geopolitical Intelligence
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <Link href="/admin-login" style={{ color: '#1e293b', fontSize: '0.7rem', textDecoration: 'none', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Instructor Vault</Link>
          <span style={{ color: '#1e293b' }}>•</span>
          <span style={{ color: '#1e293b', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Privacy Policy</span>
        </div>
      </footer>
    </div>
  )
}

"use client"
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signIn, signOut } from 'next-auth/react'

export default function UPSCGPTMasterPortal() {
  const { data: session, status } = useSession()
  const loading = status === "loading"

  return (
    <div style={{
      minHeight: '100vh', fontFamily: "'Outfit', sans-serif",
      background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)',
      color: 'white', overflow: 'hidden', position: 'relative'
    }}>
      {/* Dynamic Background Elements */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 60%)', filter: 'blur(80px)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 60%)', filter: 'blur(80px)', zIndex: 0 }} />
      
      {/* Navbar */}
      <nav style={{ position: 'relative', zIndex: 10, padding: '24px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '45px', height: '45px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #38bdf8, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(139,92,246,0.3)',
            fontSize: '1.4rem', fontWeight: 900
          }}>✨</div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>UPSCGPT</h1>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Unified Pedagogy</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {!loading && !session ? (
            <button onClick={() => signIn('google')} style={{
              padding: '10px 24px', borderRadius: '10px', border: 'none',
              background: 'white', color: '#0f172a', fontWeight: 700, fontSize: '0.9rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 4px 14px rgba(255,255,255,0.2)', transition: 'transform 0.2s'
            }}>
              <Image src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="G" width={16} height={16} unoptimized />
              Sign in with Google
            </button>
          ) : session ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{session.user.name || session.user.email}</div>
                <div style={{ fontSize: '0.7rem', color: session.user.tier === 'PREMIUM' ? '#f59e0b' : '#94a3b8', fontWeight: 800 }}>
                  TYPE: {session.user.tier} · {session.user.role}
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
      <main style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto', padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '4.5rem', fontWeight: 900, lineHeight: 1.1, margin: '0 0 24px', letterSpacing: '-1.5px' }}>
          Welcome to the future of<br/>
          <span style={{ 
            background: 'linear-gradient(135deg, #38bdf8, #8b5cf6)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>UPSC Preparation.</span>
        </h2>
        <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto 60px', lineHeight: 1.6 }}>
          An AI-driven ecosystem featuring strategic mapping, answer evaluation, and current affairs algorithms.
        </p>

        {/* Modules Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          
          {/* ATLAS MODULE */}
          <Link href="/atlas" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '24px', padding: '40px 30px', textAlign: 'left',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)', transition: 'all 0.3s', cursor: 'pointer',
              position: 'relative', overflow: 'hidden'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }} />
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🌍</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 10px', color: 'white' }}>Global Strategic Atlas</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0 0 24px', lineHeight: 1.5 }}>
                Master geographical dimensions of international relations, conflicts, and resources for Prelims & Mains.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ padding: '6px 12px', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>LIVE NOW</span>
              </div>
            </div>
          </Link>

          {/* UPCOMING 1 */}
          <div style={{
            background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: '24px', padding: '40px 30px', textAlign: 'left', opacity: 0.7,
            position: 'relative'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px', filter: 'grayscale(1)' }}>✍️</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 10px', color: 'white' }}>Mains Answer Bot</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0 0 24px', lineHeight: 1.5 }}>
              Upload written answers for sophisticated AI evaluation aligned with latest UPSC rubric.
            </p>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>IN PIPELINE</span>
              </div>
          </div>

          {/* LIVE: STRATEGIC NEWS API */}
          <Link href="/atlas/map" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '24px', padding: '40px 30px', textAlign: 'left',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)', transition: 'all 0.3s', cursor: 'pointer',
              position: 'relative', overflow: 'hidden'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, #10b981, #3b82f6)' }} />
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📰</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 10px', color: 'white' }}>Strategic News API</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0 0 24px', lineHeight: 1.5 }}>
                A curated geo-strategic live news ticker dynamically filtered by map regions and active conflicts.
              </p>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ padding: '6px 12px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>LIVE NOW</span>
                </div>
            </div>
          </Link>

        </div>
      </main>
    </div>
  )
}

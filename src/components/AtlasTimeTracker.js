"use client"
import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'

const FREE_LIMIT = 5 * 60 // 300 seconds (5 minutes)

function getTodayString() {
  const d = new Date()
  return d.toISOString().split('T')[0]
}

export default function AtlasTimeTracker() {
  const { data: session, status } = useSession()
  const isPremium = session?.user?.tier === 'PREMIUM' || session?.user?.role === 'ADMIN'
  const [usedSeconds, setUsedSeconds] = useState(0)
  const [exhausted, setExhausted] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Initialize and track locally
  useEffect(() => {
    if (status === 'loading') return
    if (isPremium) return

    let isMounted = true

    const initTracker = () => {
      const today = getTodayString()
      const savedDate = localStorage.getItem('atlas_usage_date')
      let currentUsage = parseInt(localStorage.getItem('atlas_usage_seconds') || '0', 10)
      
      if (savedDate !== today) {
        currentUsage = 0
        localStorage.setItem('atlas_usage_date', today)
      }
      
      setUsedSeconds(currentUsage)
      setExhausted(currentUsage >= FREE_LIMIT)
      setInitialized(true)
    }
    
    // Defer initialization to avoid synchronous state updates in effect
    setTimeout(initTracker, 0)

    const interval = setInterval(() => {
      setUsedSeconds(prev => {
        const next = prev + 1
        localStorage.setItem('atlas_usage_seconds', next.toString())
        if (next >= FREE_LIMIT) {
          setExhausted(true)
        }
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [status, isPremium, exhausted])

  if (status === 'loading' || isPremium) return null

  if (exhausted && initialized) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(2, 6, 23, 0.95)',
        backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: "'Outfit', sans-serif"
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⏳</div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 10px', textAlign: 'center' }}>Daily Map Limit Reached</h2>
        <p style={{ fontSize: '1.1rem', color: '#94a3b8', maxWidth: '400px', textAlign: 'center', margin: '0 0 30px', lineHeight: 1.5 }}>
          Your free daily allowance of 5 minutes mapped time has expired. Please upgrade to <span style={{ color: '#f59e0b', fontWeight: 800 }}>PREMIUM</span> for unlimited Atlas access.
        </p>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          {!session && (
            <button onClick={() => signIn('google')} style={{
              padding: '12px 28px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)', color: 'white', 
              fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              Sign In
            </button>
          )}
          <button style={{
            padding: '12px 28px', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', 
            fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer',
            boxShadow: '0 8px 30px rgba(245, 158, 11, 0.3)'
          }}>Upgrade to Premium Now</button>
        </div>
      </div>
    )
  }

  // Timer HUD
  if (!initialized) return null
  const remaining = Math.max(0, FREE_LIMIT - usedSeconds)
  
  return (
    <div style={{
      position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
      background: 'rgba(255,255,255,0.95)', padding: '6px 14px', borderRadius: '20px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '8px',
      fontFamily: "'Outfit', sans-serif", border: '1px solid rgba(0,0,0,0.05)', backdropFilter: 'blur(5px)'
    }}>
      <span style={{ fontSize: '14px' }}>⏱️</span>
      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
        {Math.floor(remaining / 60)}m {remaining % 60}s left
      </span>
      <span style={{ fontSize: '0.7rem', fontWeight: 700, background: '#f1f5f9', padding: '2px 8px', borderRadius: '10px', color: '#475569' }}>FREE TIER</span>
    </div>
  )
}

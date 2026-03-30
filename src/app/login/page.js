"use client"
import { signIn } from "next-auth/react"
import Link from 'next/link'
import Image from 'next/image'

export default function StudentLogin() {
  return (
    <div style={{ 
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
      background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
      fontFamily: "'Outfit', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Orbs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 60%)', filter: 'blur(60px)' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 60%)', filter: 'blur(60px)' }} />

      <div style={{ 
        position: 'relative', zIndex: 10,
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        padding: '60px 40px',
        borderRadius: '32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        width: '100%',
        maxWidth: '440px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center'
      }}>
        {/* Brand Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ 
            width: '64px', height: '64px', 
            background: 'linear-gradient(135deg, #38bdf8, #8b5cf6)', 
            borderRadius: '18px', 
            margin: '0 auto 20px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: '2rem',
            boxShadow: '0 8px 32px rgba(139,92,246,0.5)'
          }}>🌍</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', margin: '0 0 8px', letterSpacing: '-0.5px' }}>UPSCGPT</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: 500 }}>Global Strategic Intelligence Portal</p>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '12px' }}>Student Login</h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.6 }}>
            Sign in to access your interactive maps, daily AI news summaries, and UPSC strategic content.
          </p>
        </div>

        {/* Primary Action */}
        <button 
          onClick={() => signIn('google', { callbackUrl: '/atlas' })}
          style={{ 
            width: '100%', 
            padding: '16px 24px', 
            borderRadius: '16px', 
            border: 'none',
            background: 'white', 
            color: '#0f172a', 
            fontWeight: 800, 
            fontSize: '1rem',
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Image src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" width={20} height={20} unoptimized />
          Continue with Google
        </button>

        {/* Discreet Admin Link */}
        <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Link href="/admin-login" style={{ 
            color: '#334155', 
            fontSize: '0.75rem', 
            textDecoration: 'none', 
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            transition: 'color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = '#64748b'}
          onMouseOut={(e) => e.currentTarget.style.color = '#334155'}
          >
            Instructors Access
          </Link>
        </div>
      </div>

      {/* Security Badge */}
      <div style={{ position: 'absolute', bottom: '32px', fontSize: '0.75rem', color: '#1e293b', fontWeight: 600 }}>
        UPSCGPT SECURE AUTHENTICATION · 256-BIT ENCRYPTION
      </div>
    </div>
  )
}

"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Mail, Key, ShieldCheck, Sparkles } from 'lucide-react'

export default function StudentLogin() {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState(1) // 1: Email, 2: OTP
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (data.success) {
        setStep(2)
      } else {
        setError(data.error || "Failed to send OTP")
      }
    } catch (err) {
      setError("Connection error")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await signIn('otp', {
      email,
      otp,
      redirect: false,
      callbackUrl: '/atlas'
    })

    if (result?.ok) {
      window.location.href = '/atlas'
    } else {
      setError("Invalid OTP or expired")
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--hero-bg-gradient)',
      fontFamily: "'Outfit', sans-serif",
      position: 'relative',
      overflow: 'hidden',
      padding: '20px'
    }}>
      {/* Background Orbs Removed */}

      <div style={{
        position: 'relative', zIndex: 10,
        background: 'var(--bg-card)',
        backdropFilter: 'blur(30px)',
        padding: '50px 40px',
        borderRadius: '32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        width: '100%',
        maxWidth: '440px',
        border: '1px solid var(--border-color)',
        textAlign: 'center'
      }}>
        {/* Brand Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            width: '64px', height: '64px',
            background: 'linear-gradient(135deg, #38bdf8, #8b5cf6)',
            borderRadius: '20px',
            margin: '0 auto 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem',
            boxShadow: '0 10px 25px rgba(139,92,246,0.4)',
            transform: 'rotate(-5deg)'
          }}>🌍</div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 8px', letterSpacing: '-0.02em' }}>UPSCGPT</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Intelligence Hub</p>
        </div>

        {/* Auth Forms */}
        <div style={{ marginBottom: '32px' }}>
          {step === 1 ? (
            <form onSubmit={handleRequestOtp}>
              <div style={{ position: 'relative', marginBottom: '20px' }}>
                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%', padding: '16px 16px 16px 48px', borderRadius: '16px',
                    background: 'var(--bg-input)', border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s'
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '16px', borderRadius: '16px', border: 'none',
                  background: 'linear-gradient(135deg, #38bdf8, #8b5cf6)', color: 'white',
                  fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                {loading ? 'Processing...' : 'Send Login OTP'} <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
                We&apos;ve sent a 6-digit code to <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{email}</span>
              </p>
              <div style={{ position: 'relative', marginBottom: '20px' }}>
                <Key size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  style={{
                    width: '100%', padding: '16px 16px 16px 48px', borderRadius: '16px',
                    background: 'var(--bg-input)', border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)', fontSize: '1.2rem', outline: 'none', letterSpacing: '0.5em', textAlign: 'center'
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '16px', borderRadius: '16px', border: 'none',
                  background: '#22c55e', color: 'white',
                  fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                {loading ? 'Verifying...' : 'Complete Login'} <ShieldCheck size={18} />
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ background: 'none', border: 'none', color: '#64748b', marginTop: '16px', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Use a different email
              </button>
            </form>
          )}
          {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '16px', fontWeight: 700 }}>{error}</p>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '32px 0', opacity: 0.5 }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800 }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        </div>

        {/* Secondary Action: Google */}
        <button
          onClick={() => signIn('google', { callbackUrl: '/atlas' })}
          style={{
            width: '100%', padding: '14px 24px', borderRadius: '16px', border: '1px solid var(--border-color)',
            background: 'transparent', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <Image src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" width={18} height={18} unoptimized />
          Continue with Google
        </button>

        {/* Discreet Admin Link */}
        <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
          <Link href="/admin-login" style={{
            color: 'var(--text-muted)', fontSize: '0.7rem', textDecoration: 'none', fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: '1.5px', transition: 'color 0.2s'
          }}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            Instructors Command Center
          </Link>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '32px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ShieldCheck size={14} /> ENCRYPTED BIOMETRIC SECURE AUTHENTICATION
      </div>
    </div>
  )
}

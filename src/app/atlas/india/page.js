"use client"

import Link from 'next/link'


export default function IndiaAtlasComingSoonPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        fontFamily: "'Outfit', sans-serif",
        background: 'linear-gradient(135deg, #020617 0%, #0f172a 45%, #1f2937 100%)',
        color: 'white',
      }}
    >
      <main style={{ maxWidth: '920px', margin: '0 auto', padding: '64px 20px 80px' }}>
        <section
          style={{
            borderRadius: 24,
            border: '1px solid rgba(253,186,116,0.35)',
            background: 'linear-gradient(160deg, rgba(124,45,18,0.32), rgba(15,23,42,0.82))',
            padding: '34px 24px',
          }}
        >
          <p
            style={{
              margin: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderRadius: 999,
              border: '1px solid rgba(253,186,116,0.45)',
              background: 'rgba(251,146,60,0.2)',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              color: '#fdba74',
            }}
          >
            India Atlas Track
          </p>
          <h1 style={{ margin: '16px 0 10px', fontSize: 'clamp(2rem, 4vw, 2.8rem)', letterSpacing: '-0.7px' }}>
            India Mapping Is Next
          </h1>
          <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.75, fontSize: '1rem', maxWidth: 720 }}>
            We are preparing India-first mapping layers for geography, polity, economy, internal security, and current-affairs-linked hotspots.
            This page is now the official entry point for that module.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18 }}>
            {['State & region layers', 'Thematic overlays', 'UPSC quick revision', 'Nano India context'].map((item) => (
              <span
                key={item}
                style={{
                  padding: '6px 11px',
                  borderRadius: 999,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#e2e8f0',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                }}
              >
                {item}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 24 }}>
            <Link
              href="/atlas/select"
              style={{
                textDecoration: 'none',
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid rgba(148,163,184,0.38)',
                color: '#e2e8f0',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
              }}
            >
              Back to Mapping Choice
            </Link>
            <Link
              href="/atlas"
              style={{
                textDecoration: 'none',
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid rgba(125,211,252,0.42)',
                color: '#dbeafe',
                background: 'linear-gradient(135deg, rgba(8,47,73,0.9), rgba(30,64,175,0.58))',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
              }}
            >
              Open World Atlas
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}

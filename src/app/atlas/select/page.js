"use client"

import Link from 'next/link'


const OPTIONS = [
  {
    key: 'world',
    title: 'World Atlas',
    subtitle: 'Global Strategic Mapping',
    description:
      'Explore world regions, maritime chokepoints, conflict theatres, and strategic nodes linked with UPSC-ready context.',
    href: '/atlas',
    emoji: '🌍',
    gradient: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
    status: 'live',
    cta: 'Open World Atlas',
    highlights: ['Regional drilldowns', 'MapBot tutoring', 'News-linked nodes'],
  },
  {
    key: 'india',
    title: 'India Atlas',
    subtitle: 'Domestic Strategic Mapping',
    description:
      'Dedicated India mapping track for geography, polity, economy, and security-linked locations with UPSC exam framing.',
    href: '/atlas/india',
    emoji: '🇮🇳',
    gradient: 'linear-gradient(135deg, #f97316, #16a34a)',
    status: 'pipeline',
    cta: 'Open India Track',
    highlights: ['India-first map themes', 'State-level layers', 'Current affairs linkage'],
  },
]

export default function AtlasSelectorPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        fontFamily: "'Outfit', sans-serif",
        background: 'linear-gradient(135deg, #020617 0%, #0f172a 45%, #1e293b 100%)',
        color: 'white',
      }}
    >
      <main style={{ maxWidth: '1120px', margin: '0 auto', padding: '60px 20px 70px' }}>
        <div style={{ textAlign: 'center', marginBottom: '34px' }}>
          <p
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              margin: 0,
              padding: '6px 14px',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              borderRadius: 999,
              color: '#bfdbfe',
              background: 'rgba(59,130,246,0.14)',
              border: '1px solid rgba(59,130,246,0.28)',
            }}
          >
            Mapping Command Center
          </p>
          <h1 style={{ margin: '16px 0 10px', fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.8px' }}>
            Choose Your Mapping Track
          </h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '1rem', lineHeight: 1.7 }}>
            Start with global strategy or India-focused mapping. You can switch tracks anytime.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 20,
          }}
        >
          {OPTIONS.map((option) => {
            const Wrapper = option.status === 'live' ? Link : 'div'
            const wrapperProps =
              option.status === 'live'
                ? {
                    href: option.href,
                    style: { textDecoration: 'none', color: 'inherit' },
                  }
                : {}

            return (
              <Wrapper key={option.key} {...wrapperProps}>
                <article
                  style={{
                    position: 'relative',
                    minHeight: 320,
                    borderRadius: 22,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(15,23,42,0.58)',
                    padding: 24,
                    overflow: 'hidden',
                    boxShadow: '0 14px 40px rgba(2,6,23,0.35)',
                    opacity: option.status === 'live' ? 1 : 0.88,
                    cursor: option.status === 'live' ? 'pointer' : 'default',
                    transition: 'transform 220ms ease, border-color 220ms ease',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: option.gradient,
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: 14,
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: '1.65rem',
                        background: option.gradient,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                      }}
                    >
                      {option.emoji}
                    </div>
                    <span
                      style={{
                        padding: '6px 12px',
                        borderRadius: 999,
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        letterSpacing: '0.6px',
                        textTransform: 'uppercase',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: option.status === 'live' ? '#86efac' : '#cbd5e1',
                        background: option.status === 'live' ? 'rgba(22,163,74,0.16)' : 'rgba(148,163,184,0.14)',
                      }}
                    >
                      {option.status === 'live' ? 'Live' : 'In Pipeline'}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 6px', color: '#a5b4fc', fontSize: '0.76rem', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                    {option.subtitle}
                  </p>
                  <h2 style={{ margin: '0 0 12px', fontSize: '1.7rem', letterSpacing: '-0.4px' }}>{option.title}</h2>
                  <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.62, fontSize: '0.93rem' }}>{option.description}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
                    {option.highlights.map((item) => (
                      <span
                        key={item}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 999,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: '#cbd5e1',
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: 'rgba(255,255,255,0.05)',
                        }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  <div
                    style={{
                      marginTop: 18,
                      padding: '10px 12px',
                      borderRadius: 11,
                      textAlign: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      letterSpacing: '0.55px',
                      textTransform: 'uppercase',
                      border: option.status === 'live' ? '1px solid rgba(125,211,252,0.35)' : '1px solid rgba(148,163,184,0.22)',
                      color: option.status === 'live' ? '#e0f2fe' : '#94a3b8',
                      background:
                        option.status === 'live'
                          ? 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,64,175,0.58))'
                          : 'rgba(71,85,105,0.24)',
                    }}
                  >
                    {option.cta}
                  </div>
                </article>
              </Wrapper>
            )
          })}
        </div>
      </main>
    </div>
  )
}

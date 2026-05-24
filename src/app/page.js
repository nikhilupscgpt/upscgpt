"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTranslation } from "@/context/TranslationContext";
import { useRouter } from 'next/navigation';
import UniversalSearchBar from '@/components/UniversalSearchBar';
import { useIsClient } from '@/lib/useIsClient';

import './home.css'


export default function UPSCGPTMasterPortal() {
  const [stats, setStats] = useState({ entries: 0, categories: 0, newsToday: 0, issues: 0 })
  const { t } = useTranslation();
  const isClient = useIsClient();
  const [searchTerm, setSearchTerm] = useState('');
  // handleSearch removed, handled by component

  useEffect(() => {
    // Parallel fetch for better performance
    Promise.all([
      fetch('/api/entries').then(res => res.json()),
      fetch('/api/issues').then(res => res.json()).catch(() => []) // Fallback if no issues yet
    ]).then(([entriesData, issuesData]) => {
      const entries = Array.isArray(entriesData) ? entriesData : []
      const issues = Array.isArray(issuesData) ? issuesData : []

      const now = new Date()
      const todayCount = entries.filter((entry) => {
        if (!entry.lastNewsDate) return false
        return (now - new Date(entry.lastNewsDate)) / (1000 * 60 * 60 * 24) <= 1
      }).length

      setStats({
        entries: entries.length,
        categories: [...new Set(entries.map((entry) => entry.category))].length,
        newsToday: todayCount,
        issues: issues.length
      })
    }).catch(() => { })
  }, [])

  if (!isClient) return <div style={{ minHeight: '100vh', background: 'var(--hero-bg-gradient)' }} />;

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
      href: '/news',
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
      href: '/prelims',
      status: 'live',
      features: ['AI-Generated MCQs', 'PYQ Pattern Analysis', 'Difficulty Calibration', 'Performance Analytics'],
      stat: { value: 100, label: 'Prelims Tests' },
    },
    {
      id: 'mains',
      title: 'Mains Command Center',
      subtitle: 'Neural Intelligence Base',
      description:
        'Consolidated GS Paper nodes with AI-synthesized material, strategic mapping evaluation, and topper-grade answer evaluators.',
      icon: '✍️',
      gradient: 'linear-gradient(135deg, #10b981, #0ea5e9)',
      accentColor: '#10b981',
      href: '/mains',
      status: 'live',
      features: ['Neural Base Grid', 'GS/Optional Content Node', 'Essay Guidance', 'Mains Evaluators'],
      stat: { value: stats.issues || 0, label: 'Syllabus Nodes' },
    },
  ]

  return (
    <div
      style={{
        minHeight: '100vh',
        fontFamily: "'Outfit', sans-serif",
        background: 'transparent',
        color: 'var(--text-primary)',
        overflow: 'hidden',
        position: 'relative',
        transition: 'background 0.3s ease, color 0.3s ease'
      }}
    >
      <div style={{ display: 'none' }} />



      <main style={{ position: 'relative', zIndex: 10, maxWidth: '1400px', margin: '0 auto' }} className="main-responsive-padding">
        <div style={{ textAlign: 'center', marginBottom: '64px', marginTop: '120px' }} className="hero-section">
          <h2 className="main-title" style={{ color: 'var(--text-primary)' }}>
            {t('home.heroTitle')}
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
              {t('home.heroSubtitle')}
            </span>
          </h2>
          <p className="main-subtitle" style={{ color: 'var(--text-secondary)' }}>
            {t('home.heroDesc')}
          </p>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '12px', fontWeight: 500 }}>
            This platform is currently in Beta. Features are actively being improved.
          </p>
        </div>

        {/* Universal Search Bar with Autocomplete */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <UniversalSearchBar placeholder="Search across nodes..." />
        </div>

        <div className="command-grid" style={{ alignItems: 'stretch' }}>
          {commandCenters.map((center) => {
            const isLive = center.status === 'live'
            const isCardLinked = Boolean(isLive && center.href)
            const Wrapper = isCardLinked ? Link : 'div'

            return (
              <Wrapper
                key={center.id}
                {...(isCardLinked ? { href: center.href, style: { textDecoration: 'none', color: 'inherit', display: 'flex' } } : { style: { display: 'flex' } })}
              >
                <div
                  className="module-card"
                  style={{
                    position: 'relative',
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '24px',
                    padding: '28px 24px 24px',
                    cursor: isCardLinked ? 'pointer' : 'default',
                    opacity: isLive ? 1 : 0.75,
                    overflow: 'hidden',
                    minHeight: '320px',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: `0 20px 40px -15px rgba(0,0,0,0.8), 0 0 25px ${center.accentColor}33, inset 0 0 20px ${center.accentColor}05`,
                    transition: 'all 0.4s ease'
                  }}
                >
                  <div className="card-glow" style={{ background: center.gradient, filter: 'blur(60px)', opacity: 0.15 }} />
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    background: center.gradient,
                    boxShadow: `0 0 20px ${center.accentColor}, 0 0 40px ${center.accentColor}88`
                  }} />

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
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: center.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        boxShadow: `0 8px 20px ${center.accentColor}33`,
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

                  <div style={{ position: 'relative', zIndex: 1, minHeight: '60px', overflow: 'hidden', marginBottom: '8px' }}>
                    <p
                      style={{
                        fontSize: '0.65rem',
                        color: center.accentColor,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        margin: '0 0 4px',
                      }}
                    >
                      {center.subtitle}
                    </p>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0', color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
                      {center.title}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', position: 'relative', zIndex: 1, minHeight: '64px', marginBottom: '16px' }}>
                    {center.features.map((feature) => (
                      <span key={feature} className="feature-tag">
                        {feature}
                      </span>
                    ))}
                  </div>

                  <div style={{ marginTop: 'auto', position: 'relative', zIndex: 1 }}>
                    <div className="mapping-primary-cta" style={{ marginBottom: '12px', padding: '8px 12px' }}>
                      Open {center.title.split(' ')[0]} Hub
                    </div>

                    {center.stat && (
                      <div
                        style={{
                          paddingTop: '16px',
                          borderTop: '1px solid rgba(255,255,255,0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white' }}>{center.stat.value || 0}</span>
                        <span
                          style={{
                            fontSize: '0.6rem',
                            fontWeight: 800,
                            color: '#64748b',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                          }}
                        >
                          {center.stat.label}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Wrapper>
            )
          })}


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
          UPSCGPT · © 2026 Stara AI PVT LTD · Built with care for serious aspirants
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
          <Link
            href="/sitemap.xml"
            style={{
              color: '#1e293b',
              fontSize: '0.7rem',
              textDecoration: 'none',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Sitemap
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

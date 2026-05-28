"use client";

import { useState, useEffect } from 'react'
import Link from 'next/link'

const REGIONS = [
  {
    key: 'asia',
    label: 'Asia',
    emoji: '🌏',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    description: 'West Asia, South Asia, Southeast Asia, East Asia, Central Asia',
    highlights: ['South China Sea', 'Himalayan Arc', 'Strait of Malacca'],
    bounds: [-10, 55, 60, 180],
  },
  {
    key: 'africa',
    label: 'Africa',
    emoji: '🌍',
    color: '#22c55e',
    gradient: 'linear-gradient(135deg, #22c55e, #15803d)',
    description: 'North Africa, West Africa, East Africa, Central Africa, Southern Africa',
    highlights: ['Horn of Africa', 'Sahel Belt', 'Congo Basin'],
    bounds: [-35, 38, -20, 55],
  },
  {
    key: 'europe',
    label: 'Europe',
    emoji: '🗺️',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #4338ca)',
    description: 'Western Europe, Eastern Europe, Northern Europe, Southern Europe',
    highlights: ['Ukraine Theatre', 'Arctic Frontier', 'NATO Belt'],
    bounds: [35, 72, -25, 45],
  },
  {
    key: 'north_america',
    label: 'North America',
    emoji: '🌎',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444, #b91c1c)',
    description: 'Northern America, Central America, Caribbean',
    highlights: ['Panama Canal', 'USMCA Corridor', 'Caribbean Sea'],
    bounds: [5, 75, -170, -50],
  },
  {
    key: 'south_america',
    label: 'South America',
    emoji: '🦜',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    description: 'Andean states, Southern Cone, Northern South America',
    highlights: ['Amazon Basin', 'Andes Spine', 'Mercosur Arc'],
    bounds: [-60, 15, -90, -30],
  },
  {
    key: 'oceania',
    label: 'Oceania',
    emoji: '🌊',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #047857)',
    description: 'Australasia, Melanesia, Micronesia, Polynesia',
    highlights: ['South Pacific', 'Coral Sea', 'Pacific Islands Forum'],
    bounds: [-50, 10, 110, 180],
  },
  {
    key: 'global',
    label: 'Global View',
    emoji: '🌐',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    description: 'All regions — complete UPSC strategic overview',
    highlights: ['All Straits', 'All Conflicts', 'All Resources'],
    isGlobal: true,
  },
]

function countForRegion(entries, region) {
  if (region.isGlobal) return entries.length
  const [minLat, maxLat, minLon, maxLon] = region.bounds
  return entries.filter(e =>
    e.lat != null && e.lon != null &&
    e.lat >= minLat && e.lat <= maxLat &&
    e.lon >= minLon && e.lon <= maxLon
  ).length
}

export default function PortalHome() {
  const [entries, setEntries] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/entries').then(r => r.json()).then(d => { setEntries(Array.isArray(d) ? d : []); setLoaded(true) }).catch(() => setLoaded(true))
  }, [])

  const entriesArr = Array.isArray(entries) ? entries : []
  const totalEntries = entriesArr.length
  const categories = [...new Set(entriesArr.map(e => e.category).filter(Boolean))].length
  const years = entriesArr.map(e => e.year).filter(Boolean)
  const yearRange = years.length ? `${Math.min(...years)}–${Math.max(...years)}` : '—'

  return (
    <>
      {!loaded && (
        <div className="neural-loading-overlay">
          <div className="neural-loader-content">
            <div className="strategic-pulse">
              <div className="pulse-ring ring-1" />
              <div className="pulse-ring ring-2" />
              <div className="pulse-ring ring-3" />
              <div className="pulse-core">🌏</div>
            </div>
            <div className="loading-text-stack">
              <div className="loading-kicker">Neural Intelligence</div>
              <div className="loading-title">Initializing Atlas...</div>
              <div className="loading-sub">Preparing geo-strategic regions for study</div>
            </div>
          </div>
          <style jsx>{`
            .neural-loading-overlay {
              position: fixed; inset: 0; z-index: 100000;
              background: var(--bg-primary); display: flex; align-items: center; justify-content: center;
              transition: opacity 0.5s ease-out;
            }
            .neural-loader-content { display: flex; flex-direction: column; align-items: center; gap: 40px; }
            
            .strategic-pulse { position: relative; width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; }
            .pulse-core { font-size: 3rem; z-index: 2; filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.5)); animation: coreRotate 10s linear infinite; }
            .pulse-ring { position: absolute; border: 2px solid #3b82f6; border-radius: 50%; opacity: 0; animation: ringPulse 3s cubic-bezier(0.21, 0.6, 0.35, 1) infinite; }
            .ring-1 { width: 100%; height: 100%; animation-delay: 0s; }
            .ring-2 { width: 100%; height: 100%; animation-delay: 1s; }
            .ring-3 { width: 100%; height: 100%; animation-delay: 2s; }
            
            @keyframes ringPulse {
              0% { transform: scale(0.5); opacity: 0; }
              50% { opacity: 0.5; }
              100% { transform: scale(2.5); opacity: 0; }
            }
            @keyframes coreRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

            .loading-text-stack { text-align: center; }
            .loading-kicker { font-size: 0.7rem; font-weight: 950; color: #3b82f6; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
            .loading-title { font-size: 1.5rem; font-weight: 900; color: var(--text-primary); margin-bottom: 4px; letter-spacing: -0.5px; }
            .loading-sub { font-size: 0.85rem; color: var(--text-muted); font-weight: 600; }
          `}</style>
        </div>
      )}

      <div style={{
      minHeight: '100vh', fontFamily: "var(--font-outfit), sans-serif",
      background: 'var(--bg-primary)',
    }}>
      {/* BG GLOW */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'var(--hero-bg-gradient)' }} />

      {/* HERO */}
      <div className="atlas-hero" style={{ position: 'relative', zIndex: 10, padding: '80px 48px 36px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '5px 14px', borderRadius: '20px', marginBottom: '18px',
          background: 'var(--bg-input)', border: '1px solid var(--border-color)',
        }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-blue)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
            UPSC 2024–2026 Preparation
          </span>
        </div>

        <h2 className="atlas-hero-title" style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 14px', letterSpacing: '-0.8px', lineHeight: 1.1 }}>
          Select Your Study Region
        </h2>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 36px', lineHeight: 1.6 }}>
          Geo-strategic locations, conflict zones, natural resources & maritime routes — annotated for UPSC Prelims & Mains.
        </p>

        {/* STATS */}
        <div className="atlas-stats-bar" style={{
          display: 'inline-flex', borderRadius: '14px', overflow: 'hidden',
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          marginBottom: '52px', flexWrap: 'wrap', justifyContent: 'center'
        }}>
          {[
            { val: loaded ? totalEntries : '…', label: 'Map Entries', isLoading: !loaded },
            { val: loaded ? categories : '…', label: 'Categories', isLoading: !loaded },
            { val: loaded ? yearRange : '…', label: 'Years', isLoading: !loaded },
            { val: REGIONS.length - 1, label: 'Regions', isLoading: false },
          ].map((s, i) => (
            <div key={i} className="atlas-stat-item" style={{
              padding: '14px 26px', borderRight: i < 3 ? '1px solid var(--border-color)' : 'none', textAlign: 'center',
            }}>
              {s.isLoading ? (
                <div className="skeleton-shimmer" style={{ width: '36px', height: '22px', margin: '0 auto 4px' }} />
              ) : (
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{s.val}</div>
              )}
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '3px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* REGION CARDS */}
      <div className="atlas-region-grid" style={{
        position: 'relative', zIndex: 10,
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
        gap: '18px', padding: '0 48px 80px', maxWidth: '1400px', margin: '0 auto',
      }}>
        {REGIONS.map(region => {
          const count = countForRegion(entries, region)
          return (
            <Link key={region.key} href={`/atlas/map?region=${region.key}`} style={{
              textDecoration: 'none',
              gridColumn: region.isGlobal ? '1 / -1' : 'auto',
            }}>
              <div className="region-card" style={{ '--accent': region.color }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px', fontSize: '22px',
                    background: region.gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 8px 20px ${region.color}44`,
                  }}>{region.emoji}</div>
                  {!loaded ? (
                    <div className="skeleton-shimmer" style={{ width: '70px', height: '22px', borderRadius: '20px' }} />
                  ) : count > 0 && (
                    <div style={{
                      padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800,
                      background: `${region.color}22`, color: region.color, border: `1px solid ${region.color}44`,
                    }}>{count} entries</div>
                  )}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 5px', letterSpacing: '-0.2px' }}>{region.label}</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.5 }}>{region.description}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {region.highlights.map(h => (
                    <span key={h} style={{
                      padding: '3px 9px', borderRadius: '20px', fontSize: '0.68rem', fontWeight: 600,
                      background: 'var(--bg-input)', color: 'var(--text-secondary)',
                      border: '1px solid var(--border-color)',
                    }}>{h}</span>
                  ))}
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <style jsx>{`
        .region-card {
          padding: 28px;
          height: 100%;
          background: var(--bg-card);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-color);
          border-radius: 28px;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .region-card:hover {
          transform: translateY(-8px) scale(1.02);
          background: var(--bg-hover);
          border-color: var(--border-hover);
          box-shadow: 0 30px 60px rgba(0,0,0,0.4);
        }

        .region-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top right, var(--accent), transparent 70%);
          opacity: 0.05;
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .atlas-hero {
            padding: 40px 20px 24px !important;
          }
          .atlas-hero-title {
            font-size: 2rem !important;
          }
          .atlas-stats-bar {
            width: 100%;
            border: none !important;
            background: transparent !important;
          }
          .atlas-stat-item {
            border: 1px solid var(--border-color) !important;
            border-radius: 12px;
            margin: 4px;
            flex: 1 1 140px;
          }
          .atlas-region-grid {
            padding: 0 20px 60px !important;
          }
        }
      `}</style>
      </div>
    </>
  )
}

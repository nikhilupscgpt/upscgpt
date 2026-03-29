"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'

const REGIONS = [
  {
    key: 'asia',
    label: 'Asia & Pacific',
    emoji: '🌏',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    description: 'South Asia, Southeast Asia, East Asia, Central Asia',
    highlights: ['Strait of Malacca', 'South China Sea', 'Himalayan Ecology'],
    // bounding box [minLat, maxLat, minLon, maxLon]
    bounds: [-10, 55, 60, 180],
  },
  {
    key: 'middle_east',
    label: 'Middle East',
    emoji: '🕌',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444, #b91c1c)',
    description: 'Gulf Region, Levant, Arabian Peninsula',
    highlights: ['Strait of Hormuz', 'Suez Canal', 'Yemen Conflict'],
    bounds: [10, 42, 25, 65],
  },
  {
    key: 'africa',
    label: 'Africa',
    emoji: '🌍',
    color: '#22c55e',
    gradient: 'linear-gradient(135deg, #22c55e, #15803d)',
    description: 'Sub-Saharan, North Africa, Horn of Africa',
    highlights: ['Horn of Africa', 'Sahel Crisis', 'Congo Basin'],
    bounds: [-35, 38, -20, 55],
  },
  {
    key: 'indian_ocean',
    label: 'Indian Ocean',
    emoji: '🌊',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    description: 'IOR Islands, Littoral States, Maritime Routes',
    highlights: ['Andaman Islands', 'Diego Garcia', 'IORA'],
    bounds: [-40, 25, 40, 100],
  },
  {
    key: 'europe',
    label: 'Europe',
    emoji: '🗺️',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #4338ca)',
    description: 'European Union, Eastern Europe, Arctic',
    highlights: ['Ukraine Conflict', 'Arctic Race', 'NATO Expansion'],
    bounds: [35, 72, -25, 45],
  },
  {
    key: 'americas',
    label: 'Americas',
    emoji: '🌎',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #047857)',
    description: 'Latin America, Caribbean, North America',
    highlights: ['Panama Canal', 'Amazon Rainforest', 'Caribbean Islands'],
    bounds: [-60, 60, -170, -30],
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
    fetch('/api/entries').then(r => r.json()).then(d => { setEntries(d); setLoaded(true) }).catch(() => setLoaded(true))
  }, [])

  const totalEntries = entries.length
  const categories = [...new Set(entries.map(e => e.category))].length
  const years = entries.map(e => e.year).filter(Boolean)
  const yearRange = years.length ? `${Math.min(...years)}–${Math.max(...years)}` : '—'

  return (
    <div style={{
      minHeight: '100vh', fontFamily: "'Outfit', sans-serif",
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
    }}>
      {/* BG GLOW */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 60%)' }} />

      {/* HEADER */}
      <header style={{
        position: 'relative', zIndex: 10, padding: '20px 48px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px', fontSize: '20px',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
          }}>🌍</div>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.3px' }}>Global Strategic Atlas</h1>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', margin: 0, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>UPSC Pedagogy Portal</p>
          </div>
        </div>
        <Link href="/admin" style={{
          padding: '8px 18px', borderRadius: '10px',
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', fontWeight: 600,
          textDecoration: 'none',
        }}>⚙️ Control Center</Link>
      </header>

      {/* HERO */}
      <div style={{ position: 'relative', zIndex: 10, padding: '50px 48px 36px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '5px 14px', borderRadius: '20px', marginBottom: '18px',
          background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
        }}>
          <span style={{ fontSize: '0.7rem', color: '#a5b4fc', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
            UPSC 2024–2026 Preparation
          </span>
        </div>

        <h2 style={{ fontSize: '2.8rem', fontWeight: 800, color: 'white', margin: '0 0 14px', letterSpacing: '-0.8px', lineHeight: 1.1 }}>
          Select Your Study Region
        </h2>
        <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.45)', maxWidth: '500px', margin: '0 auto 36px', lineHeight: 1.6 }}>
          Geo-strategic locations, conflict zones, natural resources & maritime routes — annotated for UPSC Prelims & Mains.
        </p>

        {/* STATS */}
        <div style={{
          display: 'inline-flex', borderRadius: '14px', overflow: 'hidden',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
          marginBottom: '52px',
        }}>
          {[
            { val: loaded ? totalEntries : '…', label: 'Map Entries' },
            { val: loaded ? categories : '…', label: 'Categories' },
            { val: loaded ? yearRange : '…', label: 'Years' },
            { val: REGIONS.length - 1, label: 'Regions' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '14px 26px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none', textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '3px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* REGION CARDS */}
      <div style={{
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
                  {loaded && count > 0 && (
                    <div style={{
                      padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800,
                      background: `${region.color}22`, color: region.color, border: `1px solid ${region.color}44`,
                    }}>{count} entries</div>
                  )}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', margin: '0 0 5px', letterSpacing: '-0.2px' }}>{region.label}</h3>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', margin: '0 0 16px', lineHeight: 1.5 }}>{region.description}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {region.highlights.map(h => (
                    <span key={h} style={{
                      padding: '3px 9px', borderRadius: '20px', fontSize: '0.68rem', fontWeight: 600,
                      background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}>{h}</span>
                  ))}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

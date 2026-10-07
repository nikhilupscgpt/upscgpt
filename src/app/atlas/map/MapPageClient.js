"use client"
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import NavSlot from '@/components/NavSlot'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import html2canvas from 'html2canvas'
import { useTranslation } from '@/context/TranslationContext'
import { jsPDF } from 'jspdf'

const MapWrapper = dynamic(() => import('../../../components/MapWrapper'), { ssr: false })
import AtlasTimeTracker from '../../../components/AtlasTimeTracker'
import NewsTicker from '../../../components/NewsTicker'
import OrgLens from '../../../components/OrgLens'

const REGION_CONFIG = {
  asia: {
    label: 'Asia',
    emoji: '🌏',
    center: [30, 80],
    zoom: 3,
    minZoom: 2,
    bounds: [[-12, 25], [60, 160]],
    continents: ['Asia'],
  },
  africa: {
    label: 'Africa',
    emoji: '🌍',
    center: [5, 20],
    zoom: 3,
    minZoom: 2,
    bounds: [[-35, -20], [38, 55]],
    continents: ['Africa'],
  },
  europe: {
    label: 'Europe',
    emoji: '🗺️',
    center: [50, 10],
    zoom: 4,
    minZoom: 3,
    bounds: [[34, -25], [72, 45]],
    continents: ['Europe'],
  },
  north_america: {
    label: 'North America',
    emoji: '🌎',
    center: [45, -100],
    zoom: 3,
    minZoom: 2,
    bounds: [[5, -170], [75, -50]],
    continents: ['North America'],
  },
  south_america: {
    label: 'South America',
    emoji: '🦜',
    center: [-15, -60],
    zoom: 3,
    minZoom: 2,
    bounds: [[-58, -90], [15, -30]],
    continents: ['South America'],
  },
  oceania: {
    label: 'Oceania',
    emoji: '🌊',
    center: [-25, 145],
    zoom: 3,
    minZoom: 2,
    bounds: [[-50, 110], [10, 180]],
    continents: ['Oceania'],
  },
  global: {
    label: 'Global View',
    emoji: '🌐',
    center: [20, 0],
    zoom: 2,
    minZoom: 2,
    bounds: [[-60, -180], [80, 180]],
    continents: [],
  },
}

function getContinentKey(value) {
  if (!value) return ''

  const normalized = value.toString().trim().toLowerCase()
  const aliasMap = {
    asia: 'asia',
    africa: 'africa',
    europe: 'europe',
    'north america': 'north_america',
    north_america: 'north_america',
    'northern america': 'north_america',
    'south america': 'south_america',
    south_america: 'south_america',
    oceania: 'oceania',
    global: 'global',
  }

  return aliasMap[normalized] || ''
}

function getRegionKeyContinentFilter(regionKey) {
  const region = REGION_CONFIG[regionKey] || REGION_CONFIG.global
  return region.continents || []
}

const CATEGORIES = [
  { key: 'mountain', label: 'Mountains & Peaks',   color: '#8b5cf6', emoji: '⛰️' },
  { key: 'strait',   label: 'Straits & Passes',    color: '#6366f1', emoji: '🌊' },
  { key: 'conflict', label: 'Conflict Zones',       color: '#ef4444', emoji: '⚔️' },
  { key: 'nature',   label: 'Nature & Ecology',     color: '#22c55e', emoji: '🌿' },
  { key: 'island',   label: 'Islands',              color: '#3b82f6', emoji: '🏝️' },
  { key: 'mineral',  label: 'Strategic Resources',  color: '#a855f7', emoji: '⛏️' },
  { key: 'river',    label: 'Rivers & Waterways',   color: '#818cf8', emoji: '🏞️' },
  { key: 'political',label: 'Strategic Nodes',     color: '#6366f1', emoji: '📍' },
  { key: 'country',  label: 'Nation States',        color: '#6366f1', emoji: '🏳️' },
  { key: 'port',     label: 'Strategic Ports',     color: '#818cf8', emoji: '⚓' },
  { key: 'base',     label: 'Military Bases',      color: '#ef4444', emoji: '🎖️' },
  { key: 'city',     label: 'Urban Centers',       color: '#818cf8', emoji: '🏙️' },
]

const BASEMAPS = [
  { key: 'natgeo',    label: '🗾 NatGeo',      sub: 'National Geographic' },
  { key: 'satellite', label: '🛰️ Satellite',    sub: 'ESRI Imagery' },
  { key: 'topo',      label: '⛰️ Topographic',   sub: 'Terrain & Relief' },
  { key: 'ocean',     label: '🌊 Ocean',         sub: 'Bathymetry' },
  { key: 'light',     label: '📄 Light',         sub: 'Academic Gray' },
]

const MAPBOT_ACTIONS = [
  { key: 'node_explainer', label: 'Node Explainer', requiresEntry: true },
  { key: 'region_tutor', label: 'Region Tutor', requiresEntry: false },
  { key: 'news_interpreter', label: 'News-to-Map', requiresEntry: false },
  { key: 'prelims_generator', label: 'Prelims Generator', requiresEntry: false },
]

const MAPBOT_CHAT_SUGGESTIONS = [
  'Why is this location important for India?',
  'Turn this into a 150-word mains answer.',
  'Give me 3 map-based prelims traps from here.',
]

async function requestMapBot(payload) {
  const res = await fetch('/api/mapbot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await res.json()
  if (!res.ok) {
    const error = new Error(data?.error || 'Nano could not respond.')
    error.status = res.status
    error.usage = data?.usage || null
    throw error
  }

  return data
}

async function requestMapBotChatUsage() {
  const res = await fetch('/api/mapbot?usage=chat')
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.error || 'Nano usage could not be loaded.')
  }

  return data?.usage || null
}



// ─── On-Map Floating Info Card (draggable) ──────────────────────────────────
function MapInfoCard({ 
  entry, 
  onClose, 
  onAskNano,
  mapbotLoading,
  mapbotResult,
  mapbotError,
}) {
  const { t, lang } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [pos, setPos] = useState({ x: null, y: null })
  const dragRef = useRef(null)

  const clamp = useCallback((x, y, cardW = 390, cardH = 680) => {
    if (typeof window === 'undefined') return { x, y }
    const pw = window.innerWidth
    const ph = window.innerHeight
    return {
      x: Math.min(Math.max(12, x), Math.max(12, pw - cardW - 12)),
      y: Math.min(Math.max(84, y), Math.max(84, ph - cardH - 12)),
    }
  }, [])

  const handlePointerDown = (e) => {
    if (e.target.closest('button, .drawer-scroll')) return
    const card = e.currentTarget.closest('.map-info-drawer')
    const rect = card.getBoundingClientRect()
    dragRef.current = {
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      pointerId: e.pointerId
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e) => {
    if (!dragRef.current || dragRef.current.pointerId !== e.pointerId) return
    setPos(clamp(e.clientX - dragRef.current.offsetX, e.clientY - dragRef.current.offsetY))
  }

  const handlePointerUp = (e) => {
    if (!dragRef.current) return
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch (err) {}
    dragRef.current = null
  }

  if (!entry) return null
  
  const getKPIs = () => [
    { label: 'UPSC WEIGHT', value: entry.year ? 'HIGH' : 'MEDIUM' },
    { label: 'INFRA', value: entry.category?.toUpperCase() || 'NODE' },
    { label: 'INTELLIGENCE', value: entry.newsMentions ? 'ACTIVE' : 'STATIC' }
  ]

  const kpis = getKPIs()
  const positionStyle = pos.x !== null ? { top: pos.y, left: pos.x, right: 'auto', bottom: 'auto' } : {}

  return (
    <div className="map-info-drawer" style={positionStyle}>
      <div 
        className="drawer-drag-handle"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="drawer-badge">
          <span className="badge-dot" style={{ background: '#4ade80' }}></span>
          ATLAS.{entry.category?.toUpperCase() || 'NODE'}
        </div>
        <button className="drawer-close" onClick={onClose}>✕</button>
      </div>

      <div className="drawer-scroll hide-scrollbar">
        <div className="drawer-hero">
          <h2 className="drawer-title">{entry[`name_${lang}`] || entry.name}</h2>
          <p className="drawer-subtitle">
            {entry.geoGroup || 'STRATEGIC NODE'} • {entry.continent || 'GLOBAL'}
          </p>
        </div>

        <div className="drawer-kpi-grid">
          {kpis.map((kpi, i) => (
            <div key={i} className="kpi-card">
              <div className="kpi-value" style={{ color: '#3b82f6' }}>{kpi.value}</div>
              <div className="kpi-label">{kpi.label}</div>
            </div>
          ))}
        </div>

        <div className="drawer-tabs">
          {['overview', 'links', 'pyq', 'news', 'nano'].map(tab => (
            <button 
              key={tab} 
              className={`drawer-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'nano' ? '🤖 Nano' : tab}
            </button>
          ))}
        </div>

        <div className="drawer-main-content">
          {activeTab === 'overview' && (
            <div className="fade-in">
              <div className="upsc-context-box">
                <div className="box-header">⚡ UPSC EXAM CONTEXT</div>
                <p className="drawer-text">{entry[`prelims_${lang}`] || entry.prelims || 'Analysis pending.'}</p>
              </div>
              
              {entry.india && (
                <div style={{ marginBottom: '24px' }}>
                  <div className="section-kicker">🇮🇳 INDIA'S ROLE</div>
                  <div className="india-role-badge">Verified Strategic Partner</div>
                  <p className="drawer-text" style={{ marginTop: '10px' }}>{entry[`india_${lang}`] || entry.india}</p>
                </div>
              )}

              {entry.mains && (
                <div>
                  <div className="section-kicker">📝 MAINS PERSPECTIVE</div>
                  <p className="drawer-text">{entry[`mains_${lang}`] || entry.mains}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'links' && (
            <div className="fade-in">
              <div className="section-kicker">SYLLABUS TAGS</div>
              <div className="drawer-tags">
                {(entry.tags || '').split(',').map(tag => tag.trim()).filter(Boolean).map(tag => (
                  <span key={tag} className="drawer-tag">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'news' && (
            <div className="fade-in">
              <div className="section-kicker">INTEL LOGS</div>
              {entry.newsMentions ? (
                <div className="drawer-markdown">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{entry.newsMentions}</ReactMarkdown>
                </div>
              ) : (
                <p className="drawer-text-subtle">No recent news mentions recorded.</p>
              )}
            </div>
          )}
          
          {activeTab === 'nano' && (
            <div className="fade-in">
              <div className="section-kicker">AI INTELLIGENCE</div>
              {mapbotLoading ? (
                <div className="nano-loading">
                  <div className="nano-pulse"></div>
                  Nano is analyzing this node for UPSC...
                </div>
              ) : mapbotResult ? (
                <div className="nano-result">
                  <div className="nano-result-title">{mapbotResult.title}</div>
                  <div className="drawer-markdown">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{mapbotResult.markdown}</ReactMarkdown>
                  </div>
                  {mapbotResult.suggestedFollowups && (
                    <div className="nano-followups">
                      {mapbotResult.suggestedFollowups.slice(0,3).map(f => (
                        <div key={f} className="nano-followup-item">🎯 {f}</div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="nano-empty">
                  <p className="drawer-text">Click the "Ask AI" button below to generate a real-time strategic breakdown of this location.</p>
                </div>
              )}
              {mapbotError && <div className="nano-error">{mapbotError}</div>}
            </div>
          )}
        </div>
      </div>

      <div className="drawer-footer">
        <button className="btn-drawer-primary" onClick={() => window.open(`/atlas/node/${entry.id}`, '_blank')}>
          Open Full Node
        </button>
        <button className="btn-drawer-outline" onClick={() => { setActiveTab('nano'); onAskNano(); }}>
          Ask AI
        </button>
      </div>

      <style jsx>{`
        .map-info-drawer {
          position: absolute;
          top: 100px;
          right: 32px;
          width: 390px;
          height: 680px;
          background: var(--bg-card);
          backdrop-filter: blur(40px);
          border: 1px solid var(--border-color);
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          z-index: 9000;
          box-shadow: 0 40px 100px rgba(0,0,0,0.8);
          overflow: hidden;
          color: var(--text-primary);
          font-family: 'Outfit', sans-serif;
          letter-spacing: 0.01em;
        }

        .drawer-drag-handle { 
          padding: 24px 24px 12px; 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          cursor: grab;
          user-select: none;
        }
        .drawer-drag-handle:active { cursor: grabbing; }

        .drawer-badge {
          display: flex; align-items: center; gap: 8px; padding: 6px 14px;
          background: var(--bg-input); border: 1px solid var(--border-color);
          border-radius: 100px; font-size: 0.65rem; font-weight: 900; letter-spacing: 0.5px;
          color: var(--text-secondary);
        }
        .badge-dot { width: 6px; height: 6px; border-radius: 50%; }

        .drawer-close {
          background: var(--bg-input); border: none; color: var(--text-muted);
          width: 28px; height: 28px; border-radius: 50%; cursor: pointer;
        }

        .drawer-scroll { flex: 1; overflow-y: auto; padding: 0 24px; margin-bottom: 8px; min-height: 0; }

        .drawer-hero { margin-bottom: 24px; }
        .drawer-title { font-size: 1.8rem; font-weight: 900; margin-bottom: 4px; line-height: 1.2; letter-spacing: -0.03em; color: var(--text-primary); }
        .drawer-subtitle { font-size: 0.75rem; color: var(--text-muted); font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }

        .drawer-kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 24px; }
        .kpi-card {
          background: var(--bg-input); border: 1px solid var(--border-color);
          border-radius: 16px; padding: 18px 8px; text-align: center;
        }
        .kpi-value { font-size: 1rem; font-weight: 900; color: var(--color-blue); margin-bottom: 4px; }
        .kpi-label { font-size: 0.55rem; font-weight: 900; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }

        .drawer-tabs { display: flex; border-bottom: 1px solid var(--border-color); margin-bottom: 20px; gap: 24px; }
        .drawer-tab {
          padding: 12px 0; background: none; border: none; color: var(--text-muted);
          font-size: 0.75rem; font-weight: 900; cursor: pointer; position: relative;
          text-transform: uppercase; letter-spacing: 0.1em; transition: color 0.2s;
        }
        .drawer-tab.active { color: var(--text-primary); }
        .drawer-tab.active::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; background: var(--color-blue); }

        .upsc-context-box {
          background: rgba(245, 158, 11, 0.08); border: 1px solid var(--border-color);
          border-radius: 16px; padding: 20px; margin-bottom: 20px;
        }
        .box-header { font-size: 0.65rem; font-weight: 900; color: var(--color-blue); letter-spacing: 1px; margin-bottom: 10px; }

        .section-kicker { font-size: 0.65rem; font-weight: 900; color: var(--color-blue); letter-spacing: 1px; margin-bottom: 12px; }
        .drawer-text { font-size: 1.05rem; line-height: 1.7; color: var(--text-primary); font-weight: 500; }
        
        .drawer-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .drawer-tag {
          font-size: 0.7rem; font-weight: 900; padding: 6px 12px;
          background: var(--bg-input); color: var(--text-secondary);
          border-radius: 10px; border: 1px solid var(--border-color);
        }

        .india-role-badge { 
          display: inline-block; padding: 4px 10px; background: rgba(16, 185, 129, 0.1); 
          color: var(--color-emerald); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 6px;
          font-size: 0.65rem; font-weight: 900;
        }

        .drawer-footer {
          padding: 20px 24px 24px; background: var(--bg-secondary); border-top: 1px solid var(--border-color);
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: auto;
        }

        .btn-drawer-primary {
          background: linear-gradient(135deg, #6366f1, #3b82f6); color: #fff; border: none; padding: 16px;
          border-radius: 14px; font-weight: 900; font-size: 0.85rem; cursor: pointer;
          box-shadow: 0 4px 15px rgba(217, 119, 6, 0.3); transition: all 0.2s;
        }
        .btn-drawer-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(217, 119, 6, 0.5); }

        .btn-drawer-outline {
          background: var(--bg-input); color: var(--text-primary); border: 1px solid var(--border-color);
          padding: 16px; border-radius: 14px; font-weight: 900; font-size: 0.85rem; cursor: pointer;
          transition: all 0.2s;
        }
        .btn-drawer-outline:hover { border-color: #6366f1; background: rgba(99, 102, 241, 0.08); color: #818cf8; }

        .nano-loading {
          padding: 30px 0; text-align: center; color: #818cf8; font-weight: 700; font-size: 0.9rem;
          display: flex; flex-direction: column; align-items: center; gap: 15px;
        }
        .nano-pulse {
          width: 40px; height: 40px; border-radius: 50%; background: #6366f1;
          animation: pulse 1.5s infinite; opacity: 0.5;
        }
        @keyframes pulse { 0% { transform: scale(0.8); opacity: 0.5; } 50% { transform: scale(1.2); opacity: 0.2; } 100% { transform: scale(0.8); opacity: 0.5; } }
        
        .nano-result-title { font-size: 1.1rem; font-weight: 800; color: var(--text-primary); margin-bottom: 12px; }
        .nano-followups { margin-top: 20px; display: flex; flex-direction: column; gap: 8px; }
        .nano-followup-item { font-size: 0.75rem; color: #818cf8; font-weight: 700; background: rgba(99, 102, 241, 0.05); padding: 8px 12px; border-radius: 8px; }
        .nano-error { color: #ef4444; font-size: 0.8rem; margin-top: 10px; }

        .fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 768px) {
          .map-info-drawer { width: 100% !important; top: auto !important; right: 0 !important; left: 0 !important; bottom: 0 !important; height: 75vh !important; border-radius: 20px 20px 0 0 !important; }
        }
      `}</style>
    </div>
  )
}

function MapPageInner() {
  const { t, lang } = useTranslation()
  const searchParams = useSearchParams()
  const regionKey = searchParams.get('region') || 'global'
  const region = REGION_CONFIG[regionKey] || REGION_CONFIG.global

  const [entries, setEntries] = useState([])
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [layers, setLayers] = useState({
    base: 'natgeo', mountain: true, strait: true, conflict: true, nature: true, island: true, mineral: true, political: true, 
    country: true, port: true, base: true, city: true, graticules: true
  })
  const [activeTag, setActiveTag] = useState('')
  const [activeYear, setActiveYear] = useState('')
  const [activeModule, setActiveModule] = useState('POLITICAL') // POLITICAL, PHYSICAL, NEWS
  const [activeContinent, setActiveContinent] = useState('')
  const [activeAdmRegion, setActiveAdmRegion] = useState('')
  const [activeGeoGroup, setActiveGeoGroup] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileSheetTab, setMobileSheetTab] = useState('explore')
  const [heatmapMode, setHeatmapMode] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [timeFilter, setTimeFilter] = useState('all') // 'all', 'today', 'month'
  const [mapbotMode, setMapbotMode] = useState('region_tutor')
  const [mapbotResult, setMapbotResult] = useState(null)
  const [mapbotLoading, setMapbotLoading] = useState(false)
  const [mapbotError, setMapbotError] = useState('')
  const [mapbotPanelOpen, setMapbotPanelOpen] = useState(false)
  const [mapbotPanelMinimized, setMapbotPanelMinimized] = useState(false)
  const [mapbotActiveTab, setMapbotActiveTab] = useState('context')
  const [infoCardOpen, setInfoCardOpen] = useState(false) // controls MapInfoCard visibility independently
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatUsage, setChatUsage] = useState(null)
  const [discoveryAnchors, setDiscoveryAnchors] = useState([])
  const [practiceHooks, setPracticeHooks] = useState([])
  const [activeOrg, setActiveOrg] = useState(null)
  const [intelSubLayer, setIntelSubLayer] = useState('ZONES') // 'ZONES' | 'ORGS'

  const mapRef = useRef(null)
  const exportRef = useRef(null)
  const lastAutoExplainedEntryRef = useRef(null)

  const entriesArr = Array.isArray(entries) ? entries : []
  const regionContinentFilter = getRegionKeyContinentFilter(regionKey)
  const activeContinentKey = activeModule === 'POLITICAL'
    ? (activeContinent || (regionKey !== 'global' ? regionKey : ''))
    : ''
  const allTags = [...new Set(entriesArr.flatMap(e => e.tags ? e.tags.split(',').map(t => t.trim()) : []))].filter(Boolean).sort()
  const allYears = [...new Set(entriesArr.map(e => e.year).filter(Boolean))].sort((a, b) => b - a)

  const filteredEntries = entriesArr.filter(e => {
    if (e.worldPart !== activeModule) return false
    const entryContinentKey = getContinentKey(e.continent)
    if (activeContinentKey && entryContinentKey !== activeContinentKey) return false
    if (!activeContinentKey && regionContinentFilter.length > 0 && !regionContinentFilter.includes(e.continent)) return false

    if (activeAdmRegion) {
      if (activeAdmRegion === 'OTHER') {
        if (e.admRegion && e.admRegion !== "") return false
      } else {
        if (e.admRegion !== activeAdmRegion) return false
      }
    }
    
    if (activeGeoGroup && e.geoGroup !== activeGeoGroup) return false
    if (activeTag && (!e.tags || !e.tags.split(',').map(t => t.trim()).includes(activeTag))) return false
    if (activeYear && e.year !== null && e.year !== parseInt(activeYear)) return false
    if (searchQuery && !e.name?.toLowerCase().includes(searchQuery.toLowerCase())) return false

    if (timeFilter !== 'all') {
      if (!e.lastNewsDate) return false
      const diffDays = (new Date() - new Date(e.lastNewsDate)) / (1000 * 60 * 60 * 24)
      if (timeFilter === 'today' && diffDays > 1) return false
      if (timeFilter === 'month' && diffDays > 30) return false
    }
    return true
  })

  // Dedicate entries for the map: Filter by categories/tags/module but NOT by sub-region or search
  // (Visibility is handled inside Map.js for sub-region/search)
  const mapFilteredEntries = entriesArr.filter(e => {
    if (e.worldPart !== activeModule) return false
    const entryContinentKey = getContinentKey(e.continent)
    if (activeContinentKey && entryContinentKey !== activeContinentKey) return false
    
    if (activeTag && (!e.tags || !e.tags.split(',').map(t => t.trim()).includes(activeTag))) return false
    if (activeYear && e.year !== null && e.year !== parseInt(activeYear)) return false
    
    return true
  })


  const exportPDF = async () => {
    setIsExporting(true)
    const el = exportRef.current
    const wm = document.getElementById('pdf-watermark')
    if (wm) wm.style.display = 'flex'
    
    // Give DOM a frame to show the watermark
    await new Promise(r => setTimeout(r, 150))
    
    try {
      const canvas = await html2canvas(el, { useCORS: true, allowTaint: false, backgroundColor: '#e2e8f0' })
      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      })
      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height)
      pdf.save(`UPSC_Atlas_${regionKey}.pdf`)
    } catch (err) {
      console.error('PDF Export failed', err)
    }
    
    if (wm) wm.style.display = 'none'
    setIsExporting(false)
  }

  const exportDailySummary = () => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>UPSCGPT - Daily Strategic Intel</title>
          <style>
             body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; max-width: 800px; margin: 0 auto; }
             h1 { color: #0f172a; border-bottom: 3px solid #0ea5e9; padding-bottom: 10px; font-weight: 800; font-size: 2.2rem; margin-bottom: 5px; }
             h2 { color: #6366f1; margin-top: 30px; font-weight: 800; }
             .subtitle { color: #64748b; font-size: 0.95rem; margin-top: 0; margin-bottom: 30px; }
             .entry { background: #f8fafc; border-left: 4px solid #6366f1; padding: 25px; margin-bottom: 30px; border-radius: 0 8px 8px 0; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
             .meta { font-size: 0.8rem; color: #64748b; margin-bottom: 15px; font-family: monospace; background: #e2e8f0; display: inline-block; padding: 3px 8px; border-radius: 4px;}
             .mains { margin-top: 20px; background: white; padding: 20px; border-radius: 6px; border: 1px dashed #cbd5e1; }
             .crux { margin-top: 20px; }
             .crux a { color: #0ea5e9; text-decoration: none; font-weight: 600; }
             @media print { body { padding: 0; } .entry { break-inside: avoid; } }
          </style>
        </head>
        <body>
          <h1>UPSCGPT Global Strategic Intel</h1>
          <p class="subtitle">Daily Autonomous Assessment Report - ${new Date().toLocaleDateString()}</p>
          ${filteredEntries.map(entry => `
            <div class="entry">
              <h2 style="margin-top: 0">${entry.name} <span style="font-size: 0.9rem; color: #94a3b8">(${entry.category.toUpperCase()})</span></h2>
              <div class="meta">📌 ${entry.lat ? Number(entry.lat).toFixed(4) : 'N/A'}°, ${entry.lon ? Number(entry.lon).toFixed(4) : 'N/A'}°</div>
              <div class="mains">
                 <strong style="color: #475569; font-size: 0.85rem; text-transform: uppercase;">Mains Geography Background</strong><br/>
                 <div style="margin-top: 8px;">${entry.mains ? entry.mains.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>') : 'No static context available.'}</div>
              </div>
              <div class="crux">
                <strong style="color: #0284c7; font-size: 0.85rem; text-transform: uppercase;">24-Hour AI Intel Crux</strong><br/>
                <div style="margin-top: 8px;">${entry.newsMentions ? entry.newsMentions.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>') : 'No recent news.'}</div>
              </div>
            </div>
          `).join('')}
          <div style="text-align: center; margin-top: 40px; color: #94a3b8; font-size: 0.8rem;">
             Generated autonomously by Gemini 1.5 Flash for UPSCGPT.
          </div>
          <script>
            window.onload = () => { window.print(); setTimeout(() => window.close(), 500); }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  useEffect(() => {
    fetch('/api/entries')
      .then(r => r.json())
      .then(d => { setEntries(Array.isArray(d) ? d : []); setIsDataLoading(false) })
      .catch(() => { setEntries([]); setIsDataLoading(false) })
  }, [])

  useEffect(() => {
    setIsMounted(true)
    const syncViewport = () => {
      const nextIsMobile = window.innerWidth <= 768
      setIsMobile(nextIsMobile)
    }

    syncViewport()
    window.addEventListener('resize', syncViewport)
    return () => window.removeEventListener('resize', syncViewport)
  }, [])

  useEffect(() => {
    if (!isMobile) return
    setSidebarOpen(false)
    setMapbotPanelOpen(true)
    setMapbotPanelMinimized(true)
  }, [isMobile])

  useEffect(() => {
    if (!isMobile || !sidebarOpen) return
    setMapbotPanelMinimized(true)
  }, [isMobile, sidebarOpen])

  useEffect(() => {
    if (!isMobile || !mapbotPanelOpen || mapbotPanelMinimized) return
    setSidebarOpen(false)
  }, [isMobile, mapbotPanelMinimized, mapbotPanelOpen])

  const focusEntryOnMap = (entry, options = {}) => {
    if (!entry) return

    const {
      module = entry.worldPart || activeModule,
      useLightBase = false,
      clearOrganization = true,
    } = options

    setActiveModule(module)
    setActiveAdmRegion('')
    setActiveGeoGroup('')

    if (clearOrganization) {
      setActiveOrg(null)
    }

    if (useLightBase) {
      setLayers(prev => ({ ...prev, base: 'light' }))
    }

    handleSelectEntry(entry)

    if (entry.lat != null && entry.lon != null) {
      window.setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.flyTo([entry.lat, entry.lon], 6)
        }
      }, 80)
    }
  }

  const focusOrganizationOnMap = (org) => {
    setActiveModule('INTELLIGENCE')
    setIntelSubLayer('ORGS')
    setActiveAdmRegion('')
    setActiveGeoGroup('')
    setSelectedEntry(null)
    setInfoCardOpen(false)
    setLayers(prev => ({ ...prev, base: 'light' }))
    setActiveOrg(org)
  }

  const handleSelectEntry = (entry) => {
    setSelectedEntry(entry)
    if (entry) {
      setInfoCardOpen(true)
      // Allow Nano panel and Info card to coexist for advanced research
    } else {
      setInfoCardOpen(false)
    }
  }

  const runMapBot = async (mode, entryOverride = null) => {
    const entry = entryOverride || selectedEntry
    const action = MAPBOT_ACTIONS.find(item => item.key === mode)

    if (action?.requiresEntry && !entry) {
      setMapbotError('Select a map node first to run the node explainer.')
      setMapbotMode(mode)
      return
    }

    setMapbotLoading(true)
    setMapbotError('')
    setMapbotResult(null) // Clear previous result
    setMapbotMode(mode)
    setMapbotActiveTab('context')
    setMapbotPanelOpen(true)
    setMapbotPanelMinimized(false)
    // Removed setInfoCardOpen(false) to allow co-existence
    if (isMobile) {
      setSidebarOpen(false)
    }

    try {
      const data = await requestMapBot({
        mode,
        regionKey,
        lang,
        entryId: entry?.id || null,
        entriesSnapshot: filteredEntries.slice(0, 80),
        selectedEntrySnapshot: entry || null,
      })
      console.log('[MapBot] Data received:', data);
      setMapbotResult({ ...data }); // Force a fresh object to trigger re-render
    } catch (error) {
      setMapbotError(error.message || 'Nano could not respond.')
    } finally {
      setMapbotLoading(false)
    }
  }

  const sendMapBotChat = async () => {
    const prompt = chatInput.trim()
    if (!prompt) return

    const nextMessages = [...chatMessages, { role: 'user', content: prompt }]
    setChatMessages(nextMessages)
    setChatInput('')
    setChatLoading(true)
    setMapbotPanelOpen(true)
    setMapbotPanelMinimized(false)
    setMapbotActiveTab('chat')
    setInfoCardOpen(false) // dismiss info card when chatting starts
    if (isMobile) {
      setSidebarOpen(false)
    }

    try {
      const data = await requestMapBot({
        mode: 'chat',
        regionKey,
        lang,
        entryId: selectedEntry?.id || null,
        userPrompt: prompt,
        chatHistory: nextMessages,
        entriesSnapshot: filteredEntries.slice(0, 80),
        selectedEntrySnapshot: selectedEntry || null,
      })
      if (data.usage) {
        setChatUsage(data.usage)
      }
      setChatMessages([...nextMessages, { role: 'assistant', content: data.markdown || 'No response returned.' }])
    } catch (error) {
      if (error.usage) {
        setChatUsage(error.usage)
      }
      setChatMessages([
        ...nextMessages,
        { role: 'assistant', content: error.message || 'Nano could not respond.' },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  // Removed autoExplain effect so Nano isn't opened automatically

  useEffect(() => {
    setMapbotError('')
    setMapbotResult(null)
    setMapbotMode('region_tutor')
    setMapbotActiveTab('context')
    setChatUsage(null)
    setMobileSheetTab('explore')
    setActiveContinent(regionKey !== 'global' ? regionKey : '')
    setActiveAdmRegion('')
    setActiveGeoGroup('')
    lastAutoExplainedEntryRef.current = null
  }, [regionKey])

  useEffect(() => {
    if (!mapbotPanelOpen || mapbotActiveTab !== 'chat' || chatUsage || chatLoading) return

    let active = true

    const loadChatUsage = async () => {
      try {
        const usage = await requestMapBotChatUsage()
        if (active) {
          setChatUsage(usage)
        }
      } catch {
        // Quietly skip the quota hint if the usage fetch fails.
      }
    }

    loadChatUsage()

    return () => {
      active = false
    }
  }, [chatLoading, chatUsage, mapbotActiveTab, mapbotPanelOpen])

  const toggleLayer = (layer) => setLayers(prev => ({ ...prev, [layer]: !prev[layer] }))

  const filtersActive = activeTag || activeYear || searchQuery
  const categoryCount = (key) => entries.filter(e => e.category === key).length

  return (
    <>
      {isDataLoading && (
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
              <div className="loading-title">Initializing Strategic Graph...</div>
              <div className="loading-sub">Syncing regional nodes and conflict flashpoints</div>
            </div>
          </div>
          <style jsx>{`
            .neural-loading-overlay {
              position: fixed; inset: 0; z-index: 100000;
              background: #020617; display: flex; align-items: center; justify-content: center;
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
            .loading-title { font-size: 1.5rem; font-weight: 900; color: white; margin-bottom: 4px; letter-spacing: -0.5px; }
            .loading-sub { font-size: 0.85rem; color: #64748b; font-weight: 600; }
          `}</style>
        </div>
      )}

    <div className={`portal-container ${isExporting ? 'exporting' : ''}`} ref={exportRef}>
      <NavSlot />
      
      <div className="portal-layout">
        
        {/* STRATEGIC NAVIGATOR - Sidebar on Desktop, Bottom Sheet on Mobile */}
        <aside className={`portal-sidebar ${sidebarOpen ? 'open' : 'closed'} ${isMobile ? 'mobile-sheet' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-brand">
              <span className="region-icon">{region.emoji}</span>
              <div>
                <div className="sidebar-kicker">{t('atlas.navigator')}</div>
                <div className="sidebar-title">{t(`atlas.${region.key}`) !== `atlas.${region.key}` ? t(`atlas.${region.key}`) : region.label}</div>
              </div>
            </div>
            {!isMobile ? (
              <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? '❮' : '❯'}
              </button>
            ) : (
              <button className="sidebar-close-mobile" onClick={() => setSidebarOpen(false)}>
                DONE ✕
              </button>
            )}
          </div>

          <div className="sidebar-tabs">
            {[
              { key: 'POLITICAL', label: t('atlas.political'), emoji: '🏛️' },
              { key: 'PHYSICAL',  label: t('atlas.physical'),  emoji: '⛰️' },
              { key: 'INTELLIGENCE', label: t('atlas.intel'),    emoji: '📡' },
              { key: 'NEWS',      label: t('atlas.news'),     emoji: '🗞️' },
            ].map(m => (
              <button 
                key={m.key} 
                className={`sidebar-tab ${activeModule === m.key ? 'active' : ''}`}
                onClick={() => {
                  setActiveModule(m.key);
                  setActiveAdmRegion('');
                  setActiveGeoGroup('');
                  setActiveOrg(null);
                }}
              >
                <span className="tab-emoji">{m.emoji}</span> {m.label}
              </button>
            ))}
          </div>

          <div className="sidebar-scroll hide-scrollbar">
            {/* SEARCH BOX */}
            <div className="search-container">
              <input 
                placeholder={t('atlas.searchNodes', { region: t(`atlas.${region.key}`) !== `atlas.${region.key}` ? t(`atlas.${region.key}`) : region.label })} 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
              />
            </div>

            {/* BREADCRUMBS */}
            <div className="strategic-path">
              <button onClick={() => { setActiveContinent(''); setActiveAdmRegion(''); }}>World</button>
              {activeContinentKey && (
                <>
                  <span className="path-sep">/</span>
                  <button onClick={() => setActiveAdmRegion('')}>{t(`atlas.${activeContinentKey}`) !== `atlas.${activeContinentKey}` ? t(`atlas.${activeContinentKey}`) : (REGION_CONFIG[activeContinentKey]?.label || activeContinentKey)}</button>
                </>
              )}
              {activeAdmRegion && (
                <>
                  <span className="path-sep">/</span>
                  <span className="path-active">{activeAdmRegion}</span>
                </>
              )}
            </div>

            {/* NAVIGATION ENGINE */}
            <div className="navigator-engine">
              {activeModule === 'POLITICAL' && !activeContinentKey && (
                <div className="continent-grid">
                  {Object.entries(REGION_CONFIG).filter(([k]) => k !== 'global').map(([key, cfg]) => (
                    <button key={key} className="continent-tile" onClick={() => setActiveContinent(key)}>
                      <span className="tile-emoji">{cfg.emoji}</span>
                      <span className="tile-label">{cfg.label}</span>
                      <span className="tile-cta">EXPLORE REGION</span>
                    </button>
                  ))}
                </div>
              )}

              {/* INTELLIGENCE MODULE: Organization Lens & Conflict Heatmap */}
              {activeModule === 'INTELLIGENCE' && (
                <div className="intelligence-engine fade-in">
                  <div className="engine-card heatmap-toggle-card">
                    <div className="card-header">
                      <span className="card-emoji">🔥</span>
                      <div className="card-meta">
                        <div className="card-title">Conflict Intensity</div>
                        <div className="card-sub">Global Heatmap Visualization</div>
                      </div>
                      <label className="ios-switch">
                        <input 
                          type="checkbox" 
                          checked={heatmapMode} 
                          onChange={() => setHeatmapMode(!heatmapMode)} 
                        />
                        <span className="switch-slider"></span>
                      </label>
                    </div>
                    <p className="card-description">
                      Visualize active conflict zones, military flashpoints, and territorial disputes using neural density analysis.
                    </p>
                  </div>

                  <OrgLens
                    onOrgSelect={(org) => {
                      if (org) {
                        focusOrganizationOnMap(org);
                      } else {
                        setActiveOrg(null);
                      }
                    }}
                    activeOrg={activeOrg}
                  />
                </div>
              )}

              {/* DYNAMIC LISTS (REGION/COUNTRY) */}
              {(activeContinentKey || activeModule === 'PHYSICAL') && (
                <div className="entry-list">
                  {filteredEntries.map(e => (
                    <button 
                      key={e.id} 
                      className={`entry-item ${selectedEntry?.id === e.id ? 'active' : ''}`}
                      onClick={() => {
                        focusEntryOnMap(e, { module: activeModule, useLightBase: false });
                        if (isMobile) setSidebarOpen(false);
                      }}
                    >
                      <span className="entry-emoji">{CATEGORIES.find(c => c.key === e.category)?.emoji || '📍'}</span>
                      <div className="entry-info">
                        <div className="entry-name">{e[`name_${lang}`] || e.name}</div>
                        <div className="entry-sub">{e[`geoGroup_${lang}`] || e.geoGroup || 'Strategic Node'}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* BASEMAP CONTROLS */}
            <div className="basemap-section">
              <div className="section-label">{t('atlas.basemap')}</div>
              <div className="basemap-grid">
                {BASEMAPS.map(b => (
                  <button 
                    key={b.key} 
                    className={`basemap-tile ${layers.base === b.key ? 'active' : ''}`}
                    onClick={() => setLayers(p => ({ ...p, base: b.key }))}
                  >
                    <span className="tile-icon">{b.emoji}</span>
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* MAP CANVAS */}
        <main className="map-view">
          <MapWrapper 
            entries={mapFilteredEntries} 
            layers={layers}
            mapRef={mapRef}
            initialCenter={region.center}
            initialZoom={region.zoom}
            initialMinZoom={region.minZoom}
            maxBounds={region.maxBounds}
            onEntrySelect={(e) => {
              setSelectedEntry(e);
              if (e) setInfoCardOpen(true);
              if (isMobile) setSidebarOpen(false);
            }}
            heatmapMode={heatmapMode}
            selectedEntry={selectedEntry}
            activeContinent={activeContinentKey}
            activeAdmRegion={activeAdmRegion}
            searchQuery={searchQuery}
            activeOrg={activeOrg}
            regionConfig={REGION_CONFIG}
          />

          {/* MOBILE NAV TRIGGER */}
          {isMobile && !sidebarOpen && (
            <button className="mobile-nav-fab" onClick={() => setSidebarOpen(true)}>
              🗺️ <span>SELECT REGION</span>
            </button>
          )}

          {infoCardOpen && selectedEntry && (
            <MapInfoCard 
              entry={selectedEntry} 
              onClose={() => { setInfoCardOpen(false); setSelectedEntry(null); }}
              onAskNano={() => runMapBot('node_explainer')}
              mapbotLoading={mapbotLoading}
              mapbotResult={mapbotResult}
              mapbotError={mapbotError}
            />
          )}



          <NewsTicker regionKey={regionKey} />
          <AtlasTimeTracker regionKey={regionKey} />
        </main>
      </div>

      <style jsx>{`
        .portal-container { 
          height: calc(100vh - 72px); 
          background: var(--bg-primary); 
          display: flex; 
          flex-direction: column; 
          overflow: hidden; 
          font-family: 'Outfit', sans-serif;
          padding-top: 0;
        }
        .portal-layout { flex: 1; display: flex; position: relative; overflow: hidden; }

        /* SIDEBAR / BOTTOM SHEET */
        .portal-sidebar {
          width: 360px;
          height: 100%;
          background: var(--bg-card);
          backdrop-filter: blur(40px);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          position: relative;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
          letter-spacing: 0.01em;
          line-height: 1.6;
        }
        .portal-sidebar.closed { width: 0; transform: translateX(-100%); }

        .sidebar-header { padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; }
        .sidebar-brand { display: flex; gap: 16px; align-items: center; }
        .region-icon { font-size: 2.2rem; background: var(--bg-input); padding: 12px; border-radius: 16px; border: 1px solid var(--border-color); }
        .sidebar-title { font-size: 1.5rem; font-weight: 950; color: var(--text-primary); letter-spacing: -0.02em; }
        .sidebar-kicker { font-size: 0.65rem; font-weight: 900; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1.5px; }
        
        .sidebar-tabs { display: grid; grid-template-columns: repeat(4, 1fr); padding: 0 1.25rem 1.5rem; gap: 10px; }
        .sidebar-tab { 
          padding: 14px 4px; border: 1px solid var(--border-color); 
          background: var(--bg-input); color: var(--text-secondary); 
          font-size: 0.62rem; font-weight: 800; border-radius: 16px; cursor: pointer; 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          text-transform: uppercase; letter-spacing: 0.8px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .tab-emoji { font-size: 1.6rem; transition: transform 0.2s; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3)); }
        
        .sidebar-tab:hover { 
          background: var(--bg-hover); 
          color: var(--text-primary); 
          border-color: var(--border-hover);
          transform: translateY(-2px);
        }
        .sidebar-tab.active { 
          background: linear-gradient(135deg, #2563eb, #1d4ed8); 
          color: white; 
          border-color: #60a5fa;
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
        }
        .sidebar-tab.active .tab-emoji { transform: scale(1.1); filter: drop-shadow(0 0 8px rgba(255,255,255,0.4)); }

        .sidebar-scroll { flex: 1; overflow-y: auto; padding: 1rem 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
        
        .search-container input {
          width: 100%; padding: 12px 16px; border-radius: 12px; background: var(--bg-input);
          border: 1px solid var(--border-color); color: var(--text-primary); font-size: 0.85rem; outline: none;
        }

        .strategic-path { 
          display: flex; gap: 10px; align-items: center; font-size: 0.8rem; color: var(--text-secondary); font-weight: 800; 
          background: var(--bg-input); padding: 6px 12px; border-radius: 12px; align-self: flex-start;
        }
        .strategic-path button { background: none; border: none; color: var(--color-blue); font-weight: 900; cursor: pointer; font-size: inherit; }
        .path-active { color: var(--text-primary); font-weight: 900; }

        /* TILES */
        .continent-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .continent-tile {
          padding: 20px 12px; background: var(--bg-input); border: 1px solid var(--border-color);
          border-radius: 16px; display: flex; flex-direction: column; align-items: center; gap: 8px;
          cursor: pointer; transition: all 0.2s;
        }
        .continent-tile:hover { background: var(--bg-hover); border-color: var(--border-hover); }
        .tile-emoji { font-size: 1.8rem; }
        .tile-label { font-size: 0.85rem; font-weight: 900; color: var(--text-primary); }
        .tile-cta { font-size: 0.55rem; font-weight: 900; color: var(--text-muted); letter-spacing: 0.5px; }

        .entry-item {
          display: flex; align-items: center; gap: 14px; padding: 18px; border-radius: 18px;
          background: var(--bg-input); border: 1px solid var(--border-color);
          color: var(--text-primary); text-align: left; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); margin-bottom: 12px;
        }
        .entry-item:hover { background: var(--bg-hover); border-color: var(--border-hover); transform: translateX(4px); }
        .entry-item.active { 
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.05)); 
          border-color: #3b82f6; 
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
        .entry-emoji { font-size: 1.4rem; filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.3)); }
        .entry-name { font-size: 1rem; font-weight: 900; color: var(--text-primary); }
        .entry-sub { font-size: 0.75rem; color: var(--text-secondary); font-weight: 700; margin-top: 2px; }

        .basemap-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .basemap-tile {
          padding: 12px; border-radius: 12px; border: 1px solid var(--border-color);
          background: var(--bg-input); color: var(--text-secondary); font-size: 0.75rem; font-weight: 800; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.2s;
        }
        .basemap-tile.active { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border-color: #3b82f6; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
        .basemap-tile .tile-icon { font-size: 1.2rem; }

        .map-view { flex: 1; position: relative; }

        @media (max-width: 768px) {
          .portal-sidebar.mobile-sheet {
            position: fixed; bottom: 0; left: 0; right: 0; top: auto; width: 100%;
            height: 75vh; border-top: 1px solid var(--border-color); border-radius: 24px 24px 0 0;
            transform: translateY(100%); background: var(--bg-primary); box-shadow: 0 -10px 40px rgba(0,0,0,0.8);
          }
          .portal-sidebar.mobile-sheet.open { transform: translateY(0); }
          .sidebar-header { padding: 1.25rem 1.5rem; }
          .sidebar-close-mobile { background: #818cf8; color: white; border: none; padding: 8px 16px; border-radius: 20px; font-weight: 900; font-size: 0.7rem; }
          
          .continent-grid { grid-template-columns: 1fr; }
          .continent-tile { flex-direction: row; padding: 16px; gap: 16px; }
          .tile-cta { margin-left: auto; color: #818cf8; }
          
          .mobile-nav-fab {
            position: absolute; bottom: 1.5rem; left: 50%; transform: translateX(-50%);
            background: #1e1b4b; border: 1px solid #4338ca; color: white; padding: 14px 24px;
            border-radius: 100px; font-size: 0.8rem; font-weight: 900; display: flex; align-items: center; gap: 10px;
            z-index: 500; box-shadow: 0 10px 30px rgba(0,0,0,0.6);
          }
        }

        .intelligence-engine { display: flex; flex-direction: column; gap: 16px; }
        .engine-card {
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 20px;
          transition: all 0.3s ease;
        }
        .engine-card:hover { background: var(--bg-hover); border-color: var(--border-hover); }
        
        .card-header { display: flex; align-items: center; gap: 14px; margin-bottom: 12px; }
        .card-emoji { font-size: 1.5rem; }
        .card-meta { flex: 1; }
        .card-title { font-size: 0.95rem; font-weight: 900; color: var(--text-primary); }
        .card-sub { font-size: 0.65rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
        
        .card-description { font-size: 0.75rem; color: var(--text-secondary); line-height: 1.5; font-weight: 500; }

        /* iOS Switch */
        .ios-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }
        .ios-switch input { opacity: 0; width: 0; height: 0; }
        .switch-slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: var(--bg-input);
          transition: .4s;
          border-radius: 34px;
        }
        .switch-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        input:checked + .switch-slider { background-color: #ef4444; }
        input:focus + .switch-slider { box-shadow: 0 0 1px #ef4444; }
        input:checked + .switch-slider:before { transform: translateX(20px); }

        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
    </>
  )
}

export default function MapPageClient() {
  return <MapPageInner />
}

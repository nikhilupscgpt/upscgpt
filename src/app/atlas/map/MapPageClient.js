"use client"
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import NavSlot from '@/components/NavSlot'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import html2canvas from 'html2canvas'
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
  { key: 'strait',   label: 'Straits & Passes',    color: '#f59e0b', emoji: '🌊' },
  { key: 'conflict', label: 'Conflict Zones',       color: '#ef4444', emoji: '⚔️' },
  { key: 'nature',   label: 'Nature & Ecology',     color: '#22c55e', emoji: '🌿' },
  { key: 'island',   label: 'Islands',              color: '#3b82f6', emoji: '🏝️' },
  { key: 'mineral',  label: 'Strategic Resources',  color: '#a855f7', emoji: '⛏️' },
  { key: 'river',    label: 'Rivers & Waterways',   color: '#0ea5e9', emoji: '🏞️' },
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

function FloatingMapBotPanel({
  entry,
  region,
  panelOpen,
  setPanelOpen,
  panelMinimized,
  setPanelMinimized,
  activeTab,
  setActiveTab,
  onMapBotAction,
  mapbotMode,
  mapbotLoading,
  mapbotError,
  mapbotResult,
  chatMessages,
  chatInput,
  setChatInput,
  chatLoading,
  onChatSubmit,
  chatUsage,
}) {
  const style = entry ? (CATEGORIES.find(c => c.key === entry.category) || CATEGORIES[0]) : null
  const contextLabel = entry?.name || region.label
  const [panelPosition, setPanelPosition] = useState({ x: 20, y: 20, hasMoved: false })
  const dragStateRef = useRef(null)

  const clampPosition = useCallback((x, y) => {
    if (typeof window === 'undefined') return { x, y }
    const panelWidth = panelMinimized ? 240 : Math.min(430, window.innerWidth - 40)
    const panelHeight = panelMinimized ? 84 : Math.min(760, window.innerHeight - 40)
    return {
      x: Math.min(Math.max(12, x), Math.max(12, window.innerWidth - panelWidth - 12)),
      y: Math.min(Math.max(12, y), Math.max(12, window.innerHeight - panelHeight - 12)),
    }
  }, [panelMinimized])

  useEffect(() => {
    const handleResize = () => {
      setPanelPosition((current) => {
        if (!current.hasMoved) return current
        const next = clampPosition(current.x, current.y)
        return { ...current, ...next }
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [panelMinimized, clampPosition])

  const handlePointerDown = (event) => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) return
    if (event.target.closest('button, input, textarea')) return
    
    const rect = event.currentTarget.parentElement?.getBoundingClientRect()
    dragStateRef.current = {
      offsetX: event.clientX - (rect?.left || 0),
      offsetY: event.clientY - (rect?.top || 0),
      pointerId: event.pointerId
    }
    
    event.currentTarget.setPointerCapture(event.pointerId)
    document.body.style.userSelect = 'none'
  }

  const handlePointerMove = (event) => {
    if (!dragStateRef.current || dragStateRef.current.pointerId !== event.pointerId) return
    const next = clampPosition(
      event.clientX - dragStateRef.current.offsetX,
      event.clientY - dragStateRef.current.offsetY
    )
    setPanelPosition({ ...next, hasMoved: true })
  }

  const handlePointerUp = (event) => {
    if (!dragStateRef.current) return
    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch (e) {
      // Ignore if pointer capture already released
    }
    dragStateRef.current = null
    document.body.style.userSelect = ''
  }

  if (!panelOpen) {
    return (
      <button
        type="button"
        className="mapbot-fab"
        onClick={() => {
          setPanelOpen(true)
          setPanelMinimized(false)
        }}
      >
        ✨ Ask Nano
      </button>
    )
  }

  const safeUri = (uri) => {
    const protocols = ['http', 'https', 'mailto', 'tel'];
    try {
      const parsed = new URL(uri, window.location.origin);
      if (protocols.includes(parsed.protocol.replace(':', ''))) return uri;
      return '#';
    } catch {
      return uri.startsWith('/') ? uri : '#';
    }
  };

  return (
    <div
      className={`mapbot-floating-panel ${panelMinimized ? 'minimized' : ''}`}
      style={panelPosition.hasMoved ? { top: `${panelPosition.y}px`, left: `${panelPosition.x}px`, right: 'auto' } : undefined}
    >
      <div
        className="mapbot-floating-header"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="mapbot-kicker">Nano Intelligence</div>
          <div className="mapbot-title-row">
            <strong>{contextLabel}</strong>
            {entry && style ? (
              <span className="mapbot-context-badge" style={{ background: `${style.color}22`, color: style.color, borderColor: `${style.color}44` }}>
                {style.emoji} {entry.category}
              </span>
            ) : null}
          </div>
          <div className="mapbot-subtle">
            {entry
              ? 'Node details, exam framing, and AI help now live in one floating panel.'
              : 'Use Nano as a floating tutor for this region, latest news, and quick AI chat.'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="mapbot-icon-btn" onClick={() => setPanelMinimized(!panelMinimized)}>
            {panelMinimized ? '▢' : '—'}
          </button>
          <button
            type="button"
            className="mapbot-icon-btn"
            onClick={() => {
              setPanelOpen(false)
              setPanelMinimized(false)
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {!panelMinimized ? (
        <>
          <div className="mapbot-tabs">
            <button type="button" className={`mapbot-tab ${activeTab === 'context' ? 'active' : ''}`} onClick={() => setActiveTab('context')}>
              Context
            </button>
            <button type="button" className={`mapbot-tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
              AI Chat
            </button>
          </div>

          <div className="mapbot-floating-body">
            {activeTab === 'context' ? (
              <>
                <div className="mapbot-quick-actions">
                  {MAPBOT_ACTIONS.map((action) => (
                    <button
                      key={action.key}
                      type="button"
                      className={`mapbot-action-pill ${mapbotMode === action.key ? 'active' : ''}`}
                      disabled={(action.requiresEntry && !entry) || mapbotLoading}
                      onClick={() => onMapBotAction(action.key, entry)}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>

                {entry ? (
                  <div className="mapbot-entry-card">
                    <div className="mapbot-entry-topline">
                      <span>{entry.year ? `UPSC ${entry.year}` : 'Atlas node'}</span>
                      {entry.lat != null && entry.lon != null ? (
                        <span>{Number(entry.lat).toFixed(3)}, {Number(entry.lon).toFixed(3)}</span>
                      ) : null}
                    </div>
                    {entry.tags ? (
                      <div className="mapbot-tag-row">
                        {entry.tags.split(',').map((tag) => (
                          <span key={tag} className="mapbot-tag-chip">#{tag.trim()}</span>
                        ))}
                      </div>
                    ) : null}
                    <div className="mapbot-entry-grid">
                      <div>
                        <div className="mapbot-mini-label">Prelims</div>
                        <p>{entry.prelims || 'No prelims notes yet for this node.'}</p>
                      </div>
                      <div>
                        <div className="mapbot-mini-label">India Angle</div>
                        <p>{entry.india || 'India-specific framing is still being expanded.'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mapbot-empty-state">
                    Click a node on the map to bring its details here. Until then, Nano can still tutor the region or interpret its mapped news.
                  </div>
                )}

                {mapbotError ? <div className="mapbot-inline-error">{mapbotError}</div> : null}
                {mapbotLoading ? <div className="mapbot-loading-card">Nano is preparing an exam-ready response...</div> : null}

                {mapbotResult && !mapbotLoading ? (
                  <div className="mapbot-panel">
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 800 }}>{mapbotResult.title}</div>
                      {mapbotResult.contextLabel ? (
                        <div style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 700, marginTop: '3px' }}>
                          {mapbotResult.contextLabel}
                        </div>
                      ) : null}
                    </div>
                    <div className="mapbot-markdown">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        urlTransform={safeUri}
                        disallowedElements={['script', 'iframe', 'object', 'embed']}
                      >
                        {mapbotResult.markdown || 'No response returned.'}
                      </ReactMarkdown>
                    </div>
                    {Array.isArray(mapbotResult.suggestedFollowups) && mapbotResult.suggestedFollowups.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                        {mapbotResult.suggestedFollowups.slice(0, 3).map((followup) => (
                          <button
                            key={followup}
                            type="button"
                            className="mapbot-followup"
                            onClick={() => {
                              setActiveTab('chat')
                              setChatInput(followup)
                            }}
                          >
                            {followup}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <div className="mapbot-chat-scroll">
                  {chatMessages.length === 0 ? (
                    <div className="mapbot-empty-state">
                      Ask about the selected node, compare locations, request a mains answer, or turn the current context into prelims practice.
                    </div>
                  ) : (
                    chatMessages.map((message, index) => (
                      <div key={`${message.role}-${index}`} className={`mapbot-message ${message.role}`}>
                        <div className="mapbot-message-role">{message.role === 'user' ? 'You' : 'Nano'}</div>
                        <div className="mapbot-markdown">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            urlTransform={safeUri}
                            disallowedElements={['script', 'iframe', 'object', 'embed']}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mapbot-suggestion-row">
                  {MAPBOT_CHAT_SUGGESTIONS.map((prompt) => (
                    <button key={prompt} type="button" className="mapbot-suggestion" onClick={() => setChatInput(prompt)}>
                      {prompt}
                    </button>
                  ))}
                </div>

                {chatUsage ? (
                  <div className="mapbot-subtle" style={{ marginBottom: '0.6rem' }}>
                    {chatUsage.limit == null
                      ? 'Live AI chat is available without a daily cap on your current plan.'
                      : `Live AI chat remaining today: ${chatUsage.remaining}/${chatUsage.limit}`}
                  </div>
                ) : null}

                <form
                  className="mapbot-chat-form"
                  onSubmit={(event) => {
                    event.preventDefault()
                    onChatSubmit()
                  }}
                >
                  <textarea
                    rows={3}
                    value={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                    placeholder={entry ? `Ask Nano about ${entry.name}...` : `Ask Nano about ${region.label}...`}
                    className="mapbot-chat-input"
                  />
                  <button type="submit" className="btn-primary" disabled={chatLoading || !chatInput.trim()} style={{ width: '100%', justifyContent: 'center' }}>
                    {chatLoading ? 'Thinking…' : 'Send to Nano'}
                  </button>
                </form>
              </>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}

// ─── On-Map Floating Info Card (draggable) ──────────────────────────────────
function MapInfoCard({ entry, onClose, onAskNano }) {
  const [pos, setPos] = useState({ x: null, y: null }) // null = use CSS default
  const dragRef = useRef(null)

  // Clamp inside the map-view parent
  const clamp = useCallback((x, y, cardW = 340, cardH = 480) => {
    if (typeof window === 'undefined') return { x, y }
    const parent = document.querySelector('.map-view')
    const pw = parent ? parent.clientWidth  : window.innerWidth
    const ph = parent ? parent.clientHeight : window.innerHeight
    return {
      x: Math.min(Math.max(0, x), Math.max(0, pw - cardW)),
      y: Math.min(Math.max(0, y), Math.max(0, ph - cardH)),
    }
  }, [])

  const handlePointerDown = (e) => {
    if (e.target.closest('button')) return
    if (window.innerWidth <= 768) return
    
    const card = e.currentTarget.closest('.map-info-card')
    const rect = card.getBoundingClientRect()
    const parent = document.querySelector('.map-view')
    const pr = parent ? parent.getBoundingClientRect() : { left: 0, top: 0 }
    
    dragRef.current = {
      offsetX: e.clientX - (rect.left - pr.left),
      offsetY: e.clientY - (rect.top  - pr.top),
      pointerId: e.pointerId
    }
    
    e.currentTarget.setPointerCapture(e.pointerId)
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'grabbing'
  }

  const handlePointerMove = (e) => {
    if (!dragRef.current || dragRef.current.pointerId !== e.pointerId) return
    const { offsetX, offsetY } = dragRef.current
    setPos(clamp(e.clientX - offsetX, e.clientY - offsetY))
  }

  const handlePointerUp = (e) => {
    if (!dragRef.current) return
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch (err) {
      // Ignore
    }
    dragRef.current = null
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
  }

  if (!entry) return null
  const catStyle = CATEGORIES.find(c => c.key === entry.category) || CATEGORIES[0]

  const dragged = pos.x !== null && pos.y !== null
  const positionStyle = dragged
    ? { top: pos.y, left: pos.x, bottom: 'auto' }
    : {} // CSS default (bottom-left via stylesheet)

  return (
    <div
      className="map-info-card"
      style={positionStyle}
      role="dialog"
      aria-label={`Details for ${entry.name}`}
    >
      {/* Colour accent strip */}
      <div className="map-info-card__strip" style={{ background: catStyle.color }} />

      {/* Header — drag handle */}
      <div
        className="map-info-card__header map-info-card__header--draggable"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Grip icon */}
        <div className="map-info-card__grip" aria-hidden="true">⠿</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="map-info-card__kicker">
            {catStyle.emoji}&nbsp;{catStyle.label}
            {entry.year ? <span className="map-info-card__year">UPSC {entry.year}</span> : null}
          </div>
          <div className="map-info-card__name">{entry.name}</div>
          {entry.lat != null && entry.lon != null && (
            <div className="map-info-card__coords">
              {Number(entry.lat).toFixed(3)}°, {Number(entry.lon).toFixed(3)}°
            </div>
          )}
        </div>
        <button
          type="button"
          className="map-info-card__close"
          onClick={onClose}
          aria-label="Close info card"
        >✕</button>
      </div>

      {/* Tags */}
      {entry.tags && (
        <div className="map-info-card__tags">
          {entry.tags.split(',').map(t => (
            <span key={t} className="map-info-card__tag" style={{ borderColor: `${catStyle.color}44`, color: catStyle.color, background: `${catStyle.color}12` }}>
              #{t.trim()}
            </span>
          ))}
        </div>
      )}

      {/* Body */}
      <div className="map-info-card__body">
        {/* Mountain metadata */}
        {entry.nodeSubType === 'PHYSICAL' && entry.category === 'mountain' && (
          <div className="map-info-card__mountain-grid" style={{ borderColor: `${catStyle.color}30` }}>
            <div>
              <div className="map-info-card__field-label">Highest Peak</div>
              <div className="map-info-card__field-value">🔝 {entry.highestPeak || 'Unknown'}</div>
            </div>
            <div>
              <div className="map-info-card__field-label">Mountain Type</div>
              <div className="map-info-card__field-value">{entry.mountainType || 'Unknown'}</div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div className="map-info-card__field-label">Spreads Across</div>
              <div className="map-info-card__field-value">{entry.countriesSpread || 'Multiple Countries'}</div>
            </div>
          </div>
        )}

        {/* River metadata */}
        {entry.category === 'river' && (
          <div className="map-info-card__mountain-grid" style={{ borderColor: '#0ea5e930' }}>
            <div>
              <div className="map-info-card__field-label">🌊 Drains Into</div>
              <div className="map-info-card__field-value">{entry.riverOutflow || 'Unknown'}</div>
            </div>
            <div>
              <div className="map-info-card__field-label">🗺️ Countries</div>
              <div className="map-info-card__field-value">{entry.countriesSpread || '—'}</div>
            </div>
          </div>
        )}

        {entry.capital && (
          <div className="map-info-card__pill">
            <span className="map-info-card__field-label">Capital</span>
            <span className="map-info-card__field-value">🏙️ {entry.capital}</span>
          </div>
        )}

        {entry.geoGroup && (
          <div className="map-info-card__section">
            <div className="map-info-card__field-label" style={{ color: '#6366f1' }}>Geo-Political Context</div>
            <div className="map-info-card__field-value">{entry.geoGroup}</div>
          </div>
        )}

        {entry.prelims && (
          <div className="map-info-card__section map-info-card__section--prelims">
            <div className="map-info-card__field-label">📋 Prelims Focus</div>
            <p className="map-info-card__text">{entry.prelims}</p>
          </div>
        )}

        {entry.india && (
          <div className="map-info-card__section map-info-card__section--india">
            <div className="map-info-card__field-label">🇮🇳 India Angle</div>
            <p className="map-info-card__text">{entry.india}</p>
          </div>
        )}

        {entry.mains && (
          <div className="map-info-card__section map-info-card__section--mains">
            <div className="map-info-card__field-label">📝 Mains Context</div>
            <p className="map-info-card__text">{entry.mains}</p>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="map-info-card__footer">
        <button type="button" className="map-info-card__nano-btn" onClick={onAskNano}>
          ✨ Ask Nano to Analyse
        </button>
      </div>
    </div>
  )
}

function MapPageInner() {
  const searchParams = useSearchParams()
  const regionKey = searchParams.get('region') || 'global'
  const region = REGION_CONFIG[regionKey] || REGION_CONFIG.global

  const [entries, setEntries] = useState([])
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [layers, setLayers] = useState({
    base: 'natgeo', mountain: true, strait: true, conflict: true, nature: true, island: true, mineral: true, graticules: true
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
  const [activeOrg, setActiveOrg] = useState(null)         // selected organization for lens highlighting
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
    if (activeYear && e.year !== parseInt(activeYear)) return false
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
    if (activeYear && e.year !== parseInt(activeYear)) return false
    
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
             h2 { color: #f59e0b; margin-top: 30px; font-weight: 800; }
             .subtitle { color: #64748b; font-size: 0.95rem; margin-top: 0; margin-bottom: 30px; }
             .entry { background: #f8fafc; border-left: 4px solid #f59e0b; padding: 25px; margin-bottom: 30px; border-radius: 0 8px 8px 0; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
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
      // Close/Minimize Nano panel when a node info card is shown to avoid dual-panel clutter
      setMapbotPanelOpen(false)
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
    setMapbotMode(mode)
    setMapbotActiveTab('context')
    setMapbotPanelOpen(true)
    setMapbotPanelMinimized(false)
    setInfoCardOpen(false) // close the floating info card — Nano panel takes over exclusively
    if (isMobile) {
      setSidebarOpen(false)
    }

    try {
      const data = await requestMapBot({
        mode,
        regionKey,
        entryId: entry?.id || null,
        entriesSnapshot: filteredEntries.slice(0, 80),
        selectedEntrySnapshot: entry || null,
      })
      setMapbotResult(data)
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
    <div className={`portal-container ${isExporting ? 'exporting' : ''}`} ref={exportRef}>
      <NavSlot />
      
      <div className="portal-layout">
        
        {/* STRATEGIC NAVIGATOR - Sidebar on Desktop, Bottom Sheet on Mobile */}
        <aside className={`portal-sidebar ${sidebarOpen ? 'open' : 'closed'} ${isMobile ? 'mobile-sheet' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-brand">
              <span className="region-icon">{region.emoji}</span>
              <div>
                <div className="sidebar-kicker">STRATEGIC NAVIGATOR</div>
                <div className="sidebar-title">{region.label}</div>
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
            {[{id:'POLITICAL', icon:'🏛️', label:'Political'}, {id:'PHYSICAL', icon:'⛰️', label:'Physical'}, {id:'INTELLIGENCE', icon:'📡', label:'Intel'}, {id:'NEWS', icon:'🗞️', label:'News'}].map(m => (
              <button 
                key={m.id}
                onClick={() => {
                  setActiveModule(m.id);
                  setActiveAdmRegion('');
                  setActiveGeoGroup('');
                  setActiveOrg(null);
                  if (m.id !== 'POLITICAL') setInfoCardOpen(false);
                }}
                className={`sidebar-tab ${activeModule === m.id ? 'active' : ''}`}
              >
                <span>{m.icon}</span> {m.label}
              </button>
            ))}
          </div>

          <div className="sidebar-scroll hide-scrollbar">
            {/* SEARCH BOX */}
            <div className="search-container">
              <input 
                placeholder={`Search ${region.label} nodes...`} 
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
                  <button onClick={() => setActiveAdmRegion('')}>{REGION_CONFIG[activeContinentKey]?.label || activeContinentKey}</button>
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

              {/* INTELLIGENCE MODULE: Organization Lens */}
              {activeModule === 'INTELLIGENCE' && (
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
                        <div className="entry-name">{e.name}</div>
                        <div className="entry-sub">{e.geoGroup || 'Strategic Node'}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* BASEMAP CONTROLS */}
            <div className="basemap-section">
              <div className="section-label">BASEMAP ENGINE</div>
              <div className="basemap-grid">
                {BASEMAPS.map(b => (
                  <button 
                    key={b.key} 
                    className={`basemap-tile ${layers.base === b.key ? 'active' : ''}`}
                    onClick={() => setLayers(p => ({ ...p, base: b.key }))}
                  >
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
            />
          )}

          <FloatingMapBotPanel 
            entry={selectedEntry}
            region={region}
            panelOpen={mapbotPanelOpen}
            setPanelOpen={setMapbotPanelOpen}
            panelMinimized={mapbotPanelMinimized}
            setPanelMinimized={setMapbotPanelMinimized}
            activeTab={mapbotActiveTab}
            setActiveTab={setMapbotActiveTab}
            onMapBotAction={runMapBot}
            mapbotMode={mapbotMode}
            mapbotLoading={mapbotLoading}
            mapbotError={mapbotError}
            mapbotResult={mapbotResult}
            chatMessages={chatMessages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            chatLoading={chatLoading}
            onChatSubmit={sendMapBotChat}
            chatUsage={chatUsage}
          />

          <NewsTicker regionKey={regionKey} />
          <AtlasTimeTracker regionKey={regionKey} />
        </main>
      </div>

      <style jsx>{`
        .portal-container { height: 100vh; background: #020617; display: flex; flex-direction: column; overflow: hidden; font-family: 'Outfit', sans-serif; }
        .portal-layout { flex: 1; display: flex; position: relative; overflow: hidden; }

        /* SIDEBAR / BOTTOM SHEET */
        .portal-sidebar {
          width: 380px; background: #0a0a0f; border-right: 1px solid rgba(255,255,255,0.06);
          display: flex; flex-direction: column; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
        }
        .portal-sidebar.closed { width: 0; transform: translateX(-100%); }

        .sidebar-header { padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; }
        .sidebar-brand { display: flex; gap: 12px; align-items: center; }
        .region-icon { font-size: 1.5rem; background: rgba(255,255,255,0.03); padding: 8px; border-radius: 12px; }
        .sidebar-kicker { font-size: 0.6rem; font-weight: 900; color: #475569; letter-spacing: 1px; }
        .sidebar-title { font-size: 1.25rem; font-weight: 900; color: white; }
        
        .sidebar-tabs { display: grid; grid-template-columns: repeat(4, 1fr); padding: 0 1rem 1rem; gap: 4px; }
        .sidebar-tab { 
          padding: 10px 4px; border: none; background: rgba(255,255,255,0.02); color: #475569; 
          font-size: 0.65rem; font-weight: 900; border-radius: 8px; cursor: pointer; transition: all 0.2s;
          display: flex; flex-direction: column; align-items: center; gap: 4px;
        }
        .sidebar-tab.active { background: rgba(99, 102, 241, 0.1); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.2); }

        .sidebar-scroll { flex: 1; overflow-y: auto; padding: 1rem 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
        
        .search-container input {
          width: 100%; padding: 12px 16px; border-radius: 12px; background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08); color: white; font-size: 0.85rem; outline: none;
        }

        .strategic-path { display: flex; gap: 8px; align-items: center; font-size: 0.75rem; color: #64748b; font-weight: 800; }
        .strategic-path button { background: none; border: none; color: #818cf8; font-weight: 900; cursor: pointer; font-size: inherit; }
        .path-active { color: white; background: rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 20px; }

        /* TILES */
        .continent-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .continent-tile {
          padding: 20px 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; display: flex; flex-direction: column; align-items: center; gap: 8px;
          cursor: pointer; transition: all 0.2s;
        }
        .continent-tile:hover { background: rgba(255,255,255,0.05); border-color: #818cf8; }
        .tile-emoji { font-size: 1.8rem; }
        .tile-label { font-size: 0.85rem; font-weight: 900; color: white; }
        .tile-cta { font-size: 0.55rem; font-weight: 900; color: #475569; letter-spacing: 0.5px; }

        .entry-item {
          display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 14px;
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
          color: white; text-align: left; cursor: pointer; transition: all 0.2s; margin-bottom: 8px;
        }
        .entry-item.active { background: rgba(99, 102, 241, 0.1); border-color: #818cf8; }
        .entry-emoji { font-size: 1.2rem; }
        .entry-name { font-size: 0.9rem; font-weight: 900; }
        .entry-sub { font-size: 0.7rem; color: #64748b; }

        .basemap-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
        .basemap-tile {
          padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.02); color: #64748b; font-size: 0.65rem; font-weight: 900; cursor: pointer;
        }
        .basemap-tile.active { background: #3b82f6; color: white; border-color: #3b82f6; }

        .map-view { flex: 1; position: relative; }

        @media (max-width: 768px) {
          .portal-sidebar.mobile-sheet {
            position: fixed; bottom: 0; left: 0; right: 0; top: auto; width: 100%;
            height: 75vh; border-top: 1px solid rgba(255,255,255,0.15); border-radius: 24px 24px 0 0;
            transform: translateY(100%); background: #050507; box-shadow: 0 -10px 40px rgba(0,0,0,0.8);
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

        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}

export default function MapPageClient() {
  return <MapPageInner />
}

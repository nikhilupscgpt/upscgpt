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
    const error = new Error(data?.error || 'MapBot could not respond.')
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
    throw new Error(data?.error || 'MapBot usage could not be loaded.')
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

  useEffect(() => {
    if (!panelOpen) return undefined

    const handlePointerMove = (event) => {
      if (!dragStateRef.current) return
      const next = clampPosition(
        event.clientX - dragStateRef.current.offsetX,
        event.clientY - dragStateRef.current.offsetY
      )
      setPanelPosition({ ...next, hasMoved: true })
    }

    const handlePointerUp = () => {
      dragStateRef.current = null
      document.body.style.userSelect = ''
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [panelOpen, panelMinimized, clampPosition])

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
        onPointerDown={(event) => {
          if (typeof window !== 'undefined' && window.innerWidth <= 768) return
          if (event.target.closest('button, input, textarea')) return
          const rect = event.currentTarget.parentElement?.getBoundingClientRect()
          dragStateRef.current = {
            offsetX: event.clientX - (rect?.left || 0),
            offsetY: event.clientY - (rect?.top || 0),
          }
          document.body.style.userSelect = 'none'
        }}
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

  useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current) return
      const { offsetX, offsetY } = dragRef.current
      setPos(clamp(e.clientX - offsetX, e.clientY - offsetY))
    }
    const onUp = () => {
      dragRef.current = null
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [clamp])

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
        onPointerDown={(e) => {
          if (e.target.closest('button')) return
          // On mobile skip drag
          if (window.innerWidth <= 768) return
          const card = e.currentTarget.closest('.map-info-card')
          const rect = card.getBoundingClientRect()
          const parent = document.querySelector('.map-view')
          const pr = parent ? parent.getBoundingClientRect() : { left: 0, top: 0 }
          dragRef.current = {
            offsetX: e.clientX - (rect.left - pr.left),
            offsetY: e.clientY - (rect.top  - pr.top),
          }
          document.body.style.userSelect = 'none'
          document.body.style.cursor = 'grabbing'
        }}
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
  const activeContinentKey = activeContinent || (regionKey !== 'global' ? regionKey : '')
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
    <div className="layout">
      <AtlasTimeTracker />
      {/* HEADER ACTIONS */}
      <NavSlot>
        <div className="atlas-nav-actions">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
            style={{
              width: '32px', height: '32px', borderRadius: '8px', border: 'none',
              background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer',
              fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >{sidebarOpen ? '◀' : '▶'}</button>
          <button className="atlas-nav-secondary" onClick={exportPDF} disabled={isExporting} style={{
            padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 600, fontSize: '0.75rem',
            cursor: isExporting ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            opacity: isExporting ? '0.7' : 1
          }}>
            {isExporting ? '⏳' : '📄'} <span className="hidden sm:inline">Export</span>
          </button>
          <Link className="atlas-nav-secondary" href="/admin" style={{
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,191,36,0.1)',
            border: '1px solid rgba(255,191,36,0.2)', color: '#fbbf24', fontSize: '0.75rem', fontWeight: 700
          }}>
             ⚙️ <span className="hidden sm:inline">Admin</span>
          </Link>
        </div>
      </NavSlot>

      <main className="main-content">
        <div
          className={`sidebar-backdrop ${sidebarOpen ? 'visible' : ''}`}
          onClick={() => setSidebarOpen(false)}
          aria-hidden={!sidebarOpen}
        />
        {/* SIDEBAR */}
        <aside className={`sidebar ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
          {/* SEARCH */}
          <div style={{ padding: '12px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', opacity: 0.55 }}>🔍</span>
              <input
                type="text" placeholder="Search locations…" value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '12px 12px 12px 34px', borderRadius: '14px', fontSize: '0.9rem', border: '1px solid rgba(148,163,184,0.18)', background: 'linear-gradient(180deg, rgba(15,23,42,0.88), rgba(17,24,39,0.96))', color: '#e2e8f0', outline: 'none', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)' }}
              />
            </div>
          </div>

          {/* REGION SWITCHER */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
            <div className="quick-jump-title" style={{ marginBottom: '8px' }}>Switch Region</div>
            <div className="region-switcher-row">
              {Object.entries(REGION_CONFIG).map(([key, cfg]) => (
                <Link key={key} className="region-switcher-chip" href={`/atlas/map?region=${key}`} style={{
                  padding: '10px 14px', borderRadius: '14px', fontSize: '0.72rem', fontWeight: 800,
                  textDecoration: 'none',
                  background: key === regionKey ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'linear-gradient(180deg, rgba(30,41,59,0.96), rgba(15,23,42,0.96))',
                  color: key === regionKey ? '#ffffff' : '#d6e0ee',
                  border: key === regionKey ? '1px solid rgba(129,140,248,0.42)' : '1px solid rgba(148,163,184,0.16)',
                  boxShadow: key === regionKey ? '0 12px 28px rgba(99,102,241,0.32)' : '0 6px 16px rgba(2,6,23,0.16)',
                  transition: 'all 0.2s',
                }}>{cfg.emoji} {cfg.label}</Link>
              ))}
            </div>
          </div>

          {isMounted && isMobile ? (
            <div className="mobile-sheet-tabs">
              {[
                ['explore', 'Explore'],
                ['headlines', 'Headlines'],
                ['filters', 'Filters'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`mobile-sheet-tab ${mobileSheetTab === key ? 'active' : ''}`}
                  onClick={() => setMobileSheetTab(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}

            <div className="sidebar-content">
              {isMounted && (
                <>
                  {/* 3-PART MODULE TABS */}
                  <div style={{ padding: '0 20px 24px' }}>
                <div style={{ 
                  display: 'flex', background: 'linear-gradient(180deg, rgba(23,32,54,0.98), rgba(17,24,39,0.98))', borderRadius: '24px', padding: '6px',
                  boxShadow: 'inset 0 2px 10px rgba(2,6,23,0.32)'
                }}>
                  {[
                    { id: 'POLITICAL', label: 'Political', icon: '🏛️' },
                    { id: 'PHYSICAL', label: 'Physical', icon: '⛰️' },
                    { id: 'INTELLIGENCE', label: 'Intel', icon: '📡' },
                    { id: 'NEWS', label: 'News', icon: '📰' }
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setActiveModule(m.id)
                        setActiveAdmRegion('')
                        setActiveGeoGroup('')
                        setActiveOrg(null)
                      }}
                      style={{
                        flex: 1, padding: '12px 6px', borderRadius: '16px', border: activeModule === m.id ? '1px solid rgba(99,102,241,0.18)' : '1px solid transparent', cursor: 'pointer',
                        fontSize: '0.75rem', fontWeight: 800, transition: 'all 0.2s',
                        background: activeModule === m.id ? 'linear-gradient(180deg, #ffffff, #eef2ff)' : 'transparent',
                        color: activeModule === m.id ? '#0f172a' : '#94a3b8',
                        boxShadow: activeModule === m.id ? '0 10px 24px rgba(2,6,23,0.24)' : 'none',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                      }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>{m.icon}</span>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* DYNAMIC STRATEGIC NAVIGATOR */}
              <div className="section-card">
                <div className="section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Strategic Navigator</span>
                  { (activeContinent || activeAdmRegion) && (
                    <button 
                      onClick={() => {
                        setActiveContinent(regionKey !== 'global' ? regionKey : '')
                        setActiveAdmRegion('')
                        setActiveGeoGroup('')
                      }}
                      style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)', color: '#4f46e5', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', borderRadius: '999px', padding: '6px 10px', boxShadow: '0 2px 8px rgba(99,102,241,0.08)' }}
                    >Reset ✕</button>
                  ) }
                </div>

                {/* BREADCRUMBS */}
                <div style={{ padding: '14px 14px', background: 'linear-gradient(180deg, rgba(17,24,39,0.98), rgba(15,23,42,0.94))', borderBottom: '1px solid rgba(148,163,184,0.12)', display: 'flex', gap: '8px', alignItems: 'center', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                  <button 
                    onClick={() => {
                      setActiveContinent(regionKey !== 'global' ? regionKey : '')
                      setActiveAdmRegion('')
                    }}
                    style={{ background: !activeContinentKey ? 'rgba(129,140,248,0.16)' : 'transparent', border: 'none', fontSize: '0.8rem', fontWeight: !activeContinentKey ? 800 : 700, color: !activeContinentKey ? '#e0e7ff' : '#94a3b8', cursor: 'pointer', borderRadius: '999px', padding: !activeContinentKey ? '6px 10px' : 0 }}
                  >World</button>
                  {activeContinentKey && (
                    <>
                      <span style={{ color: '#cbd5e1', fontSize: '0.7rem' }}>/</span>
                      <button 
                        onClick={() => setActiveAdmRegion('')}
                        style={{ background: !activeAdmRegion ? 'rgba(129,140,248,0.16)' : 'transparent', border: 'none', fontSize: '0.8rem', fontWeight: !activeAdmRegion ? 800 : 700, color: !activeAdmRegion ? '#e0e7ff' : '#94a3b8', cursor: 'pointer', borderRadius: '999px', padding: !activeAdmRegion ? '6px 10px' : 0 }}
                      >{REGION_CONFIG[activeContinentKey]?.label || activeContinentKey}</button>
                    </>
                  )}
                  {activeAdmRegion && (
                    <>
                      <span style={{ color: '#cbd5e1', fontSize: '0.7rem' }}>/</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff', background: 'linear-gradient(135deg, rgba(124,58,237,0.9), rgba(79,70,229,0.88))', border: '1px solid rgba(129,140,248,0.26)', borderRadius: '999px', padding: '6px 10px', boxShadow: '0 8px 18px rgba(99,102,241,0.2)' }}>{activeAdmRegion}</span>
                    </>
                  )}
                </div>
                
                <div style={{ padding: '12px' }}>
                  {activeModule === 'POLITICAL' || activeModule === 'PHYSICAL' ? (
                    <>
                      {/* LEVEL 0: CONTINENT SELECTION */}
                      {!activeContinentKey && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                          {Object.entries(REGION_CONFIG).filter(([k]) => k !== 'global').map(([key, cfg]) => (
                            <button
                              key={key}
                              onClick={() => setActiveContinent(key)}
                              style={{
                                padding: '18px 12px', borderRadius: '16px', border: '1px solid #d6deeb',
                                background: 'linear-gradient(180deg, #ffffff, #f8fafc)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                                boxShadow: '0 6px 14px rgba(15,23,42,0.05)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
                              }}
                              onMouseOver={e => { e.currentTarget.style.borderColor = '#818cf8'; e.currentTarget.style.boxShadow = '0 10px 22px rgba(99,102,241,0.12)' }}
                              onMouseOut={e => { e.currentTarget.style.borderColor = '#d6deeb'; e.currentTarget.style.boxShadow = '0 6px 14px rgba(15,23,42,0.05)' }}
                            >
                              <span style={{ fontSize: '1.5rem' }}>{cfg.emoji}</span>
                              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b' }}>{cfg.label}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* LEVEL 1: ADMINISTRATIVE REGIONS SELECTION */}
                      {activeModule === 'POLITICAL' && activeContinentKey && !activeAdmRegion && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 800, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Select Strategic Zone</div>
                          {[...new Set(entriesArr.filter(e => {
                            return getContinentKey(e.continent) === activeContinentKey
                          }).map(e => e.admRegion).filter(Boolean))].sort().map(region => (
                            <button
                              key={region}
                              onClick={() => setActiveAdmRegion(region)}
                              style={{
                                padding: '13px 14px', borderRadius: '14px', border: '1px solid rgba(148,163,184,0.16)',
                                background: 'linear-gradient(180deg, rgba(30,41,59,0.94), rgba(17,24,39,0.94))', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                                boxShadow: '0 8px 18px rgba(2,6,23,0.14)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                              }}
                              onMouseOver={e => { e.currentTarget.style.borderColor='#818cf8'; e.currentTarget.style.background='linear-gradient(180deg, rgba(55,65,81,0.98), rgba(30,41,59,0.98))'; e.currentTarget.style.boxShadow='0 12px 24px rgba(99,102,241,0.14)' }}
                              onMouseOut={e => { e.currentTarget.style.borderColor='rgba(148,163,184,0.16)'; e.currentTarget.style.background='linear-gradient(180deg, rgba(30,41,59,0.94), rgba(17,24,39,0.94))'; e.currentTarget.style.boxShadow='0 8px 18px rgba(2,6,23,0.14)' }}
                            >
                              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#e2e8f0' }}>📍 {region}</span>
                              <span style={{ fontSize: '1rem', color: '#94a3b8' }}>›</span>
                            </button>
                          ))}
                          {entriesArr.filter(e => getContinentKey(e.continent) === activeContinentKey && !e.admRegion).length > 0 && (
                             <button
                               onClick={() => setActiveAdmRegion('OTHER')}
                               style={{ padding: '10px', fontSize: '0.75rem', color: '#94a3b8', border: '1px dashed #e2e8f0', background: 'none', borderRadius: '8px', cursor: 'pointer' }}
                             >View unclassified {REGION_CONFIG[activeContinentKey]?.label || activeContinentKey} nodes</button>
                          )}
                        </div>
                      )}

                      {/* LEVEL 2: COUNTRY / ENTRY LIST */}
                      {(activeModule === 'POLITICAL' ? activeAdmRegion : activeContinentKey) && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 800, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Entries in {activeAdmRegion || REGION_CONFIG[activeContinentKey]?.label || activeContinentKey}</div>
                          {filteredEntries.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>No nodes found in this region.</div>
                          ) : (
                            filteredEntries.map(e => (
                              <div key={e.id} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                <button
                                  onClick={() => {
                                    setSelectedEntry(e);
                                    if (e.lat && e.lon && mapRef.current) {
                                      mapRef.current.flyTo([e.lat, e.lon], 7);
                                    }
                                  }}
                                  style={{
                                    padding: '14px 16px', borderRadius: selectedEntry?.id === e.id ? '18px 18px 12px 12px' : '18px', border: selectedEntry?.id === e.id ? '2px solid #818cf8' : '1px solid rgba(148,163,184,0.16)',
                                    background: selectedEntry?.id === e.id ? 'linear-gradient(180deg, rgba(67,56,202,0.34), rgba(30,41,59,0.96))' : 'linear-gradient(180deg, rgba(30,41,59,0.96), rgba(17,24,39,0.96))', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                                    boxShadow: selectedEntry?.id === e.id ? '0 14px 28px rgba(99,102,241,0.2)' : '0 8px 18px rgba(2,6,23,0.16)',
                                    display: 'flex', alignItems: 'center', gap: '12px'
                                  }}
                                >
                                  <span style={{ fontSize: '1.05rem', width: '28px', textAlign: 'center', opacity: selectedEntry?.id === e.id ? 1 : 0.9 }}>{CATEGORIES.find(c => c.key === e.category)?.emoji || '📍'}</span>
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: '0.98rem', fontWeight: 900, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</div>
                                    <div style={{ fontSize: '0.72rem', color: selectedEntry?.id === e.id ? '#e0e7ff' : '#94a3b8', fontWeight: selectedEntry?.id === e.id ? 700 : 600 }}>{e.capital ? `Cap: ${e.capital}` : (e.geoGroup || 'Strategic Node')}</div>
                                  </div>
                                </button>

                              </div>
                            ))
                          )}
                          <button 
                            onClick={() => setActiveAdmRegion('')}
                            style={{ marginTop: '10px', padding: '12px', fontSize: '0.78rem', fontWeight: 800, color: '#e0e7ff', background: 'linear-gradient(135deg, rgba(79,70,229,0.7), rgba(99,102,241,0.72))', border: '1px solid rgba(129,140,248,0.24)', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 10px 18px rgba(99,102,241,0.16)' }}
                          >Back to Region List</button>
                        </div>
                      )}
                    </>
                  ) : activeModule === 'INTELLIGENCE' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                      {/* Intelligence Sub-layer Switcher */}
                      <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '5px', borderRadius: '12px' }}>
                        {[{ id: 'ZONES', label: '⚔️ Conflict Zones' }, { id: 'ORGS', label: '🌐 Organizations' }].map(sl => (
                          <button
                            key={sl.id}
                            onClick={() => setIntelSubLayer(sl.id)}
                            style={{
                              flex: 1, padding: '8px 6px', borderRadius: '9px', border: 'none',
                              background: intelSubLayer === sl.id ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                              color: intelSubLayer === sl.id ? 'white' : '#64748b',
                              fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'
                            }}
                          >
                            {sl.label}
                          </button>
                        ))}
                      </div>

                      {intelSubLayer === 'ORGS' ? (
                        <OrgLens
                          activeOrg={activeOrg}
                          onOrgSelect={(org) => {
                            setActiveOrg(org)
                          }}
                        />
                      ) : (
                        // Conflict Zones list
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 800, textTransform: 'uppercase', padding: '0 4px' }}>⚔️ Active Conflict &amp; Intelligence Zones</div>
                          {entriesArr.filter(e => e.worldPart === 'INTELLIGENCE').length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>No intelligence zones loaded.</div>
                          ) : (
                            entriesArr.filter(e => e.worldPart === 'INTELLIGENCE').map(e => (
                              <button
                                key={e.id}
                                onClick={() => {
                                  handleSelectEntry(e)
                                  if (e.lat && e.lon && mapRef.current) mapRef.current.flyTo([e.lat, e.lon], 6)
                                }}
                                style={{
                                  padding: '12px 14px', borderRadius: '14px',
                                  border: selectedEntry?.id === e.id ? '2px solid rgba(239,68,68,0.5)' : '1px solid rgba(148,163,184,0.14)',
                                  background: selectedEntry?.id === e.id ? 'linear-gradient(180deg, rgba(127,29,29,0.3), rgba(30,41,59,0.98))' : 'linear-gradient(180deg, rgba(30,41,59,0.94), rgba(17,24,39,0.9))',
                                  cursor: 'pointer', textAlign: 'left', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', transition: 'all 0.2s'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '0.92rem', fontWeight: 900, color: '#f8fafc' }}>{e.name}</span>
                                  <span style={{ fontSize: '0.62rem', padding: '2px 7px', borderRadius: '999px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontWeight: 800 }}>{e.nodeSubType?.replace('_', ' ')}</span>
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '3px' }}>
                                  {e.parentCountry ? `🏴 ${e.parentCountry}` : e.continent} · {e.admRegion}
                                </div>

                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* NEWS tab */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, padding: '0 4px' }}>RECENT INTELLIGENCE ALERTS</div>
                      {entriesArr.filter(e => e.worldPart === 'NEWS').length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
                          <span style={{ fontSize: '1.5rem' }}>📡</span>
                          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px' }}>No live news markers found. Go to Admin to sync today&apos;s headlines.</p>
                        </div>
                      ) : (
                        entriesArr.filter(e => e.worldPart === 'NEWS').map(e => (
                          <div
                            key={e.id}
                            onClick={() => {
                              if (e.lat && e.lon && mapRef.current) mapRef.current.flyTo([e.lat, e.lon], 6)
                              handleSelectEntry(e)
                            }}
                            style={{
                              padding: '10px 12px', background: 'rgba(30,41,59,0.94)', border: '1px solid rgba(148,163,184,0.14)', borderRadius: '10px',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s'
                            }}
                            onMouseOver={ev => ev.currentTarget.style.borderColor = '#6366f1'}
                            onMouseOut={ev => ev.currentTarget.style.borderColor = 'rgba(148,163,184,0.14)'}
                          >
                            <span style={{ fontSize: '1rem' }}>📍</span>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</div>
                              <div style={{ fontSize: '0.65rem', color: '#6366f1', fontWeight: 700 }}>{e.geoGroup || 'Global Conflict'}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

            {/* GEOGRAPHIC LAYERS REMOVED AS REQUESTED */}

            {/* BASEMAP */}
            <div className="section-card">
              <div className="section-title">ArcGIS Base Layers</div>
              <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {BASEMAPS.map(b => (
                  <button key={b.key} onClick={() => setLayers(p => ({ ...p, base: b.key }))} style={{
                    padding: '9px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                    background: layers.base === b.key ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : 'rgba(0,0,0,0.04)',
                    color: layers.base === b.key ? 'white' : '#475569',
                    fontWeight: 700, fontSize: '0.82rem', textAlign: 'left',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    boxShadow: layers.base === b.key ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
                    transition: 'all 0.2s',
                  }}>
                    <span>{b.label}</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 500, opacity: 0.75 }}>{b.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ANNOTATIONS */}
            <div className="section-card" style={{ marginBottom: 0 }}>
              <div className="section-title">Annotations</div>
              <div className={`layer-row ${layers.graticules ? 'on' : 'off'}`} onClick={() => toggleLayer('graticules')} style={{ borderBottom: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: layers.graticules ? '#94a3b8' : '#e2e8f0', transition: 'all 0.3s', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: layers.graticules ? '#0f172a' : '#94a3b8' }}>Equator & Tropics</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Reference lines</div>
                  </div>
                </div>
                <div className={`toggle-switch ${layers.graticules ? 'on' : ''}`}><div className="toggle-knob" /></div>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>

        {/* MAP + DRAWER CONTAINER */}
        <section className="map-view" ref={exportRef}>
          <div id="pdf-watermark" style={{
            position: 'absolute', inset: 0, zIndex: 9999, pointerEvents: 'none', display: 'none',
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(2px)',
          }}>
            <h1 style={{ fontSize: '5rem', color: 'rgba(0,0,0,0.15)', transform: 'rotate(-30deg)', margin: 0 }}>UPSCGPT</h1>
            <p style={{ fontSize: '2rem', color: 'rgba(0,0,0,0.2)', transform: 'rotate(-30deg)', fontWeight: 800 }}>Nikhil Wandhe | 7709495797</p>
          </div>

          {/* ON-MAP FLOATING INFO CARD — hidden when Nano panel is active */}
          {selectedEntry && infoCardOpen && (
            <MapInfoCard
              key={selectedEntry.id}
              entry={selectedEntry}
              onClose={() => setInfoCardOpen(false)}
              onAskNano={() => runMapBot('node_explainer')}
            />
          )}
          
          {isDataLoading && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000, background: 'rgba(15,23,42,0.85)', color: 'white', padding: '20px 30px', borderRadius: '16px', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', border: '1px solid rgba(129,140,248,0.2)' }}>
               <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
               <div style={{ width: '28px', height: '28px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#818cf8', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
               <div style={{ fontWeight: 800, fontSize: '1.2rem', fontFamily: "'Outfit', sans-serif" }}>Loading Strategic Atlas...</div>
            </div>
          )}

          <MapWrapper
            key={regionKey}
            entries={mapFilteredEntries}
            layers={layers}
            mapRef={mapRef}
            initialCenter={region.center}
            initialZoom={region.zoom}
            initialMinZoom={region.minZoom}
            maxBounds={region.bounds}
            onEntrySelect={handleSelectEntry}
            heatmapMode={heatmapMode}
            selectedEntry={selectedEntry}
            activeContinent={activeContinentKey}
            activeAdmRegion={activeAdmRegion}
            searchQuery={searchQuery}
            activeOrg={activeOrg}
            regionConfig={REGION_CONFIG}
          />

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
          <NewsTicker regionKey={regionKey} onCloseDrawer={() => setSelectedEntry(null)} onArticleSelect={(article) => {
            if (article.lat && article.lon && mapRef.current) {
              mapRef.current.flyTo([article.lat, article.lon], 6)
              const matchedEntry = entries.find(e => e.id === article.entryId)
              if (matchedEntry) handleSelectEntry(matchedEntry)
            }
          }} />
        </section>
      </main>
    </div>
  )
}

export default function MapPageClient() {
  return <MapPageInner />
}

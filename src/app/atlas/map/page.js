"use client"
import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import Navigation from '@/components/Navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

const MapWrapper = dynamic(() => import('../../../components/MapWrapper'), { ssr: false })
import AtlasTimeTracker from '../../../components/AtlasTimeTracker'
import NewsTicker from '../../../components/NewsTicker'

const REGION_CONFIG = {
  asia:         { label: 'Asia & Pacific',   emoji: '🌏', center: [34, 100], zoom: 4, minZoom: 3, bounds: [[-25, 45], [70, 190]] },
  middle_east:  { label: 'Middle East',       emoji: '🕌', center: [27, 45],  zoom: 5, minZoom: 4, bounds: [[-5, 10],  [55, 90]]  },
  africa:       { label: 'Africa',            emoji: '🌍', center: [5, 20],   zoom: 4, minZoom: 3, bounds: [[-50, -35], [55, 70]] },
  indian_ocean: { label: 'Indian Ocean',      emoji: '🌊', center: [10, 74],  zoom: 4, minZoom: 3, bounds: [[-55, 20], [45, 130]] },
  europe:       { label: 'Europe',            emoji: '🗺️',  center: [52, 15],  zoom: 4, minZoom: 3, bounds: [[20, -45], [85, 70]]  },
  americas:     { label: 'Americas',          emoji: '🌎', center: [15, -80], zoom: 3, minZoom: 2, bounds: [[-75, -180], [80, -10]] },
  global:       { label: 'Global View',       emoji: '🌐', center: [20, 0],   zoom: 2, minZoom: 1, bounds: null },
}

const CATEGORIES = [
  { key: 'strait',   label: 'Straits & Passes',   color: '#f59e0b', emoji: '🌊' },
  { key: 'conflict', label: 'Conflict Zones',      color: '#ef4444', emoji: '⚔️' },
  { key: 'nature',   label: 'Nature & Ecology',    color: '#22c55e', emoji: '🌿' },
  { key: 'island',   label: 'Islands',             color: '#3b82f6', emoji: '🏝️' },
  { key: 'mineral',  label: 'Strategic Resources', color: '#a855f7', emoji: '⛏️' },
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

  const clampPosition = (x, y) => {
    if (typeof window === 'undefined') return { x, y }
    const panelWidth = panelMinimized ? 240 : Math.min(430, window.innerWidth - 40)
    const panelHeight = panelMinimized ? 84 : Math.min(760, window.innerHeight - 40)
    return {
      x: Math.min(Math.max(12, x), Math.max(12, window.innerWidth - panelWidth - 12)),
      y: Math.min(Math.max(12, y), Math.max(12, window.innerHeight - panelHeight - 12)),
    }
  }

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
  }, [panelMinimized])

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
  }, [panelOpen, panelMinimized])

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
        MapBot
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
          <div className="mapbot-kicker">AI Atlas Guide</div>
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
              : 'Use MapBot as a floating tutor for this region, latest news, and quick AI chat.'}
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
                    Click a node on the map to bring its details here. Until then, MapBot can still tutor the region or interpret its mapped news.
                  </div>
                )}

                {mapbotError ? <div className="mapbot-inline-error">{mapbotError}</div> : null}
                {mapbotLoading ? <div className="mapbot-loading-card">MapBot is preparing an exam-ready response...</div> : null}

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
                        transformLinkUri={safeUri}
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
                        <div className="mapbot-message-role">{message.role === 'user' ? 'You' : 'MapBot'}</div>
                        <div className="mapbot-markdown">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            transformLinkUri={safeUri}
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
                    placeholder={entry ? `Ask MapBot about ${entry.name}...` : `Ask MapBot about ${region.label}...`}
                    className="mapbot-chat-input"
                  />
                  <button type="submit" className="btn-primary" disabled={chatLoading || !chatInput.trim()} style={{ width: '100%', justifyContent: 'center' }}>
                    {chatLoading ? 'Thinking…' : 'Send to MapBot'}
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


function MapPageInner() {
  const searchParams = useSearchParams()
  const regionKey = searchParams.get('region') || 'global'
  const region = REGION_CONFIG[regionKey] || REGION_CONFIG.global

  const [entries, setEntries] = useState([])
  const [layers, setLayers] = useState({
    base: 'natgeo', strait: true, conflict: true, nature: true, island: true, mineral: true, graticules: true
  })
  const [activeTag, setActiveTag] = useState('')
  const [activeYear, setActiveYear] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [heatmapMode, setHeatmapMode] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [timeFilter, setTimeFilter] = useState('all') // 'all', 'today', 'month'
  const [mapbotMode, setMapbotMode] = useState('region_tutor')
  const [mapbotResult, setMapbotResult] = useState(null)
  const [mapbotLoading, setMapbotLoading] = useState(false)
  const [mapbotError, setMapbotError] = useState('')
  const [mapbotPanelOpen, setMapbotPanelOpen] = useState(true)
  const [mapbotPanelMinimized, setMapbotPanelMinimized] = useState(false)
  const [mapbotActiveTab, setMapbotActiveTab] = useState('context')
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatUsage, setChatUsage] = useState(null)
  
  const mapRef = useRef(null)
  const exportRef = useRef(null)
  const lastAutoExplainedEntryRef = useRef(null)

  const allTags = [...new Set(entries.flatMap(e => e.tags ? e.tags.split(',').map(t => t.trim()) : []))].filter(Boolean).sort()
  const allYears = [...new Set(entries.map(e => e.year).filter(Boolean))].sort((a, b) => b - a)

  const filteredEntries = entries.filter(e => {
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
             Generated autonomously by Gemini 2.5 Flash for UPSCGPT.
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
    fetch('/api/entries').then(r => r.json()).then(setEntries).catch(() => {})
  }, [])

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
      setMapbotError(error.message || 'MapBot could not respond.')
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
        { role: 'assistant', content: error.message || 'MapBot could not respond.' },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  useEffect(() => {
    if (!selectedEntry?.id) return
    if (lastAutoExplainedEntryRef.current === selectedEntry.id) return

    let active = true

    const autoExplain = async () => {
      lastAutoExplainedEntryRef.current = selectedEntry.id
      setMapbotPanelOpen(true)
      setMapbotPanelMinimized(false)
      setMapbotActiveTab('context')
      setMapbotLoading(true)
      setMapbotError('')
      setMapbotMode('node_explainer')

      try {
        const data = await requestMapBot({
          mode: 'node_explainer',
          regionKey,
          entryId: selectedEntry.id,
          entriesSnapshot: filteredEntries.slice(0, 80),
          selectedEntrySnapshot: selectedEntry,
        })
        if (active) {
          setMapbotResult(data)
        }
      } catch (error) {
        if (active) {
          setMapbotError(error.message || 'MapBot could not respond.')
        }
      } finally {
        if (active) {
          setMapbotLoading(false)
        }
      }
    }

    autoExplain()

    return () => {
      active = false
    }
  }, [filteredEntries, regionKey, selectedEntry])

  useEffect(() => {
    setMapbotError('')
    setMapbotResult(null)
    setMapbotMode('region_tutor')
    setMapbotActiveTab('context')
    setChatUsage(null)
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
      {/* HEADER */}
      <Navigation>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
            style={{
              width: '32px', height: '32px', borderRadius: '8px', border: 'none',
              background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer',
              fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >{sidebarOpen ? '◀' : '▶'}</button>
          <button onClick={exportPDF} disabled={isExporting} style={{
            padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 600, fontSize: '0.75rem',
            cursor: isExporting ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            opacity: isExporting ? '0.7' : 1
          }}>
            {isExporting ? '⏳' : '📄'} <span className="hidden sm:inline">Export</span>
          </button>
          <Link href="/admin" style={{
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,191,36,0.1)',
            border: '1px solid rgba(255,191,36,0.2)', color: '#fbbf24', fontSize: '0.75rem', fontWeight: 700
          }}>
             ⚙️ <span className="hidden sm:inline">Admin</span>
          </Link>
        </div>
      </Navigation>

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
              <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', opacity: 0.4 }}>🔍</span>
              <input
                type="text" placeholder="Search locations…" value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '9px 10px 9px 32px', borderRadius: '9px', fontSize: '0.85rem', border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.7)', outline: 'none' }}
              />
            </div>
          </div>

          {/* REGION SWITCHER */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <div className="quick-jump-title" style={{ marginBottom: '8px' }}>Switch Region</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {Object.entries(REGION_CONFIG).map(([key, cfg]) => (
                <Link key={key} href={`/atlas/map?region=${key}`} style={{
                  padding: '4px 9px', borderRadius: '7px', fontSize: '0.72rem', fontWeight: 600,
                  textDecoration: 'none',
                  background: key === regionKey ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : 'rgba(0,0,0,0.05)',
                  color: key === regionKey ? 'white' : '#475569',
                  border: key === regionKey ? 'none' : '1px solid rgba(0,0,0,0.08)',
                  transition: 'all 0.2s',
                }}>{cfg.emoji} {cfg.label}</Link>
              ))}
            </div>
          </div>

          <div className="sidebar-content">
            {/* HEADLINES FILTER */}
            <div className="section-card">
              <div className="section-title">Global Headlines</div>
              <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button onClick={() => setTimeFilter('all')} style={{
                  padding: '8px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: timeFilter === 'all' ? 'linear-gradient(135deg, #0ea5e9, #38bdf8)' : 'rgba(0,0,0,0.04)',
                  color: timeFilter === 'all' ? 'white' : '#475569', fontWeight: 700, fontSize: '0.82rem',
                  boxShadow: timeFilter === 'all' ? '0 4px 12px rgba(14,165,233,0.3)' : 'none', transition: 'all 0.2s'
                }}>🌐 All Atlas Hubs <span style={{ float: 'right', opacity: 0.8 }}>{entries.length}</span></button>
                <button onClick={() => setTimeFilter('today')} style={{
                  padding: '8px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: timeFilter === 'today' ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'rgba(0,0,0,0.04)',
                  color: timeFilter === 'today' ? 'white' : '#475569', fontWeight: 700, fontSize: '0.82rem',
                  boxShadow: timeFilter === 'today' ? '0 4px 12px rgba(245,158,11,0.3)' : 'none', transition: 'all 0.2s'
                }}>🔥 In The News (24h) <span style={{ float: 'right', opacity: 0.8 }}>{entries.filter(e => e.lastNewsDate && (new Date() - new Date(e.lastNewsDate)) / (1000*60*60*24) <= 1).length}</span></button>
                {timeFilter === 'today' && (
                  <div style={{ padding: '10px', background: 'rgba(245,158,11,0.05)', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.1)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b45309', marginBottom: '8px', textTransform: 'uppercase' }}>Daily Map Anchors</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '150px', overflowY: 'auto' }}>
                      {filteredEntries.map(e => (
                        <div key={e.id} onClick={() => {
                          if (e.lat && e.lon && mapRef.current) mapRef.current.flyTo([e.lat, e.lon], 6)
                          setSelectedEntry(e)
                        }} style={{ fontSize: '0.8rem', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 8px', borderRadius: '6px', transition: 'background 0.2s', fontWeight: 600 }} 
                        onMouseOver={e => e.currentTarget.style.background = 'white'} 
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                           📌 {e.name}
                        </div>
                      ))}
                      {filteredEntries.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '12px 8px' }}>
                          <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>📡</div>
                          <span style={{fontSize: '0.78rem', color: '#92400e', fontWeight: 700, display: 'block'}}>No news intelligence for today yet</span>
                          <span style={{fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginTop: '4px'}}>
                            The AI pipeline runs daily. Add a GNews API key in your environment variables for live intelligence.
                          </span>
                        </div>
                      )}
                    </div>
                    {filteredEntries.length > 0 && (
                      <button onClick={exportDailySummary} style={{
                        marginTop: '10px', width: '100%', padding: '8px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(245,158,11,0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px'
                      }}>🖨️ Print Detailed Summary</button>
                    )}
                  </div>
                )}
                <button onClick={() => setTimeFilter('month')} style={{
                  padding: '8px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: timeFilter === 'month' ? 'linear-gradient(135deg, #8b5cf6, #d946ef)' : 'rgba(0,0,0,0.04)',
                  color: timeFilter === 'month' ? 'white' : '#475569', fontWeight: 700, fontSize: '0.82rem',
                  boxShadow: timeFilter === 'month' ? '0 4px 12px rgba(139,92,246,0.3)' : 'none', transition: 'all 0.2s'
                }}>📅 In The News (30d) <span style={{ float: 'right', opacity: 0.8 }}>{entries.filter(e => e.lastNewsDate && (new Date() - new Date(e.lastNewsDate)) / (1000*60*60*24) <= 30).length}</span></button>
                {timeFilter === 'month' && filteredEntries.length === 0 && (
                  <div style={{ padding: '10px', background: 'rgba(139,92,246,0.05)', borderRadius: '10px', border: '1px solid rgba(139,92,246,0.1)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>📡</div>
                    <span style={{fontSize: '0.78rem', color: '#6d28d9', fontWeight: 700, display: 'block'}}>No news intelligence in the last 30 days</span>
                    <span style={{fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginTop: '4px'}}>
                      Set up your GNews API key and run the daily cron job to populate intelligence data.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* FILTERS */}
            <div className="section-card">
              <div className="section-title">Intelligence Filters</div>
              {filtersActive && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 14px', background: 'rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                  <span style={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: 700 }}>Showing {filteredEntries.length} of {entries.length}</span>
                  <button onClick={() => { setActiveTag(''); setActiveYear(''); setSearchQuery('') }} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Clear ✕</button>
                </div>
              )}
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label className="filter-label">UPSC Topic Tag</label>
                  <select value={activeTag} onChange={e => setActiveTag(e.target.value)} className="filter-select">
                    <option value="">All Tags</option>
                    {allTags.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="filter-label">Relevance Year</label>
                  <select value={activeYear} onChange={e => setActiveYear(e.target.value)} className="filter-select">
                    <option value="">All Years</option>
                    {allYears.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* GEOGRAPHIC LAYERS */}
            <div className="section-card">
              <div className="section-title">Geographic Layers</div>
              {CATEGORIES.map(cat => {
                const isOn = layers[cat.key]
                return (
                  <div key={cat.key} className={`layer-row ${isOn ? 'on' : 'off'}`} onClick={() => toggleLayer(cat.key)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isOn ? cat.color : '#cbd5e1', boxShadow: isOn ? `0 0 0 3px ${cat.color}33` : 'none', transition: 'all 0.3s', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isOn ? '#0f172a' : '#94a3b8', transition: 'color 0.3s' }}>{cat.emoji} {cat.label}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{categoryCount(cat.key)} entries</div>
                      </div>
                    </div>
                    <div className={`toggle-switch ${isOn ? 'on' : ''}`}><div className="toggle-knob" /></div>
                  </div>
                )
              })}
              
              <div className={`layer-row ${heatmapMode ? 'on' : 'off'}`} onClick={() => setHeatmapMode(!heatmapMode)} style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: heatmapMode ? '#ef4444' : '#e2e8f0', transition: 'all 0.3s', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: heatmapMode ? '#0f172a' : '#94a3b8' }}>🔥 Heatmap Mode</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>View data density</div>
                  </div>
                </div>
                <div className={`toggle-switch ${heatmapMode ? 'on' : ''}`}><div className="toggle-knob" /></div>
              </div>
            </div>

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
          
          <MapWrapper
            key={regionKey}
            entries={filteredEntries}
            layers={layers}
            mapRef={mapRef}
            initialCenter={region.center}
            initialZoom={region.zoom}
            initialMinZoom={region.minZoom}
            maxBounds={region.bounds}
            onEntrySelect={setSelectedEntry}
            heatmapMode={heatmapMode}
            selectedEntry={selectedEntry}
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
              if (matchedEntry) setSelectedEntry(matchedEntry)
            }
          }} />
        </section>
      </main>
    </div>
  )
}

export default function MapPage() {
  return (
    <Suspense fallback={
      <div style={{ height: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.1rem', fontFamily: "'Outfit',sans-serif" }}>
        Loading map…
      </div>
    }>
      <MapPageInner />
    </Suspense>
  )
}

import { NextResponse } from 'next/server'
import { getGeminiModel } from '@/lib/gemini'
import { createHash } from 'node:crypto'
import { getServerSession } from 'next-auth/next'

import prisma from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const REGION_CONFIG = {
  asia: {
    label: 'Asia & Pacific',
    bounds: [-10, 55, 60, 180],
  },
  middle_east: {
    label: 'Middle East',
    bounds: [10, 42, 25, 65],
  },
  africa: {
    label: 'Africa',
    bounds: [-35, 38, -20, 55],
  },
  indian_ocean: {
    label: 'Indian Ocean',
    bounds: [-40, 25, 40, 100],
  },
  europe: {
    label: 'Europe',
    bounds: [35, 72, -25, 45],
  },
  americas: {
    label: 'Americas',
    bounds: [-60, 60, -170, -30],
  },
  global: {
    label: 'Global View',
    bounds: null,
  },
}

const MAPBOT_MODES = {
  node_explainer: {
    label: 'Node Explainer',
    entryRequired: true,
  },
  region_tutor: {
    label: 'Region Tutor',
    entryRequired: false,
  },
  news_interpreter: {
    label: 'News-to-Map Interpreter',
    entryRequired: false,
  },
  prelims_generator: {
    label: 'Prelims Generator',
    entryRequired: false,
  },
  chat: {
    label: 'AI Chat',
    entryRequired: false,
  },
}

const CHAT_USAGE_LIMITS = {
  anonymous: 3,
  FREE: 6,
  PRO: 30,
  PREMIUM: null,
}

function getIstDayWindow(referenceDate = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const parts = formatter.formatToParts(referenceDate)
  const year = Number(parts.find((part) => part.type === 'year')?.value)
  const month = Number(parts.find((part) => part.type === 'month')?.value)
  const day = Number(parts.find((part) => part.type === 'day')?.value)
  const istOffsetMs = 5.5 * 60 * 60 * 1000
  const start = new Date(Date.UTC(year, month - 1, day) - istOffsetMs)
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)

  return {
    dayKey: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    start,
    end,
  }
}

function getRequestIp(req) {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || null
  }

  return req.headers.get('x-real-ip') || null
}

function getChatLimitForTier(tier) {
  if (!tier) return CHAT_USAGE_LIMITS.anonymous
  if (Object.prototype.hasOwnProperty.call(CHAT_USAGE_LIMITS, tier)) {
    return CHAT_USAGE_LIMITS[tier]
  }
  return CHAT_USAGE_LIMITS.FREE
}

function buildChatUsage(identity, count) {
  if (!identity) return null

  const exhausted = identity.limit != null && count >= identity.limit
  return {
    scope: identity.scope,
    tier: identity.tier,
    dayKey: identity.dayKey,
    used: count,
    limit: identity.limit,
    remaining: identity.limit == null ? null : Math.max(identity.limit - count, 0),
    exhausted,
  }
}

async function resolveChatIdentity(req) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id || null
  const tier = session?.user?.tier || (userId ? 'FREE' : null)
  const { dayKey, start, end } = getIstDayWindow()

  if (userId) {
    return {
      scope: 'user',
      userId,
      tier,
      limit: getChatLimitForTier(tier),
      dayKey,
      start,
      end,
      identifierHash: null,
    }
  }

  const identifierHash = hashPayload({
    ip: getRequestIp(req) || 'unknown',
    userAgent: req.headers.get('user-agent') || 'unknown',
  })

  return {
    scope: 'anonymous',
    userId: null,
    tier: 'ANON',
    limit: getChatLimitForTier(null),
    dayKey,
    start,
    end,
    identifierHash,
  }
}

async function getChatUsageState(identity) {
  if (!identity) return null

  try {
    const where = {
      action: 'MAPBOT_CHAT',
      createdAt: {
        gte: identity.start,
        lt: identity.end,
      },
    }

    if (identity.userId) {
      where.userId = identity.userId
    } else {
      where.details = {
        contains: `"identifierHash":"${identity.identifierHash}"`,
      }
    }

    const used = await prisma.actionLog.count({ where })
    return buildChatUsage(identity, used)
  } catch (error) {
    console.error('[MapBot] Failed to read chat usage:', error)
    return buildChatUsage(identity, 0)
  }
}

async function recordChatUsage(identity, prompt, response) {
  if (!identity) return null

  try {
    await prisma.actionLog.create({
      data: {
        action: 'MAPBOT_CHAT',
        userId: identity.userId,
        details: JSON.stringify({
          dayKey: identity.dayKey,
          scope: identity.scope,
          tier: identity.tier,
          identifierHash: identity.identifierHash,
          promptLength: prompt.length,
          responseTitle: response?.title || 'MapBot Chat',
        }),
      },
    })
  } catch (error) {
    console.error('[MapBot] Failed to persist chat usage:', error)
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    if (searchParams.get('usage') !== 'chat') {
      return NextResponse.json({ error: 'Unsupported MapBot query.' }, { status: 400 })
    }

    const identity = await resolveChatIdentity(req)
    const usage = await getChatUsageState(identity)

    return NextResponse.json({ usage })
  } catch (error) {
    console.error('[MapBot] Usage request failed:', error)
    return NextResponse.json({ error: 'MapBot usage request failed.' }, { status: 500 })
  }
}

function formatDate(value) {
  if (!value) return 'Unknown'
  try {
    return new Date(value).toISOString().split('T')[0]
  } catch {
    return 'Unknown'
  }
}

function toList(value) {
  if (!value) return []
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function trimText(value, maxLength = 900) {
  if (!value) return ''
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value
}

function filterEntriesForRegion(entries, regionKey) {
  const region = REGION_CONFIG[regionKey] || REGION_CONFIG.global
  if (!region.bounds) return entries

  const [minLat, maxLat, minLon, maxLon] = region.bounds
  return entries.filter((entry) => {
    if (entry.lat == null || entry.lon == null) return false
    return (
      entry.lat >= minLat &&
      entry.lat <= maxLat &&
      entry.lon >= minLon &&
      entry.lon <= maxLon
    )
  })
}

function summarizeEntry(entry) {
  if (!entry) return null

  return {
    id: entry.id,
    name: entry.name,
    category: entry.category,
    year: entry.year,
    tags: toList(entry.tags),
    coordinates:
      entry.lat != null && entry.lon != null
        ? `${Number(entry.lat).toFixed(3)}, ${Number(entry.lon).toFixed(3)}`
        : null,
    prelims: trimText(entry.prelims, 700),
    mains: trimText(entry.mains, 900),
    india: trimText(entry.india, 700),
    lastNewsDate: formatDate(entry.lastNewsDate),
    newsMentions: trimText(entry.newsMentions, 1200),
  }
}

function normalizeEntrySnapshot(entry) {
  if (!entry) return null
  return {
    ...entry,
    lat: entry.lat == null ? null : Number(entry.lat),
    lon: entry.lon == null ? null : Number(entry.lon),
    year: entry.year == null ? null : Number(entry.year),
  }
}

function buildRegionDigest(entries) {
  const categoryCounts = entries.reduce((acc, entry) => {
    acc[entry.category] = (acc[entry.category] || 0) + 1
    return acc
  }, {})

  const hotEntries = entries
    .filter((entry) => entry.lastNewsDate)
    .sort((a, b) => new Date(b.lastNewsDate) - new Date(a.lastNewsDate))
    .slice(0, 6)
    .map((entry) => ({
      name: entry.name,
      category: entry.category,
      year: entry.year,
      lastNewsDate: formatDate(entry.lastNewsDate),
      prelims: trimText(entry.prelims, 220),
      mains: trimText(entry.mains, 260),
      india: trimText(entry.india, 220),
      newsMentions: trimText(entry.newsMentions, 320),
    }))

  const foundationalEntries = entries.slice(0, 8).map((entry) => ({
    name: entry.name,
    category: entry.category,
    year: entry.year,
    tags: toList(entry.tags),
    prelims: trimText(entry.prelims, 180),
    mains: trimText(entry.mains, 220),
  }))

  return {
    totalEntries: entries.length,
    categoryCounts,
    hotEntries,
    foundationalEntries,
  }
}

function serializeFollowups(followups) {
  if (!Array.isArray(followups)) return null
  return JSON.stringify(followups.slice(0, 5))
}

function deserializeFollowups(value) {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function hashPayload(value) {
  return createHash('sha256')
    .update(JSON.stringify(value))
    .digest('hex')
}

function buildNodeSourceHash(entry) {
  if (!entry) return null
  return hashPayload({
    id: entry.id,
    name: entry.name,
    category: entry.category,
    year: entry.year,
    tags: entry.tags || '',
    prelims: entry.prelims || '',
    mains: entry.mains || '',
    india: entry.india || '',
    newsMentions: entry.newsMentions || '',
    updatedAt: entry.updatedAt || null,
    lastNewsDate: entry.lastNewsDate || null,
  })
}

function buildNewsSourceHash(entry) {
  if (!entry) return null
  return hashPayload({
    id: entry.id,
    name: entry.name,
    category: entry.category,
    lastNewsDate: entry.lastNewsDate || null,
    newsMentions: entry.newsMentions || '',
    prelims: entry.prelims || '',
    mains: entry.mains || '',
    india: entry.india || '',
    updatedAt: entry.updatedAt || null,
  })
}

function buildRegionSourceHash(regionKey, entries) {
  return hashPayload({
    regionKey,
    entries: entries
      .map((entry) => ({
        id: entry.id,
        name: entry.name,
        category: entry.category,
        year: entry.year,
        updatedAt: entry.updatedAt || null,
        lastNewsDate: entry.lastNewsDate || null,
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
  })
}

function buildQuizSourceHash(scopeType, scopeId, regionKey, entries, selectedEntry) {
  return hashPayload({
    scopeType,
    scopeId,
    regionKey,
    selectedEntry: selectedEntry
      ? {
          id: selectedEntry.id,
          name: selectedEntry.name,
          category: selectedEntry.category,
          year: selectedEntry.year,
          tags: selectedEntry.tags || '',
          prelims: selectedEntry.prelims || '',
          mains: selectedEntry.mains || '',
          india: selectedEntry.india || '',
          updatedAt: selectedEntry.updatedAt || null,
          lastNewsDate: selectedEntry.lastNewsDate || null,
        }
      : null,
    entries: entries.slice(0, 20).map((entry) => ({
      id: entry.id,
      name: entry.name,
      category: entry.category,
      year: entry.year,
      tags: entry.tags || '',
      prelims: entry.prelims || '',
      lastNewsDate: entry.lastNewsDate || null,
      updatedAt: entry.updatedAt || null,
    })),
  })
}

function formatCachedResponse({ title, contextLabel, markdown, suggestedFollowups }) {
  return {
    title,
    contextLabel,
    markdown,
    suggestedFollowups: Array.isArray(suggestedFollowups)
      ? suggestedFollowups
      : deserializeFollowups(suggestedFollowups),
  }
}

function buildPrompt({ mode, regionKey, regionEntries, selectedEntry, userPrompt, chatHistory = [] }) {
  const modeConfig = MAPBOT_MODES[mode]
  const region = REGION_CONFIG[regionKey] || REGION_CONFIG.global
  const regionDigest = buildRegionDigest(regionEntries)
  const entrySummary = summarizeEntry(selectedEntry)

  const sharedRules = [
    'You are MapBot for UPSCGPT, an AI tutor embedded inside a UPSC strategic atlas.',
    'Keep the output exam-ready, easy to revise, and anchored in the given atlas data only.',
    'Do not invent locations, treaties, organisations, or current developments that are not supported by the provided context.',
    'Prefer crisp markdown with short sections, bullets, and comparison framing where useful.',
    'Every answer must connect geography to UPSC relevance.',
  ].join('\n')

  const modeInstructions = {
    node_explainer: `
Mode: Node Explainer
Goal: Explain the selected map location in simple but exam-ready language.
Required structure inside markdown:
- "Why This Place Matters"
- "Prelims Lens"
- "Mains Lens"
- "India Angle"
- "Revise Fast" with 3 short bullets
`,
    region_tutor: `
Mode: Region Tutor
Goal: Summarize the most important strategic themes in this region for UPSC.
Required structure inside markdown:
- "Region Snapshot"
- "Most Important Themes"
- "High-Value Locations to Revise"
- "Likely UPSC Angles"
- "7-Day Revision Plan" with 4 short bullets
`,
    news_interpreter: `
Mode: News-to-Map Interpreter
Goal: Explain recent news in map-linked language.
Required structure inside markdown:
- "What Happened"
- "Where It Happened"
- "Why It Matters Strategically"
- "How UPSC May Ask It"
- "Map Revision Hook"
If no strong recent-news context exists, say so clearly and shift to the freshest available atlas-linked developments.
`,
    prelims_generator: `
Mode: Prelims Generator
Goal: Generate UPSC-style map-based MCQs from the atlas context.
Required structure inside markdown:
- Short intro line
- 5 MCQs, each with 4 options
- Correct answer after each question
- 1-line explanation after each answer
- End with "Common Traps" and 3 bullets
Questions must be solvable from the provided atlas context and regional themes.
`,
    chat: `
Mode: AI Chat
Goal: Answer the student's question in a conversational but exam-smart way.
Required structure inside markdown:
- Give a direct answer first
- Then add "UPSC Lens"
- Then add "What To Revise Next"
Keep it tight unless the student's query clearly asks for depth.
`,
  }

  return `${sharedRules}

Return strictly valid JSON with this shape and no markdown fences:
{
  "title": "short title",
  "contextLabel": "selected node or region label",
  "markdown": "full markdown response",
  "suggestedFollowups": ["short CTA", "short CTA", "short CTA"]
}

${modeInstructions[mode]}

Mode label: ${modeConfig.label}
Region: ${region.label}
Student prompt: ${userPrompt || 'No freeform prompt provided'}

Recent chat history:
${JSON.stringify(chatHistory.slice(-6), null, 2)}

Selected entry context:
${JSON.stringify(entrySummary, null, 2)}

Region digest:
${JSON.stringify(regionDigest, null, 2)}
`
}

function buildFallback(mode, regionKey, regionEntries, selectedEntry, userPrompt) {
  const region = REGION_CONFIG[regionKey] || REGION_CONFIG.global

  if (mode === 'node_explainer') {
    if (!selectedEntry) {
      return {
        title: 'Pick a map node',
        contextLabel: region.label,
        markdown:
          'Select a location on the map to trigger the node explainer. MapBot needs one atlas node to break down its strategic significance, UPSC framing, and India angle.',
        suggestedFollowups: ['Open a location', 'Try Region Tutor', 'Generate Prelims'],
      }
    }

    const tags = toList(selectedEntry.tags)
    return {
      title: `${selectedEntry.name} Explained`,
      contextLabel: selectedEntry.name,
      markdown: `### Why This Place Matters
- Category: **${selectedEntry.category || 'general'}**
- Coordinates: **${selectedEntry.lat != null && selectedEntry.lon != null ? `${Number(selectedEntry.lat).toFixed(3)}, ${Number(selectedEntry.lon).toFixed(3)}` : 'Not mapped yet'}**
- Atlas relevance year: **${selectedEntry.year || 'Current affairs linked'}**

### Prelims Lens
${selectedEntry.prelims || '- Prelims notes are not filled yet for this node.'}

### Mains Lens
${selectedEntry.mains || '- Mains framing is not filled yet for this node.'}

### India Angle
${selectedEntry.india || '- India-specific strategic framing is still being expanded for this node.'}

### Revise Fast
- Tags: ${tags.length ? tags.join(', ') : 'No tags yet'}
- Latest news link date: ${formatDate(selectedEntry.lastNewsDate)}
- Use this node to connect static geography with contemporary affairs.`,
      suggestedFollowups: ['Interpret linked news', 'Generate prelims', 'Switch to region tutor'],
    }
  }

  if (mode === 'region_tutor') {
    const hotEntries = regionEntries.filter((entry) => entry.lastNewsDate).slice(0, 5)
    return {
      title: `${region.label} Tutor`,
      contextLabel: region.label,
      markdown: `### Region Snapshot
- Total atlas nodes in focus: **${regionEntries.length}**
- Recent news-linked nodes: **${hotEntries.length}**

### Most Important Themes
- Strategic chokepoints, conflict flashpoints, and high-value geography are the anchors for this region.
- Focus on how geography affects trade, security, and India's diplomatic choices.

### High-Value Locations to Revise
${regionEntries
  .slice(0, 6)
  .map((entry) => `- **${entry.name}** (${entry.category})`)
  .join('\n') || '- No mapped entries yet for this region.'}

### Likely UPSC Angles
- Location-based prelims identification
- Regional conflict and alliance mapping
- India's maritime, economic, or diplomatic stake

### 7-Day Revision Plan
- Day 1: Learn the map skeleton and chokepoints
- Day 2: Revise the top conflict and diplomacy nodes
- Day 3: Connect current affairs to key map locations
- Day 4: Practice prelims elimination from this region`,
      suggestedFollowups: ['Explain a node', 'Interpret fresh news', 'Generate prelims'],
    }
  }

  if (mode === 'news_interpreter') {
    const focusEntry =
      selectedEntry ||
      regionEntries.find((entry) => entry.lastNewsDate) ||
      regionEntries[0]

    return {
      title: 'News-to-Map Interpreter',
      contextLabel: focusEntry?.name || region.label,
      markdown: `### What Happened
- ${focusEntry?.newsMentions ? 'This node has recent atlas-linked news updates that should be studied through a geography lens.' : 'No rich news log is available yet, so use the latest atlas node as the anchor.'}

### Where It Happened
- Primary map anchor: **${focusEntry?.name || 'No entry selected'}**
- Region: **${region.label}**

### Why It Matters Strategically
- The value lies in linking the event to location, route, region, and actor interests.
- UPSC usually rewards candidates who explain *why this geography matters* instead of only summarizing the headline.

### How UPSC May Ask It
- A prelims question may test location, organisation, strait, route, or sequence.
- A mains question may ask for implications for regional stability and India's response.

### Map Revision Hook
- Revisit nearby nodes and compare this event with at least one adjacent chokepoint, conflict zone, or strategic route.`,
      suggestedFollowups: ['Generate prelims', 'Open node explainer', 'Switch region tutor'],
    }
  }

  if (mode === 'chat') {
    return {
      title: 'MapBot Chat',
      contextLabel: selectedEntry?.name || region.label,
      markdown: `I can help with atlas-linked questions in this region${selectedEntry ? ` and around **${selectedEntry.name}**` : ''}.

### UPSC Lens
- Ask for comparisons, India angle, prelims traps, or mains framing.
- Good prompts: "Why is this location important for India?" or "Turn this node into a 10-marker answer."

### What To Revise Next
- Use the selected node as your anchor
- Compare it with one nearby strategic location
- Ask for 3 MCQs or a 150-word answer next`,
      suggestedFollowups: [
        userPrompt ? 'Refine this answer' : 'Explain the selected node',
        'Give 3 MCQs',
        'Add India angle',
      ],
    }
  }

  return {
    title: `${region.label} Prelims Drill`,
    contextLabel: selectedEntry?.name || region.label,
    markdown: `Generate prelims is ready, but Gemini is not configured in this environment. Once \`GEMINI_API_KEY\` is present, MapBot will turn atlas context into full MCQs with answer keys and traps.`,
    suggestedFollowups: ['Explain a node', 'Interpret linked news', 'Use region tutor'],
  }
}

async function getNodeExplainerCache(selectedEntry) {
  if (!selectedEntry?.aiNodeSummaryMarkdown) return null

  const sourceHash = buildNodeSourceHash(selectedEntry)
  if (!sourceHash || selectedEntry.aiNodeSummarySourceHash !== sourceHash) return null

  return formatCachedResponse({
    title: selectedEntry.aiNodeSummaryTitle || `${selectedEntry.name} Explained`,
    contextLabel: selectedEntry.name,
    markdown: selectedEntry.aiNodeSummaryMarkdown,
    suggestedFollowups: selectedEntry.aiNodeSummaryFollowups,
  })
}

async function saveNodeExplainerCache(selectedEntry, response) {
  if (!selectedEntry?.id) return

  try {
    await prisma.mapEntry.update({
      where: { id: selectedEntry.id },
      data: {
        aiNodeSummaryTitle: response.title,
        aiNodeSummaryMarkdown: response.markdown,
        aiNodeSummaryFollowups: serializeFollowups(response.suggestedFollowups),
        aiNodeSummarySourceHash: buildNodeSourceHash(selectedEntry),
        aiNodeSummaryUpdatedAt: new Date(),
      },
    })
  } catch (error) {
    console.error('[MapBot] Failed to persist node cache:', error)
  }
}

async function getNewsInterpreterCache(selectedEntry) {
  if (!selectedEntry?.aiNewsSummaryMarkdown) return null

  const sourceHash = buildNewsSourceHash(selectedEntry)
  if (!sourceHash || selectedEntry.aiNewsSummarySourceHash !== sourceHash) return null

  return formatCachedResponse({
    title: selectedEntry.aiNewsSummaryTitle || 'News-to-Map Interpreter',
    contextLabel: selectedEntry.name,
    markdown: selectedEntry.aiNewsSummaryMarkdown,
    suggestedFollowups: selectedEntry.aiNewsSummaryFollowups,
  })
}

async function saveNewsInterpreterCache(selectedEntry, response) {
  if (!selectedEntry?.id) return

  try {
    await prisma.mapEntry.update({
      where: { id: selectedEntry.id },
      data: {
        aiNewsSummaryTitle: response.title,
        aiNewsSummaryMarkdown: response.markdown,
        aiNewsSummaryFollowups: serializeFollowups(response.suggestedFollowups),
        aiNewsSummarySourceHash: buildNewsSourceHash(selectedEntry),
        aiNewsSummaryUpdatedAt: new Date(),
      },
    })
  } catch (error) {
    console.error('[MapBot] Failed to persist news cache:', error)
  }
}

async function getRegionTutorCache(regionKey, regionEntries) {
  const sourceHash = buildRegionSourceHash(regionKey, regionEntries)

  try {
    const cached = await prisma.regionInsightCache.findUnique({
      where: {
        regionKey_mode: {
          regionKey,
          mode: 'region_tutor',
        },
      },
    })

    if (!cached || cached.sourceHash !== sourceHash) return null

    return formatCachedResponse({
      title: cached.title,
      contextLabel: cached.contextLabel,
      markdown: cached.markdown,
      suggestedFollowups: cached.suggestedFollowups,
    })
  } catch (error) {
    console.error('[MapBot] Failed to read region cache:', error)
    return null
  }
}

async function saveRegionTutorCache(regionKey, regionEntries, response) {
  try {
    await prisma.regionInsightCache.upsert({
      where: {
        regionKey_mode: {
          regionKey,
          mode: 'region_tutor',
        },
      },
      update: {
        title: response.title,
        contextLabel: response.contextLabel,
        markdown: response.markdown,
        suggestedFollowups: serializeFollowups(response.suggestedFollowups),
        sourceHash: buildRegionSourceHash(regionKey, regionEntries),
      },
      create: {
        regionKey,
        mode: 'region_tutor',
        title: response.title,
        contextLabel: response.contextLabel,
        markdown: response.markdown,
        suggestedFollowups: serializeFollowups(response.suggestedFollowups),
        sourceHash: buildRegionSourceHash(regionKey, regionEntries),
      },
    })
  } catch (error) {
    console.error('[MapBot] Failed to persist region cache:', error)
  }
}

async function getQuizPackCache(scopeType, scopeId, mode, sourceHash) {
  try {
    const cached = await prisma.quizPack.findUnique({
      where: {
        scopeType_scopeId_mode: {
          scopeType,
          scopeId,
          mode,
        },
      },
    })

    if (!cached || cached.sourceHash !== sourceHash) return null

    return formatCachedResponse({
      title: cached.title,
      contextLabel: cached.contextLabel,
      markdown: cached.markdown,
      suggestedFollowups: cached.suggestedFollowups,
    })
  } catch (error) {
    console.error('[MapBot] Failed to read quiz cache:', error)
    return null
  }
}

async function saveQuizPackCache(scopeType, scopeId, mode, sourceHash, response) {
  try {
    await prisma.quizPack.upsert({
      where: {
        scopeType_scopeId_mode: {
          scopeType,
          scopeId,
          mode,
        },
      },
      update: {
        title: response.title,
        contextLabel: response.contextLabel,
        markdown: response.markdown,
        suggestedFollowups: serializeFollowups(response.suggestedFollowups),
        sourceHash,
      },
      create: {
        scopeType,
        scopeId,
        mode,
        title: response.title,
        contextLabel: response.contextLabel,
        markdown: response.markdown,
        suggestedFollowups: serializeFollowups(response.suggestedFollowups),
        sourceHash,
      },
    })
  } catch (error) {
    console.error('[MapBot] Failed to persist quiz cache:', error)
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const mode = body?.mode
    const regionKey = body?.regionKey || 'global'
    const entryId = body?.entryId || null
    const userPrompt = body?.userPrompt?.trim() || ''
    const chatHistory = Array.isArray(body?.chatHistory) ? body.chatHistory : []
    const entriesSnapshot = Array.isArray(body?.entriesSnapshot)
      ? body.entriesSnapshot.map(normalizeEntrySnapshot).filter(Boolean)
      : []
    const selectedEntrySnapshot = normalizeEntrySnapshot(body?.selectedEntrySnapshot)

    if (!MAPBOT_MODES[mode]) {
      return NextResponse.json({ error: 'Unsupported MapBot mode.' }, { status: 400 })
    }

    const chatIdentity = mode === 'chat' ? await resolveChatIdentity(req) : null

    let allEntries = entriesSnapshot

    if (allEntries.length === 0) {
      try {
        allEntries = await prisma.mapEntry.findMany({
          orderBy: [
            { lastNewsDate: 'desc' },
            { updatedAt: 'desc' },
          ],
        })
      } catch (error) {
        console.error('[MapBot] DB fetch failed, falling back to client snapshot:', error)
      }
    }

    const regionEntries = filterEntriesForRegion(allEntries, regionKey)
    const selectedEntry = entryId
      ? allEntries.find((entry) => entry.id === entryId) || selectedEntrySnapshot || null
      : selectedEntrySnapshot || null

    if (MAPBOT_MODES[mode].entryRequired && !selectedEntry) {
      return NextResponse.json(buildFallback(mode, regionKey, regionEntries, null, userPrompt))
    }

    if (mode === 'node_explainer') {
      const cachedNode = await getNodeExplainerCache(selectedEntry)
      if (cachedNode) {
        return NextResponse.json(cachedNode)
      }
    }

    if (mode === 'region_tutor') {
      const cachedRegion = await getRegionTutorCache(regionKey, regionEntries)
      if (cachedRegion) {
        return NextResponse.json(cachedRegion)
      }
    }

    if (mode === 'news_interpreter' && selectedEntry) {
      const cachedNews = await getNewsInterpreterCache(selectedEntry)
      if (cachedNews) {
        return NextResponse.json(cachedNews)
      }
    }

    if (mode === 'prelims_generator') {
      const scopeType = selectedEntry ? 'entry' : 'region'
      const scopeId = selectedEntry?.id || regionKey
      const quizSourceHash = buildQuizSourceHash(
        scopeType,
        scopeId,
        regionKey,
        regionEntries,
        selectedEntry
      )
      const cachedQuiz = await getQuizPackCache(scopeType, scopeId, mode, quizSourceHash)
      if (cachedQuiz) {
        return NextResponse.json(cachedQuiz)
      }
    }

    const chatUsage = mode === 'chat' ? await getChatUsageState(chatIdentity) : null
    if (mode === 'chat' && chatUsage?.limit != null && chatUsage.used >= chatUsage.limit) {
      return NextResponse.json(
        {
          error:
            chatUsage.scope === 'anonymous'
              ? 'Live AI chat limit reached for today. Sign in to continue with a higher daily allowance.'
              : 'Live AI chat limit reached for today. Try again tomorrow or upgrade your plan for more usage.',
          usage: chatUsage,
        },
        { status: 429 }
      )
    }

    const prompt = buildPrompt({
      mode,
      regionKey,
      regionEntries,
      selectedEntry,
      userPrompt,
      chatHistory,
    })

    try {
      const model = getGeminiModel(mode === 'chat' ? 'chat' : 'analysis')
      if (!model) {
        return NextResponse.json(buildFallback(mode, regionKey, regionEntries, selectedEntry, userPrompt))
      }

      const response = await model.generateContent(prompt)

      const rawText = response.text
        .trim()
        .replace(/^```json\n?/, '')
        .replace(/\n?```$/, '')
        .replace(/^```\n?/, '')
        .replace(/\n?```$/, '')

      const parsed = JSON.parse(rawText)
      if (mode === 'node_explainer') {
        await saveNodeExplainerCache(selectedEntry, parsed)
      }
      if (mode === 'region_tutor') {
        await saveRegionTutorCache(regionKey, regionEntries, parsed)
      }
      if (mode === 'news_interpreter' && selectedEntry) {
        await saveNewsInterpreterCache(selectedEntry, parsed)
      }
      if (mode === 'prelims_generator') {
        const scopeType = selectedEntry ? 'entry' : 'region'
        const scopeId = selectedEntry?.id || regionKey
        const quizSourceHash = buildQuizSourceHash(
          scopeType,
          scopeId,
          regionKey,
          regionEntries,
          selectedEntry
        )
        await saveQuizPackCache(scopeType, scopeId, mode, quizSourceHash, parsed)
      }
      if (mode === 'chat') {
        await recordChatUsage(chatIdentity, userPrompt, parsed)
        const nextUsage = buildChatUsage(chatIdentity, (chatUsage?.used || 0) + 1)
        return NextResponse.json({
          ...parsed,
          usage: nextUsage,
        })
      }
      return NextResponse.json(parsed)
    } catch (error) {
      console.error('[MapBot] AI generation failed:', error)
      const fallback = buildFallback(mode, regionKey, regionEntries, selectedEntry, userPrompt)
      if (mode === 'chat' && chatUsage) {
        return NextResponse.json({
          ...fallback,
          usage: chatUsage,
        })
      }
      return NextResponse.json(fallback)
    }
  } catch (error) {
    console.error('[MapBot] Request failed:', error)
    return NextResponse.json({ error: 'MapBot request failed.' }, { status: 500 })
  }
}

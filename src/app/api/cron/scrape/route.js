import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { GoogleGenAI } from '@google/genai'

const prisma = new PrismaClient()
const delay = (ms) => new Promise(res => setTimeout(res, ms))

// ─────────────────────────────────────────────────────────────────────────────
// TARGETED UPSC PUBLICATIONS — Grouped for lean API usage (~14 calls total)
// ─────────────────────────────────────────────────────────────────────────────
const TRUSTED_SOURCES = {
  india_editorial: 'thehindu.com,indianexpress.com',
  india_business: 'livemint.com,business-standard.com,economictimes.indiatimes.com',
  global_strategic: 'nytimes.com,washingtonpost.com,bbc.com,aljazeera.com,thediplomat.com',
}

// Lean scrape plan: STRICTLY Economy + International Relations for mapping
const SCRAPE_PLAN = [
  // Indian Editorial — International Relations
  {
    label: 'India Editorial: Foreign Policy & IR',
    keywords: '"India foreign policy" OR "Indo-Pacific" OR "bilateral relations" OR "BRICS summit" OR "SCO summit" OR "G20 summit" OR "UN Security Council"',
    sourceGroup: 'india_editorial',
    max: 10,
  },
  {
    label: 'India Editorial: Defence & Strategic',
    keywords: '"India defence" OR "India navy" OR "India nuclear" OR "ISRO" OR "India border" OR "India China" OR "India Pakistan"',
    sourceGroup: 'india_editorial',
    max: 10,
  },

  // Indian Business — Economy Only
  {
    label: 'India Business: Macro Economy',
    keywords: '"RBI policy" OR "GDP growth" OR "fiscal deficit" OR "FDI India" OR "trade deficit" OR "economic survey" OR "India budget"',
    sourceGroup: 'india_business',
    max: 10,
  },
  {
    label: 'India Business: Trade & Investment',
    keywords: '"India trade agreement" OR "WTO India" OR "rupee dollar" OR "India export" OR "India import" OR "foreign exchange reserves"',
    sourceGroup: 'india_business',
    max: 10,
  },

  // Global Strategic — Conflicts, Alliances & Geography
  {
    label: 'Global: Conflicts & Alliances',
    keywords: '"NATO expansion" OR "Ukraine Russia" OR "South China Sea" OR "Taiwan strait" OR "Iran nuclear deal" OR "Abraham Accords"',
    sourceGroup: 'global_strategic',
    max: 10,
  },
  {
    label: 'Global: Strategic Geography & Trade Routes',
    keywords: '"Strait of Hormuz" OR "Suez Canal" OR "Arctic council" OR "Indian Ocean" OR "Malacca Strait" OR "maritime trade" OR "Panama Canal"',
    sourceGroup: 'global_strategic',
    max: 10,
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// FETCH FROM GNEWS WITH SOURCE FILTERING
// ─────────────────────────────────────────────────────────────────────────────
async function fetchFromGNews(keywords, sourceGroup, gnewsKey, max = 10) {
  const sourceDomains = TRUSTED_SOURCES[sourceGroup]
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(keywords)}&lang=en&max=${max}&sortby=publishedAt&in=title,description&apikey=${gnewsKey}`

  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      if (data?.articles?.length) {
        // Post-filter for trusted sources
        const trustedDomains = sourceDomains.split(',')
        const filtered = data.articles.filter(article => {
          try {
            const host = new URL(article.url).hostname.replace('www.', '')
            return trustedDomains.some(d => host.includes(d))
          } catch { return false }
        })
        // STRICT: Only return articles from trusted sources, never random ones
        return filtered
      }
    }
  } catch (e) {
    console.error(`[Cron] GNews fetch failed for "${sourceGroup}":`, e.message)
  }
  return []
}

// ─────────────────────────────────────────────────────────────────────────────
// DAILY SCRAPE + AI ENRICHMENT
// ─────────────────────────────────────────────────────────────────────────────
async function scrapeAndEnrich() {
  const gnewsKey = process.env.GNEWS_API_KEY
  const geminiKey = process.env.GEMINI_API_KEY

  const aiClient = geminiKey ? new GoogleGenAI({ apiKey: geminiKey }) : null
  const mapEntries = await prisma.mapEntry.findMany()

  let totalFetched = 0
  let totalEnriched = 0
  let totalCreated = 0
  let totalFiltered = 0

  for (const plan of SCRAPE_PLAN) {
    let articles = []

    if (gnewsKey && gnewsKey.trim() !== '' && !gnewsKey.includes('[')) {
      articles = await fetchFromGNews(plan.keywords, plan.sourceGroup, gnewsKey, plan.max)
    }

    totalFetched += articles.length
    console.log(`[Cron] "${plan.label}": fetched ${articles.length} articles.`)

    // AI Enrichment per article
    for (const article of articles) {
      if (!aiClient) continue

      try {
        await delay(4200) // Respect Gemini 15 RPM free tier

        const articleText = `${article.title} ${article.description || ''}`
        const sourceName = (() => {
          try { return new URL(article.url).hostname.replace('www.', '') } catch { return 'unknown' }
        })()

        const promptText = `You are a UPSC Civil Services exam preparation expert with deep knowledge of the UPSC syllabus (GS Paper I, II, III, IV and Essay).

Analyze this news article for UPSC relevance:

Article: "${articleText}"
Source: ${sourceName}

Return a strictly valid JSON object. No markdown. No code fences. Raw JSON only:
{
  "isGeopolitical": true,
  "upscRelevance": <integer 0-10>,
  "locationName": "Primary geographic entity/country/region name",
  "lat": <latitude as float>,
  "lon": <longitude as float>,
  "category": "conflict|strait|island|mineral|nature|economy|governance|diplomacy|general",
  "prelims": "2-3 key facts for UPSC Prelims MCQs (treaties, organisations, geographical facts, constitutional provisions)",
  "mainsDetails": "1-2 paragraphs of UPSC Mains background covering: historical context, India's position, constitutional/policy angle, international significance. Include which GS Paper this is relevant to.",
  "upscCrux": "• Strategic/geopolitical significance of this development\\n• India's stake, response, or diplomatic position\\n• UPSC syllabus link: specify GS Paper and exact topic"
}

UPSC Relevance Scale:
- 8-10: Direct UPSC syllabus topic (India's foreign policy, economy, governance, environment, geography)
- 5-7: Indirectly relevant (global trends, international organisations, bilateral relations)  
- 3-4: Mildly relevant (general international news with tangential India angle)
- 0-2: Not relevant for UPSC (entertainment, sports, tech products, celebrity news)

If NOT relevant for UPSC (score < 3): {"isGeopolitical": false, "upscRelevance": <score>}`

        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: promptText
        })

        let cleanText = response.text.trim()
          .replace(/^```json\n?/, '').replace(/\n?```$/, '')
          .replace(/^```\n?/, '').replace(/\n?```$/, '')

        const parsed = JSON.parse(cleanText)
        
        // Moderate filtering threshold: >= 3
        if (!parsed.isGeopolitical || parsed.upscRelevance < 3 || !parsed.locationName) {
          totalFiltered++
          continue
        }

        const formattedDate = new Date(article.publishedAt).toISOString().split('T')[0]
        const newMentionStr = `\n\n### [${article.title}](${article.url}) (${formattedDate})\n**Source:** ${sourceName} · **UPSC Relevance:** ${parsed.upscRelevance}/10\n\n**UPSC Crux:**\n${parsed.upscCrux}\n---`

        // Match against in-memory entries
        let matchedEntry = mapEntries.find(
          e => e.name.toLowerCase() === parsed.locationName.toLowerCase()
        )

        if (matchedEntry) {
          const existingMentions = matchedEntry.newsMentions || ''
          if (!existingMentions.includes(article.url)) {
            const updatedMains = (!matchedEntry.mains?.trim() && parsed.mainsDetails)
              ? parsed.mainsDetails : matchedEntry.mains
            const updatedPrelims = (!matchedEntry.prelims?.trim() && parsed.prelims)
              ? parsed.prelims : matchedEntry.prelims

            await prisma.mapEntry.update({
              where: { id: matchedEntry.id },
              data: {
                newsMentions: existingMentions + newMentionStr,
                lastNewsDate: new Date(),
                mains: updatedMains,
                prelims: updatedPrelims,
              }
            })
            matchedEntry.newsMentions = existingMentions + newMentionStr
            totalEnriched++
          }
        } else {
          const newEntry = await prisma.mapEntry.create({
            data: {
              name: parsed.locationName,
              lat: parsed.lat || 0,
              lon: parsed.lon || 0,
              category: parsed.category || 'general',
              prelims: parsed.prelims || 'Auto-generated by UPSCGPT Daily Cron Intelligence.',
              mains: parsed.mainsDetails || 'Context pending...',
              india: 'Strategic relevance to India pending AI analysis.',
              shape: 'marker',
              year: new Date().getFullYear(),
              newsMentions: newMentionStr,
              lastNewsDate: new Date()
            }
          })
          mapEntries.push(newEntry)
          totalCreated++
          console.log(`[Cron] 🆕 Auto-created: "${parsed.locationName}" (relevance: ${parsed.upscRelevance}/10)`)
        }
      } catch (err) {
        console.error(`[Cron] AI failed for: "${article.title}"`, err.message)
      }
    }
  }

  return { totalFetched, totalEnriched, totalCreated, totalFiltered }
}

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED CRON ENDPOINT
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[Cron] Unauthorized attempt blocked.')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()
  console.log(`[Cron] 🚀 Daily scrape started at ${new Date().toISOString()}`)

  try {
    const stats = await scrapeAndEnrich()
    const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(1)

    console.log(`[Cron] ✅ Done in ${durationSeconds}s — Fetched: ${stats.totalFetched}, Enriched: ${stats.totalEnriched}, Created: ${stats.totalCreated}, Filtered: ${stats.totalFiltered}`)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      durationSeconds,
      stats,
      sources: Object.keys(TRUSTED_SOURCES).map(k => `${k}: ${TRUSTED_SOURCES[k]}`),
    })
  } catch (error) {
    console.error('[Cron] ❌ Daily scrape failed:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

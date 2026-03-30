import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { GoogleGenAI } from '@google/genai'

const prisma = new PrismaClient()

// Rate Limiter: protects Gemini Free Tier (max 15 RPM)
const delay = (ms) => new Promise(res => setTimeout(res, ms))

// ─────────────────────────────────────────────────────────────────────────────
// TARGETED UPSC NEWS SOURCES — Grouped for lean API usage (Option B)
// 3 grouped queries × region variants = ~14 API calls per cron run
// ─────────────────────────────────────────────────────────────────────────────
const TRUSTED_SOURCES = {
  // Group 1: Indian Editorial (UPSC Core)
  india_editorial: 'thehindu.com,indianexpress.com',
  // Group 2: Indian Business/Economy  
  india_business: 'livemint.com,business-standard.com,economictimes.indiatimes.com',
  // Group 3: Global Strategic
  global_strategic: 'nytimes.com,washingtonpost.com,bbc.com,aljazeera.com,thediplomat.com',
}

// UPSC-relevant queries — STRICTLY Economy + International Relations only
const REGION_QUERIES = {
  asia: {
    keywords: '"Indo-Pacific" OR "South China Sea" OR "ASEAN summit" OR "Taiwan strait" OR "Quad alliance" OR "Belt and Road Initiative"',
    sourceGroup: 'global_strategic',
  },
  middle_east: {
    keywords: '"Strait of Hormuz" OR "Suez Canal" OR "OPEC" OR "Gulf cooperation council" OR "Iran nuclear deal" OR "Abraham Accords"',
    sourceGroup: 'global_strategic',
  },
  africa: {
    keywords: '"African Union" OR "Horn of Africa" OR "Sahel crisis" OR "BRICS Africa" OR "India Africa summit"',
    sourceGroup: 'global_strategic',
  },
  indian_ocean: {
    keywords: '"Indian Ocean" OR "Malacca Strait" OR "IORA" OR "String of Pearls" OR "India navy" OR "maritime trade route"',
    sourceGroup: 'india_editorial',
  },
  europe: {
    keywords: '"NATO expansion" OR "Ukraine Russia" OR "European Union summit" OR "Arctic council" OR "Russia sanctions"',
    sourceGroup: 'global_strategic',
  },
  americas: {
    keywords: '"Panama Canal" OR "US India relations" OR "BRICS summit" OR "G20 summit" OR "climate agreement"',
    sourceGroup: 'global_strategic',
  },
  global: {
    keywords: '"India foreign policy" OR "bilateral relations" OR "UN Security Council" OR "international trade" OR "India economy" OR "geopolitical"',
    sourceGroup: 'india_editorial',
  },
}

// India Economy + IR focused queries
const INDIA_FOCUS_QUERIES = [
  {
    keywords: '"RBI policy" OR "fiscal deficit" OR "GDP growth" OR "FDI India" OR "trade deficit" OR "economic survey" OR "India budget"',
    sourceGroup: 'india_business',
  },
  {
    keywords: '"India bilateral" OR "India diplomacy" OR "BRICS" OR "SCO summit" OR "India defence" OR "India nuclear" OR "India space ISRO"',
    sourceGroup: 'india_editorial',
  },
]

// Mock fallback articles when no GNEWS_API_KEY
const MOCK_NEWS = [
  { title: "BREAKING: Shifts in South China Sea alliances raise strategic concerns.", url: "https://thehindu.com/scs", description: "Alliance shifts in South China Sea.", publishedAt: new Date().toISOString() },
  { title: "REPORT: India-US bilateral talks focus on Indo-Pacific security framework.", url: "https://indianexpress.com/bilateral", description: "India-US bilateral talks.", publishedAt: new Date().toISOString() },
  { title: "ANALYSIS: RBI monetary policy implications for UPSC economy section.", url: "https://livemint.com/rbi", description: "RBI policy analysis.", publishedAt: new Date().toISOString() },
]

// ─────────────────────────────────────────────────────────────────────────────
// FETCH FROM GNEWS WITH SOURCE TARGETING
// ─────────────────────────────────────────────────────────────────────────────
async function fetchFromGNews(keywords, sourceGroup, gnewsKey, max = 10) {
  const sourceDomains = TRUSTED_SOURCES[sourceGroup]
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(keywords)}&lang=en&max=${max}&sortby=publishedAt&in=title,description&apikey=${gnewsKey}`
  
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (res.ok) {
      const data = await res.json()
      if (data?.articles?.length) {
        // Post-filter: only keep articles from trusted sources
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
    console.error(`[GNews] Fetch error for "${sourceGroup}":`, e.message)
  }
  return []
}

// ─────────────────────────────────────────────────────────────────────────────
// BACKGROUND AI ENRICHMENT — Enhanced with UPSC relevance scoring
// ─────────────────────────────────────────────────────────────────────────────
async function runAiEnrichment(articles) {
  const geminiKey = process.env.GEMINI_API_KEY
  if (!geminiKey) return

  const aiClient = new GoogleGenAI({ apiKey: geminiKey })
  const mapEntries = await prisma.mapEntry.findMany()

  for (const article of articles) {
    try {
      await delay(4200) // stay safely below 15 RPM free tier limit

      const articleText = `${article.title} ${article.description || ''}`
      const promptText = `You are a UPSC exam preparation expert. Analyze this news article for UPSC Civil Services relevance.

Article: "${articleText}"
Source: ${article.url || 'unknown'}

Return a strictly valid JSON object. No markdown. No code fences. Raw JSON only:
{
  "isGeopolitical": true,
  "upscRelevance": <integer 0-10 rating on how relevant this is for UPSC>,
  "locationName": "Primary geographic entity/country/region name",
  "lat": <latitude as float>,
  "lon": <longitude as float>,
  "category": "conflict|strait|island|mineral|nature|economy|governance|diplomacy|general",
  "prelims": "2-3 key facts useful for UPSC Prelims MCQs (treaties, organisations, geographical facts)",
  "mainsDetails": "1-2 paragraphs of UPSC Mains background: historical context, India's position, constitutional/policy angle, international significance",
  "upscCrux": "- Bullet 1: Strategic/geopolitical significance\\n- Bullet 2: India's stake and response\\n- Bullet 3: Key UPSC syllabus connection (GS Paper I/II/III)"
}

UPSC Relevance Scoring Guide:
- 8-10: Directly maps to UPSC syllabus (geopolitics, India's foreign policy, economy, governance, environment)
- 5-7: Indirectly relevant (global trends affecting India, international organisations)  
- 3-4: Mildly relevant (general international news with some India angle)
- 0-2: Not relevant (entertainment, sports, tech product launches)

If the article is NOT relevant for UPSC (score < 3), return: {"isGeopolitical": false, "upscRelevance": <score>}`

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptText
      })

      let cleanText = response.text.trim()
        .replace(/^```json\n?/, '').replace(/\n?```$/, '')
        .replace(/^```\n?/, '').replace(/\n?```$/, '')

      const parsed = JSON.parse(cleanText)
      
      // Filter out low-relevance articles (moderate threshold: >= 3)
      if (!parsed.isGeopolitical || parsed.upscRelevance < 3 || !parsed.locationName) continue

      const formattedDate = new Date(article.publishedAt).toISOString().split('T')[0]
      const sourceName = (() => {
        try { return new URL(article.url).hostname.replace('www.', '') } catch { return 'unknown' }
      })()
      const newMentionStr = `\n\n### [${article.title}](${article.url}) (${formattedDate})\n**Source:** ${sourceName} · **Relevance:** ${parsed.upscRelevance}/10\n\n**UPSC Crux:**\n${parsed.upscCrux}\n---`

      // Does this location already exist in the database?
      let matchedEntry = mapEntries.find(
        e => e.name.toLowerCase() === parsed.locationName.toLowerCase()
      )

      if (matchedEntry) {
        const existingMentions = matchedEntry.newsMentions || ''
        if (!existingMentions.includes(article.url)) {
          const updatedMains = (!matchedEntry.mains?.trim() && parsed.mainsDetails)
            ? parsed.mainsDetails
            : matchedEntry.mains
          
          const updatedPrelims = (!matchedEntry.prelims?.trim() && parsed.prelims)
            ? parsed.prelims
            : matchedEntry.prelims

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
        }
      } else {
        const newEntry = await prisma.mapEntry.create({
          data: {
            name: parsed.locationName,
            lat: parsed.lat || 0,
            lon: parsed.lon || 0,
            category: parsed.category || 'general',
            prelims: parsed.prelims || 'Auto-generated by UPSCGPT News Intelligence.',
            mains: parsed.mainsDetails || 'Context pending...',
            india: 'Strategic relevance to India pending AI analysis.',
            shape: 'marker',
            year: new Date().getFullYear(),
            newsMentions: newMentionStr,
            lastNewsDate: new Date()
          }
        })
        mapEntries.push(newEntry)
      }
    } catch (err) {
      console.error(`[AI Enrichment] Failed for: "${article.title}"`, err.message)
    }
  }
  console.log(`[AI Enrichment] Background processing complete for ${articles.length} articles.`)
}

// ─────────────────────────────────────────────────────────────────────────────
// FAST GET ENDPOINT — responds in <1s, fires AI enrichment in background
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const region = searchParams.get('region') || 'global'
    const gnewsKey = process.env.GNEWS_API_KEY

    let fetchedArticles = MOCK_NEWS
    let usingMock = true

    if (gnewsKey && gnewsKey !== 'dummy' && gnewsKey.trim() !== '' && !gnewsKey.includes('[')) {
      const regionConfig = REGION_QUERIES[region] || REGION_QUERIES.global
      
      // Fetch from primary region query
      const primary = await fetchFromGNews(regionConfig.keywords, regionConfig.sourceGroup, gnewsKey, 10)
      
      // For global region, also fetch India-focused news
      let indiaNews = []
      if (region === 'global' || region === 'indian_ocean') {
        for (const iq of INDIA_FOCUS_QUERIES) {
          const batch = await fetchFromGNews(iq.keywords, iq.sourceGroup, gnewsKey, 5)
          indiaNews = [...indiaNews, ...batch]
        }
      }

      const combined = [...primary, ...indiaNews]
      
      // Deduplicate by URL
      const seen = new Set()
      const deduped = combined.filter(a => {
        if (seen.has(a.url)) return false
        seen.add(a.url)
        return true
      })

      if (deduped.length > 0) {
        fetchedArticles = deduped
        usingMock = false
      }
    }

    // Fast string-match to attach known coordinates for Ticker flyTo
    const mapEntries = await prisma.mapEntry.findMany()
    const enrichedArticles = fetchedArticles.map(article => {
      const articleText = `${article.title} ${article.description || ''}`.toLowerCase()
      const match = mapEntries.find(e => articleText.includes(e.name.toLowerCase()))
      if (match) {
        return { ...article, lat: match.lat, lon: match.lon, entryId: match.id, locationName: match.name }
      }
      return article
    })

    // Fire-and-forget AI enrichment (non-blocking)
    runAiEnrichment(fetchedArticles).catch(err =>
      console.error('[AI Enrichment] Background run failed:', err.message)
    )

    return NextResponse.json({
      articles: enrichedArticles,
      source: usingMock ? 'mock' : 'gnews',
      warning: usingMock ? 'Using Mock Data — add GNEWS_API_KEY to .env for live news' : null
    })
  } catch (error) {
    console.error('[News API] Crash:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

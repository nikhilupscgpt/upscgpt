import { PrismaClient } from '@prisma/client'
import { GoogleGenAI } from '@google/genai'

const prisma = new PrismaClient()
const delay = (ms) => new Promise(res => setTimeout(res, ms))

export const TRUSTED_SOURCES = {
  india_editorial: 'thehindu.com,indianexpress.com',
  india_business: 'livemint.com,business-standard.com,economictimes.indiatimes.com',
  global_strategic: 'nytimes.com,washingtonpost.com,bbc.com,aljazeera.com,thediplomat.com',
}

export const SCRAPE_PLAN = [
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

async function fetchFromGNews(keywords, sourceGroup, gnewsKey, max = 10) {
  const sourceDomains = TRUSTED_SOURCES[sourceGroup]
  const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(keywords)}&lang=en&max=${max}&sortby=publishedAt&in=title,description&apikey=${gnewsKey}`

  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      if (data?.articles?.length) {
        const trustedDomains = sourceDomains.split(',')
        const filtered = data.articles.filter(article => {
          try {
            const host = new URL(article.url).hostname.replace('www.', '')
            return trustedDomains.some(d => host.includes(d))
          } catch { return false }
        })
        return filtered
      }
    }
  } catch (e) {
    console.error(`[Scraper] GNews fetch failed for "${sourceGroup}":`, e.message)
  }
  return []
}

export async function scrapeAndEnrich() {
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

    for (const article of articles) {
      if (!aiClient) continue

      try {
        await delay(4200) 

        const articleText = `${article.title} ${article.description || ''}`
        const sourceName = (() => {
          try { return new URL(article.url).hostname.replace('www.', '') } catch { return 'unknown' }
        })()

        const promptText = `You are a UPSC Civil Services exam preparation expert. Analyze this article for UPSC relevance: "${articleText}". Source: ${sourceName}. Return strictly valid JSON: { "isGeopolitical": true, "upscRelevance": 0-10, "locationName": "string", "lat": float, "lon": float, "category": "strait|conflict|island|mineral|nature|economy|governance|diplomacy|general", "prelims": "string", "mainsDetails": "string", "upscCrux": "string" }`

        const response = await aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' }).generateContent(promptText)
        const responseText = response.response.text()

        let cleanText = responseText.trim()
          .replace(/^```json\n?/, '').replace(/\n?```$/, '')
          .replace(/^```\n?/, '').replace(/\n?```$/, '')

        const parsed = JSON.parse(cleanText)
        
        if (!parsed.isGeopolitical || parsed.upscRelevance < 3 || !parsed.locationName) {
          totalFiltered++
          continue
        }

        const formattedDate = new Date(article.publishedAt).toISOString().split('T')[0]
        const newMentionStr = `\n\n### [${article.title}](${article.url}) (${formattedDate})\n**Source:** ${sourceName} · **UPSC Relevance:** ${parsed.upscRelevance}/10\n\n**UPSC Crux:**\n${parsed.upscCrux}\n---`

        let matchedEntry = mapEntries.find(
          e => e.name.toLowerCase() === parsed.locationName.toLowerCase()
        )

        if (matchedEntry) {
          const existingMentions = matchedEntry.newsMentions || ''
          if (!existingMentions.includes(article.url)) {
            await prisma.mapEntry.update({
              where: { id: matchedEntry.id },
              data: {
                newsMentions: existingMentions + newMentionStr,
                lastNewsDate: new Date(),
                mains: matchedEntry.mains || parsed.mainsDetails,
                prelims: matchedEntry.prelims || parsed.prelims,
              }
            })
            totalEnriched++
          }
        } else {
          const newEntry = await prisma.mapEntry.create({
            data: {
              name: parsed.locationName,
              lat: parsed.lat || 0,
              lon: parsed.lon || 0,
              category: parsed.category || 'general',
              prelims: parsed.prelims,
              mains: parsed.mainsDetails,
              india: 'Pending AI analysis...',
              shape: 'marker',
              year: new Date().getFullYear(),
              newsMentions: newMentionStr,
              lastNewsDate: new Date()
            }
          })
          mapEntries.push(newEntry)
          totalCreated++
        }
      } catch (err) {
        console.error(`[Scraper] AI failed for: "${article.title}"`, err.message)
      }
    }
  }

  return { totalFetched, totalEnriched, totalCreated, totalFiltered }
}

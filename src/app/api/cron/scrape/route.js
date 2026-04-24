import { NextResponse } from 'next/server'
import { scrapeAndEnrich, RSS_FEEDS } from '@/lib/scraper'

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
      sources: RSS_FEEDS.map(f => `${f.name}: ${f.url}`),
    })
  } catch (error) {
    console.error('[Cron] ❌ Daily scrape failed:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

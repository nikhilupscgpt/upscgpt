import { NextResponse } from 'next/server'
import { scrapeAndEnrich } from '@/lib/scraper'

export async function GET() {
  try {
    console.log("[DEV TRIGGER] Starting Scrape...")
    const stats = await scrapeAndEnrich()
    console.log("[DEV TRIGGER] Scrape Complete:", stats)
    return NextResponse.json({ success: true, stats })
  } catch (err) {
    console.error("[DEV TRIGGER] Scrape Error:", err)
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 })
  }
}

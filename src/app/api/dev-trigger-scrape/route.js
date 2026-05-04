import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { scrapeAndEnrich } from '@/lib/scraper'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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

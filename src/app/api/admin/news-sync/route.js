import { NextResponse } from 'next/server'
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { scrapeAndEnrich } from '@/lib/scraper'

async function checkAdmin() {
  const session = await getServerSession(authOptions)
  return session?.user?.role === 'ADMIN'
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const lastSync = await prisma.actionLog.findFirst({
      where: { action: 'SCRAPE_RUN' },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(lastSync)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()
  try {
    const stats = await scrapeAndEnrich()
    const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(1)

    // Log the manual action
    await prisma.actionLog.create({
      data: {
        action: 'SCRAPE_RUN',
        details: `Manual scrape triggered. Fetched: ${stats.totalFetched}, Enriched: ${stats.totalEnriched}`,
        userId: session.user.id
      }
    })

    return NextResponse.json({ success: true, durationSeconds, stats })
  } catch (error) {
    console.error('[AdminSync] Manual scrape failed:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

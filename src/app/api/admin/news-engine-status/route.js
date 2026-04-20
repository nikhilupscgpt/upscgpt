import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

import prisma from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [
      newsArticleCount,
      newsFactCount,
      editorialCount,
      mapEntriesWithNews,
      latestNewsArticle,
      latestManualScrape,
      latestStructuredSync,
    ] = await Promise.all([
      prisma.newsArticle.count(),
      prisma.newsFact.count(),
      prisma.editorialAnalysis.count(),
      prisma.mapEntry.count({ where: { newsMentions: { not: null } } }),
      prisma.newsArticle.findFirst({
        orderBy: { createdAt: 'desc' },
        select: {
          title: true,
          source: true,
          url: true,
          createdAt: true,
          publishedAt: true,
          category: true,
          relevance: true,
        },
      }),
      prisma.actionLog.findFirst({
        where: { action: 'SCRAPE_RUN' },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.actionLog.findFirst({
        where: { action: 'NEWS_ENGINE_SYNC' },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    return NextResponse.json({
      stats: {
        newsArticleCount,
        newsFactCount,
        editorialCount,
        mapEntriesWithNews,
      },
      latestNewsArticle,
      latestManualScrape,
      latestStructuredSync,
      assessment: {
        structuredPipelineHealthy: newsArticleCount > 0 && newsFactCount > 0,
        manualScraperHealthy: Boolean(latestManualScrape),
        latestStructuredSyncAt: latestStructuredSync?.createdAt || null,
        latestManualScrapeAt: latestManualScrape?.createdAt || null,
      },
    })
  } catch (error) {
    console.error('[AdminNewsEngineStatus] GET failed:', error)
    return NextResponse.json({ error: 'Failed to fetch news engine status.' }, { status: 500 })
  }
}

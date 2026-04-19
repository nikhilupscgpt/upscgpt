import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Force hot-reload following Prisma schema update for NewsFact

export async function GET() {
  try {
    // Fetch latest News Articles with their extracted facts and editorials
    const articles = await prisma.newsArticle.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        facts: {
          include: {
            mapEntry: {
              select: { name: true, lat: true, lon: true }
            }
          }
        },
        editorials: true
      }
    });

    return NextResponse.json({
      articles,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[News Hub API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch News Hub data.' }, { status: 500 });
  }
}

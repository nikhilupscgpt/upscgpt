import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    const where = date
      ? {
          createdAt: {
            gte: new Date(`${date}T00:00:00.000Z`),
            lt: new Date(`${date}T23:59:59.999Z`),
          },
        }
      : {};

    const articles = await prisma.article.findMany({
      where,
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        issue: { select: { title: true, category: true, slug: true } },
      },
    });

    return NextResponse.json({ articles });
  } catch (e) {
    console.error('[News Hub API] Error:', e);
    return NextResponse.json({ articles: [], error: 'Failed to load news' }, { status: 500 });
  }
}

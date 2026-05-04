import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain');
    const search = searchParams.get('search');
    
    const dateParam = searchParams.get('date');
    
    // Default to only returning issues that have SOME content, or all if requested
    const showAll = searchParams.get('showAll') === 'true';

    const where = { status: 'ACTIVE', parentIssueId: null };
    if (domain) where.domain = domain;
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    if (dateParam) {
      // Filter by a specific date (YYYY-MM-DD)
      const startOfDay = new Date(`${dateParam}T00:00:00.000Z`);
      const endOfDay = new Date(`${dateParam}T23:59:59.999Z`);
      where.OR = [
        { articles: { some: { publishedAt: { gte: startOfDay, lte: endOfDay } } } },
        { editorials: { some: { publishedAt: { gte: startOfDay, lte: endOfDay } } } }
      ];
    } else if (!showAll) {
      // Only show issues that have at least one article or editorial
      where.OR = [
        { articles: { some: {} } },
        { editorials: { some: {} } }
      ];
    }

    const issues = await prisma.issue.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        domain: true,
        topic: true,
        category: true,
        gsPapers: true,
        nodeType: true,
        orderIndex: true,
        lastUpdatedAt: true,
        cumulativeSummary: true,
        subNodes: {
          select: {
            id: true,
            title: true,
            nodeType: true
          }
        },
        _count: {
          select: {
            articles: true,
            editorials: true,
          }
        }
      },
      orderBy: [
        { orderIndex: 'asc' },
        { title: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      count: issues.length,
      issues,
    });
  } catch (error) {
    console.error('[Issues API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch issues' }, { status: 500 });
  }
}

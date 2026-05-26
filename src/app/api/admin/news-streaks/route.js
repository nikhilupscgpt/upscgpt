import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

function toSlug(title) {
  return title
    .toLowerCase()
    .replace(/[—–]/g, "-")
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * GET /api/admin/news-streaks
 * List all news streaks with search and relation counts
 */
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');
  const status = searchParams.get('status');

  try {
    const streaks = await prisma.newsStreak.findMany({
      where: {
        AND: [
          status ? { status } : {},
          search ? { title: { contains: search, mode: 'insensitive' } } : {},
        ],
      },
      include: {
        _count: {
          select: {
            articles: true,
            editorials: true,
            issues: true,
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      streaks,
    });
  } catch (error) {
    console.error('[NewsStreaks GET API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/news-streaks
 * Create a new News Streak
 */
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, title_hi, title_mr, livingSummary, status, issueIds = [], articleIds = [], editorialIds = [] } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    let slug = toSlug(title);
    
    // Ensure unique slug
    let finalSlug = slug;
    let counter = 1;
    while (await prisma.newsStreak.findUnique({ where: { slug: finalSlug } })) {
      counter++;
      finalSlug = `${slug}-${counter}`;
    }

    // Prepare connection data for syllabus Issues mapping
    const issuesConnection = issueIds.map(id => ({ id }));

    const streak = await prisma.newsStreak.create({
      data: {
        title,
        title_hi,
        title_mr,
        slug: finalSlug,
        livingSummary,
        status: status || 'ACTIVE',
        issues: {
          connect: issuesConnection
        }
      },
      include: {
        issues: true
      }
    });

    // Link selected articles & editorials
    if (articleIds.length > 0) {
      await prisma.article.updateMany({
        where: { id: { in: articleIds } },
        data: { newsStreakId: streak.id }
      });
    }
    if (editorialIds.length > 0) {
      await prisma.editorial.updateMany({
        where: { id: { in: editorialIds } },
        data: { newsStreakId: streak.id }
      });
    }

    return NextResponse.json({
      success: true,
      streak
    });
  } catch (error) {
    console.error('[NewsStreaks POST API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/admin/news-streaks/[id]
 * Get details of a single News Streak
 */
export async function GET(req, props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const streak = await prisma.newsStreak.findUnique({
      where: { id },
      include: {
        articles: {
          orderBy: { publishedAt: 'desc' }
        },
        editorials: {
          orderBy: { publishedAt: 'desc' }
        },
        issues: {
          select: {
            id: true,
            title: true,
            domain: true
          }
        }
      }
    });

    if (!streak) {
      return NextResponse.json({ error: 'News Streak not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      streak
    });
  } catch (error) {
    console.error('[NewsStreak GET ID API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/admin/news-streaks/[id]
 * Update a News Streak
 */
export async function PUT(req, props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const body = await req.json();
    const { title, title_hi, title_mr, livingSummary, livingSummary_hi, livingSummary_mr, status, issueIds, articleIds, editorialIds } = body;

    const currentStreak = await prisma.newsStreak.findUnique({
      where: { id },
      include: { issues: true }
    });

    if (!currentStreak) {
      return NextResponse.json({ error: 'News Streak not found' }, { status: 404 });
    }

    // Process issue relationship changes if provided
    let issuesUpdate = undefined;
    if (Array.isArray(issueIds)) {
      const currentIssueIds = currentStreak.issues.map(i => i.id);
      
      const toConnect = issueIds.filter(id => !currentIssueIds.includes(id));
      const toDisconnect = currentIssueIds.filter(id => !issueIds.includes(id));

      issuesUpdate = {
        connect: toConnect.map(id => ({ id })),
        disconnect: toDisconnect.map(id => ({ id }))
      };
    }

    const updatedStreak = await prisma.newsStreak.update({
      where: { id },
      data: {
        title,
        title_hi,
        title_mr,
        livingSummary,
        livingSummary_hi,
        livingSummary_mr,
        status,
        issues: issuesUpdate
      },
      include: {
        issues: true
      }
    });

    // Link/Unlink articles if provided
    if (Array.isArray(articleIds)) {
      await prisma.article.updateMany({
        where: { newsStreakId: id, id: { notIn: articleIds } },
        data: { newsStreakId: null }
      });
      if (articleIds.length > 0) {
        await prisma.article.updateMany({
          where: { id: { in: articleIds } },
          data: { newsStreakId: id }
        });
      }
    }

    // Link/Unlink editorials if provided
    if (Array.isArray(editorialIds)) {
      await prisma.editorial.updateMany({
        where: { newsStreakId: id, id: { notIn: editorialIds } },
        data: { newsStreakId: null }
      });
      if (editorialIds.length > 0) {
        await prisma.editorial.updateMany({
          where: { id: { in: editorialIds } },
          data: { newsStreakId: id }
        });
      }
    }

    return NextResponse.json({
      success: true,
      streak: updatedStreak
    });
  } catch (error) {
    console.error('[NewsStreak PUT API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/news-streaks/[id]
 * Delete a News Streak
 */
export async function DELETE(req, props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const currentStreak = await prisma.newsStreak.findUnique({
      where: { id }
    });

    if (!currentStreak) {
      return NextResponse.json({ error: 'News Streak not found' }, { status: 404 });
    }

    await prisma.newsStreak.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'News Streak deleted successfully'
    });
  } catch (error) {
    console.error('[NewsStreak DELETE API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

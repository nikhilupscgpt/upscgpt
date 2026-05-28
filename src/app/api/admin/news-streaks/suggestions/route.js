import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/admin/news-streaks/suggestions
 * Analyzes recent unlinked news articles & editorials to suggest new streak topics.
 * Returns issues that have >= 2 unlinked articles/editorials in the last 30 days.
 */
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch unlinked articles in the last 30 days
    const articles = await prisma.article.findMany({
      where: {
        newsStreakId: null,
        status: 'DONE',
        publishedAt: { gte: thirtyDaysAgo }
      },
      select: {
        id: true,
        title: true,
        publishedAt: true,
        issueId: true,
        issue: {
          select: {
            title: true,
            domain: true,
            category: true,
            gsPapers: true
          }
        }
      }
    });

    // Fetch unlinked editorials in the last 30 days
    const editorials = await prisma.editorial.findMany({
      where: {
        newsStreakId: null,
        status: 'DONE',
        publishedAt: { gte: thirtyDaysAgo }
      },
      select: {
        id: true,
        title: true,
        publishedAt: true,
        issueId: true,
        issue: {
          select: {
            title: true,
            domain: true,
            category: true,
            gsPapers: true
          }
        }
      }
    });

    // Group items by issueId
    const groupings = {};

    articles.forEach(art => {
      if (!groupings[art.issueId]) {
        groupings[art.issueId] = {
          issueId: art.issueId,
          title: art.issue.title,
          domain: art.issue.domain,
          category: art.issue.category,
          gsPapers: art.issue.gsPapers,
          items: []
        };
      }
      groupings[art.issueId].items.push({
        id: art.id,
        type: 'ARTICLE',
        title: art.title,
        publishedAt: art.publishedAt
      });
    });

    editorials.forEach(ed => {
      if (!groupings[ed.issueId]) {
        groupings[ed.issueId] = {
          issueId: ed.issueId,
          title: ed.issue.title,
          domain: ed.issue.domain,
          category: ed.issue.category,
          gsPapers: ed.issue.gsPapers,
          items: []
        };
      }
      groupings[ed.issueId].items.push({
        id: ed.id,
        type: 'EDITORIAL',
        title: ed.title,
        publishedAt: ed.publishedAt
      });
    });

    // Filter groupings with >= 2 items
    const suggestions = Object.values(groupings)
      .filter(group => group.items.length >= 2)
      .sort((a, b) => b.items.length - a.items.length);

    return NextResponse.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('[NewsStreaks Suggestions GET] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

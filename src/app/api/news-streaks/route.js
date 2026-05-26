import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";

/**
 * GET /api/news-streaks
 * Public read-only endpoint to list active News Streaks or retrieve details for a single streak.
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  const id = searchParams.get('id');

  try {
    // If querying details for a specific streak by ID or Slug
    if (id || slug) {
      const streak = await prisma.newsStreak.findFirst({
        where: {
          OR: [
            id ? { id } : {},
            slug ? { slug } : {}
          ],
          status: 'ACTIVE'
        },
        include: {
          issues: {
            select: {
              id: true,
              title: true,
              domain: true,
              topic: true,
              category: true,
            }
          },
          articles: {
            where: { status: 'DONE' },
            orderBy: { publishedAt: 'asc' }, // Chronological lineage order
            select: {
              id: true,
              title: true,
              source: true,
              publishedAt: true,
              url: true,
              rawContent: true,
              structuredData: true,
              issueId: true,
              issue: {
                select: {
                  title: true,
                  slug: true,
                }
              }
            }
          },
          editorials: {
            where: { status: 'DONE' },
            orderBy: { publishedAt: 'asc' },
            select: {
              id: true,
              title: true,
              source: true,
              publishedAt: true,
              url: true,
              rawContent: true,
              structuredData: true,
              issueId: true,
              issue: {
                select: {
                  title: true,
                  slug: true,
                }
              }
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
    }

    // Otherwise, list all active streaks for navigation sidebar
    const streaks = await prisma.newsStreak.findMany({
      where: { status: 'ACTIVE' },
      include: {
        issues: {
          select: {
            id: true,
            title: true,
            domain: true
          }
        },
        _count: {
          select: {
            articles: true,
            editorials: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      streaks
    });
  } catch (error) {
    console.error('[Public NewsStreaks GET] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

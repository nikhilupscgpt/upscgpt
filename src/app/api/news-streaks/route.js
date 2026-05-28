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

      // Collect IDs to fetch associated questions
      const articleIds = streak.articles.map((a) => a.id);
      const editorialIds = streak.editorials.map((e) => e.id);
      const issueIds = [
        ...streak.articles.map((a) => a.issueId),
        ...streak.editorials.map((e) => e.issueId)
      ].filter(Boolean);

      const questionTags = [
        ...articleIds.map((id) => `article:${id}`),
        ...editorialIds.map((id) => `editorial:${id}`),
      ];

      let questions = [];
      if (questionTags.length > 0 || issueIds.length > 0) {
        questions = await prisma.question.findMany({
          where: {
            OR: [
              {
                issueId: {
                  in: issueIds,
                },
              },
              {
                tags: {
                  hasSome: questionTags,
                },
              },
            ],
          },
        });
      }

      // Helper to map questions for a specific article or editorial
      const getQuestionsForItem = (item, isEditorial) => {
        const typeTag = isEditorial ? `editorial:${item.id}` : `article:${item.id}`;
        const directQs = questions.filter((q) => q.tags.includes(typeTag));
        const topicQs = questions.filter((q) => q.issueId === item.issueId);

        const merged = [...directQs];
        for (const q of topicQs) {
          if (!merged.some((mq) => mq.id === q.id)) {
            merged.push(q);
          }
        }
        return merged;
      };

      const mappedArticles = streak.articles.map((a) => ({
        ...a,
        questions: getQuestionsForItem(a, false),
      }));

      const mappedEditorials = streak.editorials.map((e) => ({
        ...e,
        questions: getQuestionsForItem(e, true),
      }));

      const streakWithQuestions = {
        ...streak,
        articles: mappedArticles,
        editorials: mappedEditorials
      };

      return NextResponse.json({
        success: true,
        streak: streakWithQuestions
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
      orderBy: [
        { importanceScore: 'desc' },
        { updatedAt: 'desc' }
      ]
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

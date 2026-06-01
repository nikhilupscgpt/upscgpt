import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function getCalendarWeekRange(dateStr) {
  const dateObj = new Date(`${dateStr}T12:00:00Z`);
  const day = dateObj.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  
  const monday = new Date(dateObj);
  monday.setUTCDate(dateObj.getUTCDate() + diffToMonday);
  monday.setUTCHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  sunday.setUTCHours(23, 59, 59, 999);

  return { start: monday, end: sunday };
}

function getCalendarMonthRange(dateStr) {
  const dateObj = new Date(`${dateStr}T12:00:00Z`);
  const year = dateObj.getUTCFullYear();
  const month = dateObj.getUTCMonth();
  
  const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
  
  return { start, end };
}

function getCalendarYearRange(dateStr) {
  const dateObj = new Date(`${dateStr}T12:00:00Z`);
  const year = dateObj.getUTCFullYear();
  
  const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
  
  return { start, end };
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const range = searchParams.get('range') || 'day';

    let where = {};
    if (date) {
      let start, end;
      if (range === 'week') {
        const r = getCalendarWeekRange(date);
        start = r.start;
        end = r.end;
      } else if (range === 'month') {
        const r = getCalendarMonthRange(date);
        start = r.start;
        end = r.end;
      } else if (range === 'year') {
        const r = getCalendarYearRange(date);
        start = r.start;
        end = r.end;
      } else {
        start = new Date(`${date}T00:00:00.000Z`);
        end = new Date(`${date}T23:59:59.999Z`);
      }

      where = {
        OR: [
          {
            publishedAt: {
              gte: start,
              lte: end,
            },
          },
          {
            publishedAt: null,
            createdAt: {
              gte: start,
              lte: end,
            },
          },
        ],
      };
    }

    const limit = range !== 'day' ? 250 : 50;

    // Fetch both articles and editorials
    const articles = await prisma.article.findMany({
      where,
      take: limit,
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        issue: { select: { id: true, title: true, title_hi: true, title_mr: true, category: true, slug: true, domain: true, topic: true } },
      },
    });

    const editorials = await prisma.editorial.findMany({
      where,
      take: limit,
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        issue: { select: { id: true, title: true, title_hi: true, title_mr: true, category: true, slug: true, domain: true, topic: true } },
      },
    });

    // Collect all article and editorial IDs, as well as issue IDs
    const articleIds = articles.map((a) => a.id);
    const editorialIds = editorials.map((e) => e.id);
    const issueIds = [
      ...articles.map((a) => a.issueId),
      ...editorials.map((e) => e.issueId)
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

    // Helper to get merged, deduplicated questions for a specific item
    const getQuestionsForItem = (item, isEditorial) => {
      const typeTag = isEditorial ? `editorial:${item.id}` : `article:${item.id}`;
      // Questions directly tagged
      const directQs = questions.filter((q) => q.tags.includes(typeTag));
      // Questions linked to the parent issue topic
      const topicQs = questions.filter((q) => q.issueId === item.issueId);

      // Merge and deduplicate by question ID
      const merged = [...directQs];
      for (const q of topicQs) {
        if (!merged.some((mq) => mq.id === q.id)) {
          merged.push(q);
        }
      }
      return merged;
    };

    // Attach questions and standardize types
    const mappedArticles = articles.map((a) => ({
      ...a,
      itemType: 'article',
      questions: getQuestionsForItem(a, false),
    }));

    const mappedEditorials = editorials.map((e) => ({
      ...e,
      itemType: 'editorial',
      contentType: 'EDITORIAL', // Standardize type for filtering
      questions: getQuestionsForItem(e, true),
    }));

    // Merge and sort by importanceScore descending, then date descending
    const feed = [...mappedArticles, ...mappedEditorials];
    feed.sort((a, b) => {
      const scoreA = a.importanceScore || 1;
      const scoreB = b.importanceScore || 1;
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      const dateA = new Date(a.publishedAt || a.createdAt);
      const dateB = new Date(b.publishedAt || b.createdAt);
      return dateB - dateA;
    });

    return NextResponse.json({ success: true, feed });
  } catch (e) {
    console.error('[News Hub API] Error:', e);
    return NextResponse.json({ success: false, feed: [], error: 'Failed to load news feed' }, { status: 500 });
  }
}



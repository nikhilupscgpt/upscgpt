import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    // Filter by date matching either publishedAt or createdAt if date is provided
    const where = date
      ? {
          OR: [
            {
              publishedAt: {
                gte: new Date(`${date}T00:00:00.000Z`),
                lte: new Date(`${date}T23:59:59.999Z`),
              },
            },
            {
              publishedAt: null,
              createdAt: {
                gte: new Date(`${date}T00:00:00.000Z`),
                lte: new Date(`${date}T23:59:59.999Z`),
              },
            },
          ],
        }
      : {};

    // Fetch both articles and editorials
    const articles = await prisma.article.findMany({
      where,
      take: 50,
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        issue: { select: { id: true, title: true, category: true, slug: true } },
      },
    });

    const editorials = await prisma.editorial.findMany({
      where,
      take: 50,
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        issue: { select: { id: true, title: true, category: true, slug: true } },
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

    // Merge and sort chronologically (descending)
    const feed = [...mappedArticles, ...mappedEditorials];
    feed.sort((a, b) => {
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



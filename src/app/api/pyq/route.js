import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { isNewPatternQuestion } from '@/lib/pyqPattern';
import { SUBJECT_ORDER, SUBJECT_SHORT } from '@/app/prelims/pyq/topicGroups';

const prisma = new PrismaClient();

const SUBJECT_META = {
  'Indian Polity': { icon: '🏛️', color: '#3b82f6' },
  'Economy': { icon: '📈', color: '#10b981' },
  'Geography': { icon: '🌍', color: '#06b6d4' },
  'Environment': { icon: '🌿', color: '#22c55e' },
  'Science & Technology': { icon: '🔬', color: '#8b5cf6' },
  'Modern History': { icon: '📜', color: '#f59e0b' },
  'Ancient History': { icon: '🏺', color: '#d97706' },
  'Medieval History': { icon: '🏰', color: '#b45309' },
  'Art & Culture': { icon: '🎨', color: '#ec4899' },
  'Agriculture': { icon: '🌾', color: '#84cc16' },
};

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const metadataOnly = searchParams.get('metadata') === 'true';

    // 1. If metadata only requested
    if (metadataOnly) {
      const drafts = await prisma.questionDraft.findMany({
        select: {
          srcSubject: true,
          srcTopic: true,
          stem: true,
        },
      });

      const map = new Map();
      const subjectNewPatternCount = {};
      let totalNewPattern = 0;

      for (const q of drafts) {
        if (isNewPatternQuestion(q)) {
          totalNewPattern++;
          subjectNewPatternCount[q.srcSubject] = (subjectNewPatternCount[q.srcSubject] || 0) + 1;
        }

        if (!map.has(q.srcSubject)) {
          map.set(q.srcSubject, { count: 0, topics: new Map() });
        }
        const entry = map.get(q.srcSubject);
        entry.count++;
        if (q.srcTopic) {
          entry.topics.set(q.srcTopic, (entry.topics.get(q.srcTopic) || 0) + 1);
        }
      }

      const order = SUBJECT_ORDER.filter(s => map.has(s));
      const extra = [...map.keys()].filter(s => !SUBJECT_ORDER.includes(s));
      const subjectStats = [...order, ...extra].map(s => {
        const data = map.get(s);
        const topTopics = [...data.topics.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([t]) => t);
        const allTopics = [...data.topics.entries()]
          .sort((a, b) => b[1] - a[1]);
        return {
          name: s,
          short: SUBJECT_SHORT[s] || s,
          count: data.count,
          topTopics,
          allTopics,
          newPatternCount: subjectNewPatternCount[s] || 0,
          meta: SUBJECT_META[s] || { icon: '📚', color: '#64748b' },
        };
      });

      return NextResponse.json(
        {
          success: true,
          subjectStats,
          totalNewPattern,
          totalQuestions: drafts.length,
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
            'CDN-Cache-Control': 'public, s-maxage=86400',
            'Vercel-CDN-Cache-Control': 'public, s-maxage=86400',
          },
        }
      );
    }

    // 2. Fetch questions (optionally filtered by subject for smaller payloads)
    const where = {};
    if (subject && subject !== 'ALL') {
      where.srcSubject = subject;
    }

    const drafts = await prisma.questionDraft.findMany({
      where,
      select: {
        id: true,
        dedupHash: true,
        questionNo: true,
        examName: true,
        examYear: true,
        srcSubject: true,
        srcTopic: true,
        stem: true,
        options: true,
        correctLabel: true,
        explanation: true,
      },
      orderBy: [{ examYear: 'desc' }, { questionNo: 'asc' }],
    });

    const questions = drafts.map(q => {
      let opts = [];
      if (typeof q.options === 'string') {
        try { opts = JSON.parse(q.options); } catch { opts = []; }
      } else if (Array.isArray(q.options)) {
        opts = q.options;
      }
      return {
        id: q.id,
        dedupHash: q.dedupHash,
        questionNo: q.questionNo,
        examName: q.examName || 'UPSC CSE Pre',
        examYear: q.examYear || 2025,
        srcSubject: q.srcSubject || 'Indian Polity',
        srcTopic: q.srcTopic || 'General',
        stem: q.stem,
        options: opts,
        correctLabel: q.correctLabel,
        explanation: q.explanation || null,
      };
    });

    return NextResponse.json(
      {
        success: true,
        count: questions.length,
        questions,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
          'CDN-Cache-Control': 'public, s-maxage=86400',
          'Vercel-CDN-Cache-Control': 'public, s-maxage=86400',
        },
      }
    );
  } catch (error) {
    console.error('API /api/pyq error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

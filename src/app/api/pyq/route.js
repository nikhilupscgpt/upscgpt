import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { isNewPatternQuestion } from '@/lib/pyqPattern';
import { SUBJECT_ORDER, SUBJECT_SHORT } from '@/app/prelims/pyq/topicGroups';
import { sortQuestionsBySyllabus } from '@/lib/syllabusSequence';

const PAGE_SIZE = 10;

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
    const metadataOnly = searchParams.get('metadata') === 'true';

    // 1. Metadata summary endpoint (counts & topic names only — no stems/answers exposed)
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

      return NextResponse.json({
        success: true,
        subjectStats,
        totalNewPattern,
        totalQuestions: drafts.length,
      });
    }

    // 2. Paginated Questions Endpoint (Strictly capped at 10 questions per request)
    const session = await getServerSession(authOptions);
    const isAuthenticated = Boolean(session?.user);

    const subject = searchParams.get('subject') || 'ALL';
    const topic = searchParams.get('topic') || 'ALL';
    const exam = searchParams.get('exam') || 'ALL';
    const years = searchParams.get('years') || searchParams.get('year') || 'ALL';
    const pattern = searchParams.get('pattern') || 'ALL';
    const query = (searchParams.get('q') || '').trim();
    const idsParam = (searchParams.get('ids') || '').trim();
    const excludeIdsParam = (searchParams.get('excludeIds') || '').trim();
    const requestedPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

    const specificIds = idsParam
      ? idsParam.split(',').map(s => s.trim()).filter(Boolean).slice(0, 200)
      : [];
    const excludeIds = excludeIdsParam
      ? excludeIdsParam.split(',').map(s => s.trim()).filter(Boolean).slice(0, 500)
      : [];

    // Tier 2 Login Gate: Anonymous visitors can only preview Page 1 of a Subject/Topic
    // Page 2+, keyword search, New Pattern filter, and personal Mistake/Bookmark IDs require login
    const requiresLoginForRequest =
      requestedPage > 1 ||
      Boolean(query) ||
      pattern === 'NEW' ||
      specificIds.length > 0 ||
      excludeIds.length > 0;

    if (!isAuthenticated && requiresLoginForRequest) {
      return NextResponse.json(
        {
          success: false,
          requiresAuth: true,
          error: 'Please sign in with a free account to unlock Page 2+, keyword search, and custom filters.',
        },
        { status: 401 }
      );
    }

    // Build Prisma where filter
    const andConditions = [];

    if (specificIds.length > 0) {
      andConditions.push({ id: { in: specificIds } });
    }
    if (excludeIds.length > 0) {
      andConditions.push({ id: { notIn: excludeIds } });
    }
    if (subject && subject !== 'ALL') {
      andConditions.push({ srcSubject: subject });
    }
    if (topic && topic !== 'ALL') {
      andConditions.push({ srcTopic: topic });
    }
    if (exam && exam !== 'ALL') {
      andConditions.push({
        examName: {
          contains: exam === 'UPSC CSE' ? 'CSE' : 'CDS',
          mode: 'insensitive',
        },
      });
    }
    if (years && years !== 'ALL') {
      if (/^\d{4}$/.test(years)) {
        andConditions.push({ examYear: Number(years) });
      } else if (/^\d{4}-\d{4}$/.test(years)) {
        const [lo, hi] = years.split('-').map(Number);
        andConditions.push({ examYear: { gte: lo, lte: hi } });
      }
    }
    if (query) {
      andConditions.push({
        OR: [
          { stem: { contains: query, mode: 'insensitive' } },
          { srcTopic: { contains: query, mode: 'insensitive' } },
          { srcSubject: { contains: query, mode: 'insensitive' } },
          { explanation: { contains: query, mode: 'insensitive' } },
        ],
      });
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {};

    const sortParam = searchParams.get('sort') || (subject !== 'ALL' && topic === 'ALL' ? 'syllabus' : 'exam');

    let total = 0;
    let drafts = [];

    if (sortParam === 'syllabus') {
      // Syllabus sequence order: Foundations -> Rights -> Executive -> Legislature -> Judiciary...
      const candidateRows = await prisma.questionDraft.findMany({
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
      });
      const filteredCandidates = pattern === 'NEW' ? candidateRows.filter(isNewPatternQuestion) : candidateRows;
      const sortedRows = sortQuestionsBySyllabus(filteredCandidates, subject !== 'ALL' ? subject : 'Indian Polity');
      total = sortedRows.length;
      drafts = sortedRows.slice((requestedPage - 1) * PAGE_SIZE, requestedPage * PAGE_SIZE);
    } else if (pattern === 'NEW') {
      // New pattern requires regex matching on stem/options, so fetch matching rows and slice 10 on server
      const candidateRows = await prisma.questionDraft.findMany({
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
      const newPatternRows = candidateRows.filter(isNewPatternQuestion);
      total = newPatternRows.length;
      drafts = newPatternRows.slice((requestedPage - 1) * PAGE_SIZE, requestedPage * PAGE_SIZE);
    } else {
      // Standard DB-level count + strict 10-row pagination
      [total, drafts] = await Promise.all([
        prisma.questionDraft.count({ where }),
        prisma.questionDraft.findMany({
          where,
          skip: (requestedPage - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
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
        }),
      ]);
    }

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

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    return NextResponse.json({
      success: true,
      isAuthenticated,
      page: requestedPage,
      pageSize: PAGE_SIZE,
      total,
      totalPages,
      count: questions.length,
      questions,
    });
  } catch (error) {
    console.error('API /api/pyq error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

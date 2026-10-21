import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';
import { isNewPatternQuestion, isPairQuestion, isStatementQuestion } from '@/lib/pyqPattern';
import {
  SUBJECT_ORDER,
  TOPIC_GROUPS,
  getTopicSyllabusOrder,
  sortQuestionsBySyllabus
} from '@/lib/syllabusTaxonomy';

const prisma = new PrismaClient();

function normalizeOptions(opts) {
  if (Array.isArray(opts)) return opts;
  if (typeof opts === 'string') {
    try {
      const parsed = JSON.parse(opts);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return [];
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '25', 10)));
    const search = (searchParams.get('q') || searchParams.get('search') || '').trim();
    const subject = searchParams.get('subject') || 'ALL';
    const topic = searchParams.get('topic') || 'ALL';
    const exam = searchParams.get('exam') || 'ALL';
    const year = searchParams.get('year') || 'ALL';
    const pattern = searchParams.get('pattern') || 'ALL'; // ALL | NEW | PAIR | STATEMENT
    const answerStatus = searchParams.get('answerStatus') || 'ALL'; // ALL | HAS_ANSWER | MISSING_ANSWER | HAS_EXPL | MISSING_EXPL
    const sort = searchParams.get('sort') || (subject !== 'ALL' && topic === 'ALL' ? 'syllabus' : 'exam'); // 'syllabus' | 'exam'

    // Build base where clause
    const where = {};

    if (subject !== 'ALL') {
      where.srcSubject = subject;
    }

    if (topic !== 'ALL') {
      where.srcTopic = topic;
    }

    if (exam !== 'ALL') {
      where.examName = { contains: exam === 'UPSC CSE' ? 'CSE' : exam, mode: 'insensitive' };
    }

    if (year !== 'ALL') {
      const parsedYear = parseInt(year, 10);
      if (!isNaN(parsedYear)) {
        where.examYear = parsedYear;
      }
    }

    if (answerStatus === 'HAS_ANSWER') {
      where.correctLabel = { not: null };
    } else if (answerStatus === 'MISSING_ANSWER') {
      where.OR = [{ correctLabel: null }, { correctLabel: '' }];
    } else if (answerStatus === 'HAS_EXPL') {
      where.explanation = { not: null };
    } else if (answerStatus === 'MISSING_EXPL') {
      where.OR = [{ explanation: null }, { explanation: '' }];
    }

    if (search) {
      const qNum = parseInt(search.replace(/\D/g, ''), 10);
      where.OR = [
        { stem: { contains: search, mode: 'insensitive' } },
        { explanation: { contains: search, mode: 'insensitive' } },
        { srcTopic: { contains: search, mode: 'insensitive' } },
        { srcSubject: { contains: search, mode: 'insensitive' } },
        { dedupHash: { contains: search, mode: 'insensitive' } },
        ...(isNaN(qNum) ? [] : [{ questionNo: qNum }])
      ];
    }

    let questions = [];
    let total = 0;

    if (sort === 'syllabus' || pattern === 'NEW' || pattern === 'PAIR' || pattern === 'STATEMENT') {
      // For syllabus sorting or pattern detection, fetch candidate records and sort/filter in memory
      const allMatches = await prisma.questionDraft.findMany({
        where,
        orderBy: [{ examYear: 'desc' }, { questionNo: 'asc' }],
        select: {
          id: true,
          questionNo: true,
          examName: true,
          examYear: true,
          srcSubject: true,
          srcTopic: true,
          srcTheme: true,
          stem: true,
          options: true,
          correctLabel: true,
          explanation: true,
          difficulty: true,
          dedupHash: true,
          createdAt: true,
        }
      });

      let candidateList = allMatches;
      if (pattern === 'NEW' || pattern === 'PAIR' || pattern === 'STATEMENT') {
        candidateList = allMatches.filter(q => {
          const parsedOpts = normalizeOptions(q.options);
          const item = { ...q, options: parsedOpts };
          if (pattern === 'NEW') return isNewPatternQuestion(item);
          if (pattern === 'PAIR') return isPairQuestion(item);
          if (pattern === 'STATEMENT') return isStatementQuestion(item);
          return true;
        });
      }

      if (sort === 'syllabus') {
        candidateList = sortQuestionsBySyllabus(candidateList, subject !== 'ALL' ? subject : 'Indian Polity');
      }

      total = candidateList.length;
      questions = candidateList.slice((page - 1) * limit, page * limit).map(q => ({
        ...q,
        options: normalizeOptions(q.options)
      }));
    } else {
      total = await prisma.questionDraft.count({ where });
      const rawQuestions = await prisma.questionDraft.findMany({
        where,
        orderBy: [{ examYear: 'desc' }, { questionNo: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          questionNo: true,
          examName: true,
          examYear: true,
          srcSubject: true,
          srcTopic: true,
          srcTheme: true,
          stem: true,
          options: true,
          correctLabel: true,
          explanation: true,
          difficulty: true,
          dedupHash: true,
          createdAt: true,
        }
      });

      questions = rawQuestions.map(q => ({
        ...q,
        options: normalizeOptions(q.options)
      }));
    }

    // Fetch filter options for dropdowns
    const [rawSubjects, rawYears, rawExams] = await Promise.all([
      prisma.questionDraft.findMany({
        select: { srcSubject: true },
        distinct: ['srcSubject'],
        where: { srcSubject: { not: null } }
      }),
      prisma.questionDraft.findMany({
        select: { examYear: true },
        distinct: ['examYear'],
        where: { examYear: { not: null } },
        orderBy: { examYear: 'desc' }
      }),
      prisma.questionDraft.findMany({
        select: { examName: true },
        distinct: ['examName'],
        where: { examName: { not: null } }
      })
    ]);

    const subjects = rawSubjects
      .map(s => s.srcSubject)
      .filter(Boolean)
      .sort((a, b) => {
        const idxA = SUBJECT_ORDER.indexOf(a);
        const idxB = SUBJECT_ORDER.indexOf(b);
        const rankA = idxA === -1 ? 999 : idxA;
        const rankB = idxB === -1 ? 999 : idxB;
        if (rankA !== rankB) return rankA - rankB;
        return a.localeCompare(b);
      });

    const years = rawYears.map(y => y.examYear).filter(Boolean);
    const exams = rawExams.map(e => e.examName).filter(Boolean).sort();

    // Fetch topics and topicGroups for the active subject if filtered
    let topics = [];
    let topicGroups = [];
    if (subject !== 'ALL') {
      const topicRows = await prisma.questionDraft.findMany({
        where: { srcSubject: subject },
        distinct: ['srcTopic'],
        select: { srcTopic: true }
      });
      const distinctTopics = topicRows.map(t => t.srcTopic).filter(Boolean);
      topics = distinctTopics.sort((a, b) => {
        const orderA = getTopicSyllabusOrder(subject, a);
        const orderB = getTopicSyllabusOrder(subject, b);
        if (orderA !== orderB) return orderA - orderB;
        return a.localeCompare(b);
      });

      const subjectModules = TOPIC_GROUPS[subject] || [];
      const topicSet = new Set(topics);
      const covered = new Set();
      for (const [moduleLabel, topicNames] of subjectModules) {
        const items = topicNames.filter(t => topicSet.has(t));
        if (items.length > 0) {
          items.forEach(t => covered.add(t));
          topicGroups.push({ label: moduleLabel, topics: items });
        }
      }
      const rest = topics.filter(t => !covered.has(t));
      if (rest.length > 0) {
        topicGroups.push({ label: 'Other & Specialized Topics', topics: rest });
      }
    }

    return NextResponse.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      questions,
      filterOptions: {
        subjects,
        years,
        exams,
        topics,
        topicGroups,
      }
    });
  } catch (error) {
    console.error('[API Admin PYQ] GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch PYQ list: ' + error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      stem,
      options,
      correctLabel,
      explanation,
      srcSubject,
      srcTopic,
      srcTheme,
      examName,
      examYear,
      questionNo,
      difficulty,
    } = body;

    if (!stem || !stem.trim()) {
      return NextResponse.json({ error: 'Question stem text is required.' }, { status: 400 });
    }

    const normalizedOpts = normalizeOptions(options);
    if (normalizedOpts.length < 2) {
      return NextResponse.json({ error: 'At least 2 options are required.' }, { status: 400 });
    }

    const yr = parseInt(examYear, 10) || new Date().getFullYear();
    const qNum = parseInt(questionNo, 10) || null;
    const cleanStem = stem.trim();
    const cleanCorrect = (correctLabel || '').trim().toLowerCase();

    const dedupHash = crypto
      .createHash('md5')
      .update(`${yr}_${qNum || ''}_${cleanStem}`.toLowerCase().replace(/\s+/g, ''))
      .digest('hex');

    const created = await prisma.questionDraft.create({
      data: {
        runId: 'admin_manual_entry',
        documentId: 'admin_cms',
        rawText: cleanStem,
        stem: cleanStem,
        options: normalizedOpts,
        correctLabel: cleanCorrect,
        explanation: explanation ? explanation.trim() : null,
        srcSubject: (srcSubject || 'Indian Polity').trim(),
        srcTopic: (srcTopic || 'General').trim(),
        srcTheme: srcTheme ? srcTheme.trim() : null,
        examName: (examName || 'UPSC CSE Pre').trim(),
        examYear: yr,
        questionNo: qNum,
        difficulty: difficulty || 'MEDIUM',
        status: 'APPROVED',
        dedupHash,
        reviewedBy: session.user?.name || 'admin',
        reviewedAt: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      question: {
        ...created,
        options: normalizeOptions(created.options)
      }
    });
  } catch (error) {
    console.error('[API Admin PYQ] POST Error:', error);
    return NextResponse.json({ error: 'Failed to create question: ' + error.message }, { status: 500 });
  }
}

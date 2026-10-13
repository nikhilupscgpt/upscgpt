import { PrismaClient } from '@prisma/client';
import PracticeClient from './PracticeClient';
import { isNewPatternQuestion } from '@/lib/pyqPattern';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'PYQ Practice | PrelimsGPT',
  description: 'Timed practice and step-by-step interactive mode from real UPSC & CDS previous year questions.',
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function seededShuffle(arr, seedStr) {
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  }
  function pseudoRandom() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(pseudoRandom() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default async function PracticePage({ searchParams }) {
  const sp = await searchParams;
  const get = (k) => (Array.isArray(sp?.[k]) ? sp[k][0] : sp?.[k]) || '';

  const drill = get('drill'); // 'daily'
  const isDailyDrill = drill === 'daily';
  const pattern = get('pattern'); // 'new'
  const mode = get('mode') === 'practice' ? 'practice' : 'exam';
  const subject = get('subject');
  const subjects = get('subjects').split(',').map(s => s.trim()).filter(Boolean);
  const topic = get('topic');
  const topics = get('topics').split(',').map(s => s.trim()).filter(Boolean);
  const exam = get('exam');
  const years = get('years');
  const ids = get('ids').split(',').map(s => s.trim()).filter(Boolean);
  const n = isDailyDrill 
    ? Math.min(Math.max(parseInt(get('n'), 10) || 10, 5), 35) 
    : Math.min(Math.max(parseInt(get('n'), 10) || 20, 5), 100);

  // Dropped questions (no official key) can't be graded — exclude them from tests
  const where = { correctLabel: { not: null } };
  if (ids.length) {
    where.id = { in: ids };
  } else {
    if (subjects.length > 0) {
      where.srcSubject = { in: subjects };
    } else if (subject) {
      where.srcSubject = subject;
    }

    if (topics.length > 0) {
      where.srcTopic = { in: topics };
    } else if (topic) {
      where.srcTopic = topic;
    }

    if (exam === 'UPSC CSE') where.examName = { contains: 'CSE' };
    if (exam === 'CDS') where.examName = { contains: 'CDS' };
    if (/^\d{4}-\d{4}$/.test(years)) {
      const [lo, hi] = years.split('-').map(Number);
      where.examYear = { gte: lo, lte: hi };
    } else if (/^\d{4}$/.test(years)) {
      where.examYear = Number(years);
    }
  }

  let rows = await prisma.questionDraft.findMany({
    where,
    select: {
      id: true, questionNo: true, examName: true, examYear: true, srcSubject: true,
      srcTopic: true, stem: true, options: true, correctLabel: true, explanation: true,
    },
  });

  // If user requested New UPSC Pattern (Pairs / Statements)
  if (pattern === 'new') {
    rows = rows.filter(isNewPatternQuestion);
  }

  let picked = [];
  if (ids.length > 0) {
    // Keep order of ids or rows
    picked = rows.slice(0, n);
  } else if (isDailyDrill) {
    const todayStr = new Date().toISOString().slice(0, 10);
    picked = seededShuffle(rows, todayStr).slice(0, n);
  } else {
    picked = shuffle(rows).slice(0, n);
  }

  const formattedQuestions = picked.map(q => ({
    id: q.id,
    questionNo: q.questionNo,
    examName: q.examName || 'UPSC CSE Pre',
    examYear: q.examYear,
    srcSubject: q.srcSubject,
    srcTopic: q.srcTopic,
    stem: q.stem,
    options: Array.isArray(q.options) ? q.options : [],
    correctLabel: q.correctLabel,
    explanation: q.explanation || null,
  }));

  let title = 'Custom set';
  if (isDailyDrill) {
    title = '🔥 Daily PYQ Streak Drill';
  } else if (pattern === 'new') {
    title = '🔥 New UPSC Pattern (Pairs & Statements)';
  } else if (ids.length) {
    title = 'Selected questions';
  } else if (subjects.length > 0) {
    title = `${subjects.join(' + ')}${topics.length > 0 ? ` (${topics.length} topics)` : ''}`;
  } else {
    title = [subject || 'All subjects', topic].filter(Boolean).join(' · ');
  }

  const yearsLabel = years
    ? years.replace('-', '–')
    : '2011–2025';
  const examLabel = exam || 'UPSC CSE & CDS';
  const metaLabel = isDailyDrill
    ? '10 Curated High-Yield Questions · Daily Streak Challenge'
    : `${examLabel} ${yearsLabel}`;

  return (
    <PracticeClient
      questions={formattedQuestions}
      mode={mode}
      isDailyDrill={isDailyDrill}
      title={`${title} — ${mode === 'practice' ? 'Practice mode' : 'Exam mode'}`}
      meta={metaLabel}
      backHref={`/prelims/pyq?${new URLSearchParams({
        ...(subject && { subject }),
        ...(topic && { topic }),
        ...(exam && { exam }),
      }).toString()}`}
    />
  );
}

import crypto from 'crypto';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import {
  getTierStatus,
  computeUsageState,
  USAGE_ACTION_MAP,
} from '@/lib/tier-gate';
import { stripAnswerFields } from '@/lib/analytics/grading';
import PracticeClient from './PracticeClient';
import { isNewPatternQuestion } from '@/lib/pyqPattern';

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

  // Require login for custom quiz sets & practice sessions (prevents bulk scraping via /practice?n=100)
  const tierStatus = await getTierStatus();
  const userId = tierStatus.user?.id || null;
  if (!userId && !isDailyDrill) {
    redirect('/login?callbackUrl=' + encodeURIComponent('/prelims/pyq'));
  }

  const pattern = get('pattern'); // 'new'
  const mode = get('mode') === 'practice' ? 'practice' : 'exam';
  const subject = get('subject');
  const subjects = get('subjects').split(',').map(s => s.trim()).filter(Boolean);
  const topic = get('topic');
  const topics = get('topics').split(',').map(s => s.trim()).filter(Boolean);
  const exam = get('exam');
  const years = get('years');
  const ids = get('ids').split(',').map(s => s.trim()).filter(s => s && s.length <= 64).slice(0, 200);
  let n = isDailyDrill
    ? 10
    : Math.min(Math.max(parseInt(get('n'), 10) || 20, 5), 50);

  // Server-side free-tier enforcement for custom practice sets (daily drill is exempt).
  const reqLike = { headers: await headers() };
  if (!isDailyDrill && !tierStatus.isPro) {
    const usage = await computeUsageState(reqLike, 'practice_set', tierStatus);
    if (usage.gatingEnabled) {
      const maxFree = Number(usage.freeLimits?.freeMaxQuestionsPerSet ?? 10);
      if (Number.isFinite(maxFree) && maxFree > 0) n = Math.min(n, maxFree);

      // One "set" = one distinct combination of filters; reloading the same set is free.
      const signature = crypto
        .createHash('sha256')
        .update(JSON.stringify({ pattern, subject, subjects, topic, topics, exam, years, ids, n }))
        .digest('hex')
        .slice(0, 24);
      const setKey = `set_${signature}`;

      if (!usage.unlockedIds.includes(setKey)) {
        if (!usage.allowed) {
          return <PracticeLimitReached limit={usage.limit} maxQuestions={maxFree} />;
        }
        await prisma.actionLog.create({
          data: {
            userId,
            action: USAGE_ACTION_MAP.practice_set,
            entityType: 'PRACTICE_SET',
            entityId: setKey,
            status: 'SUCCESS',
            message: `Daily practice_set usage recorded (${usage.dayKey})`,
          },
        });
      }
    }
  }

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
    picked = rows.slice(0, n);
  } else if (isDailyDrill) {
    const todayStr = new Date().toISOString().slice(0, 10);
    picked = seededShuffle(rows, todayStr).slice(0, n);
  } else {
    picked = shuffle(rows).slice(0, n);
  }

  // Strip correctLabel and explanation so answers are never leaked before submission.
  const formattedQuestions = picked.map(q =>
    stripAnswerFields({
      id: q.id,
      questionNo: q.questionNo,
      examName: q.examName || 'UPSC CSE Pre',
      examYear: q.examYear,
      srcSubject: q.srcSubject,
      srcTopic: q.srcTopic,
      stem: q.stem,
      options: Array.isArray(q.options) ? q.options : [],
    })
  );

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

function PracticeLimitReached({ limit, maxQuestions }) {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '28px 24px',
          borderRadius: '16px',
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(7, 11, 20, 0.98))',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          textAlign: 'center',
          color: '#f8fafc',
        }}
      >
        <h1 style={{ margin: '0 0 10px', fontSize: '19px', fontWeight: 900 }}>
          Daily free practice limit reached
        </h1>
        <p style={{ margin: '0 0 18px', fontSize: '14px', lineHeight: 1.55, color: '#94a3b8' }}>
          {`Free accounts get ${limit ?? 1} custom practice set(s) per day (up to ${maxQuestions} questions each). `}
          Your quota resets at midnight IST. Upgrade to the Prelims Pass for unlimited sets of any length.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <Link
            href="/prelims/pyq"
            style={{ padding: '10px 18px', borderRadius: '10px', background: '#1e293b', color: '#f8fafc', textDecoration: 'none', fontSize: '13px', fontWeight: 800 }}
          >
            Back to PYQs
          </Link>
          <Link
            href="/pricing"
            style={{ padding: '10px 20px', borderRadius: '10px', background: '#10b981', color: '#042f2e', textDecoration: 'none', fontSize: '13.5px', fontWeight: 900 }}
          >
            Get Prelims Pass
          </Link>
        </div>
      </div>
    </div>
  );
}

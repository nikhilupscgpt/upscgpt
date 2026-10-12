import { PrismaClient } from '@prisma/client';
import PyqExplorerClient from './PyqExplorerClient';
import { isNewPatternQuestion } from '@/lib/pyqPattern';
import { SUBJECT_ORDER, SUBJECT_SHORT } from './topicGroups';

const prisma = new PrismaClient();

// Incremental Static Regeneration (ISR): Edge cached for 24 hours, automatically invalidated on admin edits
export const revalidate = 86400;

export const metadata = {
  title: 'PYQ Explorer — UPSC & CDS Previous Year Questions | PrelimsGPT',
  description: 'Find any previous year question, attempt it right here, and turn any topic into a timed practice test.',
};

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

export default async function PyqExplorerPage() {
  // 1. Fetch compact metadata across all questions for fast Subject Hub paint
  const metadataDrafts = await prisma.questionDraft.findMany({
    select: {
      srcSubject: true,
      srcTopic: true,
      stem: true,
    },
  });

  const map = new Map();
  const subjectNewPatternCount = {};
  let totalNewPattern = 0;

  for (const q of metadataDrafts) {
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

  const initialMetadata = {
    subjectStats,
    totalNewPattern,
    totalQuestions: metadataDrafts.length,
  };

  // 2. Fetch top 20 questions initially so first-page feed is immediately hydrated with zero delay
  const initialDrafts = await prisma.questionDraft.findMany({
    take: 20,
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

  const initialQuestions = initialDrafts.map(q => {
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

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', color: 'var(--text-primary)' }}>
      <PyqExplorerClient initialQuestions={initialQuestions} initialMetadata={initialMetadata} />
    </div>
  );
}

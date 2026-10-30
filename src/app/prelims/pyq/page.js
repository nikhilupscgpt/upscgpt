import Link from 'next/link';
import prisma from '@/lib/prisma';
import PyqExplorerClient from './PyqExplorerClient';
import { isNewPatternQuestion } from '@/lib/pyqPattern';
import { generateQuestionSlug } from '@/lib/pyqSlug';
import { SUBJECT_ORDER, SUBJECT_SHORT, getTopicSyllabusOrder } from './topicGroups';

// Incremental Static Regeneration (ISR): Revalidate every 5 minutes
export const revalidate = 300;

export const metadata = {
  title: 'UPSC Prelims PYQ (2011–2025) Topic-Wise Solved Questions & Explanations',
  description: 'Practice 2,528+ authentic UPSC Civil Services (CSE) & CDS Prelims Previous Year Questions (2011–2025) organized by Subject and Topic with verified official answer keys and detailed explanations.',
  keywords: [
    'UPSC Prelims PYQ',
    'UPSC Previous Year Questions Topic Wise',
    'UPSC CSE Prelims Solved Papers 2011 to 2025',
    'Indian Polity UPSC PYQ',
    'Economy UPSC Prelims Questions',
    'Geography UPSC PYQ',
    'Environment UPSC Prelims PYQ',
    'Science and Technology UPSC PYQ',
    'Modern History UPSC PYQ',
    'CDS PYQ Topic Wise'
  ],
  alternates: {
    canonical: 'https://www.upscgpt.in/prelims/pyq',
  },
  openGraph: {
    title: 'UPSC Prelims PYQ (2011–2025) Topic-Wise Solved Questions | UPSCGPT',
    description: '2,528+ authentic UPSC CSE & CDS Prelims Previous Year Questions organized topic-by-topic with official answer keys and explanations.',
    url: 'https://www.upscgpt.in/prelims/pyq',
    siteName: 'UPSCGPT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UPSC Prelims PYQ (2011–2025) Topic-Wise Solved Archive | UPSCGPT',
    description: '2,528+ authentic UPSC CSE & CDS Prelims Previous Year Questions organized topic-by-topic with official answer keys.',
  },
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
  // 1. Fetch compact metadata across all questions for fast Subject Hub paint & SEO Directory
  const metadataDrafts = await prisma.questionDraft.findMany({
    select: {
      id: true,
      dedupHash: true,
      examName: true,
      examYear: true,
      questionNo: true,
      srcSubject: true,
      srcTopic: true,
      stem: true,
    },
    orderBy: [{ examYear: 'desc' }, { questionNo: 'asc' }],
  });

  const map = new Map();
  const subjectNewPatternCount = {};
  const subjectSampleQuestions = new Map();
  let totalNewPattern = 0;

  for (const q of metadataDrafts) {
    if (isNewPatternQuestion(q)) {
      totalNewPattern++;
      subjectNewPatternCount[q.srcSubject] = (subjectNewPatternCount[q.srcSubject] || 0) + 1;
    }

    if (!map.has(q.srcSubject)) {
      map.set(q.srcSubject, { count: 0, topics: new Map() });
      subjectSampleQuestions.set(q.srcSubject, []);
    }
    const entry = map.get(q.srcSubject);
    entry.count++;
    if (q.srcTopic) {
      entry.topics.set(q.srcTopic, (entry.topics.get(q.srcTopic) || 0) + 1);
    }

    // Keep up to 4 representative core-topic questions per subject for SSR crawl links
    const samples = subjectSampleQuestions.get(q.srcSubject);
    if (samples && samples.length < 4 && q.stem && q.srcTopic !== 'Miscellaneous') {
      samples.push({
        id: q.id,
        slug: generateQuestionSlug(q),
        examName: q.examName || 'UPSC CSE Pre',
        examYear: q.examYear || '',
        srcTopic: q.srcTopic || 'General',
        shortStem: q.stem.replace(/\s+/g, ' ').trim().slice(0, 110),
      });
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
      .sort(([a], [b]) => {
        const orderA = getTopicSyllabusOrder(s, a);
        const orderB = getTopicSyllabusOrder(s, b);
        if (orderA !== orderB) return orderA - orderB;
        return a.localeCompare(b);
      });
    return {
      name: s,
      short: SUBJECT_SHORT[s] || s,
      count: data.count,
      topTopics,
      allTopics,
      newPatternCount: subjectNewPatternCount[s] || 0,
      meta: SUBJECT_META[s] || { icon: '📚', color: '#64748b' },
      sampleQuestions: subjectSampleQuestions.get(s) || [],
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

  // 3. Schema.org CollectionPage + ItemList for SEO & GEO Discovery
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'UPSC Prelims Previous Year Questions (2011–2025) Topic-Wise Archive',
    description: `Comprehensive archive of ${metadataDrafts.length} solved UPSC Civil Services (CSE) and CDS Prelims Previous Year Questions organized by subject and micro-topic.`,
    url: 'https://www.upscgpt.in/prelims/pyq',
    inLanguage: 'en-IN',
    isPartOf: {
      '@type': 'WebSite',
      name: 'UPSCGPT',
      url: 'https://www.upscgpt.in',
    },
    about: subjectStats.map(s => ({
      '@type': 'Thing',
      name: `UPSC Prelims ${s.name} Previous Year Questions (${s.count} Solved MCQs)`,
    })),
    mainEntity: {
      '@type': 'ItemList',
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
      numberOfItems: metadataDrafts.length,
      itemListElement: subjectStats.flatMap(s => s.sampleQuestions).slice(0, 30).map((sq, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `https://www.upscgpt.in/prelims/pyq/${sq.slug}`,
        name: `${sq.examName} ${sq.examYear}: ${sq.shortStem}`,
      })),
    },
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', color: 'var(--text-primary)' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PyqExplorerClient initialQuestions={initialQuestions} initialMetadata={initialMetadata} />
    </div>
  );
}

import Link from 'next/link';
import prisma from '@/lib/prisma';
import PyqExplorerClient from './PyqExplorerClient';
import { isNewPatternQuestion } from '@/lib/pyqPattern';
import { generateQuestionSlug } from '@/lib/pyqSlug';
import { SUBJECT_ORDER, SUBJECT_SHORT } from './topicGroups';

// Incremental Static Regeneration (ISR): Edge cached for 24 hours so bots consume 0 DB compute
export const revalidate = 86400;

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

    // Keep up to 6 representative questions per subject for SSR crawl links
    const samples = subjectSampleQuestions.get(q.srcSubject);
    if (samples && samples.length < 6 && q.stem) {
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
      .sort((a, b) => b[1] - a[1]);
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

      {/* Server-Rendered SEO & GEO Topic + Question Directory (Crawlable without JS execution) */}
      <section
        aria-label="UPSC Prelims Topic-Wise PYQ Archive Directory"
        style={{
          maxWidth: '1160px',
          margin: '24px auto 72px auto',
          padding: '0 20px',
        }}
      >
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.55)',
            border: '1px solid rgba(148, 163, 184, 0.14)',
            borderRadius: '20px',
            padding: '28px',
          }}
        >
          <h2 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', fontWeight: 800 }}>
            UPSC Prelims Topic-Wise Solved Question Bank ({metadataDrafts.length.toLocaleString()} Verified PYQs)
          </h2>
          <p style={{ margin: '0 0 22px 0', fontSize: '0.88rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.6 }}>
            Explore direct solved questions from UPSC Civil Services (CSE) Prelims and CDS exams (2011–2025). Each question includes the official UPSC answer key, option verification, and conceptual explanation.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '18px',
            }}
          >
            {subjectStats.map(s => (
              <div
                key={s.name}
                style={{
                  background: 'rgba(2, 6, 23, 0.45)',
                  border: '1px solid rgba(148, 163, 184, 0.12)',
                  borderRadius: '14px',
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800 }}>
                    {s.meta.icon} {s.name} UPSC PYQs
                  </h3>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>
                    {s.count} Questions
                  </span>
                </div>

                {/* Crawlable Topic Links */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                  {s.allTopics.slice(0, 6).map(([tName, tCount]) => (
                    <Link
                      key={tName}
                      href={`/prelims/pyq?subject=${encodeURIComponent(s.name)}&topic=${encodeURIComponent(tName)}`}
                      style={{
                        fontSize: '0.72rem',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.22)',
                        color: '#93c5fd',
                        textDecoration: 'none',
                        fontWeight: 600,
                      }}
                    >
                      {tName} ({tCount})
                    </Link>
                  ))}
                </div>

                {/* Crawlable Direct Question Links for Search Spiders */}
                <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {s.sampleQuestions.slice(0, 4).map(sq => (
                    <li key={sq.id} style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4 }}>
                      <Link
                        href={`/prelims/pyq/${sq.slug}`}
                        style={{ color: '#cbd5e1', textDecoration: 'none' }}
                      >
                        <strong style={{ color: '#60a5fa' }}>[{sq.examName} {sq.examYear}]</strong> {sq.shortStem}…
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

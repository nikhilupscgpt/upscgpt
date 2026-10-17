import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import StandaloneQuestionClient from './StandaloneQuestionClient';
import { generateQuestionSlug, extractQuestionIdFromSlug } from '@/lib/pyqSlug';

// 24-hour ISR Cache: Ensures search crawlers consume 0 DB/server compute after initial cache
export const revalidate = 86400;

async function findQuestion(decodedId) {
  const targetId = extractQuestionIdFromSlug(decodedId);

  // 1. Check QuestionDraft first (master admin-curated PYQ table with latest explanations)
  const draft = await prisma.questionDraft.findFirst({
    where: {
      OR: [
        { dedupHash: targetId },
        { id: targetId },
        { dedupHash: decodedId },
        { id: decodedId }
      ]
    }
  });

  if (draft) {
    return draft;
  }

  // 2. Fallback to published Question table
  const published = await prisma.question.findFirst({
    where: {
      OR: [
        { dedupHash: targetId },
        { id: targetId },
        { dedupHash: decodedId },
        { id: decodedId }
      ]
    },
    include: { subject: true, topic: true }
  });

  if (published) {
    return {
      ...published,
      srcSubject: published.subject?.name,
      srcTopic: published.topic?.name
    };
  }

  return null;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  const q = await findQuestion(decodedId);

  if (!q) {
    return { title: 'Question Not Found | UPSCGPT' };
  }

  const canonicalSlug = generateQuestionSlug(q);
  const canonicalUrl = `https://www.upscgpt.in/prelims/pyq/${canonicalSlug}`;
  const cleanStem = (q.stem || '').replace(/\s+/g, ' ').trim().slice(0, 125);
  const examLabel = `${q.examName || 'UPSC Prelims'} ${q.examYear || ''}`.trim();
  const topicLabel = [q.srcSubject, q.srcTopic].filter(Boolean).join(' – ');

  const title = `${cleanStem} | ${examLabel} Solved PYQ`;
  const description = `Official UPSC Answer Key (${(q.correctLabel || '').toUpperCase()}) & detailed explanation for ${examLabel} (${topicLabel}): "${cleanStem}". ${(q.explanation || '').replace(/\s+/g, ' ').trim().slice(0, 110)}`;

  return {
    title,
    description,
    keywords: [
      examLabel,
      q.srcSubject || 'UPSC Prelims',
      q.srcTopic || 'PYQ',
      `${examLabel} Solved Question`,
      'UPSC Prelims PYQ with Explanation',
    ].filter(Boolean),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonicalUrl,
      siteName: 'UPSCGPT',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    }
  };
}

export default async function StandaloneQuestionPage({ params }) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  const q = await findQuestion(decodedId);

  if (!q) {
    notFound();
  }

  const canonicalSlug = generateQuestionSlug(q);

  // Automatically redirect raw IDs or old hashes to the full SEO/GEO semantic slug
  if (decodedId !== canonicalSlug) {
    redirect(`/prelims/pyq/${canonicalSlug}`);
  }

  const canonicalUrl = `https://www.upscgpt.in/prelims/pyq/${canonicalSlug}`;

  // Fetch up to 6 related questions in the same Topic/Subject for internal crawl spidering
  const relatedRaw = await prisma.questionDraft.findMany({
    where: {
      id: { not: q.id },
      ...(q.srcTopic ? { srcTopic: q.srcTopic } : q.srcSubject ? { srcSubject: q.srcSubject } : {}),
    },
    take: 6,
    orderBy: [{ examYear: 'desc' }, { questionNo: 'asc' }],
    select: {
      id: true,
      dedupHash: true,
      examName: true,
      examYear: true,
      questionNo: true,
      srcSubject: true,
      srcTopic: true,
      stem: true,
      correctLabel: true,
    },
  });

  const relatedQuestions = relatedRaw.map(rq => ({
    id: rq.id,
    slug: generateQuestionSlug(rq),
    examName: rq.examName || 'UPSC CSE Pre',
    examYear: rq.examYear || '',
    srcSubject: rq.srcSubject || q.srcSubject || 'General',
    srcTopic: rq.srcTopic || q.srcTopic || 'General',
    shortStem: (rq.stem || '').replace(/\s+/g, ' ').trim().slice(0, 140),
  }));

  // Parse options
  let opts = [];
  if (typeof q.options === 'string') {
    try { opts = JSON.parse(q.options); } catch (e) { opts = []; }
  } else if (Array.isArray(q.options)) {
    opts = q.options;
  }

  const correctOpt = opts.find(o => (o.label || '').toLowerCase() === (q.correctLabel || '').toLowerCase());
  const correctLabelUpper = (q.correctLabel || 'A').toUpperCase();
  const correctText = correctOpt ? `(${correctLabelUpper}) ${correctOpt.text}` : `(${correctLabelUpper})`;
  const fullExplanation = q.explanation ? `Official Correct Answer: ${correctText}. Explanation: ${q.explanation}` : `Official Correct Answer: ${correctText}.`;

  // Schema.org QAPage + BreadcrumbList Structured Data for Google Rich Snippets & GEO AI Search engines
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'UPSCGPT',
          item: 'https://www.upscgpt.in',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'UPSC Prelims PYQ Explorer',
          item: 'https://www.upscgpt.in/prelims/pyq',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: q.srcSubject || 'Subject',
          item: `https://www.upscgpt.in/prelims/pyq?subject=${encodeURIComponent(q.srcSubject || 'ALL')}`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: `${q.examName || 'UPSC'} ${q.examYear || ''} Q#${q.questionNo || ''}`.trim(),
          item: canonicalUrl,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'QAPage',
      mainEntity: {
        '@type': 'Question',
        name: (q.stem || '').replace(/\s+/g, ' ').trim().slice(0, 160),
        text: q.stem,
        answerCount: 1,
        acceptedAnswer: {
          '@type': 'Answer',
          text: fullExplanation,
          url: `${canonicalUrl}#answer`,
          upvoteCount: 42
        },
        suggestedAnswer: opts.map(opt => ({
          '@type': 'Answer',
          text: `(${(opt.label || '').toUpperCase()}) ${opt.text}`
        })),
        inLanguage: 'en-IN',
        about: [
          { '@type': 'Thing', name: q.srcSubject || 'UPSC Civil Services Examination' },
          { '@type': 'Thing', name: q.srcTopic || 'General Studies' },
        ],
        isPartOf: {
          '@type': 'WebSite',
          name: 'UPSCGPT',
          url: 'https://www.upscgpt.in'
        }
      }
    }
  ];

  const questionData = {
    id: q.id,
    dedupHash: q.dedupHash,
    canonicalSlug,
    questionNo: q.questionNo,
    examName: q.examName || 'UPSC CSE Pre',
    examYear: q.examYear || 2025,
    srcSubject: q.srcSubject || 'Indian Polity',
    srcTopic: q.srcTopic || 'General',
    stem: q.stem,
    options: opts,
    correctLabel: q.correctLabel,
    explanation: q.explanation || null,
    analysis: q.analysis || null,
    relatedQuestions,
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'transparent', color: 'var(--text-primary)', fontFamily: 'var(--font-outfit), system-ui, -apple-system, sans-serif' }}>
      {/* Google Schema.org JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StandaloneQuestionClient question={questionData} />
    </div>
  );
}

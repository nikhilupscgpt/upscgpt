import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import StandaloneQuestionClient from './StandaloneQuestionClient';
import { generateQuestionSlug, extractQuestionIdFromSlug } from '@/lib/pyqSlug';
import {
  buildPyqSeoTitle,
  buildPyqMetaDescription,
  buildPyqSchemaTeaser,
  extractCoreSubjectEntity,
  stripBoilerplateFromStem,
} from '@/lib/seo';
import { resolveSyllabusNodesForQuestion } from '@/lib/nodeBridge';

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
  const ogImageUrl = `https://www.upscgpt.in/api/og/pyq/${canonicalSlug}`;
  const examLabel = `${q.examName || 'UPSC Prelims'} ${q.examYear || ''}`.trim();
  const coreEntity = extractCoreSubjectEntity(q);
  const syllabusNodes = resolveSyllabusNodesForQuestion(q, 3);

  const title = buildPyqSeoTitle(q);
  const description = buildPyqMetaDescription(q);

  return {
    title,
    description,
    keywords: [
      coreEntity,
      examLabel,
      q.srcSubject || 'UPSC Prelims',
      q.srcTopic || 'PYQ',
      ...syllabusNodes.map(n => n.title),
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
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${title} - UPSCGPT Question Card`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
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
    shortStem: (stripBoilerplateFromStem(rq.stem || '') || (rq.stem || '').replace(/\s+/g, ' ').trim()).slice(0, 140),
  }));

  // Parse options
  let opts = [];
  if (typeof q.options === 'string') {
    try { opts = JSON.parse(q.options); } catch (e) { opts = []; }
  } else if (Array.isArray(q.options)) {
    opts = q.options;
  }

  // Resolve corresponding static /node/[slug] syllabus pages for high-impact internal linking
  const syllabusNodes = resolveSyllabusNodesForQuestion(q, 3);
  const primaryNode = syllabusNodes[0] || null;
  const coreEntity = extractCoreSubjectEntity(q);
  const cleanQuestionHeading = `${coreEntity}: ${stripBoilerplateFromStem(q.stem || '') || (q.stem || '').replace(/\s+/g, ' ').trim()}`.slice(0, 160);

  // Truncated teaser for QAPage schema to prevent zero-click SERP answer leakage
  const schemaAnswerTeaser = buildPyqSchemaTeaser(q, canonicalUrl);

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
        ...(primaryNode
          ? [
              {
                '@type': 'ListItem',
                position: 3,
                name: primaryNode.title,
                item: `https://www.upscgpt.in/node/${primaryNode.slug}`,
              },
              {
                '@type': 'ListItem',
                position: 4,
                name: `${q.examName || 'UPSC'} ${q.examYear || ''} Q#${q.questionNo || ''}`.trim(),
                item: canonicalUrl,
              },
            ]
          : [
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
            ]),
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'QAPage',
      mainEntity: {
        '@type': 'Question',
        name: cleanQuestionHeading,
        text: q.stem,
        image: `https://www.upscgpt.in/api/og/pyq/${canonicalSlug}`,
        answerCount: 1,
        acceptedAnswer: {
          '@type': 'Answer',
          text: schemaAnswerTeaser,
          url: `${canonicalUrl}#answer`,
          upvoteCount: 42
        },
        suggestedAnswer: opts.map(opt => ({
          '@type': 'Answer',
          text: `(${(opt.label || '').toUpperCase()}) ${opt.text}`
        })),
        inLanguage: 'en-IN',
        about: [
          { '@type': 'Thing', name: coreEntity },
          { '@type': 'Thing', name: q.srcSubject || 'UPSC Civil Services Examination' },
          { '@type': 'Thing', name: q.srcTopic || 'General Studies' },
          ...syllabusNodes.map(n => ({
            '@type': 'Course',
            name: n.title,
            url: `https://www.upscgpt.in/node/${n.slug}`,
          })),
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
    coreEntity,
    stem: q.stem,
    options: opts,
    correctLabel: q.correctLabel,
    explanation: q.explanation || null,
    analysis: q.analysis || null,
    relatedQuestions,
    syllabusNodes,
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

import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import StandaloneQuestionClient from './StandaloneQuestionClient';
import { generateQuestionSlug, extractQuestionIdFromSlug } from '@/lib/pyqSlug';

const prisma = new PrismaClient();

async function findQuestion(decodedId) {
  const targetId = extractQuestionIdFromSlug(decodedId);

  // 1. Look in published Question table
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

  // 2. Fallback to QuestionDraft table
  return await prisma.questionDraft.findFirst({
    where: {
      OR: [
        { dedupHash: targetId },
        { id: targetId },
        { dedupHash: decodedId },
        { id: decodedId }
      ]
    }
  });
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
  const cleanStem = (q.stem || '').replace(/\s+/g, ' ').trim().slice(0, 130);
  const examLabel = `${q.examName || 'UPSC Prelims'} ${q.examYear || ''}`.trim();

  const title = `${cleanStem} | ${examLabel} Solved PYQ`;
  const description = `Verified answer key & solution for ${examLabel} question: "${cleanStem}". Official Answer: (${(q.correctLabel || '').toUpperCase()}). Practice and master on UPSCGPT.`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonicalUrl,
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
  const canonicalUrl = `https://www.upscgpt.in/prelims/pyq/${canonicalSlug}`;

  // Parse options
  let opts = [];
  if (typeof q.options === 'string') {
    try { opts = JSON.parse(q.options); } catch (e) { opts = []; }
  } else if (Array.isArray(q.options)) {
    opts = q.options;
  }

  const correctOpt = opts.find(o => (o.label || '').toLowerCase() === (q.correctLabel || '').toLowerCase());
  const correctText = correctOpt ? `(${q.correctLabel.toUpperCase()}) ${correctOpt.text}` : `(${q.correctLabel.toUpperCase()})`;
  const fullExplanation = q.explanation ? `${correctText}. ${q.explanation}` : correctText;

  // Schema.org QAPage Structured Data for Google Rich Snippets & GEO AI Search engines
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: q.stem.replace(/\s+/g, ' ').trim().slice(0, 160),
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
        text: `(${opt.label.toUpperCase()}) ${opt.text}`
      })),
      inLanguage: 'en-IN',
      isPartOf: {
        '@type': 'WebSite',
        name: 'UPSCGPT',
        url: 'https://www.upscgpt.in'
      }
    }
  };

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
    analysis: q.analysis || null
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

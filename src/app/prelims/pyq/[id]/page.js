import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import StandaloneQuestionClient from './StandaloneQuestionClient';

const prisma = new PrismaClient();

async function findQuestion(decodedId) {
  const published = await prisma.question.findFirst({
    where: {
      OR: [
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
  return await prisma.questionDraft.findFirst({
    where: {
      OR: [
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

  const cleanStem = (q.stem || '').replace(/\n+/g, ' ').slice(0, 120);
  const title = `Q: ${cleanStem}... | ${q.examName} ${q.examYear} PYQ`;
  const description = `Solve this ${q.examName} (${q.examYear}) Previous Year Question on ${q.srcTopic} with verified official answer key and explanation on UPSCGPT.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://www.upscgpt.in/prelims/pyq/${encodeURIComponent(q.dedupHash || q.id)}`,
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

  // Parse options
  let opts = [];
  if (typeof q.options === 'string') {
    try { opts = JSON.parse(q.options); } catch (e) { opts = []; }
  } else if (Array.isArray(q.options)) {
    opts = q.options;
  }

  const correctOpt = opts.find(o => (o.label || '').toLowerCase() === (q.correctLabel || '').toLowerCase());
  const correctText = correctOpt ? `(${q.correctLabel.toUpperCase()}) ${correctOpt.text}` : `(${q.correctLabel.toUpperCase()})`;

  // Schema.org QAPage Structured Data for Google Rich Snippets & GEO AI Search
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: q.stem.slice(0, 150),
      text: q.stem,
      answerCount: 1,
      acceptedAnswer: {
        '@type': 'Answer',
        text: correctText,
        url: `https://www.upscgpt.in/prelims/pyq/${encodeURIComponent(q.dedupHash || q.id)}#answer`
      },
      suggestedAnswer: opts.map(opt => ({
        '@type': 'Answer',
        text: `(${opt.label.toUpperCase()}) ${opt.text}`
      }))
    }
  };

  const questionData = {
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
    explanation: q.explanation || null
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

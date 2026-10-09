import { PrismaClient } from '@prisma/client';
import PyqExplorerClient from './PyqExplorerClient';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'PYQ Explorer — UPSC & CDS Previous Year Questions | PrelimsGPT',
  description: 'Find any previous year question, attempt it right here, and turn any topic into a timed practice test.',
};

export default async function PyqExplorerPage() {
  const drafts = await prisma.questionDraft.findMany({
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

  const questions = drafts.map(q => {
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
      <PyqExplorerClient initialQuestions={questions} />
    </div>
  );
}

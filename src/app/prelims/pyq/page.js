import { PrismaClient } from '@prisma/client';
import PyqExplorerClient from './PyqExplorerClient';

const prisma = new PrismaClient();

export const metadata = {
  title: 'UPSC & CDS PYQ Topic Explorer | PrelimsGPT',
  description: 'Topic-wise previous year questions for UPSC CSE and CDS with instant verification and filter search.',
};

export default async function PyqExplorerPage() {
  // Fetch from drafts or published questions
  let drafts = await prisma.questionDraft.findMany({
    orderBy: [
      { examYear: 'desc' },
      { questionNo: 'asc' }
    ]
  });

  // Normalize questions for the client
  const questions = drafts.map(q => {
    let opts = [];
    if (typeof q.options === 'string') {
      try { opts = JSON.parse(q.options); } catch (e) { opts = []; }
    } else if (Array.isArray(q.options)) {
      opts = q.options;
    }

    return {
      id: q.id,
      dedupHash: q.dedupHash,
      questionNo: q.questionNo,
      examName: q.examName || 'UPSC CSE Pre',
      examYear: q.examYear || 2023,
      srcSubject: q.srcSubject || 'Indian Polity',
      srcTopic: q.srcTopic || 'General',
      stem: q.stem,
      options: opts,
      correctLabel: q.correctLabel,
      explanation: q.explanation || null,
      rawText: q.rawText || null,
      flags: q.flags || []
    };
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'transparent', color: 'var(--text-primary)', fontFamily: 'var(--font-outfit), system-ui, -apple-system, sans-serif' }}>
      <PyqExplorerClient initialQuestions={questions} />
    </div>
  );
}

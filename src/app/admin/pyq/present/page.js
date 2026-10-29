import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import PyqPresenterClient from "./PyqPresenterClient";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'PYQ Lecture Studio & Slide Mode | Admin',
  description: '1080p full-screen broadcast studio for recording UPSC Prelims micro-lectures with dual-layer pen annotations and pinned question stage.',
};

export default async function PyqPresentPage({ searchParams }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'FACULTY')) {
    redirect("/admin-login");
  }

  const sp = await searchParams;
  const singleId = sp?.id;
  const multiIds = sp?.ids ? sp.ids.split(',').map(s => s.trim()).filter(Boolean) : [];
  const subject = sp?.subject;
  const topic = sp?.topic;

  const andConditions = [];

  if (singleId) {
    andConditions.push({ id: singleId });
  } else if (multiIds.length > 0) {
    andConditions.push({ id: { in: multiIds } });
  } else {
    if (subject && subject !== 'ALL') {
      andConditions.push({ srcSubject: subject });
    }
    if (topic && topic !== 'ALL') {
      andConditions.push({ srcTopic: topic });
    }
  }

  const where = andConditions.length > 0 ? { AND: andConditions } : {};

  const drafts = await prisma.questionDraft.findMany({
    where,
    take: 50,
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
      options: true,
      correctLabel: true,
      explanation: true,
      difficulty: true,
    },
  });

  // Preserve order of requested multiIds if provided
  let orderedDrafts = drafts;
  if (multiIds.length > 0) {
    const map = new Map(drafts.map(d => [d.id, d]));
    orderedDrafts = multiIds.map(id => map.get(id)).filter(Boolean);
  }

  const questions = orderedDrafts.map(q => {
    let opts = [];
    if (Array.isArray(q.options)) {
      opts = q.options;
    } else if (typeof q.options === 'string') {
      try {
        const parsed = JSON.parse(q.options);
        if (Array.isArray(parsed)) opts = parsed;
      } catch {
        opts = [];
      }
    }

    return {
      id: q.id,
      dedupHash: q.dedupHash,
      examName: q.examName || 'UPSC CSE Pre',
      examYear: q.examYear || '',
      questionNo: q.questionNo || '',
      srcSubject: q.srcSubject || 'General Studies',
      srcTopic: q.srcTopic || 'General',
      stem: q.stem || '',
      options: opts,
      correctLabel: q.correctLabel || null,
      explanation: q.explanation || null,
      difficulty: q.difficulty || null,
    };
  });

  return <PyqPresenterClient questions={questions} />;
}

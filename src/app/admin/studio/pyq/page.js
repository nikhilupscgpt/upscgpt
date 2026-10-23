import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import PyqStudioClient from "./PyqStudioClient";
import { TOPIC_GROUPS, SUBJECT_ORDER } from "@/lib/syllabusTaxonomy";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'PYQ Lecture Studio Workstation | Admin',
  description: 'Full-featured UPSC Prelims PYQ workstation with complete syllabus filters, recording queue, map attachments, and 1080p broadcast presenter.',
};

export default async function PyqStudioPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'ADMIN') {
    redirect("/login");
  }

  // Pre-fetch distinct filter options directly from database
  const [subjectsRaw, yearsRaw, examsRaw] = await Promise.all([
    prisma.questionDraft.findMany({
      select: { srcSubject: true },
      distinct: ['srcSubject'],
    }),
    prisma.questionDraft.findMany({
      select: { examYear: true },
      distinct: ['examYear'],
      orderBy: { examYear: 'desc' },
    }),
    prisma.questionDraft.findMany({
      select: { examName: true },
      distinct: ['examName'],
    }),
  ]);

  const subjects = subjectsRaw.map(s => s.srcSubject).filter(Boolean);
  const years = yearsRaw.map(y => y.examYear).filter(Boolean);
  const exams = examsRaw.map(e => e.examName).filter(Boolean);

  // Sort subjects using standard syllabus order
  subjects.sort((a, b) => {
    const ia = SUBJECT_ORDER.indexOf(a);
    const ib = SUBJECT_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  return (
    <PyqStudioClient
      initialFilterOptions={{
        subjects,
        years,
        exams,
        topicGroups: TOPIC_GROUPS,
      }}
    />
  );
}

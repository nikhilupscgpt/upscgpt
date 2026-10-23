import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import StudioHubClient from "./StudioHubClient";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Lecture Studio Control Center | Admin',
  description: 'Broadcast lecture production hub for recording UPSC Prelims PYQs and Thematic Masterclasses with dual-layer pen annotations.',
};

export default async function StudioPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'ADMIN') {
    redirect("/login");
  }

  // Fetch distinct subjects & years for PYQ mode
  const [subjectsRaw, yearsRaw, domainsRaw, initialQuestionsRaw, initialTopics] = await Promise.all([
    prisma.questionDraft.findMany({
      select: { srcSubject: true },
      distinct: ['srcSubject'],
    }),
    prisma.questionDraft.findMany({
      select: { examYear: true },
      distinct: ['examYear'],
      orderBy: { examYear: 'desc' },
    }),
    prisma.issue.findMany({
      select: { domain: true },
      distinct: ['domain'],
      orderBy: { domain: 'asc' },
    }),
    prisma.questionDraft.findMany({
      take: 25,
      orderBy: [{ examYear: 'desc' }, { questionNo: 'asc' }],
      select: {
        id: true,
        examName: true,
        examYear: true,
        questionNo: true,
        srcSubject: true,
        srcTopic: true,
        stem: true,
        options: true,
        correctLabel: true,
        difficulty: true,
      },
    }),
    prisma.issue.findMany({
      take: 25,
      orderBy: { title: 'asc' },
      select: {
        id: true,
        title: true,
        slug: true,
        domain: true,
        topic: true,
        gsPapers: true,
        cumulativeSummary: true,
        backgroundNote: true,
        valueAddition: true,
        imageUrl: true,
      },
    }),
  ]);

  const subjects = subjectsRaw.map(s => s.srcSubject).filter(Boolean);
  const years = yearsRaw.map(y => y.examYear).filter(Boolean);
  const domains = domainsRaw.map(d => d.domain).filter(Boolean);

  const initialQuestions = initialQuestionsRaw.map(q => {
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
      ...q,
      options: opts,
    };
  });

  return (
    <StudioHubClient
      initialSubjects={subjects}
      initialYears={years}
      initialDomains={domains}
      initialQuestions={initialQuestions}
      initialTopics={initialTopics}
    />
  );
}

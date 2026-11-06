import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ScreenStudioClient from "./ScreenStudioClient";
import { SUBJECT_ORDER, TOPIC_GROUPS } from "@/lib/syllabusTaxonomy";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Screen Studio | UPSC In-Browser Recording Workstation",
  description:
    "Mac Screen Studio inspired edge-to-edge recording environment for UPSC Prelims PYQs and Thematic Topics with smooth spring zoom, annotations, webcam PiP, and instant YouTube chapter export.",
};

export default async function ScreenStudioPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user?.role !== "ADMIN" && session.user?.role !== "FACULTY")) {
    redirect("/admin-login");
  }

  // 1. Fetch Prelims PYQ Drafts
  const [pyqDrafts, subjectsRaw, yearsRaw, thematicIssues] = await Promise.all([
    prisma.questionDraft.findMany({
      take: 100,
      orderBy: [{ examYear: "desc" }, { questionNo: "asc" }],
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
    }),
    prisma.questionDraft.findMany({
      select: { srcSubject: true },
      distinct: ["srcSubject"],
    }),
    prisma.questionDraft.findMany({
      select: { examYear: true },
      distinct: ["examYear"],
      orderBy: { examYear: "desc" },
    }),
    prisma.issue.findMany({
      take: 60,
      orderBy: { updatedAt: "desc" },
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
        possibleQuestions: true,
      },
    }),
  ]);

  const subjects = subjectsRaw.map((s) => s.srcSubject).filter(Boolean);
  const years = yearsRaw.map((y) => y.examYear).filter(Boolean);

  subjects.sort((a, b) => {
    const ia = SUBJECT_ORDER.indexOf(a);
    const ib = SUBJECT_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  return (
    <ScreenStudioClient
      initialQuestions={pyqDrafts}
      initialThematicTopics={thematicIssues}
      filterOptions={{
        subjects,
        years,
        topicGroups: TOPIC_GROUPS,
      }}
    />
  );
}

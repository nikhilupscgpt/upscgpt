import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import PyqRecordingStudioClient from "./PyqRecordingStudioClient";
import { TOPIC_GROUPS, SUBJECT_ORDER } from "@/lib/syllabusTaxonomy";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "PYQ In-Browser Recording Studio | Admin",
  description:
    "UPSC Prelims PYQ Recording Workstation with syllabus filters, live webcam PiP, mic audio mixer, stage-only capture, and auto YouTube chapters.",
};

export default async function PyqRecordingStudioPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user?.role !== "ADMIN" && session.user?.role !== "FACULTY")) {
    redirect("/admin-login");
  }

  const [subjectsRaw, yearsRaw, examsRaw] = await Promise.all([
    prisma.questionDraft.findMany({
      select: { srcSubject: true },
      distinct: ["srcSubject"],
    }),
    prisma.questionDraft.findMany({
      select: { examYear: true },
      distinct: ["examYear"],
      orderBy: { examYear: "desc" },
    }),
    prisma.questionDraft.findMany({
      select: { examName: true },
      distinct: ["examName"],
    }),
  ]);

  const subjects = subjectsRaw.map((s) => s.srcSubject).filter(Boolean);
  const years = yearsRaw.map((y) => y.examYear).filter(Boolean);
  const exams = examsRaw.map((e) => e.examName).filter(Boolean);

  subjects.sort((a, b) => {
    const ia = SUBJECT_ORDER.indexOf(a);
    const ib = SUBJECT_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  return (
    <PyqRecordingStudioClient
      initialFilterOptions={{
        subjects,
        years,
        exams,
        topicGroups: TOPIC_GROUPS,
      }}
    />
  );
}

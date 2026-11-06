import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ScreenStudioClient from "./ScreenStudioClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Screen Studio | UPSC In-Browser Recording Workstation",
  description:
    "Mac Screen Studio inspired recording environment for UPSC PYQs with framed window, smooth spring zoom, customizable canvas backdrops, live webcam PiP, and instant YouTube chapter export.",
};

export default async function ScreenStudioPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user?.role !== "ADMIN" && session.user?.role !== "FACULTY")) {
    redirect("/admin-login");
  }

  // Load latest 60 questions from drafts with solutions and metadata
  const questions = await prisma.questionDraft.findMany({
    take: 60,
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
  });

  return <ScreenStudioClient initialQuestions={questions} />;
}

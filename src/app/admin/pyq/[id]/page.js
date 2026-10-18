import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import PyqVisualEditorClient from "./PyqVisualEditorClient";

export const metadata = {
  title: 'Visual Question & Slide Editor | UPSCGPT Admin',
  description: 'Split-screen real-time visual question editor with JSONL ingestion and 8-container live lecture slide rendering.',
};

export default async function AdminPyqDetailPage({ params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'ADMIN') {
    redirect("/login");
  }

  const { id } = await params;
  const question = await prisma.questionDraft.findUnique({
    where: { id }
  });

  if (!question) {
    redirect("/admin/pyq");
  }

  let normalizedOptions = [];
  if (Array.isArray(question.options)) {
    normalizedOptions = question.options;
  } else if (typeof question.options === 'string') {
    try {
      const parsed = JSON.parse(question.options);
      if (Array.isArray(parsed)) normalizedOptions = parsed;
    } catch {
      normalizedOptions = [];
    }
  }

  const initialQuestion = {
    ...question,
    options: normalizedOptions,
    createdAt: question.createdAt ? question.createdAt.toISOString() : null,
    updatedAt: question.updatedAt ? question.updatedAt.toISOString() : null,
    reviewedAt: question.reviewedAt ? question.reviewedAt.toISOString() : null,
  };

  return <PyqVisualEditorClient initialQuestion={initialQuestion} />;
}

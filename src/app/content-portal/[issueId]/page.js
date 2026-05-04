import { redirect, notFound } from 'next/navigation';
import prisma from "@/lib/prisma";

export default async function ContentPortalRedirectPage({ params }) {
  const { issueId } = await params;

  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    select: { slug: true }
  });

  if (!issue || !issue.slug) {
    notFound();
  }

  // Canonical redirection to the human-readable slug-based URL
  redirect(`/issues/${issue.slug}`);
}

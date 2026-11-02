import { permanentRedirect, notFound } from 'next/navigation';
import prisma from "@/lib/prisma";

export const metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function ContentPortalRedirectPage({ params }) {
  const { issueId } = await params;

  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    select: { slug: true }
  });

  if (!issue || !issue.slug) {
    notFound();
  }

  // Permanent canonical redirection to the master /node/[slug] knowledge-graph URL
  permanentRedirect(`/node/${issue.slug}`);
}

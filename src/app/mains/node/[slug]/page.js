import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import MainsNodeStudyClient from './MainsNodeStudyClient';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const issue = await prisma.issue.findUnique({
    where: { slug },
    select: { title: true, domain: true, topic: true, cumulativeSummary: true }
  });
  if (!issue) return { title: 'Node Not Found' };
  return {
    title: `${issue.title} — Mains Command Center`,
    description: issue.cumulativeSummary?.slice(0, 160) || `Strategic Mains study guide for ${issue.title}.`
  };
}

export default async function MainsNodePage({ params }) {
  const { slug } = await params;
  const issue = await prisma.issue.findUnique({
    where: { slug },
    include: {
      nodeContent: true,
      articles: {
        where: { status: 'DONE' },
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      timelineEvents: {
        orderBy: { date: 'desc' },
        take: 15
      },
      pyqLinks: {
        orderBy: { year: 'desc' }
      }
    }
  });

  if (!issue) notFound();

  // Only show articles directly associated with this issue
  const articles = issue.articles || [];

  const session = await getServerSession(authOptions);

  // Clean serialization for client component
  const issueData = JSON.parse(JSON.stringify(issue));
  const articlesData = JSON.parse(JSON.stringify(articles));

  return (
    <MainsNodeStudyClient 
      issue={issueData} 
      articles={articlesData}
      sessionExists={!!session}
    />
  );
}

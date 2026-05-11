import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from "@/lib/auth"
import FloatingChatWrapper from '@/components/content-portal/FloatingChatWrapper'
import IssueDetailClient from '@/components/IssueDetailClient'

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const issue = await prisma.issue.findUnique({
    where: { slug },
    select: { title: true, domain: true, topic: true, cumulativeSummary: true }
  })
  if (!issue) return { title: 'Issue Not Found' }
  return {
    title: `${issue.title} — UPSCGPT Intelligence Hub`,
    description: issue.cumulativeSummary?.slice(0, 160) || `Strategic analysis of ${issue.title}.`,
  }
}

export default async function IssuePage({ params }) {
  const { slug } = await params;

  const issue = await prisma.issue.findUnique({
    where: { slug },
    include: {
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
  })

  if (!issue) notFound()

  const session = await getServerSession(authOptions);

  // Clean serialization for Client Component
  const issueData = JSON.parse(JSON.stringify(issue));

  return (
    <div style={{ background: '#020617', minHeight: '100vh', padding: '90px 24px 80px', fontFamily: '"Outfit", sans-serif', color: '#f8fafc', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.03), transparent), radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.03), transparent)' }} />

      <div className="issue-study-layout" style={{ maxWidth: '1440px', margin: '0 auto', display: 'grid', gridTemplateColumns: session ? '1fr 380px' : '1fr', gap: '32px' }}>
        <main className="issue-study-main">
          <IssueDetailClient issue={issueData} />
        </main>

        {session && (
          <aside className="issue-study-assistant" style={{ position: 'sticky', top: '100px', height: 'calc(100vh - 140px)' }}>
            <FloatingChatWrapper
              subjectId={issue.id}
              displayName={issue.title}
              examType="MAINS"
              variant="inline"
            />
          </aside>
        )}
      </div>
    </div>
  )
}

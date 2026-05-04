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
    title: `${issue.title} — UPSCGPT Strategic Notes`,
    description: issue.cumulativeSummary?.slice(0, 160) || `Comprehensive UPSC analysis of ${issue.title} in ${issue.domain}.`,
  }
}

export default async function IssuePublicPage({ params }) {
  const { slug } = await params;
  
  // High-Fidelity Query for Node and Sub-Questions
  const issue = await prisma.issue.findUnique({
    where: { slug },
    include: {
      articles: { orderBy: { publishedAt: 'desc' }, take: 10 },
      editorials: { orderBy: { publishedAt: 'desc' }, take: 5 },
      pyqLinks: true,
      nodeContent: true,
      questions: { orderBy: { createdAt: 'desc' } },
      subNodes: {
        include: { 
          articles: true,
          subNodes: {
            where: { nodeType: 'MAINS_QUESTION' }
          }
        }
      }
    }
  })

  if (!issue) notFound()

  // FORCE-FETCH: Bypass Prisma relation issues by manually grabbing children
  const manualSubNodes = await prisma.issue.findMany({
    where: { parentIssueId: issue.id },
    include: { 
      articles: { select: { id: true, title: true, source: true } },
      subNodes: { where: { nodeType: 'MAINS_QUESTION' } }
    },
    orderBy: { orderIndex: 'asc' }
  });

  // Inject the manually fetched subnodes into the object
  issue.subNodes = manualSubNodes;

  const session = await getServerSession(authOptions);
  // Ensure dates and nested structures are cleanly serialized
  const issueData = JSON.parse(JSON.stringify(issue));

  return (
    <div style={{ background: '#020617', minHeight: '100vh', padding: '100px 32px 80px', fontFamily: '"Outfit", sans-serif', color: '#f5f5f7', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-15%', left: '-15%', width: '80vw', height: '80vw', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 65%)', filter: 'blur(120px)' }} />
        <div style={{ position: 'absolute', bottom: '-15%', right: '-15%', width: '80vw', height: '80vw', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 65%)', filter: 'blur(120px)' }} />
      </div>

      <div className="issue-study-layout">
        <main className="issue-study-main">
          <IssueDetailClient issue={issueData} />
        </main>

        {session && (
          <aside className="issue-study-assistant" aria-label="Issue assistant">
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

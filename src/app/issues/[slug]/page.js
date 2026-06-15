import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from "@/lib/auth"
import Link from 'next/link'
import { Lock } from 'lucide-react'
import FloatingChatWrapper from '@/components/content-portal/FloatingChatWrapper'
import IssueDetailClient from '@/components/IssueDetailClient'
import { stripHtml } from '@/lib/seo'

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const issue = await prisma.issue.findUnique({
    where: { slug },
    select: { title: true, domain: true, topic: true, cumulativeSummary: true }
  })
  if (!issue) return { title: 'Issue Not Found' }
  const cleanDesc = stripHtml(issue.cumulativeSummary).substring(0, 160) || `Strategic analysis of ${issue.title}.`;
  return {
    title: `${issue.title} — UPSCGPT Intelligence Hub`,
    description: cleanDesc,
    alternates: {
      canonical: `/issues/${slug}`,
    },
  }
}

export default async function IssuePage({ params, searchParams }) {
  const { slug } = await params;
  const { flow } = (await searchParams) || {};
  const activeFlow = flow === 'prelims' ? 'prelims' : 'mains';

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

  let isBookmarked = false;
  let progressStatus = "UNSTARTED";

  if (session?.user?.id) {
    const [bookmark, progress] = await Promise.all([
      prisma.bookmark.findUnique({
        where: {
          userId_itemType_itemId: {
            userId: session.user.id,
            itemType: 'Issue',
            itemId: issue.id
          }
        }
      }),
      prisma.issueProgress.findUnique({
        where: {
          userId_issueId: {
            userId: session.user.id,
            issueId: issue.id
          }
        },
        select: { status: true }
      })
    ]);
    isBookmarked = !!bookmark;
    progressStatus = progress?.status || "UNSTARTED";
  }

  // Clean serialization for Client Component
  const issueData = JSON.parse(JSON.stringify(issue));

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '90px 24px 80px', fontFamily: '"Outfit", sans-serif', color: 'var(--text-primary)', position: 'relative' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            'name': `${issue.title} — UPSCGPT Intelligence Hub`,
            'description': stripHtml(issue.cumulativeSummary).substring(0, 160) || `Strategic analysis of ${issue.title}.`,
            'url': `https://www.upscgpt.in/issues/${issue.slug}`,
            'about': {
              '@type': 'Thing',
              'name': issue.topic,
              'description': issue.domain
            }
          })
        }}
      />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.03), transparent), radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.03), transparent)' }} />

      <div className="issue-study-layout with-assistant" style={{ maxWidth: '1440px', margin: '0 auto', display: 'grid', gap: '32px' }}>
        <main className="issue-study-main">
          <IssueDetailClient 
            issue={issueData} 
            initialFlow={activeFlow} 
            initialBookmarked={isBookmarked}
            initialStatus={progressStatus}
          />
        </main>

        {!session ? (
          <aside className="issue-study-assistant-locked" style={{ position: 'sticky', top: '100px', height: 'calc(100vh - 140px)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center', backdropFilter: 'blur(12px)' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.05)', color: '#3b82f6', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
              <Lock size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>AI Neural Assistant</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
              Unlock the interactive AI tutor to ask questions on this syllabus node, request model answers, and draft comparative notes in real-time.
            </p>
            <Link 
              href={`/login?callbackUrl=/issues/${issue.slug}`}
              style={{ width: '100%', textDecoration: 'none', padding: '12px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: 'white', borderRadius: '14px', fontSize: '0.85rem', fontWeight: 800, boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)', display: 'block' }}
            >
              Sign In to Unlock
            </Link>
          </aside>
        ) : (
          <aside className="issue-study-assistant" style={{ position: 'sticky', top: '100px', height: 'calc(100vh - 140px)' }}>
            <FloatingChatWrapper
              subjectId={issue.id}
              displayName={issue.title}
              examType={activeFlow === 'prelims' ? 'PRELIMS' : 'MAINS'}
              variant="inline"
            />
          </aside>
        )}
      </div>
    </div>
  )
}

import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Sparkles, Calendar, BookOpen } from 'lucide-react'

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const issue = await prisma.issue.findUnique({
    where: { slug },
    select: { title: true, domain: true, topic: true, cumulativeSummary: true }
  })

  if (!issue) return { title: 'Issue Not Found' }

  return {
    title: issue.title,
    description: issue.cumulativeSummary?.slice(0, 160) || `Comprehensive UPSC analysis of ${issue.title} in ${issue.domain}.`,
    openGraph: {
      title: issue.title,
      description: issue.cumulativeSummary?.slice(0, 160),
      type: 'article',
    }
  }
}

export default async function IssuePublicPage({ params }) {
  const { slug } = await params;
  const issue = await prisma.issue.findUnique({
    where: { slug },
    include: {
      articles: { orderBy: { publishedAt: 'desc' }, take: 10 },
      editorials: { orderBy: { publishedAt: 'desc' }, take: 5 },
      pyqLinks: true,
    }
  })

  if (!issue) notFound()

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: issue.title,
    description: issue.cumulativeSummary?.slice(0, 200),
    author: {
      '@type': 'Organization',
      name: 'UPSC Atlas Portal',
    },
    datePublished: issue.createdAt,
    dateModified: issue.lastUpdatedAt,
  }

  return (
    <div style={{ background: '#020617', minHeight: '100vh', color: 'white', padding: '40px 20px', fontFamily: 'Outfit, sans-serif' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <article style={{ maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', padding: '4px 12px', borderRadius: '6px' }}>{issue.domain}</span>
            {issue.gsPapers.map(gs => (
              <span key={gs} style={{ fontSize: '0.75rem', fontWeight: 800, background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '4px 12px', borderRadius: '6px' }}>{gs}</span>
            ))}
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '12px', lineHeight: 1.2 }}>{issue.title}</h1>
          <p style={{ fontSize: '1.1rem', color: '#94a3b8' }}>{issue.topic}</p>
        </header>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Sparkles size={24} /> Strategic Summary
          </h2>
          <div style={{ background: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.1)', borderRadius: '24px', padding: '32px', lineHeight: 1.8, fontSize: '1.05rem', color: '#cbd5e1' }}>
            {issue.cumulativeSummary ? (
               <div dangerouslySetInnerHTML={{ __html: issue.cumulativeSummary.replace(/\n/g, '<br />') }} />
            ) : (
              <p>Synthesis in progress...</p>
            )}
          </div>
        </section>

        {issue.pyqLinks.length > 0 && (
          <section style={{ marginBottom: '60px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <BookOpen size={24} /> Previous Year Questions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {issue.pyqLinks.map(pyq => (
                <div key={pyq.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                   <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#64748b', marginBottom: '8px' }}>{pyq.paperType} · {pyq.year}</div>
                   <div style={{ fontWeight: 700, lineHeight: 1.5 }}>{pyq.questionText}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Calendar size={24} /> Related Intel & Developments
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[...issue.articles, ...issue.editorials].map(item => (
              <div key={item.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#3b82f6', textTransform: 'uppercase' }}>{item.source}</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(item.publishedAt).toLocaleDateString()}</span>
                </div>
                <h4 style={{ fontWeight: 800, fontSize: '1.1rem' }}>{item.title}</h4>
              </div>
            ))}
          </div>
        </section>
      </article>
    </div>
  )
}

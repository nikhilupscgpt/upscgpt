import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export async function generateMetadata({ params }) {
  const { id } = params;
  const streak = await prisma.newsStreak.findUnique({
    where: { id },
  });

  if (!streak) {
    return { title: 'News Streak Not Found | UPSCGPT' };
  }

  const title = `Live Updates: ${streak.title} | UPSCGPT News Streak`;
  const desc = streak.livingSummary 
    ? streak.livingSummary.substring(0, 160) + '...'
    : `Follow continuous live updates on ${streak.title} for UPSC preparation.`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      type: 'article',
      publishedTime: streak.updatedAt?.toISOString(),
    },
  };
}

export default async function NewsStreakPage({ params }) {
  const { id } = params;
  const streak = await prisma.newsStreak.findUnique({
    where: { id },
    include: { articles: { orderBy: { publishedAt: 'desc' } } }
  });

  if (!streak) {
    notFound();
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--hero-bg-gradient)', color: 'white', padding: '120px 20px 40px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '24px' }}>
          <Link href="/news" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
            ← Back to News Hub
          </Link>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '24px', padding: '40px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80', animation: 'pulse 2s infinite' }} />
              LIVE SYNTHESIS
            </span>
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '24px', lineHeight: 1.2 }}>
            {streak.title}
          </h1>

          {streak.livingSummary && (
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '24px', borderRadius: '16px' }}>
              <h5 style={{ color: '#fbbf24', fontSize: '0.85rem', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Living Summary
              </h5>
              <div style={{ fontSize: '1.15rem', color: '#e2e8f0', lineHeight: 1.8 }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {streak.livingSummary}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '24px', color: '#cbd5e1' }}>Timeline of Updates</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {streak.articles.map(article => (
            <Link key={article.id} href={`/news/article/${article.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.5)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s' }} className="hover-glow-card">
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                  {new Date(article.publishedAt || article.createdAt).toLocaleDateString()}
                </span>
                <h4 style={{ fontSize: '1.2rem', color: 'white', fontWeight: 700, margin: '0 0 12px' }}>
                  {article.title}
                </h4>
                {article.structuredData?.crux && (
                  <p style={{ margin: 0, fontSize: '0.95rem', color: '#cbd5e1', fontStyle: 'italic' }}>
                    {article.structuredData.crux}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

      </div>

      <style jsx global>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
        .hover-glow-card:hover {
          background: rgba(15, 23, 42, 0.8) !important;
          border-color: rgba(56, 189, 248, 0.3) !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  );
}

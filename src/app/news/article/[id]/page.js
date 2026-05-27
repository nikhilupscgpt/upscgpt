import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';

export async function generateMetadata({ params }) {
  const { id } = params;
  const article = await prisma.article.findUnique({
    where: { id },
  });

  if (!article) {
    return { title: 'Article Not Found | UPSCGPT' };
  }

  const crux = article.structuredData?.crux || 'Daily UPSC Current Affairs and Analysis.';
  const title = `${article.title} | UPSCGPT News`;

  return {
    title,
    description: crux,
    openGraph: {
      title,
      description: crux,
      type: 'article',
      publishedTime: article.publishedAt?.toISOString(),
    },
  };
}

export default async function ArticlePage({ params }) {
  const { id } = params;
  const article = await prisma.article.findUnique({
    where: { id },
    include: { issue: true }
  });

  if (!article) {
    notFound();
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--hero-bg-gradient)', color: 'white', padding: '120px 20px 40px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', background: 'rgba(15, 23, 42, 0.7)', borderRadius: '24px', padding: '40px', border: '1px solid rgba(255,255,255,0.1)' }}>
        
        <div style={{ marginBottom: '24px' }}>
          <Link href="/news" style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
            ← Back to News Hub
          </Link>
        </div>

        <span style={{ fontSize: '0.85rem', color: '#06b6d4', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '12px' }}>
          {new Date(article.publishedAt || article.createdAt).toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })} • {article.source || 'News'}
        </span>

        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '24px', lineHeight: 1.2 }}>
          {article.title}
        </h1>

        {article.structuredData?.crux && (
          <div style={{ background: 'rgba(192, 132, 252, 0.05)', border: '1px solid rgba(192, 132, 252, 0.2)', padding: '24px', borderRadius: '16px', marginBottom: '32px' }}>
            <h5 style={{ color: '#c084fc', fontSize: '0.85rem', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Editorial Lens
            </h5>
            <p style={{ margin: 0, fontSize: '1.15rem', color: '#e2e8f0', fontStyle: 'italic', lineHeight: 1.6 }}>
              "{article.structuredData.crux}"
            </p>
          </div>
        )}

        <div style={{ fontSize: '1.15rem', color: '#cbd5e1', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {article.rawContent || 'No complete text available.'}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

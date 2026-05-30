import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
  });

  if (!article) {
    return { title: 'Article Not Found | UPSCGPT' };
  }

  const structured = article.structuredData || {};
  const crux = structured.seoDescription || structured.crux || 'Daily UPSC Current Affairs and Analysis.';
  const title = structured.seoTitle || `${article.title} | UPSCGPT News`;
  const keywords = Array.isArray(structured.seoKeywords) ? structured.seoKeywords.join(', ') : (structured.seoKeywords || '');

  return {
    title,
    description: crux,
    keywords,
    alternates: {
      canonical: `/news/article/${id}`,
    },
    openGraph: {
      title,
      description: crux,
      type: 'article',
      publishedTime: article.publishedAt?.toISOString(),
    },
  };
}

export default async function ArticlePage({ params }) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    include: { issue: true }
  });

  if (!article) {
    notFound();
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--hero-bg-gradient)', color: 'var(--text-primary)', padding: '120px 20px 40px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            'headline': article.title,
            'description': article.structuredData?.crux || 'Daily UPSC Current Affairs and Analysis.',
            'datePublished': article.publishedAt?.toISOString() || article.createdAt.toISOString(),
            'dateModified': article.createdAt.toISOString(),
            'author': {
              '@type': 'Organization',
              'name': 'UPSCGPT',
              'url': 'https://upscatlas.com'
            },
            'publisher': {
              '@type': 'Organization',
              'name': 'UPSCGPT',
              'logo': {
                '@type': 'ImageObject',
                'url': 'https://upscatlas.com/logo.png'
              }
            }
          })
        }}
      />
      <div style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--bg-card)', borderRadius: '24px', padding: '40px', border: '1px solid var(--border-color)' }}>
        
        <div style={{ marginBottom: '24px' }}>
          <Link href="/news" style={{ color: 'var(--color-blue)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
            ← Back to News Hub
          </Link>
        </div>

        <span style={{ fontSize: '0.85rem', color: 'var(--color-blue)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '12px' }}>
          {new Date(article.publishedAt || article.createdAt).toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })} • {article.source || 'News'}
        </span>

        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '24px', lineHeight: 1.2 }}>
          {article.title}
        </h1>

        {article.structuredData?.crux && (
          <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '24px', borderRadius: '16px', marginBottom: '32px' }}>
            <h5 style={{ color: 'var(--color-purple)', fontSize: '0.85rem', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Editorial Lens
            </h5>
            <p style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.6 }}>
              "{article.structuredData.crux}"
            </p>
          </div>
        )}

        <div style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {article.rawContent || 'No complete text available.'}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { parseLivingSummary, stripMarkdown } from '@/lib/seo';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import NotesTrigger from '@/components/NotesTrigger';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const streak = await prisma.newsStreak.findFirst({
    where: {
      OR: [
        { id },
        { slug: id }
      ]
    },
  });

  if (!streak) {
    return { title: 'News Streak Not Found | UPSCGPT' };
  }

  let parsedJson = {};
  if (streak.livingSummary) {
    try {
      parsedJson = JSON.parse(streak.livingSummary);
    } catch (e) {}
  }

  const parsed = parseLivingSummary(streak.livingSummary, streak.title);
  const cleanCauses = stripMarkdown(parsed.causes);
  const title = parsedJson.seoTitle || `Live Updates: ${streak.title} | UPSCGPT News Streak`;
  const desc = parsedJson.seoDescription || (cleanCauses 
    ? cleanCauses.substring(0, 160) + '...'
    : `Follow continuous live updates on ${streak.title} for UPSC preparation.`);
  const keywords = Array.isArray(parsedJson.seoKeywords) ? parsedJson.seoKeywords.join(', ') : (parsedJson.seoKeywords || '');

  return {
    title,
    description: desc,
    keywords,
    alternates: {
      canonical: `/news/streak/${streak.slug || id}`,
    },
    openGraph: {
      title,
      description: desc,
      type: 'article',
      publishedTime: streak.updatedAt?.toISOString(),
    },
  };
}

export default async function NewsStreakPage({ params }) {
  const { id } = await params;
  const streak = await prisma.newsStreak.findFirst({
    where: {
      OR: [
        { id },
        { slug: id }
      ]
    },
    include: {
      articles: { orderBy: { publishedAt: 'desc' } },
      issues: { select: { domain: true, topic: true }, take: 1 }
    }
  });

  if (!streak) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  let isBookmarked = false;
  if (session?.user?.id) {
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_itemType_itemId: {
          userId: session.user.id,
          itemType: 'Streak',
          itemId: streak.id,
        },
      },
    });
    isBookmarked = !!bookmark;
  }

  const cookieStore = await cookies();
  const lang = cookieStore.get('language')?.value || 'en';

  const title = lang === 'hi' ? (streak.title_hi || streak.title) : lang === 'mr' ? (streak.title_mr || streak.title) : streak.title;
  const summaryStr = lang === 'hi' ? (streak.livingSummary_hi || streak.livingSummary) : lang === 'mr' ? (streak.livingSummary_mr || streak.livingSummary) : streak.livingSummary;

  const parsed = parseLivingSummary(summaryStr, title);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--hero-bg-gradient)', color: 'var(--text-primary)', padding: '120px 20px 40px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LiveBlogPosting',
            'headline': title,
            'description': stripMarkdown(parsed.causes).substring(0, 160) || `Live tracking of ${title}.`,
            'datePublished': streak.createdAt.toISOString(),
            'dateModified': streak.updatedAt.toISOString(),
            'coverageStartTime': streak.createdAt.toISOString(),
            'coverageEndTime': streak.updatedAt.toISOString(),
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
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '24px' }}>
          <Link href="/news" style={{ color: 'var(--color-blue)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
            {lang === 'hi' ? '← समाचार हब पर वापस जाएं' : lang === 'mr' ? '← बातम्या हबवर परत जा' : '← Back to News Hub'}
          </Link>
        </div>

        <div style={{ background: 'var(--bg-card)', borderRadius: '24px', padding: '40px', border: '1px solid var(--border-color)', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-emerald)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-emerald)', boxShadow: '0 0 8px var(--color-emerald)', animation: 'pulse 2s infinite' }} />
              {lang === 'hi' ? 'लाइव संश्लेषण' : lang === 'mr' ? 'लाइव्ह संश्लेषण' : 'LIVE SYNTHESIS'}
            </span>
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 900, marginBottom: '24px', lineHeight: 1.2 }}>
            {title}
          </h1>

          {summaryStr && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
              {parsed.causes && (
                <div style={{ background: 'var(--bg-input)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                  <h5 style={{ color: 'var(--color-amber)', fontSize: '0.85rem', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {lang === 'hi' ? 'संदर्भ और मूल कारण' : lang === 'mr' ? 'संदर्भ आणि मूळ कारणे' : 'Context & Root Causes'}
                  </h5>
                  <div style={{ fontSize: '1.1rem', color: 'var(--text-primary)', lineHeight: 1.8 }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {parsed.causes}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
              {parsed.impact && (
                <div style={{ background: 'var(--bg-input)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                  <h5 style={{ color: 'var(--color-purple)', fontSize: '0.85rem', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {lang === 'hi' ? 'आर्थिक और नीति प्रभाव' : lang === 'mr' ? 'आर्थिक आणि धोरण प्रभाव' : 'Economic & Policy Impact'}
                  </h5>
                  <div style={{ fontSize: '1.1rem', color: 'var(--text-primary)', lineHeight: 1.8 }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {parsed.impact}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
              {parsed.tracker && (
                <div style={{ background: 'var(--bg-input)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                  <h5 style={{ color: 'var(--color-blue)', fontSize: '0.85rem', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {lang === 'hi' ? 'रणनीतिक डेटा ट्रैकर' : lang === 'mr' ? 'स्ट्रॅटेजिक डेटा ट्रॅकर' : 'Strategic Data Tracker'}
                  </h5>
                  <div style={{ fontSize: '1.1rem', color: 'var(--text-primary)', lineHeight: 1.8 }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {parsed.tracker}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '24px', color: 'var(--text-secondary)' }}>
          {lang === 'hi' ? 'अपडेट्स की समयरेखा' : lang === 'mr' ? 'अपडेट्सची टाइमलाइन' : 'Timeline of Updates'}
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {streak.articles.map(article => {
            const artTitle = lang === 'hi' ? (article.title_hi || article.title) : lang === 'mr' ? (article.title_mr || article.title) : article.title;
            return (
              <Link key={article.id} href={`/news/article/${article.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-color)', transition: 'all 0.2s' }} className="hover-glow-card">
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                    {new Date(article.publishedAt || article.createdAt).toLocaleDateString()}
                  </span>
                  <h4 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 700, margin: '0 0 12px' }}>
                    {artTitle}
                  </h4>
                  {article.structuredData?.crux && (
                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      {article.structuredData.crux}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

      </div>
      <NotesTrigger
        entityType="streak"
        entityId={streak.id}
        entityTitle={streak.title}
        entitySubject={streak.issues[0]?.domain || 'General Studies'}
        entityTopic={streak.issues[0]?.topic || 'Current Affairs'}
        initialBookmarked={isBookmarked}
      />
    </div>
  );
}

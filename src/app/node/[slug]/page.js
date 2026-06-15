import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import './node-detail.css';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const issue = await prisma.issue.findUnique({
    where: { slug },
    select: { title: true, domain: true, topic: true }
  });
  if (!issue) return { title: 'Node Not Found' };
  return { 
    title: `${issue.title} | UPSC Atlas Intelligence`,
    description: `Strategic study guide, key themes, subtopics, and previous year questions (PYQs) for UPSC syllabus node: ${issue.title} (${issue.domain} - ${issue.topic}).`,
    alternates: {
      canonical: `/node/${slug}`,
    }
  };
}

export default async function NodeDetailPage({ params }) {
  const { slug } = await params;
  
  const node = await prisma.issue.findUnique({
    where: { slug },
    include: {
      pyqLinks: true,
      nodeContent: true,
    }
  });

  if (!node) notFound();

  const metadata = node.metadata || {};
  const themes = metadata.keyThemes || [];
  const subtopics = metadata.subtopics || [];
  const gsPapers = node.gsPapers || [];

  return (
    <div className="node-detail-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Course',
            'name': `${node.title} — UPSC Atlas Intelligence`,
            'description': `Strategic study guide, key themes, and subtopics for UPSC syllabus node: ${node.title}.`,
            'provider': {
              '@type': 'Organization',
              'name': 'UPSCGPT',
              'url': 'https://www.upscgpt.in'
            },
            'about': {
              '@type': 'Thing',
              'name': node.topic,
              'description': node.domain
            },
            'educationalLevel': 'UPSC Civil Services Examination (CSE)'
          })
        }}
      />
      <div className="node-detail-container">
        {/* Breadcrumbs */}
        <nav className="breadcrumb">
          <Link href="/search">Search</Link>
          <span className="separator">/</span>
          <span className="current">{node.domain}</span>
        </nav>

        <header className="node-header">
          <div className="node-meta-top">
            <span className="node-gs-badge">{gsPapers.join(', ') || 'GS General'}</span>
            <span className="node-type-label">{node.nodeType}</span>
          </div>
          <h1 className="node-title">{node.title}</h1>
          <p className="node-domain-subtitle">{node.domain} • {node.topic}</p>
        </header>

        <div className="node-content-grid">
          <div className="node-main-column">
            <section className="node-section">
              <h2 className="section-title">Knowledge Themes</h2>
              <div className="theme-grid">
                {themes.map((theme, i) => (
                  <div key={i} className="theme-card">
                    <span className="theme-dot"></span>
                    {theme}
                  </div>
                ))}
              </div>
            </section>

            <section className="node-section">
              <h2 className="section-title">Structural Subtopics</h2>
              <ul className="subtopics-list">
                {subtopics.map((topic, i) => (
                  <li key={i}>{topic}</li>
                ))}
              </ul>
            </section>

            <section className="node-section content-status">
              <h2 className="section-title">Study Material</h2>
              <div className="coming-soon-box">
                <p>Full AI-synthesized study material for <strong>{node.title}</strong> is being calibrated.</p>
                <Link href={`/issues/${node.slug}`} className="legacy-link">View Legacy Notes →</Link>
              </div>
            </section>
          </div>

          <aside className="node-sidebar">
            <div className="sidebar-card">
              <h3>Intelligence Actions</h3>
              <div className="action-btns">
                <Link href={`/atlas?node=${node.slug}`} className="action-btn atlas">Open on Strategic Map</Link>
                <button className="action-btn bookmark">Bookmark for Revision</button>
              </div>
            </div>

            <div className="sidebar-card">
              <h3>Exam Metadata</h3>
              <div className="meta-stats">
                <div className="meta-stat">
                  <span className="label">Relevance</span>
                  <span className="value">{(metadata.examRelevance || 'High').replace(/=GEMINI\(.*\)/, 'High')}</span>
                </div>
                <div className="meta-stat">
                  <span className="label">PYQs</span>
                  <span className="value">{node.pyqLinks?.length || 0}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

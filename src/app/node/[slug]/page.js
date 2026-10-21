import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CURATED_MAPPING_NODES } from '@/lib/static-mapping-data';
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
      
      nodeContent: true,
    }
  });

  if (!node) notFound();

  const metadata = node.metadata || {};
  const themes = metadata.keyThemes || [];
  const subtopics = metadata.subtopics || [];
  const gsPapers = node.gsPapers || [];

  const mappedPlaces = CURATED_MAPPING_NODES.filter(
    (m) => m.linkedIssueSlug === slug || m.linkedIssueSlug === node.slug
  );

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

            {node.prelimsNote ? (
              <section className="node-section" style={{ background: '#f8fafc', borderRadius: 12, padding: 22, border: '1px solid #e2e8f0' }}>
                <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0f172a', marginBottom: 16 }}>
                  <span>🎯</span> High-Yield Prelims Focus Points
                </h2>
                <div style={{ whiteSpace: 'pre-line', fontSize: 14.5, lineHeight: 1.7, color: '#334155' }}>
                  {node.prelimsNote}
                </div>
              </section>
            ) : (
              <section className="node-section content-status">
                <h2 className="section-title">Study Material</h2>
                <div className="coming-soon-box">
                  <p>Full AI-synthesized study material for <strong>{node.title}</strong> is being calibrated.</p>
                  <Link href={`/issues/${node.slug}`} className="legacy-link">View Legacy Notes →</Link>
                </div>
              </section>
            )}
          </div>

          <aside className="node-sidebar">
            <div className="sidebar-card">
              <h3>Intelligence Actions</h3>
              <div className="action-btns">
                <Link href={`/atlas?node=${node.slug}`} className="action-btn atlas">Open on Strategic Map</Link>
                <button className="action-btn bookmark">Bookmark for Revision</button>
              </div>
            </div>

            {mappedPlaces.length > 0 && (
              <div className="sidebar-card">
                <h3>📍 Mapped GIS Places ({mappedPlaces.length})</h3>
                <p style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
                  Directly linked spatial features with coordinates and PYQ evidence.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {mappedPlaces.map((p) => (
                    <Link
                      key={p.id}
                      href={`/atlas?node=${p.slug}`}
                      style={{
                        display: 'block',
                        padding: '10px 12px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        fontSize: 12.5,
                        textDecoration: 'none',
                        color: '#1e293b',
                        transition: 'border-color 0.15s ease',
                      }}
                    >
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.place}</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                        {p.placeType} · {p.similarPYQ?.length || 0} PYQs
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

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

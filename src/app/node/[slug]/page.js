import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CURATED_MAPPING_NODES } from '@/lib/static-mapping-data';
import { getNodeBridgeContextBySlug } from '@/lib/nodeBridge';
import './node-detail.css';
import { safeJsonLd } from '@/lib/jsonLd';
import { isIssueJsonPopulated, isJsonPopulated, stripHtml } from '@/lib/seo';

// 24-hour ISR Cache: Ensures search crawlers consume 0 DB/server compute after initial cache
export const revalidate = 86400;

function renderStructuredNoteBlocks(noteData) {
  if (!isJsonPopulated(noteData)) return null;

  if (typeof noteData === 'string') {
    const trimmed = noteData.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        return renderStructuredNoteBlocks(JSON.parse(trimmed));
      } catch {
        // treat as plain string
      }
    }
    return (
      <div style={{ whiteSpace: 'pre-line', fontSize: 14.5, lineHeight: 1.7, color: '#334155' }}>
        {trimmed}
      </div>
    );
  }

  if (Array.isArray(noteData)) {
    return (
      <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14.5, lineHeight: 1.7, color: '#334155' }}>
        {noteData.map((item, idx) => (
          <li key={idx} style={{ marginBottom: 6 }}>
            {typeof item === 'string' ? item : JSON.stringify(item)}
          </li>
        ))}
      </ul>
    );
  }

  if (typeof noteData === 'object') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {Object.entries(noteData).map(([rawKey, val]) => {
          if (!isJsonPopulated(val)) return null;
          const label = rawKey
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());

          return (
            <div
              key={rawKey}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: '14px 16px',
              }}
            >
              <h3 style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                {label}
              </h3>
              {typeof val === 'string' ? (
                <div style={{ whiteSpace: 'pre-line', fontSize: 14, lineHeight: 1.65, color: '#334155' }}>
                  {val}
                </div>
              ) : Array.isArray(val) ? (
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.65, color: '#334155' }}>
                  {val.map((item, i) => (
                    <li key={i} style={{ marginBottom: 4 }}>
                      {typeof item === 'string' ? item : JSON.stringify(item)}
                    </li>
                  ))}
                </ul>
              ) : typeof val === 'object' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {Object.entries(val).map(([subKey, subVal]) => {
                    if (!isJsonPopulated(subVal)) return null;
                    const subLabel = subKey
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (c) => c.toUpperCase());
                    return (
                      <div key={subKey} style={{ fontSize: 13.5, lineHeight: 1.6, color: '#334155' }}>
                        <strong style={{ color: '#0f172a' }}>{subLabel}:</strong>{' '}
                        {typeof subVal === 'string' ? subVal : JSON.stringify(subVal)}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    );
  }

  return null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const issue = await prisma.issue.findUnique({
    where: { slug },
    select: {
      title: true,
      domain: true,
      topic: true,
      cumulativeSummary: true,
      metadata: true,
      prelimsNote: true,
      mainsNote: true,
    }
  });
  if (!issue) {
    return {
      title: 'Node Not Found',
      robots: { index: false, follow: true },
    };
  }
  const hasJsonContent = isIssueJsonPopulated(issue);
  const canonicalUrl = `https://www.upscgpt.in/node/${slug}`;
  const cleanSummary = stripHtml(issue.cumulativeSummary || '').slice(0, 155);
  const description = cleanSummary
    ? `${cleanSummary} (${issue.domain} – ${issue.topic})`
    : `Strategic study guide, key themes, subtopics, and previous year questions (PYQs) for UPSC syllabus node: ${issue.title} (${issue.domain} - ${issue.topic}).`;
  return { 
    title: `${issue.title} | UPSC Atlas Intelligence`,
    description,
    robots: {
      index: hasJsonContent,
      follow: true,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${issue.title} | UPSC Atlas Intelligence`,
      description,
      url: canonicalUrl,
      siteName: 'UPSCGPT',
      type: 'article',
    },
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
  const themes = Array.isArray(metadata.keyThemes) ? metadata.keyThemes : [];
  const subtopics = Array.isArray(metadata.subtopics) ? metadata.subtopics : [];
  const examAngles = Array.isArray(metadata.examAngles) && metadata.examAngles.length > 0
    ? metadata.examAngles
    : (Array.isArray(metadata.pyqAngles) ? metadata.pyqAngles : []);
  const gsPapers = node.gsPapers || metadata.gsPaper || [];
  const prelimsPayload = isJsonPopulated(node.prelimsNote)
    ? node.prelimsNote
    : (isJsonPopulated(node.nodeContent?.prelimsNote) ? node.nodeContent.prelimsNote : null);
  const mainsPayload = isJsonPopulated(node.mainsNote)
    ? node.mainsNote
    : (isJsonPopulated(node.nodeContent?.mainsNote) ? node.nodeContent.mainsNote : null);
  const cleanSummary = stripHtml(node.cumulativeSummary || '');
  const { catalogNode, relatedNodes, mappedTopics } = getNodeBridgeContextBySlug(slug);

  const mappedPlaces = CURATED_MAPPING_NODES.filter(
    (m) => m.linkedIssueSlug === slug || m.linkedIssueSlug === node.slug
  );

  return (
    <div className="node-detail-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd({
            '@context': 'https://schema.org',
            '@type': 'Course',
            'name': `${node.title} — UPSC Atlas Intelligence`,
            'description': `Strategic study guide, key themes, and subtopics for UPSC syllabus node: ${node.title}.`,
            'url': `https://www.upscgpt.in/node/${node.slug}`,
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
            {cleanSummary && (
              <section className="node-section" style={{ background: '#f8fafc', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
                <h2 className="section-title" style={{ marginBottom: 10 }}>Executive Syllabus Overview</h2>
                <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7, color: '#334155' }}>
                  {cleanSummary}
                </p>
                {metadata.importanceNote && (
                  <p style={{ margin: '10px 0 0 0', fontSize: 13.5, lineHeight: 1.6, color: '#475569', fontStyle: 'italic' }}>
                    <strong>UPSC Exam Lens:</strong> {metadata.importanceNote}
                  </p>
                )}
              </section>
            )}

            {themes.length > 0 && (
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
            )}

            {subtopics.length > 0 && (
              <section className="node-section">
                <h2 className="section-title">Structural Subtopics</h2>
                <ul className="subtopics-list">
                  {subtopics.map((topic, i) => (
                    <li key={i}>{topic}</li>
                  ))}
                </ul>
              </section>
            )}

            {prelimsPayload ? (
              <section className="node-section" style={{ background: '#f8fafc', borderRadius: 12, padding: 22, border: '1px solid #e2e8f0' }}>
                <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0f172a', marginBottom: 16 }}>
                  <span>🎯</span> High-Yield Prelims Focus Points
                </h2>
                {renderStructuredNoteBlocks(prelimsPayload)}
              </section>
            ) : null}

            {mainsPayload ? (
              <section className="node-section" style={{ background: '#f8fafc', borderRadius: 12, padding: 22, border: '1px solid #e2e8f0', marginTop: 20 }}>
                <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0f172a', marginBottom: 16 }}>
                  <span>📘</span> Mains Structural Analysis &amp; Dimensions
                </h2>
                {renderStructuredNoteBlocks(mainsPayload)}
              </section>
            ) : null}

            {!prelimsPayload && !mainsPayload && (
              <section className="node-section content-status">
                <h2 className="section-title">Study Material</h2>
                <div className="coming-soon-box">
                  <p>Detailed faculty-curated notes for <strong>{node.title}</strong> are being updated.</p>
                  <Link href={`/prelims/pyq?subject=${encodeURIComponent(catalogNode?.subject || 'ALL')}`} className="legacy-link">Practice Prelims PYQs →</Link>
                </div>
              </section>
            )}

            {examAngles.length > 0 && (
              <section className="node-section" style={{ marginTop: 20 }}>
                <h2 className="section-title">UPSC Mains &amp; Analytical Framings</h2>
                <ul className="subtopics-list">
                  {examAngles.map((angle, i) => (
                    <li key={i}>{angle}</li>
                  ))}
                </ul>
              </section>
            )}

            {mappedTopics.length > 0 && (
              <section className="node-section" style={{ marginTop: 24 }}>
                <h2 className="section-title">Practice Linked UPSC Prelims PYQs</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {mappedTopics.map((t) => (
                    <Link
                      key={t}
                      href={`/prelims/pyq?subject=${encodeURIComponent(catalogNode?.subject || 'ALL')}&topic=${encodeURIComponent(t)}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 14px',
                        borderRadius: 8,
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        color: '#1d4ed8',
                        fontSize: 13,
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      <span>Solved PYQs: {t} →</span>
                    </Link>
                  ))}
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

            {relatedNodes.length > 0 && (
              <div className="sidebar-card">
                <h3>🔗 Related Syllabus Nodes</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {relatedNodes.map((rn) => (
                    <Link
                      key={rn.slug}
                      href={rn.url}
                      style={{
                        display: 'block',
                        padding: '10px 12px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        fontSize: 12.5,
                        textDecoration: 'none',
                        color: '#1e293b',
                      }}
                    >
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{rn.title}</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                        {rn.subject} · {rn.module}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

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

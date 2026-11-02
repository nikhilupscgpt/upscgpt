import React from 'react';
import Link from 'next/link';
import { BookOpen, ArrowRight, Layers } from 'lucide-react';

/**
 * High-Impact Internal Linking Component (PYQ -> Static /node/[slug] Syllabus Graph)
 * Cross-links high-ranking Prelims PYQ pages (median position ~7.7) directly to their
 * corresponding static /node/[slug] syllabus pages to pass PageRank & topical authority.
 */
export default function SyllabusNodeBridge({ nodes = [], subject, topic, variant = 'section' }) {
  if (!Array.isArray(nodes) || nodes.length === 0) return null;

  if (variant === 'pill') {
    const primary = nodes[0];
    return (
      <Link
        href={primary.url || `/node/${primary.slug}`}
        title={`Study static UPSC syllabus node: ${primary.title}`}
        style={{
          background: 'rgba(139, 92, 246, 0.12)',
          color: '#a78bfa',
          border: '1px solid rgba(139, 92, 246, 0.32)',
          padding: '4px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: '700',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <BookOpen size={13} />
        <span>Syllabus Node: {primary.title.split(/[—–]/)[0].trim()}</span>
      </Link>
    );
  }

  return (
    <section
      aria-label={`Corresponding UPSC Static Syllabus Nodes for ${topic || subject || 'this question'}`}
      className="pyq-card"
      style={{
        borderRadius: '18px',
        padding: '26px 30px',
        marginBottom: '24px',
        border: '1px solid rgba(56, 189, 248, 0.25)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              background: 'rgba(56, 189, 248, 0.14)',
              color: '#38bdf8',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Layers size={16} />
          </span>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
              Master Static Syllabus Nodes ({topic || subject || 'GS'})
            </h2>
            <p
              className="pyq-text-muted"
              style={{ margin: '2px 0 0 0', fontSize: '12.5px' }}
            >
              Deep-dive into the core UPSC knowledge-graph notes &amp; revision pointers tested in this PYQ
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {nodes.map((node) => (
          <Link
            key={node.slug}
            href={node.url || `/node/${node.slug}`}
            className="pyq-inset"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '16px',
              padding: '14px 18px',
              borderRadius: '12px',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'border-color 0.15s ease, transform 0.15s ease',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                  marginBottom: '6px',
                }}
              >
                <span
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    padding: '2px 8px',
                    borderRadius: '5px',
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.03em',
                  }}
                >
                  {node.gsPapers || 'GS'} • {node.subject}
                </span>
                {node.module && (
                  <span
                    className="pyq-text-muted"
                    style={{ fontSize: '11.5px', fontWeight: 600 }}
                  >
                    {node.module}
                  </span>
                )}
              </div>

              <div
                style={{
                  fontSize: '14.5px',
                  fontWeight: 800,
                  lineHeight: 1.4,
                  marginBottom: node.prelimsNotePreview ? '5px' : 0,
                  color: '#38bdf8',
                }}
              >
                {node.title}
              </div>

              {node.prelimsNotePreview && (
                <p
                  className="pyq-text-muted"
                  style={{
                    margin: 0,
                    fontSize: '12.5px',
                    lineHeight: 1.5,
                  }}
                >
                  {node.prelimsNotePreview}
                  {node.prelimsNotePreview.length >= 150 ? '…' : ''}
                </p>
              )}
            </div>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#38bdf8',
                whiteSpace: 'nowrap',
                alignSelf: 'center',
                flexShrink: 0,
              }}
            >
              <span>Study Node</span>
              <ArrowRight size={14} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

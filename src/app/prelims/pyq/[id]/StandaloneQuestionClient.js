'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Copy, 
  Bookmark, 
  Check, 
  ArrowLeft,
  Compass,
  ArrowRight
} from 'lucide-react';
import StemView from '../StemView';
import PyqDeepDive from '../PyqDeepDive';
import PyqPrecisionView from '../PyqPrecisionView';
import { getStructuredExplanation } from '@/lib/pyqExplanationHelper';
import '../pyq-ui.css';

export default function StandaloneQuestionClient({ question: q }) {
  const { explanationText, analysis } = getStructuredExplanation(q);

  if (analysis && analysis.whyCorrect) {
    return <PyqPrecisionView question={{ ...q, analysis }} />;
  }

  const [userChoice, setUserChoice] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const correctLabelUpper = (q.correctLabel || 'A').toUpperCase();
  const correctOpt = (q.options || []).find(
    o => (o.label || '').toLowerCase() === (q.correctLabel || '').toLowerCase()
  );

  const handleCopy = () => {
    const slug = q.canonicalSlug || encodeURIComponent(q.dedupHash || q.id);
    const text = `Question (${q.examName} ${q.examYear} Q#${q.questionNo}):\n${q.stem}\n\nCorrect Answer: (${correctLabelUpper})\nhttps://www.upscgpt.in/prelims/pyq/${slug}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pq-root" style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px 80px 24px' }}>
      
      {/* Top Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Link 
            href={`/prelims/pyq?subject=${encodeURIComponent(q.srcSubject || 'ALL')}&topic=${encodeURIComponent(q.srcTopic || 'ALL')}`} 
            style={{ 
              color: 'var(--text-secondary, #94a3b8)', 
              textDecoration: 'none', 
              fontSize: '14px', 
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'var(--bg-card, #0f172a)',
              border: '1px solid var(--border-color, #1e293b)'
            }}
          >
            <ArrowLeft size={16} /> Back to {q.srcTopic || q.srcSubject || 'PYQ Explorer'}
          </Link>
        </div>

        <Link
          href="/prelims/pyq"
          style={{
            color: '#0284c7',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: '700',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Compass size={15} /> Browse All 2,528+ PYQs
        </Link>
      </nav>

      {/* Main Question Container Card */}
      <article className="pyq-card" style={{
        borderRadius: '20px',
        padding: '36px',
        boxShadow: '0 10px 35px rgba(0, 0, 0, 0.15)',
        marginBottom: '28px'
      }}>
        {/* Semantic H1 Context Header for Search & AI Engines */}
        <h1 style={{
          fontSize: '13px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '#38bdf8',
          margin: '0 0 12px 0'
        }}>
          {q.examName} {q.examYear} Solved Prelims PYQ · {q.srcSubject} ({q.srcTopic})
        </h1>

        {/* Badges Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{
              background: 'rgba(59, 130, 246, 0.12)',
              color: '#2563eb',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              padding: '4px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '800'
            }}>
              {q.examName} {q.examYear}
            </span>

            <span className="pyq-badge-dark" style={{
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700'
            }}>
              Question #{q.questionNo || '?'}
            </span>

            <Link
              href={`/prelims/pyq?subject=${encodeURIComponent(q.srcSubject || 'ALL')}&topic=${encodeURIComponent(q.srcTopic || 'ALL')}`}
              style={{
                background: 'rgba(20, 184, 166, 0.12)',
                color: '#0d9488',
                border: '1px solid rgba(20, 184, 166, 0.3)',
                padding: '4px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                textDecoration: 'none'
              }}
            >
              {q.srcTopic}
            </Link>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleCopy}
              className="pyq-inset"
              style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', color: 'inherit' }}
            >
              {copied ? <><Check size={14} color="#10b981" /> Copied</> : <><Copy size={14} /> Copy</>}
            </button>
            <button
              onClick={() => setBookmarked(!bookmarked)}
              className="pyq-inset"
              style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer', color: bookmarked ? '#f59e0b' : 'inherit' }}
            >
              <Bookmark size={15} fill={bookmarked ? '#f59e0b' : 'none'} />
            </button>
          </div>
        </div>

        {/* Question Stem */}
        <div style={{ marginBottom: '28px' }}>
          <StemView stem={q.stem} size="lg" />
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {(q.options || []).map((opt) => {
            const isSelected = userChoice === opt.label;
            const isCorrect = (q.correctLabel || '').toLowerCase() === (opt.label || '').toLowerCase();

            let optionClass = 'pyq-option-item';
            if (isRevealed) {
              if (isCorrect) optionClass = 'pyq-option-correct';
              else if (isSelected) optionClass = 'pyq-option-incorrect';
            } else if (isSelected) {
              optionClass = 'pyq-option-selected';
            }

            return (
              <div
                key={opt.label}
                className={optionClass}
                onClick={() => setUserChoice(opt.label)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 20px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  background: isSelected ? '#0284c7' : 'rgba(128, 128, 128, 0.2)',
                  color: isSelected ? '#ffffff' : 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: '800',
                  flexShrink: 0
                }}>
                  {opt.label.toUpperCase()}
                </span>
                <span style={{ fontSize: '15.5px', lineHeight: 1.5, flex: 1 }}>
                  {opt.text}
                </span>

                {isRevealed && isCorrect && (
                  <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#059669', padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '800' }}>
                    ✓ Correct Answer
                  </span>
                )}

                {isRevealed && isSelected && !isCorrect && (
                  <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#dc2626', padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '800' }}>
                    ✕ Your Choice
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Verification Action Bar */}
        {!isRevealed && (
          <div className="pyq-inset" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: '12px',
            padding: '14px 20px',
            marginBottom: '20px'
          }}>
            <span className="pyq-text-muted" style={{ fontSize: '14px' }}>
              {userChoice ? (
                <span>You selected Option <strong style={{ color: '#0284c7' }}>({userChoice.toUpperCase()})</strong>. Ready to verify?</span>
              ) : (
                <span>Pick an option above to test your answer</span>
              )}
            </span>

            <button
              onClick={() => setIsRevealed(true)}
              style={{
                padding: '9px 22px',
                borderRadius: '8px',
                border: 'none',
                background: userChoice ? '#059669' : '#0284c7',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {userChoice ? 'Check Answer ✓' : 'Reveal Answer & Explanation ⌄'}
            </button>
          </div>
        )}

        {/* Official Answer & Detailed Explanation (Always in SSR DOM via <details> for SEO/GEO indexing, auto-opens on reveal) */}
        <details
          id="answer"
          open={isRevealed}
          onToggle={(e) => setIsRevealed(e.currentTarget.open)}
          style={{ marginBottom: '24px' }}
        >
          <summary
            style={{
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 700,
              color: '#10b981',
              marginBottom: '12px',
              userSelect: 'none',
              listStyle: 'none',
              display: isRevealed ? 'none' : 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>▸ View Official UPSC Answer Key &amp; Detailed Explanation</span>
          </summary>

          <div className="pyq-solution-box" style={{
            borderRadius: '14px',
            padding: '22px 26px',
            marginBottom: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#059669', letterSpacing: '0.06em' }}>
                OFFICIAL KEY VERIFIED
              </span>
              <span style={{
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#059669',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '800'
              }}>
                Correct Option: ({correctLabelUpper}){correctOpt ? ` — ${correctOpt.text}` : ''}
              </span>
            </div>

            <div style={{ fontSize: '14.5px', lineHeight: 1.7 }}>
              {explanationText ? (
                <div style={{ margin: '0 0 12px 0', whiteSpace: 'pre-line' }}>
                  <strong>Detailed Explanation:</strong>{'\n'}{explanationText}
                </div>
              ) : !analysis ? (
                <p style={{ margin: '0 0 10px 0' }}>
                  <strong>Explanation:</strong> Under the official {q.examName} ({q.examYear}) key, Option <strong>({correctLabelUpper})</strong> is the verified correct answer.
                </p>
              ) : null}
              <p style={{ margin: 0, color: '#0284c7', fontSize: '12.5px', fontFamily: 'monospace' }}>
                Source: Official {q.examName} ({q.examYear}) Key • {q.srcSubject} ({q.srcTopic}) Archive
              </p>
            </div>
          </div>

          {isRevealed && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setIsRevealed(false);
                  setUserChoice(null);
                }}
                className="pyq-text-muted"
                style={{ background: 'transparent', border: 'none', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Hide Answer / Re-attempt
              </button>
            </div>
          )}
        </details>

        {/* Card Footer Toolbar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '20px',
          fontSize: '13px',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="pyq-text-muted">Subject:</span>
            <Link
              href={`/prelims/pyq?subject=${encodeURIComponent(q.srcSubject || 'ALL')}`}
              className="pyq-badge-dark"
              style={{ padding: '3px 9px', borderRadius: '6px', fontWeight: '600', textDecoration: 'none' }}
            >
              {q.srcSubject}
            </Link>
          </div>

          <Link
            href={`/prelims/pyq?subject=${encodeURIComponent(q.srcSubject || 'ALL')}&topic=${encodeURIComponent(q.srcTopic || 'ALL')}`}
            style={{
              color: '#0284c7',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '13px'
            }}
          >
            Practice more &ldquo;{q.srcTopic}&rdquo; questions →
          </Link>
        </div>

        {/* Lecture-Grade Micro Deep-Dive */}
        {analysis && <PyqDeepDive analysis={analysis} />}
      </article>

      {/* Related Questions Internal Link Mesh (Critical for Search Engine Spidering across all 2,528 PYQs) */}
      {Array.isArray(q.relatedQuestions) && q.relatedQuestions.length > 0 && (
        <section
          aria-label={`More UPSC Prelims Questions on ${q.srcTopic}`}
          className="pyq-card"
          style={{
            borderRadius: '18px',
            padding: '26px 30px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
              More Solved UPSC Prelims PYQs on {q.srcTopic}
            </h2>
            <Link
              href={`/prelims/pyq?subject=${encodeURIComponent(q.srcSubject || 'ALL')}&topic=${encodeURIComponent(q.srcTopic || 'ALL')}`}
              style={{ fontSize: '12.5px', fontWeight: 700, color: '#38bdf8', textDecoration: 'none' }}
            >
              View All in {q.srcTopic} →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {q.relatedQuestions.map(rq => (
              <Link
                key={rq.id}
                href={`/prelims/pyq/${rq.slug}`}
                className="pyq-inset"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'border-color 0.15s ease'
                }}
              >
                <div style={{ fontSize: '13.5px', lineHeight: 1.45 }}>
                  <span style={{
                    display: 'inline-block',
                    background: 'rgba(59, 130, 246, 0.15)',
                    color: '#60a5fa',
                    padding: '2px 7px',
                    borderRadius: '5px',
                    fontSize: '11px',
                    fontWeight: 800,
                    marginRight: '8px'
                  }}>
                    {rq.examName} {rq.examYear}
                  </span>
                  <span>{rq.shortStem}…</span>
                </div>
                <ArrowRight size={15} style={{ flexShrink: 0, color: '#64748b' }} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Styled JSX theme rules */}
      <style jsx global>{`
        .pyq-card {
          background: #0f172a;
          border: 1px solid #1e293b;
          color: #f8fafc;
        }
        .pyq-inset {
          background: #090d16;
          border: 1px solid #1e293b;
          color: #f8fafc;
        }
        .pyq-text-title {
          color: #f8fafc;
        }
        .pyq-text-body {
          color: #cbd5e1;
        }
        .pyq-text-muted {
          color: #94a3b8;
        }
        .pyq-badge-dark {
          background: #1e293b;
          color: #94a3b8;
        }
        .pyq-solution-box {
          background: #061a14;
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #cbd5e1;
        }
        .pyq-option-item {
          background: #090d16;
          border: 1px solid #1e293b;
          color: #cbd5e1;
        }
        .pyq-option-item:hover {
          border-color: #38bdf8;
          color: #f8fafc;
        }
        .pyq-option-selected {
          background: rgba(56, 189, 248, 0.08);
          border: 1px solid #38bdf8;
          color: #f8fafc;
        }
        .pyq-option-correct {
          background: rgba(16, 185, 129, 0.14);
          border: 1px solid #10b981;
          color: #a7f3d0;
        }
        .pyq-option-incorrect {
          background: rgba(239, 68, 68, 0.14);
          border: 1px solid #ef4444;
          color: #fca5a5;
        }
        .pyq-statement-box strong {
          color: #38bdf8;
        }

        [data-theme='light'] .pyq-card,
        [data-theme='sepia'] .pyq-card {
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          color: #0f172a !important;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04) !important;
        }
        [data-theme='light'] .pyq-inset,
        [data-theme='sepia'] .pyq-inset {
          background: #f8fafc !important;
          border: 1px solid #e2e8f0 !important;
          color: #0f172a !important;
        }
        [data-theme='light'] .pyq-text-title,
        [data-theme='sepia'] .pyq-text-title {
          color: #0f172a !important;
        }
        [data-theme='light'] .pyq-text-body,
        [data-theme='sepia'] .pyq-text-body {
          color: #334155 !important;
        }
        [data-theme='light'] .pyq-text-muted,
        [data-theme='sepia'] .pyq-text-muted {
          color: #64748b !important;
        }
        [data-theme='light'] .pyq-badge-dark,
        [data-theme='sepia'] .pyq-badge-dark {
          background: #f1f5f9 !important;
          border: 1px solid #e2e8f0 !important;
          color: #334155 !important;
        }
        [data-theme='light'] .pyq-solution-box,
        [data-theme='sepia'] .pyq-solution-box {
          background: #f0fdf4 !important;
          border: 1px solid #86efac !important;
          color: #166534 !important;
        }
        [data-theme='light'] .pyq-solution-box p,
        [data-theme='sepia'] .pyq-solution-box p {
          color: #166534 !important;
        }
        [data-theme='light'] .pyq-option-item,
        [data-theme='sepia'] .pyq-option-item {
          background: #ffffff !important;
          border: 1.5px solid #e2e8f0 !important;
          color: #334155 !important;
        }
        [data-theme='light'] .pyq-option-item:hover,
        [data-theme='sepia'] .pyq-option-item:hover {
          border-color: #94a3b8 !important;
          background: #f8fafc !important;
          color: #0f172a !important;
        }
        [data-theme='light'] .pyq-option-selected,
        [data-theme='sepia'] .pyq-option-selected {
          background: rgba(2, 132, 199, 0.08) !important;
          border: 1.5px solid #0284c7 !important;
          color: #0369a1 !important;
        }
        [data-theme='light'] .pyq-option-correct,
        [data-theme='sepia'] .pyq-option-correct {
          background: #f0fdf4 !important;
          border: 1.5px solid #10b981 !important;
          color: #15803d !important;
        }
        [data-theme='light'] .pyq-option-incorrect,
        [data-theme='sepia'] .pyq-option-incorrect {
          background: #fef2f2 !important;
          border: 1.5px solid #ef4444 !important;
          color: #b91c1c !important;
        }
        [data-theme='light'] .pyq-statement-box strong,
        [data-theme='sepia'] .pyq-statement-box strong {
          color: #0f172a !important;
        }
        [data-theme='light'] .pyq-statement-box span,
        [data-theme='sepia'] .pyq-statement-box span {
          color: #334155 !important;
        }
      `}</style>
    </div>
  );
}

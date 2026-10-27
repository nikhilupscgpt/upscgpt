'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  BookOpen,
  Newspaper,
  ArrowRight,
  Tag,
  Layers,
  Flame,
  Info,
  Lock,
  Zap,
  ChevronDown,
  ChevronUp,
  Table2,
  CheckSquare,
} from 'lucide-react';
import { normalizeKeywordsList } from '@/lib/pyqKeywords';
import ConceptStudyModal from './ConceptStudyModal';

function parseValueAdditionPoints(text) {
  if (!text || typeof text !== 'string') return [];
  const rawLines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const items = [];
  for (const line of rawLines) {
    if (line.includes(' • ')) {
      const parts = line.split(/\s*•\s*/).filter(Boolean);
      for (const p of parts) {
        const cleaned = p.replace(/^[•*\-\s]+/, '').trim();
        if (cleaned) items.push(cleaned);
      }
    } else {
      const cleaned = line.replace(/^[•*\-\s]+/, '').trim();
      if (cleaned) items.push(cleaned);
    }
  }
  return items;
}

export default function PyqDeepDive({ analysis, questionId, subject, topic, isAdmin = false }) {
  const [activeKeywordIdx, setActiveKeywordIdx] = useState(null);
  const [modalConcept, setModalConcept] = useState(null);
  const [usageState, setUsageState] = useState({
    loading: true,
    allowed: true,
    isPro: false,
    authenticated: true,
    used: 0,
    limit: 5,
    gatingEnabled: true,
  });

  useEffect(() => {
    let cancelled = false;
    async function checkAndRecordDeepDive() {
      try {
        const res = await fetch('/api/monetisation/usage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            feature: 'deep_dive',
            entityId: questionId || 'unknown_q',
          }),
        });
        const data = await res.json();
        if (!cancelled) {
          setUsageState({
            loading: false,
            allowed: data.allowed !== false,
            isPro: Boolean(data.isPro),
            authenticated: Boolean(data.authenticated),
            used: Number(data.used || 0),
            limit: data.limit,
            gatingEnabled: data.gatingEnabled !== false,
          });
        }
      } catch {
        if (!cancelled) {
          setUsageState((prev) => ({ ...prev, loading: false, allowed: true }));
        }
      }
    }
    checkAndRecordDeepDive();
    return () => {
      cancelled = true;
    };
  }, [questionId]);

  if (!analysis) return null;

  const { keywords, optionBreakdown, statementBreakdown, valueAddition, inNews, similarPyq, visualSuggestion } = analysis;
  const isLocked = !usageState.loading && !usageState.allowed;

  return (
    <div className="pq-deepdive" style={{ position: 'relative' }}>
      {/* 1. Header Banner */}
      <div className="pq-deepdive-head">
        <div className="pq-deepdive-title">
          <Sparkles size={18} className="pq-deepdive-sparkle" />
          <span>UPSCGPT Lecture-Grade Deep-Dive</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!usageState.loading &&
            !usageState.isPro &&
            usageState.gatingEnabled &&
            usageState.limit != null && (
              <Link
                href="/pricing"
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 9px',
                  borderRadius: '999px',
                  background: isLocked ? 'rgba(239, 68, 68, 0.14)' : 'rgba(251, 191, 36, 0.14)',
                  color: isLocked ? '#f87171' : '#fbbf24',
                  textDecoration: 'none',
                }}
              >
                {usageState.used}/{usageState.limit} Free Today · Upgrade
              </Link>
            )}
          <span className="pq-micro-badge">UPSCGPT</span>
        </div>
      </div>

      {/* 2. Keywords and Concepts (Interactive Concept Pills + Expandable Concept Card) */}
      {keywords && keywords.length > 0 && (() => {
        const coreKeywords = normalizeKeywordsList(keywords);
        if (coreKeywords.length === 0) return null;

        const selectedKw =
          activeKeywordIdx !== null && coreKeywords[activeKeywordIdx]
            ? coreKeywords[activeKeywordIdx]
            : null;

        return (
          <div className="pq-dd-section">
            <div
              className="pq-dd-label"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Tag size={14} /> Keywords &amp; Core Concepts
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--pq-muted, #64748b)',
                  textTransform: 'none',
                  letterSpacing: 0,
                }}
              >
                Click any keyword to open its Concept Card &amp; linked PYQs
              </span>
            </div>

            <div className="pq-keywords">
              {coreKeywords.map((kw, i) => {
                const isSelected = activeKeywordIdx === i;
                return (
                  <button
                    key={kw.slug || i}
                    type="button"
                    onClick={() =>
                      setActiveKeywordIdx(prev => (prev === i ? null : i))
                    }
                    className={`pq-keyword-pill ${isSelected ? 'is-active' : ''}`}
                    style={{
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      border: isSelected
                        ? '1.5px solid #6366f1'
                        : undefined,
                      background: isSelected
                        ? 'rgba(99, 102, 241, 0.16)'
                        : undefined,
                      boxShadow: isSelected
                        ? '0 2px 10px rgba(99, 102, 241, 0.18)'
                        : undefined,
                      transition: 'all 0.16s ease',
                    }}
                    title={`View concept card for ${kw.term}`}
                  >
                    <span>#{kw.term}</span>
                    {isSelected ? (
                      <ChevronUp size={13} style={{ opacity: 0.85 }} />
                    ) : (
                      <ChevronDown size={13} style={{ opacity: 0.65 }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Expandable Inline Short Concept Card */}
            {selectedKw && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '16px 18px',
                  borderRadius: '14px',
                  background:
                    'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(59, 130, 246, 0.05))',
                  border: '1.5px solid rgba(99, 102, 241, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  animation: 'fadeIn 0.18s ease-out',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: 'rgba(99, 102, 241, 0.16)',
                        color: '#6366f1',
                        fontSize: '10.5px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Concept Card
                    </span>
                    <strong
                      style={{
                        fontSize: '0.96rem',
                        fontWeight: 800,
                        color: 'var(--pq-ink, #0f172a)',
                      }}
                    >
                      {selectedKw.term}
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setModalConcept({
                        ...selectedKw,
                        subject: subject || analysis.srcSubject,
                        topic: topic || analysis.srcTopic,
                      })
                    }
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(59, 130, 246, 0.35)',
                      background: 'rgba(59, 130, 246, 0.12)',
                      color: '#3b82f6',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    <BookOpen size={13} />
                    <span>Study Concept &amp; Associated PYQs →</span>
                  </button>
                </div>

                <div
                  style={{
                    fontSize: '0.91rem',
                    lineHeight: 1.6,
                    color: 'var(--pq-ink, #0f172a)',
                  }}
                >
                  {selectedKw.shortNote ||
                    `High-yield UPSC Prelims concept tested in this question. Click "Study Concept & Associated PYQs" to view detailed notes and all linked questions.`}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Paywall Gate Overlay when Daily Free Allowance is Reached */}
      {isLocked ? (
        <div
          style={{
            marginTop: '14px',
            padding: '26px 24px',
            borderRadius: '16px',
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(7, 11, 20, 0.98))',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            textAlign: 'center',
            color: '#f8fafc',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.14)',
              color: '#10b981',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
            }}
          >
            <Lock size={20} />
          </div>

          <h4 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 900 }}>
            {usageState.authenticated
              ? `Daily Free Limit Reached (${usageState.used}/${usageState.limit} Deep-Dives Used Today)`
              : `Visitor Limit Reached (${usageState.used}/${usageState.limit} Free Deep-Dives Used)`}
          </h4>

          <p
            style={{
              margin: '0 auto 18px',
              maxWidth: '520px',
              fontSize: '13.5px',
              lineHeight: 1.55,
              color: '#94a3b8',
            }}
          >
            {usageState.authenticated
              ? 'Your free daily quota resets at midnight IST. Unlock unlimited 8-part option breakdowns, value-addition notes, micro-theme analytics, and custom practice with the Prelims Pass.'
              : 'Create a free account to unlock more daily Deep-Dive explanations, or get the Prelims Pass for unlimited access till Prelims 2027.'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {!usageState.authenticated && (
              <Link
                href="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  background: '#1e293b',
                  color: '#f8fafc',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 800,
                }}
              >
                Sign In for Free Quota
              </Link>
            )}
            <Link
              href="/pricing"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '10px 20px',
                borderRadius: '10px',
                background: '#10b981',
                color: '#042f2e',
                textDecoration: 'none',
                fontSize: '13.5px',
                fontWeight: 900,
              }}
            >
              <Zap size={15} /> Unlock Unlimited with Prelims Pass →
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* 3. Stem Statements Evaluation (if numbered statements exist) OR Option-by-Option Breakdown */}
          {statementBreakdown && Array.isArray(statementBreakdown) && statementBreakdown.length > 0 ? (
            <div className="pq-dd-section">
              <div className="pq-dd-label">
                <CheckSquare size={14} /> Stem Statements Evaluation
              </div>
              <div className="pq-breakdown-grid">
                {statementBreakdown.map((stmt, i) => {
                  const isCorrect =
                    (stmt.verdict || '').toLowerCase().includes('correct') &&
                    !(stmt.verdict || '').toLowerCase().includes('incorrect') &&
                    !(stmt.verdict || '').toLowerCase().includes('false');
                  const stmtNum = stmt.statementNo != null ? stmt.statementNo : (i + 1);

                  return (
                    <div
                      key={i}
                      className={`pq-breakdown-card ${isCorrect ? 'is-correct-card' : 'is-incorrect-card'}`}
                    >
                      <div className="pq-bc-head">
                        <span className="pq-bc-label">Statement {stmtNum}</span>
                        <span className={`pq-bc-badge ${isCorrect ? 'is-correct' : 'is-incorrect'}`}>
                          {isCorrect ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                          {stmt.verdict || (isCorrect ? 'Correct' : 'Incorrect')}
                        </span>
                        {stmt.reference && (
                          <span
                            className="pq-bc-ref-badge"
                            style={{
                              marginLeft: 'auto',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: 'rgba(59, 130, 246, 0.12)',
                              border: '1px solid rgba(59, 130, 246, 0.28)',
                              color: 'var(--pq-blue, #3b82f6)',
                              fontSize: '11px',
                              fontWeight: 800,
                              letterSpacing: '0.02em',
                            }}
                          >
                            {stmt.reference}
                          </span>
                        )}
                      </div>
                      {stmt.text && <p className="pq-bc-opt-text">{stmt.text}</p>}
                      <p className="pq-bc-exp">{stmt.explanation}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            optionBreakdown && optionBreakdown.length > 0 && (
              <div className="pq-dd-section">
                <div className="pq-dd-label">
                  <Layers size={14} /> Option-by-Option Elimination Breakdown
                </div>
                <div className="pq-breakdown-grid">
                  {optionBreakdown.map((opt, i) => {
                    const isCorrect =
                      (opt.verdict || '').toLowerCase().includes('correct') &&
                      !(opt.verdict || '').toLowerCase().includes('incorrect');
                    const labelStr = String(opt.label || i + 1).toUpperCase();
                    return (
                      <div
                        key={i}
                        className={`pq-breakdown-card ${isCorrect ? 'is-correct-card' : 'is-incorrect-card'}`}
                      >
                        <div className="pq-bc-head">
                          <span className="pq-bc-label">({labelStr})</span>
                          <span className={`pq-bc-badge ${isCorrect ? 'is-correct' : 'is-incorrect'}`}>
                            {isCorrect ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                            {opt.verdict || (isCorrect ? 'Correct' : 'Incorrect')}
                          </span>
                          {opt.reference && (
                            <span
                              className="pq-bc-ref-badge"
                              style={{
                                marginLeft: 'auto',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                background: 'rgba(59, 130, 246, 0.12)',
                                border: '1px solid rgba(59, 130, 246, 0.28)',
                                color: 'var(--pq-blue, #3b82f6)',
                                fontSize: '11px',
                                fontWeight: 800,
                                letterSpacing: '0.02em',
                              }}
                            >
                              {opt.reference}
                            </span>
                          )}
                        </div>
                        {opt.text && <p className="pq-bc-opt-text">{opt.text}</p>}
                        <p className="pq-bc-exp">{opt.explanation}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}

          {/* 4. Value Addition Notes */}
          {valueAddition && (
            <div className="pq-dd-section">
              <div className="pq-dd-label">
                <BookOpen size={14} /> Value Addition
              </div>
              {typeof valueAddition === 'string' ? (() => {
                const points = parseValueAdditionPoints(valueAddition);
                if (points.length <= 1) {
                  return (
                    <div className="pq-va-card" style={{ padding: '16px 20px', lineHeight: 1.65, fontSize: '0.92rem' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', color: 'var(--pq-ink)' }}>
                        <Info size={16} style={{ color: 'var(--pq-gold)', flexShrink: 0, marginTop: '3px' }} />
                        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>{valueAddition}</div>
                      </div>
                    </div>
                  );
                }
                return (
                  <div className="pq-va-card" style={{ padding: '18px 22px', fontSize: '0.92rem' }}>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {points.map((pt, idx) => {
                        const colonIdx = pt.indexOf(':');
                        const hasHeading = colonIdx > 0 && colonIdx < 80;
                        const heading = hasHeading ? pt.substring(0, colonIdx).trim() : null;
                        const body = hasHeading ? pt.substring(colonIdx + 1).trim() : pt;

                        return (
                          <li key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', lineHeight: 1.62 }}>
                            <span style={{
                              color: 'var(--pq-gold, #f59e0b)',
                              fontWeight: 900,
                              fontSize: '1.2rem',
                              lineHeight: 1,
                              marginTop: '2px',
                              flexShrink: 0
                            }}>•</span>
                            <div style={{ color: 'var(--pq-ink, #0f172a)' }}>
                              {hasHeading ? (
                                <>
                                  <strong style={{ color: 'var(--pq-ink, #0f172a)', fontWeight: 800 }}>{heading}: </strong>
                                  <span>{body}</span>
                                </>
                              ) : (
                                <span>{body}</span>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })() : Array.isArray(valueAddition) ? (
                <div className="pq-va-grid">
                  {valueAddition.map((card, i) => {
                    if (typeof card === 'string') {
                      return (
                        <div key={i} className="pq-va-card">
                          <p className="pq-va-desc">{card}</p>
                        </div>
                      );
                    }
                    const title = card?.title || card?.heading;
                    const tag = card?.tag;
                    const bullets = card?.bullets || card?.points || card?.items;
                    const sections = card?.sections;

                    return (
                      <div key={i} className="pq-va-card">
                        {(title || tag) && (
                          <div className="pq-va-head">
                            {title && <h4 className="pq-va-title">{title}</h4>}
                            {tag && <span className="pq-va-tag">{tag}</span>}
                          </div>
                        )}
                        {card?.description && <p className="pq-va-desc">{card.description}</p>}
                        {Array.isArray(bullets) && bullets.length > 0 && (
                          <ul className="pq-va-list" style={{ margin: '8px 0 0', paddingLeft: 18 }}>
                            {bullets.map((b, k) => (
                              <li key={k} style={{ marginBottom: 6, lineHeight: 1.55 }}>
                                {typeof b === 'string' ? b : JSON.stringify(b)}
                              </li>
                            ))}
                          </ul>
                        )}
                        {Array.isArray(sections) &&
                          sections.map((sec, j) => (
                            <div key={j} className="pq-va-subblock">
                              {(sec.heading || sec.title) && (
                                <h5 className="pq-va-subtitle">{sec.heading || sec.title}</h5>
                              )}
                              <ul className="pq-va-list">
                                {(sec.points || sec.bullets || []).map((pt, k) => (
                                  <li
                                    key={k}
                                    dangerouslySetInnerHTML={{
                                      __html: typeof pt === 'string' ? pt : JSON.stringify(pt),
                                    }}
                                  />
                                ))}
                              </ul>
                            </div>
                          ))}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          )}

          {/* 5. In News / Current Affairs Connection */}
          {inNews && (
            <div className="pq-dd-section">
              <div className="pq-dd-label">
                <Newspaper size={14} /> In News & Current Affairs Linkage
              </div>
              <div className="pq-news-card">
                <div className="pq-news-top">
                  <span className="pq-news-tag">
                    <Flame size={12} /> {inNews.source ? `${inNews.source} • ${inNews.date || ''}` : 'Recent Context'}
                  </span>
                  {inNews.subheadline && <span className="pq-news-subtag">{inNews.subheadline}</span>}
                </div>
                <h4 className="pq-news-title">{inNews.headline || (typeof inNews === 'string' ? inNews : '')}</h4>
                {(inNews.relevance || inNews.context) && (
                  <p className="pq-news-context">{inNews.relevance || inNews.context}</p>
                )}
                {inNews.relatedArticles && inNews.relatedArticles.length > 0 && (
                  <div className="pq-news-related">
                    <span className="pq-nr-label">Exam Connections:</span>
                    <ul>
                      {inNews.relatedArticles.map((art, i) => (
                        <li key={i}>{art}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 6. Interlinked Similar PYQ */}
          {similarPyq && (
            <div className="pq-dd-section">
              <div className="pq-dd-label">
                <Layers size={14} /> Similar PYQ & Question Family
              </div>
              <div className="pq-similar-card">
                <div className="pq-similar-top">
                  <span className="pq-similar-badge">
                    {similarPyq.examName || 'UPSC CSE Pre'} {similarPyq.examYear || ''}
                  </span>
                  <span className="pq-similar-topic">{similarPyq.srcTopic || 'Related Theme'}</span>
                </div>
                <p className="pq-similar-stem">{similarPyq.stem || (typeof similarPyq === 'string' ? similarPyq : '')}</p>
                {similarPyq.keyTakeaway && (
                  <p style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--pq-gold)', fontStyle: 'italic' }}>
                    💡 Pattern Insight: {similarPyq.keyTakeaway}
                  </p>
                )}
                {similarPyq.targetId && (
                  <Link
                    href={`/prelims/pyq/${encodeURIComponent(similarPyq.targetId)}`}
                    className="pq-similar-btn"
                  >
                    <span>Attempt this Question on Portal</span>
                    <ArrowRight size={15} />
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* 7. Comparison Matrix Table / Visual Suggestion */}
          {visualSuggestion && (
            <div className="pq-dd-section">
              <div className="pq-dd-label">
                <Table2 size={14} /> {visualSuggestion.title || 'High-Yield Comparison Matrix'}
              </div>
              <div className="pq-visual-table-card">
                {visualSuggestion.tableData && Array.isArray(visualSuggestion.tableData.headers) && (
                  <table className="pq-visual-table">
                    <thead>
                      <tr>
                        {visualSuggestion.tableData.headers.map((h, hIdx) => (
                          <th key={hIdx}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(visualSuggestion.tableData.rows) &&
                        visualSuggestion.tableData.rows.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {Array.isArray(row) &&
                              row.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  className={cIdx === 0 ? 'pq-table-col-entity' : ''}
                                >
                                  {typeof cell === 'string' ? cell : JSON.stringify(cell)}
                                </td>
                              ))}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}

                {visualSuggestion.caption && (
                  <p className="pq-visual-table-caption">
                    💡 {visualSuggestion.caption}
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}

      <ConceptStudyModal
        isOpen={Boolean(modalConcept)}
        onClose={() => setModalConcept(null)}
        initialConcept={modalConcept}
        isAdmin={isAdmin}
      />
    </div>
  );
}

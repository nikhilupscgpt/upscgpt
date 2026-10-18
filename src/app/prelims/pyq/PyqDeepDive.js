'use client';

import React from 'react';
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
  Info
} from 'lucide-react';

export default function PyqDeepDive({ analysis }) {
  if (!analysis) return null;

  const { keywords, optionBreakdown, valueAddition, inNews, similarPyq } = analysis;

  return (
    <div className="pq-deepdive">
      {/* 1. Header Banner */}
      <div className="pq-deepdive-head">
        <div className="pq-deepdive-title">
          <Sparkles size={18} className="pq-deepdive-sparkle" />
          <span>Lecture-Grade Micro Deep-Dive</span>
        </div>
        <span className="pq-micro-badge">µ UPSC MICRO</span>
      </div>

      {/* 2. Keywords and Concepts */}
      {keywords && keywords.length > 0 && (
        <div className="pq-dd-section">
          <div className="pq-dd-label">
            <Tag size={14} /> Keywords & Core Concepts
          </div>
          <div className="pq-keywords">
            {keywords.map((kw, i) => {
              if (typeof kw === 'object' && kw !== null) {
                const isDistractor = Boolean(kw.isDistractor);
                return (
                  <span 
                    key={i} 
                    className={`pq-keyword-pill ${isDistractor ? 'pq-distractor-pill' : ''}`}
                    style={isDistractor ? {
                      textDecoration: 'line-through',
                      opacity: 0.75,
                      borderColor: 'rgba(239, 68, 68, 0.4)',
                      background: 'rgba(239, 68, 68, 0.08)',
                      color: 'var(--pq-ink)'
                    } : undefined}
                    title={isDistractor ? 'Distractor concept to learn from' : undefined}
                  >
                    {isDistractor ? `~~${kw.concept}~~ (Distractor)` : `#${kw.concept}`}
                  </span>
                );
              }
              return (
                <span key={i} className="pq-keyword-pill">
                  #{String(kw)}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Option-by-Option Elimination Breakdown */}
      {optionBreakdown && optionBreakdown.length > 0 && (
        <div className="pq-dd-section">
          <div className="pq-dd-label">
            <Layers size={14} /> Option-by-Option Elimination Breakdown
          </div>
          <div className="pq-breakdown-grid">
            {optionBreakdown.map((opt, i) => {
              const isCorrect = (opt.verdict || '').toLowerCase().includes('correct') && !(opt.verdict || '').toLowerCase().includes('incorrect');
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
                  </div>
                  {opt.text && <p className="pq-bc-opt-text">{opt.text}</p>}
                  <p className="pq-bc-exp">{opt.explanation}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Value Addition Notes */}
      {valueAddition && (
        <div className="pq-dd-section">
          <div className="pq-dd-label">
            <BookOpen size={14} /> Forward-Looking Value Addition *(What UPSC will ask next)*
          </div>
          {typeof valueAddition === 'string' ? (
            <div className="pq-va-card" style={{ padding: '16px 20px', lineHeight: 1.65, fontSize: '0.92rem' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', color: 'var(--pq-ink)' }}>
                <Info size={16} style={{ color: 'var(--pq-gold)', flexShrink: 0, marginTop: '3px' }} />
                <div>{valueAddition}</div>
              </div>
            </div>
          ) : Array.isArray(valueAddition) ? (
            <div className="pq-va-grid">
              {valueAddition.map((card, i) => (
                <div key={i} className="pq-va-card">
                  {typeof card === 'string' ? (
                    <p className="pq-va-desc">{card}</p>
                  ) : (
                    <>
                      <div className="pq-va-head">
                        <h4 className="pq-va-title">{card.title}</h4>
                        {card.tag && <span className="pq-va-tag">{card.tag}</span>}
                      </div>
                      {card.description && (
                        <p className="pq-va-desc">{card.description}</p>
                      )}
                      {card.sections && card.sections.map((sec, j) => (
                        <div key={j} className="pq-va-subblock">
                          <h5 className="pq-va-subtitle">{sec.heading}</h5>
                          <ul className="pq-va-list">
                            {sec.points && sec.points.map((pt, k) => (
                              <li key={k} dangerouslySetInnerHTML={{ __html: pt }} />
                            ))}
                          </ul>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              ))}
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
              {inNews.subheadline && (
                <span className="pq-news-subtag">{inNews.subheadline}</span>
              )}
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
    </div>
  );
}

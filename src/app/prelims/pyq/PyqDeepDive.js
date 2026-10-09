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
  ExternalLink,
  Tag,
  Layers,
  Flame
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
            {keywords.map((kw, i) => (
              <span key={i} className="pq-keyword-pill">
                #{kw}
              </span>
            ))}
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
              return (
                <div 
                  key={i} 
                  className={`pq-breakdown-card ${isCorrect ? 'is-correct-card' : 'is-incorrect-card'}`}
                >
                  <div className="pq-bc-head">
                    <span className="pq-bc-label">({opt.label.toUpperCase()})</span>
                    <span className={`pq-bc-badge ${isCorrect ? 'is-correct' : 'is-incorrect'}`}>
                      {isCorrect ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                      {opt.verdict}
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
      {valueAddition && valueAddition.length > 0 && (
        <div className="pq-dd-section">
          <div className="pq-dd-label">
            <BookOpen size={14} /> Value Addition & High-Yield Intel
          </div>
          <div className="pq-va-grid">
            {valueAddition.map((card, i) => (
              <div key={i} className="pq-va-card">
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
                      {sec.points.map((pt, k) => (
                        <li key={k} dangerouslySetInnerHTML={{ __html: pt }} />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
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
                <Flame size={12} /> Recent Context
              </span>
              {inNews.subheadline && (
                <span className="pq-news-subtag">{inNews.subheadline}</span>
              )}
            </div>
            <h4 className="pq-news-title">{inNews.headline}</h4>
            {inNews.context && (
              <p className="pq-news-context">{inNews.context}</p>
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
            <Layers size={14} /> Interlinked Similar PYQ
          </div>
          <div className="pq-similar-card">
            <div className="pq-similar-top">
              <span className="pq-similar-badge">
                {similarPyq.examName || 'UPSC CSE Pre'} {similarPyq.examYear}
              </span>
              <span className="pq-similar-topic">{similarPyq.srcTopic || 'Related Theme'}</span>
            </div>
            <p className="pq-similar-stem">{similarPyq.stem}</p>
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

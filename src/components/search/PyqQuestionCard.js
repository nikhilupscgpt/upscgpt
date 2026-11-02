'use client';

import { useState } from 'react';
import Link from 'next/link';
import { parseStem } from '@/lib/pyqStemParser';

export default function PyqQuestionCard({
  pyq,
  query = '',
  highlightText,
  isHeroMatch = false,
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [eliminatedStatements, setEliminatedStatements] = useState({});

  if (!pyq) return null;

  const stemText = pyq.stem || pyq.question || '';
  const canonicalHref = pyq.link || (pyq.slug ? `/prelims/pyq/${pyq.slug}` : `/prelims/pyq/${pyq.id}`);
  const examBadge = `${pyq.examName || 'UPSC Prelims'} ${pyq.examYear || pyq.year || ''}`.trim();
  const questionNoBadge = pyq.questionNo ? `Q#${pyq.questionNo}` : pyq.paper ? `Paper ${pyq.paper}` : null;
  const subjectLabel = pyq.srcSubject || 'General Studies';
  const topicLabel = pyq.srcTopic || pyq.coreEntity || null;

  // Parse options array safely
  let options = [];
  if (Array.isArray(pyq.options)) {
    options = pyq.options;
  } else if (typeof pyq.options === 'string') {
    try {
      options = JSON.parse(pyq.options);
    } catch {
      options = [];
    }
  }

  const normalizedCorrect = String(pyq.correctLabel || '').trim().toUpperCase();
  const hasInteractiveOptions = options.length > 0 && Boolean(normalizedCorrect);
  const isAnswered = Boolean(selectedOption) || revealed;
  const isUserCorrect =
    Boolean(selectedOption) &&
    String(selectedOption).toUpperCase() === normalizedCorrect;

  // Parse structured stem blocks (lead intro, statements list, closing prompt)
  const blocks = parseStem(stemText);
  const firstPIndex = blocks.findIndex(b => b.type === 'p');

  const renderHighlighted = text => {
    if (typeof highlightText === 'function' && query) {
      return highlightText(text, query);
    }
    return text;
  };

  const toggleStatementEliminate = (stmtId) => {
    setEliminatedStatements(prev => ({ ...prev, [stmtId]: !prev[stmtId] }));
  };

  const shortExplanation = pyq.explanation
    ? String(pyq.explanation)
        .replace(/[#*_`>-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 320)
    : null;

  const syllabusNodes = Array.isArray(pyq.syllabusNodes) ? pyq.syllabusNodes : [];

  return (
    <div className={`pyq-clean-card ${isHeroMatch ? 'hero-glow' : ''}`}>
      {/* Top Metadata Ribbon */}
      <div className="card-top-ribbon">
        <div className="card-badge-group">
          {isHeroMatch && (
            <span className="badge badge-hero">🎯 Best Match</span>
          )}
          <span className="badge badge-exam">{examBadge}</span>
          {questionNoBadge && (
            <span className="badge badge-qno">{questionNoBadge}</span>
          )}
          <span className="badge badge-subject">{subjectLabel}</span>
          {topicLabel && topicLabel !== subjectLabel && (
            <span className="badge badge-topic">{topicLabel}</span>
          )}
        </div>

        <Link href={canonicalHref} className="card-external-link" title="Open full question page">
          <span>Full Analysis</span>
          <span className="arrow-icon">↗</span>
        </Link>
      </div>

      {/* Question Content Body */}
      <div className="card-content-body">
        {blocks.map((block, idx) => {
          if (block.type === 'stmts') {
            return (
              <div className="statements-container" key={idx}>
                {block.items.map((item, sIdx) => {
                  const stmtId = `${idx}-${sIdx}`;
                  const isCrossed = Boolean(eliminatedStatements[stmtId]);
                  return (
                    <div
                      key={sIdx}
                      className={`statement-row ${isCrossed ? 'is-crossed' : ''}`}
                      onClick={() => toggleStatementEliminate(stmtId)}
                      title={isCrossed ? 'Tap to restore statement' : 'Tap to cross out statement while solving'}
                    >
                      <span className="statement-key-badge">{item.key}</span>
                      <span className="statement-text">
                        {renderHighlighted(item.text)}
                      </span>
                      <span className="statement-strike-action" aria-hidden="true">
                        {isCrossed ? '↺' : '✕'}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          }

          if (block.type === 'table') {
            return (
              <div className="card-table-wrapper" key={idx}>
                <table className="card-table">
                  <thead>
                    <tr>{block.head.map((h, k) => <th key={k}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {block.rows.map((r, k) => (
                      <tr key={k}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          const isPrompt = block.isPrompt || (idx !== firstPIndex && idx > 0);

          if (isPrompt) {
            return (
              <div className="prompt-callout-box" key={idx}>
                <span className="prompt-icon">❓</span>
                <p className="prompt-text">{renderHighlighted(block.text)}</p>
              </div>
            );
          }

          return (
            <p className="lead-intro-text" key={idx}>
              {renderHighlighted(block.text)}
            </p>
          );
        })}
      </div>

      {/* Options Section A/B/C/D */}
      {options.length > 0 && (
        <div className="options-grid">
          {options.map((opt, idx) => {
            const label = String(opt.label || ['A', 'B', 'C', 'D'][idx] || '').toUpperCase();
            const isSelected = selectedOption === label;
            const isCorrectOpt = normalizedCorrect === label;

            let optionStatus = '';
            if (isAnswered) {
              if (isCorrectOpt) optionStatus = 'correct';
              else if (isSelected && !isCorrectOpt) optionStatus = 'wrong';
              else optionStatus = 'dimmed';
            }

            return (
              <button
                key={label || idx}
                type="button"
                className={`option-btn ${optionStatus}`}
                onClick={() => {
                  if (!hasInteractiveOptions) return;
                  setSelectedOption(label);
                  setRevealed(true);
                }}
              >
                <span className="option-letter-badge">({label.toLowerCase()})</span>
                <span className="option-label-text">{renderHighlighted(opt.text || '')}</span>
                {isAnswered && isCorrectOpt && (
                  <span className="option-status-tag correct">✓ Official Key</span>
                )}
                {isAnswered && isSelected && !isCorrectOpt && (
                  <span className="option-status-tag wrong">✗ Your Pick</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Answer Verification & Solution Preview */}
      {isAnswered && normalizedCorrect && (
        <div className={`answer-feedback-box ${selectedOption ? (isUserCorrect ? 'correct' : 'wrong') : 'neutral'}`}>
          <div className="feedback-heading">
            <span className="feedback-badge-icon">
              {selectedOption ? (isUserCorrect ? '✅' : '❌') : '🔑'}
            </span>
            <span className="feedback-verdict-text">
              {selectedOption
                ? isUserCorrect
                  ? `Correct! Official UPSC Key is (${normalizedCorrect}).`
                  : `Incorrect. You chose (${selectedOption}), but the Official UPSC Key is (${normalizedCorrect}).`
                : `Official UPSC Answer Key: Option (${normalizedCorrect})`}
            </span>
          </div>

          {shortExplanation && (
            <p className="feedback-explanation-text">
              {shortExplanation}
              {String(pyq.explanation || '').length > 320 ? '…' : ''}
            </p>
          )}
        </div>
      )}

      {/* Card Actions & Syllabus Link */}
      <div className="card-footer-bar">
        <div className="footer-action-buttons">
          {hasInteractiveOptions && !isAnswered && (
            <button
              type="button"
              className="action-btn-reveal"
              onClick={() => setRevealed(true)}
            >
              🔑 Reveal Official Key
            </button>
          )}

          {isAnswered && (
            <button
              type="button"
              className="action-btn-reset"
              onClick={() => {
                setSelectedOption(null);
                setRevealed(false);
              }}
            >
              ↺ Attempt Again
            </button>
          )}

          <Link href={canonicalHref} className="action-btn-primary">
            <span>Option Elimination Matrix & Notes</span>
            <span className="cta-arrow">→</span>
          </Link>
        </div>

        {syllabusNodes.length > 0 && (
          <div className="footer-syllabus-bridge">
            <span className="bridge-icon">📚</span>
            <span className="bridge-title">Syllabus Node:</span>
            {syllabusNodes.slice(0, 2).map(node => (
              <Link
                key={node.slug}
                href={`/node/${node.slug}`}
                className="bridge-node-pill"
              >
                {node.title} ({node.gsPaper || 'GS'})
              </Link>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .pyq-clean-card {
          background: var(--bg-card, #ffffff);
          border: 1.5px solid var(--border-color, rgba(148, 163, 184, 0.25));
          border-radius: 20px;
          padding: 24px 28px;
          margin-bottom: 24px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          position: relative;
          color: var(--text-primary, #0f172a);
        }

        .pyq-clean-card.hero-glow {
          border-color: var(--color-blue, #3b82f6);
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.12), 0 0 24px rgba(59, 130, 246, 0.14);
        }

        .pyq-clean-card:hover {
          border-color: var(--color-blue, #3b82f6);
          box-shadow: 0 12px 34px rgba(0, 0, 0, 0.12);
        }

        /* Ribbon */
        .card-top-ribbon {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 16px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--border-color, rgba(148, 163, 184, 0.15));
        }

        .card-badge-group {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .badge {
          font-size: 0.74rem;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 999px;
          letter-spacing: 0.02em;
        }

        .badge-hero {
          background: rgba(59, 130, 246, 0.15);
          color: var(--color-blue, #2563eb);
          border: 1px solid rgba(59, 130, 246, 0.35);
        }

        .badge-exam {
          background: rgba(245, 158, 11, 0.12);
          color: #d97706;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .badge-qno {
          background: var(--bg-hover, rgba(148, 163, 184, 0.15));
          color: var(--text-secondary, #475569);
          border: 1px solid var(--border-color, rgba(148, 163, 184, 0.2));
        }

        .badge-subject {
          background: rgba(99, 102, 241, 0.12);
          color: #4f46e5;
          border: 1px solid rgba(99, 102, 241, 0.25);
        }

        .badge-topic {
          background: rgba(16, 185, 129, 0.12);
          color: #059669;
          border: 1px solid rgba(16, 185, 129, 0.25);
        }

        .card-external-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--color-blue, #2563eb);
          text-decoration: none;
          padding: 4px 10px;
          border-radius: 8px;
          background: rgba(37, 99, 235, 0.06);
          transition: all 0.15s ease;
        }

        .card-external-link:hover {
          background: rgba(37, 99, 235, 0.14);
          transform: translateY(-1px);
        }

        /* Question Stem */
        .card-content-body {
          margin-bottom: 20px;
        }

        .lead-intro-text {
          font-size: 1.05rem;
          font-weight: 600;
          line-height: 1.6;
          color: var(--text-primary, #0f172a);
          margin: 0 0 14px 0;
        }

        /* Statements Container */
        .statements-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin: 12px 0 16px 0;
        }

        .statement-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 10px 14px;
          background: var(--bg-hover, rgba(148, 163, 184, 0.07));
          border: 1px solid var(--border-color, rgba(148, 163, 184, 0.18));
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .statement-row:hover {
          background: rgba(59, 130, 246, 0.06);
          border-color: rgba(59, 130, 246, 0.3);
        }

        .statement-row.is-crossed {
          opacity: 0.45;
          background: rgba(239, 68, 68, 0.05);
          border-color: rgba(239, 68, 68, 0.25);
        }

        .statement-row.is-crossed .statement-text {
          text-decoration: line-through;
          text-decoration-color: #ef4444;
        }

        .statement-key-badge {
          width: 26px;
          height: 26px;
          border-radius: 8px;
          background: var(--color-blue, #2563eb);
          color: #ffffff;
          font-weight: 800;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .statement-row.is-crossed .statement-key-badge {
          background: #ef4444;
        }

        .statement-text {
          font-size: 0.96rem;
          line-height: 1.55;
          color: var(--text-primary, #1e293b);
          flex: 1;
        }

        .statement-strike-action {
          font-size: 0.82rem;
          font-weight: 800;
          color: var(--text-muted, #94a3b8);
          opacity: 0.5;
          padding: 2px 6px;
        }

        .statement-row:hover .statement-strike-action {
          opacity: 1;
          color: #ef4444;
        }

        /* Question Ask Prompt */
        .prompt-callout-box {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          background: rgba(59, 130, 246, 0.06);
          border-left: 3.5px solid var(--color-blue, #2563eb);
          border-radius: 0 12px 12px 0;
          margin: 14px 0 6px 0;
        }

        .prompt-icon {
          font-size: 1rem;
          flex-shrink: 0;
        }

        .prompt-text {
          font-size: 0.98rem;
          font-weight: 800;
          color: var(--text-primary, #0f172a);
          margin: 0;
          line-height: 1.5;
        }

        /* Options */
        .options-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 18px;
        }

        .option-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          background: var(--bg-hover, rgba(148, 163, 184, 0.08));
          border: 1.5px solid var(--border-color, rgba(148, 163, 184, 0.2));
          color: var(--text-primary, #1e293b);
          text-align: left;
          cursor: pointer;
          transition: all 0.15s ease;
          font-size: 0.92rem;
        }

        .option-btn:hover {
          background: rgba(59, 130, 246, 0.08);
          border-color: var(--color-blue, #3b82f6);
        }

        .option-letter-badge {
          font-weight: 800;
          font-size: 0.88rem;
          color: var(--color-blue, #2563eb);
          flex-shrink: 0;
        }

        .option-label-text {
          flex: 1;
          line-height: 1.4;
          font-weight: 600;
        }

        .option-btn.correct {
          background: rgba(16, 185, 129, 0.14);
          border-color: #10b981;
          color: #064e3b;
        }

        .option-btn.wrong {
          background: rgba(239, 68, 68, 0.12);
          border-color: #ef4444;
          color: #7f1d1d;
        }

        .option-btn.dimmed {
          opacity: 0.55;
        }

        .option-status-tag {
          font-size: 0.7rem;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 999px;
          white-space: nowrap;
        }

        .option-status-tag.correct {
          background: #10b981;
          color: #ffffff;
        }

        .option-status-tag.wrong {
          background: #ef4444;
          color: #ffffff;
        }

        /* Feedback Box */
        .answer-feedback-box {
          border-radius: 14px;
          padding: 16px 18px;
          margin-bottom: 18px;
          border: 1px solid rgba(59, 130, 246, 0.25);
          background: rgba(59, 130, 246, 0.05);
          animation: slideDown 0.25s ease-out;
        }

        .answer-feedback-box.correct {
          border-color: rgba(16, 185, 129, 0.4);
          background: rgba(16, 185, 129, 0.08);
        }

        .answer-feedback-box.wrong {
          border-color: rgba(239, 68, 68, 0.4);
          background: rgba(239, 68, 68, 0.08);
        }

        .feedback-heading {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .feedback-verdict-text {
          font-size: 0.92rem;
          font-weight: 800;
          color: var(--text-primary, #0f172a);
        }

        .feedback-explanation-text {
          font-size: 0.88rem;
          line-height: 1.6;
          color: var(--text-secondary, #334155);
          margin: 10px 0 0 0;
        }

        /* Footer */
        .card-footer-bar {
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding-top: 14px;
          border-top: 1px solid var(--border-color, rgba(148, 163, 184, 0.15));
        }

        .footer-action-buttons {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }

        .action-btn-reveal {
          padding: 8px 16px;
          border-radius: 10px;
          background: rgba(245, 158, 11, 0.14);
          border: 1px solid rgba(245, 158, 11, 0.35);
          color: #b45309;
          font-weight: 800;
          font-size: 0.82rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .action-btn-reveal:hover {
          background: rgba(245, 158, 11, 0.24);
        }

        .action-btn-reset {
          padding: 8px 14px;
          border-radius: 10px;
          background: var(--bg-hover, rgba(148, 163, 184, 0.14));
          border: none;
          color: var(--text-secondary, #475569);
          font-weight: 700;
          font-size: 0.82rem;
          cursor: pointer;
        }

        .action-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 18px;
          border-radius: 10px;
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          color: #ffffff;
          font-weight: 800;
          font-size: 0.84rem;
          text-decoration: none;
          transition: transform 0.15s ease, filter 0.15s ease;
          margin-left: auto;
        }

        .action-btn-primary:hover {
          transform: translateY(-1px);
          filter: brightness(1.08);
        }

        .footer-syllabus-bridge {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .bridge-title {
          font-size: 0.76rem;
          font-weight: 800;
          color: var(--text-muted, #64748b);
        }

        .bridge-node-pill {
          font-size: 0.78rem;
          font-weight: 700;
          color: #059669;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 3px 12px;
          border-radius: 999px;
          text-decoration: none;
          transition: all 0.15s ease;
        }

        .bridge-node-pill:hover {
          background: rgba(16, 185, 129, 0.2);
          transform: translateY(-1px);
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 640px) {
          .pyq-clean-card {
            padding: 18px 16px;
          }
          .options-grid {
            grid-template-columns: 1fr;
          }
          .footer-action-buttons {
            flex-direction: column;
            align-items: stretch;
          }
          .action-btn-primary {
            margin-left: 0;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

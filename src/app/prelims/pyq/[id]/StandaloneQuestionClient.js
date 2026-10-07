'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Copy, 
  Bookmark, 
  Share2, 
  Sparkles, 
  Check, 
  ArrowLeft,
  Compass
} from 'lucide-react';

export default function StandaloneQuestionClient({ question: q }) {
  const [userChoice, setUserChoice] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const handleCopy = () => {
    const text = `Question (${q.examName} ${q.examYear} Q#${q.questionNo}):\n${q.stem}\n\nCorrect Answer: (${(q.correctLabel || '').toUpperCase()})\nhttps://www.upscgpt.in/prelims/pyq/${encodeURIComponent(q.dedupHash || q.id)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderFormattedStem = (stem) => {
    if (!stem) return null;
    const hasPairedStatements = stem.includes('Statement-I:') || stem.includes('Statement-I') || stem.includes('Statement 1:');
    const hasNumberedList = /\n\s*[1-4]\.\s+/.test(stem);

    if (hasPairedStatements || hasNumberedList) {
      const lines = stem.split('\n').map(l => l.trim()).filter(Boolean);
      const intro = lines[0];
      const middleStatements = lines.slice(1, -1);
      const conclusion = lines.length > 2 ? lines[lines.length - 1] : '';

      return (
        <div>
          <p className="pyq-text-title" style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', lineHeight: 1.5 }}>
            {intro}
          </p>
          <div className="pyq-statement-box pyq-inset" style={{
            borderRadius: '12px',
            padding: '18px 24px',
            marginBottom: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {middleStatements.map((stmt, idx) => (
              <div key={idx} style={{ fontSize: '16px', lineHeight: '1.6' }}>
                {stmt.startsWith('Statement-I:') || stmt.startsWith('Statement-II:') ? (
                  <>
                    <strong style={{ color: '#38bdf8', marginRight: '6px' }}>{stmt.split(':')[0]}:</strong>
                    <span className="pyq-text-body">{stmt.substring(stmt.indexOf(':') + 1)}</span>
                  </>
                ) : (
                  <span className="pyq-text-body">{stmt}</span>
                )}
              </div>
            ))}
          </div>
          {conclusion && (
            <p className="pyq-text-body" style={{ fontSize: '16px', fontWeight: '500', marginTop: '12px', lineHeight: 1.5 }}>
              {conclusion}
            </p>
          )}
        </div>
      );
    }

    return (
      <p className="pyq-text-title" style={{ fontSize: '18px', lineHeight: '1.65', whiteSpace: 'pre-line', margin: 0, fontWeight: '500' }}>
        {stem}
      </p>
    );
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px 80px 24px', fontFamily: 'var(--font-outfit), system-ui, -apple-system, sans-serif' }}>
      
      {/* Top Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <Link 
          href={`/prelims/pyq?topic=${encodeURIComponent(q.srcTopic || 'ALL')}`} 
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
          <ArrowLeft size={16} /> Back to PYQ Explorer
        </Link>

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
          <Compass size={15} /> Browse All Topics
        </Link>
      </div>

      {/* Main Question Container Card */}
      <div className="pyq-card" style={{
        borderRadius: '20px',
        padding: '36px',
        boxShadow: '0 10px 35px rgba(0, 0, 0, 0.15)',
        marginBottom: '28px'
      }}>
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

            <span style={{
              background: 'rgba(20, 184, 166, 0.12)',
              color: '#0d9488',
              border: '1px solid rgba(20, 184, 166, 0.3)',
              padding: '4px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700'
            }}>
              {q.srcTopic}
            </span>
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
          {renderFormattedStem(q.stem)}
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
        {!isRevealed ? (
          <div className="pyq-inset" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: '12px',
            padding: '14px 20px',
            marginBottom: '24px'
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
              {userChoice ? 'Check Answer ✓' : 'Reveal Answer ⌄'}
            </button>
          </div>
        ) : (
          <div id="answer" style={{ marginBottom: '24px' }}>
            {/* Verified Solution Box */}
            <div className="pyq-solution-box" style={{
              borderRadius: '14px',
              padding: '22px 26px',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
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
                  Correct Option: ({(q.correctLabel || '').toUpperCase()})
                </span>
              </div>

              <div style={{ fontSize: '14.5px', lineHeight: 1.65 }}>
                <p style={{ margin: '0 0 10px 0' }}>
                  <strong>Explanation:</strong> Under the official {q.examName} ({q.examYear}) key, Option <strong>({(q.correctLabel || '').toUpperCase()})</strong> is the verified correct answer.
                </p>
                <p style={{ margin: 0, color: '#0284c7', fontSize: '13px', fontFamily: 'monospace' }}>
                  Source: Official UPSC / CDS Exam Key • Indian Polity Archive
                </p>
              </div>
            </div>

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
          </div>
        )}

        {/* Card Footer Toolbar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '20px',
          fontSize: '13px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="pyq-text-muted">Subject:</span>
            <span className="pyq-badge-dark" style={{ padding: '3px 9px', borderRadius: '6px', fontWeight: '600' }}>
              {q.srcSubject}
            </span>
          </div>

          <Link
            href={`/prelims/pyq?topic=${encodeURIComponent(q.srcTopic || 'ALL')}`}
            style={{
              color: '#0284c7',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '13px'
            }}
          >
            Practice more "{q.srcTopic}" questions →
          </Link>
        </div>
      </div>

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

        [data-theme='sepia'] .pyq-card {
          background: #ebdcb9 !important;
          border: 1px solid rgba(139, 115, 85, 0.35) !important;
          color: #433422 !important;
          box-shadow: 0 4px 14px rgba(139, 115, 85, 0.12) !important;
        }
        [data-theme='sepia'] .pyq-inset {
          background: rgba(225, 215, 195, 0.75) !important;
          border: 1px solid rgba(139, 115, 85, 0.3) !important;
          color: #433422 !important;
        }
        [data-theme='sepia'] .pyq-text-title {
          color: #433422 !important;
        }
        [data-theme='sepia'] .pyq-text-body {
          color: #5c4731 !important;
        }
        [data-theme='sepia'] .pyq-text-muted {
          color: #8c7a6b !important;
        }
        [data-theme='sepia'] .pyq-badge-dark {
          background: rgba(139, 115, 85, 0.25) !important;
          color: #433422 !important;
        }
        [data-theme='sepia'] .pyq-solution-box {
          background: #e2d8bd !important;
          border: 1px solid rgba(22, 101, 52, 0.45) !important;
          color: #14532d !important;
        }
        [data-theme='sepia'] .pyq-solution-box p {
          color: #272017 !important;
        }
        [data-theme='sepia'] .pyq-option-item {
          background: rgba(225, 215, 195, 0.65) !important;
          border: 1px solid rgba(139, 115, 85, 0.25) !important;
          color: #433422 !important;
        }
        [data-theme='sepia'] .pyq-option-item:hover {
          border-color: #7c2d12 !important;
          color: #291a0c !important;
        }
        [data-theme='sepia'] .pyq-option-selected {
          background: rgba(124, 45, 18, 0.12) !important;
          border: 1px solid #7c2d12 !important;
          color: #431407 !important;
        }
        [data-theme='sepia'] .pyq-option-correct {
          background: rgba(22, 101, 52, 0.15) !important;
          border: 1px solid #15803d !important;
          color: #14532d !important;
        }
        [data-theme='sepia'] .pyq-option-incorrect {
          background: rgba(220, 38, 38, 0.12) !important;
          border: 1px solid #b91c1c !important;
          color: #7f1d1d !important;
        }
        [data-theme='sepia'] .pyq-statement-box strong {
          color: #7c2d12 !important;
        }
        [data-theme='sepia'] .pyq-statement-box span {
          color: #433422 !important;
        }
      `}</style>
    </div>
  );
}

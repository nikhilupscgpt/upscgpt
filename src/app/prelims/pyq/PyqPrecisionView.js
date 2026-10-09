'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronDown, 
  ChevronUp, 
  Check, 
  ArrowRight, 
  ArrowLeft 
} from 'lucide-react';
import './pyq-ui.css';

export default function PyqPrecisionView({ question: q }) {
  const analysis = q.analysis || {};
  const theme = analysis.themeInfo || {
    subject: "Environment",
    topic: "Wetlands",
    theme: "Ramsar mechanisms",
    currentIndex: 2,
    totalInTheme: 9
  };
  const meta = analysis.questionMeta || {
    examBadge: "UPSC Prelims 2014",
    qNo: `Q ${q.questionNo || '50'}`,
    qType: "Single correct",
    code: q.dedupHash || "ENV-2014-07"
  };

  // State
  const [selectedOpt, setSelectedOpt] = useState('a');
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [practiceChoice, setPracticeChoice] = useState(null);
  const [userNote, setUserNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  const why = analysis.whyCorrect || {};
  const concept = analysis.conceptCore || {};
  const current = analysis.currentDimension || {};
  const notAsked = analysis.notYetAsked || {};
  const related = analysis.relatedQuestions || [];
  const practice = analysis.practiceQuestion || {};

  const handleSelectOption = (lbl) => {
    setSelectedOpt(lbl);
  };

  const handlePracticeOption = (lbl) => {
    setPracticeChoice(lbl);
  };

  const handleSaveNote = () => {
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const scrollToAnchor = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="pqp-root">
      
      {/* Sub-header Bar */}
      <div className="pqp-subbar">
        <div className="pqp-breadcrumbs">
          <Link href={`/prelims/pyq`} className="pqp-breadcrumb-link">
            {theme.subject}
          </Link>
          <span>›</span>
          <Link href={`/prelims/pyq?topic=${encodeURIComponent(theme.topic)}`} className="pqp-breadcrumb-link">
            {theme.topic}
          </Link>
          <span>›</span>
          <span className="pqp-breadcrumb-current">{theme.theme}</span>
        </div>

        <div className="pqp-subbar-right">
          <span className="pqp-theme-count">
            Question {theme.currentIndex} of {theme.totalInTheme} in this theme
          </span>

          <div className="pqp-nav-group">
            <Link 
              href={theme.prevId ? `/prelims/pyq/${theme.prevId}` : '#'} 
              className="pqp-btn-prev"
            >
              ← Previous
            </Link>
            <Link 
              href={theme.nextId ? `/prelims/pyq/${theme.nextId}` : '#'} 
              className="pqp-btn-next"
            >
              Next →
            </Link>
          </div>
        </div>
      </div>

      {/* 2-Column Grid Layout */}
      <div className="pqp-layout">
        
        {/* Main Column */}
        <div className="pqp-main">
          
          {/* Question Box */}
          <div className="pqp-question-card">
            {/* Badges */}
            <div className="pqp-badges-row">
              <span className="pqp-badge-red">{meta.examBadge}</span>
              <span className="pqp-badge-dark">{meta.qNo}</span>
              <span className="pqp-badge-dark">{meta.qType}</span>
              <span className="pqp-badge-dark">{meta.code}</span>
            </div>

            {/* Stem */}
            <h1 className="pqp-stem">{q.stem}</h1>

            {/* Options */}
            <div className="pqp-options-list">
              {(q.options || []).map((opt) => {
                const isSelected = (selectedOpt || '').toLowerCase() === (opt.label || '').toLowerCase();
                const isCorrect = (q.correctLabel || 'a').toLowerCase() === (opt.label || '').toLowerCase();

                let optClass = 'pqp-opt-item';
                if (isSelected) {
                  optClass += isCorrect ? ' is-correct' : ' is-incorrect';
                }

                return (
                  <div 
                    key={opt.label} 
                    className={optClass}
                    onClick={() => handleSelectOption(opt.label)}
                  >
                    <span className="pqp-opt-circle">
                      {opt.label.toUpperCase()}
                    </span>
                    <span className="pqp-opt-text">{opt.text}</span>
                    {isSelected && isCorrect && (
                      <span className="pqp-opt-badge-right">Your answer · Correct</span>
                    )}
                    {isSelected && !isCorrect && (
                      <span className="pqp-opt-badge-right" style={{ color: '#ef4444' }}>Your answer · Incorrect</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Question Bar */}
            <div className="pqp-qfooter">
              <div className="pqp-qfooter-status">
                <Check size={16} />
                <span>Correct. Official answer ({ (q.correctLabel || 'a').toLowerCase() })</span>
              </div>
              <button 
                onClick={() => setSelectedOpt(null)}
                className="pqp-btn-tryagain"
              >
                Try again
              </button>
            </div>
          </div>

          {/* Section 1: Why (a) */}
          <div id="why" className="pqp-section" style={{ scrollMarginTop: '100px' }}>
            <h2 className="pqp-heading">Why ({ (why.label || 'a').toLowerCase() })</h2>
            <p className="pqp-exp-p">
              The Montreux Record lists Ramsar sites where ecological character <strong>has changed, is changing or is likely to change</strong> through technological developments, pollution or other human interference. It was created by Recommendation 4.8 at COP4, Montreux (1990). Option (a) is the Record's own definition.
            </p>

            {why.worthANote && why.worthANote.length > 0 && (
              <div className="pqp-note-box">
                <div className="pqp-nb-title">WORTH A NOTE</div>
                {why.worthANote.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="pqp-nb-item" 
                    dangerouslySetInnerHTML={{ __html: item }} 
                  />
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Concept core */}
          <div id="concept-core" className="pqp-section" style={{ scrollMarginTop: '100px' }}>
            <h2 className="pqp-heading">{concept.title || 'Concept core: Ramsar List vs Montreux Record'}</h2>
            
            {concept.rows && concept.rows.length > 0 && (
              <div className="pqp-table-box">
                <table className="pqp-table">
                  <thead>
                    <tr>
                      {(concept.headers || ['Parameter', 'Ramsar List', 'Montreux Record']).map((h, i) => (
                        <th key={i}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {concept.rows.map((row, idx) => (
                      <tr key={idx}>
                        <td className="param-col">{row.param}</td>
                        <td>{row.ramsar}</td>
                        <td>{row.montreux}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* India on the Record */}
            {concept.indiaOnRecord && concept.indiaOnRecord.length > 0 && (
              <div>
                <h3 className="pqp-subheading">India on the Record</h3>
                <div className="pqp-sites-list">
                  {concept.indiaOnRecord.map((site, idx) => (
                    <div key={idx} className="pqp-site-row">
                      <span className={site.status === 'LISTED' ? 'pqp-pill-listed' : 'pqp-pill-removed'}>
                        {site.status}
                      </span>
                      <span>
                        <strong style={{ color: '#f8fafc' }}>{site.site}</strong> — {site.detail}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Current dimension */}
          <div id="current-dimension" className="pqp-current-card" style={{ scrollMarginTop: '100px' }}>
            <div className="pqp-current-head">
              <h3 className="pqp-current-title">Current dimension</h3>
              {current.asOf && (
                <span className="pqp-current-date">{current.asOf}</span>
              )}
            </div>
            {current.bullets && (
              <ul className="pqp-current-list">
                {current.bullets.map((b, idx) => (
                  <li key={idx} dangerouslySetInnerHTML={{ __html: b }} />
                ))}
              </ul>
            )}
          </div>

          {/* Section 4: Not yet asked by UPSC */}
          <div id="not-yet-asked" className="pqp-accordion" style={{ scrollMarginTop: '100px' }}>
            <div 
              className="pqp-acc-head"
              onClick={() => setAccordionOpen(!accordionOpen)}
            >
              <h3 className="pqp-acc-title">Not yet asked by UPSC</h3>
              <div className="pqp-acc-label">
                <span>{notAsked.countLabel || '5 dimensions'}</span>
                {accordionOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>

            {accordionOpen && (
              <div className="pqp-acc-body">
                {(notAsked.items || []).map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ color: '#38bdf8', fontWeight: '700' }}>•</span>
                    <span dangerouslySetInnerHTML={{ __html: item }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 5: Related Questions */}
          <div id="related-questions" className="pqp-section" style={{ scrollMarginTop: '100px' }}>
            <h2 className="pqp-heading">Earlier and later questions on wetlands</h2>
            <div className="pqp-related-list">
              {related.map((rq, idx) => (
                <Link 
                  key={idx} 
                  href={`/prelims/pyq/${rq.targetId}`} 
                  className="pqp-related-item"
                >
                  <div className="pqp-related-left">
                    <span className="pqp-related-year">{rq.year}</span>
                    <span className="pqp-related-title">{rq.title}</span>
                  </div>
                  <div className="pqp-related-arrow">
                    <span>Open</span>
                    <ArrowRight size={13} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Section 6: Practice Question */}
          <div id="practice" className="pqp-practice-box" style={{ scrollMarginTop: '100px' }}>
            <h3 className="pqp-practice-title">Practice question</h3>
            <p className="pqp-practice-stem">{practice.stem}</p>

            <div className="pqp-practice-grid">
              {(practice.options || []).map((pOpt) => {
                const isSelected = practiceChoice === pOpt.label;
                const isCorrect = (practice.correctLabel || 'b').toLowerCase() === (pOpt.label || '').toLowerCase();
                
                let pClass = 'pqp-practice-opt';
                if (isSelected) {
                  pClass += isCorrect ? ' is-correct' : ' is-incorrect';
                }

                return (
                  <div 
                    key={pOpt.label}
                    className={pClass}
                    onClick={() => handlePracticeOption(pOpt.label)}
                  >
                    ({pOpt.label}) {pOpt.text}
                  </div>
                );
              })}
            </div>

            {practiceChoice && (
              <div className="pqp-practice-exp">
                {practiceChoice === practice.correctLabel ? (
                  <span><strong>Correct!</strong> {practice.explanation}</span>
                ) : (
                  <span><strong>Incorrect.</strong> The correct answer is ({practice.correctLabel}). {practice.explanation}</span>
                )}
              </div>
            )}
          </div>

          {/* Footnote references */}
          {analysis.references && (
            <div className="pqp-references">
              <strong>References:</strong> {analysis.references}
            </div>
          )}

        </div>

        {/* Right Sticky Sidebar */}
        <div className="pqp-sidebar">
          
          {/* Card 1: Theme Progress */}
          <div className="pqp-sidecard">
            <div className="pqp-sc-label">THEME PROGRESS</div>
            <div className="pqp-sc-title">{theme.theme} · {theme.currentIndex} of {theme.totalInTheme}</div>
            <div className="pqp-progress-track">
              <div 
                className="pqp-progress-fill" 
                style={{ width: `${Math.round((theme.currentIndex / theme.totalInTheme) * 100)}%` }} 
              />
            </div>
          </div>

          {/* Card 2: On This Page */}
          <div className="pqp-sidecard">
            <div className="pqp-sc-label">ON THIS PAGE</div>
            <div className="pqp-anchors-list">
              <a onClick={() => scrollToAnchor('why')} className="pqp-anchor-link">Why ({ (why.label || 'a').toLowerCase() })</a>
              <a onClick={() => scrollToAnchor('concept-core')} className="pqp-anchor-link">Concept core</a>
              <a onClick={() => scrollToAnchor('current-dimension')} className="pqp-anchor-link">Current dimension</a>
              <a onClick={() => scrollToAnchor('not-yet-asked')} className="pqp-anchor-link">Not yet asked</a>
              <a onClick={() => scrollToAnchor('related-questions')} className="pqp-anchor-link">Related questions</a>
              <a onClick={() => scrollToAnchor('practice')} className="pqp-anchor-link">Practice</a>
            </div>
          </div>

          {/* Card 3: My Note */}
          <div className="pqp-sidecard">
            <div className="pqp-sc-label">MY NOTE</div>
            <textarea 
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              placeholder="One line you want to remember..."
              className="pqp-note-textarea"
            />
            <button 
              onClick={handleSaveNote}
              className="pqp-btn-revision"
            >
              {noteSaved ? '✓ Saved for revision' : 'Mark for revision'}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Flag, CheckCircle2, XCircle, BookOpen, RotateCcw, Award, Clock, Target, HelpCircle } from 'lucide-react';
import StemView from '../StemView';
import { usePyqStore } from '../pyqStore';
import '../pyq-ui.css';

const MARKS_RIGHT = 2;
const MARKS_WRONG = 2 / 3;

function fmt(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function PracticeClient({ questions, mode: initialMode = 'exam', title, meta, backHref }) {
  const total = questions.length;
  const [activeMode, setActiveMode] = useState(initialMode); // 'practice' | 'exam'
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});       // id -> label
  const [checked, setChecked] = useState({});       // id -> boolean (for practice mode)
  const [marked, setMarked] = useState({});         // id -> boolean
  const [visited, setVisited] = useState({ 0: true });
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState('test');       // 'test' | 'result'
  const [confirm, setConfirm] = useState(false);
  const [reviewFilter, setReviewFilter] = useState('ALL');

  const { recordAttempt, recordMany } = usePyqStore();

  const q = questions[idx];
  const answeredCount = Object.keys(answers).length;
  const suggestedMin = Math.max(1, Math.ceil(total * 1.2));

  /* timer */
  useEffect(() => {
    if (phase !== 'test' || total === 0) return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [phase, total]);

  /* warn before leaving a test in progress */
  useEffect(() => {
    if (phase !== 'test' || answeredCount === 0) return;
    const h = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [phase, answeredCount]);

  const goTo = useCallback((i) => {
    if (i < 0 || i >= total) return;
    setIdx(i);
    setVisited(v => ({ ...v, [i]: true }));
  }, [total]);

  const choose = useCallback((label) => {
    if (!q) return;
    // In practice mode, if already checked, do not allow changing
    if (activeMode === 'practice' && checked[q.id]) return;

    setAnswers(a => ({ ...a, [q.id]: label }));
  }, [q, activeMode, checked]);

  const clearAnswer = () => {
    if (activeMode === 'practice' && checked[q.id]) return;
    setAnswers(a => { const n = { ...a }; delete n[q.id]; return n; });
  };

  /* In practice mode: verify answer immediately */
  const checkPracticeAnswer = () => {
    if (!q || !answers[q.id] || checked[q.id]) return;
    const isOk = answers[q.id] === q.correctLabel;
    setChecked(prev => ({ ...prev, [q.id]: true }));
    recordAttempt(q.id, answers[q.id], isOk);
  };

  const saveNext = () => {
    if (idx >= total - 1) {
      if (activeMode === 'practice') {
        finishPractice();
      } else {
        setConfirm(true);
      }
    } else {
      goTo(idx + 1);
    }
  };

  /* keyboard shortcuts */
  useEffect(() => {
    if (phase !== 'test' || confirm) return;
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      const k = e.key.toLowerCase();
      if (['a', 'b', 'c', 'd'].includes(k)) choose(k);
      else if (e.key === 'ArrowRight') goTo(idx + 1);
      else if (e.key === 'ArrowLeft') goTo(idx - 1);
      else if (e.key === 'Enter' && activeMode === 'practice' && !checked[q?.id] && answers[q?.id]) {
        checkPracticeAnswer();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, confirm, idx, choose, goTo, activeMode, checked, answers, q]);

  const submitExam = () => {
    const entries = {};
    for (const qq of questions) {
      const sel = answers[qq.id];
      if (sel) entries[qq.id] = { sel, ok: sel === qq.correctLabel };
    }
    recordMany(entries);
    setConfirm(false);
    setPhase('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const finishPractice = () => {
    // Record any unchecked but selected answers
    const entries = {};
    for (const qq of questions) {
      const sel = answers[qq.id];
      if (sel && !checked[qq.id]) {
        entries[qq.id] = { sel, ok: sel === qq.correctLabel };
      }
    }
    if (Object.keys(entries).length > 0) {
      recordMany(entries);
    }
    setPhase('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* results computation */
  const result = useMemo(() => {
    let right = 0, wrong = 0, skipped = 0;
    for (const qq of questions) {
      const sel = answers[qq.id];
      if (!sel) skipped++;
      else if (sel === qq.correctLabel) right++;
      else wrong++;
    }
    const score = right * MARKS_RIGHT - wrong * MARKS_WRONG;
    const attempted = right + wrong;
    return {
      right, wrong, skipped,
      score: Math.round(score * 100) / 100,
      max: total * MARKS_RIGHT,
      accuracy: attempted ? Math.round((right / attempted) * 100) : 0,
    };
  }, [answers, questions, total]);

  /* ---------- empty ---------- */
  if (total === 0) {
    return (
      <div className="pq-root">
        <div className="pp-shell">
          <div className="pq-card pq-empty">
            <h3>No gradable questions in this set</h3>
            <p>Pick a different topic or filter in the explorer.</p>
            <Link href="/prelims/pyq" className="pq-btn pq-btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Back to explorer</Link>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- results screen ---------- */
  if (phase === 'result') {
    const list = questions.filter(qq => {
      const sel = answers[qq.id];
      const ok = sel === qq.correctLabel;
      if (reviewFilter === 'WRONG') return sel && !ok;
      if (reviewFilter === 'CORRECT') return sel && ok;
      if (reviewFilter === 'SKIPPED') return !sel;
      return true;
    });

    const wrongQuestions = questions.filter(qq => answers[qq.id] && answers[qq.id] !== qq.correctLabel);
    const wrongIds = wrongQuestions.map(qq => qq.id);

    return (
      <div className="pq-root">
        <div className="pp-shell">
          {/* Dr Shivin style Hero Card */}
          <div className="pq-card pr-hero">
            <div className="pr-score">
              <b>{result.score}</b>
              <span>of {result.max} marks</span>
            </div>
            <div className="pr-tiles">
              <div className="pr-tile"><b style={{ color: 'var(--pq-ok)' }}>{result.right}</b><span>Correct</span></div>
              <div className="pr-tile"><b style={{ color: 'var(--pq-bad)' }}>{result.wrong}</b><span>Incorrect</span></div>
              <div className="pr-tile"><b>{result.skipped}</b><span>Skipped</span></div>
              <div className="pr-tile"><b>{result.accuracy}%</b><span>Accuracy</span></div>
              <div className="pr-tile"><b>{fmt(elapsed)}</b><span>Time</span></div>
            </div>

            {/* Mistake Notebook Banner */}
            {wrongIds.length > 0 && (
              <div className="pr-notebook-banner">
                <div className="pr-nb-icon">
                  <BookOpen size={22} />
                </div>
                <div className="pr-nb-text">
                  <b>{wrongIds.length} question{wrongIds.length === 1 ? '' : 's'} added to your Mistake Notebook</b>
                  <span>They will stay in your notebook until you get them right in a smart revision test.</span>
                </div>
                <div className="pr-nb-actions">
                  <Link
                    href={`/prelims/pyq/practice?ids=${wrongIds.join(',')}&mode=practice`}
                    className="pq-btn pq-btn-primary"
                    style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
                  >
                    <RotateCcw size={14} style={{ marginRight: 5, verticalAlign: -2 }} />
                    Retest {wrongIds.length} mistakes
                  </Link>
                  <Link
                    href="/prelims/pyq?show=MISTAKES"
                    className="pq-btn"
                    style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
                  >
                    Open Notebook
                  </Link>
                </div>
              </div>
            )}

            <div className="pr-cta">
              <Link href={backHref} className="pq-btn" style={{ textDecoration: 'none' }}>← Back to explorer</Link>
              <button className="pq-btn pq-btn-primary" onClick={() => window.location.reload()}>Practice again (new shuffle)</button>
              {wrongIds.length > 0 && (
                <Link
                  href={`/prelims/pyq/practice?ids=${wrongIds.join(',')}&mode=practice`}
                  className="pq-btn" style={{ textDecoration: 'none' }}
                >
                  Retest {wrongIds.length} mistakes in Practice Mode
                </Link>
              )}
            </div>

            <p style={{ gridColumn: '1 / -1', margin: '4px 0 0', fontSize: 11.5, color: 'var(--pq-muted)' }}>
              UPSC marking scheme: +2 per correct, −⅓ of the marks (−0.67) per wrong answer, 0 for unattempted.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="pq-card pq-filters">
            <div className="pq-fgroup">
              <span className="pq-flabel">Filter Review</span>
              <div className="pq-seg">
                {[
                  ['ALL', `All ${total}`],
                  ['WRONG', `Wrong ${result.wrong}`],
                  ['CORRECT', `Correct ${result.right}`],
                  ['SKIPPED', `Skipped ${result.skipped}`]
                ].map(([v, l]) => (
                  <button key={v} className={reviewFilter === v ? 'is-active' : ''} onClick={() => setReviewFilter(v)}>{l}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Question List Review */}
          {list.map((qq) => {
            const sel = answers[qq.id];
            const ok = sel === qq.correctLabel;
            const num = questions.indexOf(qq) + 1;
            const correctOpt = qq.options.find(o => o.label === qq.correctLabel);

            return (
              <article key={qq.id} className={`pq-card pq-qcard ${sel ? (ok ? 'is-ok' : 'is-bad') : ''}`}>
                <div className="pq-qhead">
                  <div className="pq-tags">
                    <span className="pq-tag pq-tag-q">Q{num}</span>
                    <span className="pq-tag pq-tag-exam">{qq.examName} {qq.examYear}</span>
                    <span className="pq-tag pq-tag-topic">{qq.srcTopic}</span>
                  </div>
                  <span className={`pr-verdict-tag ${sel ? (ok ? 'ok' : 'bad') : 'skip'}`}>
                    {sel ? (ok ? `+${MARKS_RIGHT}` : `−${MARKS_WRONG.toFixed(2)}`) : 'Skipped'}
                  </span>
                </div>
                <StemView stem={qq.stem} />
                <div className="pq-opts">
                  {qq.options.map(o => {
                    let cls = 'pq-opt';
                    if (o.label === qq.correctLabel) cls += ' is-correct';
                    else if (o.label === sel) cls += ' is-wrong';
                    else cls += ' is-faded';
                    return (
                      <div key={o.label} className={cls} style={{ cursor: 'default' }}>
                        <span className="pq-opt-l">{o.label.toUpperCase()}</span>
                        <span className="pq-opt-t">{o.text}</span>
                      </div>
                    );
                  })}
                </div>
                <div className={`pq-verdict ${sel ? (ok ? 'is-ok' : 'is-bad') : ''}`}>
                  {sel
                    ? ok
                      ? <b>✓ You got it right — ({qq.correctLabel.toUpperCase()})</b>
                      : <><b>✗ You chose ({sel.toUpperCase()}).</b> Correct answer: <b>({qq.correctLabel.toUpperCase()})</b>{correctOpt ? ` — ${correctOpt.text}` : ''}</>
                    : <><b>Skipped.</b> Correct answer: <b>({qq.correctLabel.toUpperCase()})</b>{correctOpt ? ` — ${correctOpt.text}` : ''}</>}
                  {qq.explanation && <div className="pq-verdict-exp">{qq.explanation}</div>}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    );
  }

  /* ---------- test / practice screen ---------- */
  const isPractice = activeMode === 'practice';
  const isCurrentChecked = isPractice && !!checked[q?.id];
  const isCurrentOk = isCurrentChecked && answers[q?.id] === q?.correctLabel;
  const correctOpt = q?.options.find(o => o.label === q?.correctLabel);

  const statusOf = (i) => {
    const item = questions[i];
    if (isPractice) {
      if (checked[item.id]) {
        return answers[item.id] === item.correctLabel ? 'is-practice-correct' : 'is-practice-wrong';
      }
      if (answers[item.id]) return 'is-answered';
      if (visited[i] && i !== idx) return 'is-skipped';
      return '';
    } else {
      if (answers[item.id]) return 'is-answered';
      if (visited[i] && i !== idx) return 'is-skipped';
      return '';
    }
  };

  const unanswered = total - answeredCount;
  const markedCount = Object.keys(marked).length;

  return (
    <div className="pq-root">
      <div className="pp-shell">
        <header className="pp-bar">
          <Link href={backHref} className="pp-back"><ArrowLeft size={15} /> Explorer</Link>

          <div className="pp-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <b>{title}</b>
              <span className={`pp-mode-badge ${isPractice ? 'is-practice' : 'is-exam'}`}>
                {isPractice ? 'Practice Mode' : 'Exam Simulation'}
              </span>
            </div>
            <span>{total} questions · {meta} · ~{suggestedMin} min suggested</span>
          </div>

          <div className="pp-timer" aria-label="Elapsed time">{fmt(elapsed)}</div>

          {isPractice ? (
            <button className="pp-submit" onClick={finishPractice}>Finish Practice</button>
          ) : (
            <button className="pp-submit" onClick={() => setConfirm(true)}>Submit test</button>
          )}
        </header>

        <div className="pp-grid">
          {/* Question Panel */}
          <section className="pq-card pp-qpanel">
            <div className="pp-qtop">
              <span className="pp-qno">Question {idx + 1} of {total}</span>
              <div className="pq-tags">
                <span className="pq-tag pq-tag-exam">{q.examName} {q.examYear}</span>
                <span className="pq-tag pq-tag-topic" title={q.srcTopic}>{q.srcTopic}</span>
              </div>
            </div>

            <StemView stem={q.stem} size="lg" />

            <div className="pq-opts" role="radiogroup" aria-label="Answer options">
              {q.options.map(o => {
                let cls = 'pq-opt';
                const isSelected = answers[q.id] === o.label;

                if (isPractice && isCurrentChecked) {
                  if (o.label === q.correctLabel) {
                    cls += ' is-correct';
                  } else if (isSelected) {
                    cls += ' is-wrong';
                  } else {
                    cls += ' is-faded';
                  }
                } else if (isSelected) {
                  cls += ' is-selected';
                }

                return (
                  <button
                    key={o.label}
                    role="radio"
                    aria-checked={isSelected}
                    disabled={isCurrentChecked}
                    className={cls}
                    onClick={() => choose(o.label)}
                  >
                    <span className="pq-opt-l">{o.label.toUpperCase()}</span>
                    <span className="pq-opt-t">{o.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Instant Feedback in Practice Mode */}
            {isPractice && isCurrentChecked && (
              <div className={`pq-verdict ${isCurrentOk ? 'is-ok' : 'is-bad'}`} style={{ marginTop: 16 }}>
                {isCurrentOk ? (
                  <b>✓ Correct! Answer: ({q.correctLabel.toUpperCase()}){correctOpt ? ` — ${correctOpt.text}` : ''}</b>
                ) : (
                  <><b>✗ Incorrect.</b> You selected ({answers[q.id]?.toUpperCase()}). Correct answer: <b>({q.correctLabel.toUpperCase()})</b>{correctOpt ? ` — ${correctOpt.text}` : ''}</>
                )}
                {q.explanation && (
                  <div className="pq-verdict-exp" style={{ marginTop: 8 }}>
                    {q.explanation}
                  </div>
                )}
              </div>
            )}

            <div className="pp-actions">
              <div className="pp-actions-l">
                <button className="pq-btn" disabled={idx === 0} onClick={() => goTo(idx - 1)}>Previous</button>

                {!isPractice && (
                  <button
                    className={`pq-btn pp-btn-mark ${marked[q.id] ? 'is-on' : ''}`}
                    onClick={() => setMarked(m => { const n = { ...m }; if (n[q.id]) delete n[q.id]; else n[q.id] = true; return n; })}
                  >
                    <Flag size={12} style={{ verticalAlign: -1, marginRight: 5 }} />
                    {marked[q.id] ? 'Marked' : 'Mark for review'}
                  </button>
                )}

                {(!isPractice || !isCurrentChecked) && (
                  <button className="pq-btn" disabled={!answers[q.id]} onClick={clearAnswer}>Clear</button>
                )}
              </div>

              {isPractice ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  {!isCurrentChecked ? (
                    <button
                      className="pq-btn pq-btn-primary"
                      disabled={!answers[q.id]}
                      onClick={checkPracticeAnswer}
                    >
                      Check Answer
                    </button>
                  ) : (
                    <button className="pq-btn pq-btn-primary" onClick={saveNext}>
                      {idx >= total - 1 ? 'Finish Practice' : 'Next Question →'}
                    </button>
                  )}
                </div>
              ) : (
                <button className="pq-btn pq-btn-primary" onClick={saveNext}>
                  {idx >= total - 1 ? 'Save & finish' : 'Save & next'}
                </button>
              )}
            </div>
          </section>

          {/* Question Palette */}
          <aside className="pq-card pp-pal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 style={{ margin: 0 }}>Question palette</h4>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--pq-muted)' }}>
                {answeredCount}/{total} Done
              </span>
            </div>

            <div className="pp-pal-grid">
              {questions.map((qq, i) => (
                <button
                  key={qq.id}
                  className={`pp-pn ${statusOf(i)} ${i === idx ? 'is-current' : ''} ${marked[qq.id] ? 'is-marked' : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={`Question ${i + 1}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {isPractice ? (
              <div className="pp-legend">
                <span><i style={{ background: 'var(--pq-ok)', borderColor: 'var(--pq-ok)' }} />Correct</span>
                <span><i style={{ background: 'var(--pq-bad)', borderColor: 'var(--pq-bad)' }} />Incorrect</span>
                <span><i style={{ borderColor: 'var(--pq-gold)' }} />Skipped</span>
                <span><i />Not seen</span>
              </div>
            ) : (
              <div className="pp-legend">
                <span><i style={{ background: 'var(--pq-ok)', borderColor: 'var(--pq-ok)' }} />Answered {answeredCount}</span>
                <span><i style={{ background: 'var(--pq-mark)', borderColor: 'var(--pq-mark)' }} />Marked {markedCount}</span>
                <span><i style={{ borderColor: 'var(--pq-gold)' }} />Skipped {Object.keys(visited).filter(k => !answers[questions[k]?.id] && Number(k) !== idx).length}</span>
                <span><i />Not seen {total - Object.keys(visited).length}</span>
              </div>
            )}

            <div className="pp-note">
              {isPractice ? (
                <>
                  <b>Practice Mode:</b> Select an option and click <b>Check Answer</b> for instant solutions.
                  <br />Shortcuts: <b>A–D</b> to pick, <b>Enter</b> to verify, <b>←/→</b> to navigate.
                </>
              ) : (
                <>
                  Answers stay hidden until you submit — just like the real UPSC exam.
                  <br />Shortcuts: <b>A–D</b> to choose, <b>←/→</b> to move.
                </>
              )}
            </div>
          </aside>
        </div>
      </div>

      {confirm && (
        <div className="pp-modal-bg" onClick={() => setConfirm(false)}>
          <div className="pp-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Submit test">
            <h3>Submit this test?</h3>
            <p>
              You’ve answered <b>{answeredCount}</b> of {total}.{' '}
              {unanswered > 0 ? `${unanswered} unanswered question${unanswered === 1 ? '' : 's'} will count as skipped (no negative marks).` : 'All questions answered.'}
              {markedCount > 0 ? ` ${markedCount} marked for review.` : ''}
            </p>
            <div className="pp-modal-actions">
              <button className="pq-btn" onClick={() => setConfirm(false)}>Keep going</button>
              <button className="pq-btn pq-btn-primary" onClick={submitExam}>Submit &amp; see answers</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

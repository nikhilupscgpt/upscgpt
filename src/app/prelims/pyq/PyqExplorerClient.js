'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Bookmark,
  ArrowRight,
  ArrowLeft,
  X,
  ExternalLink,
  Sparkles,
  BookOpen,
  Play,
  RotateCcw,
} from 'lucide-react';
import StemView from './StemView';
import QuizSetupModal from './QuizSetupModal';
import { usePyqStore } from './pyqStore';
import { SUBJECT_ORDER, SUBJECT_SHORT } from './topicGroups';
import { generateQuestionSlug } from '@/lib/pyqSlug';
import './pyq-ui.css';

const PAGE_SIZE = 10;
const YEAR_BUCKETS = [
  ['ALL', 'All'],
  ['2020-2026', '2020–26'],
  ['2015-2019', '2015–19'],
  ['2011-2014', '2011–14'],
];

const SUBJECT_META = {
  'Indian Polity': { icon: '🏛️', color: '#3b82f6' },
  'Economy': { icon: '📈', color: '#10b981' },
  'Geography': { icon: '🌍', color: '#06b6d4' },
  'Environment': { icon: '🌿', color: '#22c55e' },
  'Science & Technology': { icon: '🔬', color: '#8b5cf6' },
  'Modern History': { icon: '📜', color: '#f59e0b' },
  'Ancient History': { icon: '🏺', color: '#d97706' },
  'Medieval History': { icon: '🏰', color: '#b45309' },
  'Art & Culture': { icon: '🎨', color: '#ec4899' },
  'Agriculture': { icon: '🌾', color: '#84cc16' },
};

function inBucket(year, bucket) {
  if (bucket === 'ALL') return true;
  if (/^\d{4}$/.test(bucket)) return year === Number(bucket);
  const [lo, hi] = bucket.split('-').map(Number);
  return year >= lo && year <= hi;
}

function difficultyOf(q) {
  const s = q.stem || '';
  if (/Statement[\s-]*(I|1)\b|How many of the (above|following)/i.test(s)) return { label: 'Moderate', cls: 'pq-tag-mod' };
  if (s.length > 260) return { label: 'Tricky', cls: 'pq-tag-hard' };
  return { label: 'Easy', cls: 'pq-tag-easy' };
}

export default function PyqExplorerClient({ initialQuestions }) {
  const [subject, setSubject] = useState('ALL');
  const [topic, setTopic] = useState('ALL');
  const [exam, setExam] = useState('ALL');
  const [years, setYears] = useState('ALL');
  const [show, setShow] = useState('ALL');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [revealed, setRevealed] = useState({});
  const [urlReady, setUrlReady] = useState(false);
  const searchRef = useRef(null);
  const feedTopRef = useRef(null);

  const { attempts, bookmarks, mistakes, recordAttempt, clearAttempt, toggleBookmark } = usePyqStore();

  /* ---- URL <-> state ---- */
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const q = p.get('q');
    const s = p.get('show');
    if (q) {
      setQuery(q);
    } else {
      if (p.get('subject')) setSubject(p.get('subject'));
      if (p.get('topic')) setTopic(p.get('topic'));
      if (p.get('exam')) setExam(p.get('exam'));
      if (p.get('year')) setYears(p.get('year'));
    }
    if (s) setShow(s);
    setUrlReady(true);
  }, []);

  useEffect(() => {
    if (!urlReady) return;
    const p = new URLSearchParams();
    if (query.trim()) {
      p.set('q', query.trim());
    } else {
      if (subject !== 'ALL') p.set('subject', subject);
      if (topic !== 'ALL') p.set('topic', topic);
      if (exam !== 'ALL') p.set('exam', exam);
      if (years !== 'ALL') p.set('year', years);
      if (show !== 'ALL') p.set('show', show);
    }
    const qs = p.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [urlReady, query, subject, topic, exam, years, show]);

  /* ⌘K / Ctrl+K focuses search */
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* ---- Derived data ---- */
  const subjectStats = useMemo(() => {
    const map = new Map();
    for (const q of initialQuestions) {
      if (!map.has(q.srcSubject)) {
        map.set(q.srcSubject, { count: 0, topics: new Map() });
      }
      const entry = map.get(q.srcSubject);
      entry.count++;
      if (q.srcTopic) {
        entry.topics.set(q.srcTopic, (entry.topics.get(q.srcTopic) || 0) + 1);
      }
    }

    const order = SUBJECT_ORDER.filter(s => map.has(s));
    const extra = [...map.keys()].filter(s => !SUBJECT_ORDER.includes(s));
    return [...order, ...extra].map(s => {
      const data = map.get(s);
      const topTopics = [...data.topics.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([t]) => t);
      return {
        name: s,
        short: SUBJECT_SHORT[s] || s,
        count: data.count,
        topTopics,
        meta: SUBJECT_META[s] || { icon: '📚', color: '#64748b' },
      };
    });
  }, [initialQuestions]);

  const searching = query.trim().length > 0;
  const mistakeCount = Object.keys(mistakes).length;

  const showOptions = useMemo(() => [
    ['ALL', 'All'],
    ['NEW', 'Not attempted'],
    ['WRONG', 'Wrong'],
    ['MISTAKES', `Notebook (${mistakeCount})`],
    ['MARKED', 'Bookmarked'],
  ], [mistakeCount]);

  // Questions matching active subject & search
  const scope = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return initialQuestions.filter(q => {
      if (needle) {
        return (
          (q.stem || '').toLowerCase().includes(needle) ||
          (q.srcTopic || '').toLowerCase().includes(needle) ||
          (q.srcSubject || '').toLowerCase().includes(needle) ||
          (q.options || []).some(o => (o.text || '').toLowerCase().includes(needle))
        );
      }
      if (subject !== 'ALL' && q.srcSubject !== subject) return false;
      if (topic !== 'ALL' && q.srcTopic !== topic) return false;
      if (exam !== 'ALL' && !(q.examName || '').includes(exam === 'UPSC CSE' ? 'CSE' : 'CDS')) return false;
      if (!inBucket(q.examYear, years)) return false;
      return true;
    });
  }, [initialQuestions, query, subject, topic, exam, years]);

  const filtered = useMemo(() => {
    if (show === 'ALL') return scope;
    return scope.filter(q => {
      const a = attempts[q.id];
      if (show === 'NEW') return !a;
      if (show === 'WRONG') return a && !a.ok;
      if (show === 'MISTAKES') return !!mistakes[q.id];
      if (show === 'MARKED') return !!bookmarks[q.id];
      return true;
    });
  }, [scope, show, attempts, mistakes, bookmarks]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  // Topics for the active subject dropdown
  const activeSubjectTopics = useMemo(() => {
    if (subject === 'ALL') return [];
    const m = new Map();
    for (const q of initialQuestions) {
      if (q.srcSubject === subject && q.srcTopic) {
        m.set(q.srcTopic, (m.get(q.srcTopic) || 0) + 1);
      }
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [initialQuestions, subject]);

  const activeSubjectMistakesCount = useMemo(() => {
    if (subject === 'ALL') return mistakeCount;
    return initialQuestions.filter(q => q.srcSubject === subject && mistakes[q.id]).length;
  }, [initialQuestions, subject, mistakes, mistakeCount]);

  /* ---- Handlers ---- */
  const resetPage = () => setPage(1);

  const selectSubject = (s) => {
    setSubject(s);
    setTopic('ALL');
    setShow('ALL');
    setQuery('');
    resetPage();
  };

  const backToAllSubjects = () => {
    setSubject('ALL');
    setTopic('ALL');
    setShow('ALL');
    setQuery('');
    resetPage();
  };

  const onSearch = (v) => {
    setQuery(v);
    if (v.trim()) {
      setTopic('ALL');
      setExam('ALL');
      setYears('ALL');
      setShow('ALL');
    }
    resetPage();
  };

  const goPage = (n) => {
    setPage(n);
    feedTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const onPick = useCallback((q, label) => {
    if (attempts[q.id]) return;
    if (!q.correctLabel) {
      setRevealed(r => ({ ...r, [q.id]: true }));
      return;
    }
    recordAttempt(q.id, label, label === q.correctLabel);
  }, [attempts, recordAttempt]);

  const tryAgain = (q) => {
    clearAttempt(q.id);
    setRevealed(r => { const n = { ...r }; delete n[q.id]; return n; });
  };

  /* URL for instant practice mode */
  const practiceUrl = useMemo(() => {
    const p = new URLSearchParams();
    p.set('mode', 'practice');
    p.set('n', '20');
    if (subject !== 'ALL') p.set('subject', subject);
    if (topic !== 'ALL') p.set('topic', topic);
    if (exam !== 'ALL') p.set('exam', exam);
    if (years !== 'ALL') p.set('years', years);
    return `/prelims/pyq/practice?${p.toString()}`;
  }, [subject, topic, exam, years]);

  // =========================================================================
  // VIEW 1: SUBJECT HUB (When no subject is picked and not searching)
  // =========================================================================
  if (subject === 'ALL' && !searching) {
    return (
      <div className="pq-root">
        <div className="pq-hub-shell">
          <header className="pq-hub-header">
            <div className="pq-hub-badge">
              <Sparkles size={13} /> Prelims PYQ Explorer · CSE &amp; CDS 2011–2026
            </div>
            <h1 className="pq-hub-title">Select a Subject to Practice</h1>
            <p className="pq-hub-sub">
              2,528 authentic UPSC questions organized topic-by-topic. Pick a subject to study distraction-free, or build a customized test.
            </p>

            <div className="pq-hub-toolbar">
              <div className="pq-search" style={{ flex: 1, maxWidth: 520, margin: 0 }}>
                <Search size={18} />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={e => onSearch(e.target.value)}
                  placeholder="Search any keyword or article — e.g. Article 21, Money Bill, Ramsar"
                  aria-label="Search previous year questions"
                />
              </div>

              <button
                className="pq-btn pq-btn-primary"
                style={{ fontWeight: 800, padding: '11px 18px', display: 'inline-flex', alignItems: 'center', gap: 7 }}
                onClick={() => setQuizModalOpen(true)}
              >
                <Sparkles size={15} /> Custom Quiz Builder
              </button>

              {mistakeCount > 0 && (
                <Link
                  href={`/prelims/pyq/practice?ids=${Object.keys(mistakes).slice(0, 50).join(',')}&mode=practice`}
                  className="pq-btn"
                  style={{ textDecoration: 'none', fontWeight: 800, padding: '11px 18px', display: 'inline-flex', alignItems: 'center', gap: 7, borderColor: 'var(--pq-gold)', color: 'var(--pq-gold)' }}
                >
                  <RotateCcw size={15} /> Revise {mistakeCount} Mistakes
                </Link>
              )}
            </div>
          </header>

          {/* Subject Cards Grid */}
          <div className="pq-hub-grid">
            {subjectStats.map(s => (
              <div key={s.name} className="pq-subject-card">
                <div className="pq-sc-top">
                  <div className="pq-sc-info">
                    <h2 className="pq-sc-name">{s.name}</h2>
                    <span className="pq-sc-count">{s.count} Previous Year Questions</span>
                  </div>
                  <span className="pq-sc-icon" aria-hidden="true">{s.meta.icon}</span>
                </div>

                <div className="pq-sc-topics">
                  {s.topTopics.map(t => (
                    <span key={t} className="pq-sc-topic-chip">{t}</span>
                  ))}
                </div>

                <div className="pq-sc-actions">
                  <button
                    className="pq-sc-btn"
                    onClick={() => selectSubject(s.name)}
                  >
                    Browse Questions
                  </button>
                  <Link
                    href={`/prelims/pyq/practice?subject=${encodeURIComponent(s.name)}&mode=practice&n=20`}
                    className="pq-sc-btn pq-sc-btn-primary"
                  >
                    <Play size={13} fill="currentColor" /> Practice (1 by 1)
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <QuizSetupModal
          isOpen={quizModalOpen}
          onClose={() => setQuizModalOpen(false)}
          questions={initialQuestions}
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: FOCUSED SUBJECT VIEW (Simple, clutter-free single column!)
  // =========================================================================
  const subjectMeta = SUBJECT_META[subject] || { icon: '📚', color: '#64748b' };
  const totalSubjectQs = initialQuestions.filter(q => q.srcSubject === subject).length;

  return (
    <div className="pq-root">
      <div className="pq-focus-shell">
        {/* Header */}
        <div className="pq-focus-head">
          <div className="pq-focus-top">
            <button className="pq-back-btn" onClick={backToAllSubjects}>
              <ArrowLeft size={14} /> Back to All Subjects
            </button>
            <span className="pq-focus-meta">UPSC CSE &amp; CDS 2011–2026</span>
          </div>

          <div className="pq-focus-title-row">
            <div>
              <h1 className="pq-focus-title">
                <span>{subjectMeta.icon}</span>
                {searching ? `Search: “${query}”` : subject}
              </h1>
              <span style={{ fontSize: 13, color: 'var(--pq-muted)', fontWeight: 600, display: 'block', marginTop: 4 }}>
                {filtered.length} questions {topic !== 'ALL' ? `· Topic: ${topic}` : ''}
              </span>
            </div>

            <div className="pq-focus-actions">
              <Link
                href={practiceUrl}
                className="pq-btn pq-btn-primary"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 800 }}
              >
                <Play size={14} fill="currentColor" /> Attempt in Practice Mode
              </Link>

              <button
                className="pq-btn"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                onClick={() => setQuizModalOpen(true)}
              >
                <Sparkles size={14} /> Build Quiz
              </button>

              {activeSubjectMistakesCount > 0 && (
                <button
                  className={`pq-btn ${show === 'MISTAKES' ? 'is-active' : ''}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderColor: 'var(--pq-gold)', color: 'var(--pq-gold)' }}
                  onClick={() => { setShow(show === 'MISTAKES' ? 'ALL' : 'MISTAKES'); resetPage(); }}
                >
                  <BookOpen size={14} /> Notebook ({activeSubjectMistakesCount})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Compact Single-Row Filter Bar */}
        <div className="pq-focus-filters">
          {activeSubjectTopics.length > 0 && (
            <div className="pq-fgroup" style={{ flex: 1, minWidth: 200 }}>
              <span className="pq-flabel">Topic</span>
              <select
                className="pq-topic-select"
                value={topic}
                onChange={e => { setTopic(e.target.value); resetPage(); }}
              >
                <option value="ALL">All {subject} topics ({totalSubjectQs})</option>
                {activeSubjectTopics.map(([t, count]) => (
                  <option key={t} value={t}>{t} ({count})</option>
                ))}
              </select>
            </div>
          )}

          <div className="pq-fgroup">
            <span className="pq-flabel">Exam</span>
            <div className="pq-seg">
              {[['ALL', 'All'], ['UPSC CSE', 'CSE'], ['CDS', 'CDS']].map(([v, l]) => (
                <button key={v} className={exam === v ? 'is-active' : ''} onClick={() => { setExam(v); resetPage(); }}>{l}</button>
              ))}
            </div>
          </div>

          <div className="pq-fgroup">
            <span className="pq-flabel">Years</span>
            <div className="pq-seg">
              {YEAR_BUCKETS.map(([v, l]) => (
                <button key={v} className={years === v ? 'is-active' : ''} onClick={() => { setYears(v); resetPage(); }}>{l}</button>
              ))}
            </div>
          </div>

          <div className="pq-fgroup">
            <span className="pq-flabel">Filter</span>
            <div className="pq-seg">
              {showOptions.map(([v, l]) => (
                <button key={v} className={show === v ? 'is-active' : ''} onClick={() => { setShow(v); resetPage(); }}>{l}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Question Feed */}
        <main ref={feedTopRef}>
          {pageItems.length === 0 ? (
            <div className="pq-card pq-empty" style={{ padding: 40, textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 8px' }}>No questions match this filter</h3>
              <p style={{ margin: '0 0 16px', color: 'var(--pq-muted)' }}>Try resetting topic, year, or review filters.</p>
              <button
                className="pq-btn pq-btn-primary"
                onClick={() => { setTopic('ALL'); setExam('ALL'); setYears('ALL'); setShow('ALL'); resetPage(); }}
              >
                Reset filters
              </button>
            </div>
          ) : (
            pageItems.map(q => (
              <QuestionCard
                key={q.id}
                q={q}
                attempt={attempts[q.id]}
                revealedOnly={!!revealed[q.id]}
                bookmarked={!!bookmarks[q.id]}
                onPick={onPick}
                onReveal={() => setRevealed(r => ({ ...r, [q.id]: true }))}
                onTryAgain={() => tryAgain(q)}
                onBookmark={() => toggleBookmark(q.id)}
              />
            ))
          )}

          {filtered.length > PAGE_SIZE && (
            <div className="pq-pager" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
              <button className="pq-btn" disabled={page <= 1} onClick={() => goPage(page - 1)}>← Previous</button>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Page {page} of {totalPages}</span>
              <button className="pq-btn" disabled={page >= totalPages} onClick={() => goPage(page + 1)}>Next →</button>
            </div>
          )}
        </main>
      </div>

      <QuizSetupModal
        isOpen={quizModalOpen}
        onClose={() => setQuizModalOpen(false)}
        questions={initialQuestions}
      />
    </div>
  );
}

/* ====================================================================== */

function QuestionCard({ q, attempt, revealedOnly, bookmarked, onPick, onReveal, onTryAgain, onBookmark }) {
  const diff = difficultyOf(q);
  const options = q.options || [];
  const twoCol = options.length === 4 && options.every(o => (o.text || '').length <= 70);
  const done = !!attempt || revealedOnly;
  const dropped = !q.correctLabel;
  const correctOpt = options.find(o => o.label === q.correctLabel);

  return (
    <article className={`pq-card pq-qcard ${attempt ? (attempt.ok ? 'is-ok' : 'is-bad') : ''}`}>
      <div className="pq-qhead">
        <div className="pq-tags">
          <span className="pq-tag pq-tag-exam">{q.examName} {q.examYear}</span>
          {q.questionNo ? <span className="pq-tag pq-tag-q">Q{q.questionNo}</span> : null}
          <span className="pq-tag pq-tag-topic" title={q.srcTopic}>{q.srcTopic}</span>
          <span className={`pq-tag ${diff.cls}`}>{diff.label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Link
            href={`/prelims/pyq/${generateQuestionSlug(q)}`}
            className="pq-icon-btn"
            title="Open dedicated question view"
            aria-label="Open dedicated question view"
          >
            <ExternalLink size={15} />
          </Link>
          <button
            className={`pq-icon-btn ${bookmarked ? 'is-on' : ''}`}
            onClick={onBookmark}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
            aria-pressed={bookmarked}
          >
            <Bookmark size={17} fill={bookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <StemView stem={q.stem} />

      <div className={`pq-opts ${twoCol ? 'is-2col' : ''}`} role="group" aria-label="Answer options">
        {options.map(o => {
          let cls = 'pq-opt';
          if (done && !dropped) {
            if (o.label === q.correctLabel) cls += ' is-correct';
            else if (attempt && o.label === attempt.sel) cls += ' is-wrong';
            else cls += ' is-faded';
          }
          return (
            <button key={o.label} className={cls} disabled={done} onClick={() => onPick(q, o.label)}>
              <span className="pq-opt-l">{String(o.label).toUpperCase()}</span>
              <span className="pq-opt-t">{o.text}</span>
            </button>
          );
        })}
      </div>

      {done && (
        <div className={`pq-verdict ${attempt ? (attempt.ok ? 'is-ok' : 'is-bad') : ''}`}>
          {dropped ? (
            <b>UPSC dropped this question — there is no official answer key.</b>
          ) : attempt ? (
            attempt.ok ? (
              <b>✓ Correct — ({q.correctLabel.toUpperCase()})</b>
            ) : (
              <><b>✗ Not quite.</b> You chose ({attempt.sel.toUpperCase()}); the answer is <b>({q.correctLabel.toUpperCase()})</b>{correctOpt ? ` — ${correctOpt.text}` : ''}.</>
            )
          ) : (
            <><b>Answer: ({q.correctLabel.toUpperCase()})</b>{correctOpt ? ` — ${correctOpt.text}` : ''}</>
          )}
          {q.explanation && <div className="pq-verdict-exp">{q.explanation}</div>}
        </div>
      )}

      <div className="pq-qfoot">
        {done ? (
          <button className="pq-reveal" onClick={onTryAgain}>↺ Try again</button>
        ) : (
          <>
            <span>Tap an option to check your answer instantly.</span>
            <button className="pq-reveal" onClick={onReveal}>Show answer</button>
          </>
        )}
      </div>
    </article>
  );
}

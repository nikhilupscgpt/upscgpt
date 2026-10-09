'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Search, Bookmark, ArrowRight, ListFilter, X, ExternalLink } from 'lucide-react';
import StemView from './StemView';
import { usePyqStore } from './pyqStore';
import { groupTopics, SUBJECT_ORDER, SUBJECT_SHORT } from './topicGroups';
import './pyq-ui.css';

const PAGE_SIZE = 10;
const PRACTICE_SIZES = [10, 20, 30];
const YEAR_BUCKETS = [
  ['ALL', 'All'],
  ['2020-2026', '2020–26'],
  ['2015-2019', '2015–19'],
  ['2011-2014', '2011–14'],
];
const SHOW_OPTIONS = [
  ['ALL', 'All'],
  ['NEW', 'Not attempted'],
  ['WRONG', 'Wrong'],
  ['MARKED', 'Bookmarked'],
];
const TRY_DEFAULT = ['Article 21', 'Fifth Schedule', 'Money Bill', 'Ordinance', 'Biodiversity', 'Inflation', 'Monsoon'];
const TRY_BY_SUBJECT = {
  'Indian Polity': ['Article 17', 'Fifth Schedule', 'Money Bill', 'Leader of the Opposition', 'Citizenship'],
  Economy: ['Repo rate', 'GST', 'Fiscal deficit', 'RBI', 'WTO'],
  Geography: ['Monsoon', 'Tropic of Cancer', 'Western Ghats', 'Ocean currents', 'Soils'],
  Environment: ['Ramsar', 'Biosphere reserve', 'Wildlife Protection Act', 'IUCN', 'Carbon credit'],
  'Science & Technology': ['Vaccine', 'ISRO', 'CRISPR', 'Nuclear', 'Quantum'],
  'Modern History': ['Non-Cooperation', 'Cabinet Mission', 'Revolt of 1857', 'Gandhi', 'Congress'],
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
  const [sideQuery, setSideQuery] = useState('');
  const [page, setPage] = useState(1);
  const [practiceN, setPracticeN] = useState(20);
  const [revealed, setRevealed] = useState({});
  const [topicsOpen, setTopicsOpen] = useState(false);
  const [urlReady, setUrlReady] = useState(false);
  const searchRef = useRef(null);
  const feedTopRef = useRef(null);

  const { attempts, bookmarks, recordAttempt, clearAttempt, toggleBookmark } = usePyqStore();

  /* ---- URL <-> state ---- */
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const q = p.get('q');
    if (q) {
      setQuery(q);
    } else {
      if (p.get('subject')) setSubject(p.get('subject'));
      if (p.get('topic')) setTopic(p.get('topic'));
      if (p.get('exam')) setExam(p.get('exam'));
      if (p.get('year')) setYears(p.get('year'));
    }
    setUrlReady(true);
  }, []);

  useEffect(() => {
    if (!urlReady) return;
    const p = new URLSearchParams();
    if (query.trim()) p.set('q', query.trim());
    else {
      if (subject !== 'ALL') p.set('subject', subject);
      if (topic !== 'ALL') p.set('topic', topic);
      if (exam !== 'ALL') p.set('exam', exam);
      if (years !== 'ALL') p.set('year', years);
    }
    const qs = p.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [urlReady, query, subject, topic, exam, years]);

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
  const yearRange = useMemo(() => {
    const ys = initialQuestions.map(q => q.examYear).filter(Boolean);
    return ys.length ? { min: Math.min(...ys), max: Math.max(...ys) } : { min: 2011, max: 2025 };
  }, [initialQuestions]);

  const subjectCounts = useMemo(() => {
    const m = new Map();
    for (const q of initialQuestions) m.set(q.srcSubject, (m.get(q.srcSubject) || 0) + 1);
    const known = SUBJECT_ORDER.filter(s => m.has(s)).map(s => [s, m.get(s)]);
    const extra = [...m.entries()].filter(([s]) => !SUBJECT_ORDER.includes(s));
    return [...known, ...extra];
  }, [initialQuestions]);

  const searching = query.trim().length > 0;

  // Everything except the "Show" filter — used for the review counters
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

  const reviewCounts = useMemo(() => {
    let wrong = 0, marked = 0, fresh = 0;
    for (const q of scope) {
      const a = attempts[q.id];
      if (!a) fresh++;
      else if (!a.ok) wrong++;
      if (bookmarks[q.id]) marked++;
    }
    return { wrong, marked, fresh };
  }, [scope, attempts, bookmarks]);

  const filtered = useMemo(() => {
    if (show === 'ALL') return scope;
    return scope.filter(q => {
      const a = attempts[q.id];
      if (show === 'NEW') return !a;
      if (show === 'WRONG') return a && !a.ok;
      if (show === 'MARKED') return !!bookmarks[q.id];
      return true;
    });
  }, [scope, show, attempts, bookmarks]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  // Sidebar: topics of the subject (grouped), or the subject list when "All"
  const topicCounts = useMemo(() => {
    const m = new Map();
    for (const q of initialQuestions) {
      if (subject !== 'ALL' && q.srcSubject !== subject) continue;
      m.set(q.srcTopic, (m.get(q.srcTopic) || 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [initialQuestions, subject]);

  const sideGroups = useMemo(() => {
    const needle = sideQuery.trim().toLowerCase();
    if (subject === 'ALL') {
      const items = subjectCounts.filter(([n]) => !needle || n.toLowerCase().includes(needle));
      return [{ label: null, items }];
    }
    const items = topicCounts.filter(([n]) => !needle || n.toLowerCase().includes(needle));
    return groupTopics(subject, items);
  }, [subject, subjectCounts, topicCounts, sideQuery]);

  const attemptStats = useMemo(() => {
    const ids = new Set(initialQuestions.map(q => q.id));
    let done = 0, ok = 0;
    for (const [id, a] of Object.entries(attempts)) {
      if (!ids.has(id)) continue;
      done++;
      if (a.ok) ok++;
    }
    const viewDone = filtered.filter(q => attempts[q.id]).length;
    return { done, ok, acc: done ? Math.round((ok / done) * 100) : 0, viewDone };
  }, [attempts, initialQuestions, filtered]);

  /* ---- Handlers ---- */
  const resetPage = () => setPage(1);
  const pickSubject = (s) => { setSubject(s); setTopic('ALL'); setSideQuery(''); setShow('ALL'); setQuery(''); resetPage(); };
  const pickTopic = (t) => { setTopic(t); setShow('ALL'); resetPage(); setTopicsOpen(false); };
  const onSearch = (v) => {
    setQuery(v);
    if (v.trim()) { setSubject('ALL'); setTopic('ALL'); setExam('ALL'); setYears('ALL'); setShow('ALL'); }
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

  /* ---- Practice link ---- */
  const practiceCount = Math.min(practiceN, filtered.length);
  const practiceMinutes = Math.max(1, Math.ceil(practiceCount * 1.2));
  const practiceHref = useMemo(() => {
    const p = new URLSearchParams();
    p.set('n', String(practiceN));
    if (show !== 'ALL' || searching) {
      p.set('ids', filtered.slice(0, 60).map(q => q.id).join(','));
    } else {
      if (subject !== 'ALL') p.set('subject', subject);
      if (topic !== 'ALL') p.set('topic', topic);
      if (exam !== 'ALL') p.set('exam', exam);
      if (years !== 'ALL') p.set('years', years);
    }
    return `/prelims/pyq/practice?${p.toString()}`;
  }, [practiceN, show, searching, filtered, subject, topic, exam, years]);

  const scopeLabel = searching
    ? `“${query.trim()}”`
    : topic !== 'ALL' ? topic : subject !== 'ALL' ? subject : 'all subjects';

  const tryChips = TRY_BY_SUBJECT[subject] || TRY_DEFAULT;

  return (
    <div className="pq-root">
      <div className="pq-page">
        {/* ---------- Hero ---------- */}
        <div className="pq-eyebrow">
          Prelims · {subject === 'ALL' ? 'All subjects' : subject} · CSE &amp; CDS {yearRange.min}–{yearRange.max}
        </div>
        <h1 className="pq-h1">Find any PYQ. <em>Attempt it right here.</em></h1>

        <div className="pq-search">
          <Search size={18} />
          <input
            ref={searchRef}
            value={query}
            onChange={e => onSearch(e.target.value)}
            placeholder="Search a keyword, article or topic — e.g. citizenship, Article 17, Fifth Schedule"
            aria-label="Search previous year questions"
          />
          {query && (
            <button className="pq-search-clear" onClick={() => onSearch('')} aria-label="Clear search"><X size={14} /></button>
          )}
        </div>

        <div className="pq-try">
          <span>Try:</span>
          {tryChips.map(t => (
            <button key={t} className="pq-chip-btn" onClick={() => onSearch(t)}>{t}</button>
          ))}
        </div>

        <div className="pq-subjects" role="tablist" aria-label="Subjects">
          <button className={`pq-pill ${subject === 'ALL' && !searching ? 'is-active' : ''}`} onClick={() => pickSubject('ALL')}>
            All<small>{initialQuestions.length}</small>
          </button>
          {subjectCounts.map(([s, n]) => (
            <button key={s} className={`pq-pill ${subject === s && !searching ? 'is-active' : ''}`} onClick={() => pickSubject(s)}>
              {SUBJECT_SHORT[s] || s}<small>{n}</small>
            </button>
          ))}
        </div>

        {/* ---------- 3-column workspace ---------- */}
        <div className="pq-grid">
          {/* Sidebar */}
          <aside className={`pq-card pq-side ${topicsOpen ? 'is-open' : ''}`}>
            <div className="pq-side-head">
              <span className="pq-side-title">{subject === 'ALL' ? 'Subjects' : 'Topics'}</span>
              <span className="pq-side-count">
                {subject === 'ALL' ? subjectCounts.length : topicCounts.length} {subject === 'ALL' ? 'subjects' : 'topics'}
              </span>
            </div>
            <div className="pq-side-filter">
              <input value={sideQuery} onChange={e => setSideQuery(e.target.value)} placeholder="Filter topics…" aria-label="Filter topics" />
            </div>
            <div className="pq-side-scroll">
              {subject !== 'ALL' && (
                <button className={`pq-topic is-all ${topic === 'ALL' ? 'is-active' : ''}`} onClick={() => pickTopic('ALL')}>
                  <span className="pq-topic-name">All {SUBJECT_SHORT[subject] || subject} topics</span>
                  <span className="pq-topic-n">{initialQuestions.filter(q => q.srcSubject === subject).length}</span>
                </button>
              )}
              {sideGroups.map((g, gi) => (
                <div key={gi}>
                  {g.label && <div className="pq-group-label">{g.label}</div>}
                  {g.items.map(([name, n]) => (
                    <button
                      key={name}
                      className={`pq-topic ${subject !== 'ALL' && topic === name ? 'is-active' : ''}`}
                      onClick={() => (subject === 'ALL' ? pickSubject(name) : pickTopic(name))}
                      title={name}
                    >
                      <span className="pq-topic-name">{name}</span>
                      <span className="pq-topic-n">{n}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </aside>

          {/* Feed */}
          <main ref={feedTopRef} style={{ scrollMarginTop: 80 }}>
            <div className="pq-card pq-filters">
              <button className="pq-chip-btn pq-topics-toggle" onClick={() => setTopicsOpen(o => !o)}>
                <ListFilter size={13} /> {topic === 'ALL' ? 'All topics' : topic}
              </button>
              <div className="pq-fgroup">
                <span className="pq-flabel">Exam</span>
                <div className="pq-seg">
                  {[['ALL', 'All'], ['UPSC CSE', 'UPSC CSE'], ['CDS', 'CDS']].map(([v, l]) => (
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
                  {/^\d{4}$/.test(years) && <button className="is-active" onClick={() => { setYears('ALL'); resetPage(); }}>{years} ✕</button>}
                </div>
              </div>
              <div className="pq-fgroup">
                <span className="pq-flabel">Show</span>
                <div className="pq-seg">
                  {SHOW_OPTIONS.map(([v, l]) => (
                    <button key={v} className={show === v ? 'is-active' : ''} onClick={() => { setShow(v); resetPage(); }}>{l}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pq-status">
              <span><strong>{filtered.length}</strong> question{filtered.length === 1 ? '' : 's'} · {scopeLabel}</span>
              <span>Tap an option to check your answer instantly</span>
            </div>

            {pageItems.length === 0 ? (
              <div className="pq-card pq-empty">
                <h3>No questions match</h3>
                <p>Try a different topic, widen the years, or clear the search.</p>
                <button className="pq-btn" onClick={() => { onSearch(''); pickSubject('ALL'); setExam('ALL'); setYears('ALL'); }}>Reset filters</button>
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
              <div className="pq-pager">
                <button className="pq-btn" disabled={page <= 1} onClick={() => goPage(page - 1)}>← Previous</button>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Page {page} of {totalPages}</span>
                <button className="pq-btn" disabled={page >= totalPages} onClick={() => goPage(page + 1)}>Next →</button>
              </div>
            )}
          </main>

          {/* Right rail */}
          <aside className="pq-rail">
            <div className="pq-practice">
              <div className="pq-practice-k">PRACTICE MODE</div>
              <h3>Turn these {filtered.length} questions into a timed test</h3>
              <p>One question at a time, real UPSC marking (+2 / −⅓) and a full review at the end. Pick a set size:</p>
              <div className="pq-nseg">
                {PRACTICE_SIZES.map(n => (
                  <button key={n} className={practiceN === n ? 'is-active' : ''} onClick={() => setPracticeN(n)}>{n} Qs</button>
                ))}
              </div>
              <Link href={practiceHref} className={`pq-go ${filtered.length === 0 ? 'is-disabled' : ''}`}>
                Start practice <ArrowRight size={15} />
              </Link>
              <p style={{ margin: '9px 0 0', textAlign: 'center' }}>
                {practiceCount} question{practiceCount === 1 ? '' : 's'} · ~{practiceMinutes} min
              </p>
            </div>

            <div className="pq-card pq-panel">
              <h4>This session</h4>
              <div className="pq-stats">
                <div className="pq-stat"><b>{attemptStats.done}</b><span>Attempted</span></div>
                <div className="pq-stat"><b>{attemptStats.ok}</b><span>Correct</span></div>
                <div className="pq-stat"><b>{attemptStats.acc}%</b><span>Accuracy</span></div>
              </div>
              <div className="pq-bar"><i style={{ width: `${attemptStats.acc}%` }} /></div>
              <small>{attemptStats.viewDone} of {filtered.length} in this view attempted</small>
            </div>

            <div className="pq-card pq-panel">
              <h4>Review</h4>
              <button className={`pq-review-row ${show === 'WRONG' ? 'is-active' : ''}`} onClick={() => { setShow(show === 'WRONG' ? 'ALL' : 'WRONG'); resetPage(); }}>
                <span><i className="pq-dot" style={{ background: 'var(--pq-bad)' }} />Got wrong</span>
                <span className="pq-review-n">{reviewCounts.wrong}</span>
              </button>
              <button className={`pq-review-row ${show === 'MARKED' ? 'is-active' : ''}`} onClick={() => { setShow(show === 'MARKED' ? 'ALL' : 'MARKED'); resetPage(); }}>
                <span><i className="pq-dot" style={{ background: 'var(--pq-accent)' }} />Bookmarked</span>
                <span className="pq-review-n">{reviewCounts.marked}</span>
              </button>
              <button className={`pq-review-row ${show === 'NEW' ? 'is-active' : ''}`} onClick={() => { setShow(show === 'NEW' ? 'ALL' : 'NEW'); resetPage(); }}>
                <span><i className="pq-dot" style={{ background: 'var(--pq-muted)' }} />Not attempted</span>
                <span className="pq-review-n">{reviewCounts.fresh}</span>
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile sticky practice bar */}
      <div className="pq-mobile-bar">
        <span>{filtered.length} questions · {practiceCount} in a test</span>
        <Link href={practiceHref} className={`pq-go ${filtered.length === 0 ? 'is-disabled' : ''}`}>Practice <ArrowRight size={14} /></Link>
      </div>
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
            href={`/prelims/pyq/${q.dedupHash || q.id}`} 
            className="pq-icon-btn" 
            title="Open dedicated question view" 
            aria-label="Open dedicated question view"
          >
            <ExternalLink size={15} />
          </Link>
          <button className={`pq-icon-btn ${bookmarked ? 'is-on' : ''}`} onClick={onBookmark} aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'} aria-pressed={bookmarked}>
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
            <span>Tap an option — you’ll see the answer and explanation instantly.</span>
            <button className="pq-reveal" onClick={onReveal}>Just show the answer</button>
          </>
        )}
      </div>
    </article>
  );
}

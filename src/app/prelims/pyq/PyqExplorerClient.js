'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import {
  Search,
  Bookmark,
  ArrowLeft,
  ExternalLink,
  Sparkles,
  BookOpen,
  Play,
  RotateCcw,
  Flame,
  Globe2,
  Lock,
  Mail,
  Key,
  ShieldCheck,
  CheckCircle2,
  X,
} from 'lucide-react';
import StemView from './StemView';
import QuizSetupModal from './QuizSetupModal';
import { usePyqStore } from './pyqStore';
import { SUBJECT_ORDER, SUBJECT_SHORT } from './topicGroups';
import { generateQuestionSlug } from '@/lib/pyqSlug';
import { isPairQuestion, isStatementQuestion } from '@/lib/pyqPattern';
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

function difficultyOf(q) {
  const s = q.stem || '';
  if (/Statement[\s-]*(I|1)\b|How many of the (above|following)/i.test(s)) return { label: 'Moderate', cls: 'pq-tag-mod' };
  if (s.length > 260) return { label: 'Tricky', cls: 'pq-tag-hard' };
  return { label: 'Easy', cls: 'pq-tag-easy' };
}

export default function PyqExplorerClient({ initialQuestions = [], initialMetadata = null }) {
  const { data: session, status: sessionStatus } = useSession();
  const isAuthenticated = sessionStatus === 'authenticated' && Boolean(session?.user);

  const [pageItems, setPageItems] = useState(initialQuestions || []);
  const [totalFiltered, setTotalFiltered] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [subject, setSubject] = useState('ALL');
  const [topic, setTopic] = useState('ALL');
  const [exam, setExam] = useState('ALL');
  const [years, setYears] = useState('ALL');
  const [show, setShow] = useState('ALL');
  const [patternFilter, setPatternFilter] = useState('ALL'); // 'ALL' | 'NEW'
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);

  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [authGateReason, setAuthGateReason] = useState(null); // null or string description
  const [revealed, setRevealed] = useState({});
  const [urlReady, setUrlReady] = useState(false);

  const searchRef = useRef(null);
  const feedTopRef = useRef(null);

  const { attempts, bookmarks, mistakes, streak, isStreakCompletedToday, recordAttempt, clearAttempt, toggleBookmark } = usePyqStore();

  /* Clear any legacy bulk-dump sessionStorage item so full dataset never sits in browser storage */
  useEffect(() => {
    try {
      sessionStorage.removeItem('upscgpt_pyq_store_v1');
    } catch (_) {}
  }, []);

  /* Debounce search input */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 280);
    return () => clearTimeout(timer);
  }, [query]);

  /* ---- URL <-> state ---- */
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const q = p.get('q');
    const s = p.get('show');
    const pat = p.get('pattern');
    if (q) {
      setQuery(q);
      setDebouncedQuery(q.trim());
    }
    if (p.get('subject')) setSubject(p.get('subject'));
    if (p.get('topic')) setTopic(p.get('topic'));
    if (p.get('exam')) setExam(p.get('exam'));
    if (p.get('year')) setYears(p.get('year'));
    if (s) setShow(s);
    if (pat === 'new') setPatternFilter('NEW');
    setUrlReady(true);
  }, []);

  useEffect(() => {
    if (!urlReady) return;
    const p = new URLSearchParams();
    if (query.trim()) p.set('q', query.trim());
    if (subject !== 'ALL') p.set('subject', subject);
    if (topic !== 'ALL') p.set('topic', topic);
    if (exam !== 'ALL') p.set('exam', exam);
    if (years !== 'ALL') p.set('year', years);
    if (show !== 'ALL') p.set('show', show);
    if (patternFilter === 'NEW') p.set('pattern', 'new');
    const qs = p.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [urlReady, query, subject, topic, exam, years, show, patternFilter]);

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

  /* ---- Derived metadata from SSR initialMetadata ---- */
  const subjectStats = useMemo(() => {
    if (initialMetadata?.subjectStats && initialMetadata.subjectStats.length > 0) {
      return initialMetadata.subjectStats;
    }
    return SUBJECT_ORDER.map(s => ({
      name: s,
      short: SUBJECT_SHORT[s] || s,
      count: 0,
      topTopics: [],
      allTopics: [],
      newPatternCount: 0,
      meta: SUBJECT_META[s] || { icon: '📚', color: '#64748b' },
    }));
  }, [initialMetadata]);

  const searching = debouncedQuery.length > 0;
  const mistakeCount = Object.keys(mistakes).length;
  const totalNewPatternCount = initialMetadata?.totalNewPattern ?? 0;

  const showOptions = useMemo(() => [
    ['ALL', 'All'],
    ['NEW', 'Not attempted'],
    ['WRONG', 'Wrong'],
    ['MISTAKES', `Notebook (${mistakeCount})`],
    ['MARKED', 'Bookmarked'],
  ], [mistakeCount]);

  /* ---- Server-Side Paginated Fetch (Strictly 10 Questions per Page) ---- */
  useEffect(() => {
    if (!urlReady) return;
    // When on Subject Hub (no subject selected, not searching, no New Pattern filter), no question fetch needed
    if (subject === 'ALL' && !searching && patternFilter === 'ALL') {
      setPageItems([]);
      setTotalFiltered(0);
      setTotalPages(1);
      return;
    }

    let cancelled = false;
    async function loadPage() {
      setLoadingQuestions(true);
      try {
        const params = new URLSearchParams();
        params.set('page', String(page));
        if (subject !== 'ALL') params.set('subject', subject);
        if (topic !== 'ALL') params.set('topic', topic);
        if (exam !== 'ALL') params.set('exam', exam);
        if (years !== 'ALL') params.set('years', years);
        if (patternFilter === 'NEW') params.set('pattern', 'NEW');
        if (debouncedQuery) params.set('q', debouncedQuery);

        if (show === 'MISTAKES') {
          const ids = Object.keys(mistakes);
          if (ids.length === 0) {
            setPageItems([]);
            setTotalFiltered(0);
            setTotalPages(1);
            setLoadingQuestions(false);
            return;
          }
          params.set('ids', ids.join(','));
        } else if (show === 'MARKED') {
          const ids = Object.keys(bookmarks);
          if (ids.length === 0) {
            setPageItems([]);
            setTotalFiltered(0);
            setTotalPages(1);
            setLoadingQuestions(false);
            return;
          }
          params.set('ids', ids.join(','));
        } else if (show === 'WRONG') {
          const ids = Object.entries(attempts)
            .filter(([, a]) => a && !a.ok)
            .map(([id]) => id);
          if (ids.length === 0) {
            setPageItems([]);
            setTotalFiltered(0);
            setTotalPages(1);
            setLoadingQuestions(false);
            return;
          }
          params.set('ids', ids.join(','));
        } else if (show === 'NEW') {
          const attemptedIds = Object.keys(attempts);
          if (attemptedIds.length > 0) {
            params.set('excludeIds', attemptedIds.join(','));
          }
        }

        const res = await fetch(`/api/pyq?${params.toString()}`);
        const data = await res.json();
        if (cancelled) return;

        if (res.status === 401 || data?.requiresAuth) {
          setAuthGateReason(
            page > 1
              ? `Sign in free to unlock Page ${page} and all 2,528+ solved UPSC Prelims questions.`
              : 'Sign in free to use full-text keyword search, New Pattern filters, and custom quizzes.'
          );
          if (page > 1) setPage(1);
          return;
        }

        if (data?.success && Array.isArray(data.questions)) {
          setPageItems(data.questions);
          setTotalFiltered(data.total || 0);
          setTotalPages(data.totalPages || 1);
        }
      } catch (err) {
        console.error('Failed to fetch paginated PYQ page:', err);
      } finally {
        if (!cancelled) setLoadingQuestions(false);
      }
    }

    loadPage();
    return () => {
      cancelled = true;
    };
  }, [
    urlReady,
    subject,
    topic,
    exam,
    years,
    patternFilter,
    debouncedQuery,
    searching,
    show,
    page,
    isAuthenticated,
  ]);

  // Topics for the active subject dropdown
  const activeSubjectTopics = useMemo(() => {
    if (subject === 'ALL') return [];
    const match = subjectStats.find(s => s.name === subject);
    return match?.allTopics || [];
  }, [subject, subjectStats]);

  const activeSubjectNewPatternCount = useMemo(() => {
    if (subject === 'ALL') return totalNewPatternCount;
    const match = subjectStats.find(s => s.name === subject);
    return match?.newPatternCount ?? 0;
  }, [subject, subjectStats, totalNewPatternCount]);

  const totalSubjectQs = useMemo(() => {
    const match = subjectStats.find(s => s.name === subject);
    return match?.count ?? 0;
  }, [subject, subjectStats]);

  /* ---- Handlers with Smart Auth Gate ---- */
  const resetPage = () => setPage(1);

  const requireAuthOrRun = (reason, callback) => {
    if (!isAuthenticated) {
      setAuthGateReason(reason);
      return;
    }
    callback();
  };

  const selectSubject = (s) => {
    setSubject(s);
    setTopic('ALL');
    setShow('ALL');
    setPatternFilter('ALL');
    setQuery('');
    setDebouncedQuery('');
    resetPage();
  };

  const backToAllSubjects = () => {
    setSubject('ALL');
    setTopic('ALL');
    setShow('ALL');
    setPatternFilter('ALL');
    setQuery('');
    setDebouncedQuery('');
    resetPage();
  };

  const onSearch = (v) => {
    if (!isAuthenticated && v.trim().length > 1) {
      setAuthGateReason('Sign in free to search across all 2,528+ UPSC CSE & CDS questions by keyword or Article.');
      return;
    }
    setQuery(v);
    resetPage();
  };

  const clearSearch = () => {
    setQuery('');
    setDebouncedQuery('');
    resetPage();
  };

  const goPage = (n) => {
    if (n > 1 && !isAuthenticated) {
      setAuthGateReason(
        `You've completed the Page 1 preview! Sign in free to continue to Page ${n} and unlock all ${totalFiltered} questions in ${topic !== 'ALL' ? topic : subject}.`
      );
      return;
    }
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
    if (query.trim()) p.set('q', query.trim());
    if (patternFilter === 'NEW') p.set('pattern', 'new');
    if (subject !== 'ALL') p.set('subject', subject);
    if (topic !== 'ALL') p.set('topic', topic);
    if (exam !== 'ALL') p.set('exam', exam);
    if (years !== 'ALL') p.set('years', years);
    return `/prelims/pyq/practice?${p.toString()}`;
  }, [query, subject, topic, exam, years, patternFilter]);

  // =========================================================================
  // VIEW 1: SUBJECT HUB (When no subject is picked and not searching)
  // =========================================================================
  if (subject === 'ALL' && !searching && patternFilter === 'ALL') {
    return (
      <div className="pq-root">
        <div className="pq-hub-shell">
          {/* 🔥 Daily PYQ Streak Hero Card */}
          <div className="pq-streak-hero-card">
            <div className="pq-shc-left">
              <div className="pq-shc-flame-box">
                <Flame size={24} className="pq-flame-animated" />
                <span className="pq-shc-days">{streak.current || 0}d</span>
              </div>
              <div className="pq-shc-info">
                <span className={`pq-shc-tag ${isStreakCompletedToday ? 'is-done' : ''}`}>
                  {isStreakCompletedToday ? '✓ TODAY COMPLETED' : 'PENDING FOR TODAY'}
                </span>
                <h3 className="pq-shc-title">Daily 10-Question Prelims Streak</h3>
                <p className="pq-shc-sub">
                  {isStreakCompletedToday
                    ? `Great job! Current streak: ${streak.current} day${streak.current === 1 ? '' : 's'} (Best: ${streak.best}d). Tomorrow's drill unlocks at midnight.`
                    : '10 curated questions across core subjects. Maintain your daily problem-solving discipline.'}
                </p>
              </div>
            </div>
            <div className="pq-shc-action">
              <Link
                href="/prelims/pyq/practice?drill=daily&mode=practice"
                className="pq-btn pq-btn-primary pq-shc-btn"
              >
                <Flame size={15} />
                {isStreakCompletedToday ? "Review Today's Drill" : "▶ Start Today's Drill (10 Qs)"}
              </Link>
            </div>
          </div>

          <header className="pq-hub-header">
            <div className="pq-hub-badge">
              <Sparkles size={13} /> Prelims PYQ Explorer · CSE &amp; CDS 2011–2026
            </div>
            <h1 className="pq-hub-title">Select a Subject to Practice</h1>
            <p className="pq-hub-sub">
              2,528 authentic UPSC questions organized topic-by-topic. Pick a subject to study distraction-free, or build a customized test.
            </p>

            <div className="pq-hub-toolbar">
              <div className="pq-search" style={{ flex: 1, maxWidth: 440, margin: 0 }}>
                <Search size={18} />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={e => onSearch(e.target.value)}
                  placeholder="Search any keyword or article — e.g. Article 21, Money Bill"
                  aria-label="Search previous year questions"
                />
                {query && (
                  <button
                    type="button"
                    className="pq-search-clear"
                    onClick={clearSearch}
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                className={`pq-btn ${patternFilter === 'NEW' ? 'pq-btn-primary' : ''}`}
                style={{ fontWeight: 800, padding: '11px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                onClick={() =>
                  requireAuthOrRun(
                    'Sign in free to filter all 2022–2025 New Pattern (Statement-I/II & How Many Pairs) UPSC questions.',
                    () => setPatternFilter(p => (p === 'NEW' ? 'ALL' : 'NEW'))
                  )
                }
              >
                <Flame size={15} />
                {patternFilter === 'NEW' ? 'Showing New Pattern' : `🔥 New Pattern (${totalNewPatternCount} Qs)`}
              </button>

              <button
                className="pq-btn"
                style={{ fontWeight: 800, padding: '11px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                onClick={() =>
                  requireAuthOrRun(
                    'Sign in free to build custom multi-subject practice tests and timed mock exams.',
                    () => setQuizModalOpen(true)
                  )
                }
              >
                <Sparkles size={15} /> Custom Quiz Builder
              </button>

              {mistakeCount > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    requireAuthOrRun(
                      'Sign in free to revise your personal Mistake Notebook.',
                      () => {
                        window.location.href = `/prelims/pyq/practice?ids=${Object.keys(mistakes).slice(0, 50).join(',')}&mode=practice`;
                      }
                    )
                  }
                  className="pq-btn"
                  style={{ fontWeight: 800, padding: '11px 16px', display: 'inline-flex', alignItems: 'center', gap: 6, borderColor: 'var(--pq-gold)', color: 'var(--pq-gold)' }}
                >
                  <RotateCcw size={15} /> Revise {mistakeCount} Mistakes
                </button>
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
                  <span className="pq-sc-icon" aria-hidden="true">{s.meta?.icon || '📚'}</span>
                </div>

                <div className="pq-sc-topics">
                  {(s.topTopics || []).map(t => (
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
                  <button
                    type="button"
                    onClick={() =>
                      requireAuthOrRun(
                        `Sign in free to launch interactive 1-by-1 Practice Mode for ${s.name}.`,
                        () => {
                          window.location.href = `/prelims/pyq/practice?subject=${encodeURIComponent(s.name)}&mode=practice&n=20`;
                        }
                      )
                    }
                    className="pq-sc-btn pq-sc-btn-primary"
                  >
                    <Play size={13} fill="currentColor" /> Practice (1 by 1)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <QuizSetupModal
          isOpen={quizModalOpen}
          onClose={() => setQuizModalOpen(false)}
          initialMetadata={initialMetadata}
        />

        <AuthGateModal
          reason={authGateReason}
          onClose={() => setAuthGateReason(null)}
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: FOCUSED SUBJECT VIEW (Server-Paginated 10 Qs per Page)
  // =========================================================================
  const subjectMeta = SUBJECT_META[subject] || { icon: '📚', color: '#64748b' };

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
                {subject !== 'ALL' ? subject : (searching ? `Search: “${query}”` : 'All Questions')}
              </h1>
              <span style={{ fontSize: 13, color: 'var(--pq-muted)', fontWeight: 600, display: 'block', marginTop: 4 }}>
                {totalFiltered} questions {subject !== 'ALL' ? `in ${subject}` : ''} {searching ? `· matching “${query}”` : ''} {topic !== 'ALL' ? `· Topic: ${topic}` : ''} {patternFilter === 'NEW' ? '· 🔥 New Pattern Only' : ''}
              </span>
            </div>

            <div className="pq-focus-actions">
              <button
                type="button"
                onClick={() =>
                  requireAuthOrRun(
                    'Sign in free to launch step-by-step Practice Mode.',
                    () => {
                      window.location.href = practiceUrl;
                    }
                  )
                }
                className="pq-btn pq-btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 800 }}
              >
                <Play size={14} fill="currentColor" /> Attempt in Practice Mode
              </button>

              <button
                className="pq-btn"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                onClick={() =>
                  requireAuthOrRun(
                    'Sign in free to build custom multi-subject practice tests.',
                    () => setQuizModalOpen(true)
                  )
                }
              >
                <Sparkles size={14} /> Build Quiz
              </button>

              {mistakeCount > 0 && (
                <button
                  className={`pq-btn ${show === 'MISTAKES' ? 'is-active' : ''}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderColor: 'var(--pq-gold)', color: 'var(--pq-gold)' }}
                  onClick={() =>
                    requireAuthOrRun(
                      'Sign in free to filter by your personal Mistake Notebook.',
                      () => {
                        setShow(show === 'MISTAKES' ? 'ALL' : 'MISTAKES');
                        resetPage();
                      }
                    )
                  }
                >
                  <BookOpen size={14} /> Notebook ({mistakeCount})
                </button>
              )}
            </div>
          </div>

          {/* Universal Search Bar */}
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div className="pq-search" style={{ flex: 1, minWidth: '280px', margin: 0 }}>
              <Search size={18} />
              <input
                ref={searchRef}
                value={query}
                onChange={e => onSearch(e.target.value)}
                placeholder={subject !== 'ALL'
                  ? `Search keywords in ${subject} (e.g. Article 21, Money Bill, Preamble)...`
                  : 'Search any keyword, article or theme across all subjects...'}
                aria-label="Search previous year questions"
              />
              {query && (
                <button
                  type="button"
                  className="pq-search-clear"
                  onClick={clearSearch}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {subject !== 'ALL' && (
              <button
                type="button"
                className="pq-btn"
                onClick={() =>
                  requireAuthOrRun(
                    'Sign in free to search across all 10 subjects simultaneously.',
                    () => {
                      setSubject('ALL');
                      resetPage();
                    }
                  )
                }
                style={{
                  padding: '9px 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                }}
                title="Search across all 2,528 questions"
              >
                <Globe2 size={13} style={{ color: 'var(--color-blue, #3b82f6)' }} />
                <span>Search all subjects</span>
              </button>
            )}
          </div>
        </div>

        {/* Compact Single-Row Filter Bar */}
        <div className="pq-focus-filters">
          {activeSubjectTopics.length > 0 && (
            <div className="pq-fgroup" style={{ flex: 1, minWidth: 190 }}>
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

          {activeSubjectNewPatternCount > 0 && (
            <div className="pq-fgroup">
              <span className="pq-flabel">Format</span>
              <div className="pq-seg">
                <button
                  className={patternFilter === 'ALL' ? 'is-active' : ''}
                  onClick={() => { setPatternFilter('ALL'); resetPage(); }}
                >
                  All
                </button>
                <button
                  className={patternFilter === 'NEW' ? 'is-active' : ''}
                  onClick={() =>
                    requireAuthOrRun(
                      'Sign in free to filter by New UPSC Pattern (Statement I/II & Pair-based) questions.',
                      () => {
                        setPatternFilter(patternFilter === 'NEW' ? 'ALL' : 'NEW');
                        resetPage();
                      }
                    )
                  }
                >
                  🔥 New Pattern ({activeSubjectNewPatternCount})
                </button>
              </div>
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
                <button
                  key={v}
                  className={show === v ? 'is-active' : ''}
                  onClick={() => {
                    if (v !== 'ALL' && !isAuthenticated) {
                      setAuthGateReason('Sign in free to filter by Unattempted, Wrong, Mistake Notebook, and Bookmarked questions.');
                      return;
                    }
                    setShow(v);
                    resetPage();
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Question Feed */}
        <main ref={feedTopRef}>
          {loadingQuestions ? (
            <div className="pq-skeleton-list">
              {[1, 2, 3].map(i => (
                <div key={i} className="pq-card pq-qcard pq-skeleton-card">
                  <div className="pq-skeleton-tags">
                    <div className="pq-skeleton-pill" style={{ width: 120 }}></div>
                    <div className="pq-skeleton-pill" style={{ width: 60 }}></div>
                    <div className="pq-skeleton-pill" style={{ width: 100 }}></div>
                  </div>
                  <div className="pq-skeleton-line" style={{ width: '92%', height: 18, margin: '14px 0 8px' }}></div>
                  <div className="pq-skeleton-line" style={{ width: '85%', height: 18, marginBottom: 8 }}></div>
                  <div className="pq-skeleton-line" style={{ width: '60%', height: 18, marginBottom: 20 }}></div>
                  <div className="pq-skeleton-opts">
                    <div className="pq-skeleton-opt"></div>
                    <div className="pq-skeleton-opt"></div>
                    <div className="pq-skeleton-opt"></div>
                    <div className="pq-skeleton-opt"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : pageItems.length === 0 ? (
            <div className="pq-card pq-empty" style={{ padding: 40, textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 8px' }}>No questions match this filter</h3>
              <p style={{ margin: '0 0 16px', color: 'var(--pq-muted)' }}>Try resetting format, topic, year, or review filters.</p>
              <button
                className="pq-btn pq-btn-primary"
                onClick={() => { setTopic('ALL'); setExam('ALL'); setYears('ALL'); setShow('ALL'); setPatternFilter('ALL'); resetPage(); }}
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
                onBookmark={() =>
                  requireAuthOrRun(
                    'Sign in free to bookmark important PYQs to your personal revision list.',
                    () => toggleBookmark(q.id)
                  )
                }
              />
            ))
          )}

          {/* Free Account Conversion Banner on Page 1 for Anonymous Visitors */}
          {!isAuthenticated && totalPages > 1 && !loadingQuestions && (
            <div
              style={{
                marginTop: 22,
                padding: '20px 24px',
                borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(139, 92, 246, 0.08))',
                border: '1.5px solid rgba(59, 130, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, maxWidth: 580 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'rgba(37, 99, 235, 0.14)',
                    color: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Lock size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--pq-ink)' }}>
                    Unlock all {totalFiltered} questions in {topic !== 'ALL' ? topic : subject} (100% Free)
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--pq-muted)', marginTop: 3, lineHeight: 1.5 }}>
                    You are viewing the first 10 preview questions (Page 1 of {totalPages}). Sign in with Google or Email OTP to unlock all pages, keyword search, custom quizzes, and mistake tracking.
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="pq-btn pq-btn-primary"
                style={{ fontWeight: 800, padding: '11px 18px', whiteSpace: 'nowrap' }}
                onClick={() =>
                  setAuthGateReason(
                    `Sign in free to unlock all ${totalFiltered} questions in ${topic !== 'ALL' ? topic : subject}.`
                  )
                }
              >
                Unlock All {totalPages} Pages Free →
              </button>
            </div>
          )}

          {totalPages > 1 && (
            <div className="pq-pager" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
              <button className="pq-btn" disabled={page <= 1} onClick={() => goPage(page - 1)}>← Previous</button>
              <span style={{ fontSize: 13, fontWeight: 700 }}>
                Page {page} of {totalPages} {!isAuthenticated && '· 🔒 Sign in for Page 2+'}
              </span>
              <button className="pq-btn" disabled={page >= totalPages} onClick={() => goPage(page + 1)}>
                {!isAuthenticated ? '🔒 Next Page →' : 'Next →'}
              </button>
            </div>
          )}
        </main>
      </div>

      <QuizSetupModal
        isOpen={quizModalOpen}
        onClose={() => setQuizModalOpen(false)}
        initialMetadata={initialMetadata}
      />

      <AuthGateModal
        reason={authGateReason}
        onClose={() => setAuthGateReason(null)}
      />
    </div>
  );
}

/* ====================================================================== */
/* INLINE FREE ACCOUNT LOGIN GATE MODAL                                   */
/* ====================================================================== */

function AuthGateModal({ reason, onClose }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!reason) return null;

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setStep(2);
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (_) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await signIn('otp', {
      email,
      otp,
      redirect: false,
    });

    if (result?.ok) {
      setLoading(false);
      onClose();
      window.location.reload();
    } else {
      setError('Invalid or expired OTP code');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    const callbackUrl = typeof window !== 'undefined' ? window.location.href : '/prelims/pyq';
    signIn('google', { callbackUrl });
  };

  return (
    <div
      className="pp-modal-bg"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 440,
          background: '#0f172a',
          color: '#f8fafc',
          borderRadius: 24,
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.65)',
          padding: '28px 28px 24px',
          position: 'relative',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sign-in modal"
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            width: 32,
            height: 32,
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)',
            color: '#94a3b8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={16} />
        </button>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 999,
            background: 'rgba(56, 189, 248, 0.14)',
            color: '#38bdf8',
            fontSize: 11.5,
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          <Sparkles size={13} /> Free Aspirant Account
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 8px', color: '#ffffff' }}>
          Continue Practicing Free
        </h2>

        <p style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.55, margin: '0 0 16px' }}>
          {reason}
        </p>

        {/* Value Checklist */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
            padding: '12px 14px',
            marginBottom: 18,
            display: 'flex',
            flexDirection: 'column',
            gap: 7,
            fontSize: 12.5,
            color: '#cbd5e1',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={15} style={{ color: '#22c55e', flexShrink: 0 }} />
            <span>All 2,528+ Topic-Wise UPSC CSE &amp; CDS Questions (2011–2025)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={15} style={{ color: '#22c55e', flexShrink: 0 }} />
            <span>Custom Multi-Subject Practice &amp; Timed Exam Simulator</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={15} style={{ color: '#22c55e', flexShrink: 0 }} />
            <span>Personal Mistake Notebook, Bookmarks &amp; Daily Streak</span>
          </div>
        </div>

        {/* 1-Click Google Login */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.2)',
            background: '#ffffff',
            color: '#0f172a',
            fontWeight: 800,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            marginBottom: 14,
          }}
        >
          <span>G</span>
          <span>Continue with Google (1-Click)</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '12px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>OR EMAIL OTP</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email address"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  borderRadius: 12,
                  background: '#090d16',
                  border: '1px solid rgba(255,255,255,0.14)',
                  color: '#ffffff',
                  fontSize: 13.5,
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: 13.5,
                cursor: 'pointer',
              }}
            >
              {loading ? 'Sending OTP...' : 'Send 6-Digit Login Code →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
              Enter the 6-digit code sent to <strong style={{ color: '#ffffff' }}>{email}</strong>
            </div>
            <div style={{ position: 'relative' }}>
              <Key size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="6-digit OTP"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  borderRadius: 12,
                  background: '#090d16',
                  border: '1px solid rgba(255,255,255,0.14)',
                  color: '#ffffff',
                  fontSize: 16,
                  letterSpacing: '0.35em',
                  textAlign: 'center',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 12,
                border: 'none',
                background: '#10b981',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: 13.5,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <ShieldCheck size={16} />
              <span>{loading ? 'Verifying...' : 'Verify & Unlock Full Access'}</span>
            </button>
          </form>
        )}

        {error && (
          <div style={{ color: '#f87171', fontSize: 12, fontWeight: 600, marginTop: 10, textAlign: 'center' }}>
            {error}
          </div>
        )}
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
  const isPair = isPairQuestion(q);
  const isStmt = isStatementQuestion(q);

  return (
    <article className={`pq-card pq-qcard ${attempt ? (attempt.ok ? 'is-ok' : 'is-bad') : ''}`}>
      <div className="pq-qhead">
        <div className="pq-tags">
          <span className="pq-tag pq-tag-exam">{q.examName} {q.examYear}</span>
          {q.questionNo ? <span className="pq-tag pq-tag-q">Q{q.questionNo}</span> : null}
          <span className="pq-tag pq-tag-topic" title={q.srcTopic}>{q.srcTopic}</span>
          {isPair && <span className="pq-tag pq-tag-new-pattern">🔥 Pair-Based</span>}
          {isStmt && <span className="pq-tag pq-tag-new-pattern">🔥 Statement I &amp; II</span>}
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

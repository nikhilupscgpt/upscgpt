'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Play,
  Image as ImageIcon,
  ExternalLink,
  X,
  Edit3,
} from 'lucide-react';
import StemView from '@/app/prelims/pyq/StemView';
import {
  PageHeader,
  CollapsibleRail,
  FilterBar,
  MetaLine,
  StatusBadge,
  RowActions,
} from '@/components/pyq-studio';
import './pyq-studio.css';

export default function PyqStudioClient({ initialFilterOptions, userRole = 'FACULTY' }) {
  const filterOptions = initialFilterOptions || {
    subjects: [],
    years: [],
    exams: [],
    topicGroups: {},
  };

  // ==========================================
  // Comprehensive Filters (Matching Admin & Frontend)
  // ==========================================
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('ALL');
  const [topic, setTopic] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('syllabus'); // 'syllabus' | 'exam'
  const [exam, setExam] = useState('ALL');
  const [year, setYear] = useState('ALL');
  const [pattern, setPattern] = useState('ALL'); // 'ALL' | 'NEW' | 'PAIR' | 'STATEMENT'
  const [answerStatus, setAnswerStatus] = useState('ALL'); // 'ALL' | 'HAS_ANSWER' | 'MISSING_ANSWER' | 'HAS_EXPL' | 'MISSING_EXPL'
  const [limit, setLimit] = useState(25);
  const [page, setPage] = useState(1);
  const [railCollapsed, setRailCollapsed] = useState(true);
  const [urlHydrated, setUrlHydrated] = useState(false);

  // Hydrate filter state from URL query params on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    if (sp.get('search')) setSearch(sp.get('search'));
    if (sp.get('subject')) setSubject(sp.get('subject'));
    if (sp.get('topic')) setTopic(sp.get('topic'));
    if (sp.get('sort')) setSortOrder(sp.get('sort'));
    if (sp.get('exam')) setExam(sp.get('exam'));
    if (sp.get('year')) setYear(sp.get('year'));
    if (sp.get('pattern')) setPattern(sp.get('pattern'));
    if (sp.get('status')) setAnswerStatus(sp.get('status'));
    const lim = Number(sp.get('limit'));
    if ([25, 50, 100].includes(lim)) setLimit(lim);
    const pg = Number(sp.get('page'));
    if (pg >= 1) setPage(pg);
    setUrlHydrated(true);
  }, []);

  // Sync filter state to URL query params
  useEffect(() => {
    if (!urlHydrated || typeof window === 'undefined') return;
    const sp = new URLSearchParams();
    if (search.trim()) sp.set('search', search.trim());
    if (subject !== 'ALL') sp.set('subject', subject);
    if (topic !== 'ALL') sp.set('topic', topic);
    if (sortOrder !== 'syllabus') sp.set('sort', sortOrder);
    if (exam !== 'ALL') sp.set('exam', exam);
    if (year !== 'ALL') sp.set('year', year);
    if (pattern !== 'ALL') sp.set('pattern', pattern);
    if (answerStatus !== 'ALL') sp.set('status', answerStatus);
    if (limit !== 25) sp.set('limit', String(limit));
    if (page > 1) sp.set('page', String(page));
    const qs = sp.toString();
    const nextUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, '', nextUrl);
  }, [urlHydrated, search, subject, topic, sortOrder, exam, year, pattern, answerStatus, limit, page]);

  const resetAllFilters = useCallback(() => {
    setSearch('');
    setSubject('ALL');
    setTopic('ALL');
    setExam('ALL');
    setYear('ALL');
    setPattern('ALL');
    setAnswerStatus('ALL');
    setSortOrder('syllabus');
    setPage(1);
  }, []);

  // Data state
  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [apiFilterOptions, setApiFilterOptions] = useState(null);

  // Selection & Custom Attachment state
  const [selectedIds, setSelectedIds] = useState([]);
  // customAttachments: { [questionId]: { imageUrl: string, caption: string } }
  const [customAttachments, setCustomAttachments] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('pq_studio_attachments');
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {};
  });

  // Modal for attaching map / diagram to a question
  const [activeAttachQ, setActiveAttachQ] = useState(null);
  const [attachUrl, setAttachUrl] = useState('');
  const [attachCaption, setAttachCaption] = useState('');

  // -------------------------------------------------------------
  // Dynamic Topic List based on Selected Subject (Defensive against arrays/objects)
  // -------------------------------------------------------------
  const currentTopicGroups = useMemo(() => {
    // 1. If API returned topicGroups for the active subject, use them
    if (apiFilterOptions?.topicGroups && Array.isArray(apiFilterOptions.topicGroups) && apiFilterOptions.topicGroups.length > 0) {
      return apiFilterOptions.topicGroups.map(g => ({
        label: g.label || 'Topics',
        topics: Array.isArray(g.topics) ? g.topics : [],
      }));
    }

    // 2. Otherwise derive from initialFilterOptions.topicGroups[subject]
    if (subject !== 'ALL' && filterOptions?.topicGroups) {
      const raw = filterOptions.topicGroups[subject];
      if (Array.isArray(raw)) {
        return raw.map(g => {
          if (Array.isArray(g)) {
            return {
              label: g[0] || 'Topics',
              topics: Array.isArray(g[1]) ? g[1] : [],
            };
          }
          return {
            label: g?.label || 'Topics',
            topics: Array.isArray(g?.topics) ? g.topics : [],
          };
        });
      }
    }

    return [];
  }, [apiFilterOptions, subject, filterOptions.topicGroups]);

  // -------------------------------------------------------------
  // Fetch Questions from backend API
  // -------------------------------------------------------------
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      params.set('sort', sortOrder);

      if (search.trim()) params.set('q', search.trim());
      if (subject !== 'ALL') params.set('subject', subject);
      if (topic !== 'ALL') params.set('topic', topic);
      if (exam !== 'ALL') params.set('exam', exam);
      if (year !== 'ALL') params.set('year', year);
      if (pattern !== 'ALL') params.set('pattern', pattern);
      if (answerStatus !== 'ALL') params.set('answerStatus', answerStatus);

      const res = await fetch(`/api/admin/pyq?${params.toString()}`);
      const data = await res.json();

      if (data?.questions && Array.isArray(data.questions)) {
        setQuestions(data.questions);
        setTotal(data.total || data.questions.length);
        setTotalPages(data.totalPages || 1);
      }
      if (data?.filterOptions) {
        setApiFilterOptions(data.filterOptions);
      }
    } catch (e) {
      console.error('[PYQ Studio] Failed to fetch questions:', e);
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortOrder, search, subject, topic, exam, year, pattern, answerStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuestions();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchQuestions]);

  // -------------------------------------------------------------
  // Selection Handlers
  // -------------------------------------------------------------
  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllOnPage = () => {
    const pageIds = questions.map(q => q.id);
    const allSelected = pageIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // -------------------------------------------------------------
  // Map / Diagram Attachment Handlers
  // -------------------------------------------------------------
  const openAttachModal = (q) => {
    setActiveAttachQ(q);
    const existing = customAttachments[q.id] || {};
    setAttachUrl(q.imageUrl || existing.imageUrl || '');
    setAttachCaption(existing.caption || q.imageCaption || `${q.srcTopic || q.srcSubject} Map / Diagram`);
  };

  const handleSaveAttachment = () => {
    if (!activeAttachQ) return;
    const next = {
      ...customAttachments,
      [activeAttachQ.id]: {
        imageUrl: attachUrl.trim(),
        caption: attachCaption.trim(),
      },
    };
    setCustomAttachments(next);
    try {
      sessionStorage.setItem('pq_studio_attachments', JSON.stringify(next));
    } catch {
      // ignore
    }
    setActiveAttachQ(null);
  };

  const handleRemoveAttachment = () => {
    if (!activeAttachQ) return;
    const next = { ...customAttachments };
    delete next[activeAttachQ.id];
    setCustomAttachments(next);
    try {
      sessionStorage.setItem('pq_studio_attachments', JSON.stringify(next));
    } catch {
      // ignore
    }
    setActiveAttachQ(null);
  };

  // -------------------------------------------------------------
  // Launch Broadcast Presenter URL Builder
  // -------------------------------------------------------------
  const getLaunchUrl = (ids = selectedIds) => {
    return `/admin/studio/present?mode=pyq&ids=${ids.join(',')}`;
  };

  const handleLaunchBroadcast = (ids = selectedIds) => {
    if (ids.length === 0) return;
    window.open(getLaunchUrl(ids), '_blank');
  };

  const estRecordingTime = Math.round(selectedIds.length * 3.5);

  const flatTopics = useMemo(() => {
    const out = [];
    for (const g of currentTopicGroups) {
      for (const t of g.topics || []) {
        if (!out.includes(t)) out.push(t);
      }
    }
    return out;
  }, [currentTopicGroups]);

  const primaryFilters = [
    {
      id: 'pyq-filter-subject',
      label: 'Subject',
      value: subject,
      onChange: (val) => { setSubject(val); setTopic('ALL'); setPage(1); },
      options: [
        { value: 'ALL', label: 'All Subjects' },
        ...filterOptions.subjects.map((s) => ({ value: s, label: s })),
      ],
    },
    {
      id: 'pyq-filter-topic',
      label: 'Topic',
      value: topic,
      disabled: subject === 'ALL',
      onChange: (val) => { setTopic(val); setPage(1); },
      options: [
        { value: 'ALL', label: subject === 'ALL' ? 'Select subject first' : `All Topics in ${subject}` },
        ...flatTopics.map((t) => ({ value: t, label: t })),
      ],
    },
    {
      id: 'pyq-filter-search',
      type: 'search',
      label: 'Search',
      value: search,
      placeholder: 'Keywords, stem, Q no...',
      onChange: (val) => { setSearch(val); setPage(1); },
    },
  ];

  const moreFilters = [
    {
      id: 'pyq-filter-exam',
      label: 'Exam',
      value: exam,
      onChange: (val) => { setExam(val); setPage(1); },
      options: [
        { value: 'ALL', label: 'All Exams' },
        { value: 'UPSC CSE', label: 'UPSC CSE' },
        { value: 'CDS', label: 'CDS' },
      ],
    },
    {
      id: 'pyq-filter-year',
      label: 'Year',
      value: year,
      onChange: (val) => { setYear(val); setPage(1); },
      options: [
        { value: 'ALL', label: 'All Years' },
        ...filterOptions.years.map((y) => ({ value: String(y), label: String(y) })),
      ],
    },
    {
      id: 'pyq-filter-pattern',
      label: 'Format',
      value: pattern,
      onChange: (val) => { setPattern(val); setPage(1); },
      options: [
        { value: 'ALL', label: 'All Formats' },
        { value: 'NEW', label: 'New Pattern (Pairs & Statements)' },
        { value: 'PAIR', label: 'Pair-Based Only' },
        { value: 'STATEMENT', label: 'Statement I & II Only' },
      ],
    },
    {
      id: 'pyq-filter-status',
      label: 'Content Quality',
      value: answerStatus,
      onChange: (val) => { setAnswerStatus(val); setPage(1); },
      options: [
        { value: 'ALL', label: 'All Status' },
        { value: 'HAS_ANSWER', label: 'Has Correct Answer' },
        { value: 'MISSING_ANSWER', label: 'Missing Answer' },
        { value: 'HAS_EXPL', label: 'Has Explanation' },
        { value: 'MISSING_EXPL', label: 'Missing Explanation' },
      ],
    },
    {
      id: 'pyq-filter-sort',
      label: 'Sequence',
      value: sortOrder,
      onChange: (val) => { setSortOrder(val); setPage(1); },
      options: [
        { value: 'syllabus', label: 'Syllabus Sequence' },
        { value: 'exam', label: 'Exam Year (Recent First)' },
      ],
    },
    {
      id: 'pyq-filter-limit',
      label: 'Per Page',
      value: String(limit),
      onChange: (val) => { setLimit(Number(val)); setPage(1); },
      options: [
        { value: '25', label: '25 per page' },
        { value: '50', label: '50 per page' },
        { value: '100', label: '100 per page' },
      ],
    },
  ];

  const activeChips = [];
  if (subject !== 'ALL') activeChips.push({ id: 'subject', label: `Subject: ${subject}`, onRemove: () => { setSubject('ALL'); setTopic('ALL'); setPage(1); } });
  if (topic !== 'ALL') activeChips.push({ id: 'topic', label: `Topic: ${topic}`, onRemove: () => { setTopic('ALL'); setPage(1); } });
  if (search.trim()) activeChips.push({ id: 'search', label: `Search: ${search.trim()}`, onRemove: () => { setSearch(''); setPage(1); } });
  if (exam !== 'ALL') activeChips.push({ id: 'exam', label: `Exam: ${exam}`, onRemove: () => { setExam('ALL'); setPage(1); } });
  if (year !== 'ALL') activeChips.push({ id: 'year', label: `Year: ${year}`, onRemove: () => { setYear('ALL'); setPage(1); } });
  if (pattern !== 'ALL') activeChips.push({ id: 'pattern', label: `Format: ${pattern}`, onRemove: () => { setPattern('ALL'); setPage(1); } });
  if (answerStatus !== 'ALL') activeChips.push({ id: 'status', label: `Status: ${answerStatus}`, onRemove: () => { setAnswerStatus('ALL'); setPage(1); } });
  if (sortOrder !== 'syllabus') activeChips.push({ id: 'sort', label: `Sort: ${sortOrder}`, onRemove: () => { setSortOrder('syllabus'); setPage(1); } });

  return (
    <div className="pq-pyq-studio-root">
      <PageHeader
        breadcrumbs={[
          { label: 'Studio', href: '/admin/studio' },
          { label: 'PYQ Studio' },
        ]}
        secondaryActions={
          userRole === 'ADMIN' ? (
            <Link href="/admin/pyq" target="_blank" className="pyq-ui-secondary-btn">
              <span>PYQ Editor</span>
              <ExternalLink size={13} />
            </Link>
          ) : null
        }
        primaryAction={
          selectedIds.length > 0 ? (
            <button
              type="button"
              onClick={() => handleLaunchBroadcast()}
              className="pyq-ui-primary-btn"
            >
              <Play size={14} fill="currentColor" />
              <span>Present ({selectedIds.length})</span>
            </button>
          ) : null
        }
      />

      <FilterBar
        primaryFilters={primaryFilters}
        moreFilters={moreFilters}
        activeChips={activeChips}
        onClearAll={resetAllFilters}
      />

      <CollapsibleRail
        title="Queue"
        collapsed={railCollapsed}
        onToggle={() => setRailCollapsed((v) => !v)}
        main={
          <main className="pq-pyq-main">
            <section className="pq-pyq-action-bar" aria-label="Selection controls">
              <div className="pq-pyq-action-left">
                <button
                  type="button"
                  onClick={handleSelectAllOnPage}
                  className="pq-pyq-btn-outline"
                >
                  {questions.length > 0 && questions.every((q) => selectedIds.includes(q.id))
                    ? 'Deselect Page'
                    : `Select Page (${questions.length})`}
                </button>

                {selectedIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="pq-pyq-btn-clear"
                  >
                    Clear ({selectedIds.length})
                  </button>
                )}

                <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 400 }}>
                  {questions.length > 0 ? (page - 1) * limit + 1 : 0}–{Math.min(page * limit, total)} of {total} questions
                  {selectedIds.length > 0 && (
                    <strong style={{ color: '#38bdf8', marginLeft: 8 }}>
                      · {selectedIds.length} queued (~{estRecordingTime} min)
                    </strong>
                  )}
                </span>
              </div>
            </section>

      {/* ========================================================= */}
      {/* QUESTION CARDS LIST                                       */}
      {/* ========================================================= */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8', fontSize: 16 }}>
          Loading questions from database...
        </div>
      ) : questions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8', fontSize: 16 }}>
          No questions match current filters. Try resetting or adjusting criteria.
        </div>
      ) : (
        <div className="pq-pyq-cards-list">
          {questions.map((q) => {
            const isSelected = selectedIds.includes(q.id);
            const hasAttachment = Boolean(customAttachments[q.id]?.imageUrl || q.imageUrl);
            const options = Array.isArray(q.options) ? q.options : [];
            const correctLabel = q.correctLabel ? String(q.correctLabel).toUpperCase() : null;

            const cardStatus =
              q.contentStatus ||
              (!correctLabel ? 'broken' : q.hasExplanation ? 'ready' : 'incomplete');
            const topicMeta = [q.srcSubject, q.srcTopic].filter(Boolean).join(' › ');
            const rowMenuItems = [
              {
                id: 'present-solo',
                label: 'Present solo',
                onClick: () => handleLaunchBroadcast([q.id]),
              },
              {
                id: 'attach-map',
                label: hasAttachment ? 'Edit attached map' : 'Attach map / diagram',
                onClick: () => openAttachModal(q),
              },
            ];
            if (userRole === 'ADMIN') {
              rowMenuItems.push({
                id: 'edit-central',
                label: 'Edit in PYQ Editor',
                href: `/admin/pyq?search=${encodeURIComponent(q.id)}`,
              });
            }

            return (
              <div
                key={q.id}
                className={`pq-pyq-card pyq-ui-card ${isSelected ? 'is-selected' : ''}`}
                onClick={() => toggleSelect(q.id)}
              >
                <div className="pq-pyq-card-head">
                  <div className="pq-pyq-card-meta">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      aria-label={`Select question ${q.questionNo || q.id}`}
                      onChange={() => {}}
                      style={{ width: 17, height: 17, accentColor: '#0284c7', cursor: 'pointer' }}
                    />
                    <MetaLine
                      parts={[
                        `${q.examName || 'UPSC CSE'} ${q.examYear || ''}`.trim(),
                        q.questionNo ? `Q${q.questionNo}` : null,
                        topicMeta || null,
                      ]}
                    />
                  </div>

                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <StatusBadge status={cardStatus} />
                    <RowActions
                      label={`Actions for Q${q.questionNo || q.id}`}
                      inlineActions={[
                        {
                          id: 'inline-map',
                          label: hasAttachment ? 'Edit Map' : 'Map',
                          icon: <ImageIcon size={14} />,
                          active: hasAttachment,
                          onClick: () => openAttachModal(q),
                        },
                        {
                          id: 'inline-present',
                          label: 'Present',
                          icon: <Play size={13} fill="currentColor" />,
                          showLabel: true,
                          onClick: () => handleLaunchBroadcast([q.id]),
                        },
                      ]}
                      menuItems={rowMenuItems}
                    />
                  </div>
                </div>

                {/* Question Stem Text (regular weight, same formatter as present mode) */}
                <div className="pq-pyq-stem-text" style={{ fontWeight: 400 }}>
                  <StemView stem={q.stem} size="sm" interactiveElimination={false} />
                </div>

                {/* Options Preview */}
                {options.length > 0 && (
                  <div className="pq-pyq-opts-row">
                    {options.map((opt) => {
                      const optLabel = String(opt.label).toUpperCase();
                      const isCorrect = correctLabel === optLabel;
                      return (
                        <div
                          key={opt.label}
                          className={`pq-pyq-opt-pill ${isCorrect ? 'is-correct' : ''}`}
                        >
                          <strong>({optLabel})</strong>
                          <span>{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* PAGINATION CONTROLS                                       */}
      {/* ========================================================= */}
          {totalPages > 1 && (
            <footer className="pq-pyq-pagination">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="pq-pyq-page-btn"
              >
                Previous
              </button>

              <span style={{ fontSize: 13.5, color: '#94a3b8', fontWeight: 400 }}>
                Page <strong style={{ color: '#ffffff' }}>{page}</strong> of <strong>{totalPages}</strong> ({total} total)
              </span>

              <button
                type="button"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="pq-pyq-page-btn"
              >
                Next
              </button>
            </footer>
          )}
        </main>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#cbd5e1' }}>
          <div>
            <strong>{selectedIds.length}</strong> selected (~{estRecordingTime} min)
          </div>
          {selectedIds.length > 0 ? (
            <>
              <button
                type="button"
                onClick={() => handleLaunchBroadcast()}
                className="pyq-ui-primary-btn"
                style={{ justifyContent: 'center' }}
              >
                <Play size={14} fill="currentColor" />
                <span>Present ({selectedIds.length})</span>
              </button>
              <button
                type="button"
                onClick={handleClearSelection}
                className="pyq-ui-secondary-btn"
                style={{ justifyContent: 'center' }}
              >
                Clear Queue
              </button>
            </>
          ) : (
            <span style={{ color: '#94a3b8', fontSize: 12.5 }}>
              Select questions from the list to queue them for recording.
            </span>
          )}
        </div>
      </CollapsibleRail>

      {/* ========================================================= */}
      {/* ATTACH MAP / DIAGRAM MODAL                                */}
      {/* ========================================================= */}
      {activeAttachQ && (
        <div className="pq-modal-overlay" onClick={() => setActiveAttachQ(null)}>
          <div className="pq-modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 className="pq-modal-title">
                <ImageIcon size={20} color="#38bdf8" />
                <span>Attach Map / Diagram Slide</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveAttachQ(null)}
                aria-label="Close modal"
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: 0, fontSize: 13.5, color: '#94a3b8', lineHeight: 1.5 }}>
              Attach a high-resolution map, architectural photo, or schematic diagram to <strong>Q{activeAttachQ.questionNo || ''} ({activeAttachQ.examYear || ''})</strong>. This will automatically insert a dedicated Visual Explainer slide in your recording deck with XP-Pen stylus annotations.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="attach-url-input" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8' }}>
                Image / Diagram URL
              </label>
              <input
                id="attach-url-input"
                type="url"
                placeholder="https://... (e.g. Google Cloud Storage or public image URL)"
                value={attachUrl}
                onChange={e => setAttachUrl(e.target.value)}
                className="pq-modal-input"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label htmlFor="attach-caption-input" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8' }}>
                Slide Caption / Figure Note
              </label>
              <input
                id="attach-caption-input"
                type="text"
                placeholder="e.g. Figure 1: Major River Basins of Peninsular India"
                value={attachCaption}
                onChange={e => setAttachCaption(e.target.value)}
                className="pq-modal-input"
              />
            </div>

            {/* Preview image if valid URL */}
            {attachUrl.trim() && (
              <div style={{ width: '100%', height: 160, borderRadius: 12, overflow: 'hidden', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={attachUrl}
                  alt="Attachment Preview"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
              {customAttachments[activeAttachQ.id]?.imageUrl ? (
                <button
                  type="button"
                  onClick={handleRemoveAttachment}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 10,
                    background: 'transparent',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#f87171',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Remove Attachment
                </button>
              ) : <div />}

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setActiveAttachQ(null)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: 'none',
                    color: '#cbd5e1',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveAttachment}
                  disabled={!attachUrl.trim()}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 10,
                    background: '#38bdf8',
                    border: 'none',
                    color: '#032b43',
                    fontSize: 13.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Save &amp; Attach to Deck
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STICKY FLOATING QUEUE BAR (Appears when >= 1 selected)   */}
      {/* ========================================================= */}
      {selectedIds.length > 0 && (
        <div className="pq-pyq-floating-queue-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 10, height: 10, borderRadius: 999, background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
            <span style={{ fontSize: 14.5, fontWeight: 800, color: '#ffffff' }}>
              {selectedIds.length} Questions Queued
            </span>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>
              (~{estRecordingTime} min lecture)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={handleClearSelection}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: 13,
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              Clear
            </button>

            <button
              type="button"
              onClick={() => handleLaunchBroadcast()}
              className="pq-pyq-launch-btn"
              style={{ padding: '10px 20px', fontSize: 14 }}
            >
              <Play size={15} fill="currentColor" />
              <span>Launch PYQ Broadcast Studio</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

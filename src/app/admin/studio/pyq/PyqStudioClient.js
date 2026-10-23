'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Search,
  CheckSquare,
  Square,
  Play,
  RotateCcw,
  Image as ImageIcon,
  ChevronRight,
  ExternalLink,
  Layers,
  X,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ArrowLeft,
  Calendar,
  BookOpen,
  Filter,
} from 'lucide-react';
import './pyq-studio.css';

export default function PyqStudioClient({ initialFilterOptions }) {
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

  // Data state
  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

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
  // Dynamic Topic List based on Selected Subject
  // -------------------------------------------------------------
  const currentTopicGroups = useMemo(() => {
    if (subject === 'ALL' || !filterOptions.topicGroups) return [];
    return filterOptions.topicGroups[subject] || [];
  }, [subject, filterOptions.topicGroups]);

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

  return (
    <div className="pq-pyq-studio-root">
      {/* Top Header */}
      <header className="pq-pyq-studio-head">
        <div className="pq-pyq-head-left">
          <Link
            href="/admin/studio"
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#cbd5e1',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <ArrowLeft size={14} />
            <span>Studio Hub</span>
          </Link>

          <div className="pq-pyq-badge-icon">
            <GraduationCap size={26} />
          </div>

          <div>
            <h1 className="pq-pyq-studio-title">PYQ Lecture Studio Workstation</h1>
            <p className="pq-pyq-studio-sub">
              Syllabus-aligned Prelims question decks with dual-layer vector pen, map attachments, and 1080p recording stage
            </p>
          </div>
        </div>

        <Link
          href="/admin/pyq"
          target="_blank"
          style={{
            padding: '8px 14px',
            borderRadius: 10,
            background: 'transparent',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: '#38bdf8',
            fontSize: 13,
            fontWeight: 700,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>Open PYQ Central Editor</span>
          <ExternalLink size={13} />
        </Link>
      </header>

      {/* ========================================================= */}
      {/* COMPREHENSIVE FILTER CONTAINER (MATCHING BACKEND & FRONTEND) */}
      {/* ========================================================= */}
      <section className="pq-pyq-filter-container">
        {/* Row 1: Search */}
        <div className="pq-pyq-search-row">
          <div className="pq-pyq-search-box">
            <Search size={18} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search by keywords, question stem text, articles, case laws, or question number..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pq-pyq-search-input"
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); setPage(1); }}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Comprehensive Multi-Criteria Selects */}
        <div className="pq-pyq-filter-grid">
          {/* 1. Subject */}
          <div className="pq-pyq-filter-group">
            <label className="pq-pyq-filter-label">Subject</label>
            <select
              value={subject}
              onChange={e => { setSubject(e.target.value); setTopic('ALL'); setPage(1); }}
              className="pq-pyq-select"
            >
              <option value="ALL">All Subjects</option>
              {filterOptions.subjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* 2. Theme / Topic */}
          <div className="pq-pyq-filter-group">
            <label className="pq-pyq-filter-label">Theme / Topic</label>
            <select
              value={topic}
              onChange={e => { setTopic(e.target.value); setPage(1); }}
              disabled={subject === 'ALL'}
              className="pq-pyq-select"
              style={{ maxWidth: 220 }}
            >
              <option value="ALL">All Themes in {subject === 'ALL' ? 'Subject' : subject}</option>
              {currentTopicGroups.length > 0 ? (
                currentTopicGroups.map(group => (
                  <optgroup key={group.label} label={group.label}>
                    {group.topics.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </optgroup>
                ))
              ) : null}
            </select>
          </div>

          {/* 3. Sequence Order */}
          <div className="pq-pyq-filter-group">
            <label className="pq-pyq-filter-label">Sequence Order</label>
            <select
              value={sortOrder}
              onChange={e => { setSortOrder(e.target.value); setPage(1); }}
              className="pq-pyq-select"
            >
              <option value="syllabus">📖 Syllabus Sequence (NCERT Chapters)</option>
              <option value="exam">📅 Exam Year (Recent First)</option>
            </select>
          </div>

          {/* 4. Exam */}
          <div className="pq-pyq-filter-group">
            <label className="pq-pyq-filter-label">Exam</label>
            <select
              value={exam}
              onChange={e => { setExam(e.target.value); setPage(1); }}
              className="pq-pyq-select"
            >
              <option value="ALL">All Exams</option>
              <option value="UPSC CSE">UPSC CSE</option>
              <option value="CDS">CDS</option>
            </select>
          </div>

          {/* 5. Year */}
          <div className="pq-pyq-filter-group">
            <label className="pq-pyq-filter-label">Year</label>
            <select
              value={year}
              onChange={e => { setYear(e.target.value); setPage(1); }}
              className="pq-pyq-select"
            >
              <option value="ALL">All Years</option>
              {filterOptions.years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* 6. Pattern / Format */}
          <div className="pq-pyq-filter-group">
            <label className="pq-pyq-filter-label">Format / Pattern</label>
            <select
              value={pattern}
              onChange={e => { setPattern(e.target.value); setPage(1); }}
              className="pq-pyq-select"
            >
              <option value="ALL">All Formats</option>
              <option value="NEW">🔥 New Pattern (Pairs &amp; Statements)</option>
              <option value="PAIR">Pair-Based Only</option>
              <option value="STATEMENT">Statement I &amp; II Only</option>
            </select>
          </div>

          {/* 7. Content Quality */}
          <div className="pq-pyq-filter-group">
            <label className="pq-pyq-filter-label">Content Quality</label>
            <select
              value={answerStatus}
              onChange={e => { setAnswerStatus(e.target.value); setPage(1); }}
              className="pq-pyq-select"
            >
              <option value="ALL">All Status</option>
              <option value="HAS_ANSWER">Has Correct Answer</option>
              <option value="MISSING_ANSWER">⚠️ Missing Answer</option>
              <option value="HAS_EXPL">Has Explanation</option>
              <option value="MISSING_EXPL">⚠️ Missing Explanation</option>
            </select>
          </div>

          {/* 8. Per Page */}
          <div className="pq-pyq-filter-group" style={{ marginLeft: 'auto' }}>
            <label className="pq-pyq-filter-label">Per Page</label>
            <select
              value={limit}
              onChange={e => { setLimit(parseInt(e.target.value, 10)); setPage(1); }}
              className="pq-pyq-select"
              style={{ minWidth: 90 }}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* BULK ACTION BAR & RECORDING QUEUE CONTROLLER             */}
      {/* ========================================================= */}
      <section className="pq-pyq-action-bar">
        <div className="pq-pyq-action-left">
          <button
            type="button"
            onClick={handleSelectAllOnPage}
            className="pq-pyq-btn-outline"
          >
            {questions.length > 0 && questions.every(q => selectedIds.includes(q.id))
              ? 'Deselect Page'
              : `Select Page (${questions.length})`}
          </button>

          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleClearSelection}
              className="pq-pyq-btn-clear"
            >
              Clear Selection ({selectedIds.length})
            </button>
          )}

          <span style={{ fontSize: 13.5, color: '#94a3b8', fontWeight: 600 }}>
            Showing {questions.length > 0 ? (page - 1) * limit + 1 : 0}–{Math.min(page * limit, total)} of {total} questions
            {selectedIds.length > 0 && (
              <strong style={{ color: '#38bdf8', marginLeft: 8 }}>
                · {selectedIds.length} queued (~{estRecordingTime} min lecture)
              </strong>
            )}
          </span>
        </div>

        <button
          type="button"
          onClick={() => handleLaunchBroadcast()}
          disabled={selectedIds.length === 0}
          className="pq-pyq-launch-btn"
        >
          <Play size={16} fill="currentColor" />
          <span>Launch PYQ Broadcast Studio ({selectedIds.length})</span>
        </button>
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

            return (
              <div
                key={q.id}
                className={`pq-pyq-card ${isSelected ? 'is-selected' : ''}`}
                onClick={() => toggleSelect(q.id)}
              >
                {/* Card Header */}
                <div className="pq-pyq-card-head">
                  <div className="pq-pyq-card-meta">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      style={{ width: 18, height: 18, accentColor: '#38bdf8', cursor: 'pointer' }}
                    />
                    <span className="pq-badge pq-badge-exam">
                      {q.examName || 'UPSC CSE'} {q.examYear || ''}
                    </span>
                    {q.questionNo && (
                      <span className="pq-badge pq-badge-qno">
                        Q{q.questionNo}
                      </span>
                    )}
                    <span className="pq-badge pq-badge-topic">
                      {q.srcSubject || 'General Studies'}
                    </span>
                    {q.srcTopic && (
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: '#38bdf8' }}>
                        {q.srcTopic}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {hasAttachment && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 6, background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontSize: 11.5, fontWeight: 800 }}>
                        <ImageIcon size={12} /> Map / Diagram Attached
                      </span>
                    )}
                    {q.difficulty && (
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                        {q.difficulty}
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Stem Text */}
                <p className="pq-pyq-stem-text">
                  {q.stem}
                </p>

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

                {/* Card Footer Actions */}
                <div className="pq-pyq-card-footer" onClick={e => e.stopPropagation()}>
                  <div className="pq-pyq-action-btns">
                    {/* Attach Map / Diagram Button */}
                    <button
                      type="button"
                      onClick={() => openAttachModal(q)}
                      className={`pq-pyq-attach-btn ${hasAttachment ? 'has-attachment' : ''}`}
                      title="Attach high-res map or diagram slide to this question"
                    >
                      <ImageIcon size={14} />
                      <span>{hasAttachment ? 'Edit Attached Map' : '+ Attach Map / Diagram'}</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                      type="button"
                      onClick={() => handleLaunchBroadcast([q.id])}
                      className="pq-pyq-present-solo-link"
                      title="Open this question in 1080p Broadcast Studio"
                    >
                      <Play size={13} fill="currentColor" />
                      <span>Present Solo</span>
                    </button>
                  </div>
                </div>
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
            ← Previous Page
          </button>

          <span style={{ fontSize: 13.5, color: '#94a3b8', fontWeight: 600 }}>
            Page <strong style={{ color: '#ffffff' }}>{page}</strong> of <strong>{totalPages}</strong> ({total} total questions)
          </span>

          <button
            type="button"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="pq-pyq-page-btn"
          >
            Next Page →
          </button>
        </footer>
      )}

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
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: 0, fontSize: 13.5, color: '#94a3b8', lineHeight: 1.5 }}>
              Attach a high-resolution map, architectural photo, or schematic diagram to <strong>Q{activeAttachQ.questionNo || ''} ({activeAttachQ.examYear || ''})</strong>. This will automatically insert a dedicated Visual Explainer slide in your recording deck with XP-Pen stylus annotations.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#38bdf8' }}>
                Image / Diagram URL
              </label>
              <input
                type="url"
                placeholder="https://... (e.g. Google Cloud Storage or public image URL)"
                value={attachUrl}
                onChange={e => setAttachUrl(e.target.value)}
                className="pq-modal-input"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#38bdf8' }}>
                Slide Caption / Figure Note
              </label>
              <input
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

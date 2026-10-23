'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Video,
  BookOpen,
  GraduationCap,
  Sparkles,
  Layers,
  Search,
  CheckSquare,
  Square,
  Play,
  RotateCcw,
  ArrowRight,
  Filter,
  Image as ImageIcon,
  Edit3,
  FileText,
  SlidersHorizontal,
  ChevronRight,
  Calendar,
  Tag,
} from 'lucide-react';
import './studio.css';

export default function StudioHubClient({
  initialSubjects = [],
  initialYears = [],
  initialDomains = [],
  initialQuestions = [],
  initialTopics = [],
}) {
  const router = useRouter();

  // Mode Selection: 'pyq' | 'topic'
  const [activeMode, setActiveMode] = useState('pyq');

  // Topic Mode Sub-Tab: 'database' | 'scratchpad'
  const [topicSubTab, setTopicSubTab] = useState('database');

  // ==========================================
  // PYQ Mode State
  // ==========================================
  const [pyqSubject, setPyqSubject] = useState('ALL');
  const [pyqYear, setPyqYear] = useState('ALL');
  const [pyqPattern, setPyqPattern] = useState('ALL');
  const [pyqSearch, setPyqSearch] = useState('');
  const [questions, setQuestions] = useState(initialQuestions);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);

  // ==========================================
  // Topic Database Mode State
  // ==========================================
  const [topicDomain, setTopicDomain] = useState('ALL');
  const [topicGsPaper, setTopicGsPaper] = useState('ALL');
  const [topicSearch, setTopicSearch] = useState('');
  const [topics, setTopics] = useState(initialTopics);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [selectedTopicIds, setSelectedTopicIds] = useState([]);

  // ==========================================
  // Topic Scratchpad Custom Outline State
  // ==========================================
  const [scratchpad, setScratchpad] = useState({
    title: '',
    domain: 'POLITY',
    gsPapers: ['GS2'],
    topic: 'Constitutional Law',
    summary: '',
    background: '',
    valueAddition: '',
    mainsFacts: '',
    questions: '',
    imageUrl: '',
    hasSketchCanvas: true,
  });

  // -------------------------------------------------------------
  // Fetch PYQ Questions when filters change
  // -------------------------------------------------------------
  const fetchQuestions = useCallback(async () => {
    setLoadingQuestions(true);
    try {
      const params = new URLSearchParams();
      if (pyqSubject !== 'ALL') params.set('subject', pyqSubject);
      if (pyqYear !== 'ALL') params.set('year', pyqYear);
      if (pyqPattern !== 'ALL') params.set('pattern', pyqPattern);
      if (pyqSearch.trim()) params.set('q', pyqSearch.trim());
      params.set('limit', '40');

      const res = await fetch(`/api/admin/pyq?${params.toString()}`);
      const data = await res.json();
      if (data?.questions && Array.isArray(data.questions)) {
        setQuestions(data.questions);
      }
    } catch (e) {
      console.error('Failed to fetch questions:', e);
    } finally {
      setLoadingQuestions(false);
    }
  }, [pyqSubject, pyqYear, pyqPattern, pyqSearch]);

  useEffect(() => {
    // Skip initial render fetch if we have initialQuestions
    const timer = setTimeout(() => {
      fetchQuestions();
    }, 280);
    return () => clearTimeout(timer);
  }, [fetchQuestions]);

  // -------------------------------------------------------------
  // Fetch Topic Nodes when filters change
  // -------------------------------------------------------------
  const fetchTopics = useCallback(async () => {
    setLoadingTopics(true);
    try {
      const params = new URLSearchParams();
      if (topicDomain !== 'ALL') params.set('domain', topicDomain);
      if (topicGsPaper !== 'ALL') params.set('gsPaper', topicGsPaper);
      if (topicSearch.trim()) params.set('search', topicSearch.trim());
      params.set('limit', '40');

      const res = await fetch(`/api/admin/studio/topics?${params.toString()}`);
      const data = await res.json();
      if (data?.topics && Array.isArray(data.topics)) {
        setTopics(data.topics);
      }
    } catch (e) {
      console.error('Failed to fetch topics:', e);
    } finally {
      setLoadingTopics(false);
    }
  }, [topicDomain, topicGsPaper, topicSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTopics();
    }, 280);
    return () => clearTimeout(timer);
  }, [fetchTopics]);

  // -------------------------------------------------------------
  // Selection Handlers
  // -------------------------------------------------------------
  const toggleSelectQuestion = (id) => {
    setSelectedQuestionIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllQuestions = () => {
    const allIds = questions.map(q => q.id);
    setSelectedQuestionIds(allIds);
  };

  const handleClearQuestionSelection = () => {
    setSelectedQuestionIds([]);
  };

  const toggleSelectTopic = (id) => {
    setSelectedTopicIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllTopics = () => {
    const allIds = topics.map(t => t.id);
    setSelectedTopicIds(allIds);
  };

  const handleClearTopicSelection = () => {
    setSelectedTopicIds([]);
  };

  // -------------------------------------------------------------
  // Launch Handlers
  // -------------------------------------------------------------
  const handleLaunchPyqStudio = () => {
    if (selectedQuestionIds.length === 0) return;
    router.push(`/admin/studio/present?mode=pyq&ids=${selectedQuestionIds.join(',')}`);
  };

  const handleLaunchTopicStudio = () => {
    if (selectedTopicIds.length === 0) return;
    router.push(`/admin/studio/present?mode=topic&topicIds=${selectedTopicIds.join(',')}`);
  };

  const handleLaunchScratchpad = (e) => {
    e.preventDefault();
    if (!scratchpad.title.trim()) return;
    const encoded = encodeURIComponent(JSON.stringify(scratchpad));
    router.push(`/admin/studio/present?mode=topic&scratchpad=${encoded}`);
  };

  // Estimated recording time (e.g. 4 mins per question, 8 mins per topic node)
  const estPyqTime = selectedQuestionIds.length * 4;
  const estTopicTime = selectedTopicIds.length * 8;

  return (
    <div className="pq-studio-root">
      {/* Header */}
      <header className="pq-studio-header">
        <div className="pq-studio-brand">
          <div className="pq-studio-icon-badge">
            <Video size={28} />
          </div>
          <div>
            <h1 className="pq-studio-title">UPSC Lecture Studio</h1>
            <p className="pq-studio-sub">
              Broadcast-Ready 1080p Recording Decks with XP-Pen Dual-Layer Pen Canvas &amp; OBS Safe Overlay
            </p>
          </div>
        </div>

        <Link
          href="/admin"
          style={{
            padding: '10px 18px',
            borderRadius: 12,
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#cbd5e1',
            textDecoration: 'none',
            fontSize: 13.5,
            fontWeight: 700,
          }}
        >
          ← Return to Admin Control Center
        </Link>
      </header>

      {/* Primary Mode Switcher (2 Big Broadcast Cards) */}
      <section className="pq-studio-modes-grid">
        {/* MODE 1: PYQ LECTURE */}
        <div
          className={`pq-mode-card ${activeMode === 'pyq' ? 'is-active' : ''}`}
          onClick={() => setActiveMode('pyq')}
        >
          <div className="pq-mode-card-icon">
            <GraduationCap size={24} />
          </div>
          <div>
            <div className="pq-mode-title">
              <span>PYQ Lecture Studio</span>
              <span className="pq-mode-badge pq-mode-badge-blue">Prelims Mastery</span>
            </div>
            <p className="pq-mode-desc">
              Progressive statement-by-statement elimination analysis, official answer logic, high-yield concept keywords, and interlinked similar questions.
            </p>
          </div>
        </div>

        {/* MODE 2: THEMATIC TOPIC LECTURE */}
        <div
          className={`pq-mode-card is-topic-card ${activeMode === 'topic' ? 'is-active' : ''}`}
          onClick={() => setActiveMode('topic')}
        >
          <div className="pq-mode-card-icon">
            <BookOpen size={24} />
          </div>
          <div>
            <div className="pq-mode-title">
              <span>Thematic Topic Studio</span>
              <span className="pq-mode-badge pq-mode-badge-purple">GS 1–4 Masterclass</span>
            </div>
            <p className="pq-mode-desc">
              Deliver comprehensive conceptual masterclasses from syllabus nodes or custom outlines with constitutional doctrines, landmark judgments, and mains fodder.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 1: PYQ LECTURE STUDIO                             */}
      {/* ========================================================= */}
      {activeMode === 'pyq' && (
        <section>
          {/* Filters */}
          <div className="pq-studio-filterbar">
            {/* Subject */}
            <select
              value={pyqSubject}
              onChange={e => setPyqSubject(e.target.value)}
              className="pq-studio-filter-select"
            >
              <option value="ALL">All Subjects</option>
              {initialSubjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Exam Year */}
            <select
              value={pyqYear}
              onChange={e => setPyqYear(e.target.value)}
              className="pq-studio-filter-select"
            >
              <option value="ALL">All Exam Years</option>
              {initialYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            {/* Question Pattern */}
            <select
              value={pyqPattern}
              onChange={e => setPyqPattern(e.target.value)}
              className="pq-studio-filter-select"
            >
              <option value="ALL">All Question Types</option>
              <option value="STATEMENT">Statement-Based</option>
              <option value="PAIR">Match / Pair-Based</option>
              <option value="NEW">New Pattern Format</option>
            </select>

            {/* Search Input */}
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search question stem, keywords, or articles..."
                value={pyqSearch}
                onChange={e => setPyqSearch(e.target.value)}
                className="pq-studio-search-input"
              />
            </div>
          </div>

          {/* Bulk Selection Bar */}
          <div className="pq-studio-bulk-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                type="button"
                onClick={handleSelectAllQuestions}
                style={{
                  padding: '8px 14px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#f8fafc',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Select All ({questions.length})
              </button>

              {selectedQuestionIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearQuestionSelection}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 10,
                    background: 'transparent',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    color: '#f87171',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Clear Selection
                </button>
              )}

              <span style={{ fontSize: 13.5, color: '#94a3b8', fontWeight: 600 }}>
                {selectedQuestionIds.length} questions selected {selectedQuestionIds.length > 0 ? `· Est. ~${estPyqTime} min recording` : ''}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLaunchPyqStudio}
              disabled={selectedQuestionIds.length === 0}
              className="pq-studio-btn-primary"
            >
              <Play size={16} fill="currentColor" />
              <span>Launch PYQ Broadcast Studio ({selectedQuestionIds.length})</span>
            </button>
          </div>

          {/* Questions Grid */}
          {loadingQuestions ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
              Loading PYQ library...
            </div>
          ) : questions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
              No questions found matching current filters.
            </div>
          ) : (
            <div className="pq-studio-items-grid">
              {questions.map(q => {
                const isSelected = selectedQuestionIds.includes(q.id);
                return (
                  <div
                    key={q.id}
                    className={`pq-studio-item-card ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => toggleSelectQuestion(q.id)}
                  >
                    <div className="pq-studio-item-head">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="pq-studio-checkbox"
                        />
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#38bdf8' }}>
                          {q.examName || 'CSE'} {q.examYear || ''}
                        </span>
                        {q.questionNo && (
                          <span style={{ fontSize: 11, fontWeight: 800, background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', padding: '2px 6px', borderRadius: 6 }}>
                            Q{q.questionNo}
                          </span>
                        )}
                      </div>

                      <span style={{ fontSize: 11.5, color: '#94a3b8', fontWeight: 700 }}>
                        {q.srcSubject || 'GS'}
                      </span>
                    </div>

                    <p className="pq-studio-item-stem">
                      {q.stem}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <span style={{ fontSize: 11.5, color: '#34d399', fontWeight: 700 }}>
                        {q.srcTopic || 'General'}
                      </span>

                      <Link
                        href={`/admin/studio/present?mode=pyq&id=${q.id}`}
                        onClick={e => e.stopPropagation()}
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: '#38bdf8',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <span>Present Solo</span>
                        <ChevronRight size={13} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ========================================================= */}
      {/* SECTION 2: THEMATIC TOPIC LECTURE STUDIO                  */}
      {/* ========================================================= */}
      {activeMode === 'topic' && (
        <section>
          {/* Sub-tabs: Database vs Scratchpad */}
          <div className="pq-studio-subtabs">
            <button
              type="button"
              onClick={() => setTopicSubTab('database')}
              className={`pq-subtab-btn ${topicSubTab === 'database' ? 'is-active' : ''}`}
            >
              <Layers size={16} />
              <span>From Syllabus Database ({topics.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setTopicSubTab('scratchpad')}
              className={`pq-subtab-btn ${topicSubTab === 'scratchpad' ? 'is-active' : ''}`}
            >
              <Edit3 size={16} />
              <span>Quick Outline Scratchpad</span>
            </button>
          </div>

          {/* SUB-TAB A: Syllabus Database Nodes */}
          {topicSubTab === 'database' && (
            <div>
              {/* Filters */}
              <div className="pq-studio-filterbar">
                {/* Domain */}
                <select
                  value={topicDomain}
                  onChange={e => setTopicDomain(e.target.value)}
                  className="pq-studio-filter-select"
                >
                  <option value="ALL">All Syllabus Domains</option>
                  {initialDomains.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                {/* GS Paper */}
                <select
                  value={topicGsPaper}
                  onChange={e => setTopicGsPaper(e.target.value)}
                  className="pq-studio-filter-select"
                >
                  <option value="ALL">All GS Papers</option>
                  <option value="GS1">GS Paper 1 (History, Geography, Society)</option>
                  <option value="GS2">GS Paper 2 (Polity, Governance, IR)</option>
                  <option value="GS3">GS Paper 3 (Economy, Environment, Tech)</option>
                  <option value="GS4">GS Paper 4 (Ethics &amp; Integrity)</option>
                </select>

                {/* Search */}
                <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Search syllabus doctrines, case laws, or themes..."
                    value={topicSearch}
                    onChange={e => setTopicSearch(e.target.value)}
                    className="pq-studio-search-input"
                  />
                </div>
              </div>

              {/* Bulk Bar */}
              <div className="pq-studio-bulk-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    type="button"
                    onClick={handleSelectAllTopics}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#f8fafc',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Select All ({topics.length})
                  </button>

                  {selectedTopicIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearTopicSelection}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 10,
                        background: 'transparent',
                        border: '1px solid rgba(239, 68, 68, 0.35)',
                        color: '#f87171',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Clear Selection
                    </button>
                  )}

                  <span style={{ fontSize: 13.5, color: '#94a3b8', fontWeight: 600 }}>
                    {selectedTopicIds.length} topics selected {selectedTopicIds.length > 0 ? `· Est. ~${estTopicTime} min lecture` : ''}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleLaunchTopicStudio}
                  disabled={selectedTopicIds.length === 0}
                  className="pq-studio-btn-primary"
                  style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', boxShadow: '0 8px 24px rgba(168, 85, 247, 0.4)' }}
                >
                  <Play size={16} fill="currentColor" />
                  <span>Launch Topic Broadcast Studio ({selectedTopicIds.length})</span>
                </button>
              </div>

              {/* Topics Grid */}
              {loadingTopics ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                  Loading topic nodes...
                </div>
              ) : topics.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                  No syllabus nodes found matching current filters.
                </div>
              ) : (
                <div className="pq-studio-items-grid">
                  {topics.map(t => {
                    const isSelected = selectedTopicIds.includes(t.id);
                    return (
                      <div
                        key={t.id}
                        className={`pq-studio-item-card ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => toggleSelectTopic(t.id)}
                      >
                        <div className="pq-studio-item-head">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="pq-studio-checkbox"
                            />
                            <span style={{ fontSize: 12, fontWeight: 800, color: '#c084fc' }}>
                              {Array.isArray(t.gsPapers) ? t.gsPapers.join(', ') : (t.gsPapers || 'GS')}
                            </span>
                          </div>

                          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>
                            {t.domain}
                          </span>
                        </div>

                        <h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 800, color: '#ffffff', lineHeight: 1.35 }}>
                          {t.title}
                        </h3>

                        <p className="pq-studio-item-stem">
                          {t.cumulativeSummary || t.backgroundNote || t.topic || 'Foundational syllabus topic node.'}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <span style={{ fontSize: 11.5, color: '#38bdf8', fontWeight: 700 }}>
                            {t.topic || t.domain}
                          </span>

                          <Link
                            href={`/admin/studio/present?mode=topic&topicIds=${t.id}`}
                            onClick={e => e.stopPropagation()}
                            style={{
                              fontSize: 12,
                              fontWeight: 800,
                              color: '#c084fc',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <span>Present Solo</span>
                            <ChevronRight size={13} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SUB-TAB B: Quick Outline Scratchpad */}
          {topicSubTab === 'scratchpad' && (
            <form onSubmit={handleLaunchScratchpad} className="pq-scratchpad-card">
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', margin: '0 0 6px' }}>
                  Quick Outline Scratchpad
                </h2>
                <p style={{ margin: 0, fontSize: 14, color: '#94a3b8' }}>
                  Paste or write a rapid lecture outline for breaking news or custom masterclasses. The studio automatically formats it into broadcast slides.
                </p>
              </div>

              {/* Title & Domain */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 16 }}>
                <div className="pq-scratchpad-field">
                  <label className="pq-scratchpad-label">Lecture / Topic Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Basic Structure Doctrine & Kesavananda Bharati"
                    value={scratchpad.title}
                    onChange={e => setScratchpad(s => ({ ...s, title: e.target.value }))}
                    className="pq-scratchpad-input"
                  />
                </div>

                <div className="pq-scratchpad-field">
                  <label className="pq-scratchpad-label">Domain</label>
                  <select
                    value={scratchpad.domain}
                    onChange={e => setScratchpad(s => ({ ...s, domain: e.target.value }))}
                    className="pq-scratchpad-input"
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="POLITY">Polity &amp; Governance</option>
                    <option value="INDIAN ECONOMY">Economy</option>
                    <option value="GEOGRAPHY">Geography</option>
                    <option value="ENVIRONMENT">Environment</option>
                    <option value="MODERN HISTORY">Modern History</option>
                    <option value="INTERNATIONAL RELATIONS">IR</option>
                    <option value="SCIENCE & TECHNOLOGY">Science &amp; Tech</option>
                    <option value="ETHICS">Ethics</option>
                  </select>
                </div>
              </div>

              {/* Core Concept Overview */}
              <div className="pq-scratchpad-field">
                <label className="pq-scratchpad-label">Foundational Overview (Left Pinned Anchor)</label>
                <textarea
                  placeholder="Core definition, article reference, and conceptual framing..."
                  value={scratchpad.summary}
                  onChange={e => setScratchpad(s => ({ ...s, summary: e.target.value }))}
                  className="pq-scratchpad-textarea"
                />
              </div>

              {/* Genesis & Evolution */}
              <div className="pq-scratchpad-field">
                <label className="pq-scratchpad-label">Genesis &amp; Statutory Evolution</label>
                <textarea
                  placeholder="Historical timeline, previous laws, constitutional amendments..."
                  value={scratchpad.background}
                  onChange={e => setScratchpad(s => ({ ...s, background: e.target.value }))}
                  className="pq-scratchpad-textarea"
                />
              </div>

              {/* Value Addition & Landmark Cases */}
              <div className="pq-scratchpad-field">
                <label className="pq-scratchpad-label">Landmark Cases, Committees &amp; Value Addition</label>
                <textarea
                  placeholder="Supreme court verdicts, committee recommendations, core dimensions..."
                  value={scratchpad.valueAddition}
                  onChange={e => setScratchpad(s => ({ ...s, valueAddition: e.target.value }))}
                  className="pq-scratchpad-textarea"
                />
              </div>

              {/* Optional Diagram / Image URL */}
              <div className="pq-scratchpad-field">
                <label className="pq-scratchpad-label">Diagram / Infographic URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://... (or leave empty if no diagram)"
                  value={scratchpad.imageUrl}
                  onChange={e => setScratchpad(s => ({ ...s, imageUrl: e.target.value }))}
                  className="pq-scratchpad-input"
                />
              </div>

              {/* Freehand sketch slide toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="checkbox"
                  id="scratchpad-sketch"
                  checked={scratchpad.hasSketchCanvas}
                  onChange={e => setScratchpad(s => ({ ...s, hasSketchCanvas: e.target.checked }))}
                  className="pq-studio-checkbox"
                />
                <label htmlFor="scratchpad-sketch" style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 600, cursor: 'pointer' }}>
                  Include on-demand blank sketch canvas slide for XP-Pen tablet drawing
                </label>
              </div>

              <button
                type="submit"
                className="pq-studio-btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                  padding: '14px 28px',
                  alignSelf: 'flex-start',
                }}
              >
                <Play size={18} fill="currentColor" />
                <span>Launch Scratchpad Masterclass</span>
              </button>
            </form>
          )}
        </section>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Smartphone,
  GraduationCap,
  Compass,
  Search,
  Play,
  X,
  ArrowLeft,
  Sparkles,
  CheckSquare,
  Square,
  MapPin,
} from 'lucide-react';
import '../../studio/pyq/pyq-studio.css';
import CustomExternalContentModal from '../CustomExternalContentModal';

const MAPPING_CATEGORIES = [
  { value: 'ALL', label: 'All Mapping Categories' },
  { value: 'rivers', label: 'Rivers, Lakes & Glaciers' },
  { value: 'hills', label: 'Mountains, Hills & Passes' },
  { value: 'protected', label: 'National Parks & Sanctuaries' },
  { value: 'ramsar', label: 'Ramsar Wetlands' },
  { value: 'ports', label: 'Ports, Straits & Corridors' },
  { value: 'minerals', label: 'Minerals & Industrial Belts' },
  { value: 'world physical', label: 'World Physical (Seas, Deserts, Plateaus)' },
  { value: 'places in news', label: 'Places in News (Geopolitical)' },
];

export default function ReelsStudioClient({ initialFilterOptions }) {
  const filterOptions = initialFilterOptions || {
    subjects: [],
    years: [],
    exams: [],
    topicGroups: {},
  };

  // Mode tab: 'pyq' | 'mapping'
  const [contentMode, setContentMode] = useState('pyq');
  const [showCustomModal, setShowCustomModal] = useState(false);

  // PYQ Filters
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('ALL');
  const [topic, setTopic] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('syllabus');
  const [exam, setExam] = useState('ALL');
  const [year, setYear] = useState('ALL');
  const [pattern, setPattern] = useState('ALL');
  const [limit, setLimit] = useState(25);
  const [page, setPage] = useState(1);

  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [apiFilterOptions, setApiFilterOptions] = useState(null);
  const [selectedPyqIds, setSelectedPyqIds] = useState([]);

  // Mapping Filters
  const [mapSearch, setMapSearch] = useState('');
  const [mapScope, setMapScope] = useState('ALL');
  const [mapType, setMapType] = useState('ALL');
  const [mapCategory, setMapCategory] = useState('ALL');
  const [mapItems, setMapItems] = useState([]);
  const [mapTotal, setMapTotal] = useState(0);
  const [mapLoading, setMapLoading] = useState(false);
  const [selectedMapIds, setSelectedMapIds] = useState([]);

  const currentTopicGroups = useMemo(() => {
    if (apiFilterOptions?.topicGroups && Array.isArray(apiFilterOptions.topicGroups) && apiFilterOptions.topicGroups.length > 0) {
      return apiFilterOptions.topicGroups.map((g) => ({
        label: g.label || 'Topics',
        topics: Array.isArray(g.topics) ? g.topics : [],
      }));
    }
    if (subject !== 'ALL' && filterOptions?.topicGroups) {
      const raw = filterOptions.topicGroups[subject];
      if (Array.isArray(raw)) {
        return raw.map((g) => {
          if (Array.isArray(g)) {
            return { label: g[0] || 'Topics', topics: Array.isArray(g[1]) ? g[1] : [] };
          }
          return { label: g?.label || 'Topics', topics: Array.isArray(g?.topics) ? g.topics : [] };
        });
      }
    }
    return [];
  }, [apiFilterOptions, subject, filterOptions.topicGroups]);

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
      console.error('[Reels Studio] Failed to fetch PYQs:', e);
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortOrder, search, subject, topic, exam, year, pattern]);

  const fetchMapping = useCallback(async () => {
    setMapLoading(true);
    try {
      const params = new URLSearchParams();
      if (mapScope !== 'ALL') params.set('scope', mapScope);
      if (mapType !== 'ALL') params.set('type', mapType);
      if (mapCategory !== 'ALL') params.set('category', mapCategory);
      if (mapSearch.trim()) params.set('search', mapSearch.trim());
      params.set('limit', '50');

      const res = await fetch(`/api/admin/studio/mapping?${params.toString()}`);
      const data = await res.json();
      setMapItems(data?.items || []);
      setMapTotal(data?.total || 0);
    } catch (e) {
      console.error('[Reels Studio] Failed to fetch Mapping:', e);
    } finally {
      setMapLoading(false);
    }
  }, [mapScope, mapType, mapCategory, mapSearch]);

  useEffect(() => {
    if (contentMode === 'pyq') {
      const t = setTimeout(fetchQuestions, 220);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(fetchMapping, 220);
      return () => clearTimeout(t);
    }
  }, [contentMode, fetchQuestions, fetchMapping]);

  const togglePyqSelect = (id) => {
    setSelectedPyqIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleMapSelect = (id) => {
    setSelectedMapIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const launchPyqReel = (ids = selectedPyqIds) => {
    if (ids.length === 0) return;
    window.open(`/admin/recording-studio/reels/present?mode=pyq&ids=${ids.join(',')}`, '_blank');
  };

  const launchMapReel = (ids = selectedMapIds) => {
    if (ids.length === 0) return;
    window.open(`/admin/recording-studio/reels/present?mode=mapping&mappingIds=${ids.join(',')}`, '_blank');
  };

  const activeSelectionCount = contentMode === 'pyq' ? selectedPyqIds.length : selectedMapIds.length;

  return (
    <div className="pq-pyq-studio-root">
      <CustomExternalContentModal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        defaultTarget="reels"
      />
      {/* Top Header */}
      <header className="pq-pyq-studio-head">
        <div className="pq-pyq-head-left">
          <Link
            href="/admin/recording-studio"
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
            <span>Recording Studio Hub</span>
          </Link>

          <div
            className="pq-pyq-badge-icon"
            style={{
              background: 'linear-gradient(135deg, #a855f7, #ec4899)',
              color: '#ffffff',
              border: 'none',
            }}
          >
            <Smartphone size={26} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 className="pq-pyq-studio-title">9:16 Reels &amp; Shorts Studio</h1>
              <span
                style={{
                  padding: '2px 10px',
                  borderRadius: 999,
                  background: 'rgba(168, 85, 247, 0.2)',
                  border: '1px solid rgba(168, 85, 247, 0.45)',
                  color: '#e879f9',
                  fontSize: 10.5,
                  fontWeight: 900,
                }}
              >
                CONDENSED 3-SLIDE VERTICAL FORMAT
              </span>
            </div>
            <p className="pq-pyq-studio-sub">
              Streamlined vertical decks: <strong>1. Question</strong> → <strong>2. Statement Analysis &amp; Answer</strong> → <strong>3. High-Yield Keywords</strong>
            </p>
          </div>
        </div>

        {/* Mode Switcher: PYQ Reels vs Mapping Reels */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: 4,
            borderRadius: 12,
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          <button
            type="button"
            onClick={() => setContentMode('pyq')}
            style={{
              padding: '8px 16px',
              borderRadius: 9,
              border: 'none',
              background: contentMode === 'pyq' ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'transparent',
              color: contentMode === 'pyq' ? '#ffffff' : '#94a3b8',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <GraduationCap size={15} />
            <span>PYQ Reels</span>
          </button>

          <button
            type="button"
            onClick={() => setContentMode('mapping')}
            style={{
              padding: '8px 16px',
              borderRadius: 9,
              border: 'none',
              background: contentMode === 'mapping' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
              color: contentMode === 'mapping' ? '#ffffff' : '#94a3b8',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Compass size={15} />
            <span>Mapping &amp; River Reels</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCustomModal(true)}
            style={{
              padding: '8px 16px',
              borderRadius: 9,
              border: '1px solid rgba(236, 72, 153, 0.5)',
              background: 'rgba(236, 72, 153, 0.16)',
              color: '#f472b6',
              fontSize: 13,
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Sparkles size={15} />
            <span>+ External / Custom Content</span>
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* PYQ REELS MODE                                            */}
      {/* ========================================================= */}
      {contentMode === 'pyq' ? (
        <>
          <section className="pq-pyq-filter-container">
            <div className="pq-pyq-search-row">
              <div className="pq-pyq-search-box">
                <Search size={18} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Search PYQs for Reels by keyword, article, topic, or question text..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pq-pyq-search-input"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      setPage(1);
                    }}
                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="pq-pyq-filter-grid">
              <div className="pq-pyq-filter-group">
                <label className="pq-pyq-filter-label">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    setTopic('ALL');
                    setPage(1);
                  }}
                  className="pq-pyq-select"
                >
                  <option value="ALL">All Subjects</option>
                  {filterOptions.subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pq-pyq-filter-group">
                <label className="pq-pyq-filter-label">Theme / Topic</label>
                <select
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    setPage(1);
                  }}
                  disabled={subject === 'ALL'}
                  className="pq-pyq-select"
                  style={{ maxWidth: 220 }}
                >
                  <option value="ALL">All Themes</option>
                  {currentTopicGroups.map((group, gIdx) => (
                    <optgroup key={group.label || gIdx} label={group.label}>
                      {Array.isArray(group.topics) &&
                        group.topics.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="pq-pyq-filter-group">
                <label className="pq-pyq-filter-label">Sequence</label>
                <select
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value);
                    setPage(1);
                  }}
                  className="pq-pyq-select"
                >
                  <option value="syllabus">📖 Syllabus Sequence</option>
                  <option value="exam">📅 Exam Year (Recent First)</option>
                </select>
              </div>

              <div className="pq-pyq-filter-group">
                <label className="pq-pyq-filter-label">Year</label>
                <select
                  value={year}
                  onChange={(e) => {
                    setYear(e.target.value);
                    setPage(1);
                  }}
                  className="pq-pyq-select"
                >
                  <option value="ALL">All Years</option>
                  {filterOptions.years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pq-pyq-filter-group">
                <label className="pq-pyq-filter-label">Format</label>
                <select
                  value={pattern}
                  onChange={(e) => {
                    setPattern(e.target.value);
                    setPage(1);
                  }}
                  className="pq-pyq-select"
                >
                  <option value="ALL">All Formats</option>
                  <option value="NEW">🔥 New Pattern (Pairs &amp; Statements)</option>
                  <option value="PAIR">Pair-Based Only</option>
                  <option value="STATEMENT">Statement I &amp; II Only</option>
                </select>
              </div>
            </div>
          </section>

          <section className="pq-pyq-action-bar">
            <div className="pq-pyq-action-left">
              <span style={{ fontSize: 13.5, color: '#cbd5e1', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={15} color="#e879f9" />
                <span>Each PYQ automatically formats into 3 vertical slides: Question → Statement Analysis → Keywords</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => launchPyqReel()}
              disabled={selectedPyqIds.length === 0}
              className="pq-pyq-launch-btn"
              style={{
                background:
                  selectedPyqIds.length > 0
                    ? 'linear-gradient(135deg, #a855f7, #ec4899)'
                    : undefined,
                color: selectedPyqIds.length > 0 ? '#ffffff' : undefined,
              }}
            >
              <Play size={16} fill="currentColor" />
              <span>Open in 9:16 Reels Studio ({selectedPyqIds.length})</span>
            </button>
          </section>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '70px 0', color: '#94a3b8' }}>
              Loading PYQs for Reels...
            </div>
          ) : (
            <div className="pq-pyq-cards-list">
              {questions.map((q) => {
                const isSelected = selectedPyqIds.includes(q.id);
                const options = Array.isArray(q.options) ? q.options : [];
                const correctLabel = q.correctLabel ? String(q.correctLabel).toUpperCase() : null;

                return (
                  <div
                    key={q.id}
                    className={`pq-pyq-card ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => togglePyqSelect(q.id)}
                  >
                    <div className="pq-pyq-card-head">
                      <div className="pq-pyq-card-meta">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          style={{ width: 18, height: 18, accentColor: '#ec4899', cursor: 'pointer' }}
                        />
                        <span className="pq-badge pq-badge-exam">
                          {q.examName || 'UPSC CSE'} {q.examYear || ''}
                        </span>
                        {q.questionNo && <span className="pq-badge pq-badge-qno">Q{q.questionNo}</span>}
                        <span className="pq-badge pq-badge-topic">{q.srcSubject || 'GS'}</span>
                        {q.srcTopic && (
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#e879f9' }}>
                            {q.srcTopic}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          launchPyqReel([q.id]);
                        }}
                        className="pq-pyq-present-solo-link"
                        style={{
                          color: '#f472b6',
                          borderColor: 'rgba(236, 72, 153, 0.4)',
                          background: 'rgba(236, 72, 153, 0.1)',
                        }}
                      >
                        <Smartphone size={13} />
                        <span>Record 9:16 Reel Solo</span>
                      </button>
                    </div>

                    <p className="pq-pyq-stem-text">{q.stem}</p>

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

          {totalPages > 1 && (
            <footer className="pq-pyq-pagination">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="pq-pyq-page-btn"
              >
                ← Previous Page
              </button>
              <span style={{ fontSize: 13.5, color: '#94a3b8', fontWeight: 600 }}>
                Page <strong style={{ color: '#ffffff' }}>{page}</strong> of <strong>{totalPages}</strong> ({total} questions)
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="pq-pyq-page-btn"
              >
                Next Page →
              </button>
            </footer>
          )}
        </>
      ) : (
        /* ========================================================= */
        /* MAPPING & RIVER REELS MODE                                */
        /* ========================================================= */
        <>
          <section className="pq-pyq-filter-container">
            <div className="pq-pyq-search-row">
              <div className="pq-pyq-search-box">
                <Search size={18} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Search rivers (Brahmani, Pennar, Ganga...), mountains, national parks, or Places in News..."
                  value={mapSearch}
                  onChange={(e) => setMapSearch(e.target.value)}
                  className="pq-pyq-search-input"
                />
              </div>
            </div>

            <div className="pq-pyq-filter-grid">
              <div className="pq-pyq-filter-group">
                <label className="pq-pyq-filter-label">Scope</label>
                <select
                  value={mapScope}
                  onChange={(e) => setMapScope(e.target.value)}
                  className="pq-pyq-select"
                >
                  <option value="ALL">All Regions (India &amp; World)</option>
                  <option value="India">India Only</option>
                  <option value="World">World Only</option>
                </select>
              </div>

              <div className="pq-pyq-filter-group">
                <label className="pq-pyq-filter-label">Category</label>
                <select
                  value={mapCategory}
                  onChange={(e) => setMapCategory(e.target.value)}
                  className="pq-pyq-select"
                >
                  {MAPPING_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pq-pyq-filter-group">
                <label className="pq-pyq-filter-label">Data Source</label>
                <select
                  value={mapType}
                  onChange={(e) => setMapType(e.target.value)}
                  className="pq-pyq-select"
                >
                  <option value="ALL">All Sources ({mapTotal})</option>
                  <option value="STATIC">Curated Static Atlas</option>
                  <option value="PIN">Places in News (PIN)</option>
                  <option value="PYQ">Official Mapping PYQs</option>
                </select>
              </div>
            </div>
          </section>

          <section className="pq-pyq-action-bar">
            <div className="pq-pyq-action-left">
              <span style={{ fontSize: 13.5, color: '#cbd5e1', fontWeight: 700 }}>
                Showing {mapItems.length} spatial nodes · Formats into: 1. Map &amp; Hook → 2. Analysis → 3. Keywords &amp; Trap
              </span>
            </div>

            <button
              type="button"
              onClick={() => launchMapReel()}
              disabled={selectedMapIds.length === 0}
              className="pq-pyq-launch-btn"
              style={{
                background:
                  selectedMapIds.length > 0
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : undefined,
                color: selectedMapIds.length > 0 ? '#ffffff' : undefined,
              }}
            >
              <Play size={16} fill="currentColor" />
              <span>Open Mapping Reels Studio ({selectedMapIds.length})</span>
            </button>
          </section>

          {mapLoading ? (
            <div style={{ textAlign: 'center', padding: '70px 0', color: '#94a3b8' }}>
              Loading Mapping nodes...
            </div>
          ) : (
            <div className="pq-pyq-cards-list">
              {mapItems.map((item) => {
                const isSelected = selectedMapIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`pq-pyq-card ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => toggleMapSelect(item.id)}
                  >
                    <div className="pq-pyq-card-head">
                      <div className="pq-pyq-card-meta">
                        {isSelected ? <CheckSquare size={18} color="#34d399" /> : <Square size={18} color="#64748b" />}
                        <span className="pq-badge pq-badge-exam">{item.regionScope || 'India'}</span>
                        <span className="pq-badge pq-badge-topic">
                          {Array.isArray(item.category) ? item.category[0] : 'Atlas'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          launchMapReel([item.id]);
                        }}
                        className="pq-pyq-present-solo-link"
                        style={{ color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                      >
                        <Smartphone size={13} />
                        <span>Record 9:16 Reel Solo</span>
                      </button>
                    </div>

                    <h3 style={{ margin: '6px 0 4px', fontSize: 18, fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <MapPin size={18} color="#34d399" />
                      <span>{item.place || item.title}</span>
                    </h3>
                    <p style={{ margin: 0, fontSize: 13.5, color: '#cbd5e1', lineHeight: 1.5 }}>
                      {item.staticFacts?.[0] || item.newsHook || item.stem || item.locationText}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Floating Queue Bar */}
      {activeSelectionCount > 0 && (
        <div className="pq-pyq-floating-queue-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 10, height: 10, borderRadius: 999, background: '#ec4899', boxShadow: '0 0 10px #ec4899' }} />
            <span style={{ fontSize: 14.5, fontWeight: 800, color: '#ffffff' }}>
              {activeSelectionCount} Reels Queued
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={() => (contentMode === 'pyq' ? setSelectedPyqIds([]) : setSelectedMapIds([]))}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: 13, cursor: 'pointer', fontWeight: 700 }}
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => (contentMode === 'pyq' ? launchPyqReel() : launchMapReel())}
              className="pq-pyq-launch-btn"
              style={{
                padding: '10px 20px',
                fontSize: 14,
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                color: '#ffffff',
              }}
            >
              <Play size={15} fill="currentColor" />
              <span>Open in 9:16 Reels Studio</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

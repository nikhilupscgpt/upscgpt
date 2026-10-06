'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Copy, 
  Bookmark, 
  Share2, 
  Sparkles, 
  Lightbulb, 
  Layers, 
  RotateCcw, 
  Check,
  Command
} from 'lucide-react';

export default function PyqExplorerClient({ initialQuestions }) {
  // Filters State
  const [selectedTopic, setSelectedTopic] = useState('ALL');
  const [selectedExam, setSelectedExam] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarTopicSearch, setSidebarTopicSearch] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Interaction State
  const [expandedCards, setExpandedCards] = useState({}); // { [qId]: boolean }
  const [userSelectedOption, setUserSelectedOption] = useState({}); // { [qId]: 'a' }
  const [bookmarked, setBookmarked] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  // Extract all unique topics and counts
  const topicCounts = useMemo(() => {
    const counts = {};
    for (const q of initialQuestions) {
      const t = q.srcTopic || 'General';
      counts[t] = (counts[t] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [initialQuestions]);

  // Filter topics inside the sidebar search
  const filteredSidebarTopics = useMemo(() => {
    if (!sidebarTopicSearch.trim()) return topicCounts;
    const q = sidebarTopicSearch.toLowerCase();
    return topicCounts.filter(([name]) => name.toLowerCase().includes(q));
  }, [topicCounts, sidebarTopicSearch]);

  // Extract all unique years
  const availableYears = useMemo(() => {
    const years = new Set(initialQuestions.map(q => q.examYear).filter(Boolean));
    return Array.from(years).sort((a, b) => b - a);
  }, [initialQuestions]);

  // Search input handler - CLEARS ALL FILTERS AUTOMATICALLY as requested!
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim()) {
      // Clear all other filters automatically upon searching
      setSelectedTopic('ALL');
      setSelectedExam('ALL');
      setSelectedYear('ALL');
    }
    setCurrentPage(1);
  };

  // Filter questions based on active criteria
  const filteredQuestions = useMemo(() => {
    return initialQuestions.filter(q => {
      // Keyword Search filter (highest priority)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inStem = (q.stem || '').toLowerCase().includes(query);
        const inTopic = (q.srcTopic || '').toLowerCase().includes(query);
        const inExam = (q.examName || '').toLowerCase().includes(query);
        const inOptions = (q.options || []).some(o => (o.text || '').toLowerCase().includes(query));
        return inStem || inTopic || inExam || inOptions;
      }

      // Exam filter
      if (selectedExam !== 'ALL') {
        if (selectedExam === 'UPSC CSE' && !q.examName.includes('CSE')) return false;
        if (selectedExam === 'CDS' && !q.examName.includes('CDS')) return false;
      }

      // Topic filter
      if (selectedTopic !== 'ALL' && q.srcTopic !== selectedTopic) {
        return false;
      }

      // Year filter
      if (selectedYear !== 'ALL' && q.examYear !== Number(selectedYear)) {
        return false;
      }

      return true;
    });
  }, [initialQuestions, selectedExam, selectedTopic, selectedYear, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredQuestions.length / pageSize) || 1;
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredQuestions.slice(start, start + pageSize);
  }, [filteredQuestions, currentPage]);

  // Toggle card expansion
  const toggleCard = (qId) => {
    setExpandedCards(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  // Expand / Collapse all on current page
  const allCurrentExpanded = paginatedQuestions.length > 0 && paginatedQuestions.every(q => expandedCards[q.id]);
  const toggleCollapseAll = () => {
    if (allCurrentExpanded) {
      setExpandedCards({});
    } else {
      const newExpanded = { ...expandedCards };
      paginatedQuestions.forEach(q => { newExpanded[q.id] = true; });
      setExpandedCards(newExpanded);
    }
  };

  // Copy note handler
  const handleCopyNote = (q) => {
    const text = `Question (${q.examName} ${q.examYear} Q#${q.questionNo}):\n${q.stem}\n\nCorrect Answer: (${(q.correctLabel || '').toUpperCase()})`;
    navigator.clipboard.writeText(text);
    setCopiedId(q.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to get difficulty tag
  const getDifficulty = (q) => {
    if (q.stem && (q.stem.includes('Statement-I') || q.stem.includes('How many of the above'))) return { label: 'Moderate', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)' };
    if (q.stem && q.stem.length > 250) return { label: 'Tricky', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)', border: 'rgba(236, 72, 153, 0.3)' };
    return { label: 'Easy', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)' };
  };

  // Format question stem if it contains paired statements
  const renderFormattedStem = (stem) => {
    if (!stem) return null;

    // Check if stem has Statement-I / Statement-II or numbered list
    const hasPairedStatements = stem.includes('Statement-I:') || stem.includes('Statement-I') || stem.includes('Statement 1:');
    const hasNumberedList = /\n\s*[1-4]\.\s+/.test(stem);

    if (hasPairedStatements || hasNumberedList) {
      const lines = stem.split('\n').map(l => l.trim()).filter(Boolean);
      const intro = lines[0];
      const middleStatements = lines.slice(1, -1);
      const conclusion = lines.length > 2 ? lines[lines.length - 1] : '';

      return (
        <div>
          <p style={{ color: '#f8fafc', fontSize: '16px', fontWeight: '600', marginBottom: '14px', lineHeight: 1.5 }}>
            {intro}
          </p>
          <div style={{
            background: '#090d16',
            border: '1px solid #1e293b',
            borderRadius: '10px',
            padding: '16px 20px',
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {middleStatements.map((stmt, idx) => (
              <div key={idx} style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: '1.6' }}>
                {stmt.startsWith('Statement-I:') || stmt.startsWith('Statement-II:') ? (
                  <>
                    <strong style={{ color: '#38bdf8', marginRight: '6px' }}>{stmt.split(':')[0]}:</strong>
                    <span>{stmt.substring(stmt.indexOf(':') + 1)}</span>
                  </>
                ) : (
                  <span>{stmt}</span>
                )}
              </div>
            ))}
          </div>
          {conclusion && (
            <p style={{ color: '#e2e8f0', fontSize: '15px', fontWeight: '500', marginTop: '10px', lineHeight: 1.5 }}>
              {conclusion}
            </p>
          )}
        </div>
      );
    }

    return (
      <p style={{ color: '#f8fafc', fontSize: '16px', lineHeight: '1.65', whiteSpace: 'pre-line', margin: 0, fontWeight: '500' }}>
        {stem}
      </p>
    );
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '32px 24px 80px 24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Top Header Row with Title and 3 Stat Boxes */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px', marginBottom: '32px' }}>
        <div>
          {/* Badge */}
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px', 
            padding: '4px 12px', 
            background: 'rgba(56, 189, 248, 0.1)', 
            border: '1px solid rgba(56, 189, 248, 0.25)', 
            borderRadius: '20px', 
            color: '#38bdf8', 
            fontSize: '11px', 
            fontWeight: '800', 
            letterSpacing: '0.06em', 
            marginBottom: '10px' 
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8' }} />
            PRELIMS PYQ ARCHIVE & TOPIC ENGINE
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: '900', color: '#ffffff', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            Topic-Wise PYQ Explorer
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.98rem', margin: 0, maxWidth: '650px', lineHeight: 1.5 }}>
            Filter and master real previous year questions from <strong>UPSC CSE & CDS</strong> (2011–2023). Test your conceptual clarity topic-by-topic with instant answer verification.
          </p>
        </div>

        {/* 3 Stat Counter Boxes */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '10px 18px', textAlign: 'center', minWidth: '95px' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#f8fafc' }}>{initialQuestions.length}</div>
            <div style={{ fontSize: '9px', fontWeight: '800', color: '#64748b', letterSpacing: '0.08em', marginTop: '2px' }}>QUESTIONS</div>
          </div>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '10px 18px', textAlign: 'center', minWidth: '95px' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#38bdf8' }}>{topicCounts.length}</div>
            <div style={{ fontSize: '9px', fontWeight: '800', color: '#64748b', letterSpacing: '0.08em', marginTop: '2px' }}>CORE TOPICS</div>
          </div>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '10px 18px', textAlign: 'center', minWidth: '95px' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#34d399' }}>13 Yrs</div>
            <div style={{ fontSize: '9px', fontWeight: '800', color: '#64748b', letterSpacing: '0.08em', marginTop: '2px' }}>2011–2023</div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid Layout: Left Sidebar + Right Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '28px', alignItems: 'start' }}>
        
        {/* ==================== LEFT SIDEBAR ==================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '24px' }}>
          
          {/* Topics Card */}
          <div style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '16px',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'calc(100vh - 160px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)'
          }}>
            {/* Sidebar Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="#38bdf8" />
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#f8fafc' }}>Topics & Syllabus</span>
              </div>
              <span style={{ 
                background: 'rgba(56, 189, 248, 0.15)', 
                color: '#38bdf8', 
                border: '1px solid rgba(56, 189, 248, 0.3)', 
                padding: '2px 8px', 
                borderRadius: '10px', 
                fontSize: '11px', 
                fontWeight: '700' 
              }}>
                {topicCounts.length} Available
              </span>
            </div>

            {/* Filter Syllabus Topics Search Input */}
            <div style={{ position: 'relative', marginBottom: '14px' }}>
              <Search size={14} color="#64748b" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text"
                placeholder="Filter syllabus topics..."
                value={sidebarTopicSearch}
                onChange={e => setSidebarTopicSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 30px',
                  background: '#090d16',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  color: '#cbd5e1',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Scrollable Topics List */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '4px', 
              overflowY: 'auto', 
              paddingRight: '4px',
              flex: 1
            }}>
              {/* All Topics Item */}
              <button
                onClick={() => { setSelectedTopic('ALL'); setCurrentPage(1); }}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: selectedTopic === 'ALL' ? '#0284c7' : 'transparent',
                  background: selectedTopic === 'ALL' ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                  color: selectedTopic === 'ALL' ? '#38bdf8' : '#cbd5e1',
                  fontSize: '13px',
                  fontWeight: selectedTopic === 'ALL' ? '700' : '500',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    background: selectedTopic === 'ALL' ? '#38bdf8' : '#475569' 
                  }} />
                  All Topics
                </span>
                <span style={{ 
                  background: selectedTopic === 'ALL' ? 'rgba(56, 189, 248, 0.25)' : '#1e293b', 
                  color: selectedTopic === 'ALL' ? '#38bdf8' : '#94a3b8', 
                  padding: '2px 7px', 
                  borderRadius: '6px', 
                  fontSize: '11px', 
                  fontWeight: '700' 
                }}>
                  {initialQuestions.length}
                </span>
              </button>

              {/* Individual Topics */}
              {filteredSidebarTopics.map(([topic, count]) => {
                const isActive = selectedTopic === topic;
                return (
                  <button
                    key={topic}
                    onClick={() => { setSelectedTopic(topic); setCurrentPage(1); }}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: isActive ? '#0284c7' : 'transparent',
                      background: isActive ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                      color: isActive ? '#38bdf8' : '#94a3b8',
                      fontSize: '12.5px',
                      fontWeight: isActive ? '700' : '500',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.12s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = '#1e293b';
                        e.currentTarget.style.color = '#f8fafc';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#94a3b8';
                      }
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '8px' }}>
                      {topic}
                    </span>
                    <span style={{ 
                      background: isActive ? 'rgba(56, 189, 248, 0.25)' : '#1e293b', 
                      color: isActive ? '#38bdf8' : '#64748b', 
                      padding: '2px 6px', 
                      borderRadius: '6px', 
                      fontSize: '10.5px', 
                      fontWeight: '700',
                      flexShrink: 0
                    }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sidebar Bottom Reset Link */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              borderTop: '1px solid #1e293b', 
              paddingTop: '12px', 
              marginTop: '12px',
              fontSize: '11px',
              color: '#64748b'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }} />
                Syllabus mapped
              </span>
              <button
                onClick={() => { setSelectedTopic('ALL'); setCurrentPage(1); }}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: '#38bdf8', 
                  fontSize: '11px', 
                  fontWeight: '600', 
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Reset Topics
              </button>
            </div>
          </div>

          {/* PYQ Strategy Tip Card */}
          <div style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '14px',
            padding: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#f59e0b', fontSize: '12px', fontWeight: '800' }}>
              <Lightbulb size={14} />
              PYQ Strategy Tip
            </div>
            <p style={{ color: '#94a3b8', fontSize: '12px', lineHeight: 1.55, margin: 0 }}>
              In Prelims 2023, paired statement questions dominated. Practice Statement I & II type logic regularly.
            </p>
          </div>
        </div>

        {/* ==================== RIGHT MAIN FEED ==================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Top Search & Filter Bar */}
          <div style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '16px',
            padding: '18px 20px',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)'
          }}>
            {/* Search Input Row */}
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <Search size={16} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text"
                placeholder="Search concepts, questions, or topics (e.g. anti-defection, money bill, Article 21)..."
                value={searchQuery}
                onChange={handleSearchChange}
                style={{
                  width: '100%',
                  padding: '11px 48px 11px 40px',
                  background: '#090d16',
                  border: '1px solid #1e293b',
                  borderRadius: '10px',
                  color: '#f8fafc',
                  fontSize: '13.5px',
                  outline: 'none'
                }}
              />
              <div style={{ 
                position: 'absolute', 
                right: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                display: 'flex', 
                alignItems: 'center',
                gap: '6px'
              }}>
                {searchQuery ? (
                  <button 
                    onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '13px' }}
                  >
                    ✕
                  </button>
                ) : (
                  <span style={{ 
                    background: '#1e293b', 
                    color: '#64748b', 
                    padding: '2px 6px', 
                    borderRadius: '4px', 
                    fontSize: '10px', 
                    fontWeight: '700' 
                  }}>
                    ⌘K
                  </span>
                )}
              </div>
            </div>

            {/* Filter Buttons & Range Selector Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              
              {/* Left Exam Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>Exam:</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { id: 'ALL', label: 'All Exams' },
                    { id: 'UPSC CSE', label: 'UPSC CSE' },
                    { id: 'CDS', label: 'CDS' }
                  ].map(ex => {
                    const isSelected = selectedExam === ex.id;
                    return (
                      <button
                        key={ex.id}
                        onClick={() => { setSelectedExam(ex.id); setCurrentPage(1); }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: isSelected ? '1px solid #0284c7' : '1px solid #1e293b',
                          background: isSelected ? '#0284c7' : '#090d16',
                          color: isSelected ? '#ffffff' : '#94a3b8',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {ex.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Year Range & Collapse All */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>Range:</span>
                  <select 
                    value={selectedYear}
                    onChange={e => { setSelectedYear(e.target.value); setCurrentPage(1); }}
                    style={{
                      padding: '6px 12px',
                      background: '#090d16',
                      border: '1px solid #1e293b',
                      borderRadius: '8px',
                      color: '#cbd5e1',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="ALL">All Years (2011–2023)</option>
                    {availableYears.map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={toggleCollapseAll}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #1e293b',
                    background: '#090d16',
                    color: '#94a3b8',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {allCurrentExpanded ? 'Collapse All' : 'Expand All'}
                </button>
              </div>
            </div>
          </div>

          {/* Subheader Status Line */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', fontSize: '12.5px', color: '#94a3b8' }}>
            <div>
              Showing <strong style={{ color: '#f8fafc' }}>{filteredQuestions.length}</strong> polity questions
              {selectedTopic !== 'ALL' && <span> • <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{selectedTopic}</span></span>}
              {selectedExam !== 'ALL' && <span> • <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{selectedExam}</span></span>}
              {searchQuery && <span> • matching <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>"{searchQuery}"</span></span>}
            </div>
            <span style={{ color: '#64748b', fontSize: '11.5px' }}>
              Tip: Click any question card to expand options & verified answer
            </span>
          </div>

          {/* Question Cards Feed */}
          {paginatedQuestions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '64px 20px',
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '16px',
              color: '#94a3b8'
            }}>
              <p style={{ fontSize: '1.2rem', color: '#f8fafc', marginBottom: '8px' }}>No questions match your criteria</p>
              <p style={{ fontSize: '13px', margin: 0 }}>Try clearing your search or picking "All Topics" from the sidebar.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {paginatedQuestions.map((q) => {
                const isExpanded = !!expandedCards[q.id];
                const diff = getDifficulty(q);
                const userChoice = userSelectedOption[q.id];
                const isBookmarked = !!bookmarked[q.id];

                return (
                  <div
                    key={q.id}
                    style={{
                      background: '#0f172a',
                      border: '1px solid',
                      borderColor: isExpanded ? 'rgba(56, 189, 248, 0.4)' : '#1e293b',
                      borderRadius: '16px',
                      padding: '22px 26px',
                      boxShadow: isExpanded ? '0 8px 30px rgba(0, 0, 0, 0.35)' : '0 4px 12px rgba(0, 0, 0, 0.15)',
                      transition: 'all 0.2s ease',
                      cursor: isExpanded ? 'default' : 'pointer'
                    }}
                    onClick={() => {
                      if (!isExpanded) toggleCard(q.id);
                    }}
                  >
                    {/* Top Badges Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {/* Exam Badge */}
                        <span style={{
                          background: 'rgba(59, 130, 246, 0.12)',
                          color: '#60a5fa',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          padding: '3px 9px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: '800'
                        }}>
                          {q.examName} {q.examYear}
                        </span>

                        {/* Question Number */}
                        <span style={{
                          background: '#1e293b',
                          color: '#94a3b8',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '700'
                        }}>
                          Q#{q.questionNo || '?'}
                        </span>

                        {/* Topic Badge */}
                        <span style={{
                          background: 'rgba(20, 184, 166, 0.1)',
                          color: '#2dd4bf',
                          border: '1px solid rgba(20, 184, 166, 0.3)',
                          padding: '3px 10px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: '700'
                        }}>
                          {q.srcTopic}
                        </span>

                        {/* Difficulty Badge */}
                        <span style={{
                          background: diff.bg,
                          color: diff.color,
                          border: `1px solid ${diff.border}`,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '700'
                        }}>
                          {diff.label}
                        </span>
                      </div>

                      {/* Expand / Collapse Indicator */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCard(q.id);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: isExpanded ? '#38bdf8' : '#64748b',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        {isExpanded ? (
                          <>Click to collapse <ChevronUp size={16} /></>
                        ) : (
                          <>Click to expand <ChevronDown size={16} /></>
                        )}
                      </button>
                    </div>

                    {/* Question Stem */}
                    <div style={{ marginBottom: isExpanded ? '20px' : '8px' }}>
                      {isExpanded ? (
                        renderFormattedStem(q.stem)
                      ) : (
                        <div>
                          <p style={{
                            color: '#f8fafc',
                            fontSize: '15.5px',
                            fontWeight: '600',
                            lineHeight: 1.55,
                            margin: '0 0 10px 0',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {q.stem}
                          </p>
                          <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{q.options?.length || 4} Options available</span>
                            <span>•</span>
                            <span style={{ color: '#38bdf8', fontWeight: '600' }}>Click card to solve & check answer</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Expanded Content (Options + Solution Box + Footer Toolbar) */}
                    {isExpanded && (
                      <div>
                        {/* Options Section */}
                        {(() => {
                          const isAnswerRevealed = !!revealed[q.id];
                          const userChoice = userSelectedOption[q.id];

                          return (
                            <>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                                {(q.options || []).map((opt) => {
                                  const isSelected = userChoice === opt.label;
                                  const isCorrect = (q.correctLabel || '').toLowerCase() === (opt.label || '').toLowerCase();

                                  let optBg = '#090d16';
                                  let optBorder = '#1e293b';
                                  let optTextColor = '#cbd5e1';
                                  let badgeBg = '#1e293b';
                                  let badgeColor = '#94a3b8';

                                  if (isAnswerRevealed) {
                                    if (isCorrect) {
                                      optBg = 'rgba(16, 185, 129, 0.14)';
                                      optBorder = '#10b981';
                                      optTextColor = '#a7f3d0';
                                      badgeBg = '#10b981';
                                      badgeColor = '#ffffff';
                                    } else if (isSelected) {
                                      optBg = 'rgba(239, 68, 68, 0.14)';
                                      optBorder = '#ef4444';
                                      optTextColor = '#fca5a5';
                                      badgeBg = '#ef4444';
                                      badgeColor = '#ffffff';
                                    }
                                  } else if (isSelected) {
                                    optBg = 'rgba(56, 189, 248, 0.08)';
                                    optBorder = '#38bdf8';
                                    optTextColor = '#f8fafc';
                                    badgeBg = '#0284c7';
                                    badgeColor = '#ffffff';
                                  }

                                  return (
                                    <div
                                      key={opt.label}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setUserSelectedOption(prev => ({ ...prev, [q.id]: opt.label }));
                                      }}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 18px',
                                        borderRadius: '10px',
                                        background: optBg,
                                        border: `1px solid ${optBorder}`,
                                        color: optTextColor,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease'
                                      }}
                                    >
                                      <span style={{
                                        width: '26px',
                                        height: '26px',
                                        borderRadius: '6px',
                                        background: badgeBg,
                                        color: badgeColor,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        fontWeight: '800',
                                        flexShrink: 0
                                      }}>
                                        {opt.label.toUpperCase()}
                                      </span>
                                      <span style={{ fontSize: '14.5px', lineHeight: 1.5, flex: 1 }}>
                                        {opt.text}
                                      </span>

                                      {isAnswerRevealed && isCorrect && (
                                        <span style={{ 
                                          background: 'rgba(16, 185, 129, 0.2)', 
                                          color: '#34d399', 
                                          padding: '2px 8px', 
                                          borderRadius: '6px', 
                                          fontSize: '11px', 
                                          fontWeight: '800' 
                                        }}>
                                          ✓ Correct Answer
                                        </span>
                                      )}

                                      {isAnswerRevealed && isSelected && !isCorrect && (
                                        <span style={{ 
                                          background: 'rgba(239, 68, 68, 0.2)', 
                                          color: '#fca5a5', 
                                          padding: '2px 8px', 
                                          borderRadius: '6px', 
                                          fontSize: '11px', 
                                          fontWeight: '800' 
                                        }}>
                                          ✕ Your Choice
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Interactive Prompt & Reveal Toolbar */}
                              {!isAnswerRevealed ? (
                                <div style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  background: '#090d16',
                                  border: '1px solid #1e293b',
                                  borderRadius: '10px',
                                  padding: '12px 18px',
                                  marginBottom: '20px'
                                }}>
                                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                                    {userChoice ? (
                                      <span>Selected Option <strong style={{ color: '#38bdf8' }}>({userChoice.toUpperCase()})</strong>. Ready to verify?</span>
                                    ) : (
                                      <span>Pick an option above to test your knowledge</span>
                                    )}
                                  </span>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRevealed(prev => ({ ...prev, [q.id]: true }));
                                    }}
                                    style={{
                                      padding: '7px 18px',
                                      borderRadius: '8px',
                                      border: '1px solid',
                                      borderColor: userChoice ? '#10b981' : '#334155',
                                      background: userChoice ? '#059669' : '#1e293b',
                                      color: userChoice ? '#ffffff' : '#cbd5e1',
                                      fontSize: '13px',
                                      fontWeight: '700',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s ease'
                                    }}
                                  >
                                    {userChoice ? 'Check Answer ✓' : 'Reveal Answer ⌄'}
                                  </button>
                                </div>
                              ) : (
                                <div style={{ marginBottom: '20px' }}>
                                  {/* Verified Solution Box */}
                                  <div style={{
                                    background: '#061a14',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    borderRadius: '12px',
                                    padding: '18px 22px',
                                    marginBottom: '10px'
                                  }}>
                                    {/* Solution Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#10b981', letterSpacing: '0.06em' }}>
                                          OFFICIAL KEY VERIFIED
                                        </span>
                                        <span style={{
                                          background: 'rgba(16, 185, 129, 0.2)',
                                          color: '#34d399',
                                          border: '1px solid rgba(16, 185, 129, 0.4)',
                                          padding: '2px 8px',
                                          borderRadius: '6px',
                                          fontSize: '11px',
                                          fontWeight: '800'
                                        }}>
                                          Correct Option: ({(q.correctLabel || '').toUpperCase()})
                                        </span>
                                      </div>

                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCopyNote(q);
                                        }}
                                        style={{
                                          background: 'transparent',
                                          border: 'none',
                                          color: '#94a3b8',
                                          fontSize: '11.5px',
                                          fontWeight: '600',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '5px',
                                          cursor: 'pointer'
                                        }}
                                      >
                                        {copiedId === q.id ? (
                                          <><Check size={13} color="#10b981" /> Copied!</>
                                        ) : (
                                          <><Copy size={13} /> Copy Note</>
                                        )}
                                      </button>
                                    </div>

                                    {/* Explanation Body */}
                                    <div style={{ color: '#cbd5e1', fontSize: '13.5px', lineHeight: 1.6 }}>
                                      <p style={{ margin: '0 0 8px 0' }}>
                                        <strong>Explanation:</strong> Under official key verification for {q.examName} {q.examYear}, Option <strong>({(q.correctLabel || '').toUpperCase()})</strong> is the definitive answer.
                                      </p>
                                      <p style={{ margin: 0, color: '#38bdf8', fontSize: '12.5px', fontFamily: 'monospace' }}>
                                        Source: Official {q.examName} Key • Indian Polity Archive
                                      </p>
                                    </div>
                                  </div>

                                  {/* Reset / Re-attempt button */}
                                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setRevealed(prev => ({ ...prev, [q.id]: false }));
                                        setUserSelectedOption(prev => {
                                          const next = { ...prev };
                                          delete next[q.id];
                                          return next;
                                        });
                                      }}
                                      style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#64748b',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        textDecoration: 'underline'
                                      }}
                                    >
                                      Hide Answer / Re-attempt
                                    </button>
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}

                        {/* Card Bottom Toolbar */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderTop: '1px solid #1e293b',
                          paddingTop: '16px',
                          fontSize: '12px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#64748b' }}>Subject:</span>
                            <span style={{ background: '#1e293b', color: '#cbd5e1', padding: '3px 8px', borderRadius: '6px', fontWeight: '600' }}>
                              {q.srcSubject || 'Indian Polity'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                alert(`Ask Nano AI: Exploring concept "${q.srcTopic}" for question #${q.questionNo}`);
                              }}
                              style={{
                                background: 'rgba(56, 189, 248, 0.1)',
                                border: '1px solid rgba(56, 189, 248, 0.3)',
                                color: '#38bdf8',
                                padding: '5px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer'
                              }}
                            >
                              <Sparkles size={13} /> Ask Nano AI
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setBookmarked(prev => ({ ...prev, [q.id]: !prev[q.id] }));
                              }}
                              style={{
                                background: '#1e293b',
                                border: 'none',
                                color: isBookmarked ? '#f59e0b' : '#94a3b8',
                                padding: '6px',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                              title="Bookmark question"
                            >
                              <Bookmark size={15} fill={isBookmarked ? '#f59e0b' : 'none'} />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(window.location.href);
                                alert('Link copied to clipboard!');
                              }}
                              style={{
                                background: '#1e293b',
                                border: 'none',
                                color: '#94a3b8',
                                padding: '6px',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                              title="Share question"
                            >
                              <Share2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls at Bottom */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '16px',
              padding: '16px 4px',
              fontSize: '13px',
              color: '#94a3b8'
            }}>
              <div>
                Showing <strong>{(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredQuestions.length)}</strong> of <strong>{filteredQuestions.length}</strong> questions
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #1e293b',
                    background: '#0f172a',
                    color: currentPage === 1 ? '#475569' : '#cbd5e1',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Previous
                </button>

                {/* Page Number Pills */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;

                  const isActive = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: isActive ? '#0284c7' : '#1e293b',
                        background: isActive ? '#0284c7' : '#0f172a',
                        color: isActive ? '#ffffff' : '#cbd5e1',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span style={{ color: '#475569' }}>...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        border: '1px solid #1e293b',
                        background: '#0f172a',
                        color: '#cbd5e1',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #1e293b',
                    background: '#0f172a',
                    color: currentPage === totalPages ? '#475569' : '#cbd5e1',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

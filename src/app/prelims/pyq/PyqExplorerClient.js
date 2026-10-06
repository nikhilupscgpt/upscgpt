'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

export default function PyqExplorerClient({ initialQuestions }) {
  const [selectedTopic, setSelectedTopic] = useState('ALL');
  const [selectedExam, setSelectedExam] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Quiz interaction state
  const [userAnswers, setUserAnswers] = useState({}); // { [questionId]: 'a' }
  const [revealed, setRevealed] = useState({}); // { [questionId]: boolean }

  // Extract all unique topics and counts
  const topicCounts = useMemo(() => {
    const counts = {};
    for (const q of initialQuestions) {
      const t = q.srcTopic || 'General';
      counts[t] = (counts[t] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [initialQuestions]);

  // Extract all unique years
  const availableYears = useMemo(() => {
    const years = new Set(initialQuestions.map(q => q.examYear).filter(Boolean));
    return Array.from(years).sort((a, b) => b - a);
  }, [initialQuestions]);

  // Filter questions based on active criteria
  const filteredQuestions = useMemo(() => {
    return initialQuestions.filter(q => {
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

      // Keyword Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inStem = q.stem.toLowerCase().includes(query);
        const inTopic = (q.srcTopic || '').toLowerCase().includes(query);
        const inOptions = (q.options || []).some(o => o.text.toLowerCase().includes(query));
        if (!inStem && !inTopic && !inOptions) return false;
      }

      return true;
    });
  }, [initialQuestions, selectedExam, selectedTopic, selectedYear, searchQuery]);

  const handleSelectOption = (qId, label) => {
    setUserAnswers(prev => ({ ...prev, [qId]: label }));
  };

  const handleToggleReveal = (qId) => {
    setRevealed(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Top Breadcrumb */}
      <div style={{ marginBottom: '24px' }}>
        <Link 
          href="/prelims" 
          style={{ 
            color: '#94a3b8', 
            textDecoration: 'none', 
            fontSize: '14px', 
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          ← Back to Prelims Command Center
        </Link>
      </div>

      {/* Hero Header */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          padding: '6px 14px', 
          background: 'rgba(59, 130, 246, 0.12)', 
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: '20px', 
          color: '#60a5fa', 
          fontSize: '12px', 
          fontWeight: '700', 
          letterSpacing: '0.05em',
          marginBottom: '14px' 
        }}>
          🎯 PRELIMS PYQ ARCHIVE & TOPIC ENGINE
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#ffffff', margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>
          Topic-Wise PYQ Explorer
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.05rem', margin: 0, maxWidth: '750px', lineHeight: 1.6 }}>
          Filter and master real previous year questions from <strong>UPSC CSE</strong> & <strong>CDS</strong> (2011–2023). 
          Test your conceptual clarity topic-by-topic with instant answer verification.
        </p>
      </div>

      {/* Filter Toolbar Box */}
      <div style={{ 
        background: '#131b2e', 
        border: '1px solid #1e293b', 
        borderRadius: '18px', 
        padding: '24px', 
        marginBottom: '32px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Row 1: Search & Exam & Year */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '16px', marginBottom: '20px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <input 
              type="text"
              placeholder="Search concepts, questions, or topics (e.g. anti-defection, money bill)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: '#090d16',
                border: '1px solid #334155',
                borderRadius: '10px',
                color: '#f8fafc',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Exam Filter Segment */}
          <div style={{ display: 'flex', background: '#090d16', padding: '4px', borderRadius: '10px', border: '1px solid #334155' }}>
            {[
              { id: 'ALL', label: 'All Exams' },
              { id: 'UPSC CSE', label: 'UPSC CSE' },
              { id: 'CDS', label: 'CDS' }
            ].map(exam => (
              <button
                key={exam.id}
                onClick={() => setSelectedExam(exam.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '7px',
                  border: 'none',
                  background: selectedExam === exam.id ? '#3b82f6' : 'transparent',
                  color: selectedExam === exam.id ? '#ffffff' : '#94a3b8',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {exam.label}
              </button>
            ))}
          </div>

          {/* Year Dropdown */}
          <select 
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            style={{
              padding: '10px 14px',
              background: '#090d16',
              border: '1px solid #334155',
              borderRadius: '10px',
              color: '#f8fafc',
              fontSize: '13px',
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

        {/* Row 2: Topic Pills (Scrollable / Wrap) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.08em' }}>
              Filter by Topic ({topicCounts.length} available)
            </span>
            {selectedTopic !== 'ALL' && (
              <button 
                onClick={() => setSelectedTopic('ALL')}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: '#60a5fa', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  cursor: 'pointer' 
                }}
              >
                Reset Topic Filter
              </button>
            )}
          </div>

          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '8px', 
            maxHeight: '135px', 
            overflowY: 'auto',
            paddingRight: '6px'
          }}>
            <button
              onClick={() => setSelectedTopic('ALL')}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: selectedTopic === 'ALL' ? '#3b82f6' : '#334155',
                background: selectedTopic === 'ALL' ? 'rgba(59, 130, 246, 0.2)' : '#090d16',
                color: selectedTopic === 'ALL' ? '#93c5fd' : '#cbd5e1',
                fontSize: '12px',
                fontWeight: selectedTopic === 'ALL' ? '700' : '500',
                cursor: 'pointer'
              }}
            >
              All Topics ({initialQuestions.length})
            </button>

            {topicCounts.map(([topic, count]) => {
              const isSelected = selectedTopic === topic;
              return (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: isSelected ? '#10b981' : '#1e293b',
                    background: isSelected ? 'rgba(16, 185, 129, 0.2)' : '#090d16',
                    color: isSelected ? '#6ee7b7' : '#94a3b8',
                    fontSize: '12px',
                    fontWeight: isSelected ? '700' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {topic} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 4px' }}>
        <div style={{ fontSize: '15px', color: '#94a3b8' }}>
          Showing <strong style={{ color: '#f8fafc' }}>{filteredQuestions.length}</strong> questions
          {selectedTopic !== 'ALL' && <span> under <span style={{ color: '#10b981', fontWeight: 'bold' }}>"{selectedTopic}"</span></span>}
          {selectedExam !== 'ALL' && <span> in <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{selectedExam}</span></span>}
          {selectedYear !== 'ALL' && <span> ({selectedYear})</span>}
        </div>

        {(selectedTopic !== 'ALL' || selectedExam !== 'ALL' || selectedYear !== 'ALL' || searchQuery) && (
          <button 
            onClick={() => {
              setSelectedTopic('ALL');
              setSelectedExam('ALL');
              setSelectedYear('ALL');
              setSearchQuery('');
            }}
            style={{ 
              background: '#1e293b', 
              border: '1px solid #334155', 
              color: '#cbd5e1', 
              padding: '6px 12px', 
              borderRadius: '8px', 
              fontSize: '12px', 
              cursor: 'pointer' 
            }}
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Question Cards Feed */}
      {filteredQuestions.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '64px 20px', 
          background: '#131b2e', 
          border: '1px solid #1e293b', 
          borderRadius: '16px',
          color: '#94a3b8' 
        }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#f8fafc' }}>No questions match your current filters.</p>
          <p style={{ fontSize: '14px', margin: 0 }}>Try clearing the search query or selecting "All Topics".</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {filteredQuestions.map((q, idx) => {
            const userChoice = userAnswers[q.id];
            const isRevealed = revealed[q.id];

            return (
              <div 
                key={q.id || idx}
                style={{
                  background: '#131b2e',
                  border: '1px solid #1e293b',
                  borderRadius: '16px',
                  padding: '28px',
                  transition: 'border-color 0.2s',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
              >
                {/* Question Header: Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ 
                      background: 'rgba(59, 130, 246, 0.15)', 
                      color: '#60a5fa', 
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      padding: '4px 10px', 
                      borderRadius: '6px', 
                      fontSize: '12px', 
                      fontWeight: '800' 
                    }}>
                      {q.examName} {q.examYear}
                    </span>
                    <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 'bold' }}>
                      Q#{q.questionNo}
                    </span>
                  </div>

                  <span style={{ 
                    background: 'rgba(16, 185, 129, 0.1)', 
                    color: '#34d399', 
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontSize: '11px', 
                    fontWeight: '700' 
                  }}>
                    {q.srcTopic}
                  </span>
                </div>

                {/* Question Stem */}
                <div style={{ 
                  color: '#f8fafc', 
                  fontSize: '16px', 
                  lineHeight: '1.7', 
                  marginBottom: '22px', 
                  whiteSpace: 'pre-line',
                  fontWeight: '500'
                }}>
                  {q.stem}
                </div>

                {/* Options List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
                  {q.options.map((opt) => {
                    const isSelected = userChoice === opt.label;
                    const isCorrect = q.correctLabel === opt.label;

                    let optBg = '#090d16';
                    let optBorder = '#1e293b';
                    let optTextColor = '#cbd5e1';

                    if (isRevealed) {
                      if (isCorrect) {
                        optBg = 'rgba(16, 185, 129, 0.18)';
                        optBorder = '#10b981';
                        optTextColor = '#a7f3d0';
                      } else if (isSelected) {
                        optBg = 'rgba(239, 68, 68, 0.18)';
                        optBorder = '#ef4444';
                        optTextColor = '#fca5a5';
                      }
                    } else if (isSelected) {
                      optBg = 'rgba(59, 130, 246, 0.18)';
                      optBorder = '#3b82f6';
                      optTextColor = '#bfdbfe';
                    }

                    return (
                      <div
                        key={opt.label}
                        onClick={() => handleSelectOption(q.id, opt.label)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          padding: '12px 16px',
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
                          borderRadius: '50%', 
                          background: isSelected || (isRevealed && isCorrect) ? 'transparent' : '#1e293b',
                          border: `1px solid ${optBorder}`,
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontWeight: '800', 
                          fontSize: '12px',
                          flexShrink: 0
                        }}>
                          {opt.label.toUpperCase()}
                        </span>
                        <span style={{ fontSize: '15px', lineHeight: '1.5', flex: 1, marginTop: '2px' }}>
                          {opt.text}
                        </span>
                        {isRevealed && isCorrect && (
                          <span style={{ color: '#10b981', fontWeight: '800', fontSize: '12px' }}>
                            ✓ Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer Toolbar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {q.srcSubject}
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleToggleReveal(q.id)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid #334155',
                        background: isRevealed ? '#1e293b' : '#059669',
                        color: isRevealed ? '#cbd5e1' : '#ffffff',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isRevealed ? 'Hide Answer' : 'Reveal Answer'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

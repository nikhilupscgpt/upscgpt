'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { X, Check, ChevronDown, ChevronUp, Sparkles, BookOpen, Clock, Settings, ArrowRight } from 'lucide-react';
import { SUBJECT_ORDER, SUBJECT_SHORT } from './topicGroups';

const PRESET_SIZES = [10, 20, 30, 50];
const EXAM_OPTIONS = [
  ['ALL', 'All (CSE & CDS)'],
  ['UPSC CSE', 'UPSC CSE Only'],
  ['CDS', 'CDS Only'],
];
const YEAR_OPTIONS = [
  ['ALL', 'All Years (2011–2026)'],
  ['2020-2026', '2020–2026 (Recent)'],
  ['2015-2019', '2015–2019'],
  ['2011-2014', '2011–2014'],
];

export default function QuizSetupModal({ isOpen, onClose, questions }) {
  const router = useRouter();

  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]); // if empty, all topics in selected subjects
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [numQuestions, setNumQuestions] = useState(20);
  const [mode, setMode] = useState('practice'); // 'practice' | 'exam'
  const [exam, setExam] = useState('ALL');
  const [years, setYears] = useState('ALL');

  // Compute subject question counts
  const subjectStats = useMemo(() => {
    const counts = {};
    for (const q of questions) {
      if (q.srcSubject) {
        counts[q.srcSubject] = (counts[q.srcSubject] || 0) + 1;
      }
    }
    const order = SUBJECT_ORDER.filter(s => counts[s]);
    const extras = Object.keys(counts).filter(s => !SUBJECT_ORDER.includes(s));
    return [...order, ...extras].map(s => ({
      name: s,
      short: SUBJECT_SHORT[s] || s,
      count: counts[s] || 0,
    }));
  }, [questions]);

  // Compute topics per subject
  const subjectTopicsMap = useMemo(() => {
    const map = {};
    for (const q of questions) {
      if (!q.srcSubject || !q.srcTopic) continue;
      if (!map[q.srcSubject]) map[q.srcSubject] = {};
      map[q.srcSubject][q.srcTopic] = (map[q.srcSubject][q.srcTopic] || 0) + 1;
    }
    const result = {};
    for (const [sub, topicCounts] of Object.entries(map)) {
      result[sub] = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]);
    }
    return result;
  }, [questions]);

  // Toggle subject selection (limit to 3 like Dr Shivin's setup)
  const toggleSubject = (s) => {
    setSelectedSubjects(prev => {
      if (prev.includes(s)) {
        // Unselecting subject -> also remove its topics
        const nextSubs = prev.filter(x => x !== s);
        const subTopics = (subjectTopicsMap[s] || []).map(([t]) => t);
        setSelectedTopics(curr => curr.filter(t => !subTopics.includes(t)));
        if (expandedSubject === s) setExpandedSubject(null);
        return nextSubs;
      } else {
        if (prev.length >= 3) {
          // Replace last or reject
          return [...prev.slice(1), s];
        }
        return [...prev, s];
      }
    });
  };

  // Toggle topic selection
  const toggleTopic = (t) => {
    setSelectedTopics(prev => {
      if (prev.includes(t)) return prev.filter(x => x !== t);
      return [...prev, t];
    });
  };

  // Select all topics for a given subject
  const selectAllTopicsForSubject = (s) => {
    const all = (subjectTopicsMap[s] || []).map(([t]) => t);
    setSelectedTopics(prev => Array.from(new Set([...prev, ...all])));
  };

  // Clear topics for a given subject
  const clearTopicsForSubject = (s) => {
    const all = (subjectTopicsMap[s] || []).map(([t]) => t);
    setSelectedTopics(prev => prev.filter(t => !all.includes(t)));
  };

  // Calculate live matching questions
  const availableCount = useMemo(() => {
    return questions.filter(q => {
      if (selectedSubjects.length > 0 && !selectedSubjects.includes(q.srcSubject)) return false;
      if (selectedTopics.length > 0 && !selectedTopics.includes(q.srcTopic)) return false;
      if (exam === 'UPSC CSE' && !(q.examName || '').includes('CSE')) return false;
      if (exam === 'CDS' && !(q.examName || '').includes('CDS')) return false;
      if (years !== 'ALL') {
        const [lo, hi] = years.split('-').map(Number);
        if (q.examYear < lo || q.examYear > hi) return false;
      }
      return true;
    }).length;
  }, [questions, selectedSubjects, selectedTopics, exam, years]);

  const handleLaunch = () => {
    const p = new URLSearchParams();
    p.set('mode', mode);
    p.set('n', String(numQuestions));
    if (selectedSubjects.length > 0) p.set('subjects', selectedSubjects.join(','));
    if (selectedTopics.length > 0) p.set('topics', selectedTopics.join(','));
    if (exam !== 'ALL') p.set('exam', exam);
    if (years !== 'ALL') p.set('years', years);

    router.push(`/prelims/pyq/practice?${p.toString()}`);
  };

  if (!isOpen) return null;

  return (
    <div className="pp-modal-bg" onClick={onClose}>
      <div className="pq-quiz-modal" onClick={e => e.stopPropagation()}>
        <div className="pq-qm-head">
          <div>
            <div className="pq-qm-badge"><Sparkles size={13} /> Custom Quiz Builder</div>
            <h2 className="pq-qm-title">Design Your Practice Test</h2>
            <p className="pq-qm-sub">Select up to 3 subjects, customize topics, and choose your test mode.</p>
          </div>
          <button className="pq-qm-close" onClick={onClose} aria-label="Close modal"><X size={18} /></button>
        </div>

        <div className="pq-qm-body">
          {/* Step 1: Subjects */}
          <div className="pq-qm-sec">
            <div className="pq-qm-sec-title">
              <span>1. Choose Subjects (Pick up to 3)</span>
              <span className="pq-qm-sec-meta">{selectedSubjects.length}/3 selected</span>
            </div>
            <div className="pq-qm-subs-grid">
              {subjectStats.map(s => {
                const isSelected = selectedSubjects.includes(s.name);
                const isExpanded = expandedSubject === s.name;
                const topics = subjectTopicsMap[s.name] || [];
                const activeTopicsCount = topics.filter(([t]) => selectedTopics.includes(t)).length;

                return (
                  <div key={s.name} className={`pq-qm-sub-card ${isSelected ? 'is-selected' : ''}`}>
                    <div className="pq-qm-sub-main" onClick={() => toggleSubject(s.name)}>
                      <div className="pq-qm-sub-check">
                        {isSelected && <Check size={13} />}
                      </div>
                      <div className="pq-qm-sub-info">
                        <b>{s.short}</b>
                        <small>{s.count} Qs{activeTopicsCount > 0 ? ` · ${activeTopicsCount} topics picked` : ''}</small>
                      </div>
                    </div>

                    {isSelected && topics.length > 0 && (
                      <button
                        className="pq-qm-sub-expand"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedSubject(isExpanded ? null : s.name);
                        }}
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    )}

                    {/* Subtopic Accordion */}
                    {isSelected && isExpanded && topics.length > 0 && (
                      <div className="pq-qm-topics-dropdown">
                        <div className="pq-qm-topics-actions">
                          <button onClick={() => selectAllTopicsForSubject(s.name)}>Select all</button>
                          <span>·</span>
                          <button onClick={() => clearTopicsForSubject(s.name)}>Clear</button>
                        </div>
                        <div className="pq-qm-topics-list">
                          {topics.map(([t, count]) => {
                            const isTopicActive = selectedTopics.includes(t);
                            return (
                              <label key={t} className="pq-qm-topic-item">
                                <input
                                  type="checkbox"
                                  checked={isTopicActive}
                                  onChange={() => toggleTopic(t)}
                                />
                                <span>{t}</span>
                                <small>({count})</small>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Test Mode */}
          <div className="pq-qm-sec">
            <div className="pq-qm-sec-title">
              <span>2. Choose Practice Mode</span>
            </div>
            <div className="pq-qm-modes">
              <label
                className={`pq-qm-mode-card ${mode === 'practice' ? 'is-active' : ''}`}
                onClick={() => setMode('practice')}
              >
                <div className="pq-qm-mode-radio">
                  <div className={`pq-radio-dot ${mode === 'practice' ? 'is-on' : ''}`} />
                </div>
                <div className="pq-qm-mode-info">
                  <div className="pq-qm-mode-head">
                    <b>🟢 Practice Mode (Step-by-Step)</b>
                    <span className="pq-qm-mode-tag">Recommended for Learning</span>
                  </div>
                  <p>Immediate answer verification and full explanation after every question. Real-time palette updates.</p>
                </div>
              </label>

              <label
                className={`pq-qm-mode-card ${mode === 'exam' ? 'is-active' : ''}`}
                onClick={() => setMode('exam')}
              >
                <div className="pq-qm-mode-radio">
                  <div className={`pq-radio-dot ${mode === 'exam' ? 'is-on' : ''}`} />
                </div>
                <div className="pq-qm-mode-info">
                  <div className="pq-qm-mode-head">
                    <b>🔵 Exam Mode (Timed Simulation)</b>
                    <span className="pq-qm-mode-tag">Real Exam Feel</span>
                  </div>
                  <p>Strict UPSC simulation. Solutions and scoring analysis revealed only upon submitting the entire test.</p>
                </div>
              </label>
            </div>
          </div>

          {/* Step 3: Question Count & Filters */}
          <div className="pq-qm-sec">
            <div className="pq-qm-sec-title">
              <span>3. Question Count &amp; Filters</span>
            </div>
            <div className="pq-qm-controls-grid">
              <div>
                <label className="pq-qm-label">Questions</label>
                <div className="pq-qm-pills">
                  {PRESET_SIZES.map(sz => (
                    <button
                      key={sz}
                      className={numQuestions === sz ? 'is-active' : ''}
                      onClick={() => setNumQuestions(sz)}
                    >
                      {sz} Qs
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="pq-qm-label">Exam</label>
                <select value={exam} onChange={e => setExam(e.target.value)} className="pq-qm-select">
                  {EXAM_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>

              <div>
                <label className="pq-qm-label">Years</label>
                <select value={years} onChange={e => setYears(e.target.value)} className="pq-qm-select">
                  {YEAR_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pq-qm-foot">
          <div className="pq-qm-foot-stat">
            <b>{availableCount}</b> question{availableCount === 1 ? '' : 's'} available
            {selectedSubjects.length > 0 && ` across ${selectedSubjects.length} subject${selectedSubjects.length === 1 ? '' : 's'}`}
          </div>
          <div className="pq-qm-foot-actions">
            <button className="pq-btn" onClick={onClose}>Cancel</button>
            <button
              className="pq-btn pq-btn-primary pq-qm-launch"
              disabled={availableCount === 0}
              onClick={handleLaunch}
            >
              Start {mode === 'practice' ? 'Practice' : 'Exam'} ({Math.min(numQuestions, availableCount)} Qs)
              <ArrowRight size={15} style={{ marginLeft: 6 }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

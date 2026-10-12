'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Plus, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw, 
  Sparkles, 
  Flame, 
  BookOpen, 
  X, 
  Check, 
  HelpCircle,
  FileText,
  Layers,
  ArrowRight
} from 'lucide-react';
import { isNewPatternQuestion, isPairQuestion, isStatementQuestion } from '@/lib/pyqPattern';

export default function PyqAdminClient({ session }) {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'bulk' | 'add'

  // Query & Filters state
  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('ALL');
  const [topic, setTopic] = useState('ALL');
  const [exam, setExam] = useState('ALL');
  const [year, setYear] = useState('ALL');
  const [pattern, setPattern] = useState('ALL');
  const [answerStatus, setAnswerStatus] = useState('ALL');

  const [filterOptions, setFilterOptions] = useState({ subjects: [], years: [], exams: [] });

  // Edit Modal State
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editForm, setEditForm] = useState({
    stem: '',
    options: [],
    correctLabel: '',
    explanation: '',
    srcSubject: '',
    srcTopic: '',
    examName: '',
    examYear: 2024,
    questionNo: '',
    difficulty: 'MEDIUM',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Bulk Upload State
  const [bulkInput, setBulkInput] = useState('');
  const [bulkMode, setBulkMode] = useState('upsert'); // 'upsert' | 'update_only' | 'insert_only'
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const [bulkPreview, setBulkPreview] = useState(null);

  // Add Single Question State
  const [newQuestionForm, setNewQuestionForm] = useState({
    stem: '',
    options: [
      { label: 'A', text: '' },
      { label: 'B', text: '' },
      { label: 'C', text: '' },
      { label: 'D', text: '' },
    ],
    correctLabel: 'a',
    explanation: '',
    srcSubject: 'Indian Polity',
    srcTopic: 'General',
    examName: 'UPSC CSE Pre',
    examYear: 2025,
    questionNo: '',
    difficulty: 'MEDIUM',
  });
  const [addingQuestion, setAddingQuestion] = useState(false);

  // Fetch Questions
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const p = new URLSearchParams();
      p.set('page', page.toString());
      p.set('limit', limit.toString());
      if (search.trim()) p.set('q', search.trim());
      if (subject !== 'ALL') p.set('subject', subject);
      if (topic !== 'ALL') p.set('topic', topic);
      if (exam !== 'ALL') p.set('exam', exam);
      if (year !== 'ALL') p.set('year', year);
      if (pattern !== 'ALL') p.set('pattern', pattern);
      if (answerStatus !== 'ALL') p.set('answerStatus', answerStatus);

      const res = await fetch(`/api/admin/pyq?${p.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch questions');
      }

      setQuestions(data.questions || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      if (data.filterOptions) {
        setFilterOptions(data.filterOptions);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, subject, topic, exam, year, pattern, answerStatus]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Handle Search Submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchQuestions();
  };

  const handleClearSearch = () => {
    setSearch('');
    setPage(1);
  };

  // Open Edit Modal
  const handleOpenEdit = (q) => {
    setEditingQuestion(q);
    // Ensure 4 options format
    let opts = q.options || [];
    if (!Array.isArray(opts) || opts.length === 0) {
      opts = [
        { label: 'A', text: '' },
        { label: 'B', text: '' },
        { label: 'C', text: '' },
        { label: 'D', text: '' },
      ];
    }
    setEditForm({
      stem: q.stem || '',
      options: opts.map((o, idx) => ({
        label: (o.label || String.fromCharCode(65 + idx)).toUpperCase(),
        text: o.text || ''
      })),
      correctLabel: (q.correctLabel || '').toLowerCase(),
      explanation: q.explanation || '',
      srcSubject: q.srcSubject || '',
      srcTopic: q.srcTopic || '',
      examName: q.examName || '',
      examYear: q.examYear || 2024,
      questionNo: q.questionNo || '',
      difficulty: q.difficulty || 'MEDIUM',
    });
  };

  // Save Edit
  const handleSaveEdit = async () => {
    if (!editingQuestion) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/pyq/${editingQuestion.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save changes');

      // Update question in local state
      setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? data.question : q));
      setEditingQuestion(null);
    } catch (err) {
      alert('Error updating question: ' + err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question? This cannot be undone.')) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/pyq/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to delete');
      }
      setQuestions(prev => prev.filter(q => q.id !== id));
      setTotal(t => Math.max(0, t - 1));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  // Bulk File Upload or Text Paste
  const handleBulkFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setBulkInput(text);
        validateBulk(text);
      }
    };
    reader.readAsText(file);
  };

  const validateBulk = (text) => {
    setBulkResult(null);
    if (!text.trim()) {
      setBulkPreview(null);
      return;
    }
    try {
      let items = [];
      const trimmed = text.trim();
      if (trimmed.startsWith('[')) {
        items = JSON.parse(trimmed);
      } else {
        const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
        items = lines.map(l => JSON.parse(l));
      }

      if (!Array.isArray(items)) {
        setBulkPreview({ valid: false, error: 'Expected an array of questions or JSON Lines.' });
        return;
      }

      const subjects = {};
      items.forEach(q => {
        const sub = q.srcSubject || q.subject || 'Unknown';
        subjects[sub] = (subjects[sub] || 0) + 1;
      });

      setBulkPreview({
        valid: true,
        count: items.length,
        subjects,
        sample: items.slice(0, 2),
      });
    } catch (err) {
      setBulkPreview({ valid: false, error: err.message });
    }
  };

  const handleBulkSubmit = async () => {
    if (!bulkInput.trim()) return;
    setBulkLoading(true);
    setBulkResult(null);
    try {
      const res = await fetch('/api/admin/pyq/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: bulkInput, mode: bulkMode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bulk update failed');

      setBulkResult(data);
      // Refresh question list
      fetchQuestions();
    } catch (err) {
      setBulkResult({ error: err.message });
    } finally {
      setBulkLoading(false);
    }
  };

  // Add Single Question Submit
  const handleAddQuestionSubmit = async (e) => {
    e.preventDefault();
    setAddingQuestion(true);
    try {
      const res = await fetch('/api/admin/pyq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestionForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add question');

      alert('Question created successfully!');
      // Reset form
      setNewQuestionForm({
        stem: '',
        options: [
          { label: 'A', text: '' },
          { label: 'B', text: '' },
          { label: 'C', text: '' },
          { label: 'D', text: '' },
        ],
        correctLabel: 'a',
        explanation: '',
        srcSubject: 'Indian Polity',
        srcTopic: 'General',
        examName: 'UPSC CSE Pre',
        examYear: 2025,
        questionNo: '',
        difficulty: 'MEDIUM',
      });
      setActiveTab('list');
      fetchQuestions();
    } catch (err) {
      alert('Error creating question: ' + err.message);
    } finally {
      setAddingQuestion(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#020617',
      color: '#ffffff',
      fontFamily: 'var(--font-outfit), system-ui, -apple-system, sans-serif',
      padding: '30px 24px 80px',
    }}>
      <div style={{ maxWidth: '1360px', margin: '0 auto' }}>

        {/* TOP ADMIN BAR */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
          paddingBottom: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#f59e0b',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.05em'
              }}>
                ADMIN CONTROL CENTER
              </span>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                · Logged in as <strong>{session?.user?.name || 'Admin'}</strong>
              </span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
              PYQ Question CMS &amp; Content Editor
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              href="/admin"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#cbd5e1',
                fontSize: '0.85rem',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              ← Main Admin
            </Link>

            <Link
              href="/prelims/pyq"
              target="_blank"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '10px',
                background: '#3b82f6',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)'
              }}
            >
              <span>View Live PYQ Explorer</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '12px'
        }}>
          <button
            onClick={() => setActiveTab('list')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '12px',
              background: activeTab === 'list' ? '#3b82f6' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'list' ? '#ffffff' : '#94a3b8',
              border: activeTab === 'list' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            <Layers size={16} />
            <span>Questions List &amp; Editor ({total})</span>
          </button>

          <button
            onClick={() => setActiveTab('bulk')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '12px',
              background: activeTab === 'bulk' ? '#8b5cf6' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'bulk' ? '#ffffff' : '#94a3b8',
              border: activeTab === 'bulk' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            <UploadCloud size={16} />
            <span>Bulk JSON / JSONL Upload</span>
          </button>

          <button
            onClick={() => setActiveTab('add')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '12px',
              background: activeTab === 'add' ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'add' ? '#ffffff' : '#94a3b8',
              border: activeTab === 'add' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            <Plus size={16} />
            <span>Add Single Question</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: QUESTIONS LIST & EDITOR                                            */}
        {/* ========================================================================= */}
        {activeTab === 'list' && (
          <div>
            {/* SEARCH & FILTERS PANEL */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1.5px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '18px',
              padding: '20px 24px',
              marginBottom: '24px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)'
            }}>
              {/* Universal Search Bar */}
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(2, 6, 23, 0.8)',
                  border: '1.5px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '4px 14px'
                }}>
                  <Search size={18} style={{ color: '#64748b', marginRight: '10px' }} />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search any question by keyword, Article #, explanation, question number (e.g. Q45), or dedupHash..."
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: '#ffffff',
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      padding: '8px 0'
                    }}
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  style={{
                    padding: '10px 22px',
                    borderRadius: '12px',
                    background: '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  Search
                </button>
              </form>

              {/* Filters Row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
                {/* Subject Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Subject</label>
                  <select
                    value={subject}
                    onChange={e => { setSubject(e.target.value); setPage(1); }}
                    style={{
                      background: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      padding: '8px 12px',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    <option value="ALL">All Subjects</option>
                    {filterOptions.subjects.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Exam Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Exam</label>
                  <select
                    value={exam}
                    onChange={e => { setExam(e.target.value); setPage(1); }}
                    style={{
                      background: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      padding: '8px 12px',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    <option value="ALL">All Exams</option>
                    <option value="UPSC CSE">UPSC CSE</option>
                    <option value="CDS">CDS</option>
                  </select>
                </div>

                {/* Year Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Year</label>
                  <select
                    value={year}
                    onChange={e => { setYear(e.target.value); setPage(1); }}
                    style={{
                      background: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      padding: '8px 12px',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    <option value="ALL">All Years</option>
                    {filterOptions.years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                {/* Format / Pattern Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Pattern / Format</label>
                  <select
                    value={pattern}
                    onChange={e => { setPattern(e.target.value); setPage(1); }}
                    style={{
                      background: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      padding: '8px 12px',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    <option value="ALL">All Formats</option>
                    <option value="NEW">🔥 New Pattern (Pairs &amp; Statements)</option>
                    <option value="PAIR">Pair-Based Only</option>
                    <option value="STATEMENT">Statement I &amp; II Only</option>
                  </select>
                </div>

                {/* Answer / Quality Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Content Quality</label>
                  <select
                    value={answerStatus}
                    onChange={e => { setAnswerStatus(e.target.value); setPage(1); }}
                    style={{
                      background: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      padding: '8px 12px',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    <option value="ALL">All Status</option>
                    <option value="MISSING_ANSWER">⚠️ Missing Answer</option>
                    <option value="HAS_ANSWER">Has Correct Answer</option>
                    <option value="MISSING_EXPL">⚠️ Missing Explanation</option>
                    <option value="HAS_EXPL">Has Explanation</option>
                  </select>
                </div>

                {/* Limit Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginLeft: 'auto' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Per Page</label>
                  <select
                    value={limit}
                    onChange={e => { setLimit(parseInt(e.target.value, 10)); setPage(1); }}
                    style={{
                      background: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      padding: '8px 12px',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    <option value={20}>20</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ERROR BANNER */}
            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                borderRadius: '12px',
                padding: '14px 20px',
                marginBottom: '20px',
                color: '#f87171'
              }}>
                Error loading questions: {error}
              </div>
            )}

            {/* RESULTS COUNT & PAGINATION BAR */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 600 }}>
                Showing <strong>{questions.length}</strong> of <strong>{total}</strong> questions (Page {page} of {totalPages})
              </span>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  disabled={page <= 1 || loading}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: page <= 1 ? '#64748b' : '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: page <= 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  ← Prev
                </button>

                <span style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700 }}>
                  Page {page} / {totalPages}
                </span>

                <button
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: page >= totalPages ? '#64748b' : '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: page >= totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next →
                </button>
              </div>
            </div>

            {/* LOADING STATE */}
            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px' }} />
                <p>Loading questions from database...</p>
              </div>
            ) : questions.length === 0 ? (
              <div style={{
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px dashed rgba(255, 255, 255, 0.15)',
                borderRadius: '16px',
                padding: '60px',
                textAlign: 'center',
                color: '#94a3b8'
              }}>
                <HelpCircle size={36} style={{ margin: '0 auto 12px', color: '#64748b' }} />
                <h3>No questions matched your filters</h3>
                <p style={{ maxWidth: '400px', margin: '8px auto 0' }}>
                  Try adjusting your search query, or clear the subject/pattern filters to see more results.
                </p>
              </div>
            ) : (
              /* QUESTIONS LIST */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {questions.map((q) => {
                  const isPair = isPairQuestion(q);
                  const isStmt = isStatementQuestion(q);
                  const hasAnswer = !!q.correctLabel;
                  const hasExpl = !!q.explanation;

                  return (
                    <div
                      key={q.id}
                      style={{
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        padding: '20px 24px',
                        transition: 'border-color 0.15s'
                      }}
                    >
                      {/* Top Meta Badges */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{
                            background: 'rgba(59, 130, 246, 0.15)',
                            color: '#60a5fa',
                            padding: '3px 9px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 800
                          }}>
                            {q.examName || 'UPSC'} {q.examYear} {q.questionNo ? `· Q${q.questionNo}` : ''}
                          </span>

                          <span style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            color: '#cbd5e1',
                            padding: '3px 9px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}>
                            {q.srcSubject || 'General'}
                          </span>

                          {q.srcTopic && (
                            <span style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              color: '#94a3b8',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.72rem'
                            }}>
                              {q.srcTopic}
                            </span>
                          )}

                          {isPair && (
                            <span style={{
                              background: 'rgba(245, 158, 11, 0.18)',
                              color: '#f59e0b',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <Flame size={12} /> Pair-Based
                            </span>
                          )}

                          {isStmt && (
                            <span style={{
                              background: 'rgba(139, 92, 246, 0.18)',
                              color: '#a78bfa',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <Flame size={12} /> Statement I/II
                            </span>
                          )}

                          {!hasAnswer && (
                            <span style={{
                              background: 'rgba(239, 68, 68, 0.2)',
                              color: '#f87171',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 800
                            }}>
                              ⚠️ Missing Answer
                            </span>
                          )}

                          {!hasExpl && (
                            <span style={{
                              background: 'rgba(245, 158, 11, 0.18)',
                              color: '#fbbf24',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 700
                            }}>
                              ⚠️ No Explanation
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => handleOpenEdit(q)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 14px',
                              borderRadius: '8px',
                              background: '#3b82f6',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            <Edit3 size={13} />
                            <span>Edit Question</span>
                          </button>

                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              background: 'rgba(239, 68, 68, 0.1)',
                              color: '#ef4444',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                            title="Delete question from database"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Question Stem Text */}
                      <p style={{
                        fontSize: '0.96rem',
                        lineHeight: 1.6,
                        color: '#f1f5f9',
                        margin: '0 0 14px 0',
                        fontWeight: 500,
                        whiteSpace: 'pre-wrap'
                      }}>
                        {q.stem}
                      </p>

                      {/* Options Grid */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '8px',
                        marginBottom: '14px'
                      }}>
                        {(q.options || []).map((opt) => {
                          const isCorrect = (q.correctLabel || '').toLowerCase() === (opt.label || '').toLowerCase();
                          return (
                            <div
                              key={opt.label}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '8px',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                background: isCorrect ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                                border: isCorrect ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.06)'
                              }}
                            >
                              <span style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '6px',
                                background: isCorrect ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
                                color: isCorrect ? '#ffffff' : '#94a3b8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                flexShrink: 0
                              }}>
                                {opt.label}
                              </span>
                              <span style={{ fontSize: '0.85rem', color: isCorrect ? '#ffffff' : '#cbd5e1', lineHeight: 1.45 }}>
                                {opt.text}
                              </span>
                              {isCorrect && (
                                <span style={{ marginLeft: 'auto', color: '#10b981', fontSize: '0.72rem', fontWeight: 800 }}>
                                  ✓ Correct
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation Snippet */}
                      {q.explanation && (
                        <div style={{
                          background: 'rgba(2, 6, 23, 0.6)',
                          borderLeft: '3px solid #3b82f6',
                          borderRadius: '0 8px 8px 0',
                          padding: '10px 14px',
                          fontSize: '0.84rem',
                          color: '#94a3b8',
                          lineHeight: 1.55
                        }}>
                          <strong style={{ color: '#60a5fa', display: 'block', marginBottom: '4px' }}>
                            Explanation:
                          </strong>
                          {q.explanation.length > 300 ? `${q.explanation.slice(0, 300)}...` : q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: BULK JSON / JSONL UPLOAD & UPDATE                                 */}
        {/* ========================================================================= */}
        {activeTab === 'bulk' && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1.5px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 8px 0' }}>
              Bulk JSON / JSONL Question Ingestion &amp; Update
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 24px 0' }}>
              Upload or paste a standard JSON array (`[...]`) or JSON Lines (`.jsonl`) file. The engine matches existing questions by `id`, `dedupHash`, or `(examName, examYear, questionNo)` to update their stem, options, correct answers, and explanations.
            </p>

            {/* Mode Selector */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>
                INGESTION STRATEGY:
              </label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {[
                  ['upsert', 'Upsert (Update matching questions, insert new ones)'],
                  ['update_only', 'Update Only (Only overwrite matching existing questions)'],
                  ['insert_only', 'Insert Only (Only add new questions, leave existing untouched)']
                ].map(([m, label]) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setBulkMode(m)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '10px',
                      background: bulkMode === m ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      border: bulkMode === m ? '1.5px solid #8b5cf6' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: bulkMode === m ? '#ffffff' : '#94a3b8',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: 'pointer'
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* File Drag and Drop */}
            <div style={{
              border: '2px dashed rgba(255, 255, 255, 0.2)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              marginBottom: '20px',
              background: 'rgba(2, 6, 23, 0.4)'
            }}>
              <UploadCloud size={32} style={{ color: '#8b5cf6', margin: '0 auto 8px' }} />
              <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 600 }}>
                Select a `.json` or `.jsonl` file from your device
              </p>
              <input
                type="file"
                accept=".json,.jsonl,.txt"
                onChange={handleBulkFileUpload}
                style={{ fontSize: '0.85rem', color: '#94a3b8' }}
              />
            </div>

            {/* Paste Raw JSON/JSONL Area */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8' }}>
                  OR PASTE RAW JSON ARRAY / JSON LINES HERE:
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const sample = [
                      {
                        "examName": "UPSC CSE Pre",
                        "examYear": 2024,
                        "questionNo": 1,
                        "srcSubject": "Indian Polity",
                        "srcTopic": "Preamble",
                        "stem": "Which of the following statements about the Preamble to the Constitution of India is correct?",
                        "options": [
                          { "label": "A", "text": "It is not a part of the Constitution." },
                          { "label": "B", "text": "It can be amended under Article 368 without altering the basic structure." },
                          { "label": "C", "text": "It is enforceable in a court of law." },
                          { "label": "D", "text": "None of the above" }
                        ],
                        "correctLabel": "B",
                        "explanation": "In Kesavananda Bharati (1973), the Supreme Court held that the Preamble is an integral part of the Constitution and can be amended under Article 368, provided basic structure is not disturbed."
                      }
                    ];
                    const s = JSON.stringify(sample, null, 2);
                    setBulkInput(s);
                    validateBulk(s);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#60a5fa',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Load Sample Template
                </button>
              </div>

              <textarea
                rows={12}
                value={bulkInput}
                onChange={e => {
                  setBulkInput(e.target.value);
                  validateBulk(e.target.value);
                }}
                placeholder="[ { &quot;examYear&quot;: 2024, &quot;questionNo&quot;: 1, &quot;stem&quot;: &quot;...&quot;, &quot;options&quot;: [...], &quot;correctLabel&quot;: &quot;B&quot; } ]"
                style={{
                  width: '100%',
                  background: 'rgba(2, 6, 23, 0.9)',
                  border: '1.5px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '14px',
                  color: '#ffffff',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  outline: 'none'
                }}
              />
            </div>

            {/* Validation Preview Card */}
            {bulkPreview && (
              <div style={{
                background: bulkPreview.valid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: bulkPreview.valid ? '1px solid #10b981' : '1px solid #ef4444',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '20px'
              }}>
                {bulkPreview.valid ? (
                  <div>
                    <h4 style={{ margin: '0 0 6px 0', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={16} /> Syntax Valid: {bulkPreview.count} Question(s) Detected
                    </h4>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.82rem', color: '#cbd5e1' }}>
                      Subjects detected:{' '}
                      {Object.entries(bulkPreview.subjects).map(([s, c]) => `${s} (${c})`).join(', ')}
                    </p>
                  </div>
                ) : (
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertCircle size={16} /> Syntax Error
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#fca5a5' }}>{bulkPreview.error}</p>
                  </div>
                )}
              </div>
            )}

            {/* Submit Execution Button */}
            <button
              disabled={bulkLoading || !bulkPreview?.valid}
              onClick={handleBulkSubmit}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 28px',
                borderRadius: '12px',
                background: bulkPreview?.valid ? '#8b5cf6' : 'rgba(255, 255, 255, 0.1)',
                color: bulkPreview?.valid ? '#ffffff' : '#64748b',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: bulkPreview?.valid ? 'pointer' : 'not-allowed',
                boxShadow: bulkPreview?.valid ? '0 6px 20px rgba(139, 92, 246, 0.3)' : 'none'
              }}
            >
              {bulkLoading ? <RefreshCw size={16} className="animate-spin" /> : <UploadCloud size={16} />}
              <span>{bulkLoading ? 'Processing Bulk Ingestion...' : `Execute Bulk Ingestion (${bulkPreview?.count || 0} Qs)`}</span>
            </button>

            {/* Execution Result Log */}
            {bulkResult && (
              <div style={{
                marginTop: '24px',
                background: bulkResult.error ? 'rgba(239, 68, 68, 0.15)' : 'rgba(15, 23, 42, 0.9)',
                border: bulkResult.error ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '14px',
                padding: '20px'
              }}>
                {bulkResult.error ? (
                  <p style={{ color: '#f87171', margin: 0 }}>Error: {bulkResult.error}</p>
                ) : (
                  <div>
                    <h3 style={{ margin: '0 0 10px 0', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={20} /> Ingestion Finished Successfully!
                    </h3>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '10px 16px', borderRadius: '10px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>UPDATED</span>
                        <strong style={{ fontSize: '1.2rem', color: '#60a5fa' }}>{bulkResult.updatedCount}</strong>
                      </div>
                      <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '10px 16px', borderRadius: '10px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>NEWLY CREATED</span>
                        <strong style={{ fontSize: '1.2rem', color: '#10b981' }}>{bulkResult.createdCount}</strong>
                      </div>
                      <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '10px 16px', borderRadius: '10px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>ERRORS</span>
                        <strong style={{ fontSize: '1.2rem', color: bulkResult.errors?.length ? '#ef4444' : '#10b981' }}>
                          {bulkResult.errors?.length || 0}
                        </strong>
                      </div>
                    </div>

                    {bulkResult.errors?.length > 0 && (
                      <div>
                        <h4 style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '6px' }}>Issues:</h4>
                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.8rem', color: '#fca5a5' }}>
                          {bulkResult.errors.map((e, idx) => <li key={idx}>{e}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ADD SINGLE QUESTION                                               */}
        {/* ========================================================================= */}
        {activeTab === 'add' && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1.5px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 8px 0' }}>
              Add a New Previous Year Question
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: '0 0 24px 0' }}>
              Fill in the fields below to author an authentic UPSC Prelims question directly into the database.
            </p>

            <form onSubmit={handleAddQuestionSubmit}>
              {/* Stem */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '6px' }}>
                  QUESTION STEM (PROMPT) *
                </label>
                <textarea
                  rows={4}
                  required
                  value={newQuestionForm.stem}
                  onChange={e => setNewQuestionForm(prev => ({ ...prev, stem: e.target.value }))}
                  placeholder="Enter the full question stem text here..."
                  style={{
                    width: '100%',
                    background: 'rgba(2, 6, 23, 0.8)',
                    border: '1.5px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    padding: '12px',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Options */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '8px' }}>
                  OPTIONS &amp; SELECT CORRECT ANSWER *
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {newQuestionForm.options.map((opt, idx) => {
                    const isCorrect = newQuestionForm.correctLabel.toLowerCase() === opt.label.toLowerCase();
                    return (
                      <div
                        key={opt.label}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          background: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(2, 6, 23, 0.6)',
                          border: isCorrect ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '10px',
                          padding: '6px 12px'
                        }}
                      >
                        <input
                          type="radio"
                          name="newCorrectOption"
                          checked={isCorrect}
                          onChange={() => setNewQuestionForm(prev => ({ ...prev, correctLabel: opt.label.toLowerCase() }))}
                          style={{ cursor: 'pointer', accentColor: '#10b981' }}
                        />
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: isCorrect ? '#10b981' : '#94a3b8' }}>
                          Option {opt.label}:
                        </span>
                        <input
                          type="text"
                          required
                          value={opt.text}
                          onChange={e => {
                            const val = e.target.value;
                            setNewQuestionForm(prev => ({
                              ...prev,
                              options: prev.options.map((o, i) => i === idx ? { ...o, text: val } : o)
                            }));
                          }}
                          placeholder={`Text for option ${opt.label}...`}
                          style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: '#ffffff',
                            fontSize: '0.9rem'
                          }}
                        />
                        {isCorrect && (
                          <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 800 }}>
                            ✓ Mark as Answer
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Explanation */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '6px' }}>
                  COMPREHENSIVE EXPLANATION
                </label>
                <textarea
                  rows={4}
                  value={newQuestionForm.explanation}
                  onChange={e => setNewQuestionForm(prev => ({ ...prev, explanation: e.target.value }))}
                  placeholder="Provide step-by-step reasoning, relevant constitutional articles, or NCERT references..."
                  style={{
                    width: '100%',
                    background: 'rgba(2, 6, 23, 0.8)',
                    border: '1.5px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    padding: '12px',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Metadata Fields Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '28px'
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', marginBottom: '4px' }}>
                    SUBJECT *
                  </label>
                  <input
                    type="text"
                    required
                    value={newQuestionForm.srcSubject}
                    onChange={e => setNewQuestionForm(prev => ({ ...prev, srcSubject: e.target.value }))}
                    placeholder="e.g. Indian Polity"
                    style={{
                      width: '100%',
                      background: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', marginBottom: '4px' }}>
                    TOPIC
                  </label>
                  <input
                    type="text"
                    value={newQuestionForm.srcTopic}
                    onChange={e => setNewQuestionForm(prev => ({ ...prev, srcTopic: e.target.value }))}
                    placeholder="e.g. Fundamental Rights"
                    style={{
                      width: '100%',
                      background: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', marginBottom: '4px' }}>
                    EXAM NAME
                  </label>
                  <input
                    type="text"
                    value={newQuestionForm.examName}
                    onChange={e => setNewQuestionForm(prev => ({ ...prev, examName: e.target.value }))}
                    placeholder="UPSC CSE Pre"
                    style={{
                      width: '100%',
                      background: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', marginBottom: '4px' }}>
                    YEAR
                  </label>
                  <input
                    type="number"
                    value={newQuestionForm.examYear}
                    onChange={e => setNewQuestionForm(prev => ({ ...prev, examYear: parseInt(e.target.value, 10) || 2024 }))}
                    style={{
                      width: '100%',
                      background: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', marginBottom: '4px' }}>
                    QUESTION NUMBER (OPTIONAL)
                  </label>
                  <input
                    type="number"
                    value={newQuestionForm.questionNo}
                    onChange={e => setNewQuestionForm(prev => ({ ...prev, questionNo: e.target.value }))}
                    placeholder="e.g. 45"
                    style={{
                      width: '100%',
                      background: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={addingQuestion}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 28px',
                  borderRadius: '12px',
                  background: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)'
                }}
              >
                {addingQuestion ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
                <span>{addingQuestion ? 'Saving to Database...' : 'Save & Publish Question'}</span>
              </button>
            </form>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* EDIT QUESTION MODAL                                                      */}
      {/* ========================================================================= */}
      {editingQuestion && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(2, 6, 23, 0.85)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#0f172a',
            border: '1.5px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '20px',
            maxWidth: '780px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.85)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(2, 6, 23, 0.5)'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                  Edit Question {editingQuestion.questionNo ? `Q${editingQuestion.questionNo}` : ''}
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  ID: {editingQuestion.id} · {editingQuestion.examName} {editingQuestion.examYear}
                </span>
              </div>
              <button
                onClick={() => setEditingQuestion(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '6px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{
              padding: '20px 24px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}>
              {/* Stem */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '6px' }}>
                  QUESTION STEM (PROMPT) *
                </label>
                <textarea
                  rows={4}
                  value={editForm.stem}
                  onChange={e => setEditForm(prev => ({ ...prev, stem: e.target.value }))}
                  style={{
                    width: '100%',
                    background: 'rgba(2, 6, 23, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    lineHeight: 1.55,
                    outline: 'none'
                  }}
                />
              </div>

              {/* Options */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '8px' }}>
                  OPTIONS &amp; SELECT CORRECT ANSWER (Click radio button to mark correct answer)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {editForm.options.map((opt, idx) => {
                    const isCorrect = (editForm.correctLabel || '').toLowerCase() === (opt.label || '').toLowerCase();
                    return (
                      <div
                        key={opt.label}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          background: isCorrect ? 'rgba(16, 185, 129, 0.12)' : 'rgba(2, 6, 23, 0.6)',
                          border: isCorrect ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '10px',
                          padding: '6px 12px'
                        }}
                      >
                        <input
                          type="radio"
                          name="correctOptionRadio"
                          checked={isCorrect}
                          onChange={() => setEditForm(prev => ({ ...prev, correctLabel: opt.label.toLowerCase() }))}
                          style={{ cursor: 'pointer', accentColor: '#10b981' }}
                        />
                        <span style={{ fontWeight: 800, fontSize: '0.85rem', color: isCorrect ? '#10b981' : '#94a3b8' }}>
                          Option {opt.label}:
                        </span>
                        <input
                          type="text"
                          value={opt.text}
                          onChange={e => {
                            const val = e.target.value;
                            setEditForm(prev => ({
                              ...prev,
                              options: prev.options.map((o, i) => i === idx ? { ...o, text: val } : o)
                            }));
                          }}
                          style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: '#ffffff',
                            fontSize: '0.88rem'
                          }}
                        />
                        {isCorrect && (
                          <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 800 }}>
                            ✓ Correct Answer
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#cbd5e1', marginBottom: '6px' }}>
                  EXPLANATION (Markdown supported)
                </label>
                <textarea
                  rows={4}
                  value={editForm.explanation}
                  onChange={e => setEditForm(prev => ({ ...prev, explanation: e.target.value }))}
                  style={{
                    width: '100%',
                    background: 'rgba(2, 6, 23, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    lineHeight: 1.55,
                    outline: 'none'
                  }}
                />
              </div>

              {/* Metadata Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', marginBottom: '4px' }}>
                    SUBJECT
                  </label>
                  <input
                    type="text"
                    value={editForm.srcSubject}
                    onChange={e => setEditForm(prev => ({ ...prev, srcSubject: e.target.value }))}
                    style={{
                      width: '100%',
                      background: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      color: '#ffffff',
                      fontSize: '0.82rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', marginBottom: '4px' }}>
                    TOPIC
                  </label>
                  <input
                    type="text"
                    value={editForm.srcTopic}
                    onChange={e => setEditForm(prev => ({ ...prev, srcTopic: e.target.value }))}
                    style={{
                      width: '100%',
                      background: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      color: '#ffffff',
                      fontSize: '0.82rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', marginBottom: '4px' }}>
                    EXAM YEAR
                  </label>
                  <input
                    type="number"
                    value={editForm.examYear}
                    onChange={e => setEditForm(prev => ({ ...prev, examYear: parseInt(e.target.value, 10) || 2024 }))}
                    style={{
                      width: '100%',
                      background: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      color: '#ffffff',
                      fontSize: '0.82rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', marginBottom: '4px' }}>
                    QUESTION NUMBER
                  </label>
                  <input
                    type="number"
                    value={editForm.questionNo}
                    onChange={e => setEditForm(prev => ({ ...prev, questionNo: e.target.value }))}
                    style={{
                      width: '100%',
                      background: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      color: '#ffffff',
                      fontSize: '0.82rem'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              padding: '16px 24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(2, 6, 23, 0.5)'
            }}>
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#94a3b8',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={savingEdit}
                onClick={handleSaveEdit}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 22px',
                  borderRadius: '10px',
                  background: '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                {savingEdit ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                <span>{savingEdit ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

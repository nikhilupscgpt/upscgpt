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
  ArrowRight,
  Printer,
  Play
} from 'lucide-react';
import { isNewPatternQuestion, isPairQuestion, isStatementQuestion } from '@/lib/pyqPattern';
import { getStructuredExplanation } from '@/lib/pyqExplanationHelper';
import { TOPIC_GROUPS, SUBJECT_ORDER } from '@/app/prelims/pyq/topicGroups';

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

  const [updatingTopicId, setUpdatingTopicId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('ALL');
  const [topic, setTopic] = useState('ALL');
  const [exam, setExam] = useState('ALL');
  const [year, setYear] = useState('ALL');
  const [pattern, setPattern] = useState('ALL');
  const [answerStatus, setAnswerStatus] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('syllabus'); // 'syllabus' | 'exam'

  const [filterOptions, setFilterOptions] = useState({ subjects: [], years: [], exams: [], topics: [], topicGroups: [] });

  // Selection state for batch printing / actions
  const [selectedQIds, setSelectedQIds] = useState(new Set());

  // Edit Modal State (Dual Mode: Visual Form vs Raw JSON / JSONL)
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editMode, setEditMode] = useState('form'); // 'form' | 'json'
  const [editJsonRaw, setEditJsonRaw] = useState('');
  const [jsonError, setJsonError] = useState(null);
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

  // Print PDF Modal State
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printExam, setPrintExam] = useState('UPSC CSE');
  const [printStage, setPrintStage] = useState('PRELIMS');
  const [printSubject, setPrintSubject] = useState('ALL');
  const [printTopic, setPrintTopic] = useState('ALL');
  const [printMicrotheme, setPrintMicrotheme] = useState('ALL');
  const [printYear, setPrintYear] = useState('ALL');
  const [printSort, setPrintSort] = useState('syllabus');
  const [printIncludeKey, setPrintIncludeKey] = useState(true);
  const [printIncludeExpl, setPrintIncludeExpl] = useState(true);
  const [printTaxonomy, setPrintTaxonomy] = useState({ exams: [], subjects: [], topics: [], topicGroups: [], microthemes: [], matchingCount: null });
  const [loadingTaxonomy, setLoadingTaxonomy] = useState(false);

  // Fetch Questions
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const p = new URLSearchParams();
      p.set('page', page.toString());
      p.set('limit', limit.toString());
      p.set('sort', sortOrder);
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
  }, [page, limit, search, subject, topic, exam, year, pattern, answerStatus, sortOrder]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Fetch taxonomy options & live question count when Print Modal is opened or selections change
  useEffect(() => {
    if (!printModalOpen) return;
    let isMounted = true;
    async function loadTaxonomy() {
      setLoadingTaxonomy(true);
      try {
        const p = new URLSearchParams({
          exam: printExam,
          subject: printSubject,
          topic: printTopic,
          microtheme: printMicrotheme,
          year: printYear
        });
        const res = await fetch(`/api/admin/pyq/taxonomy?${p.toString()}`);
        const data = await res.json();
        if (isMounted && data.success) {
          setPrintTaxonomy({
            exams: data.exams || [],
            subjects: data.subjects || [],
            topics: data.topics || [],
            topicGroups: data.topicGroups || [],
            microthemes: data.microthemes || [],
            matchingCount: typeof data.matchingCount === 'number' ? data.matchingCount : null
          });
        }
      } catch (err) {
        console.error('Failed to load taxonomy:', err);
      } finally {
        if (isMounted) setLoadingTaxonomy(false);
      }
    }
    loadTaxonomy();
    return () => { isMounted = false; };
  }, [printModalOpen, printExam, printSubject, printTopic, printMicrotheme, printYear]);

  const handleLaunchPrint = () => {
    const p = new URLSearchParams({
      exam: printExam,
      stage: printStage,
      subject: printSubject,
      topic: printTopic,
      microtheme: printMicrotheme,
      year: printYear,
      sort: printSort,
      limit: 'ALL',
      includeKey: printIncludeKey ? 'true' : 'false',
      includeExpl: printIncludeExpl ? 'true' : 'false'
    });
    window.open(`/api/admin/pyq/print-pdf?${p.toString()}`, '_blank');
  };

  // Quick 1-Click Topic Reassignment directly from question card
  const handleQuickTopicChange = async (qId, newTopic) => {
    if (!newTopic) return;
    setUpdatingTopicId(qId);
    try {
      const res = await fetch(`/api/admin/pyq/${qId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ srcTopic: newTopic })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update topic');
      }
      setQuestions(prev => prev.map(item => item.id === qId ? { ...item, srcTopic: newTopic } : item));
      setToastMessage(`✓ Reassigned to "${newTopic}"`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      alert(`Error updating topic: ${err.message}`);
    } finally {
      setUpdatingTopicId(null);
    }
  };

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

  // Selection Handlers
  const toggleSelectQuestion = (id) => {
    setSelectedQIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllOnPage = () => {
    if (questions.length === 0) return;
    const pageIds = questions.map(q => q.id);
    const allSelected = pageIds.every(id => selectedQIds.has(id));
    setSelectedQIds(prev => {
      const next = new Set(prev);
      if (allSelected) {
        pageIds.forEach(id => next.delete(id));
      } else {
        pageIds.forEach(id => next.add(id));
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedQIds(new Set());
  };

  const handlePrintSelectedSlides = () => {
    if (selectedQIds.size === 0) return;
    const ids = Array.from(selectedQIds).join(',');
    window.open(`/api/admin/pyq/print-pdf?mode=slide&ids=${ids}`, '_blank');
  };

  const handlePrintSelectedBooklet = () => {
    if (selectedQIds.size === 0) return;
    const ids = Array.from(selectedQIds).join(',');
    window.open(`/api/admin/pyq/print-pdf?ids=${ids}`, '_blank');
  };

  // Open Edit Modal
  const handleOpenEdit = (q) => {
    setEditingQuestion(q);
    setEditMode('form');
    setJsonError(null);

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
    const normalizedOptions = opts.map((o, idx) => ({
      label: (o.label || String.fromCharCode(65 + idx)).toUpperCase(),
      text: o.text || ''
    }));

    const structured = getStructuredExplanation(q);

    setEditForm({
      stem: q.stem || '',
      options: normalizedOptions,
      correctLabel: (q.correctLabel || '').toLowerCase(),
      explanation: structured.explanationText || (typeof q.explanation === 'string' ? q.explanation : ''),
      srcSubject: q.srcSubject || '',
      srcTopic: q.srcTopic || '',
      examName: q.examName || '',
      examYear: q.examYear || 2024,
      questionNo: q.questionNo || '',
      difficulty: q.difficulty || 'MEDIUM',
    });

    // Prepare JSON object for the JSON / JSONL editor mode
    const jsonObj = {
      examName: q.examName || 'UPSC CSE Pre',
      examYear: q.examYear || 2024,
      questionNo: q.questionNo ?? null,
      srcSubject: q.srcSubject || '',
      srcTopic: q.srcTopic || '',
      stem: q.stem || '',
      options: normalizedOptions.map(o => ({
        label: o.label.toLowerCase(),
        text: o.text
      })),
      correctLabel: (q.correctLabel || '').toLowerCase(),
      ...(structured.explanationText ? { explanation: structured.explanationText } : {}),
      ...(structured.analysis ? { analysis: structured.analysis } : {})
    };
    if (!structured.analysis && !structured.explanationText && q.explanation) {
      jsonObj.explanation = q.explanation;
    }
    setEditJsonRaw(JSON.stringify(jsonObj, null, 2));
  };

  // Mode Switching
  const handleSwitchToFormMode = () => {
    try {
      const parsed = JSON.parse(editJsonRaw);
      setEditForm({
        stem: parsed.stem || '',
        options: (parsed.options || []).map((o, idx) => ({
          label: (o.label || String.fromCharCode(65 + idx)).toUpperCase(),
          text: o.text || ''
        })),
        correctLabel: (parsed.correctLabel || '').toLowerCase(),
        explanation: typeof parsed.explanation === 'string' 
          ? parsed.explanation 
          : (parsed.analysis ? JSON.stringify(parsed.analysis, null, 2) : ''),
        srcSubject: parsed.srcSubject || '',
        srcTopic: parsed.srcTopic || '',
        examName: parsed.examName || '',
        examYear: parsed.examYear || 2024,
        questionNo: parsed.questionNo ?? '',
        difficulty: parsed.difficulty || 'MEDIUM',
      });
      setJsonError(null);
      setEditMode('form');
    } catch (err) {
      if (window.confirm('The JSON contains syntax errors: ' + err.message + '\n\nDo you want to discard your raw JSON changes and switch to Form Mode?')) {
        setJsonError(null);
        setEditMode('form');
      }
    }
  };

  const handleSwitchToJsonMode = () => {
    const currentJson = {
      examName: editForm.examName || 'UPSC CSE Pre',
      examYear: parseInt(editForm.examYear, 10) || 2024,
      questionNo: editForm.questionNo ? parseInt(editForm.questionNo, 10) : null,
      srcSubject: editForm.srcSubject || '',
      srcTopic: editForm.srcTopic || '',
      stem: editForm.stem || '',
      options: editForm.options.map((o, idx) => ({
        label: (o.label || String.fromCharCode(97 + idx)).toLowerCase(),
        text: o.text || ''
      })),
      correctLabel: (editForm.correctLabel || '').toLowerCase(),
    };

    const trimmed = (editForm.explanation || '').trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsedExp = JSON.parse(trimmed);
        if (parsedExp.analysis) {
          currentJson.analysis = parsedExp.analysis;
          if (parsedExp.explanation) currentJson.explanation = parsedExp.explanation;
        } else if (parsedExp.keywords || parsedExp.optionBreakdown || parsedExp.valueAddition) {
          currentJson.analysis = parsedExp;
        } else {
          currentJson.explanation = editForm.explanation;
        }
      } catch {
        currentJson.explanation = editForm.explanation;
      }
    } else {
      currentJson.explanation = editForm.explanation;
    }

    setEditJsonRaw(JSON.stringify(currentJson, null, 2));
    setJsonError(null);
    setEditMode('json');
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(editJsonRaw);
      setEditJsonRaw(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (err) {
      setJsonError(err.message);
    }
  };

  const handleLoadLectureTemplate = () => {
    const templateAnalysis = {
      keywords: [
        { concept: "Core Concept A", isDistractor: false },
        { concept: "Core Concept B", isDistractor: false },
        { concept: "Distractor Concept C", isDistractor: true }
      ],
      optionBreakdown: [
        { label: "1", verdict: "Incorrect", explanation: "Precise factual reason for elimination." },
        { label: "2", verdict: "Incorrect", explanation: "Contradiction with statutory guidelines." },
        { label: "3", verdict: "Correct", explanation: "Core operational mandate as verified." }
      ],
      valueAddition: "Forward-looking value addition (strictly under 120 words). Details what UPSC will ask next from this syllabus cluster, with temporal anchors (e.g. as of 2024).",
      inNews: {
        headline: "Recent relevant headline connecting static concept to current affairs",
        source: "The Hindu / PIB",
        date: "July 2024",
        relevance: "Field data or policy shift demonstrating why this topic is under national focus."
      },
      similarPyq: {
        examYear: 2018,
        examName: "UPSC CSE Pre",
        stem: "Earlier UPSC question testing the same syllabus family...",
        keyTakeaway: "UPSC repeatedly tests foundational themes from this topic cluster."
      }
    };

    if (editMode === 'json') {
      try {
        const parsed = JSON.parse(editJsonRaw);
        parsed.analysis = templateAnalysis;
        setEditJsonRaw(JSON.stringify(parsed, null, 2));
        setJsonError(null);
      } catch {
        setEditJsonRaw(JSON.stringify({ ...editForm, analysis: templateAnalysis }, null, 2));
        setJsonError(null);
      }
    } else {
      setEditForm(prev => ({
        ...prev,
        explanation: JSON.stringify({ analysis: templateAnalysis }, null, 2)
      }));
    }
  };

  // Save Edit
  const handleSaveEdit = async () => {
    if (!editingQuestion) return;
    setSavingEdit(true);
    try {
      let payload = {};

      if (editMode === 'json') {
        let parsed;
        try {
          parsed = JSON.parse(editJsonRaw);
        } catch (err) {
          setJsonError(err.message);
          throw new Error('Invalid JSON: ' + err.message);
        }
        payload = parsed;
      } else {
        payload = { ...editForm };
      }

      const res = await fetch(`/api/admin/pyq/${editingQuestion.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save changes');

      // Update question in local state
      setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? data.question : q));
      setEditingQuestion(null);
      setJsonError(null);
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

          <button
            onClick={() => setPrintModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.35)',
              marginLeft: 'auto'
            }}
          >
            <Printer size={16} />
            <span>Print Question Booklet</span>
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

                <button
                  type="button"
                  onClick={() => {
                    const p = new URLSearchParams({
                      exam: exam !== 'ALL' ? exam : 'ALL',
                      subject: subject !== 'ALL' ? subject : 'ALL',
                      topic: topic !== 'ALL' ? topic : 'ALL',
                      year: year !== 'ALL' ? year : 'ALL',
                      limit: 'ALL',
                      q: search.trim()
                    });
                    window.open(`/api/admin/pyq/print-pdf?${p.toString()}`, '_blank');
                  }}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '12px',
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#f59e0b',
                    border: '1.5px solid rgba(245, 158, 11, 0.4)',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  title="Print all matching filtered questions in colour PDF"
                >
                  <Printer size={16} />
                  <span>Print All ({total})</span>
                </button>
              </form>

              {/* Filters Row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
                {/* Subject Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Subject</label>
                  <select
                    value={subject}
                    onChange={e => { setSubject(e.target.value); setTopic('ALL'); setPage(1); }}
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

                {/* Theme / Topic Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Theme / Topic</label>
                  <select
                    value={topic}
                    onChange={e => { setTopic(e.target.value); setPage(1); }}
                    disabled={subject === 'ALL'}
                    style={{
                      background: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      padding: '8px 12px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      opacity: subject === 'ALL' ? 0.5 : 1,
                      maxWidth: '240px'
                    }}
                  >
                    <option value="ALL">All Themes in {subject === 'ALL' ? 'Subject' : subject}</option>
                    {filterOptions.topicGroups && filterOptions.topicGroups.length > 0 ? (
                      filterOptions.topicGroups.map(group => (
                        <optgroup key={group.label} label={group.label}>
                          {group.topics.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </optgroup>
                      ))
                    ) : (
                      (filterOptions.topics || []).map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))
                    )}
                  </select>
                </div>

                {/* Sequence Order Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Sequence Order</label>
                  <select
                    value={sortOrder}
                    onChange={e => { setSortOrder(e.target.value); setPage(1); }}
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
                    <option value="syllabus">📖 Syllabus Sequence (NCERT Chapters)</option>
                    <option value="exam">📅 Exam Year (Recent First)</option>
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
                {/* Batch Selection Header Toolbar */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  background: selectedQIds.size > 0 ? 'rgba(59, 130, 246, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                  border: selectedQIds.size > 0 ? '1.5px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '12px 18px',
                  transition: 'all 0.2s'
                }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}>
                    <input
                      type="checkbox"
                      checked={questions.length > 0 && questions.every(q => selectedQIds.has(q.id))}
                      onChange={handleSelectAllOnPage}
                      style={{ width: '17px', height: '17px', accentColor: '#3b82f6', cursor: 'pointer' }}
                    />
                    <span>Select All on This Page ({questions.length} questions)</span>
                  </label>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {selectedQIds.size > 0 ? (
                      <>
                        <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#60a5fa' }}>
                          🎯 {selectedQIds.size} selected
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const ids = Array.from(selectedQIds).join(',');
                            window.open(`/admin/pyq/present?ids=${ids}`, '_blank');
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '7px 16px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #4f46e5, #3b82f6)',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            boxShadow: '0 2px 10px rgba(79, 70, 229, 0.45)',
                          }}
                          title="Open 1080p full-screen Lecture Studio with XP-Pen annotation"
                        >
                          <Play size={14} fill="currentColor" />
                          <span>▶ Present Lecture Deck ({selectedQIds.size})</span>
                        </button>
                        <button
                          type="button"
                          onClick={handlePrintSelectedSlides}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '7px 16px',
                            borderRadius: '8px',
                            background: '#059669',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                          title="Open landscape A4 lecture slides for selected questions"
                        >
                          <Printer size={14} />
                          <span>Print Selected Slides (Landscape)</span>
                        </button>
                        <button
                          type="button"
                          onClick={handlePrintSelectedBooklet}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '7px 14px',
                            borderRadius: '8px',
                            background: 'rgba(59, 130, 246, 0.2)',
                            color: '#60a5fa',
                            border: '1px solid rgba(59, 130, 246, 0.4)',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <FileText size={14} />
                          <span>Print Booklet (Portrait)</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleClearSelection}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#94a3b8',
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            padding: '4px 8px'
                          }}
                        >
                          Clear
                        </button>
                      </>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Check questions to batch print landscape lecture slides or portrait booklets.
                      </span>
                    )}
                  </div>
                </div>

                {questions.map((q) => {
                  const isPair = isPairQuestion(q);
                  const isStmt = isStatementQuestion(q);
                  const hasAnswer = !!q.correctLabel;
                  const hasExpl = !!q.explanation;
                  const isSelected = selectedQIds.has(q.id);

                  return (
                    <div
                      key={q.id}
                      style={{
                        background: isSelected ? 'rgba(30, 41, 59, 0.95)' : 'rgba(15, 23, 42, 0.8)',
                        border: isSelected ? '1.5px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        padding: '20px 24px',
                        transition: 'border-color 0.15s, background-color 0.15s'
                      }}
                    >
                      {/* Top Meta Badges */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectQuestion(q.id)}
                            style={{ width: '18px', height: '18px', accentColor: '#3b82f6', cursor: 'pointer', marginRight: '4px' }}
                            title="Select question for printing"
                          />

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

                          {/* Quick Theme Reassign Dropdown */}
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>Theme:</span>
                            <select
                              value={q.srcTopic || ''}
                              disabled={updatingTopicId === q.id}
                              onChange={e => handleQuickTopicChange(q.id, e.target.value)}
                              style={{
                                background: 'rgba(59, 130, 246, 0.16)',
                                color: '#93c5fd',
                                border: '1px solid rgba(59, 130, 246, 0.35)',
                                borderRadius: '6px',
                                padding: '2px 8px',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                maxWidth: '280px',
                                outline: 'none'
                              }}
                              title="Click to quickly reassign this question to another syllabus theme"
                            >
                              {q.srcTopic && !(TOPIC_GROUPS[q.srcSubject] || []).some(([, topics]) => topics.includes(q.srcTopic)) && (
                                <option value={q.srcTopic}>{q.srcTopic} (Custom / Legacy)</option>
                              )}
                              {(TOPIC_GROUPS[q.srcSubject] || TOPIC_GROUPS['Indian Polity'] || []).map(([moduleLabel, topics]) => (
                                <optgroup key={moduleLabel} label={moduleLabel}>
                                  {topics.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>
                            {updatingTopicId === q.id && (
                              <RefreshCw size={12} className="animate-spin" style={{ color: '#60a5fa' }} />
                            )}
                          </div>

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
                            type="button"
                            onClick={() => window.open(`/api/admin/pyq/print-pdf?mode=slide&ids=${q.id}`, '_blank')}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              background: 'rgba(16, 185, 129, 0.15)',
                              color: '#34d399',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                            title="Print 8-block lecture slide (Landscape A4)"
                          >
                            <Printer size={13} />
                            <span>Print Slide</span>
                          </button>

                          <a
                            href={`/admin/pyq/present?id=${q.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 14px',
                              borderRadius: '8px',
                              background: 'linear-gradient(135deg, #4f46e5, #3b82f6)',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: '0.8rem',
                              fontWeight: 800,
                              textDecoration: 'none',
                              cursor: 'pointer',
                              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.35)',
                            }}
                            title="Open in full-screen 1080p Lecture Studio with XP-Pen pen annotation"
                          >
                            <Play size={13} fill="currentColor" />
                            <span>Present</span>
                          </a>

                          <a
                            href={`/admin/pyq/${q.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
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
                              textDecoration: 'none',
                              cursor: 'pointer'
                            }}
                            title="Open in Visual Split-Screen Editor (New Tab)"
                          >
                            <Edit3 size={13} />
                            <span>Visual Editor</span>
                            <ExternalLink size={12} style={{ opacity: 0.8 }} />
                          </a>

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

            {/* Sticky Floating Action Bar for Selected Questions */}
            {selectedQIds.size > 0 && (
              <div style={{
                position: 'fixed',
                bottom: '28px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                background: '#090d16',
                border: '1.5px solid #3b82f6',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.75)',
                borderRadius: '16px',
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                maxWidth: '92vw',
                flexWrap: 'wrap'
              }}>
                <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🎯 <span>{selectedQIds.size} Question{selectedQIds.size > 1 ? 's' : ''} Selected</span>
                </span>
                <button
                  type="button"
                  onClick={handlePrintSelectedSlides}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 18px',
                    borderRadius: '10px',
                    background: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(5, 150, 105, 0.4)'
                  }}
                  title="Print landscape A4 slides matching the 8-block lecture architecture"
                >
                  <Printer size={15} />
                  <span>Print Selected Slides (Landscape)</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrintSelectedBooklet}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    background: 'rgba(59, 130, 246, 0.2)',
                    color: '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                  title="Print standard portrait question booklet"
                >
                  <FileText size={15} />
                  <span>Print Booklet (Portrait)</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearSelection}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    padding: '4px 8px'
                  }}
                >
                  Clear Selection
                </button>
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
                  <select
                    value={newQuestionForm.srcSubject}
                    onChange={e => {
                      const newSub = e.target.value;
                      const defaultTopic = TOPIC_GROUPS[newSub]?.[0]?.[1]?.[0] || '';
                      setNewQuestionForm(prev => ({ ...prev, srcSubject: newSub, srcTopic: defaultTopic }));
                    }}
                    style={{
                      width: '100%',
                      background: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    {SUBJECT_ORDER.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', marginBottom: '4px' }}>
                    TOPIC (MODULE GROUPED)
                  </label>
                  <select
                    value={newQuestionForm.srcTopic}
                    onChange={e => setNewQuestionForm(prev => ({ ...prev, srcTopic: e.target.value }))}
                    style={{
                      width: '100%',
                      background: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    {(TOPIC_GROUPS[newQuestionForm.srcSubject] || TOPIC_GROUPS['Indian Polity'] || []).map(([moduleLabel, topics]) => (
                      <optgroup key={moduleLabel} label={moduleLabel}>
                        {topics.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
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
            {/* Modal Header with Mode Switcher */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(2, 6, 23, 0.7)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                    Edit Question {editingQuestion.questionNo ? `Q${editingQuestion.questionNo}` : ''}
                  </h3>
                  <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.08)', padding: '2px', borderRadius: '8px' }}>
                    <button
                      type="button"
                      onClick={editMode === 'form' ? undefined : handleSwitchToFormMode}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: editMode === 'form' ? '#3b82f6' : 'transparent',
                        color: editMode === 'form' ? '#ffffff' : '#94a3b8',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      📝 Form Mode
                    </button>
                    <button
                      type="button"
                      onClick={editMode === 'json' ? undefined : handleSwitchToJsonMode}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: editMode === 'json' ? '#10b981' : 'transparent',
                        color: editMode === 'json' ? '#ffffff' : '#94a3b8',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      ⚡ JSON / JSONL Mode
                    </button>
                  </div>
                </div>
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
              {editMode === 'json' ? (
                /* =================== JSON / JSONL EDITOR MODE =================== */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#e2e8f0' }}>
                        RAW QUESTION PAYLOAD (JSON / JSONL):
                      </span>
                      {jsonError ? (
                        <span style={{ fontSize: '0.75rem', color: '#f87171', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                          ❌ Syntax Error
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                          ✓ Valid JSON
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={handleFormatJson}
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: '#ffffff',
                          borderRadius: '6px',
                          padding: '5px 12px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        ✨ Prettify JSON
                      </button>
                      <button
                        type="button"
                        onClick={handleLoadLectureTemplate}
                        style={{
                          background: 'rgba(59, 130, 246, 0.15)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          color: '#60a5fa',
                          borderRadius: '6px',
                          padding: '5px 12px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        + Insert 8-Block Template
                      </button>
                    </div>
                  </div>

                  {jsonError && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid #ef4444', borderRadius: '8px', padding: '8px 12px', color: '#fca5a5', fontSize: '0.78rem' }}>
                      <strong>JSON Parse Error:</strong> {jsonError}
                    </div>
                  )}

                  <textarea
                    rows={18}
                    value={editJsonRaw}
                    onChange={e => {
                      const val = e.target.value;
                      setEditJsonRaw(val);
                      try {
                        JSON.parse(val);
                        setJsonError(null);
                      } catch (err) {
                        setJsonError(err.message);
                      }
                    }}
                    style={{
                      width: '100%',
                      minHeight: '440px',
                      background: 'rgba(2, 6, 23, 0.95)',
                      border: jsonError ? '1.5px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '10px',
                      padding: '14px',
                      color: '#e2e8f0',
                      fontSize: '0.86rem',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                      lineHeight: 1.55,
                      outline: 'none',
                      whiteSpace: 'pre'
                    }}
                  />
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                    💡 Tip: You can paste the JSON or JSONL output generated from Claude/Gemini directly here. It will update the stem, options, correct answer, and full 8-block lecture analysis!
                  </p>
                </div>
              ) : (
                /* =================== VISUAL FORM MODE =================== */
                <>
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

                  {/* Options & Answer Selection */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#cbd5e1' }}>
                        OPTIONS &amp; SELECT CORRECT ANSWER (Click radio button to mark correct)
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>Label:</span>
                        <input
                          type="text"
                          value={editForm.correctLabel}
                          onChange={e => setEditForm(prev => ({ ...prev, correctLabel: e.target.value.toLowerCase() }))}
                          placeholder="e.g. a"
                          style={{
                            width: '45px',
                            background: 'rgba(2, 6, 23, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '6px',
                            padding: '2px 6px',
                            color: '#10b981',
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            textAlign: 'center'
                          }}
                        />
                      </div>
                    </div>

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

                  {/* Explanation with Template Insert */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#cbd5e1' }}>
                        EXPLANATION (Text, Markdown, or 8-Block Analysis JSON)
                      </label>
                      <button
                        type="button"
                        onClick={handleLoadLectureTemplate}
                        style={{
                          background: 'rgba(59, 130, 246, 0.15)',
                          color: '#60a5fa',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '6px',
                          padding: '3px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        + Insert 8-Block Template
                      </button>
                    </div>
                    <textarea
                      rows={6}
                      value={editForm.explanation}
                      onChange={e => setEditForm(prev => ({ ...prev, explanation: e.target.value }))}
                      style={{
                        width: '100%',
                        background: 'rgba(2, 6, 23, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '10px',
                        padding: '10px 12px',
                        color: '#ffffff',
                        fontSize: '0.88rem',
                        lineHeight: 1.55,
                        outline: 'none',
                        fontFamily: editForm.explanation.trim().startsWith('{') ? 'monospace' : 'inherit'
                      }}
                    />
                  </div>

                  {/* Metadata Fields */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', marginBottom: '4px' }}>
                        SUBJECT
                      </label>
                      <select
                        value={editForm.srcSubject}
                        onChange={e => {
                          const newSub = e.target.value;
                          const defaultTopic = TOPIC_GROUPS[newSub]?.[0]?.[1]?.[0] || '';
                          setEditForm(prev => ({ ...prev, srcSubject: newSub, srcTopic: defaultTopic }));
                        }}
                        style={{
                          width: '100%',
                          background: 'rgba(2, 6, 23, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          color: '#ffffff',
                          fontSize: '0.82rem',
                          fontWeight: 600
                        }}
                      >
                        {SUBJECT_ORDER.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', marginBottom: '4px' }}>
                        THEME / TOPIC (MODULE GROUPED)
                      </label>
                      <select
                        value={editForm.srcTopic}
                        onChange={e => setEditForm(prev => ({ ...prev, srcTopic: e.target.value }))}
                        style={{
                          width: '100%',
                          background: 'rgba(2, 6, 23, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          color: '#ffffff',
                          fontSize: '0.82rem',
                          fontWeight: 600
                        }}
                      >
                        {editForm.srcTopic && !(TOPIC_GROUPS[editForm.srcSubject] || []).some(([, topics]) => topics.includes(editForm.srcTopic)) && (
                          <option value={editForm.srcTopic}>{editForm.srcTopic} (Custom / Legacy)</option>
                        )}
                        {(TOPIC_GROUPS[editForm.srcSubject] || TOPIC_GROUPS['Indian Polity'] || []).map(([moduleLabel, topics]) => (
                          <optgroup key={moduleLabel} label={moduleLabel}>
                            {topics.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
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
                </>
              )}
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

      {/* ========================================================================= */}
      {/* PRINT QUESTION BOOKLET MODAL (UPSC & CDS CASCADING SELECTOR)             */}
      {/* ========================================================================= */}
      {printModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#0f172a',
            border: '1.5px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '560px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(2, 6, 23, 0.5)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  color: '#f59e0b',
                  padding: '8px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Printer size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                    Print Question Booklet
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
                    Generate authentic UPSC / CDS examination papers
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPrintModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Exam & Stage */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '6px' }}>
                    EXAM
                  </label>
                  <select
                    value={printExam}
                    onChange={e => { setPrintExam(e.target.value); setPrintTopic('ALL'); setPrintMicrotheme('ALL'); }}
                    style={{
                      width: '100%',
                      background: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      fontWeight: 600
                    }}
                  >
                    <option value="UPSC CSE">UPSC Civil Services (CSE)</option>
                    <option value="CDS">Combined Defence Services (CDS)</option>
                    <option value="ALL">All Examinations Combined</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '6px' }}>
                    STAGE
                  </label>
                  <select
                    value={printStage}
                    onChange={e => setPrintStage(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(2, 6, 23, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      fontWeight: 600
                    }}
                  >
                    <option value="PRELIMS">Prelims (2-Column MCQs)</option>
                    <option value="MAINS">Mains (Subjective with Ruling)</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '6px' }}>
                  SUBJECT
                </label>
                <select
                  value={printSubject}
                  onChange={e => { setPrintSubject(e.target.value); setPrintTopic('ALL'); setPrintMicrotheme('ALL'); }}
                  style={{
                    width: '100%',
                    background: 'rgba(2, 6, 23, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    fontWeight: 600
                  }}
                >
                  <option value="ALL">All Subjects</option>
                  {(printTaxonomy.subjects.length > 0 ? printTaxonomy.subjects : filterOptions.subjects).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Theme / Topic */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '6px' }}>
                  THEME (BROAD TOPIC)
                </label>
                <select
                  value={printTopic}
                  onChange={e => { setPrintTopic(e.target.value); setPrintMicrotheme('ALL'); }}
                  disabled={printSubject === 'ALL'}
                  style={{
                    width: '100%',
                    background: 'rgba(2, 6, 23, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    opacity: printSubject === 'ALL' ? 0.5 : 1
                  }}
                >
                  <option value="ALL">All Themes in {printSubject === 'ALL' ? 'Subject' : printSubject}</option>
                  {printTaxonomy.topicGroups && printTaxonomy.topicGroups.length > 0 ? (
                    printTaxonomy.topicGroups.map(group => (
                      <optgroup key={group.label} label={group.label}>
                        {group.topics.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </optgroup>
                    ))
                  ) : (
                    printTaxonomy.topics.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))
                  )}
                </select>
              </div>

              {/* Microtheme */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '6px' }}>
                  MICROTHEME (SUBTOPIC)
                </label>
                <select
                  value={printMicrotheme}
                  onChange={e => setPrintMicrotheme(e.target.value)}
                  disabled={printTopic === 'ALL'}
                  style={{
                    width: '100%',
                    background: 'rgba(2, 6, 23, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    opacity: printTopic === 'ALL' ? 0.5 : 1
                  }}
                >
                  <option value="ALL">All Microthemes in {printTopic === 'ALL' ? 'Theme' : printTopic}</option>
                  {printTaxonomy.microthemes.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Year Filter */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '6px' }}>
                  EXAM YEAR
                </label>
                <select
                  value={printYear}
                  onChange={e => setPrintYear(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(2, 6, 23, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    fontWeight: 600
                  }}
                >
                  <option value="ALL">All Available Years</option>
                  {filterOptions.years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Question Sequence / Ordering */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '6px' }}>
                  QUESTION SEQUENCE
                </label>
                <select
                  value={printSort}
                  onChange={e => setPrintSort(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(2, 6, 23, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    fontWeight: 600
                  }}
                >
                  <option value="syllabus">📖 Canonical Syllabus Sequence (NCERT Chapters &amp; Modules)</option>
                  <option value="exam">📅 Chronological by Exam Year (Recent First)</option>
                </select>
              </div>

              {/* Print Toggles Box */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, color: '#ffffff' }}>
                  <input
                    type="checkbox"
                    checked={printIncludeKey}
                    onChange={e => setPrintIncludeKey(e.target.checked)}
                    style={{ accentColor: '#f59e0b', width: '16px', height: '16px' }}
                  />
                  <span>Append Answer Key Matrix on Separate Page</span>
                </label>

                {printIncludeKey && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, color: '#cbd5e1', paddingLeft: '24px' }}>
                    <input
                      type="checkbox"
                      checked={printIncludeExpl}
                      onChange={e => setPrintIncludeExpl(e.target.checked)}
                      style={{ accentColor: '#f59e0b', width: '15px', height: '15px' }}
                    />
                    <span>Include Detailed Conceptual Explanations</span>
                  </label>
                )}
              </div>

              {/* Live Matching Question Count Indicator */}
              <div style={{
                background: printTaxonomy.matchingCount === 0
                  ? 'rgba(239, 68, 68, 0.1)'
                  : 'rgba(16, 185, 129, 0.12)',
                border: printTaxonomy.matchingCount === 0
                  ? '1px solid rgba(239, 68, 68, 0.35)'
                  : '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '10px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.83rem',
                fontWeight: 700,
                color: printTaxonomy.matchingCount === 0 ? '#fca5a5' : '#6ee7b7'
              }}>
                <span>
                  {loadingTaxonomy
                    ? '⏳ Counting matching archival questions...'
                    : typeof printTaxonomy.matchingCount === 'number'
                      ? `📚 ${printTaxonomy.matchingCount} Questions Matched for Selected Filter`
                      : '📚 All Matching Questions Will Be Printed'}
                </span>
                {typeof printTaxonomy.matchingCount === 'number' && printTaxonomy.matchingCount > 0 && (
                  <span style={{
                    background: 'rgba(16, 185, 129, 0.25)',
                    color: '#a7f3d0',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    fontSize: '0.73rem',
                    fontWeight: 800
                  }}>
                    Full Colour • No Limit
                  </span>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: '16px 24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(2, 6, 23, 0.5)'
            }}>
              <button
                type="button"
                onClick={() => setPrintModalOpen(false)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#94a3b8',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  handleLaunchPrint();
                  setPrintModalOpen(false);
                }}
                disabled={loadingTaxonomy || printTaxonomy.matchingCount === 0}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 24px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: printTaxonomy.matchingCount === 0 ? 'not-allowed' : 'pointer',
                  opacity: printTaxonomy.matchingCount === 0 ? 0.5 : 1,
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)'
                }}
              >
                <Printer size={16} />
                <span>
                  {typeof printTaxonomy.matchingCount === 'number' && printTaxonomy.matchingCount > 0
                    ? `Open & Print All (${printTaxonomy.matchingCount} Qs)`
                    : 'Open & Print PDF'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Instant Feedback Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '12px',
          fontWeight: 800,
          fontSize: '0.88rem',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 9999,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}

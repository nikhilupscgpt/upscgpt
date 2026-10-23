'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Printer, 
  Code2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Layers, 
  Copy, 
  Check, 
  Eye, 
  BookOpen, 
  Newspaper, 
  Compass,
  Edit3,
  Plus,
  Trash2,
  CheckSquare,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { getStructuredExplanation } from '@/lib/pyqExplanationHelper';
import { normalizeCanonicalSubject } from '@/app/prelims/pyq/topicGroups';
import { normalizeKeywordsList, slugifyKeyword } from '@/lib/pyqKeywords';
import '@/app/prelims/pyq/pyq-ui.css';

export default function PyqVisualEditorClient({ initialQuestion }) {
  const initialStructured = useMemo(() => {
    return getStructuredExplanation(initialQuestion);
  }, [initialQuestion]);

  // Construct initial structured object
  const buildInitialData = useCallback((q, structured) => {
    let opts = q.options || [];
    if (!Array.isArray(opts) || opts.length === 0) {
      opts = [
        { label: 'a', text: '' },
        { label: 'b', text: '' },
        { label: 'c', text: '' },
        { label: 'd', text: '' },
      ];
    }
    const normalizedOptions = opts.map((o, idx) => ({
      label: (o.label || String.fromCharCode(97 + idx)).toLowerCase(),
      text: o.text || ''
    }));

    // Clean keywords helper (strips distractors, splits into term + shortNote + longContent)
    const cleanKeywords = (rawKeywords) => {
      return normalizeKeywordsList(rawKeywords);
    };

    const initialAnalysis = structured.analysis ? {
      ...structured.analysis,
      keywords: cleanKeywords(structured.analysis.keywords)
    } : {
      keywords: cleanKeywords([
        { term: q.srcSubject || 'General Studies', shortNote: 'Core UPSC Prelims syllabus subject.' },
        { term: q.srcTopic || 'Polity & Governance', shortNote: 'Key conceptual theme tested in this question.' }
      ]),
      optionBreakdown: normalizedOptions.map(o => ({
        label: o.label,
        verdict: o.label === (q.correctLabel || '').toLowerCase() ? 'Correct' : 'Incorrect',
        explanation: o.label === (q.correctLabel || '').toLowerCase() 
          ? 'Key provision tested by UPSC based on standard statutory reference.' 
          : 'Contradicts statutory or institutional guidelines.'
      })),
      valueAddition: typeof q.explanation === 'string' && q.explanation ? q.explanation : 'Foundational conceptual linkages and operational guidelines.',
      inNews: {
        headline: 'High-Yield Prelims Subject Analysis',
        source: 'The Hindu / PIB',
        date: 'Recent Cycle',
        relevance: 'Tested frequently under UPSC Preliminary examination syllabus trends.'
      },
      similarPyq: {
        examYear: q.examYear ? q.examYear - 3 : 2020,
        examName: 'UPSC CSE Pre',
        stem: 'Adjacent conceptual theme tested in earlier preliminary cycles.',
        keyTakeaway: 'UPSC frequently rotates core statutory parameters into modified distractor statements.'
      }
    };

    return {
      examName: q.examName || 'UPSC CSE Pre',
      examYear: q.examYear || 2024,
      questionNo: q.questionNo ?? null,
      srcSubject: q.srcSubject || '',
      srcTopic: q.srcTopic || '',
      sourceBase: q.sourceBase || '',
      stem: q.stem || '',
      options: normalizedOptions,
      correctLabel: (q.correctLabel || 'a').toLowerCase(),
      analysis: initialAnalysis
    };
  }, []);

  // Primary Source of Truth: parsed data object
  const [data, setData] = useState(() => buildInitialData(initialQuestion, initialStructured));
  
  // Left JSON string mirror
  const [rawJsonText, setRawJsonText] = useState(() => JSON.stringify(buildInitialData(initialQuestion, initialStructured), null, 2));
  const [parseError, setParseError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [safeMergeEnabled, setSafeMergeEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // Helper to merge incoming JSON while protecting the canonical question and syllabus taxonomy
  const mergeIncomingJson = useCallback((incomingObj, currentData) => {
    // Determine canonical subject
    const canonicalSub = normalizeCanonicalSubject(
      initialQuestion.srcSubject || currentData.srcSubject || incomingObj.srcSubject
    );

    // Determine canonical topic (keep question's existing canonical topic if incoming is long or non-standard)
    let finalTopic = initialQuestion.srcTopic || currentData.srcTopic || incomingObj.srcTopic;
    const incomingTopic = incomingObj.srcTopic ? String(incomingObj.srcTopic).trim() : '';

    // If incoming topic is long composite string (e.g. contains "—" or "Making of..."), preserve canonical topic and store composite in srcTheme
    let themeToSet = incomingObj.srcTheme || currentData.srcTheme;
    if (incomingTopic && (incomingTopic.includes('—') || incomingTopic.includes('–') || incomingTopic.length > 50)) {
      themeToSet = incomingTopic;
    }

    // Extract analysis payload
    const incomingAnalysis = incomingObj.analysis || (incomingObj.optionBreakdown ? incomingObj : null) || {};

    return {
      ...currentData,
      // STRICTLY PROTECT verified question identity and syllabus taxonomy
      id: initialQuestion.id,
      examName: initialQuestion.examName || currentData.examName || incomingObj.examName || 'UPSC CSE Pre',
      examYear: initialQuestion.examYear || currentData.examYear || incomingObj.examYear || 2025,
      questionNo: initialQuestion.questionNo !== undefined ? initialQuestion.questionNo : (currentData.questionNo !== undefined ? currentData.questionNo : incomingObj.questionNo),
      srcSubject: canonicalSub,
      srcTopic: finalTopic,
      stem: initialQuestion.stem || currentData.stem || incomingObj.stem,
      options: initialQuestion.options && initialQuestion.options.length > 0 ? initialQuestion.options : (currentData.options && currentData.options.length > 0 ? currentData.options : incomingObj.options),

      // ACCEPT AI Answer, Breakdown, and Deep Dive Value Additions
      correctLabel: (incomingObj.correctLabel || currentData.correctLabel || 'a').toLowerCase(),
      sourceBase: incomingObj.sourceBase || currentData.sourceBase || '',
      topicHierarchy: Array.isArray(incomingObj.topicHierarchy) ? incomingObj.topicHierarchy : currentData.topicHierarchy,
      srcTheme: themeToSet,
      explanation: incomingObj.explanation !== undefined ? incomingObj.explanation : currentData.explanation,
      analysis: {
        ...(currentData.analysis || {}),
        ...(incomingAnalysis || {}),
        keywords: normalizeKeywordsList(
          Array.isArray(incomingAnalysis.keywords)
            ? incomingAnalysis.keywords
            : (currentData.analysis?.keywords || [])
        ),
        optionBreakdown: incomingAnalysis.optionBreakdown || currentData.analysis?.optionBreakdown || [],
        valueAddition: incomingAnalysis.valueAddition || currentData.analysis?.valueAddition || '',
        inNews: incomingAnalysis.inNews !== undefined ? incomingAnalysis.inNews : currentData.analysis?.inNews,
        similarPyq: incomingAnalysis.similarPyq !== undefined ? incomingAnalysis.similarPyq : currentData.analysis?.similarPyq,
        visualSuggestion: incomingAnalysis.visualSuggestion !== undefined ? incomingAnalysis.visualSuggestion : currentData.analysis?.visualSuggestion,
      }
    };
  }, [initialQuestion]);

  // Sync from Right Visual Editor to Left JSON
  const updateDataAndSyncJson = useCallback((updater) => {
    setData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      try {
        setRawJsonText(JSON.stringify(next, null, 2));
        setParseError(null);
      } catch (e) {
        console.error('Error stringifying JSON:', e);
      }
      return next;
    });
  }, []);

  // Sync from Left JSON to Right Visual Editor
  const handleJsonChange = (newText) => {
    setRawJsonText(newText);
    try {
      const trimmed = newText.trim();
      if (!trimmed) {
        setParseError('JSON editor is empty');
        return;
      }
      const parsed = JSON.parse(trimmed);
      if (safeMergeEnabled) {
        const merged = mergeIncomingJson(parsed, data);
        setData(merged);
      } else {
        setData(parsed);
      }
      setParseError(null);
    } catch (err) {
      setParseError(err.message);
    }
  };

  const handlePasteGeminiAnswer = async () => {
    try {
      let text = '';
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.readText) {
        try {
          text = await navigator.clipboard.readText();
        } catch (clipErr) {
          console.warn('Clipboard read permission denied or unavailable:', clipErr);
        }
      }
      if (!text || !text.trim() || !text.includes('{')) {
        const manual = window.prompt("Paste your Gemini JSON code here (Answer & Analysis will be safely merged into this question):");
        if (!manual) return;
        text = manual;
      }

      const parsed = JSON.parse(text.trim());
      const merged = mergeIncomingJson(parsed, data);
      setData(merged);
      setRawJsonText(JSON.stringify(merged, null, 2));
      setParseError(null);
      setToastMessage('✓ Gemini Answer & Analysis safely merged! (Question & Topic protected)');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      alert('Failed to parse and merge Gemini JSON: ' + err.message);
    }
  };

  const handleFormatJson = () => {
    try {
      const obj = JSON.parse(rawJsonText);
      setRawJsonText(JSON.stringify(obj, null, 2));
      setParseError(null);
    } catch (err) {
      setParseError('Cannot format: ' + err.message);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rawJsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Save to DB
  const handleSave = async () => {
    if (parseError) {
      alert('Please fix the JSON errors before saving: ' + parseError);
      return;
    }

    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/admin/pyq/${initialQuestion.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stem: data.stem,
          options: data.options,
          correctLabel: data.correctLabel,
          srcSubject: data.srcSubject,
          srcTopic: data.srcTopic,
          examName: data.examName,
          examYear: data.examYear,
          questionNo: data.questionNo,
          analysis: data.analysis || null,
          explanation: data.explanation || null,
        })
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to update question');

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Error saving question: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePrintSlide = () => {
    window.open(`/api/admin/pyq/print-pdf?mode=slide&ids=${initialQuestion.id}`, '_blank');
  };

  // Specific visual field updaters
  const handleStemChange = (val) => {
    updateDataAndSyncJson(prev => ({ ...prev, stem: val }));
  };

  const handleOptionTextChange = (idx, newText) => {
    updateDataAndSyncJson(prev => {
      const nextOpts = [...(prev.options || [])];
      if (nextOpts[idx]) {
        nextOpts[idx] = { ...nextOpts[idx], text: newText };
      }
      return { ...prev, options: nextOpts };
    });
  };

  const handleSelectCorrect = (label) => {
    updateDataAndSyncJson(prev => ({ ...prev, correctLabel: label.toLowerCase() }));
  };

  const handleValueAdditionChange = (val) => {
    updateDataAndSyncJson(prev => ({
      ...prev,
      analysis: {
        ...(prev.analysis || {}),
        valueAddition: val
      }
    }));
  };

  const handleNewsChange = (field, val) => {
    updateDataAndSyncJson(prev => ({
      ...prev,
      analysis: {
        ...(prev.analysis || {}),
        inNews: {
          ...((prev.analysis && prev.analysis.inNews) || {}),
          [field]: val
        }
      }
    }));
  };

  const handleSimilarPyqChange = (field, val) => {
    updateDataAndSyncJson(prev => ({
      ...prev,
      analysis: {
        ...(prev.analysis || {}),
        similarPyq: {
          ...((prev.analysis && prev.analysis.similarPyq) || {}),
          [field]: val
        }
      }
    }));
  };

  const handleOptionExplanationChange = (idx, val) => {
    updateDataAndSyncJson(prev => {
      const breakdown = [...((prev.analysis && prev.analysis.optionBreakdown) || [])];
      if (breakdown[idx]) {
        breakdown[idx] = { ...breakdown[idx], explanation: val };
      }
      return {
        ...prev,
        analysis: {
          ...(prev.analysis || {}),
          optionBreakdown: breakdown
        }
      };
    });
  };

  const handleOptionVerdictChange = (idx, val) => {
    updateDataAndSyncJson(prev => {
      const breakdown = [...((prev.analysis && prev.analysis.optionBreakdown) || [])];
      if (breakdown[idx]) {
        breakdown[idx] = { ...breakdown[idx], verdict: val };
      }
      return {
        ...prev,
        analysis: {
          ...(prev.analysis || {}),
          optionBreakdown: breakdown
        }
      };
    });
  };

  const handleAddKeyword = () => {
    const rawTerm = window.prompt('Enter Keyword / Concept Title (e.g., Article 394 (Commencement)):');
    if (!rawTerm || !rawTerm.trim()) return;
    const rawNote = window.prompt('Enter Short Concept Card Note (1-2 sentences shown when keyword is clicked):') || '';
    const term = rawTerm.trim();
    const shortNote = rawNote.trim();
    const slug = slugifyKeyword(term);
    updateDataAndSyncJson(prev => ({
      ...prev,
      analysis: {
        ...(prev.analysis || {}),
        keywords: [
          ...normalizeKeywordsList((prev.analysis && prev.analysis.keywords) || []),
          {
            slug,
            term,
            shortNote,
            longContent: '',
            concept: shortNote ? `${term}: ${shortNote}` : term,
            isDistractor: false
          }
        ]
      }
    }));
  };

  const handleKeywordFieldChange = (idx, field, val) => {
    updateDataAndSyncJson(prev => {
      const kwList = [...normalizeKeywordsList((prev.analysis && prev.analysis.keywords) || [])];
      if (!kwList[idx]) return prev;
      const updatedItem = {
        ...kwList[idx],
        [field]: val
      };
      const nextTerm = (updatedItem.term || '').trim();
      const nextShort = (updatedItem.shortNote || '').trim();
      updatedItem.slug = slugifyKeyword(nextTerm);
      updatedItem.concept = nextShort ? `${nextTerm}: ${nextShort}` : nextTerm;
      kwList[idx] = updatedItem;
      return {
        ...prev,
        analysis: {
          ...(prev.analysis || {}),
          keywords: kwList
        }
      };
    });
  };

  const handleRemoveKeyword = (idx) => {
    updateDataAndSyncJson(prev => {
      const kw = [...normalizeKeywordsList((prev.analysis && prev.analysis.keywords) || [])];
      kw.splice(idx, 1);
      return {
        ...prev,
        analysis: {
          ...(prev.analysis || {}),
          keywords: kw
        }
      };
    });
  };

  const optionsList = Array.isArray(data.options) ? data.options : [];
  const analysisObj = data.analysis || {};
  const keywordsList = normalizeKeywordsList(analysisObj.keywords || []);
  const optionBreakdownList = Array.isArray(analysisObj.optionBreakdown) ? analysisObj.optionBreakdown : [];
  const inNewsObj = analysisObj.inNews || {};
  const similarPyqObj = analysisObj.similarPyq || {};

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#070b14',
      color: '#f8fafc',
      fontFamily: 'var(--font-outfit), system-ui, -apple-system, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Top Navbar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        background: '#0d131f',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        flexShrink: 0,
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link 
            href="/admin/pyq"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#94a3b8',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <ArrowLeft size={15} />
            <span>Back to Question List</span>
          </Link>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                background: '#dc2626',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.75rem',
                padding: '2px 8px',
                borderRadius: '9999px',
                letterSpacing: '0.3px'
              }}>
                {data.examName || initialQuestion.examName} {data.examYear || initialQuestion.examYear}
              </span>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>
                Q#{data.questionNo ?? initialQuestion.questionNo ?? '–'}
              </span>
              <span style={{ color: '#64748b', fontSize: '0.8rem' }}>•</span>
              <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
                {data.srcSubject || initialQuestion.srcSubject} {data.srcTopic ? `› ${data.srcTopic}` : ''}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {saveSuccess && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#10b981',
              fontSize: '0.85rem',
              fontWeight: 700
            }}>
              <CheckCircle2 size={16} /> Changes Saved!
            </span>
          )}

          <button
            onClick={handlePrintSlide}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(59, 130, 246, 0.12)',
              color: '#60a5fa',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            title="Open printable lecture slide in landscape format"
          >
            <Printer size={15} />
            <span>Print Slide / PDF</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving || Boolean(parseError)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '8px',
              background: parseError ? '#475569' : '#10b981',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: parseError ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1
            }}
          >
            {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
            <span>{saving ? 'Saving...' : 'Save Question & Answer'}</span>
          </button>
        </div>
      </header>

      {/* Main Split-Screen Workspace */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '40% 60%',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden'
      }}>
        {/* ========================================================================= */}
        {/* LEFT COLUMN: JSON / JSONL Ingestion & Raw Editor                          */}
        {/* ========================================================================= */}
        <section style={{
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          background: '#090e17',
          minHeight: 0
        }}>
          {/* Left Toolbar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code2 size={16} color="#60a5fa" />
              <strong style={{ fontSize: '0.85rem', color: '#f1f5f9' }}>JSON / JSONL Ingestion Panel</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={handlePasteGeminiAnswer}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                  color: '#ffffff',
                  border: '1px solid rgba(251, 191, 36, 0.4)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.35)'
                }}
                title="Safely extract and merge analysis, answer key, and value additions without altering question or topic"
              >
                <Zap size={12} fill="#ffffff" />
                <span>Merge Gemini Answer</span>
              </button>

              <button
                onClick={handleCopy}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#94a3b8',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleFormatJson}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: '#1e293b',
                  color: '#f8fafc',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Sparkles size={12} color="#fbbf24" />
                <span>Format JSON</span>
              </button>
            </div>
          </div>

          {/* Protection Safeguard Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 14px',
            background: 'rgba(15, 23, 42, 0.95)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.75rem',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
              <ShieldCheck size={14} color="#10b981" />
              <span>Protected Question:</span>
              <strong style={{ color: '#38bdf8' }}>{initialQuestion.srcSubject || 'Indian Polity'}</strong>
              <span style={{ color: '#64748b' }}>›</span>
              <strong style={{ color: '#fde047' }}>{initialQuestion.srcTopic || 'Constituent Assembly'}</strong>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: safeMergeEnabled ? '#34d399' : '#94a3b8', fontWeight: 700 }}>
              <input
                type="checkbox"
                checked={safeMergeEnabled}
                onChange={(e) => setSafeMergeEnabled(e.target.checked)}
                style={{ accentColor: '#10b981', cursor: 'pointer' }}
              />
              <span>Lock Question &amp; Topic</span>
            </label>
          </div>

          {toastMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              background: 'rgba(16, 185, 129, 0.2)',
              borderBottom: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#6ee7b7',
              fontSize: '0.8rem',
              fontWeight: 700,
              flexShrink: 0
            }}>
              <CheckCircle2 size={15} color="#10b981" />
              <div>{toastMessage}</div>
            </div>
          )}

          {parseError && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              padding: '8px 14px',
              background: 'rgba(239, 68, 68, 0.15)',
              borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: '0.8rem',
              lineHeight: 1.4,
              flexShrink: 0
            }}>
              <AlertCircle size={15} color="#ef4444" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div><strong>Parse Error:</strong> {parseError}</div>
            </div>
          )}

          {/* JSON Textarea */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <textarea
              value={rawJsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
              placeholder="Paste raw JSON/JSONL here or edit fields directly on the right..."
              style={{
                width: '100%',
                height: '100%',
                background: '#070b14',
                color: '#f8fafc',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize: '0.84rem',
                lineHeight: 1.5,
                padding: '16px',
                border: 'none',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box'
              }}
              spellCheck={false}
            />
          </div>

          <div style={{
            padding: '10px 16px',
            background: 'rgba(0, 0, 0, 0.25)',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '0.75rem',
            color: '#64748b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0
          }}>
            <span>💡 <strong>Two-way sync:</strong> Editing on either side updates both panels simultaneously!</span>
            <span style={{ color: parseError ? '#ef4444' : '#10b981', fontWeight: 700 }}>
              {parseError ? '● Syntax Error' : '● Live 2-Way Syncing'}
            </span>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Interactive Visual Frontend UI Editor                       */}
        {/* ========================================================================= */}
        <section style={{
          display: 'flex',
          flexDirection: 'column',
          background: '#090e1a',
          minHeight: 0,
          overflowY: 'auto',
          padding: '24px 28px',
          gap: '20px'
        }}>
          {/* Panel Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Edit3 size={17} color="#38bdf8" />
              <strong style={{ fontSize: '0.92rem', color: '#ffffff' }}>Direct Visual Field Editor (Frontend UI)</strong>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
              ✏️ Click any card to edit directly
            </span>
          </div>

          {/* Card 1: Question Stem & Options */}
          <div style={{
            background: '#0d1424',
            border: '1px solid #1c263c',
            borderRadius: '16px',
            padding: '24px 26px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
                Question Stem (Text &amp; Statements)
              </label>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Markdown &amp; Tables Supported</span>
            </div>

            <textarea
              value={data.stem || ''}
              onChange={(e) => handleStemChange(e.target.value)}
              placeholder="Enter question stem and statements..."
              rows={5}
              style={{
                width: '100%',
                background: '#070b14',
                color: '#f8fafc',
                border: '1px solid #1c263c',
                borderRadius: '8px',
                padding: '12px 14px',
                fontSize: '0.94rem',
                lineHeight: 1.55,
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                marginBottom: '16px'
              }}
            />

            {/* Options List with One-Click Radio for Correct Key */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
                Options &amp; Correct Key Selection (Click circle to set correct answer)
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {optionsList.map((opt, idx) => {
                const isSelected = opt.label.toLowerCase() === (data.correctLabel || '').toLowerCase();
                return (
                  <div
                    key={opt.label || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: isSelected ? 'rgba(16, 185, 129, 0.08)' : '#090e1a',
                      border: isSelected ? '1.5px solid #10b981' : '1px solid #1c263c',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      transition: 'border-color 0.15s'
                    }}
                  >
                    {/* Clickable Circle to Set as Correct Answer */}
                    <button
                      type="button"
                      onClick={() => handleSelectCorrect(opt.label)}
                      title={`Click to mark (${opt.label.toUpperCase()}) as the correct answer`}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        border: 'none',
                        background: isSelected ? '#10b981' : '#192339',
                        color: isSelected ? '#ffffff' : '#94a3b8',
                        fontWeight: 800,
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.15s'
                      }}
                    >
                      {opt.label.toUpperCase()}
                    </button>

                    <input
                      type="text"
                      value={opt.text || ''}
                      onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                      placeholder={`Option (${opt.label.toUpperCase()}) text...`}
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        color: isSelected ? '#ffffff' : '#cbd5e1',
                        fontSize: '14px',
                        outline: 'none',
                        fontWeight: isSelected ? 600 : 400
                      }}
                    />

                    {isSelected && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#10b981',
                        background: 'rgba(16, 185, 129, 0.2)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        flexShrink: 0
                      }}>
                        ✓ Correct Answer
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Keywords & Tested Concepts Container */}
          <div style={{
            background: '#0d1424',
            border: '1px solid #1c263c',
            borderRadius: '16px',
            padding: '20px 24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckSquare size={16} color="#38bdf8" />
                <strong style={{ fontSize: '14px', color: '#f8fafc' }}>Keywords &amp; Concept Cards</strong>
              </div>
              <button
                type="button"
                onClick={handleAddKeyword}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: 'rgba(56, 189, 248, 0.12)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Plus size={13} />
                <span>Add Keyword Card</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {keywordsList.map((kw, i) => (
                <div
                  key={kw.slug || i}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: '#070b14',
                    border: '1px solid rgba(59, 130, 246, 0.28)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                      <span style={{
                        padding: '2px 7px',
                        borderRadius: '5px',
                        background: 'rgba(59, 130, 246, 0.16)',
                        color: '#60a5fa',
                        fontSize: '10.5px',
                        fontWeight: 800,
                        whiteSpace: 'nowrap'
                      }}>
                        #{i + 1} PILL
                      </span>
                      <input
                        type="text"
                        value={kw.term || ''}
                        onChange={(e) => handleKeywordFieldChange(i, 'term', e.target.value)}
                        placeholder="Keyword Title (e.g., Article 394 (Commencement))"
                        style={{
                          flex: 1,
                          background: '#0d1424',
                          color: '#93c5fd',
                          border: '1px solid #1e293b',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          fontSize: '13px',
                          fontWeight: 700,
                          outline: 'none'
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(i)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        color: '#f87171',
                        cursor: 'pointer',
                        padding: '5px 7px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Remove keyword card"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div>
                    <textarea
                      rows={2}
                      value={kw.shortNote || ''}
                      onChange={(e) => handleKeywordFieldChange(i, 'shortNote', e.target.value)}
                      placeholder="Short Concept Card content (1-2 sentences shown when student clicks this keyword)..."
                      style={{
                        width: '100%',
                        background: '#0d1424',
                        color: '#cbd5e1',
                        border: '1px solid #1e293b',
                        borderRadius: '6px',
                        padding: '7px 10px',
                        fontSize: '12.5px',
                        lineHeight: 1.5,
                        outline: 'none',
                        resize: 'vertical',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Option-by-Option Breakdown */}
          <div style={{
            background: '#0d1424',
            border: '1px solid #1c263c',
            borderRadius: '16px',
            padding: '20px 24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <BookOpen size={16} color="#f43f5e" />
              <strong style={{ fontSize: '14.5px', color: '#f8fafc' }}>
                Option-by-Option Explanation Breakdown
              </strong>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {optionBreakdownList.map((opt, i) => {
                const isCorr = (opt.verdict || '').toLowerCase().includes('correct') && !(opt.verdict || '').toLowerCase().includes('incorrect');
                return (
                  <div
                    key={i}
                    style={{
                      background: '#090e1a',
                      border: '1px solid #1c263c',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        background: isCorr ? '#10b981' : '#ef4444',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '11px',
                        padding: '1px 8px',
                        borderRadius: '4px'
                      }}>
                        Option ({opt.label})
                      </span>
                      <input
                        type="text"
                        value={opt.verdict || ''}
                        onChange={(e) => handleOptionVerdictChange(i, e.target.value)}
                        placeholder="Verdict (e.g. Correct / Incorrect)..."
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: isCorr ? '#34d399' : '#f87171',
                          fontWeight: 800,
                          fontSize: '12px',
                          outline: 'none',
                          width: '160px'
                        }}
                      />
                    </div>
                    <textarea
                      value={opt.explanation || ''}
                      onChange={(e) => handleOptionExplanationChange(i, e.target.value)}
                      rows={2}
                      placeholder={`Explanation for option (${opt.label})...`}
                      style={{
                        width: '100%',
                        background: '#070b14',
                        color: '#cbd5e1',
                        border: '1px solid #1c263c',
                        borderRadius: '6px',
                        padding: '8px 10px',
                        fontSize: '13px',
                        lineHeight: 1.5,
                        outline: 'none',
                        resize: 'vertical',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 4: Value Addition Container */}
          <div style={{
            background: '#0d1424',
            border: '1px solid #1c263c',
            borderRadius: '16px',
            padding: '20px 24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Layers size={16} color="#eab308" />
              <strong style={{ fontSize: '14.5px', color: '#f8fafc' }}>
                Value Addition (Institutional Framework &amp; Macro Coverage)
              </strong>
            </div>

            <textarea
              value={typeof data.analysis?.valueAddition === 'string' ? data.analysis.valueAddition : (typeof data.explanation === 'string' ? data.explanation : '')}
              onChange={(e) => handleValueAdditionChange(e.target.value)}
              rows={4}
              placeholder="Enter comprehensive value addition, statistical figures, pillars, and governance linkages..."
              style={{
                width: '100%',
                background: '#070b14',
                color: '#fef08a',
                border: '1px solid #1c263c',
                borderRadius: '8px',
                padding: '12px 14px',
                fontSize: '13px',
                lineHeight: 1.6,
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Card 5 & 6: In News & Similar PYQ Dual Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}>
            {/* In News Box */}
            <div style={{
              background: '#0d1424',
              border: '1px solid #1c263c',
              borderRadius: '16px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Newspaper size={15} color="#38bdf8" />
                <strong style={{ fontSize: '13.5px', color: '#38bdf8' }}>In News Clipping</strong>
              </div>

              <input
                type="text"
                value={inNewsObj.headline || ''}
                onChange={(e) => handleNewsChange('headline', e.target.value)}
                placeholder="News headline..."
                style={{
                  background: '#070b14',
                  color: '#f8fafc',
                  border: '1px solid #1c263c',
                  borderRadius: '6px',
                  padding: '7px 10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  outline: 'none'
                }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <input
                  type="text"
                  value={inNewsObj.source || ''}
                  onChange={(e) => handleNewsChange('source', e.target.value)}
                  placeholder="Source (e.g. The Hindu)..."
                  style={{
                    background: '#070b14',
                    color: '#94a3b8',
                    border: '1px solid #1c263c',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '11.5px',
                    outline: 'none'
                  }}
                />
                <input
                  type="text"
                  value={inNewsObj.date || ''}
                  onChange={(e) => handleNewsChange('date', e.target.value)}
                  placeholder="Date (e.g. May 2026)..."
                  style={{
                    background: '#070b14',
                    color: '#94a3b8',
                    border: '1px solid #1c263c',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '11.5px',
                    outline: 'none'
                  }}
                />
              </div>

              <textarea
                value={inNewsObj.relevance || ''}
                onChange={(e) => handleNewsChange('relevance', e.target.value)}
                rows={2}
                placeholder="Relevance / why this is in news..."
                style={{
                  background: '#070b14',
                  color: '#cbd5e1',
                  border: '1px solid #1c263c',
                  borderRadius: '6px',
                  padding: '7px 10px',
                  fontSize: '12.5px',
                  lineHeight: 1.45,
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Similar PYQ Box */}
            <div style={{
              background: '#0d1424',
              border: '1px solid #1c263c',
              borderRadius: '16px',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Compass size={15} color="#a78bfa" />
                <strong style={{ fontSize: '13.5px', color: '#a78bfa' }}>Similar PYQ Linkage</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                <input
                  type="text"
                  value={similarPyqObj.examName || ''}
                  onChange={(e) => handleSimilarPyqChange('examName', e.target.value)}
                  placeholder="Exam (e.g. UPSC CSE Pre)..."
                  style={{
                    background: '#070b14',
                    color: '#f8fafc',
                    border: '1px solid #1c263c',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '12px',
                    outline: 'none'
                  }}
                />
                <input
                  type="number"
                  value={similarPyqObj.examYear || ''}
                  onChange={(e) => handleSimilarPyqChange('examYear', parseInt(e.target.value, 10) || '')}
                  placeholder="Year (e.g. 2018)..."
                  style={{
                    background: '#070b14',
                    color: '#f8fafc',
                    border: '1px solid #1c263c',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '12px',
                    outline: 'none'
                  }}
                />
              </div>

              <textarea
                value={similarPyqObj.stem || ''}
                onChange={(e) => handleSimilarPyqChange('stem', e.target.value)}
                rows={2}
                placeholder="Similar PYQ Question Stem..."
                style={{
                  background: '#070b14',
                  color: '#cbd5e1',
                  border: '1px solid #1c263c',
                  borderRadius: '6px',
                  padding: '7px 10px',
                  fontSize: '12.5px',
                  lineHeight: 1.45,
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'inherit'
                }}
              />

              <input
                type="text"
                value={similarPyqObj.keyTakeaway || ''}
                onChange={(e) => handleSimilarPyqChange('keyTakeaway', e.target.value)}
                placeholder="Core Takeaway banner text..."
                style={{
                  background: 'rgba(167, 139, 250, 0.1)',
                  color: '#ddd6fe',
                  border: '1px solid rgba(167, 139, 250, 0.25)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '12px',
                  outline: 'none',
                  fontWeight: 600
                }}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

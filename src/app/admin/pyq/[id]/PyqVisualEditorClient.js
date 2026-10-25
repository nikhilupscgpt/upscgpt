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
  Zap,
  Play,
  Table2
} from 'lucide-react';
import { getStructuredExplanation, formatQuestionForCopy } from '@/lib/pyqExplanationHelper';
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
  const [copiedQuestion, setCopiedQuestion] = useState(false);
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
        valueAddition: incomingAnalysis.valueAddition !== undefined ? incomingAnalysis.valueAddition : (currentData.analysis?.valueAddition || ''),
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

  const handleCopyQuestion = () => {
    const textToCopy = formatQuestionForCopy(data);
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopiedQuestion(true);
    setToastMessage('✓ Clean question & options copied to clipboard! Ready to paste in Gemini.');
    setTimeout(() => {
      setCopiedQuestion(false);
      setToastMessage(null);
    }, 3000);
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

  const handleOptionReferenceChange = (idx, val) => {
    updateDataAndSyncJson(prev => {
      const breakdown = [...((prev.analysis && prev.analysis.optionBreakdown) || [])];
      if (breakdown[idx]) {
        breakdown[idx] = { ...breakdown[idx], reference: val };
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

  // Value Addition Micro-Cards Handlers
  const handleValueAdditionCardChange = (cardIdx, field, val) => {
    updateDataAndSyncJson(prev => {
      const currentVA = Array.isArray(prev.analysis?.valueAddition) ? [...prev.analysis.valueAddition] : [];
      if (currentVA[cardIdx]) {
        currentVA[cardIdx] = { ...currentVA[cardIdx], [field]: val };
      }
      return {
        ...prev,
        analysis: {
          ...(prev.analysis || {}),
          valueAddition: currentVA
        }
      };
    });
  };

  const handleValueAdditionBulletChange = (cardIdx, bulletIdx, val) => {
    updateDataAndSyncJson(prev => {
      const currentVA = Array.isArray(prev.analysis?.valueAddition) ? [...prev.analysis.valueAddition] : [];
      if (currentVA[cardIdx]) {
        const bullets = [...(currentVA[cardIdx].bullets || [])];
        bullets[bulletIdx] = val;
        currentVA[cardIdx] = { ...currentVA[cardIdx], bullets };
      }
      return {
        ...prev,
        analysis: {
          ...(prev.analysis || {}),
          valueAddition: currentVA
        }
      };
    });
  };

  const handleAddValueAdditionBullet = (cardIdx) => {
    updateDataAndSyncJson(prev => {
      const currentVA = Array.isArray(prev.analysis?.valueAddition) ? [...prev.analysis.valueAddition] : [];
      if (currentVA[cardIdx]) {
        const bullets = [...(currentVA[cardIdx].bullets || []), 'New high-yield bullet point...'];
        currentVA[cardIdx] = { ...currentVA[cardIdx], bullets };
      }
      return {
        ...prev,
        analysis: {
          ...(prev.analysis || {}),
          valueAddition: currentVA
        }
      };
    });
  };

  const handleDeleteValueAdditionBullet = (cardIdx, bulletIdx) => {
    updateDataAndSyncJson(prev => {
      const currentVA = Array.isArray(prev.analysis?.valueAddition) ? [...prev.analysis.valueAddition] : [];
      if (currentVA[cardIdx]) {
        const bullets = (currentVA[cardIdx].bullets || []).filter((_, idx) => idx !== bulletIdx);
        currentVA[cardIdx] = { ...currentVA[cardIdx], bullets };
      }
      return {
        ...prev,
        analysis: {
          ...(prev.analysis || {}),
          valueAddition: currentVA
        }
      };
    });
  };

  const handleAddValueAdditionCard = () => {
    updateDataAndSyncJson(prev => {
      const currentVA = Array.isArray(prev.analysis?.valueAddition) ? [...prev.analysis.valueAddition] : [];
      currentVA.push({
        title: 'New High-Yield Dimension',
        tag: 'Constitutional Articles',
        bullets: ['Key statutory or conceptual takeaway...']
      });
      return {
        ...prev,
        analysis: {
          ...(prev.analysis || {}),
          valueAddition: currentVA
        }
      };
    });
  };

  const handleDeleteValueAdditionCard = (cardIdx) => {
    updateDataAndSyncJson(prev => {
      const currentVA = Array.isArray(prev.analysis?.valueAddition) ? [...prev.analysis.valueAddition] : [];
      currentVA.splice(cardIdx, 1);
      return {
        ...prev,
        analysis: {
          ...(prev.analysis || {}),
          valueAddition: currentVA
        }
      };
    });
  };

  // Visual Suggestion / Comparison Matrix Table Handlers
  const handleVisualSuggestionChange = (field, val) => {
    updateDataAndSyncJson(prev => ({
      ...prev,
      analysis: {
        ...(prev.analysis || {}),
        visualSuggestion: {
          ...((prev.analysis && prev.analysis.visualSuggestion) || { type: 'COMPARISON_TABLE', title: '', caption: '', tableData: { headers: [], rows: [] } }),
          [field]: val
        }
      }
    }));
  };

  const handleTableHeaderChange = (colIdx, val) => {
    updateDataAndSyncJson(prev => {
      const vs = prev.analysis?.visualSuggestion || { type: 'COMPARISON_TABLE', title: '', caption: '', tableData: { headers: [], rows: [] } };
      const tableData = vs.tableData || { headers: [], rows: [] };
      const headers = [...(tableData.headers || [])];
      headers[colIdx] = val;
      return {
        ...prev,
        analysis: {
          ...(prev.analysis || {}),
          visualSuggestion: {
            ...vs,
            tableData: {
              ...tableData,
              headers
            }
          }
        }
      };
    });
  };

  const handleTableCellChange = (rowIdx, colIdx, val) => {
    updateDataAndSyncJson(prev => {
      const vs = prev.analysis?.visualSuggestion || { type: 'COMPARISON_TABLE', title: '', caption: '', tableData: { headers: [], rows: [] } };
      const tableData = vs.tableData || { headers: [], rows: [] };
      const rows = (tableData.rows || []).map((row, r) => {
        if (r !== rowIdx) return row;
        const newRow = Array.isArray(row) ? [...row] : [];
        newRow[colIdx] = val;
        return newRow;
      });
      return {
        ...prev,
        analysis: {
          ...(prev.analysis || {}),
          visualSuggestion: {
            ...vs,
            tableData: {
              ...tableData,
              rows
            }
          }
        }
      };
    });
  };

  const handleAddTableRow = () => {
    updateDataAndSyncJson(prev => {
      const vs = prev.analysis?.visualSuggestion || { type: 'COMPARISON_TABLE', title: '', caption: '', tableData: { headers: [], rows: [] } };
      const tableData = vs.tableData || { headers: [], rows: [] };
      const headerCount = (tableData.headers || []).length || 4;
      const newRow = Array.from({ length: headerCount }, () => '');
      return {
        ...prev,
        analysis: {
          ...(prev.analysis || {}),
          visualSuggestion: {
            ...vs,
            tableData: {
              ...tableData,
              rows: [...(tableData.rows || []), newRow]
            }
          }
        }
      };
    });
  };

  const handleDeleteTableRow = (rowIdx) => {
    updateDataAndSyncJson(prev => {
      const vs = prev.analysis?.visualSuggestion || { type: 'COMPARISON_TABLE', title: '', caption: '', tableData: { headers: [], rows: [] } };
      const tableData = vs.tableData || { headers: [], rows: [] };
      const rows = (tableData.rows || []).filter((_, idx) => idx !== rowIdx);
      return {
        ...prev,
        analysis: {
          ...(prev.analysis || {}),
          visualSuggestion: {
            ...vs,
            tableData: {
              ...tableData,
              rows
            }
          }
        }
      };
    });
  };

  const handleAddTableColumn = () => {
    updateDataAndSyncJson(prev => {
      const vs = prev.analysis?.visualSuggestion || { type: 'COMPARISON_TABLE', title: '', caption: '', tableData: { headers: [], rows: [] } };
      const tableData = vs.tableData || { headers: [], rows: [] };
      const headers = [...(tableData.headers || []), `Column ${(tableData.headers || []).length + 1}`];
      const rows = (tableData.rows || []).map(row => Array.isArray(row) ? [...row, ''] : ['']);
      return {
        ...prev,
        analysis: {
          ...(prev.analysis || {}),
          visualSuggestion: {
            ...vs,
            tableData: {
              ...tableData,
              headers,
              rows
            }
          }
        }
      };
    });
  };

  const handleDeleteTableColumn = (colIdx) => {
    updateDataAndSyncJson(prev => {
      const vs = prev.analysis?.visualSuggestion || { type: 'COMPARISON_TABLE', title: '', caption: '', tableData: { headers: [], rows: [] } };
      const tableData = vs.tableData || { headers: [], rows: [] };
      const headers = (tableData.headers || []).filter((_, idx) => idx !== colIdx);
      const rows = (tableData.rows || []).map(row => Array.isArray(row) ? row.filter((_, idx) => idx !== colIdx) : []);
      return {
        ...prev,
        analysis: {
          ...(prev.analysis || {}),
          visualSuggestion: {
            ...vs,
            tableData: {
              ...tableData,
              headers,
              rows
            }
          }
        }
      };
    });
  };

  const handleAddDefaultComparisonTable = () => {
    updateDataAndSyncJson(prev => ({
      ...prev,
      analysis: {
        ...(prev.analysis || {}),
        visualSuggestion: {
          type: 'COMPARISON_TABLE',
          title: 'High-Yield Comparison Matrix',
          caption: 'Notice what UPSC did here: the examiner drafted negative statements targeting specific consecutive articles.',
          tableData: {
            headers: ['Article / Provision', 'Subject Matter', 'Exact Text / Mandate', 'Key Exception / Feature'],
            rows: [
              ['Article 393', 'Short Title', 'This Constitution may be called the Constitution of India', 'Official name'],
              ['Article 394', 'Commencement', 'Identifies 26th January, 1950 as date of commencement', '16 articles in force on 26 Nov 1949'],
              ['Article 395', 'Repeals', 'Repeals GOI Act 1935 & Indian Independence Act 1947', 'Preserved Privy Council Act 1949']
            ]
          }
        }
      }
    }));
  };

  const handleDeleteComparisonTable = () => {
    if (!window.confirm('Are you sure you want to remove the comparison table?')) return;
    updateDataAndSyncJson(prev => ({
      ...prev,
      analysis: {
        ...(prev.analysis || {}),
        visualSuggestion: null
      }
    }));
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

          <a
            href={`/admin/pyq/present?id=${initialQuestion.id}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #4f46e5, #3b82f6)',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 800,
              textDecoration: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.35)',
            }}
            title="Open in full-screen 1080p Lecture Studio with XP-Pen pen annotation"
          >
            <Play size={15} fill="currentColor" />
            <span>▶ Present / Lecture Mode</span>
          </a>

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
            onClick={handleCopyQuestion}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 15px',
              borderRadius: '8px',
              background: copiedQuestion ? 'rgba(16, 185, 129, 0.15)' : 'rgba(168, 85, 247, 0.14)',
              color: copiedQuestion ? '#34d399' : '#c084fc',
              border: copiedQuestion ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(168, 85, 247, 0.35)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Copy clean question text and options to clipboard (ready to paste directly into Gemini)"
          >
            {copiedQuestion ? <Check size={15} /> : <Copy size={15} />}
            <span>{copiedQuestion ? 'Question Copied!' : 'Copy Question for Gemini'}</span>
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
                type="button"
                onClick={handleCopyQuestion}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: copiedQuestion ? 'rgba(16, 185, 129, 0.15)' : 'rgba(168, 85, 247, 0.12)',
                  color: copiedQuestion ? '#34d399' : '#c084fc',
                  border: copiedQuestion ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(168, 85, 247, 0.3)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                title="Copy clean question text and options to clipboard (ready to paste directly into Gemini)"
              >
                {copiedQuestion ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                <span>{copiedQuestion ? 'Copied' : 'Copy Question'}</span>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
                          width: '130px'
                        }}
                      />
                      <input
                        type="text"
                        value={opt.reference || ''}
                        onChange={(e) => handleOptionReferenceChange(i, e.target.value)}
                        placeholder="Statutory / Book Ref (e.g. Article 393)..."
                        style={{
                          flex: 1,
                          minWidth: '200px',
                          background: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.25)',
                          borderRadius: '6px',
                          color: '#93c5fd',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          padding: '3px 8px',
                          outline: 'none'
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
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} color="#eab308" />
                <strong style={{ fontSize: '14.5px', color: '#f8fafc' }}>
                  Value Addition (Institutional Framework &amp; Macro Coverage)
                </strong>
                {Array.isArray(data.analysis?.valueAddition) && (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#fbbf24',
                    background: 'rgba(245, 158, 11, 0.15)',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    Structured Cards ({data.analysis.valueAddition.length})
                  </span>
                )}
              </div>

              {Array.isArray(data.analysis?.valueAddition) ? (
                <button
                  type="button"
                  onClick={handleAddValueAdditionCard}
                  style={{
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#fbbf24',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Plus size={12} />
                  <span>Add Card</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const currentText = typeof data.analysis?.valueAddition === 'string' ? data.analysis.valueAddition : '';
                    updateDataAndSyncJson(prev => ({
                      ...prev,
                      analysis: {
                        ...(prev.analysis || {}),
                        valueAddition: [
                          {
                            title: 'Core Conceptual Pillars',
                            tag: 'Exam Essentials',
                            bullets: currentText ? [currentText] : ['Key statutory or conceptual takeaway...']
                          }
                        ]
                      }
                    }));
                  }}
                  style={{
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#fbbf24',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Sparkles size={12} />
                  <span>Convert to Micro-Cards</span>
                </button>
              )}
            </div>

            {Array.isArray(data.analysis?.valueAddition) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {data.analysis.valueAddition.map((card, cIdx) => (
                  <div
                    key={cIdx}
                    style={{
                      background: '#070b14',
                      border: '1px solid #1e293b',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#f59e0b',
                        background: 'rgba(245, 158, 11, 0.12)',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        Card #{cIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={card.title || ''}
                        onChange={(e) => handleValueAdditionCardChange(cIdx, 'title', e.target.value)}
                        placeholder="Card Title (e.g. Part XXII: The Three Closing Articles)..."
                        style={{
                          flex: 1,
                          background: '#0d1424',
                          color: '#f8fafc',
                          border: '1px solid #334155',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          fontSize: '13px',
                          fontWeight: 700,
                          outline: 'none'
                        }}
                      />
                      <input
                        type="text"
                        value={card.tag || ''}
                        onChange={(e) => handleValueAdditionCardChange(cIdx, 'tag', e.target.value)}
                        placeholder="Tag (e.g. Constitutional Articles)..."
                        style={{
                          width: '180px',
                          background: '#0d1424',
                          color: '#fcd34d',
                          border: '1px solid #334155',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          fontSize: '12px',
                          fontWeight: 600,
                          outline: 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteValueAdditionCard(cIdx)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                        title="Delete card"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Bullets List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '4px' }}>
                      {(card.bullets || []).map((bullet, bIdx) => (
                        <div key={bIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <span style={{ color: '#f59e0b', fontWeight: 800, marginTop: '4px', fontSize: '13px' }}>•</span>
                          <textarea
                            value={typeof bullet === 'string' ? bullet : JSON.stringify(bullet)}
                            onChange={(e) => handleValueAdditionBulletChange(cIdx, bIdx, e.target.value)}
                            rows={2}
                            placeholder="Bullet takeaway..."
                            style={{
                              flex: 1,
                              background: '#0d1424',
                              color: '#cbd5e1',
                              border: '1px solid #1e293b',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              fontSize: '12.5px',
                              lineHeight: 1.5,
                              outline: 'none',
                              resize: 'vertical',
                              fontFamily: 'inherit'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteValueAdditionBullet(cIdx, bIdx)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#64748b',
                              cursor: 'pointer',
                              padding: '4px',
                              marginTop: '4px'
                            }}
                            title="Delete bullet"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => handleAddValueAdditionBullet(cIdx)}
                        style={{
                          alignSelf: 'flex-start',
                          background: 'rgba(245, 158, 11, 0.08)',
                          color: '#f59e0b',
                          border: '1px dashed rgba(245, 158, 11, 0.3)',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginTop: '2px'
                        }}
                      >
                        <Plus size={12} />
                        <span>Add Bullet Point</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
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
            )}
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

          {/* Card 7: High-Yield Comparison Matrix Table (Visual Suggestion) */}
          <div style={{
            background: '#0d1424',
            border: '1px solid #1c263c',
            borderRadius: '16px',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Table2 size={16} color="#38bdf8" />
                <strong style={{ fontSize: '14.5px', color: '#f8fafc' }}>
                  High-Yield Comparison Matrix Table (Visual Suggestion)
                </strong>
                {data.analysis?.visualSuggestion?.tableData && (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#38bdf8',
                    background: 'rgba(56, 189, 248, 0.15)',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    Active Table ({(data.analysis.visualSuggestion.tableData.rows || []).length} Rows)
                  </span>
                )}
              </div>

              {data.analysis?.visualSuggestion ? (
                <button
                  type="button"
                  onClick={handleDeleteComparisonTable}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Remove comparison table"
                >
                  <Trash2 size={12} />
                  <span>Remove Table</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAddDefaultComparisonTable}
                  style={{
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    borderRadius: '6px',
                    padding: '4px 12px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Plus size={12} />
                  <span>+ Create Comparison Table</span>
                </button>
              )}
            </div>

            {data.analysis?.visualSuggestion ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                      TABLE TITLE
                    </label>
                    <input
                      type="text"
                      value={data.analysis.visualSuggestion.title || ''}
                      onChange={(e) => handleVisualSuggestionChange('title', e.target.value)}
                      placeholder="e.g. Part XXII of the Constitution at a Glance..."
                      style={{
                        width: '100%',
                        background: '#070b14',
                        color: '#f8fafc',
                        border: '1px solid #1c263c',
                        borderRadius: '6px',
                        padding: '7px 10px',
                        fontSize: '13px',
                        fontWeight: 700,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                      CAPTION / EXAMINER'S TRAP DECODER
                    </label>
                    <input
                      type="text"
                      value={data.analysis.visualSuggestion.caption || ''}
                      onChange={(e) => handleVisualSuggestionChange('caption', e.target.value)}
                      placeholder="Notice what UPSC did here: examiner drafted negative statements targeting..."
                      style={{
                        width: '100%',
                        background: '#070b14',
                        color: '#cbd5e1',
                        border: '1px solid #1c263c',
                        borderRadius: '6px',
                        padding: '7px 10px',
                        fontSize: '12.5px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Table Data Matrix */}
                <div style={{
                  overflowX: 'auto',
                  borderRadius: '10px',
                  border: '1px solid #1e293b',
                  background: '#070b14',
                  padding: '12px'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid rgba(56, 189, 248, 0.35)', background: 'rgba(56, 189, 248, 0.06)' }}>
                        {(data.analysis.visualSuggestion.tableData?.headers || []).map((header, colIdx) => (
                          <th key={colIdx} style={{ padding: '8px 10px', textAlign: 'left' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <input
                                type="text"
                                value={header}
                                onChange={(e) => handleTableHeaderChange(colIdx, e.target.value)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#38bdf8',
                                  fontWeight: 800,
                                  fontSize: '12px',
                                  outline: 'none',
                                  width: '100%'
                                }}
                              />
                              {(data.analysis.visualSuggestion.tableData?.headers || []).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTableColumn(colIdx)}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#64748b',
                                    cursor: 'pointer',
                                    padding: '2px'
                                  }}
                                  title="Delete column"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          </th>
                        ))}
                        <th style={{ width: '36px', padding: '8px 4px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={handleAddTableColumn}
                            style={{
                              background: 'rgba(56, 189, 248, 0.15)',
                              color: '#38bdf8',
                              border: '1px solid rgba(56, 189, 248, 0.3)',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              padding: '2px 6px',
                              fontSize: '11px',
                              fontWeight: 800
                            }}
                            title="Add column"
                          >
                            +
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.analysis.visualSuggestion.tableData?.rows || []).map((row, rowIdx) => (
                        <tr
                          key={rowIdx}
                          style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                            background: rowIdx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)'
                          }}
                        >
                          {(Array.isArray(row) ? row : []).map((cell, colIdx) => (
                            <td key={colIdx} style={{ padding: '6px 8px' }}>
                              <input
                                type="text"
                                value={typeof cell === 'string' ? cell : JSON.stringify(cell)}
                                onChange={(e) => handleTableCellChange(rowIdx, colIdx, e.target.value)}
                                style={{
                                  width: '100%',
                                  background: 'transparent',
                                  border: '1px solid transparent',
                                  borderRadius: '4px',
                                  color: '#e2e8f0',
                                  fontSize: '12px',
                                  padding: '4px 6px',
                                  outline: 'none',
                                  boxSizing: 'border-box'
                                }}
                                onFocus={(e) => {
                                  e.target.style.background = '#0d1424';
                                  e.target.style.borderColor = '#38bdf8';
                                }}
                                onBlur={(e) => {
                                  e.target.style.background = 'transparent';
                                  e.target.style.borderColor = 'transparent';
                                }}
                              />
                            </td>
                          ))}
                          <td style={{ width: '36px', textAlign: 'center', padding: '6px 4px' }}>
                            <button
                              type="button"
                              onClick={() => handleDeleteTableRow(rowIdx)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                padding: '3px'
                              }}
                              title="Delete row"
                            >
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <button
                    type="button"
                    onClick={handleAddTableRow}
                    style={{
                      marginTop: '8px',
                      background: 'rgba(56, 189, 248, 0.1)',
                      color: '#38bdf8',
                      border: '1px dashed rgba(56, 189, 248, 0.3)',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Plus size={12} />
                    <span>Add Table Row</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                padding: '24px',
                textAlign: 'center',
                background: '#070b14',
                border: '1px dashed #1e293b',
                borderRadius: '12px',
                color: '#94a3b8'
              }}>
                <p style={{ margin: '0 0 10px', fontSize: '13px' }}>
                  No comparison matrix table attached yet. A high-yield table helps students visualize multi-provision contrasts.
                </p>
                <button
                  type="button"
                  onClick={handleAddDefaultComparisonTable}
                  style={{
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Plus size={14} />
                  <span>+ Scaffold 4-Column Comparison Table</span>
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

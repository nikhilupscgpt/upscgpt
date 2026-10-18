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
  ExternalLink,
  Layers,
  Copy,
  Check,
  Eye,
  FileText,
  RotateCcw,
  BookOpen,
  Newspaper,
  Compass
} from 'lucide-react';
import { getStructuredExplanation } from '@/lib/pyqExplanationHelper';
import StemView from '@/app/prelims/pyq/StemView';
import '@/app/prelims/pyq/pyq-ui.css';

export default function PyqVisualEditorClient({ initialQuestion }) {
  // Parse initial structured explanation or analysis
  const initialStructured = useMemo(() => {
    return getStructuredExplanation(initialQuestion);
  }, [initialQuestion]);

  // Construct initial JSON structure for editor
  const buildInitialJson = useCallback((q, structured) => {
    const opts = (q.options || []).map((o, idx) => ({
      label: (o.label || String.fromCharCode(97 + idx)).toLowerCase(),
      text: o.text || ''
    }));

    return {
      examName: q.examName || 'UPSC CSE Pre',
      examYear: q.examYear || 2024,
      questionNo: q.questionNo ?? null,
      srcSubject: q.srcSubject || '',
      srcTopic: q.srcTopic || '',
      sourceBase: q.sourceBase || '',
      stem: q.stem || '',
      options: opts,
      correctLabel: (q.correctLabel || '').toLowerCase(),
      analysis: structured.analysis || {
        keywords: [
          { concept: q.srcSubject || 'General Studies', isDistractor: false },
          { concept: q.srcTopic || 'Polity & Governance', isDistractor: false }
        ],
        optionBreakdown: opts.map(o => ({
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
      }
    };
  }, []);

  const [rawJsonText, setRawJsonText] = useState(() => {
    const obj = buildInitialJson(initialQuestion, initialStructured);
    return JSON.stringify(obj, null, 2);
  });

  const [parseError, setParseError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Live parsed object for right-side visual renderer
  const parsedData = useMemo(() => {
    try {
      const trimmed = rawJsonText.trim();
      if (!trimmed) {
        setParseError('Editor is empty. Paste a JSON / JSONL object.');
        return null;
      }
      const obj = JSON.parse(trimmed);
      setParseError(null);
      return obj;
    } catch (err) {
      setParseError(err.message);
      return null;
    }
  }, [rawJsonText]);

  // Handle beautify / format JSON
  const handleFormatJson = () => {
    try {
      const obj = JSON.parse(rawJsonText);
      setRawJsonText(JSON.stringify(obj, null, 2));
      setParseError(null);
    } catch (err) {
      setParseError('Cannot format: ' + err.message);
    }
  };

  // Handle Copy JSON
  const handleCopy = () => {
    navigator.clipboard.writeText(rawJsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Save to Database
  const handleSave = async () => {
    if (!parsedData) {
      alert('Please fix the JSON errors before saving.');
      return;
    }

    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/admin/pyq/${initialQuestion.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stem: parsedData.stem,
          options: parsedData.options,
          correctLabel: parsedData.correctLabel,
          srcSubject: parsedData.srcSubject,
          srcTopic: parsedData.srcTopic,
          examName: parsedData.examName,
          examYear: parsedData.examYear,
          questionNo: parsedData.questionNo,
          analysis: parsedData.analysis || null,
          explanation: parsedData.explanation || null,
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update question');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Error saving question: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Open A4 landscape printable slide for this question
  const handlePrintSlide = () => {
    window.open(`/api/admin/pyq/print-pdf?mode=slide&ids=${initialQuestion.id}`, '_blank');
  };

  // Normalize options for visual rendering
  const displayOptions = useMemo(() => {
    if (!parsedData || !Array.isArray(parsedData.options)) return [];
    return parsedData.options.map((o, idx) => ({
      label: (o.label || String.fromCharCode(97 + idx)).toLowerCase(),
      text: o.text || ''
    }));
  }, [parsedData]);

  // Extract analysis parts
  const analysis = parsedData?.analysis || {};
  const keywords = Array.isArray(analysis.keywords) ? analysis.keywords : [];
  const optionBreakdown = Array.isArray(analysis.optionBreakdown) ? analysis.optionBreakdown : [];
  const valueAddition = analysis.valueAddition || '';
  const inNews = analysis.inNews || null;
  const similarPyq = analysis.similarPyq || null;
  const visualSuggestion = analysis.visualSuggestion || null;

  const correctOpt = displayOptions.find(o => o.label === (parsedData?.correctLabel || '').toLowerCase());
  const correctText = correctOpt ? correctOpt.text : (parsedData?.correctLabel ? `Option (${parsedData.correctLabel.toUpperCase()})` : '–');

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
                {parsedData?.examName || initialQuestion.examName} {parsedData?.examYear || initialQuestion.examYear}
              </span>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>
                Q#{parsedData?.questionNo ?? initialQuestion.questionNo ?? '–'}
              </span>
              <span style={{ color: '#64748b', fontSize: '0.8rem' }}>•</span>
              <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
                {parsedData?.srcSubject || initialQuestion.srcSubject} {parsedData?.srcTopic ? `› ${parsedData.srcTopic}` : ''}
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
              <CheckCircle2 size={16} /> Saved Successfully
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
        {/* LEFT PANEL: Ingest & JSONL / Raw JSON Input                               */}
        {/* ========================================================================= */}
        <section style={{
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          background: '#090e17',
          minHeight: 0
        }}>
          {/* Left Panel Toolbar */}
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
              <span style={{
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#93c5fd',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '4px'
              }}>
                Gemini / Claude
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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

          {/* Syntax Error Notice */}
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
              <div>
                <strong>JSON Parse Error:</strong> {parseError}
              </div>
            </div>
          )}

          {/* Textarea for JSON / JSONL Editing */}
          <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            <textarea
              value={rawJsonText}
              onChange={(e) => setRawJsonText(e.target.value)}
              placeholder="Paste question JSON / JSONL output from Gemini or Claude here..."
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

          {/* Ingest Helper Tips */}
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
            <span>💡 Ingesting JSON on left immediately populates the frontend practice card &amp; answer components on right.</span>
            <span style={{ color: parseError ? '#ef4444' : '#10b981', fontWeight: 700 }}>
              {parseError ? '● Invalid JSON' : '● Live Syncing'}
            </span>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* RIGHT PANEL: Live Frontend Student UI Preview                             */}
        {/* ========================================================================= */}
        <section style={{
          display: 'flex',
          flexDirection: 'column',
          background: '#090e1a',
          minHeight: 0,
          overflowY: 'auto',
          padding: '24px 28px'
        }}>
          {/* Panel Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={17} color="#38bdf8" />
              <strong style={{ fontSize: '0.92rem', color: '#ffffff' }}>Frontend Practice &amp; Solution View</strong>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Exact look &amp; feel rendered to students on the platform
            </span>
          </div>

          {/* Frontend Question Card (Matching prelims portal pq-card & pqp-question-card) */}
          <div className="pq-root" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              background: '#0d1424',
              border: '1px solid #1c263c',
              borderRadius: '16px',
              padding: '26px 28px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)'
            }}>
              {/* Badges Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
                marginBottom: '16px'
              }}>
                <span style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '6px'
                }}>
                  {parsedData?.examName || 'UPSC CSE'} {parsedData?.examYear || ''}
                </span>

                <span style={{
                  background: '#192339',
                  border: '1px solid #23304b',
                  color: '#94a3b8',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: '6px'
                }}>
                  {parsedData?.srcSubject || 'General Studies'}
                </span>

                {parsedData?.srcTopic && (
                  <span style={{
                    background: '#192339',
                    border: '1px solid #23304b',
                    color: '#94a3b8',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: '6px'
                  }}>
                    {parsedData.srcTopic}
                  </span>
                )}

                <span style={{
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#38bdf8',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '6px',
                  marginLeft: 'auto'
                }}>
                  Q#{parsedData?.questionNo ?? '–'}
                </span>
              </div>

              {/* Question Stem Text with standard StemView styling */}
              <div style={{ marginBottom: '22px' }}>
                <StemView stem={parsedData?.stem || 'Question stem will appear here once ingested on the left...'} size="lg" />
              </div>

              {/* Interactive Frontend Options Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '10px',
                marginBottom: '20px'
              }}>
                {displayOptions.map((o) => {
                  const isCorrect = o.label === (parsedData?.correctLabel || '').toLowerCase();
                  return (
                    <div
                      key={o.label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        background: isCorrect ? 'rgba(16, 185, 129, 0.12)' : '#090e1a',
                        border: isCorrect ? '1.5px solid #10b981' : '1px solid #1c263c',
                        transition: 'all 0.15s'
                      }}
                    >
                      <span style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 800,
                        flexShrink: 0,
                        background: isCorrect ? '#10b981' : '#192339',
                        color: isCorrect ? '#ffffff' : '#cbd5e1'
                      }}>
                        {o.label.toUpperCase()}
                      </span>
                      <span style={{
                        fontSize: '14px',
                        lineHeight: 1.45,
                        color: isCorrect ? '#ffffff' : '#cbd5e1',
                        flex: 1,
                        fontWeight: isCorrect ? 600 : 400
                      }}>
                        {o.text}
                      </span>
                      {isCorrect && (
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: '#10b981',
                          whiteSpace: 'nowrap',
                          background: 'rgba(16, 185, 129, 0.2)',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          Correct Key
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Frontend Answer & Keywords Container (Matching platform component) */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '12px',
                padding: '16px 20px',
                marginTop: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <CheckCircle2 size={18} color="#10b981" />
                  <strong style={{ fontSize: '15px', color: '#10b981' }}>
                    Verified Answer: ({((parsedData?.correctLabel || '–')).toUpperCase()}) {correctText}
                  </strong>
                </div>

                {keywords.length > 0 && (
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed rgba(16, 185, 129, 0.2)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Keywords &amp; Tested Concepts:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {keywords.map((kw, i) => {
                        const isDist = typeof kw === 'object' && kw !== null && Boolean(kw.isDistractor);
                        const name = typeof kw === 'object' && kw !== null ? kw.concept : String(kw);
                        return (
                          <span
                            key={i}
                            style={{
                              fontSize: '12px',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              background: isDist ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                              color: isDist ? '#f87171' : '#93c5fd',
                              border: isDist ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)',
                              fontWeight: 600
                            }}
                          >
                            {isDist ? <s>{name}</s> : name}
                            {isDist && <span style={{ fontSize: '9px', marginLeft: '4px', opacity: 0.8 }}>(Distractor)</span>}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Option-by-Option Explanation Cards */}
            {optionBreakdown.length > 0 && (
              <div style={{
                background: '#0d1424',
                border: '1px solid #1c263c',
                borderRadius: '16px',
                padding: '24px 28px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <BookOpen size={18} color="#f43f5e" />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#f8fafc' }}>
                    Option-by-Option Analysis &amp; Trap Breakdown
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {optionBreakdown.map((opt, i) => {
                    const isCorr = (opt.verdict || '').toLowerCase().includes('correct') && !(opt.verdict || '').toLowerCase().includes('incorrect');
                    return (
                      <div
                        key={i}
                        style={{
                          background: '#090e1a',
                          border: isCorr ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.25)',
                          borderRadius: '10px',
                          padding: '14px 18px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span style={{
                            background: isCorr ? '#10b981' : '#ef4444',
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: '11px',
                            padding: '1px 7px',
                            borderRadius: '4px'
                          }}>
                            Statement / Option ({opt.label})
                          </span>
                          <strong style={{ fontSize: '13px', color: isCorr ? '#34d399' : '#f87171' }}>
                            {opt.verdict || (isCorr ? 'Correct' : 'Incorrect')}
                          </strong>
                        </div>
                        <p style={{ margin: 0, fontSize: '13.5px', lineHeight: 1.6, color: '#cbd5e1' }}>
                          {opt.explanation}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Value Addition Container */}
            {valueAddition && (
              <div style={{
                background: '#0d1424',
                border: '1px solid #1c263c',
                borderRadius: '16px',
                padding: '24px 28px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <Layers size={18} color="#eab308" />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#f8fafc' }}>
                    High-Yield Value Addition &amp; Institutional Governance
                  </h3>
                </div>

                <div style={{
                  background: 'rgba(234, 179, 8, 0.08)',
                  border: '1px solid rgba(234, 179, 8, 0.25)',
                  borderRadius: '10px',
                  padding: '16px 20px',
                  color: '#fef08a',
                  fontSize: '13.5px',
                  lineHeight: 1.65,
                  whiteSpace: 'pre-wrap'
                }}>
                  {typeof valueAddition === 'string' ? valueAddition : JSON.stringify(valueAddition, null, 2)}
                </div>
              </div>
            )}

            {/* In News & Similar PYQ Dual Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px'
            }}>
              {/* In News Card */}
              {inNews && typeof inNews === 'object' && (
                <div style={{
                  background: '#0d1424',
                  border: '1px solid #1c263c',
                  borderRadius: '16px',
                  padding: '20px 22px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Newspaper size={17} color="#38bdf8" />
                    <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 800, color: '#38bdf8' }}>
                      In News Clipping
                    </h4>
                  </div>
                  <div style={{
                    fontSize: '14.5px',
                    fontWeight: 700,
                    color: '#f8fafc',
                    lineHeight: 1.35,
                    marginBottom: '4px'
                  }}>
                    {inNews.headline}
                  </div>
                  {(inNews.source || inNews.date) && (
                    <div style={{ fontSize: '11.5px', color: '#0284c7', fontWeight: 700, marginBottom: '6px' }}>
                      {inNews.source} {inNews.date ? `• ${inNews.date}` : ''}
                    </div>
                  )}
                  {inNews.relevance && (
                    <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, color: '#94a3b8' }}>
                      {inNews.relevance}
                    </p>
                  )}
                </div>
              )}

              {/* Similar PYQ Card */}
              {similarPyq && typeof similarPyq === 'object' && (
                <div style={{
                  background: '#0d1424',
                  border: '1px solid #1c263c',
                  borderRadius: '16px',
                  padding: '20px 22px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Compass size={17} color="#a78bfa" />
                    <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 800, color: '#a78bfa' }}>
                      Similar PYQ Family
                    </h4>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px' }}>
                    {similarPyq.examName || 'UPSC CSE'} {similarPyq.examYear || ''}
                  </div>
                  <p style={{ margin: '0 0 10px 0', fontSize: '13.5px', lineHeight: 1.55, color: '#e2e8f0' }}>
                    {similarPyq.stem}
                  </p>
                  {similarPyq.keyTakeaway && (
                    <div style={{
                      background: 'rgba(167, 139, 250, 0.12)',
                      border: '1px solid rgba(167, 139, 250, 0.25)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      color: '#ddd6fe'
                    }}>
                      <strong>Examiner Takeaway:</strong> {similarPyq.keyTakeaway}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

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
  FileText
} from 'lucide-react';
import { getStructuredExplanation } from '@/lib/pyqExplanationHelper';

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
  const correctText = correctOpt ? correctOpt.text : (parsedData?.correctLabel ? `Option (${parsedData.correctLabel})` : '–');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#090d16',
      color: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Top Navbar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        background: '#0f172a',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
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
              background: 'rgba(255, 255, 255, 0.06)',
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
            <span>{saving ? 'Saving...' : 'Save Question & Slide'}</span>
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
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          background: '#0d131f',
          minHeight: 0
        }}>
          {/* Left Panel Toolbar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
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
                Gemini / Claude Output
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
                background: '#090d16',
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
            <span>💡 <strong>Tip:</strong> Paste single-line JSONL or multi-line JSON. Right side updates in real time.</span>
            <span style={{ color: parseError ? '#ef4444' : '#10b981', fontWeight: 700 }}>
              {parseError ? '● Invalid JSON' : '● Live Syncing'}
            </span>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* RIGHT PANEL: Live Visual 8-Part Lecture Slide Container                   */}
        {/* ========================================================================= */}
        <section style={{
          display: 'flex',
          flexDirection: 'column',
          background: '#111827',
          minHeight: 0,
          overflowY: 'auto',
          padding: '20px'
        }}>
          {/* Panel Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={17} color="#10b981" />
              <strong style={{ fontSize: '0.9rem', color: '#ffffff' }}>Live Visual Slide Container (8-Part Architecture)</strong>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Asymmetric 34% Left / 66% Right Column Flow
            </span>
          </div>

          {/* Slide Visual Preview Canvas (Card mimicking the printed A4 slide) */}
          <div style={{
            background: '#ffffff',
            borderRadius: '10px',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.45)',
            padding: '18px 22px',
            color: '#1e293b',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {/* 1. Slide Top Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1.5px solid #e2e8f0',
              paddingBottom: '6px'
            }}>
              <span style={{
                background: '#dc2626',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '9pt',
                padding: '3px 12px',
                borderRadius: '9999px',
                letterSpacing: '0.3px'
              }}>
                {parsedData?.examName || 'UPSC CSE'} {parsedData?.examYear || ''}
              </span>

              <div style={{
                fontSize: '8pt',
                fontWeight: 700,
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>{parsedData?.srcSubject || 'General Studies'}</span>
                {parsedData?.srcTopic && (
                  <>
                    <span>›</span>
                    <span>{parsedData.srcTopic}</span>
                  </>
                )}
                <span>• Q#{parsedData?.questionNo ?? '–'}</span>
              </div>
            </div>

            {/* Asymmetric 2-Column Grid (34% Left / 66% Right) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '34% 66%',
              gap: '16px',
              alignItems: 'start'
            }}>
              {/* ========================================================================= */}
              {/* LEFT COLUMN: Question -> Answer -> Keywords -> In News                    */}
              {/* ========================================================================= */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                borderRight: '1.5px solid #f1f5f9',
                paddingRight: '10px'
              }}>
                {/* Container 1: Question Stem & Options (Authentic UPSC Serif) */}
                <div style={{
                  fontFamily: '"Times New Roman", Times, Georgia, serif',
                  color: '#000000',
                  lineHeight: 1.4
                }}>
                  <div style={{
                    fontSize: '9.4pt',
                    fontWeight: 600,
                    whiteSpace: 'pre-wrap',
                    marginBottom: '6px'
                  }}>
                    {parsedData?.stem || 'Question stem will appear here once ingested...'}
                  </div>

                  {displayOptions.length > 0 && (
                    <div style={{
                      fontSize: '9pt',
                      fontWeight: 500,
                      color: '#111827',
                      lineHeight: 1.35
                    }}>
                      {displayOptions.map((o) => (
                        <div key={o.label} style={{ marginTop: '2.5px' }}>
                          <strong>({o.label})</strong> {o.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Container 2: Correct Answer (Pastel Green) */}
                <div style={{
                  background: '#86efac',
                  borderRadius: '4px',
                  padding: '7px 10px',
                  color: '#064e3b',
                  fontSize: '8.8pt',
                  fontWeight: 700,
                  lineHeight: 1.28,
                  marginTop: '4px'
                }}>
                  <div style={{
                    fontSize: '7pt',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    opacity: 0.8,
                    marginBottom: '1px'
                  }}>
                    Correct Answer
                  </div>
                  <div>
                    <strong>({(parsedData?.correctLabel || '–').toLowerCase()})</strong> {correctText}
                  </div>
                </div>

                {/* Container 3: Keywords and Concepts (Periwinkle Blue) */}
                <div style={{
                  background: '#93c5fd',
                  borderRadius: '4px',
                  padding: '7px 10px',
                  color: '#1e3a8a',
                  fontSize: '8.2pt',
                  lineHeight: 1.28
                }}>
                  <div style={{
                    fontWeight: 800,
                    textDecoration: 'underline',
                    marginBottom: '3px',
                    fontSize: '8.4pt',
                    color: '#0f172a'
                  }}>
                    Keywords and Concepts:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5px' }}>
                    {keywords.length > 0 ? keywords.map((kw, idx) => {
                      const isDist = typeof kw === 'object' && kw !== null && Boolean(kw.isDistractor);
                      const name = typeof kw === 'object' && kw !== null ? kw.concept : String(kw);
                      return (
                        <div key={idx} style={{ lineHeight: 1.22 }}>
                          {isDist ? (
                            <>
                              - <s style={{ color: '#334155' }}>{name}</s>{' '}
                              <span style={{ color: '#dc2626', fontSize: '7.2pt', fontWeight: 800 }}>
                                (Distractor)
                              </span>
                            </>
                          ) : (
                            `- ${name}`
                          )}
                        </div>
                      );
                    }) : (
                      <div style={{ opacity: 0.7 }}>- Conceptual keywords will appear here</div>
                    )}
                  </div>
                </div>

                {/* Container 6: In News Editorial Box */}
                <div style={{ marginTop: '4px' }}>
                  <span style={{
                    display: 'inline-block',
                    background: '#0284c7',
                    color: '#ffffff',
                    fontSize: '7.5pt',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    marginBottom: '3px'
                  }}>
                    In News
                  </span>

                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    padding: '7px 10px',
                    fontSize: '8pt',
                    color: '#334155',
                    lineHeight: 1.3,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                  }}>
                    {inNews && typeof inNews === 'object' ? (
                      <>
                        <div style={{
                          fontFamily: 'Georgia, serif',
                          fontSize: '9.4pt',
                          fontWeight: 800,
                          color: '#000000',
                          lineHeight: 1.25,
                          marginBottom: '2px'
                        }}>
                          {inNews.headline || 'Current Affairs Development'}
                        </div>
                        {(inNews.source || inNews.date) && (
                          <div style={{
                            fontSize: '7.2pt',
                            fontWeight: 800,
                            color: '#0284c7',
                            textTransform: 'uppercase',
                            marginBottom: '3px'
                          }}>
                            {inNews.source || ''} {inNews.date ? `• ${inNews.date}` : ''}
                          </div>
                        )}
                        {inNews.relevance && (
                          <div style={{ lineHeight: 1.28, color: '#334155' }}>
                            {inNews.relevance}
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ opacity: 0.7 }}>
                        Regularly reported under {parsedData?.srcTopic || 'General Studies'}.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* RIGHT COLUMN: Explanation -> Value Addition -> Similar PYQ                */}
              {/* ========================================================================= */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {/* Container 4: Option Breakdown (Pastel Pink) */}
                <div>
                  <span style={{
                    display: 'inline-block',
                    background: '#0f172a',
                    color: '#ffffff',
                    fontSize: '7.5pt',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    marginBottom: '3px'
                  }}>
                    Explanation
                  </span>

                  <div style={{
                    background: '#fda4af',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    color: '#881337',
                    fontSize: '8.3pt',
                    lineHeight: 1.36
                  }}>
                    {optionBreakdown.length > 0 ? (
                      optionBreakdown.map((opt, idx) => {
                        const isCorr = (opt.verdict || '').toLowerCase().includes('correct') && !(opt.verdict || '').toLowerCase().includes('incorrect');
                        return (
                          <div key={idx} style={{ marginBottom: idx === optionBreakdown.length - 1 ? 0 : '4px' }}>
                            <strong>
                              ({(opt.label || '').toLowerCase()}){' '}
                              {opt.text ? `${opt.text}. ` : ''}
                              <span style={{ color: isCorr ? '#065f46' : '#991b1b', fontWeight: 800 }}>
                                {opt.verdict || (isCorr ? 'Correct' : 'Incorrect')}.
                              </span>
                            </strong>{' '}
                            <span>{opt.explanation}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ whiteSpace: 'pre-wrap' }}>
                        {parsedData?.explanation || 'Detailed explanation will appear here...'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Container 5: Value Addition (Pastel Yellow with 2-Column Split) */}
                <div>
                  <span style={{
                    display: 'inline-block',
                    background: '#0d9488',
                    color: '#ffffff',
                    fontSize: '7.5pt',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    marginBottom: '3px'
                  }}>
                    Value Addition
                  </span>

                  <div style={{
                    background: '#fef08a',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    color: '#451a03',
                    fontSize: '8.2pt',
                    lineHeight: 1.36
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px'
                    }}>
                      <div>
                        <div style={{ fontWeight: 800, color: '#000000', fontSize: '8.4pt', marginBottom: '2px' }}>
                          Core Institutional Framework:
                        </div>
                        <p style={{ margin: 0, lineHeight: 1.32, color: '#292524' }}>
                          {typeof valueAddition === 'string' ? valueAddition : JSON.stringify(valueAddition)}
                        </p>
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: '#000000', fontSize: '8.4pt', marginBottom: '2px' }}>
                          Key Operational Dynamics &amp; Macro Coverage:
                        </div>
                        <p style={{ margin: 0, lineHeight: 1.32, color: '#292524' }}>
                          Cluster-based convergence with micro-watershed development, financial risk insurance, and soil-health management protocols.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Container 7: Similar PYQ (Sage Green Box) */}
                <div>
                  <span style={{
                    display: 'inline-block',
                    background: '#334155',
                    color: '#ffffff',
                    fontSize: '7.5pt',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    marginBottom: '3px'
                  }}>
                    Similar PYQ
                  </span>

                  <div style={{
                    background: '#86efac',
                    borderRadius: '4px',
                    padding: '7px 11px',
                    color: '#14532d',
                    fontSize: '8.1pt',
                    lineHeight: 1.3
                  }}>
                    {similarPyq && typeof similarPyq === 'object' ? (
                      <>
                        <div style={{ marginBottom: '2px' }}>
                          <strong>{similarPyq.examName || 'UPSC CSE'} {similarPyq.examYear || ''}:</strong>{' '}
                          {similarPyq.stem || ''}
                        </div>
                        {similarPyq.keyTakeaway && (
                          <div style={{
                            background: 'rgba(255, 255, 255, 0.75)',
                            padding: '3px 7px',
                            borderRadius: '3px',
                            fontSize: '7.6pt',
                            color: '#065f46',
                            fontWeight: 700,
                            marginTop: '3px'
                          }}>
                            <strong>Core Takeaway:</strong> {similarPyq.keyTakeaway}
                          </div>
                        )}
                      </>
                    ) : (
                      <div>
                        <strong>UPSC Question Family:</strong> Questions on {parsedData?.srcTopic || 'this theme'} frequently recur with modified distractors in subsequent exam cycles.
                      </div>
                    )}
                  </div>
                </div>

                {/* Container 8: Visual Suggestion / Diagram (If provided) */}
                {visualSuggestion && (
                  <div style={{
                    border: '1.5px dashed #cbd5e1',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    background: 'rgba(241, 245, 249, 0.6)',
                    fontSize: '7.8pt',
                    color: '#475569'
                  }}>
                    <strong>📊 Visual / Infographic Placement ({visualSuggestion.type || 'DIAGRAM'}):</strong>{' '}
                    <span>{visualSuggestion.caption || 'Structural schematic comparison.'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Slide Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '4px',
              fontSize: '7.6pt',
              color: '#64748b',
              fontWeight: 700
            }}>
              <div>
                <strong style={{ color: '#0f172a' }}>UPSCGPT</strong>
                <span style={{ fontWeight: 500, color: '#94a3b8', marginLeft: '6px' }}>
                  • High-Yield Preliminary Examination Architecture
                </span>
              </div>
              <div>Interactive Live Slide Renderer</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

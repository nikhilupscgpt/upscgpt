"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  Zap, Save, RefreshCw, AlertCircle, CheckCircle2, 
  BrainCircuit, Sparkles, Languages, FileText, Layout,
  MessageSquareQuote, Plus, Trash2, Globe, FileCode, Search, HelpCircle, GraduationCap,
  ArrowRightLeft, Database, Lightbulb, Newspaper, Settings
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import './forge.css';

// Absolute Hydration Guard
const hydrateIssue = (data) => {
  if (!data) return null;
  return {
    ...data,
    mainsNote: data.mainsNote || "",
    mainsNote_hi: data.mainsNote_hi || "",
    mainsNote_mr: data.mainsNote_mr || "",
    cumulativeSummary: data.cumulativeSummary || "",
    cumulativeSummary_hi: data.cumulativeSummary_hi || "",
    cumulativeSummary_mr: data.cumulativeSummary_mr || "",
    mainsFacts: data.mainsFacts || "",
    mainsFacts_hi: data.mainsFacts_hi || "",
    mainsFacts_mr: data.mainsFacts_mr || "",
    valueAddition: data.valueAddition || "",
    valueAddition_hi: data.valueAddition_hi || "",
    valueAddition_mr: data.valueAddition_mr || "",
    prelimsNote: data.prelimsNote || "",
    prelimsNote_hi: data.prelimsNote_hi || "",
    prelimsNote_mr: data.prelimsNote_mr || "",
    backgroundNote: data.backgroundNote || "",
    backgroundNote_hi: data.backgroundNote_hi || "",
    backgroundNote_mr: data.backgroundNote_mr || "",
    domain: data.domain || "",
    topic: data.topic || "",
    status: data.status || "ACTIVE",
    orderIndex: data.orderIndex || 0,
    gsPapers: data.gsPapers || [],
    questions: data.questions || []
  };
};

export default function ForgeClient({ id, initialIssue }) {
  const [issue, setIssue] = useState(() => hydrateIssue(initialIssue));
  const [loading, setLoading] = useState(!initialIssue);
  const [saving, setSaving] = useState(false);
  const [activeLang, setActiveLang] = useState('en'); 
  const [processingField, setProcessingField] = useState(null);
  const [progress, setProgress] = useState({ active: false, step: '', percent: 0 });
  const [prelimsLang, setPrelimsLang] = useState('en');
  const [gdocUrl, setGdocUrl] = useState('');
  const [gdocLoading, setGdocLoading] = useState(false);
  const [mcqLoading, setMcqLoading] = useState(false);
  const [expandedMcqId, setExpandedMcqId] = useState(null);

  const handleGdocIngest = async (mode, targetLang = 'en') => {
    if (!issue || !gdocUrl) return;
    setGdocLoading(true);
    const toastId = toast.loading("Ingesting Google Doc & illustrations...");
    try {
      const res = await fetch('/api/admin/issues/ingest-gdoc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docUrl: gdocUrl,
          issueId: issue.id,
          mode,
          lang: targetLang
        })
      });
      const data = await res.json();
      if (data.success) {
        const fieldName = mode === 'PRELIMS' 
          ? (targetLang === 'en' ? 'prelimsNote' : `prelimsNote_${targetLang}`)
          : (targetLang === 'en' ? 'mainsNote' : `mainsNote_${targetLang}`);
        
        handleUpdate(fieldName, data.markdown);
        toast.success(`Google Doc pulled! Hosted ${data.imagesProcessed} illustrations.`, { id: toastId });
        setGdocUrl('');
      } else {
        toast.error(`Ingestion failed: ${data.error}`, { id: toastId });
      }
    } catch (e) {
      toast.error("Network error during Google Doc ingestion.", { id: toastId });
    } finally {
      setGdocLoading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!issue) return;
    setMcqLoading(true);
    const toastId = toast.loading(`Forging UPSC Prelims MCQs...`);
    try {
      const res = await fetch('/api/admin/questions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueId: issue.id, count: 5 })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Successfully forged ${data.count} MCQs.`, { id: toastId });
        const detailRes = await fetch(`/api/admin/architect/node/${issue.id}`);
        const detailData = await detailRes.json();
        if (detailData.success && detailData.issue) {
          setIssue(prev => prev ? ({ ...prev, questions: detailData.issue.questions || [] }) : null);
        }
      } else {
        toast.error(`AI Error: ${data.error}`, { id: toastId });
      }
    } catch (e) {
      toast.error("Question generation failed.", { id: toastId });
    } finally {
      setMcqLoading(false);
    }
  };

  useEffect(() => {
    if (!initialIssue && id) {
      setLoading(true);
      async function fetchNode() {
        try {
          const res = await fetch(`/api/admin/architect/node/${id}`);
          const data = await res.json();
          if (data.success && data.issue) {
            setIssue(hydrateIssue(data.issue));
          } else {
            toast.error("Node not found");
          }
        } catch (err) {
          toast.error("Network Partition");
        } finally {
          setLoading(false);
        }
      }
      fetchNode();
    }
  }, [id, initialIssue]);

  const handleUpdate = useCallback((field, value) => {
    setIssue(prev => prev ? ({ ...prev, [field]: value }) : null);
  }, []);

  const handleSave = async () => {
    if (!issue) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/forge/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issue)
      });
      if (res.ok) toast.success("Neural State Persisted");
      else throw new Error("SAVE FAILED");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const ingestField = async (field, label, lang = 'en') => {
    if (!issue) return;
    setProcessingField(field);
    const taskLabel = lang === 'en' ? label : `${lang.toUpperCase()} ${label} Synthesis`;
    try {
      const res = await fetch('/api/admin/forge/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId: issue.id, task: taskLabel, type: issue.nodeType === 'MAINS_QUESTION' ? 'QUESTION' : 'CONCEPT' })
      });
      const data = await res.json();
      if (data.content) {
        handleUpdate(field, data.content);
        toast.success(`${label} Synchronized`);
      } else {
        toast.error("AI returned empty content");
      }
    } catch (err) {
      toast.error("AI Sync Failed");
    } finally {
      setProcessingField(null);
    }
  };

  const masterIngest = async () => {
    if (!issue) return;
    const isQuestion = issue.nodeType === 'MAINS_QUESTION';
    const isSubnode = Boolean(issue.parentIssueId);

    if (activeLang === 'prelims') {
      setProgress({ active: true, step: `Forging Prelims Notes (${prelimsLang.toUpperCase()})...`, percent: 30 });
      try {
        const fieldId = prelimsLang === 'en' ? 'prelimsNote' : `prelimsNote_${prelimsLang}`;
        const taskLabel = prelimsLang === 'en' ? 'Prelims Fact Sheet' : `${prelimsLang.toUpperCase()} Prelims Fact Sheet Synthesis`;
        const res = await fetch('/api/admin/forge/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nodeId: issue.id, task: taskLabel, type: 'CONCEPT' })
        });
        const data = await res.json();
        if (data.content) {
          handleUpdate(fieldId, data.content);
          toast.success(`Prelims ${prelimsLang.toUpperCase()} Note Synchronized`);
        } else {
          toast.error("AI returned empty content");
        }
      } catch (err) {
        toast.error("AI Sync Failed");
      } finally {
        setProgress({ active: false, step: '', percent: 0 });
      }
      return;
    }

    const fields = isSubnode ? [
      { id: activeLang === 'en' ? 'mainsNote' : `mainsNote_${activeLang}`, label: 'Briefing' }
    ] : [
      { id: activeLang === 'en' ? 'mainsNote' : `mainsNote_${activeLang}`, label: 'Briefing' },
      { id: activeLang === 'en' ? 'cumulativeSummary' : `cumulativeSummary_${activeLang}`, label: 'Summary' },
      { id: activeLang === 'en' ? 'mainsFacts' : `mainsFacts_${activeLang}`, label: 'Facts' },
      { id: activeLang === 'en' ? 'valueAddition' : `valueAddition_${activeLang}`, label: 'Value Addition' }
    ];

    setProgress({ active: true, step: `Starting ${activeLang.toUpperCase()} Synthesis...`, percent: 5 });
    
    try {
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        setProgress({ active: true, step: `Forging ${field.label}...`, percent: 20 + (i * 20) });
        const taskLabel = activeLang === 'en' ? field.label : `${activeLang.toUpperCase()} ${field.label} Synthesis`;
        const res = await fetch('/api/admin/forge/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nodeId: issue.id, task: taskLabel, type: isQuestion ? 'QUESTION' : 'CONCEPT' })
        });
        const data = await res.json();
        if (data.content) handleUpdate(field.id, data.content);
      }
      toast.success(`${activeLang.toUpperCase()} Tab Synchronized`);
    } catch (err) {
      toast.error("Bulk Ingest Failed");
    } finally {
      setProgress({ active: false, step: '', percent: 0 });
    }
  };

  if (loading || !issue) {
    return (
      <div className="forge-root" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <RefreshCw size={40} className="spin" style={{ color: '#3b82f6', marginBottom: '20px' }} />
        <span style={{ fontWeight: 900, color: '#3b82f6', letterSpacing: '0.2em' }}>SYNCHRONIZING NEURAL FORGE...</span>
      </div>
    );
  }

  const renderField = (field, label, icon) => {
    const Icon = icon;
    const isProcessing = processingField === field;
    const value = issue[field] || "";
    
    return (
      <div className="editor-pane">
        <div className="pane-head">
          <label><Icon size={14} /> {label}</label>
          <button className="btn-sync" onClick={() => ingestField(field, label, activeLang)} disabled={isProcessing}>
            {isProcessing ? <RefreshCw size={12} className="spin" /> : <Zap size={12} />} FORGE
          </button>
        </div>
        <textarea 
          value={value} 
          onChange={e => handleUpdate(field, e.target.value)} 
          placeholder={`Engineering high-fidelity ${label}...`} 
        />
      </div>
    );
  };

  return (
    <div className="forge-root">
      <Toaster position="bottom-right" />
      <header className="forge-header">
        <div className="header-left">
          <div className="badge-neural">{issue.parentIssueId ? 'SUBNODE' : issue.nodeType}</div>
          <h1>{issue.title}</h1>
          {issue.parentIssueId && (
            <div className="parent-link">
              <Database size={12} /> Parent ID: {issue.parentIssueId}
            </div>
          )}
        </div>
        <div className="header-right">
           {progress.active && (
             <div className="forge-progress-status">
               <div className="progress-track"><div style={{ width: `${progress.percent}%` }} /></div>
               <span>{progress.step}</span>
             </div>
           )}
           <button className="btn-sync-all" onClick={masterIngest} disabled={progress.active}>
             <Sparkles size={14} className={progress.active ? 'spin' : ''} /> SYNC TAB
           </button>
           <button className="btn-save-master" onClick={handleSave} disabled={saving}>
             {saving ? <RefreshCw size={14} className="spin" /> : <Save size={14} />} {saving ? 'SAVING...' : 'SAVE ALL'}
           </button>
        </div>
      </header>

      <div className="forge-layout">
        <aside className="forge-sidebar">
          <button className={activeLang === 'en' ? 'active' : ''} onClick={() => setActiveLang('en')}>
             <Languages size={18} /> English Studio
          </button>
          <button className={activeLang === 'hi' ? 'active' : ''} onClick={() => setActiveLang('hi')}>
             <Languages size={18} /> Hindi Studio
          </button>
          <button className={activeLang === 'mr' ? 'active' : ''} onClick={() => setActiveLang('mr')}>
             <Languages size={18} /> Marathi Studio
          </button>
          <div className="sidebar-divider" />
          <button className={activeLang === 'prelims' ? 'active' : ''} onClick={() => setActiveLang('prelims')}>
             <GraduationCap size={18} /> Prelims Studio
          </button>
          <div className="sidebar-divider" />
          <button className={activeLang === 'links' ? 'active' : ''} onClick={() => setActiveLang('links')}>
             <Globe size={18} /> Evidence Graph
          </button>
          <div className="sidebar-divider" />
          <button className={activeLang === 'settings' ? 'active' : ''} onClick={() => setActiveLang('settings')}>
             <Settings size={18} /> Node Settings
          </button>
        </aside>

        <main className="forge-workspace" style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' }}>
          {activeLang === 'en' && (
            <div className="gdoc-ingest-bar" style={{ flexShrink: 0 }}>
              <label>
                <Globe size={14} /> Ingest Mains Briefing From Google Doc
              </label>
              <div className="gdoc-input-group">
                <input 
                  type="text" 
                  placeholder="Paste shared Google Doc link here..." 
                  value={gdocUrl}
                  onChange={e => setGdocUrl(e.target.value)}
                />
                <button 
                  onClick={() => handleGdocIngest('MAINS', 'en')}
                  disabled={gdocLoading || !gdocUrl}
                >
                  {gdocLoading ? <RefreshCw size={14} className="spin" /> : <Globe size={14} />} Pull Doc
                </button>
              </div>
              <span>
                Note: Document must be shared as <strong>"Anyone with link can view"</strong>. Embedded illustrations will be downloaded and hosted locally automatically.
              </span>
            </div>
          )}

          <div style={{ flex: 1, overflow: 'hidden' }}>
            {activeLang === 'settings' ? (
              <div className="settings-workspace">
                <div className="settings-grid">
                  <div className="settings-group full-width">
                    <label>Node Title</label>
                    <input 
                      type="text"
                      className="settings-input"
                      value={issue.title}
                      onChange={e => handleUpdate('title', e.target.value)}
                      placeholder="Enter node title..."
                    />
                  </div>

                  <div className="settings-group">
                    <label>Order Index (Syllabus Sequence)</label>
                    <input 
                      type="number"
                      className="settings-input"
                      value={issue.orderIndex}
                      onChange={e => handleUpdate('orderIndex', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>

                  <div className="settings-group">
                    <label>Status</label>
                    <select 
                      className="settings-select"
                      value={issue.status}
                      onChange={e => handleUpdate('status', e.target.value)}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="DORMANT">DORMANT</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>

                  <div className="settings-group">
                    <label>GS Papers</label>
                    <div className="gs-papers-selector">
                      {['GS1', 'GS2', 'GS3', 'GS4'].map(paper => {
                        const active = (issue.gsPapers || []).includes(paper);
                        return (
                          <button
                            key={paper}
                            type="button"
                            className={`gs-paper-btn ${active ? 'active' : ''}`}
                            onClick={() => {
                              const current = issue.gsPapers || [];
                              const next = current.includes(paper)
                                ? current.filter(p => p !== paper)
                                : [...current, paper];
                              handleUpdate('gsPapers', next);
                            }}
                          >
                            {paper}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="settings-group">
                    <label>Domain</label>
                    <input 
                      type="text"
                      className="settings-input"
                      value={issue.domain}
                      onChange={e => handleUpdate('domain', e.target.value)}
                      placeholder="Domain..."
                    />
                  </div>

                  <div className="settings-group full-width">
                    <label>Topic</label>
                    <input 
                      type="text"
                      className="settings-input"
                      value={issue.topic}
                      onChange={e => handleUpdate('topic', e.target.value)}
                      placeholder="Topic..."
                    />
                  </div>
                </div>

                <div style={{ marginTop: '24px' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Neural Core / Background Notes (Multilingual)
                  </h3>
                  <div className="multilingual-backgrounds">
                    <div className="settings-group">
                      <label>English Note</label>
                      <textarea
                        className="settings-textarea"
                        value={issue.backgroundNote}
                        onChange={e => handleUpdate('backgroundNote', e.target.value)}
                        placeholder="English background information..."
                      />
                    </div>
                    <div className="settings-group">
                      <label>Hindi Note</label>
                      <textarea
                        className="settings-textarea"
                        value={issue.backgroundNote_hi || ""}
                        onChange={e => handleUpdate('backgroundNote_hi', e.target.value)}
                        placeholder="Hindi background information..."
                      />
                    </div>
                    <div className="settings-group">
                      <label>Marathi Note</label>
                      <textarea
                        className="settings-textarea"
                        value={issue.backgroundNote_mr || ""}
                        onChange={e => handleUpdate('backgroundNote_mr', e.target.value)}
                        placeholder="Marathi background information..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : activeLang === 'prelims' ? (
              <div className="studio-prelims-grid">
                {/* LEFT COLUMN: Prelims Notes Editor */}
                <div className="editor-pane" style={{ height: '100%', overflowY: 'auto' }}>
                  <div className="pane-head" style={{ marginBottom: '12px', flexShrink: 0 }}>
                    <label>
                      <Zap size={14} /> High-Yield Prelims Notes
                    </label>
                    <button 
                      className="btn-sync" 
                      onClick={() => {
                        const fieldId = prelimsLang === 'en' ? 'prelimsNote' : `prelimsNote_${prelimsLang}`;
                        const label = prelimsLang === 'en' ? 'Prelims Fact Sheet' : `${prelimsLang.toUpperCase()} Prelims Fact Sheet Synthesis`;
                        ingestField(fieldId, label, prelimsLang);
                      }}
                      disabled={processingField !== null}
                    >
                      {processingField !== null ? <RefreshCw size={12} className="spin" /> : <Zap size={12} />} FORGE Note
                    </button>
                  </div>

                  {/* Google Doc Ingestion Control */}
                  <div className="gdoc-ingest-bar" style={{ flexShrink: 0 }}>
                    <label>
                      <Globe size={14} /> Ingest Prelims Note ({prelimsLang.toUpperCase()}) From Google Doc
                    </label>
                    <div className="gdoc-input-group">
                      <input 
                        type="text" 
                        placeholder="Paste shared Google Doc link here..." 
                        value={gdocUrl}
                        onChange={e => setGdocUrl(e.target.value)}
                      />
                      <button 
                        onClick={() => handleGdocIngest('PRELIMS', prelimsLang)}
                        disabled={gdocLoading || !gdocUrl}
                      >
                        {gdocLoading ? <RefreshCw size={14} className="spin" /> : <Globe size={14} />} Pull Doc
                      </button>
                    </div>
                    <span>
                      Note: Document must be shared as <strong>"Anyone with link can view"</strong>. Embedded illustrations will be downloaded and hosted locally automatically.
                    </span>
                  </div>

                  {/* Localized Language Selector inside Prelims */}
                  <div className="prelims-lang-selector" style={{ flexShrink: 0 }}>
                    <button 
                      className={prelimsLang === 'en' ? 'active' : ''} 
                      onClick={() => setPrelimsLang('en')}
                    >
                      English Note
                    </button>
                    <button 
                      className={prelimsLang === 'hi' ? 'active' : ''} 
                      onClick={() => setPrelimsLang('hi')}
                    >
                      Hindi Note
                    </button>
                    <button 
                      className={prelimsLang === 'mr' ? 'active' : ''} 
                      onClick={() => setPrelimsLang('mr')}
                    >
                      Marathi Note
                    </button>
                  </div>

                  <textarea 
                    value={
                      prelimsLang === 'en' 
                        ? (issue.prelimsNote || "") 
                        : prelimsLang === 'hi' 
                          ? (issue.prelimsNote_hi || "") 
                          : (issue.prelimsNote_mr || "")
                    } 
                    onChange={e => {
                      const fieldId = prelimsLang === 'en' ? 'prelimsNote' : `prelimsNote_${prelimsLang}`;
                      handleUpdate(fieldId, e.target.value);
                    }}
                    placeholder={`Factual points, tables, and quick-revision data for Prelims (${prelimsLang.toUpperCase()})...`} 
                    style={{ minHeight: '300px', flex: 1 }}
                  />
                </div>

                {/* RIGHT COLUMN: Strategic MCQ Bank */}
                <div className="editor-pane" style={{ height: '100%', overflowY: 'hidden' }}>
                  <div className="mcq-bank-container">
                    <div className="mcq-bank-header">
                      <div>
                        <h3>Strategic MCQ Bank</h3>
                        <p>Linked Prelims questions for this node.</p>
                      </div>
                      <button 
                        className="btn-sync-all" 
                        onClick={handleGenerateQuestions} 
                        disabled={mcqLoading}
                        style={{ padding: '8px 16px', fontSize: '0.75rem' }}
                      >
                        <BrainCircuit size={14} className={mcqLoading ? 'spin' : ''} /> {mcqLoading ? 'FORGING...' : 'FORGE PRELIMS MCQS'}
                      </button>
                    </div>

                    <div className="mcq-list">
                      {(issue.questions || []).length > 0 ? (
                        issue.questions.map((q, idx) => {
                          const isExpanded = expandedMcqId === q.id;
                          return (
                            <div key={q.id} className="mcq-card">
                              <div className="mcq-card-header">
                                <span className="mcq-number">QUESTION {idx + 1}</span>
                                <span className={`mcq-difficulty ${q.difficulty?.toLowerCase() || 'medium'}`}>
                                  {q.difficulty || 'MEDIUM'}
                                </span>
                              </div>
                              <div className="mcq-text">{q.text}</div>
                              <div className="mcq-options-grid">
                                {(Array.isArray(q.options) ? q.options : []).map(opt => (
                                  <div 
                                    key={opt.label} 
                                    className={`mcq-option ${q.correctLabel?.toLowerCase() === opt.label?.toLowerCase() ? 'correct' : ''}`}
                                  >
                                    <strong>{opt.label?.toUpperCase()}.</strong> {opt.text}
                                  </div>
                                ))}
                              </div>
                              
                              <button 
                                className="mcq-btn-debrief"
                                onClick={() => setExpandedMcqId(isExpanded ? null : q.id)}
                              >
                                <HelpCircle size={14} /> {isExpanded ? 'Hide Mission Debrief' : 'Show Mission Debrief'}
                              </button>
                              
                              {isExpanded && (
                                <div className="mcq-debrief">
                                  <strong>UPSC Mission Debrief:</strong>
                                  <p style={{ marginTop: '6px' }}>{q.explanation}</p>
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '0.95rem', fontStyle: 'italic', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
                          <HelpCircle size={32} style={{ color: '#475569' }} />
                          No MCQs forged for this node yet. Click the button above to generate a strategic MCQ set.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : activeLang !== 'links' ? (
              issue.parentIssueId ? (
                /* Subnode Focus Mode */
                <div className="studio-single" style={{ height: '100%' }}>
                  <div className="subnode-header">
                     <div className="subnode-info">
                       <BrainCircuit size={20} />
                       <div>
                         <h2>Subnode Intelligence Block</h2>
                         <p>Synthesize detailed explanation and micro-concepts here.</p>
                       </div>
                     </div>
                     <div className="subnode-quick-links">
                        <button className="btn-quick" onClick={() => window.open(`/admin/questions?issueId=${issue.id}`, '_blank')}><HelpCircle size={14}/> Manage Questions</button>
                        <button className="btn-quick" onClick={() => window.open(`/admin/news?issueId=${issue.id}`, '_blank')}><Newspaper size={14}/> Manage News</button>
                     </div>
                  </div>
                  {renderField(activeLang === 'en' ? 'mainsNote' : `mainsNote_${activeLang}`, 'Detailed Explanation (Explained)', FileText)}
                </div>
              ) : (
                /* Standard Node Quad Mode */
                <div className="studio-quad">
                  {renderField(activeLang === 'en' ? 'mainsNote' : `mainsNote_${activeLang}`, 'Mains Briefing', FileText)}
                  {renderField(activeLang === 'en' ? 'cumulativeSummary' : `cumulativeSummary_${activeLang}`, 'Strategic Summary', Sparkles)}
                  {renderField(activeLang === 'en' ? 'mainsFacts' : `mainsFacts_${activeLang}`, 'Facts & Data', Database)}
                  {renderField(activeLang === 'en' ? 'valueAddition' : `valueAddition_${activeLang}`, 'Value Addition', Lightbulb)}
                </div>
              )
            ) : (
              <div className="link-workspace" style={{ height: '100%' }}>
                 <div className="link-intro">
                   <h2>Neural Cross-Linking</h2>
                   <p>Anchor this node to the global intelligence graph.</p>
                 </div>
                 <div className="link-quad">
                    <div className="link-pane">
                      <label><Search size={14} /> Syllabus Anchor</label>
                      <input value={issue.topic} readOnly />
                    </div>
                    <div className="link-pane">
                      <label><FileCode size={14} /> Intelligence Evidence</label>
                      <div className="evidence-list">
                        {issue.articles?.map(art => <div key={art.id} className="evidence-item">{art.title}</div>)}
                        <button className="btn-add-evidence">+ Attach Intelligence</button>
                      </div>
                    </div>
                 </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

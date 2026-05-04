"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  Zap, Save, RefreshCw, AlertCircle, CheckCircle2, 
  BrainCircuit, Sparkles, Languages, FileText, Layout,
  MessageSquareQuote, Plus, Trash2, Globe, FileCode, Search, HelpCircle, GraduationCap,
  ArrowRightLeft, Database, Lightbulb, Newspaper
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
    valueAddition_mr: data.valueAddition_mr || ""
  };
};

export default function ForgeClient({ id, initialIssue }) {
  const [issue, setIssue] = useState(() => hydrateIssue(initialIssue));
  const [loading, setLoading] = useState(!initialIssue);
  const [saving, setSaving] = useState(false);
  const [activeLang, setActiveLang] = useState('en'); 
  const [processingField, setProcessingField] = useState(null);
  const [progress, setProgress] = useState({ active: false, step: '', percent: 0 });

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
          <button className={activeLang === 'links' ? 'active' : ''} onClick={() => setActiveLang('links')}>
             <Globe size={18} /> Evidence Graph
          </button>
        </aside>

        <main className="forge-workspace">
          {activeLang !== 'links' ? (
            issue.parentIssueId ? (
              /* Subnode Focus Mode */
              <div className="studio-single">
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
            <div className="link-workspace">
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
        </main>
      </div>
    </div>
  );
}

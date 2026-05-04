"use client";

import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  BookOpen, BarChart3, Lightbulb, HelpCircle, FileText, ChevronRight, 
  Clock, Sparkles, Maximize2, X, MessageSquareQuote, Newspaper, Zap, GraduationCap,
  CheckCircle2
} from 'lucide-react';
import { useTranslation } from '@/context/TranslationContext';
import ZenCard from './ZenCard';
import { useIsClient } from '@/lib/useIsClient';

export default function IssueDetailClient({ issue }) {
  const { t, lang } = useTranslation();
  const [activeTab, setActiveTab] = useState('summary');
  const [expandedQ, setExpandedQ] = useState(null);
  const [qSubTab, setQSubTab] = useState('prelims'); // prelims, mains
  const [expandedSub, setExpandedSub] = useState({});
  const contentRef = useRef(null);
  const isClient = useIsClient();

  if (!isClient || !issue) return null;

  const TABS = [
    { id: 'summary',   label: t?.('issue.summary') || 'Summary',   icon: FileText,   field: 'cumulativeSummary' },
    { id: 'details',   label: t?.('issue.mainsNote') || 'Notes',   icon: BookOpen,   field: 'mainsNote' },
    { id: 'facts',     label: t?.('issue.stats') || 'Facts',       icon: BarChart3,  field: 'mainsFacts' },
    { id: 'value',     label: t?.('issue.valueAdd') || 'Value Add', icon: Lightbulb,  field: 'valueAddition' },
    { id: 'questions', label: 'Mains Practice', icon: GraduationCap, field: 'subNodes' },
  ];

  const currentTab = TABS.find(tab => tab.id === activeTab) || TABS[0];
  
  // HARD FALLBACK LOGIC: Check if localized field is non-empty string
  const localizedField = lang === 'en' ? currentTab.field : `${currentTab.field}_${lang}`;
  const localizedContent = issue[localizedField];
  const hasLocalized = localizedContent && typeof localizedContent === 'string' && localizedContent.trim().length > 0;
  const currentContent = hasLocalized ? localizedContent : issue[currentTab.field];

  const renderDetails = () => {
    const parentNotes = issue[lang === 'en' ? 'mainsNote' : `mainsNote_${lang}`];
    const parentFacts = issue[lang === 'en' ? 'mainsFacts' : `mainsFacts_${lang}`];
    const parentValue = issue[lang === 'en' ? 'valueAddition' : `valueAddition_${lang}`];
    const subNodes = issue.subNodes?.filter(n => n.nodeType !== 'MAINS_QUESTION') || [];

    return (
      <div className="details-engine">
        {/* 1. The Intelligence Narrative (Stitched Body - The Core Concept) */}
        <div className="intelligence-narrative" style={{ marginTop: 0 }}>
          <div className="section-divider">
            <div className="divider-line" />
            <div className="divider-label"><BookOpen size={14} /> Topic Deep-Dive: {issue.title}</div>
            <div className="divider-line" />
          </div>

          {subNodes.length > 0 ? (
            <div className="stitched-stack">
              {subNodes.map((sub, idx) => {
                const isExpanded = expandedSub[sub.id];
                const subContent = sub[lang === 'en' ? 'mainsNote' : `mainsNote_${lang}`] || sub.mainsNote;
                
                return (
                  <div key={sub.id} className={`stitched-segment ${isExpanded ? 'expanded' : ''}`}>
                    <div className="segment-header" onClick={() => setExpandedSub(prev => ({ ...prev, [sub.id]: !prev[sub.id] }))} style={{ cursor: 'pointer' }}>
                      <span className="segment-idx">{idx + 1}</span>
                      <h3>{lang === 'en' ? sub.title : (sub[`title_${lang}`] || sub.title)}</h3>
                      <ChevronRight size={20} className="segment-chevron" style={{ marginLeft: 'auto', transform: isExpanded ? 'rotate(90deg)' : 'none', transition: '0.3s', opacity: 0.4 }} />
                    </div>
                    {isExpanded && (
                      <div className="segment-body" style={{ animation: 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                        <div className="issue-md">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {subContent || "_Neural Synthesis in Progress: Strategic intelligence for this micro-topic is being forged and will be deployed shortly._"}
                          </ReactMarkdown>
                        </div>
                        <div className="sub-node-footer">
                           <button className="btn-sub-action" onClick={() => setActiveTab('questions')}><HelpCircle size={14}/> Topic Questions</button>
                           <button className="btn-sub-action" onClick={() => {/* Handle specific news navigation */}}><Newspaper size={14}/> Topic News</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '40px', background: 'rgba(15, 23, 42, 0.2)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '24px' }}>
              <div className="issue-md">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {(parentNotes || 'Strategic intelligence is being synthesized...').replace(/\n\*/g, '\n\n*')}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {/* 2. Facts & Data (Evidence Vault - Move to after Concept) */}
        {parentFacts && (
          <div style={{ marginTop: '60px' }}>
            <ZenCard title="Supporting Evidence: Facts & Data" accentColor="amber">
              <div className="issue-md">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {parentFacts.replace(/\n\*/g, '\n\n*')}
                </ReactMarkdown>
              </div>
            </ZenCard>
          </div>
        )}

        {/* 3. Value Addition (The Strategic Finish) */}
        {parentValue && (
          <div style={{ marginTop: '40px' }}>
            <ZenCard title="Marks Booster: Value Addition" accentColor="purple">
              <div className="issue-md">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {parentValue.replace(/\n\*/g, '\n\n*')}
                </ReactMarkdown>
              </div>
            </ZenCard>
          </div>
        )}
      </div>
    );
  };

  const renderQuestions = () => {
    // 1. Mains Questions (Issues of type MAINS_QUESTION)
    const directMains = issue.subNodes?.filter(n => n.nodeType === 'MAINS_QUESTION') || [];
    const subMains = issue.subNodes?.flatMap(sub => 
      (sub.subNodes || []).filter(n => n.nodeType === 'MAINS_QUESTION').map(q => ({ ...q, parentTitle: sub.title }))
    ) || [];
    const allMains = [...directMains, ...subMains];

    // 2. Prelims Questions (MCQs from Question model)
    const allPrelims = issue.questions || [];

    const activeQuestions = qSubTab === 'prelims' ? allPrelims : allMains;

    return (
      <div className="practice-lab">
        <header className="lab-head">
          <div className="lab-label"><Zap size={14} /> Strategic Mastery Engine</div>
          <h3>Practice Lab: {qSubTab === 'prelims' ? 'Prelims (MCQs)' : 'Mains (Descriptive)'}</h3>
          
          <div className="q-sub-tabs">
             <button className={`q-sub-tab ${qSubTab === 'prelims' ? 'active' : ''}`} onClick={() => setQSubTab('prelims')}>
               Prelims Fact-Check ({allPrelims.length})
             </button>
             <button className={`q-sub-tab ${qSubTab === 'mains' ? 'active' : ''}`} onClick={() => setQSubTab('mains')}>
               Mains Strategic Writing ({allMains.length})
             </button>
          </div>
        </header>

        <div className="q-stack">
          {qSubTab === 'prelims' ? (
            // PRELIMS MCQ RENDERER
            allPrelims.map((q, idx) => (
              <div key={q.id} className={`q-node ${expandedQ === q.id ? 'active' : ''}`}>
                <div className="q-header" onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}>
                   <div className="q-idx">P{idx + 1}</div>
                   <div className="q-title-box">
                     <h4>{q.text}</h4>
                     <div className="q-meta">
                       <span>Prelims Intelligence</span> • <span style={{ color: q.difficulty === 'HARD' ? '#f87171' : '#fbbf24' }}>{q.difficulty}</span>
                     </div>
                   </div>
                   <ChevronRight size={18} className="q-chevron" />
                </div>
                {expandedQ === q.id && (
                  <div className="q-body">
                    <div className="mcq-options">
                       {q.options.map(opt => (
                         <div key={opt.label} className={`mcq-option ${q.correctLabel === opt.label ? 'correct' : ''}`}>
                           <span className="opt-label">{opt.label.toUpperCase()}</span>
                           <span className="opt-text">{opt.text}</span>
                         </div>
                       ))}
                    </div>
                    <div className="ans-section" style={{ marginTop: '24px' }}>
                       <div className="ans-label"><Lightbulb size={14} /> Mission Debrief (Explanation)</div>
                       <div className="issue-md">
                         <ReactMarkdown remarkPlugins={[remarkGfm]}>{q.explanation}</ReactMarkdown>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            // MAINS QUESTION RENDERER (Existing)
            allMains.map((q, idx) => {
              const qLocalizedField = `mainsNote_${lang}`;
              const qHasLocalized = q[qLocalizedField] && typeof q[qLocalizedField] === 'string' && q[qLocalizedField].trim().length > 0;
              const qContent = qHasLocalized ? q[qLocalizedField] : q.mainsNote;

              return (
                <div key={q.id} className={`q-node ${expandedQ === q.id ? 'active' : ''}`}>
                  <div className="q-header" onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}>
                    <div className="q-idx">M{idx + 1}</div>
                    <div className="q-title-box">
                      <h4>{lang === 'en' ? q.title : (q[`title_${lang}`] || q.title)}</h4>
                      <div className="q-meta">
                        <span>Mains Intelligence</span> 
                        {q.parentTitle && <> • <span className="q-parent-tag">{q.parentTitle}</span></>}
                      </div>
                    </div>
                    <ChevronRight size={18} className="q-chevron" />
                  </div>
                  {expandedQ === q.id && (
                    <div className="q-body">
                      <div className="ans-section">
                        <div className="ans-label"><MessageSquareQuote size={14} /> Model Answer ({lang.toUpperCase()})</div>
                        <div className="issue-md">
                           <ReactMarkdown remarkPlugins={[remarkGfm]}>
                             {qContent || "Synthesizing answer..."}
                           </ReactMarkdown>
                        </div>
                      </div>
                      {q.articles?.length > 0 && (
                        <div className="evidence-section">
                          <div className="ans-label"><Newspaper size={14} /> Supporting Evidence (Current Affairs)</div>
                          <div className="evidence-list">
                            {q.articles.map(art => (
                              <div key={art.id} className="evidence-card">
                                <span className="ev-source">{art.source || 'Intelligence Hub'}</span>
                                <h5>{art.title}</h5>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="q-footer"><div className="val-box"><strong>Value Addition:</strong> {q.valueAddition || 'Searching for high-yield strategic facts...'}</div></div>
                    </div>
                  )}
                </div>
              );
            })
          )}
          
          {activeQuestions.length === 0 && (
            <div className="empty-lab"><HelpCircle size={40} opacity={0.2} /><p>No forged questions for this neural node yet.</p></div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="issue-shell">
      <div className="issue-header">
         <div className="issue-header__meta">
            <span className="issue-header__label">Neural Strategic Hub</span>
            {issue.gsPapers?.map(p => <span key={p} className="gs-badge">{p}</span>)}
         </div>
         <h1 className="issue-header__title">{issue.title}</h1>
         <div className="issue-header__sub">
           {issue.domain} <ChevronRight size={12} style={{ opacity: 0.3 }} /> {issue.topic}
         </div>
      </div>

      <div className="issue-tabs-sticky">
        <div className="issue-tabs">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} className={`issue-tab ${isActive ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                <Icon size={14} /> <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="issue-content" ref={contentRef}>
        {activeTab === 'questions' ? renderQuestions() : (
          activeTab === 'details' ? renderDetails() : (
            <ZenCard title={currentTab.label} accentColor={activeTab === 'summary' ? 'blue' : (activeTab === 'facts' ? 'amber' : 'purple')}>
              <div className="issue-md" style={{ overflowWrap: 'anywhere', wordBreak: 'normal' }}>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({children}) => <p style={{ marginBottom: '2em', whiteSpace: 'pre-wrap' }}>{children}</p>,
                    li: ({children}) => <li style={{ marginBottom: '1.2em' }}>{children}</li>
                  }}
                >
                  {(currentContent || 'Strategic intelligence is being synthesized...').replace(/\n\*/g, '\n\n*')}
                </ReactMarkdown>
              </div>
            </ZenCard>
          )
        )}
      </div>

      <style jsx global>{`
        .issue-shell { max-width: 1000px; margin: 0 auto; position: relative; z-index: 10; font-family: 'Outfit', sans-serif; padding: 20px; }
        
        /* Header Upgrade */
        .issue-header { background: linear-gradient(135deg, rgba(15,23,42,0.9), rgba(15,23,42,0.6)); backdrop-filter: blur(40px); border: 1px solid rgba(255,255,255,0.08); border-top: 4px solid #3b82f6; border-radius: 32px; padding: 60px; margin-bottom: 40px; box-shadow: 0 30px 60px rgba(0,0,0,0.5); }
        .issue-header__label { font-size: 0.75rem; font-weight: 900; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.3em; display: block; margin-bottom: 20px; opacity: 0.8; }
        .issue-header__title { font-size: 3.5rem; font-weight: 950; margin: 0 0 16px; color: white; letter-spacing: -0.05em; line-height: 1.1; }
        .issue-header__sub { font-size: 0.9rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; display: flex; align-items: center; gap: 12px; }
        .gs-badge { margin-left: 15px; font-size: 0.65rem; font-weight: 900; color: #f59e0b; background: rgba(245,158,11,0.1); padding: 5px 15px; border-radius: 10px; border: 1px solid rgba(245,158,11,0.2); }

        /* Tabs Upgrade */
        .issue-tabs-sticky { position: sticky; top: 80px; z-index: 100; margin-bottom: 40px; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(25px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 10px; display: flex; justify-content: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
        .issue-tabs { display: flex; gap: 10px; width: 100%; }
        .issue-tab { flex: 1; display: flex; align-items: center; justify-content: center; gap: 12px; padding: 16px; background: transparent; border: 1px solid transparent; border-radius: 18px; color: #94a3b8; font-size: 0.8rem; font-weight: 800; cursor: pointer; text-transform: uppercase; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        .issue-tab:hover { background: rgba(255,255,255,0.05); color: white; }
        .issue-tab.active { background: rgba(59,130,246,0.15); border-color: rgba(59,130,246,0.3); color: white; box-shadow: 0 0 30px rgba(59,130,246,0.2); }

        /* Content Markdown Upgrade */
        .issue-content { background: rgba(15,23,42,0.4); border: 1px solid rgba(255,255,255,0.06); border-radius: 32px; padding: 60px 40px; position: relative; min-height: 600px; box-shadow: 0 50px 120px rgba(0,0,0,0.5); max-width: 100%; overflow-x: hidden; }
        @media (max-width: 768px) { .issue-content { padding: 40px 20px; border-radius: 20px; } }
        .issue-md { color: #e2e8f0; font-size: 1.15rem; line-height: 1.8; max-width: 100%; overflow-wrap: break-word; }
        .issue-md h2 { font-size: 2rem; font-weight: 900; color: white; margin: 2.5em 0 1em; letter-spacing: -0.02em; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px; position: relative; }
        .issue-md h2::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 60px; height: 3px; background: #3b82f6; }
        .issue-md h3 { font-size: 1.4rem; font-weight: 800; color: #3b82f6; margin: 1.8em 0 0.8em; letter-spacing: -0.01em; }
        .issue-md p { margin-bottom: 1.8em; font-weight: 450; color: #cbd5e1; }
        .issue-md ul { list-style: none; padding-left: 0; margin-bottom: 2em; }
        .issue-md li { position: relative; padding-left: 28px; margin-bottom: 1.2em; line-height: 1.7; }
        .issue-md li::before { content: "•"; position: absolute; left: 0; color: #3b82f6; font-weight: 900; font-size: 1.4rem; top: -4px; }
        .issue-md strong { color: white; font-weight: 750; }
        
        /* Practice Lab Upgrade */
        .lab-head { margin-bottom: 60px; padding-bottom: 40px; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .q-node { background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(255,255,255,0.06); border-radius: 24px; margin-bottom: 24px; backdrop-filter: blur(10px); }
        .q-header { padding: 32px 40px; }
        .q-title-box h4 { font-size: 1.35rem; letter-spacing: -0.01em; }
        .q-footer { background: rgba(59,130,246,0.08); border-radius: 20px; padding: 28px; }
        
        /* Transitions */
        .issue-content { animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

        /* Subnode Tree Styles */
        .subnode-tree-section { margin-top: 60px; }
        .section-divider { display: flex; align-items: center; gap: 20px; margin-bottom: 40px; }
        .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
        .divider-label { font-size: 0.7rem; font-weight: 900; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.2em; display: flex; align-items: center; gap: 10px; }
        
        .sub-node-block { background: rgba(15, 23, 42, 0.2); border: 1px solid rgba(255,255,255,0.04); border-radius: 20px; margin-bottom: 24px; padding: 10px; transition: 0.3s; }
        .sub-node-block.expanded { border-color: rgba(59, 130, 246, 0.2); background: rgba(15, 23, 42, 0.4); box-shadow: inset 0 0 40px rgba(0,0,0,0.2); }
        .sub-node-header { padding: 20px 24px; display: flex; align-items: center; gap: 20px; cursor: pointer; }
        .sub-node-idx { width: 28px; height: 28px; background: rgba(59, 130, 246, 0.05); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 900; color: #3b82f6; opacity: 0.6; }
        .sub-node-title { flex: 1; }
        .sub-node-title h4 { font-size: 1rem; margin: 0; font-weight: 700; color: #f1f5f9; }
        .sub-node-title span { font-size: 0.55rem; color: #475569; text-transform: uppercase; font-weight: 800; letter-spacing: 0.1em; }
        .sub-chevron { color: #334155; transition: 0.3s; }
        .expanded .sub-chevron { transform: rotate(90deg); color: #3b82f6; }
        
        .sub-node-body { padding: 10px 24px 30px 68px; border-top: 1px solid rgba(255,255,255,0.03); margin-top: 10px; animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        
        .sub-node-footer { margin-top: 24px; display: flex; gap: 12px; }
        .btn-sub-action { background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.05); color: #64748b; padding: 8px 16px; border-radius: 10px; font-size: 0.65rem; font-weight: 800; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s; }
        .btn-sub-action:hover { background: #3b82f6; color: white; border-color: #3b82f6; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2); }
        .q-parent-tag { background: rgba(59,130,246,0.1); color: #3b82f6; padding: 2px 8px; border-radius: 4px; font-size: 0.6rem; }
        .intelligence-narrative { margin-top: 40px; margin-bottom: 40px; }
        .stitched-stack { display: flex; flex-direction: column; gap: 60px; }
        .stitched-segment { position: relative; background: rgba(15, 23, 42, 0.2); border: 1px solid rgba(255,255,255,0.04); border-radius: 20px; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .stitched-segment.expanded { background: rgba(15, 23, 42, 0.4); border-color: rgba(59, 130, 246, 0.2); }
        .segment-header { display: flex; align-items: center; gap: 20px; padding: 24px 32px; transition: 0.3s; }
        .segment-idx { width: 32px; height: 32px; background: rgba(59, 130, 246, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 900; color: #3b82f6; }
        .segment-header h3 { font-size: 1.3rem; font-weight: 750; color: white; margin: 0; letter-spacing: -0.02em; }
        .segment-body { padding: 0 32px 32px 84px; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 24px; animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .segment-chevron { color: #475569; }
        .expanded .segment-chevron { color: #3b82f6; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

        /* Question Sub-tabs */
        .q-sub-tabs { display: flex; gap: 12px; margin-top: 24px; }
        .q-sub-tab { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; padding: 10px 20px; border-radius: 12px; font-size: 0.75rem; font-weight: 800; cursor: pointer; transition: 0.3s; }
        .q-sub-tab.active { background: #3b82f6; color: white; border-color: #3b82f6; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
        
        /* MCQ Options */
        .mcq-options { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 20px; }
        @media (max-width: 640px) { .mcq-options { grid-template-columns: 1fr; } }
        .mcq-option { display: flex; align-items: center; gap: 12px; padding: 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; transition: 0.3s; }
        .mcq-option.correct { background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.3); color: #10b981; }
        .opt-label { width: 24px; height: 24px; background: rgba(255,255,255,0.1); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 900; }
        .correct .opt-label { background: #10b981; color: white; }
        .opt-text { font-size: 0.9rem; font-weight: 500; }
      `}</style>
    </div>
  );
}

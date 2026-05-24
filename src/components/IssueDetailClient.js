"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { 
  ChevronRight, Calendar, BookOpen, Lightbulb, Zap, HelpCircle, 
  MessageSquareQuote, Newspaper, History, Link as LinkIcon, FileText, Target
} from 'lucide-react';
import { useTranslation } from '@/context/TranslationContext';
import ZenCard from './ZenCard';
import { useIsClient } from '@/lib/useIsClient';

export default function IssueDetailClient({ issue, initialFlow }) {
  const { t, lang } = useTranslation();
  const isClient = useIsClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const flowParam = searchParams.get('flow');
  const currentFlow = flowParam || initialFlow || 'mains';

  useEffect(() => {
    if (isClient) {
      if (flowParam) {
        localStorage.setItem('upsc_flow_context', flowParam);
      } else {
        const savedFlow = localStorage.getItem('upsc_flow_context');
        if (savedFlow && (savedFlow === 'prelims' || savedFlow === 'mains')) {
          router.replace(`/issues/${issue.slug}?flow=${savedFlow}`);
        } else {
          localStorage.setItem('upsc_flow_context', 'mains');
          router.replace(`/issues/${issue.slug}?flow=mains`);
        }
      }
    }
  }, [flowParam, isClient, issue.slug, router]);

  // Helper for localized fields
  const getLocalizedField = (fieldBase) => {
    if (!issue) return null;
    if (lang === 'en') return issue[fieldBase];
    const localizedKey = `${fieldBase}_${lang}`;
    return issue[localizedKey] || issue[fieldBase];
  };

  const localizedTitle = getLocalizedField('title') || issue?.title;
  const localizedTopic = getLocalizedField('topic') || issue?.topic;
  const localizedCumulativeSummary = getLocalizedField('cumulativeSummary');
  const localizedBackgroundNote = getLocalizedField('backgroundNote');
  const localizedPrelimsNote = getLocalizedField('prelimsNote');
  const localizedMainsNote = getLocalizedField('mainsNote');

  // Determine standard tab labels with simple localized mapping
  const getTabLabel = (id) => {
    if (id === 'summary') return lang === 'hi' ? 'सारांश' : (lang === 'mr' ? 'सारांश' : 'Summary');
    if (id === 'prelims_note') return lang === 'hi' ? 'प्रीलिम्स नोट्स' : (lang === 'mr' ? 'प्रीलिम्स नोट्स' : 'Prelims Focus');
    if (id === 'mains_note') return lang === 'hi' ? 'मुख्य परीक्षा नोट्स' : (lang === 'mr' ? 'मुख्य परीक्षा नोट्स' : 'Mains Notes');
    if (id === 'analysis') return lang === 'hi' ? 'विश्लेषणात्मक हब' : (lang === 'mr' ? 'विश्लेषणात्मक हब' : 'Analytical Hub');
    if (id === 'timeline') return lang === 'hi' ? 'समयरेखा' : (lang === 'mr' ? 'समयरेखा' : 'Timeline');
    if (id === 'practice') return lang === 'hi' ? 'पीवाईक्यू लैब' : (lang === 'mr' ? 'पीवाईक्यू लैब' : 'PYQ Lab');
    return id;
  };

  const hasSummary = !!localizedCumulativeSummary || !!localizedBackgroundNote;
  
  const defaultTab = currentFlow === 'prelims' 
    ? (localizedPrelimsNote ? 'prelims_note' : 'timeline')
    : (hasSummary ? 'summary' : (localizedMainsNote ? 'mains_note' : 'analysis'));

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [prevFlow, setPrevFlow] = useState(currentFlow);

  if (currentFlow !== prevFlow) {
    setPrevFlow(currentFlow);
    setActiveTab(defaultTab);
  }

  if (!isClient || !issue) return null;

  const gsPapers = issue.gsPapers || [];
  const articles = issue.articles || [];
  const timeline = issue.timelineEvents || [];
  const pyqs = issue.pyqLinks || [];

  // Determine TABS dynamically based on flow
  const TABS = [];
  if (currentFlow === 'prelims') {
    if (localizedPrelimsNote) {
      TABS.push({ id: 'prelims_note', label: getTabLabel('prelims_note'), icon: BookOpen });
    }
    TABS.push(
      { id: 'timeline',  label: getTabLabel('timeline'), icon: History },
      { id: 'practice',  label: getTabLabel('practice'), icon: Zap }
    );
  } else {
    TABS.push({ id: 'summary',   label: getTabLabel('summary'),   icon: FileText });
    if (localizedMainsNote) {
      TABS.push({ id: 'mains_note', label: getTabLabel('mains_note'), icon: Lightbulb });
    }
    TABS.push(
      { id: 'analysis',  label: getTabLabel('analysis'), icon: BookOpen },
      { id: 'timeline',  label: getTabLabel('timeline'), icon: History }
    );
  }

  // Derive "Answer Hook" from the latest article's crux if available
  const answerHook = articles[0]?.structuredData?.cruxForMains || 
                     (localizedCumulativeSummary ? localizedCumulativeSummary.slice(0, 200) + "..." : 
                     (localizedPrelimsNote ? localizedPrelimsNote.slice(0, 200) + "..." : 
                     (localizedMainsNote ? localizedMainsNote.slice(0, 200) + "..." : "Strategic overview placeholder...")));

  // Derive "Core Prelims Fact" snippet from the prelimsNote if available
  const prelimsFact = localizedPrelimsNote 
    ? (localizedPrelimsNote.length > 250 ? localizedPrelimsNote.replace(/[#*`]/g, '').slice(0, 240).trim() + "..." : localizedPrelimsNote.replace(/[#*`]/g, '').trim())
    : "Key facts summary in progress...";

  const renderSummary = () => (
    <div className="summary-section">
      <ZenCard title="Neural Executive Summary" accentColor="blue">
        <div className="issue-md">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {localizedCumulativeSummary || "Strategic synthesis in progress..."}
          </ReactMarkdown>
        </div>
      </ZenCard>

      {localizedBackgroundNote && (
        <div style={{ marginTop: '40px' }}>
          <div className="section-header">Contextual Background</div>
          <div className="context-box">
             <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{localizedBackgroundNote}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );

  const renderAnalysis = () => (
    <div className="analysis-section">
       <div className="section-header">Multidimensional Perspectives</div>
       <div className="articles-stack">
          {articles.map((art, idx) => (
            <div key={art.id} className="article-analysis-card">
               <div className="analysis-card-header">
                  <div className="header-top">
                     <span className="source-tag">{art.source}</span>
                     <div className="gs-badges">
                        {gsPapers.map(p => <span key={p} className="gs-badge-mini">{p}</span>)}
                     </div>
                  </div>
                  <h4>{art.title}</h4>
               </div>
               
               {art.structuredData && (
                 <div className="analysis-content">
                    <div className="analysis-grid">
                       <div className="analysis-block">
                          <div className="block-label">CRUX FOR MAINS</div>
                          <p>{art.structuredData.cruxForMains || art.structuredData.crux}</p>
                       </div>
                       <div className="analysis-block">
                          <div className="block-label">GOVT VIEW</div>
                          <p>{art.structuredData.governmentView || 'Synthesizing official stance...'}</p>
                       </div>
                    </div>
                    {art.structuredData.criticalView && (
                      <div className="analysis-block full">
                         <div className="block-label">CRITICAL ANALYSIS</div>
                         <p>{art.structuredData.criticalView}</p>
                      </div>
                    )}
                 </div>
               )}
            </div>
          ))}
          {articles.length === 0 && <div className="empty-state">No linked articles for analysis yet.</div>}
       </div>
    </div>
  );

  const handleModeChange = (mode) => {
    localStorage.setItem('upsc_flow_context', mode);
    router.push(`/issues/${issue.slug}?flow=${mode}`);
  };

  return (
    <div className="issue-detail-container">
      {/* TOP HEADER */}
      <header className="issue-main-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div className="header-meta">
               {gsPapers.map(p => <span key={p} className="gs-badge-main">{p}</span>)}
               <span className="domain-tag">{issue.domain}</span>
               <div className="status-indicator">
                  <span className="pulse-dot"></span>
                  Live Topic
               </div>
            </div>
            <h1 className="issue-title">{localizedTitle}</h1>
            <p className="issue-breadcrumb">{issue.domain} <ChevronRight size={12} /> {localizedTopic}</p>
          </div>

          {/* Mode Switcher Pill */}
          <div className="mode-switcher">
             <button onClick={() => handleModeChange('prelims')} className={`mode-btn ${currentFlow === 'prelims' ? 'active-prelims' : ''}`}>
                <Target size={14} /> {lang === 'hi' ? 'प्रीलिम्स मोड' : (lang === 'mr' ? 'प्रीलिम्स मोड' : 'Prelims Mode')}
             </button>
             <button onClick={() => handleModeChange('mains')} className={`mode-btn ${currentFlow === 'mains' ? 'active-mains' : ''}`}>
                <BookOpen size={14} /> {lang === 'hi' ? 'मुख्य परीक्षा मोड' : (lang === 'mr' ? 'मुख्य परीक्षा मोड' : 'Mains Mode')}
             </button>
          </div>
        </div>
        
        <div className="tab-navigation">
           {TABS.map(tab => (
             <button key={tab.id} className={`nav-tab ${activeTab === tab.id ? `active active-${currentFlow}` : ''}`} onClick={() => setActiveTab(tab.id)}>
                <tab.icon size={16} /> {tab.label}
             </button>
           ))}
        </div>
      </header>

      <div className="issue-grid-layout">
         <div className="content-canvas">
            {activeTab === 'summary' && renderSummary()}
            {activeTab === 'prelims_note' && (
              <div className="prelims-note-section">
                <ZenCard title={getTabLabel('prelims_note')} accentColor="amber">
                  <div className="issue-md">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {localizedPrelimsNote || "No prelims notes available."}
                    </ReactMarkdown>
                  </div>
                </ZenCard>
              </div>
            )}
            {activeTab === 'mains_note' && (
              <div className="mains-note-section">
                <ZenCard title={getTabLabel('mains_note')} accentColor="emerald">
                  <div className="issue-md">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {localizedMainsNote || "No mains notes available."}
                    </ReactMarkdown>
                  </div>
                </ZenCard>
              </div>
            )}
            {activeTab === 'analysis' && renderAnalysis()}
            {activeTab === 'timeline' && (
              <div className="timeline-section">
                 <div className="section-header">Strategic Timeline</div>
                 <div className="timeline-stack">
                    {timeline.map((ev, i) => (
                      <div key={ev.id} className="timeline-item">
                         <div className="timeline-marker"></div>
                         <div className="timeline-date">{new Date(ev.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                         <div className="timeline-event">{ev.eventText}</div>
                      </div>
                    ))}
                 </div>
              </div>
            )}
            {activeTab === 'practice' && (
              <div className="pyq-section">
                 <div className="section-header">PYQ Intelligence Lab</div>
                 <div className="pyq-grid">
                    {pyqs.map(pyq => (
                      <div key={pyq.id} className="pyq-card">
                         <div className="pyq-meta">{pyq.paperType} • {pyq.year}</div>
                         <p className="pyq-text">{pyq.questionText}</p>
                         {pyq.relevanceNote && <div className="pyq-note"><strong>Relevance:</strong> {pyq.relevanceNote}</div>}
                      </div>
                    ))}
                 </div>
              </div>
            )}
         </div>

         <aside className="content-sidebar">
            {currentFlow === 'prelims' ? (
              <div className="sidebar-widget prelims-widget">
                 <div className="widget-label prelims-label">{lang === 'hi' ? 'मुख्य प्रारंभिक तथ्य' : (lang === 'mr' ? 'मुख्य पूर्व परीक्षा तथ्य' : 'CORE PRELIMS FACT')}</div>
                 <div className="hook-content prelims-fact">
                    <span className="quote-icon prelims-quote">🎯</span>
                    {prelimsFact}
                 </div>
              </div>
            ) : (
              <div className="sidebar-widget">
                 <div className="widget-label">{lang === 'hi' ? 'उत्तर हुक' : (lang === 'mr' ? 'उत्तर हुक' : 'ANSWER HOOK')}</div>
                 <div className="hook-content">
                    <span className="quote-icon">❝</span>
                    {answerHook}
                 </div>
              </div>
            )}

            <div className="sidebar-widget">
               <div className="widget-label">{lang === 'hi' ? 'पाठ्यक्रम संरेखण' : (lang === 'mr' ? 'अभ्यासक्रम संरेखन' : 'SYLLABUS ALIGNMENT')}</div>
               <div className="syllabus-box">
                  <div className="syllabus-item"><strong>{lang === 'hi' ? 'डोमेन' : (lang === 'mr' ? 'डोमेन' : 'Domain')}:</strong> {issue.domain}</div>
                  <div className="syllabus-item"><strong>{lang === 'hi' ? 'विषय' : (lang === 'mr' ? 'विषय' : 'Topic')}:</strong> {localizedTopic}</div>
                  <div className="syllabus-item"><strong>{lang === 'hi' ? 'जीएस पेपर्स' : (lang === 'mr' ? 'जीएस पेपर्स' : 'GS Papers')}:</strong> {gsPapers.join(', ')}</div>
               </div>
            </div>
         </aside>
      </div>

      <style jsx>{`
        .issue-detail-container { color: #f8fafc; font-family: 'Outfit', sans-serif; }
        .issue-main-header { margin-bottom: 40px; padding: 40px; background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255,255,255,0.06); border-radius: 28px; backdrop-filter: blur(10px); }
        .header-meta { display: flex; gap: 12px; margin-bottom: 24px; align-items: center; }
        .gs-badge-main { background: #3b82f6; color: white; font-size: 0.65rem; font-weight: 900; padding: 4px 14px; border-radius: 8px; letter-spacing: 0.05em; }
        .domain-tag { background: rgba(255,255,255,0.05); color: #94a3b8; font-size: 0.65rem; font-weight: 900; padding: 4px 14px; border-radius: 8px; text-transform: uppercase; }
        
        .status-indicator { display: flex; align-items: center; gap: 8px; font-size: 0.65rem; font-weight: 900; color: #10b981; text-transform: uppercase; }
        .pulse-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 10px #10b981; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }
        
        .issue-title { font-size: 3.2rem; font-weight: 900; color: white; margin: 0 0 12px; letter-spacing: -0.04em; line-height: 1.1; }
        .issue-breadcrumb { font-size: 0.9rem; color: #64748b; font-weight: 600; display: flex; align-items: center; gap: 8px; margin-bottom: 32px; }
        
        .tab-navigation { display: flex; gap: 10px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 24px; }
        .nav-tab { background: transparent; border: 1px solid transparent; color: #64748b; font-size: 0.8rem; font-weight: 800; padding: 12px 24px; border-radius: 14px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
        .nav-tab:hover { color: white; background: rgba(255,255,255,0.03); }
        .nav-tab.active.active-prelims {
          background: rgba(251, 191, 36, 0.1);
          color: #fbbf24;
          box-shadow: 0 4px 15px rgba(251, 191, 36, 0.05);
          border: 1px solid rgba(251, 191, 36, 0.15);
        }
        .nav-tab.active.active-mains {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.05);
          border: 1px solid rgba(16, 185, 129, 0.15);
        }

        .issue-grid-layout { display: grid; grid-template-columns: 1fr 340px; gap: 40px; }
        
        .section-header { font-size: 1.4rem; font-weight: 800; color: white; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; }
        .section-header::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.06); }
        
        .context-box { background: rgba(15, 23, 42, 0.2); border: 1px solid rgba(255,255,255,0.04); border-radius: 20px; padding: 28px; color: #cbd5e1; line-height: 1.8; font-size: 1.05rem; }
        
        .articles-stack { display: flex; flex-direction: column; gap: 24px; }
        .article-analysis-card { background: rgba(15, 23, 42, 0.3); border: 1px solid rgba(255,255,255,0.04); border-radius: 24px; padding: 28px; }
        .analysis-card-header { margin-bottom: 20px; }
        .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .source-tag { font-size: 0.6rem; font-weight: 900; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.1em; }
        .gs-badges { display: flex; gap: 6px; }
        .gs-badge-mini { font-size: 0.55rem; font-weight: 900; color: #fbbf24; background: rgba(251,191,36,0.1); padding: 2px 8px; border-radius: 6px; }
        .article-analysis-card h4 { font-size: 1.25rem; font-weight: 850; color: white; margin: 0; letter-spacing: -0.01em; }
        
        .analysis-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 20px; }
        .analysis-block { }
        .block-label { font-size: 0.65rem; font-weight: 900; color: #475569; margin-bottom: 10px; letter-spacing: 0.1em; }
        .analysis-block p { font-size: 0.95rem; color: #94a3b8; line-height: 1.6; margin: 0; }
        .analysis-block.full { grid-column: 1 / -1; margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.03); }

        .content-sidebar { display: flex; flex-direction: column; gap: 20px; }
        .sidebar-widget { background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255,255,255,0.06); border-radius: 24px; padding: 24px; }
        .widget-label { font-size: 0.7rem; font-weight: 900; color: #3b82f6; margin-bottom: 16px; letter-spacing: 0.1em; text-transform: uppercase; }
        .hook-content { font-size: 1rem; font-weight: 600; color: #e2e8f0; line-height: 1.6; position: relative; padding-left: 0; }
        .quote-icon { font-size: 2.5rem; color: #3b82f6; opacity: 0.2; position: absolute; left: -10px; top: -15px; pointer-events: none; }
        
        .syllabus-box { display: flex; flex-direction: column; gap: 12px; }
        .syllabus-item { font-size: 0.85rem; color: #94a3b8; }
        .syllabus-item strong { color: #cbd5e1; }

        .timeline-stack { display: flex; flex-direction: column; }
        .timeline-item { display: flex; gap: 32px; padding: 24px 0; border-left: 2px solid rgba(255,255,255,0.03); padding-left: 32px; position: relative; }
        .timeline-marker { position: absolute; left: -7px; top: 32px; width: 12px; height: 12px; background: #3b82f6; border-radius: 50%; box-shadow: 0 0 10px rgba(59,130,246,0.5); }
        .timeline-date { min-width: 120px; font-size: 0.8rem; font-weight: 850; color: #3b82f6; }
        .timeline-event { font-size: 1rem; color: #cbd5e1; line-height: 1.6; }

        .pyq-grid { display: flex; flex-direction: column; gap: 20px; }
        .pyq-card { background: rgba(15, 23, 42, 0.2); border: 1px solid rgba(255,255,255,0.04); border-radius: 20px; padding: 24px; }
        .pyq-meta { font-size: 0.75rem; font-weight: 850; color: #fbbf24; margin-bottom: 12px; }
        .pyq-text { font-size: 1.05rem; color: white; font-weight: 600; line-height: 1.5; margin-bottom: 16px; }
        .pyq-note { font-size: 0.85rem; color: #94a3b8; background: rgba(255,255,255,0.02); padding: 12px; border-radius: 12px; }

        .mode-switcher {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 4px;
          display: inline-flex;
          gap: 4px;
          backdrop-filter: blur(8px);
          margin-top: 8px;
        }
        .mode-btn {
          background: transparent;
          border: none;
          color: #64748b;
          font-size: 0.8rem;
          font-weight: 800;
          padding: 10px 18px;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }
        .mode-btn:hover {
          color: #cbd5e1;
        }
        .mode-btn.active-prelims {
          background: rgba(251, 191, 36, 0.1);
          color: #fbbf24;
          box-shadow: inset 0 0 12px rgba(251, 191, 36, 0.05);
        }
        .mode-btn.active-mains {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          box-shadow: inset 0 0 12px rgba(16, 185, 129, 0.05);
        }

        .sidebar-widget.prelims-widget {
          border-color: rgba(251, 191, 36, 0.15);
        }
        .widget-label.prelims-label {
          color: #fbbf24;
        }
        .hook-content.prelims-fact {
          color: #fef08a;
          padding-left: 20px;
        }
        .quote-icon.prelims-quote {
          color: #fbbf24;
          font-size: 1.5rem;
          left: -4px;
          top: -12px;
          opacity: 0.3;
        }

        @media (max-width: 1024px) {
           .issue-grid-layout { grid-template-columns: 1fr; }
           .issue-title { font-size: 2.2rem; }
           .analysis-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

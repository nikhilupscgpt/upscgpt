'use client';

import { useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useRouter } from 'next/navigation';
import { 
  ChevronRight, ChevronLeft, Home, BookOpen, Lightbulb, Zap, 
  HelpCircle, MessageSquareQuote, FileText, Sparkles, MessageSquare, X, Lock 
} from 'lucide-react';
import FloatingChatWrapper from '@/components/content-portal/FloatingChatWrapper';
import WorkspaceLayout from '@/components/WorkspaceLayout';
import NewsBriefsSidebar from '@/components/NewsBriefsSidebar';

export default function MainsNodeStudyClient({ issue, articles = [], sessionExists }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('details'); // "Details/Explained" active by default
  const [chatOpen, setChatOpen] = useState(false); // Collapsed by default

  const gsPapers = issue.gsPapers || [];

  const getPaperPath = () => {
    const gs = gsPapers[0];
    if (gs) {
      return `/mains/prepare/${gs.toLowerCase()}`;
    }
    return '/mains/prepare';
  };

  const getPaperName = () => {
    const gs = gsPapers[0];
    if (gs) {
      return `${gs.toUpperCase()} Prepare`;
    }
    return 'Mains Prepare';
  };

  // Helper to render details/explained (mainsNote)
  const renderDetails = () => {
    const mainsNote = issue.mainsNote || issue.nodeContent?.mainsNote;
    if (!mainsNote) {
      return <p className="empty-text">No detailed analysis compiled for this node yet.</p>;
    }

    if (typeof mainsNote === 'string') {
      return (
        <div className="markdown-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{mainsNote}</ReactMarkdown>
        </div>
      );
    }

    if (typeof mainsNote === 'object') {
      return (
        <div className="mains-sections-stack">
          {Object.entries(mainsNote).map(([key, val]) => {
            const formattedKey = key
              .split('_')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            
            let valStr = '';
            if (typeof val === 'string') {
              valStr = val;
            } else if (typeof val === 'object') {
              valStr = Object.entries(val)
                .map(([subKey, subVal]) => `**${subKey.charAt(0).toUpperCase() + subKey.slice(1)}**: ${subVal}`)
                .join('\n\n');
            }

            return (
              <div key={key} className="mains-note-section-block">
                <h3 className="mains-section-title">{formattedKey}</h3>
                <div className="mains-section-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{valStr}</ReactMarkdown>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return null;
  };

  // Helper to render facts & data points
  const renderFacts = () => {
    const factsList = [];
    if (issue.mainsFacts) {
      factsList.push(issue.mainsFacts);
    }
    if (issue.nodeContent?.facts) {
      try {
        const parsedFacts = typeof issue.nodeContent.facts === 'string'
          ? JSON.parse(issue.nodeContent.facts)
          : issue.nodeContent.facts;
        
        if (Array.isArray(parsedFacts)) {
          parsedFacts.forEach(f => {
            if (typeof f === 'string') {
              factsList.push(f);
            } else if (f && typeof f === 'object') {
              const text = f.text || f.fact || JSON.stringify(f);
              factsList.push(text);
            }
          });
        } else if (typeof parsedFacts === 'string') {
          factsList.push(parsedFacts);
        }
      } catch (e) {
        console.error('Error parsing facts JSON:', e);
      }
    }

    if (factsList.length === 0) {
      return <p className="empty-text">No core facts or data sets indexed for this topic.</p>;
    }

    return (
      <div className="facts-stack">
        {factsList.map((fact, index) => (
          <div key={index} className="fact-card">
            <div className="fact-icon">📊</div>
            <div className="fact-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{fact}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Helper to render value additions
  const renderValueAdd = () => {
    if (!issue.valueAddition) {
      return <p className="empty-text">No value addition notes compiled for this topic yet.</p>;
    }

    return (
      <div className="value-adds-stack">
        <div className="value-add-card">
          <div className="value-add-card-header">
            <Sparkles size={16} className="sparkle-icon" />
            <h4>Value Addition Material</h4>
          </div>
          <div className="value-add-card-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{issue.valueAddition}</ReactMarkdown>
          </div>
        </div>
      </div>
    );
  };

  // Helper to render case studies
  const renderCaseStudies = () => {
    const caseStudiesList = [];
    if (issue.nodeContent?.caseStudies) {
      try {
        const parsedCaseStudies = typeof issue.nodeContent.caseStudies === 'string'
          ? JSON.parse(issue.nodeContent.caseStudies)
          : issue.nodeContent.caseStudies;

        if (Array.isArray(parsedCaseStudies)) {
          parsedCaseStudies.forEach((cs, i) => {
            if (typeof cs === 'string') {
              caseStudiesList.push({ title: `Case Study ${i + 1}`, content: cs });
            } else if (cs && typeof cs === 'object') {
              const title = cs.title || cs.name || `Case Study: ${issue.title}`;
              const content = cs.content || cs.description || JSON.stringify(cs);
              caseStudiesList.push({ title, content });
            }
          });
        } else if (typeof parsedCaseStudies === 'string') {
          caseStudiesList.push({ title: 'Case Study Reference', content: parsedCaseStudies });
        }
      } catch (e) {
        console.error('Error parsing case studies JSON:', e);
      }
    }

    if (caseStudiesList.length === 0) {
      return <p className="empty-text">No specialized case studies logged for this topic yet.</p>;
    }

    return (
      <div className="value-adds-stack">
        {caseStudiesList.map((item, index) => (
          <div key={index} className="value-add-card">
            <div className="value-add-card-header">
              <BookOpen size={16} className="sparkle-icon" />
              <h4>{item.title}</h4>
            </div>
            <div className="value-add-card-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{item.content}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Helper to render pyqs & possible questions
  const renderQuestions = () => {
    const hasPossibleQs = !!issue.possibleQuestions;
    const hasPyqs = issue.pyqLinks && issue.pyqLinks.length > 0;

    if (!hasPossibleQs && !hasPyqs) {
      return <p className="empty-text">No exam questions or model writing frames defined.</p>;
    }

    return (
      <div className="questions-layout">
        {hasPossibleQs && (
          <div className="questions-section">
            <h4 className="questions-section-title">Possible Questions & Practice Drills</h4>
            <div className="questions-box">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{issue.possibleQuestions}</ReactMarkdown>
            </div>
          </div>
        )}

        {hasPyqs && (
          <div className="questions-section">
            <h4 className="questions-section-title">UPSC CSE Mains Archive (PYQs)</h4>
            <div className="pyqs-list">
              {issue.pyqLinks.map(pyq => (
                <div key={pyq.id} className="pyq-card">
                  <div className="pyq-card-header">
                    <span className="pyq-paper">{pyq.paperType}</span>
                    <span className="pyq-year">{pyq.year}</span>
                  </div>
                  <p className="pyq-text">{pyq.questionText}</p>
                  {pyq.relevanceNote && (
                    <div className="pyq-approach">
                      <strong>Relevance Key:</strong> {pyq.relevanceNote}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const tabs = [
    { id: 'summary', label: 'Summary', icon: BookOpen },
    { id: 'details', label: 'Details/Explained', icon: FileText },
    { id: 'facts', label: 'Facts/Data', icon: Zap },
    { id: 'value_add', label: 'Value Addition', icon: Sparkles },
    { id: 'case_studies', label: 'Case Studies', icon: MessageSquareQuote },
    { id: 'questions', label: 'Possible Que + PYQ', icon: HelpCircle },
  ];

  return (
    <div className="study-container">
      <div style={{ maxWidth: '1300px', margin: '0 auto' }} className="workspace-layout-wrapper">
        {/* Navigation Breadcrumb */}
        <div className="breadcrumb" style={{ marginLeft: '0', marginRight: '0' }}>
          <Link href="/mains" className="breadcrumb-link">
            <Home size={14} />
            <span>Mains Gateway</span>
          </Link>
          <ChevronRight size={14} className="separator" />
          <Link href={getPaperPath()} className="breadcrumb-link">
            <span>{getPaperName()}</span>
          </Link>
          <ChevronRight size={14} className="separator" />
          <span className="current">{issue.title}</span>
        </div>

        <WorkspaceLayout
          themeColor="emerald"
          sidebarContent={
            <>
              <NewsBriefsSidebar 
                articles={articles} 
                slug={issue.slug} 
                categoryLabel={issue.category?.replace('_', ' ')}
                flow="mains"
                themeColor="emerald"
              />
              {chatOpen && sessionExists && (
                <div 
                  className="workspace-assistant-container fade-in"
                  style={{
                    background: 'rgba(15, 23, 42, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '24px',
                    padding: '24px',
                    backdropFilter: 'blur(12px)',
                    fontFamily: "'Outfit', sans-serif",
                    display: 'flex',
                    flexDirection: 'column',
                    height: '550px',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 800, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <Sparkles size={16} />
                      <span>Neural Assistant</span>
                    </div>
                    <button 
                      onClick={() => setChatOpen(false)} 
                      style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                    <FloatingChatWrapper
                      subjectId={issue.id}
                      displayName={issue.title}
                      examType="MAINS"
                      variant="inline"
                    />
                  </div>
                </div>
              )}
            </>
          }
        >
          <div className="workspace-container">
            {/* Node Meta Header */}
            <header className="node-header">
              <div className="header-tags">
                {gsPapers.map(p => <span key={p} className="gs-paper-tag">{p}</span>)}
                <span className="domain-tag">{issue.domain}</span>
              </div>
              <h1 className="node-title">{issue.title}</h1>
              <p className="node-path">{issue.domain} <ChevronRight size={12} className="inline-separator" /> {issue.topic}</p>
            </header>

            {/* Strategic Tab Selector */}
            <div className="workspace-tabs">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={`workspace-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
              
              {sessionExists ? (
                <button 
                  onClick={() => setChatOpen(!chatOpen)} 
                  className={`ask-ai-toggle-btn ${chatOpen ? 'chat-open' : ''}`}
                >
                  <MessageSquare size={14} />
                  <span>{chatOpen ? 'Close Assistant' : 'Ask AI'}</span>
                </button>
              ) : (
                <button 
                  onClick={() => {
                    router.push(`/login?callbackUrl=${window.location.pathname}`);
                  }} 
                  className="ask-ai-toggle-btn locked-btn"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}
                >
                  <Lock size={14} />
                  <span>Ask AI</span>
                </button>
              )}
            </div>

            {/* Active Content Box */}
            <div className="workspace-panel">
              {activeTab === 'summary' && (
                <div className="tab-pane fade-in">
                  <div className="panel-header-badge">
                    <span className="badge-bullet"></span> BRIEF SUMMARY
                  </div>
                  <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {issue.cumulativeSummary || issue.backgroundNote || "No summary compiled."}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
              {activeTab === 'details' && (
                <div className="tab-pane fade-in">
                  <div className="panel-header-badge">
                    <span className="badge-bullet"></span> STRATEGIC INTELLIGENCE
                  </div>
                  {renderDetails()}
                </div>
              )}
              {activeTab === 'facts' && (
                <div className="tab-pane fade-in">
                  <div className="panel-header-badge">
                    <span className="badge-bullet"></span> CORE FACTS & DATA POINTS
                  </div>
                  {renderFacts()}
                </div>
              )}
              {activeTab === 'value_add' && (
                <div className="tab-pane fade-in">
                  <div className="panel-header-badge">
                    <span className="badge-bullet"></span> VALUE ADDITION MATERIAL
                  </div>
                  {renderValueAdd()}
                </div>
              )}
              {activeTab === 'case_studies' && (
                <div className="tab-pane fade-in">
                  <div className="panel-header-badge">
                    <span className="badge-bullet"></span> SPECIALIZED CASE STUDIES
                  </div>
                  {renderCaseStudies()}
                </div>
              )}
              {activeTab === 'questions' && (
                <div className="tab-pane fade-in">
                  <div className="panel-header-badge">
                    <span className="badge-bullet"></span> PRACTICE QUESTIONS & PYQ
                  </div>
                  {renderQuestions()}
                </div>
              )}
            </div>
          </div>
        </WorkspaceLayout>
      </div>

      <style jsx global>{`
        .study-container {
          min-height: 100vh;
          background: var(--bg-primary);
          color: var(--text-primary);
          padding: 80px 24px 80px;
          font-family: 'Outfit', sans-serif;
          position: relative;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 32px;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        :global(.breadcrumb-link) {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s;
        }

        :global(.breadcrumb-link:hover) {
          color: var(--text-primary);
        }

        .separator {
          color: var(--border-color);
        }

        .current {
          color: var(--text-secondary);
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 250px;
        }

        .workspace-container {
          display: flex;
          flex-direction: column;
          gap: 28px;
          font-family: 'Outfit', sans-serif;
        }

        /* Tabs Styles */
        .workspace-tabs {
          display: flex;
          gap: 8px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 4px;
          flex-wrap: wrap;
          align-items: center;
        }

        .workspace-tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          border-radius: 12px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .workspace-tab-btn:hover {
          color: var(--text-primary);
          background: var(--bg-hover);
        }

        .workspace-tab-btn.active {
          color: var(--color-emerald);
          background: rgba(16, 185, 129, 0.08);
        }

        .workspace-tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--color-emerald);
          border-radius: 99px;
        }

        .ask-ai-toggle-btn {
          margin-left: auto;
          background: rgba(16, 185, 129, 0.1);
          color: var(--color-emerald);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 12px;
          padding: 10px 20px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.25s ease;
        }

        .ask-ai-toggle-btn:hover {
          background: rgba(16, 185, 129, 0.2);
          color: var(--text-primary);
        }

        .ask-ai-toggle-btn.chat-open {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.2);
        }

        .ask-ai-toggle-btn.chat-open:hover {
          background: rgba(239, 68, 68, 0.2);
          color: var(--text-primary);
        }

        /* Workspace Panel */
        .workspace-panel {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 28px;
          padding: 36px;
          min-height: 400px;
          backdrop-filter: blur(16px);
        }

        .panel-header-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 1px;
          color: var(--color-emerald);
          border: 1px solid rgba(16, 185, 129, 0.2);
          padding: 6px 14px;
          border-radius: 99px;
          background: var(--bg-input);
          margin-bottom: 28px;
        }

        .badge-bullet {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-emerald);
        }

        .node-header {
          margin-bottom: 32px;
        }

        .header-tags {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }

        .gs-paper-tag {
          font-size: 0.65rem;
          font-weight: 900;
          color: var(--color-emerald);
          background: var(--bg-input);
          padding: 4px 10px;
          border-radius: 6px;
          letter-spacing: 0.05em;
        }

        .domain-tag {
          font-size: 0.65rem;
          font-weight: 900;
          color: var(--color-blue);
          background: var(--bg-input);
          padding: 4px 10px;
          border-radius: 6px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .node-title {
          font-size: 2.5rem;
          font-weight: 900;
          line-height: 1.2;
          letter-spacing: -0.03em;
          margin: 0 0 8px;
          color: var(--text-primary);
        }

        .node-path {
          font-size: 0.9rem;
          color: var(--text-secondary);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 0;
        }

        .inline-separator {
          color: var(--border-color);
        }

        .empty-text {
          color: var(--text-muted);
          font-style: italic;
          text-align: center;
          padding: 80px 0;
        }

        /* Markdown styling overrides */
        :global(.markdown-content) {
          color: var(--text-secondary);
          line-height: 1.8;
          font-size: 1.05rem;
        }

        :global(.markdown-content h1), :global(.markdown-content h2), :global(.markdown-content h3), :global(.markdown-content h4) {
          color: var(--text-primary);
          font-weight: 800;
          margin-top: 24px;
          margin-bottom: 12px;
        }

        :global(.markdown-content h1) { font-size: 1.6rem; }
        :global(.markdown-content h2) { font-size: 1.4rem; }
        :global(.markdown-content h3) { font-size: 1.2rem; }

        :global(.markdown-content p) {
          margin-bottom: 16px;
        }

        :global(.markdown-content ul), :global(.markdown-content ol) {
          margin-bottom: 20px;
          padding-left: 24px;
        }

        :global(.markdown-content li) {
          margin-bottom: 8px;
        }

        :global(.markdown-content strong) {
          color: var(--text-primary);
          font-weight: 700;
        }

        /* Mains object note sections styling */
        .mains-sections-stack {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .mains-note-section-block {
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 24px;
        }

        .mains-note-section-block:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .mains-section-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--color-emerald);
          margin: 0 0 14px;
          letter-spacing: -0.01em;
        }

        .mains-section-content {
          color: var(--text-secondary);
          line-height: 1.75;
          font-size: 1rem;
        }

        /* Facts Styling */
        .facts-stack {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .fact-card {
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 20px 24px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }

        .fact-icon {
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .fact-content {
          color: var(--text-secondary);
          line-height: 1.6;
          font-size: 0.98rem;
        }

        /* Value Add Styling */
        .value-adds-stack {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .value-add-card {
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          overflow: hidden;
        }

        .value-add-card-header {
          background: var(--bg-hover);
          padding: 14px 24px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid var(--border-color);
        }

        .value-add-card-header h4 {
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .value-add-card-body {
          padding: 24px;
          color: var(--text-secondary);
          line-height: 1.7;
          font-size: 0.98rem;
        }

        /* Questions Layout Styling */
        .questions-layout {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .questions-section-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 16px;
          border-left: 3px solid var(--color-emerald);
          padding-left: 12px;
        }

        .questions-box {
          background: var(--bg-input);
          border: 1px dashed var(--border-color);
          border-radius: 16px;
          padding: 24px;
          color: var(--text-secondary);
          line-height: 1.7;
        }

        .pyqs-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .pyq-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 20px 24px;
        }

        .pyq-card-header {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .pyq-paper {
          font-size: 0.65rem;
          font-weight: 800;
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.1);
          padding: 3px 8px;
          border-radius: 5px;
        }

        .pyq-year {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--text-secondary);
          background: var(--bg-input);
          padding: 3px 8px;
          border-radius: 5px;
        }

        .pyq-text {
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.5;
          margin: 0 0 12px;
        }

        .pyq-approach {
          font-size: 0.85rem;
          color: var(--text-secondary);
          background: var(--bg-input);
          padding: 10px 14px;
          border-radius: 8px;
        }

        /* Animations */
        .fade-in {
          animation: tabFadeIn 0.35s ease;
        }

        @keyframes tabFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 1024px) {
          .node-title {
            font-size: 2rem;
          }
        }

        @media (max-width: 768px) {
          .study-container {
            padding: 60px 16px 60px;
          }
          .workspace-panel {
            padding: 20px;
          }
          .workspace-tabs {
            gap: 4px;
          }
          .workspace-tab-btn {
            padding: 8px 12px;
            font-size: 0.8rem;
          }
          .ask-ai-toggle-btn {
            width: 100%;
            justify-content: center;
            margin-top: 10px;
          }
        }
      `}</style>
    </div>
  );
}

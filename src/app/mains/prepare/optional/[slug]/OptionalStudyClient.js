'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { 
  ChevronLeft, Search, BookOpen, History, Award, Focus, Sparkles, Cpu 
} from 'lucide-react';
import WorkspaceLayout from '@/components/WorkspaceLayout';
import SubjectChat from '@/components/content-portal/SubjectChat';

export default function OptionalStudyClient({ optional, contents = [], pyqs = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeLang = searchParams.get('lang') || 'en';
  const activeExam = searchParams.get('exam') || 'UPSC';

  const [activeTab, setActiveTab] = useState('notes'); // "notes" | "pyqs"
  const [selectedChunk, setSelectedChunk] = useState(contents[0] || null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleLangChange = (lang) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('lang', lang);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleExamChange = (exam) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('exam', exam);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Handle auto-selection reset when contents change (e.g. language/exam switches)
  useEffect(() => {
    if (contents.length > 0) {
      if (!selectedChunk || !contents.some(c => c.id === selectedChunk.id)) {
        setSelectedChunk(contents[0]);
      }
    } else {
      setSelectedChunk(null);
    }
  }, [contents]);

  // Handle auto-selection reset when active tab switches
  useEffect(() => {
    if (activeTab === 'notes' && contents.length > 0 && !selectedChunk) {
      setSelectedChunk(contents[0]);
    }
  }, [activeTab, contents, selectedChunk]);

  // Filter content chunks based on search
  const filteredChunks = contents.filter(chunk => {
    if (!searchTerm.trim()) return true;
    return (
      chunk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chunk.contentMarkdown.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Filter PYQs based on search
  const filteredPyqs = pyqs.filter(pyq => {
    if (!searchTerm.trim()) return true;
    return (
      pyq.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(pyq.year).includes(searchTerm)
    );
  });

  return (
    <div className="optional-workspace-container">
      {/* 1. Left Syllabus Console */}
      <aside className="optional-sidebar">
        <div className="sidebar-header">
          <Link href="/mains/prepare" className="back-link">
            <ChevronLeft size={16} />
            <span>Mains Prepare Hub</span>
          </Link>
          
          <div className="subject-meta">
            <span className="subject-pill">Optional Subject</span>
            <h1 className="subject-title">{optional.name}</h1>
            <p className="subject-desc">{optional.description || 'Neural syllabus workspace'}</p>
          </div>

          {/* Language & Exam Controls */}
          <div className="workspace-filters">
            <div className="filter-item">
              <span className="filter-lbl">Language</span>
              <div className="filter-buttons">
                <button 
                  onClick={() => handleLangChange('en')}
                  className={`filter-btn ${activeLang === 'en' ? 'active' : ''}`}
                >
                  English
                </button>
                <button 
                  onClick={() => handleLangChange('mr')}
                  className={`filter-btn ${activeLang === 'mr' ? 'active' : ''}`}
                >
                  मराठी
                </button>
              </div>
            </div>

            <div className="filter-item">
              <span className="filter-lbl">Exam</span>
              <div className="filter-buttons">
                <button 
                  onClick={() => handleExamChange('UPSC')}
                  className={`filter-btn ${activeExam === 'UPSC' ? 'active' : ''}`}
                >
                  UPSC
                </button>
                <button 
                  onClick={() => handleExamChange('MPSC')}
                  className={`filter-btn ${activeExam === 'MPSC' ? 'active' : ''}`}
                >
                  MPSC
                </button>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="search-wrapper">
            <Search size={14} className="search-icon" />
            <input 
              type="text" 
              placeholder={activeTab === 'notes' ? "Search curriculum note..." : "Search past questions..."} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="sidebar-tabs">
          <button 
            className={`tab-toggle-btn ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => { setActiveTab('notes'); }}
          >
            <BookOpen size={14} />
            <span>Curriculum Chunks</span>
          </button>
          <button 
            className={`tab-toggle-btn ${activeTab === 'pyqs' ? 'active' : ''}`}
            onClick={() => { setActiveTab('pyqs'); }}
          >
            <History size={14} />
            <span>Mains Archive</span>
          </button>
        </div>

        {/* Scrollable list content */}
        <div className="sidebar-list">
          {activeTab === 'notes' ? (
            filteredChunks.length > 0 ? (
              filteredChunks.map(chunk => {
                const isSelected = selectedChunk?.id === chunk.id;
                return (
                  <button 
                    key={chunk.id}
                    onClick={() => setSelectedChunk(chunk)}
                    className={`list-item ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="item-indicator"></div>
                    <div className="item-details">
                      <h4 className="item-title">{chunk.title}</h4>
                      {chunk.sourceUrl && <span className="item-source">Source: {chunk.sourceUrl}</span>}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="empty-list-state">
                <p>No notes chunks match search query</p>
              </div>
            )
          ) : (
            filteredPyqs.length > 0 ? (
              filteredPyqs.map(pyq => {
                return (
                  <div key={pyq.id} className="pyq-list-card">
                    <div className="pyq-card-header">
                      <span className="pyq-year">{pyq.year}</span>
                      <span className="pyq-paper">{pyq.paper}</span>
                      {pyq.marks && <span className="pyq-marks">{pyq.marks}M</span>}
                    </div>
                    <p className="pyq-card-text">{pyq.questionText}</p>
                  </div>
                );
              })
            ) : (
              <div className="empty-list-state">
                <p>No past questions match search query</p>
              </div>
            )
          )}
        </div>
      </aside>

      {/* 2. Right Workspace Grid (Center Study Desk + Right RAG Panel) */}
      <div className="workspace-main-wrapper">
        <WorkspaceLayout
          themeColor="emerald"
          sidebarContent={
            <div className="optional-rag-card">
              <SubjectChat 
                subjectId={optional.id}
                displayName={optional.name}
                examType="MAINS"
                optionalSlug={optional.slug}
              />
            </div>
          }
        >
          {/* Study Desk Content */}
          <div className="study-desk-container">
            {activeTab === 'notes' ? (
              selectedChunk ? (
                <article className="document-view fade-in">
                  <header className="doc-header">
                    <span className="doc-meta-tag">
                      <Cpu size={12} />
                      <span>Vector Segment</span>
                    </span>
                    <h1 className="doc-title">{selectedChunk.title}</h1>
                    {selectedChunk.sourceUrl && (
                      <div className="doc-citation">
                        <span>Academic Reference: <strong>{selectedChunk.sourceUrl}</strong></span>
                      </div>
                    )}
                  </header>

                  <section className="doc-body markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {selectedChunk.contentMarkdown}
                    </ReactMarkdown>
                  </section>
                </article>
              ) : (
                <div className="desk-empty-state">
                  <Focus size={48} className="empty-icon" />
                  <h3>No segment selected</h3>
                  <p>Select a syllabus chunk from the left console to start studying.</p>
                </div>
              )
            ) : (
              <div className="pyq-overview-view fade-in">
                <header className="doc-header">
                  <span className="doc-meta-tag">
                    <History size={12} />
                    <span>UPSC CSE Mains</span>
                  </span>
                  <h1 className="doc-title">{optional.name} Exam Archive</h1>
                  <p className="doc-subtitle">Syllabus-linked questions from previous UPSC Civil Services examination papers.</p>
                </header>

                <div className="pyq-board-grid">
                  {pyqs.length > 0 ? (
                    pyqs.map((pyq, idx) => (
                      <div key={pyq.id} className="pyq-board-card">
                        <div className="pyq-board-header">
                          <span className="pyq-index">Question {idx + 1}</span>
                          <div className="pyq-tags">
                            <span className="tag-year">{pyq.year}</span>
                            <span className="tag-paper">{pyq.paper}</span>
                            {pyq.marks && <span className="tag-marks">{pyq.marks} Marks</span>}
                          </div>
                        </div>
                        <p className="pyq-board-text">{pyq.questionText}</p>
                        {pyq.modelAnswer && (
                          <div className="pyq-board-answer">
                            <h5>Study Guidance / Answer Structure:</h5>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{pyq.modelAnswer}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="desk-empty-state" style={{ gridColumn: 'span 2' }}>
                      <Focus size={48} className="empty-icon" />
                      <h3>No PYQs indexed</h3>
                      <p>No previous year questions have been indexed for this optional subject yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </WorkspaceLayout>
      </div>

      <style jsx global>{`
        .optional-workspace-container {
          min-height: 100vh;
          display: flex;
          background: var(--bg-primary);
          color: var(--text-primary);
          font-family: 'Outfit', sans-serif;
          padding-top: 80px;
        }

        /* Left Console Sidebar */
        .optional-sidebar {
          width: 340px;
          background: var(--bg-card);
          border-right: 1px solid var(--border-color);
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          backdrop-filter: blur(20px);
          position: fixed;
          top: 80px;
          bottom: 0;
          left: 0;
          overflow-y: auto;
          z-index: 40;
        }

        .subject-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }

        .subject-pill {
          align-self: flex-start;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 3px 10px;
          border-radius: 6px;
          background: rgba(16, 185, 129, 0.1);
          color: var(--color-emerald);
          border: 1px solid rgba(16, 185, 129, 0.15);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .subject-title {
          font-size: 1.6rem;
          font-weight: 900;
          margin: 0;
          letter-spacing: -0.02em;
          line-height: 1.2;
          color: var(--text-primary);
        }

        .subject-desc {
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.4;
          margin: 0;
        }

        /* Workspace Filters (Lang & Exam) */
        .workspace-filters {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          margin-bottom: 8px;
        }

        .filter-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .filter-lbl {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .filter-buttons {
          display: flex;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 2px;
        }

        .filter-btn {
          padding: 4px 10px;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 6px;
          background: transparent;
          color: var(--text-secondary);
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-btn:hover {
          color: var(--text-primary);
        }

        .filter-btn.active {
          background: var(--bg-card);
          color: var(--text-primary);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        /* Sidebar Tabs Toggle */
        .sidebar-tabs {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          background: var(--bg-input);
          padding: 4px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }

        .tab-toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 10px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .tab-toggle-btn.active {
          color: var(--text-primary);
          background: var(--bg-card);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        }

        /* Sidebar list contents */
        .sidebar-list {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
          overflow-y: auto;
          padding-right: 2px;
        }

        .list-item {
          display: flex;
          text-align: left;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 12px 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .list-item:hover {
          background: var(--bg-hover);
          border-color: var(--border-hover);
        }

        .list-item.selected {
          background: var(--bg-hover);
          border-color: var(--border-hover);
          box-shadow: inset 1px 0 0 rgba(255, 255, 255, 0.02);
        }

        .item-indicator {
          position: absolute;
          left: 0;
          top: 12px;
          bottom: 12px;
          width: 3px;
          border-radius: 0 4px 4px 0;
          background: transparent;
          transition: background 0.2s;
        }

        .list-item.selected .item-indicator {
          background: var(--color-emerald);
        }

        .item-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .item-title {
          font-size: 0.88rem;
          font-weight: 700;
          margin: 0;
          color: var(--text-primary);
          line-height: 1.4;
        }

        .item-source {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        /* PYQ mini cards on sidebar */
        .pyq-list-card {
          background: rgba(255,255,255,0.01);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 12px 14px;
        }

        .pyq-card-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
        }

        .pyq-year {
          font-size: 0.7rem;
          font-weight: 900;
          color: var(--color-emerald);
          background: rgba(16, 185, 129, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .pyq-paper {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--text-muted);
        }

        .pyq-marks {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--color-blue);
          margin-left: auto;
        }

        .pyq-card-text {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.45;
        }

        .empty-list-state {
          text-align: center;
          padding: 40px 10px;
          color: var(--text-muted);
          font-size: 0.82rem;
          font-style: italic;
        }

        /* Right split pane wrapper */
        .workspace-main-wrapper {
          margin-left: 340px;
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          padding: 32px 40px;
        }

        /* Study desk layout inside WorkspaceLayout children */
        .study-desk-container {
          width: 100%;
          min-height: calc(100vh - 160px);
          min-width: 0;
        }

        .optional-rag-card {
          background: rgba(15, 23, 42, 0.35);
          border: 1px solid var(--border-color);
          border-radius: 24px;
          overflow: hidden;
          backdrop-filter: blur(16px);
          height: calc(100vh - 164px);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 112px;
        }

        /* Document details rendering panel */
        .document-view {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 24px;
          padding: 36px;
          backdrop-filter: blur(16px);
          box-shadow: 0 4px 30px rgba(0,0,0,0.15);
        }

        .doc-header {
          margin-bottom: 28px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 24px;
        }

        .doc-meta-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          font-weight: 800;
          color: var(--color-emerald);
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.15);
          padding: 4px 12px;
          border-radius: 20px;
          margin-bottom: 16px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .doc-title {
          font-size: 2.2rem;
          font-weight: 900;
          line-height: 1.25;
          letter-spacing: -0.02em;
          margin: 0 0 12px;
          color: var(--text-primary);
        }

        .doc-citation {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .doc-citation strong {
          color: var(--text-primary);
        }

        .doc-body {
          color: var(--text-secondary);
          line-height: 1.8;
          font-size: 1.05rem;
        }

        /* PYQ full list board views */
        .pyq-overview-view {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .doc-subtitle {
          font-size: 1rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.5;
        }

        .pyq-board-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }

        .pyq-board-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 28px;
          backdrop-filter: blur(16px);
        }

        .pyq-board-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .pyq-index {
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }

        .pyq-tags {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tag-year {
          font-size: 0.72rem;
          font-weight: 900;
          color: var(--color-emerald);
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.15);
          padding: 3px 8px;
          border-radius: 6px;
        }

        .tag-paper {
          font-size: 0.72rem;
          font-weight: 800;
          color: var(--text-muted);
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border-color);
          padding: 3px 8px;
          border-radius: 6px;
        }

        .tag-marks {
          font-size: 0.72rem;
          font-weight: 900;
          color: var(--color-blue);
          background: rgba(59, 130, 246, 0.08);
          border: 1px solid rgba(59, 130, 246, 0.15);
          padding: 3px 8px;
          border-radius: 6px;
        }

        .pyq-board-text {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.5;
          margin: 0;
        }

        .pyq-board-answer {
          margin-top: 20px;
          padding-top: 18px;
          border-top: 1px solid var(--border-color);
        }

        .pyq-board-answer h5 {
          font-size: 0.82rem;
          font-weight: 800;
          color: var(--color-emerald);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 0 10px;
        }

        .desk-empty-state {
          text-align: center;
          padding: 80px 40px;
          color: var(--text-muted);
          border: 1px dashed var(--border-color);
          border-radius: 24px;
          background: var(--bg-input);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .desk-empty-state .empty-icon {
          opacity: 0.3;
        }

        .desk-empty-state h3 {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
        }

        .desk-empty-state p {
          font-size: 0.9rem;
          max-width: 320px;
          margin: 0;
          line-height: 1.5;
        }

        /* Animations */
        .fade-in {
          animation: fadeInEffect 0.35s ease-out;
        }

        @keyframes fadeInEffect {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 1024px) {
          .optional-sidebar { width: 300px; }
          .workspace-main-wrapper { margin-left: 300px; padding: 24px 20px; }
          .doc-title { font-size: 1.8rem; }
        }

        @media (max-width: 768px) {
          .optional-workspace-container { flex-direction: column; padding-top: 60px; }
          .optional-sidebar { position: relative; width: 100%; height: auto; top: 0; border-right: none; border-bottom: 1px solid var(--border-color); padding: 20px 16px; }
          .workspace-main-wrapper { margin-left: 0; padding: 20px 16px; }
        }
      `}</style>
    </div>
  );
}

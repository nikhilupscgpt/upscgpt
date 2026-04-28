"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, Calendar, ExternalLink, Sparkles, AlertCircle, Clock, Menu, X, Filter } from 'lucide-react';
import IssueControls from '@/components/user/IssueControls';
import MasteryPath from '@/components/user/MasteryPath';
import { Toaster } from 'react-hot-toast';

export default function IssueDashboard() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIssueSlug, setActiveIssueSlug] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Detail View State
  const [activeIssueData, setActiveIssueData] = useState(null);
  const [userContext, setUserContext] = useState({ followed: false, progress: { status: 'UNSTARTED' } });
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  
  const domains = [
    'ALL', 'POLITY', 'ECONOMY', 'IR', 
    'ENVIRONMENT', 'S&T', 'SOCIETY', 'GEOGRAPHY'
  ];

  // Date Strip Logic
  const [selectedDate, setSelectedDate] = useState(''); 
  const dateInputRef = useRef(null);

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = -7; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };
  const weekDates = generateDates();

  // Fetch list
  useEffect(() => {
    async function fetchIssues() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedDomain !== 'ALL') {
           const fullDom = selectedDomain === 'IR' ? 'INTERNATIONAL_RELATIONS' : selectedDomain === 'S&T' ? 'SCIENCE_TECHNOLOGY' : selectedDomain;
           params.set('domain', fullDom);
        }
        if (searchTerm) params.set('search', searchTerm);
        if (selectedDate) params.set('date', selectedDate);

        const res = await fetch(`/api/issues?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setIssues(data.issues || []);
        }
      } catch (err) {
        console.error("Failed to fetch issues:", err);
      } finally {
        setLoading(false);
      }
    }
    
    const timer = setTimeout(() => { fetchIssues(); }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedDomain, selectedDate]);

  // Fetch details
  useEffect(() => {
    if (!activeIssueSlug) {
      setActiveIssueData(null);
      return;
    }

    async function fetchIssueDetail() {
      setLoadingDetail(true);
      try {
        const res = await fetch(`/api/issues/${activeIssueSlug}`);
        const data = await res.json();
        if (data.success) {
          setActiveIssueData(data.issue);
          setUserContext(data.userContext || { followed: false, progress: { status: 'UNSTARTED' } });
          if (window.innerWidth < 768) setMobileSidebarOpen(false);
        }
      } catch (err) {
        console.error("Network error fetching detail:", err);
      } finally {
        setLoadingDetail(false);
      }
    }
    
    fetchIssueDetail();
  }, [activeIssueSlug]);

  const dateCardStyle = (isActive) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.2rem 0.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    background: isActive ? '#f59e0b' : 'transparent',
    color: isActive ? '#0f172a' : '#64748b',
    border: isActive ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.04)',
    transition: 'all 0.2s',
  });

  return (
    <div className="hub-container">
      <Toaster position="bottom-right" />
      
      {/* HEADER */}
      <header className="hub-header">
        <div className="header-brand">
          <button className="mobile-menu-toggle" onClick={() => setMobileSidebarOpen(true)}>
            <Menu size={20} />
            <span style={{ fontSize: '0.65rem', fontWeight: 900 }}>MENU</span>
          </button>
          <div>
            <h1>Intelligence Hub</h1>
            <p className="subtitle">Real-time Synthesis • <span className="ai-badge">Gemma 4</span></p>
          </div>
        </div>

        <div className="header-actions">
          {/* DESKTOP SEARCH */}
          <div className="search-wrapper">
            <Search size={14} className="search-icon" />
            <input
              placeholder="Search issues..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="divider" />

          {/* DESKTOP DATE STRIP */}
          <div className="date-strip hide-scrollbar">
            {weekDates.map(dateStr => {
              const d = new Date(dateStr);
              const isActive = selectedDate === dateStr;
              return (
                <div key={dateStr} onClick={() => setSelectedDate(isActive ? '' : dateStr)} style={dateCardStyle(isActive)}>
                  <span className="day-name">{d.toLocaleDateString([], { weekday: 'short' }).toUpperCase()}</span>
                  <span className="day-num">{d.toLocaleDateString([], { day: '2-digit' })}</span>
                </div>
              );
            })}
            <button className="date-picker-btn" onClick={() => dateInputRef.current?.showPicker()}>
               <Calendar size={14} />
            </button>
          </div>

          <div className="divider" />

          {/* DESKTOP DOMAINS */}
          <div className="domain-filters hide-scrollbar">
            {domains.map(dom => (
              <button 
                key={dom}
                className={`domain-chip ${selectedDomain === dom ? 'active' : ''}`}
                onClick={() => setSelectedDomain(dom)}
              >
                {dom}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="hub-content">
        
        {/* SIDEBAR / DRAWER */}
        <aside className={`hub-sidebar ${mobileSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <span className="sidebar-title">STRATEGIC COMMAND</span>
            <button className="sidebar-close" onClick={() => setMobileSidebarOpen(false)}><X size={20} /></button>
          </div>

          {/* MOBILE CONTROLS (VISIBLE ONLY ON MOBILE) */}
          <div className="mobile-only-controls">
            <div className="control-group">
               <label><Search size={12} /> SEARCH BRIEFINGS</label>
               <input 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Type to filter..." 
               />
            </div>

            <div className="control-group">
               <label><Calendar size={12} /> SELECT DATE</label>
                <div className="mobile-date-row hide-scrollbar">
                   {weekDates.map(dateStr => {
                     const d = new Date(dateStr);
                     const isActive = selectedDate === dateStr;
                     return (
                       <div key={dateStr} onClick={() => setSelectedDate(isActive ? '' : dateStr)} style={{...dateCardStyle(isActive), minWidth: '45px'}}>
                         <span className="day-name">{d.toLocaleDateString([], { weekday: 'short' }).toUpperCase()}</span>
                         <span className="day-num">{d.toLocaleDateString([], { day: '2-digit' })}</span>
                       </div>
                     );
                   })}
                   <button className="date-picker-btn" onClick={() => dateInputRef.current?.showPicker()} style={{ minWidth: '45px', height: '38px' }}>
                     <Calendar size={14} />
                   </button>
                </div>
            </div>

            <div className="control-group">
               <label><Filter size={12} /> DOMAIN ANALYSIS</label>
               <div className="mobile-domain-row hide-scrollbar">
                  {domains.map(dom => (
                    <button 
                      key={dom}
                      className={`domain-chip ${selectedDomain === dom ? 'active' : ''}`}
                      onClick={() => setSelectedDomain(dom)}
                    >
                      {dom}
                    </button>
                  ))}
               </div>
            </div>
            <div className="control-divider" />
          </div>
          
          <div className="sidebar-list hide-scrollbar">
            <div className="list-count">AVAILABLE BRIEFINGS ({issues.length})</div>
            {issues.map(issue => (
              <div 
                key={issue.id} 
                className={`sidebar-item ${activeIssueSlug === issue.slug ? 'active' : ''}`}
                onClick={() => setActiveIssueSlug(issue.slug)}
              >
                <div className="item-meta">
                  <span className="item-domain">{issue.domain}</span>
                  <span className="item-date">{new Date(issue.lastUpdatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="item-title">{issue.title}</div>
              </div>
            ))}
            {issues.length === 0 && <div className="no-results">No briefings found for this criteria.</div>}
          </div>
        </aside>

        {/* MAIN CANVAS */}
        <main className="hub-main">
          {/* HIDDEN DATE INPUT FOR PICKER */}
          <input type="date" ref={dateInputRef} style={{ display: 'none' }} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />

          {loadingDetail ? (
            <div className="loading-state">SYNTHESIZING INTELLIGENCE...</div>
          ) : activeIssueData ? (
            <article className="issue-detail">
              <header className="detail-header">
                 <div className="detail-meta">
                    <span className="detail-domain-tag">{activeIssueData.domain}</span>
                    {activeIssueData.gsPapers.map(gs => (
                      <span key={gs} className="gs-tag">{gs}</span>
                    ))}
                 </div>
                 <h2 className="detail-title">{activeIssueData.title}</h2>
                 <p className="detail-topic">{activeIssueData.topic}</p>
                 
                 <IssueControls issueId={activeIssueData.id} initialData={userContext} />
              </header>

              <MasteryPath 
                issueId={activeIssueData.id} 
                progress={userContext.progress} 
                testPackId={activeIssueData.testPackId}
              />

              <section className="summary-section">
                <h3><Sparkles size={16} /> STRATEGIC SUMMARY</h3>
                <div className="summary-card">
                  {activeIssueData.cumulativeSummary ? (
                    <div dangerouslySetInnerHTML={{ __html: activeIssueData.cumulativeSummary.replace(/\n/g, '<br />') }} />
                  ) : (
                    <div className="pending-msg">AI compilation pending...</div>
                  )}
                </div>
              </section>

              <section className="thread-section">
                <h3><Calendar size={16} /> CHRONOLOGICAL THREAD</h3>
                <div className="thread-list">
                  {[...(activeIssueData.articles || []), ...(activeIssueData.editorials || [])]
                    .sort((a,b) => new Date(b.publishedAt) - new Date(a.publishedAt))
                    .map(item => (
                    <div key={item.id} className="thread-item">
                      <div className="thread-item-header">
                        <span className="item-source">{item.source || 'Intelligence'}</span>
                        <span className="item-date">{new Date(item.publishedAt).toLocaleDateString()}</span>
                      </div>
                      <h4>{item.title}</h4>
                      {item.structuredData?.crux && <p className="item-crux">{item.structuredData.crux}</p>}
                    </div>
                  ))}
                </div>
              </section>
            </article>
          ) : (
            <div className="empty-state">
              <Sparkles size={40} style={{ color: '#10b981', marginBottom: '1.5rem', opacity: 0.5 }} />
              <h3>Select a briefing from the grid to begin synthesis.</h3>
              <p>On mobile, use the top-left menu to access filters and briefing lists.</p>
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        .hub-container {
          height: 100vh; display: flex; flex-direction: column;
          background: #020617; color: white; overflow: hidden; font-family: 'Outfit', sans-serif;
        }

        /* HEADER */
        .hub-header {
          padding: 0.75rem 1.5rem; background: #0a0a0f; border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; gap: 2rem; z-index: 100;
        }
        .header-brand { display: flex; align-items: center; gap: 1rem; }
        .header-brand h1 { font-size: 1.1rem; font-weight: 900; margin: 0; }
        .subtitle { font-size: 0.65rem; color: #475569; margin: 0; }
        .ai-badge { color: #10b981; }

        .mobile-menu-toggle {
          display: none; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);
          color: white; padding: 6px 10px; border-radius: 8px; align-items: center; gap: 6px;
        }

        .header-actions { flex: 1; display: flex; align-items: center; gap: 1.5rem; justify-content: flex-end; }
        .search-wrapper { position: relative; width: 220px; }
        .search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #64748b; }
        .search-wrapper input {
          width: 100%; padding: 8px 12px 8px 32px; border-radius: 8px;
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08);
          color: white; font-size: 0.75rem; outline: none;
        }
        .divider { width: 1px; height: 24px; background: rgba(255,255,255,0.05); }

        .date-strip { display: flex; gap: 0.4rem; overflow-x: auto; flex-shrink: 0; }
        .day-name { font-size: 0.5rem; font-weight: 800; opacity: 0.5; }
        .day-num { font-size: 0.8rem; font-weight: 900; }
        .date-picker-btn { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); color: #64748b; padding: 6px; border-radius: 6px; cursor: pointer; }

        .domain-filters { display: flex; gap: 0.4rem; overflow-x: auto; }
        .domain-chip {
          padding: 4px 10px; border-radius: 6px; border: none; background: transparent;
          color: #64748b; font-size: 0.65rem; font-weight: 900; cursor: pointer; white-space: nowrap; transition: all 0.2s;
        }
        .domain-chip.active { background: rgba(16, 185, 129, 0.1); color: #10b981; }

        /* SIDEBAR / DRAWER */
        .hub-content { display: flex; flex: 1; overflow: hidden; }
        .hub-sidebar {
          width: 340px; background: #0a0a0f; border-right: 1px solid rgba(255,255,255,0.05);
          display: flex; flex-direction: column; transition: all 0.3s ease;
        }
        .sidebar-header {
          padding: 1rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.04);
          display: flex; justify-content: space-between; align-items: center;
        }
        .sidebar-title { font-size: 0.65rem; font-weight: 900; color: #64748b; letter-spacing: 1.5px; }
        .sidebar-close { display: none; background: transparent; border: none; color: #64748b; cursor: pointer; }
        
        .mobile-only-controls { display: none; padding: 1.5rem; flex-direction: column; gap: 1.25rem; }
        .control-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .control-group label { font-size: 0.6rem; font-weight: 900; color: #475569; display: flex; align-items: center; gap: 6px; text-transform: uppercase; }
        .control-group input { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 10px; border-radius: 8px; color: white; font-size: 0.85rem; outline: none; }
        .mobile-date-row, .mobile-domain-row { display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 4px; }
        .control-divider { height: 1px; background: rgba(255,255,255,0.04); margin-top: 0.5rem; }

        .sidebar-list { flex: 1; overflow-y: auto; padding: 0.5rem; }
        .list-count { font-size: 0.6rem; font-weight: 900; color: #334155; padding: 0.5rem 1rem; }
        .sidebar-item {
          padding: 1rem; margin: 4px; border-radius: 12px; cursor: pointer;
          border: 1px solid rgba(255,255,255,0.03); background: rgba(255,255,255,0.01); transition: all 0.2s;
        }
        .sidebar-item:hover { background: rgba(255,255,255,0.03); }
        .sidebar-item.active { background: rgba(16, 185, 129, 0.05); border-color: rgba(16, 185, 129, 0.2); }
        .item-meta { display: flex; justify-content: space-between; margin-bottom: 0.4rem; }
        .item-domain { font-size: 0.55rem; font-weight: 900; color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 2px 6px; border-radius: 4px; }
        .item-date { font-size: 0.65rem; color: #475569; }
        .item-title { font-size: 0.85rem; font-weight: 700; color: #cbd5e1; line-height: 1.4; }
        .no-results { padding: 2rem; text-align: center; color: #475569; font-size: 0.8rem; }

        /* MAIN CONTENT */
        .hub-main { flex: 1; overflow-y: auto; padding: 2rem; background: #020617; }
        .loading-state { height: 100%; display: flex; align-items: center; justify-content: center; color: #475569; font-size: 0.8rem; font-weight: 900; letter-spacing: 1px; }
        .empty-state { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: #475569; }
        .empty-state h3 { color: white; font-size: 1.25rem; margin-bottom: 0.5rem; }
        .empty-state p { font-size: 0.85rem; }

        .detail-header { margin-bottom: 2rem; }
        .detail-meta { display: flex; gap: 0.75rem; align-items: center; margin-bottom: 1rem; }
        .detail-domain-tag { font-size: 0.65rem; font-weight: 900; color: #a78bfa; background: rgba(139, 92, 246, 0.1); padding: 4px 8px; border-radius: 4px; }
        .gs-tag { font-size: 0.65rem; font-weight: 900; color: #3b82f6; background: rgba(59, 130, 246, 0.1); padding: 4px 8px; border-radius: 4px; }
        .detail-title { font-size: 2rem; font-weight: 900; margin-bottom: 0.5rem; line-height: 1.2; letter-spacing: -0.02em; }
        .detail-topic { color: #94a3b8; font-size: 1rem; margin-bottom: 1.5rem; }

        .summary-card { background: rgba(16, 185, 129, 0.02); border: 1px solid rgba(16, 185, 129, 0.1); border-radius: 16px; padding: 1.5rem; line-height: 1.7; color: #cbd5e1; }
        .thread-item { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 1.5rem; margin-bottom: 1rem; }
        .item-source { font-size: 0.65rem; font-weight: 900; color: #3b82f6; text-transform: uppercase; }

        .hide-scrollbar::-webkit-scrollbar { display: none; }

        @media (max-width: 768px) {
          .mobile-menu-toggle { display: flex; }
          .header-actions { display: none; }
          .hub-header { justify-content: space-between; padding: 0.5rem 1rem; }
          
          .hub-sidebar {
            position: fixed; top: 0; left: 0; bottom: 0; z-index: 1000;
            width: 90%; transform: translateX(-100%); background: #050507;
          }
          .hub-sidebar.open { transform: translateX(0); box-shadow: 20px 0 60px rgba(0,0,0,0.8); }
          .sidebar-close { display: block; }
          .mobile-only-controls { display: flex; }

          .hub-main { padding: 1rem; }
          .detail-title { font-size: 1.5rem; }
          .summary-card, .thread-item { padding: 1.25rem; font-size: 0.9rem; }
        }
      `}</style>
    </div>
  );
}

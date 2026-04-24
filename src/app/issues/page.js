"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, Calendar, ExternalLink, Sparkles, AlertCircle, Clock } from 'lucide-react';

export default function IssueDashboard() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIssueSlug, setActiveIssueSlug] = useState(null);
  
  // Detail View State
  const [activeIssueData, setActiveIssueData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  
  const domains = [
    'ALL', 'POLITY', 'ECONOMY', 'INTERNATIONAL_RELATIONS', 
    'ENVIRONMENT', 'SCIENCE_TECHNOLOGY', 'SOCIETY', 'GEOGRAPHY'
  ];

  // Date Strip Logic
  const [selectedDate, setSelectedDate] = useState(''); // Empty means all dates
  const dateInputRef = useRef(null);

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };
  const weekDates = generateDates();
  const isDateInCurrentWeek = weekDates.includes(selectedDate);

  // Fetch the list of issues for the sidebar
  useEffect(() => {
    async function fetchIssues() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedDomain !== 'ALL') params.set('domain', selectedDomain);
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

  // Fetch details for the selected issue
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
        } else {
          console.error(data.error);
        }
      } catch (err) {
        console.error("Network error fetching detail:", err);
      } finally {
        setLoadingDetail(false);
      }
    }
    
    fetchIssueDetail();
  }, [activeIssueSlug]);

  // --- STYLING HELPERS (Matching legacy /news UI) ---
  const filterChipStyle = (isActive) => ({
    padding: '0.35rem 0.8rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '0.65rem',
    fontWeight: 900,
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
    color: isActive ? '#10b981' : '#64748b',
    boxShadow: isActive ? 'inset 0 0 0 1px rgba(16, 185, 129, 0.4)' : 'none'
  });

  const dateCardStyle = (isActive) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.3rem 0.6rem',
    borderRadius: '8px',
    cursor: 'pointer',
    background: isActive ? '#f59e0b' : 'transparent',
    color: isActive ? '#0f172a' : '#64748b',
    border: isActive ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.04)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  });

  const sidebarStyle = {
    width: '360px',
    background: '#0f172a',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  };

  const sidebarItemStyle = (isActive) => ({
    padding: '1.1rem',
    margin: '0.5rem 1rem',
    borderRadius: '12px',
    border: isActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.05)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: isActive ? 'rgba(16, 185, 129, 0.05)' : 'rgba(30, 41, 59, 0.4)',
    boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
  });

  const miniTagStyle = {
    fontSize: '0.6rem',
    fontWeight: 900,
    letterSpacing: '0.05em',
    padding: '2px 6px',
    borderRadius: '4px',
    background: 'rgba(255,255,255,0.1)',
    color: '#94a3b8'
  };

  const sectionHeaderStyle = (type) => ({
    fontSize: '0.8rem',
    fontWeight: 900,
    letterSpacing: '2px',
    color: type === 'PRELIMS' ? '#60a5fa' : '#818cf8',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      {/* COMPACT STRATEGIC HEADER */}
      <header style={{ padding: '0.75rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0a0a0f', display: 'grid', gridTemplateColumns: 'minmax(250px, 1.2fr) 3fr', alignItems: 'center', gap: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', letterSpacing: '-0.5px', marginBottom: '0.1rem' }}>Strategic Intelligence Hub</h1>
          <p style={{ color: '#475569', fontSize: '0.7rem', fontWeight: 700 }}>Real-time Synthesis • <strong style={{ color: '#10b981' }}>Gemma 4</strong></p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', justifyContent: 'flex-end' }}>
          
          {/* SEARCH BAR */}
          <div style={{ position: 'relative', flex: '0 1 250px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              placeholder="Search issues..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ 
                width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', 
                border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)',
                color: 'white', fontSize: '0.8rem' 
              }}
            />
          </div>

          <div style={{ height: '30px', width: '1px', background: 'rgba(255,255,255,0.05)' }} />

          {/* COMPACT DATE STRIP (AMBER) */}
          <div className="hide-scrollbar" style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', overflowX: 'auto', paddingBottom: '2px' }}>
            {selectedDate && (
              <button 
                onClick={() => setSelectedDate('')}
                style={{ fontSize: '0.6rem', fontWeight: 900, color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem' }}
              >
                CLEAR
              </button>
            )}
            <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#475569', letterSpacing: '1px', marginRight: '0.5rem' }}>WEEK</span>
            {weekDates.map(dateStr => {
              const d = new Date(dateStr);
              const isActive = selectedDate === dateStr;
              return (
                <div 
                  key={dateStr} 
                  onClick={() => setSelectedDate(isActive ? '' : dateStr)}
                  style={dateCardStyle(isActive)}
                >
                  <span style={{ fontSize: '0.55rem', fontWeight: 800, opacity: 0.5 }}>{d.toLocaleDateString([], { weekday: 'short' }).toUpperCase()}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 900 }}>{d.toLocaleDateString([], { day: '2-digit' })}</span>
                </div>
              );
            })}

            {/* HISTORICAL DATE PICKER */}
            <div style={{ height: '30px', width: '1px', background: 'rgba(255,255,255,0.05)', margin: '0 0.5rem' }} />
            
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {!isDateInCurrentWeek && selectedDate && (
                <div style={{ background: '#f59e0b', color: '#0f172a', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 900 }}>
                  {new Date(selectedDate).toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' })}
                </div>
              )}
              
              <button 
                onClick={() => dateInputRef.current?.showPicker()}
                style={{ ...dateCardStyle(false), width: '32px', background: (!isDateInCurrentWeek && selectedDate) ? '#f59e0b' : 'rgba(255,255,255,0.02)', color: (!isDateInCurrentWeek && selectedDate) ? '#0f172a' : '#64748b' }}
                title="Historical Intelligence"
              >
                <Calendar size={14} />
              </button>
              
              <input 
                type="date" 
                ref={dateInputRef}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0, padding: 0 }}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          <div style={{ height: '30px', width: '1px', background: 'rgba(255,255,255,0.05)' }} />

          {/* DOMAIN FILTERS (EMERALD) */}
          <div className="hide-scrollbar" style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.01)', padding: '0.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)', overflowX: 'auto', maxWidth: '300px' }}>
            {domains.map(dom => (
              <button 
                key={dom}
                onClick={() => setSelectedDomain(dom)}
                style={filterChipStyle(selectedDomain === dom)}
              >
                {dom === 'INTERNATIONAL_RELATIONS' ? 'IR' : dom === 'SCIENCE_TECHNOLOGY' ? 'S&T' : dom}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="dashboard-container" style={{ display: 'flex', flex: 1, height: 'calc(100vh - 65px)', overflow: 'hidden' }}>
        
        {/* LEFT SIDEBAR: ISSUES GRID */}
        <aside style={sidebarStyle}>
          <div style={{ padding: '1.25rem 1.5rem', fontSize: '0.7rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.04)', marginBottom: '0.5rem' }}>
            Briefings Grid ({issues.length})
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '2rem' }}>
            {loading ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#475569', fontSize: '0.85rem', fontWeight: 700 }}>
                LOADING GRID...
              </div>
            ) : issues.length > 0 ? issues.map(issue => (
              <div 
                key={issue.id} 
                onClick={() => setActiveIssueSlug(issue.slug)}
                style={sidebarItemStyle(activeIssueSlug === issue.slug)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <span style={{ ...miniTagStyle, color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>{issue.domain}</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {issue._count.articles > 0 && <span style={{ fontSize: '0.65rem', color: '#60a5fa', fontWeight: 700 }}>{issue._count.articles}A</span>}
                    {issue._count.editorials > 0 && <span style={{ fontSize: '0.65rem', color: '#f472b6', fontWeight: 700 }}>{issue._count.editorials}E</span>}
                  </div>
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: activeIssueSlug === issue.slug ? 'white' : '#cbd5e1', lineHeight: 1.4 }}>
                  {issue.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={10} /> {new Date(issue.lastUpdatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </div>
              </div>
            )) : (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#475569', fontSize: '0.85rem', fontWeight: 700 }}>
                NO ISSUES FOUND.
              </div>
            )}
          </div>
        </aside>

        {/* MAIN CANVAS: INSIGHTS & ANALYSIS */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '2.5rem', background: '#0f172a' }}>
          
          {!activeIssueSlug ? (
            // DEFAULT DASHBOARD VIEW
            <div style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Strategic Global Trendline
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 700 }}>Aggregated High-Priority Shifts</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '4rem' }}>
                {issues.slice(0, 3).map(issue => (
                  <div key={issue.id} style={{ background: 'rgba(30, 41, 59, 0.6)', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                    <span style={{ display: 'inline-block', fontSize: '0.6rem', fontWeight: 900, letterSpacing: '1px', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px', marginBottom: '1rem' }}>
                      {issue.domain}
                    </span>
                    <h4 style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem', lineHeight: 1.4 }}>{issue.title}</h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6 }}>{issue.topic}</p>
                  </div>
                ))}
              </div>

              <div style={{ border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '24px', padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
                <h3 style={{ color: '#f59e0b', fontSize: '1.2rem', fontWeight: 900, marginBottom: '0.5rem' }}>Deep Analytical Synthesis</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Advanced AI synthesis for Mains Answer Writing models is being generated.</p>
              </div>
            </div>
          ) : loadingDetail ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div style={{ color: '#475569', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px' }}>SYNTHESIZING INTELLIGENCE...</div>
            </div>
          ) : activeIssueData ? (
            // ACTIVE ISSUE DETAIL VIEW
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
              <header style={{ marginBottom: '3rem' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <span style={{ ...miniTagStyle, background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>{activeIssueData.domain}</span>
                    <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 700 }}>SYNTHESIZED {new Date(activeIssueData.lastUpdatedAt).toLocaleTimeString()}</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {activeIssueData.gsPapers.map(gs => (
                        <span key={gs} style={{ fontSize: '0.75rem', fontWeight: 900, color: '#1e40af', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>{gs}</span>
                      ))}
                    </div>
                 </div>
                 <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
                   {activeIssueData.title}
                 </h2>
                 <p style={{ color: '#94a3b8', fontSize: '1.1rem', fontWeight: 500 }}>{activeIssueData.topic}</p>
              </header>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }}>
                
                {/* STRATEGIC SUMMARY */}
                <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <h3 style={sectionHeaderStyle('PRELIMS')}>
                    <Sparkles size={16} /> CUMULATIVE STRATEGIC SUMMARY
                  </h3>
                  <div style={{ 
                    background: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.1)',
                    borderRadius: '16px', padding: '2rem', lineHeight: 1.8, color: '#cbd5e1', fontSize: '1.05rem'
                  }}>
                    {activeIssueData.cumulativeSummary ? (
                      <div dangerouslySetInnerHTML={{ __html: activeIssueData.cumulativeSummary.replace(/\n/g, '<br />') }} />
                    ) : (
                      <div style={{ color: '#64748b', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="animate-pulse h-2 w-2 bg-yellow-500 rounded-full"></div> AI compilation is pending for this knowledge node.
                      </div>
                    )}
                  </div>
                </section>

                {/* CHRONOLOGICAL THREAD */}
                <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
                  <h3 style={sectionHeaderStyle('MAINS')}>
                    <Calendar size={16} /> CHRONOLOGICAL THREAD
                  </h3>
                  
                  {(() => {
                    const allEvents = [
                      ...(activeIssueData.articles || []).map(a => ({ ...a, itemType: 'NEWS', date: a.publishedAt, eventText: `News: "${a.title}"` })),
                      ...(activeIssueData.editorials || []).map(e => ({ ...e, itemType: 'EDITORIAL', date: e.publishedAt, eventText: `Editorial: "${e.title}"${e.author ? ` by ${e.author}` : ''}` }))
                    ].sort((a, b) => new Date(b.date) - new Date(a.date));

                    if (allEvents.length === 0) {
                      return <div style={{ color: '#64748b' }}>No events recorded.</div>;
                    }

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {allEvents.map((event, idx) => (
                          <div key={event.id || idx} style={{ 
                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                            borderRadius: '16px', padding: '2rem', borderLeft: event.itemType === 'EDITORIAL' ? '4px solid #f472b6' : '4px solid #60a5fa' 
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: event.itemType === 'EDITORIAL' ? '#f472b6' : '#60a5fa', textTransform: 'uppercase' }}>
                                {event.itemType} {event.source ? `— ${event.source}` : ''}
                              </span>
                              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                                {new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                              </span>
                            </div>

                            <h4 style={{ fontWeight: 800, color: 'white', marginBottom: '1rem', fontSize: '1.25rem', lineHeight: 1.4 }}>
                              {event.eventText}
                            </h4>

                            <div style={{ marginTop: '1.5rem' }}>
                              {event.status === 'PENDING' ? (
                                <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <div className="animate-pulse h-2 w-2 bg-yellow-500 rounded-full"></div> AI processing pending...
                                </div>
                              ) : event.structuredData ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                  {event.structuredData.crux && (
                                    <div>
                                      <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#818cf8', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Core Analytics / Crux</div>
                                      <div style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.7 }}>{event.structuredData.crux}</div>
                                    </div>
                                  )}
                                  {event.structuredData.prelimsFact && (
                                    <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                                      <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#60a5fa', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Prelims Fact</div>
                                      <div style={{ color: '#e2e8f0', fontSize: '1rem', lineHeight: 1.6 }}>{event.structuredData.prelimsFact}</div>
                                    </div>
                                  )}
                                  {event.structuredData.mcq && (
                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                      <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#10b981', marginBottom: '1rem', textTransform: 'uppercase' }}>Challenge MCQ</div>
                                      <p style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '1rem' }}>Q: {event.structuredData.mcq.question}</p>
                                      <ol style={{ margin: 0, paddingLeft: '1.2rem', color: '#94a3b8', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                        {event.structuredData.mcq.options?.map((opt, i) => <li key={i} style={{ fontWeight: 500 }}>{opt}</li>)}
                                      </ol>
                                      <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
                                        <strong style={{ color: '#10b981' }}>Correct Answer: {event.structuredData.mcq.answer}</strong>
                                        <p style={{ color: '#64748b', marginTop: '0.5rem', lineHeight: 1.6 }}>{event.structuredData.mcq.explanation}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : event.rawContent ? (
                                  <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Raw Content Preview</div>
                                    <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                      {event.rawContent}
                                    </p>
                                  </div>
                              ) : null}
                            </div>

                            {event.url && (
                              <a href={event.url} target="_blank" rel="noopener noreferrer" style={{ 
                                display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', 
                                color: '#3b82f6', textDecoration: 'none', fontWeight: 700, marginTop: '2rem' 
                              }}>
                                Read Source <ExternalLink size={14} />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </section>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

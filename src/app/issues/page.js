"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ChevronRight, Layout, BookOpen, BrainCircuit, Sparkles, GraduationCap, Layers, Globe, RefreshCw, Target } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

const MAINS_SECTIONS = [
  {
    id: 'GS1',
    title: 'General Studies I',
    color: '#10b981', // emerald color matching mains mode
    subjects: [
      { title: 'Indian History & Culture', domains: ['INDIAN CULTURE', 'MODERN HISTORY', 'WORLD HISTORY', 'POST-INDEPENDENCE CONSOLIDATION'] },
      { title: 'Geography of the World', domains: ['GEOGRAPHY'] },
      { title: 'Indian Society', domains: ['INDIAN SOCIETY'] },
    ]
  },
  {
    id: 'GS2',
    title: 'General Studies II',
    color: '#10b981',
    subjects: [
      { title: 'Polity & Constitution', domains: ['POLITY'] },
      { title: 'Governance & Social Justice', domains: ['GOVERNANCE'] },
      { title: 'International Relations', domains: ['INTERNATIONAL RELATIONS'] },
    ]
  },
  {
    id: 'GS3',
    title: 'General Studies III',
    color: '#10b981',
    subjects: [
      { title: 'Economy & Agriculture', domains: ['INDIAN ECONOMY', 'AGRICULTURE'] },
      { title: 'Environment & Disaster Mgmt', domains: ['ENVIRONMENT'] },
      { title: 'Science & Technology', domains: ['SCIENCE & TECHNOLOGY'] },
      { title: 'Internal Security', domains: ['INTERNAL SECURITY'] },
    ]
  },
  {
    id: 'GS4',
    title: 'General Studies IV',
    color: '#10b981',
    subjects: [
      { title: 'Ethics & Integrity', domains: ['ETHICS'] },
    ]
  }
];

const PRELIMS_SECTIONS = [
  {
    id: 'GS',
    title: 'General Studies',
    color: '#fbbf24', // amber color matching prelims mode
    subjects: [
      { title: 'Indian History', categories: ['ANCIENT_INDIA', 'MEDIEVAL_INDIA', 'MODERN_INDIA', 'ART_CULTURE', 'HISTORY'] },
      { title: 'Geography', categories: ['GEOGRAPHY'] },
      { title: 'Polity & Governance', categories: ['POLITY', 'GOVERNANCE'] },
      { title: 'Economy & Agriculture', categories: ['ECONOMY', 'AGRICULTURE'] },
      { title: 'Environment & Ecology', categories: ['ENVIRONMENT', 'DISASTER_MANAGEMENT'] },
      { title: 'Science & Technology', categories: ['SCIENCE_TECHNOLOGY'] },
      { title: 'Current Affairs', categories: ['CURRENT_AFFAIRS', 'INTERNATIONAL_RELATIONS', 'INTERNAL_SECURITY', 'SOCIETY'] }
    ]
  },
  {
    id: 'CSAT',
    title: 'CSAT (Paper II)',
    color: '#f59e0b',
    subjects: [
      { title: 'Aptitude & Reasoning', categories: ['CSAT'] }
    ]
  }
];

export function StrategicHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const flowParam = searchParams.get('flow');

  const [currentFlow, setCurrentFlow] = useState('mains');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubject, setActiveSubject] = useState(null);
  const [expandedIssueId, setExpandedIssueId] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function fetchIssues() {
      setLoading(true);
      try {
        const res = await fetch(`/api/issues?showAll=true`);
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
    fetchIssues();
  }, []);

  useEffect(() => {
    if (mounted) {
      if (flowParam && (flowParam === 'prelims' || flowParam === 'mains')) {
        setCurrentFlow(flowParam);
        localStorage.setItem('upsc_flow_context', flowParam);
      } else {
        const savedFlow = localStorage.getItem('upsc_flow_context');
        if (savedFlow && (savedFlow === 'prelims' || savedFlow === 'mains')) {
          setCurrentFlow(savedFlow);
          const params = new URLSearchParams(window.location.search);
          params.set('flow', savedFlow);
          router.replace(`/issues?${params.toString()}`);
        } else {
          setCurrentFlow('mains');
          localStorage.setItem('upsc_flow_context', 'mains');
          const params = new URLSearchParams(window.location.search);
          params.set('flow', 'mains');
          router.replace(`/issues?${params.toString()}`);
        }
      }
    }
  }, [flowParam, router, mounted]);

  useEffect(() => {
    setActiveSubject(null);
  }, [currentFlow]);

  const handleModeChange = (mode) => {
    localStorage.setItem('upsc_flow_context', mode);
    setCurrentFlow(mode);
    setActiveSubject(null);
    const params = new URLSearchParams(window.location.search);
    params.set('flow', mode);
    router.push(`/issues?${params.toString()}`);
  };

  if (!mounted) return null;

  const handleSubjectClick = (subject, color) => {
    setTransitioning(true);
    setActiveSubject({ ...subject, color });
    setExpandedIssueId(null);
    setTimeout(() => setTransitioning(false), 300);
  };

  const getGroupedTopics = (domainsOrCategories) => {
    if (!domainsOrCategories) return [];
    const filtered = issues.filter(issue => {
      const matchScope = currentFlow === 'prelims'
        ? domainsOrCategories.includes(issue.category)
        : domainsOrCategories.includes(issue.domain);
      const matchSearch = searchTerm === '' ||
       issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       issue.topic.toLowerCase().includes(searchTerm.toLowerCase());
      return matchScope && matchSearch;
    }).sort((a, b) => a.orderIndex - b.orderIndex);

    const topics = {};
    filtered.forEach(node => {
      if (!topics[node.topic]) topics[node.topic] = [];
      topics[node.topic].push(node);
    });

    return Object.keys(topics).map(name => ({
      name,
      items: topics[name],
      minOrder: Math.min(...topics[name].map(n => n.orderIndex))
    })).sort((a, b) => a.minOrder - b.minOrder);
  };

  const sidebar = (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', backdropFilter: 'blur(40px)', borderRight: '1px solid var(--border-color)' }}>
      <div style={{ padding: '32px 24px' }}>
        <h2 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: '24px' }}>Strategic Command</h2>
        
        {/* Mode Switcher Pill */}
        <div className="mode-switcher-sidebar" style={{
          background: 'var(--bg-input)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '4px',
          display: 'flex',
          gap: '4px',
          backdropFilter: 'blur(8px)',
          marginBottom: '24px'
        }}>
           <button onClick={() => handleModeChange('prelims')} style={{
             flex: 1,
             background: currentFlow === 'prelims' ? 'rgba(251, 191, 36, 0.1)' : 'transparent',
             border: 'none',
             color: currentFlow === 'prelims' ? 'var(--color-amber)' : 'var(--text-muted)',
             fontSize: '0.75rem',
             fontWeight: 800,
             padding: '8px 12px',
             borderRadius: '12px',
             cursor: 'pointer',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             gap: '6px',
             transition: 'all 0.3s ease',
             boxShadow: currentFlow === 'prelims' ? 'inset 0 0 12px rgba(251, 191, 36, 0.05)' : 'none'
           }}>
              <Target size={12} /> Prelims Mode
           </button>
           <button onClick={() => handleModeChange('mains')} style={{
             flex: 1,
             background: currentFlow === 'mains' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
             border: 'none',
             color: currentFlow === 'mains' ? 'var(--color-emerald)' : 'var(--text-muted)',
             fontSize: '0.75rem',
             fontWeight: 800,
             padding: '8px 12px',
             borderRadius: '12px',
             cursor: 'pointer',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             gap: '6px',
             transition: 'all 0.3s ease',
             boxShadow: currentFlow === 'mains' ? 'inset 0 0 12px rgba(16, 185, 129, 0.05)' : 'none'
           }}>
              <BookOpen size={12} /> Mains Mode
           </button>
        </div>

        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            placeholder="Search briefings..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', padding: '12px 12px 12px 40px', background: 'var(--bg-input)', 
              border: '1px solid var(--border-color)', borderRadius: '16px', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none'
            }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 32px' }} className="hide-scrollbar">
        {(currentFlow === 'prelims' ? PRELIMS_SECTIONS : MAINS_SECTIONS).map(section => (
          <div key={section.id} style={{ marginBottom: '40px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 900, color: section.color, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px', paddingLeft: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: section.color }}></div>
              {section.title}
            </div>
            {section.subjects.map(subject => {
              const count = issues.filter(i => 
                currentFlow === 'prelims'
                  ? subject.categories.includes(i.category)
                  : subject.domains.includes(i.domain)
              ).length;
              return (
                <button 
                  key={subject.title}
                  onClick={() => handleSubjectClick(subject, section.color)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: '12px',
                    background: activeSubject?.title === subject.title ? `var(--bg-hover)` : 'transparent',
                    border: 'none', color: activeSubject?.title === subject.title ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px'
                  }}
                >
                  {subject.title}
                  <span style={{ fontSize: '0.75rem', opacity: 0.4, marginLeft: 'auto' }}>{count}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  const activeSubjectData = currentFlow === 'prelims' ? activeSubject?.categories : activeSubject?.domains;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', paddingTop: '80px', position: 'relative' }}>
      <Toaster position="bottom-right" />
      
      <aside className="hub-sidebar" style={{ width: '340px', position: 'fixed', top: '80px', bottom: 0, left: 0, zIndex: 10 }}>
        {loading ? (
          <div style={{ height: '100%', padding: '32px 24px', background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(40px)' }}>
            <div className="skeleton-shimmer" style={{ width: '60%', height: '12px', marginBottom: '40px' }} />
          </div>
        ) : sidebar}
      </aside>

      <main className="hub-main" style={{ marginLeft: '340px', flex: 1, padding: '80px 100px', position: 'relative', zIndex: 1 }}>
        {loading ? (
          <div style={{ maxWidth: '1100px' }}>
             <div className="skeleton-shimmer" style={{ width: '60%', height: '60px', marginBottom: '64px' }} />
             <div className="skeleton-shimmer" style={{ width: '100%', height: '100px', marginBottom: '12px' }} />
          </div>
        ) : transitioning ? (
          <div style={{ maxWidth: '1100px', opacity: 0.5 }}>
             <div className="skeleton-shimmer" style={{ width: '60%', height: '60px', marginBottom: '64px' }} />
          </div>
        ) : activeSubject ? (
          <div style={{ maxWidth: '1100px' }}>
            <header style={{ marginBottom: '64px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 900, color: activeSubject.color, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Globe size={16} /> Neural Intelligence Hub
              </div>
              <h1 style={{ fontSize: '4rem', fontWeight: 900, color: 'white', letterSpacing: '-0.04em', margin: 0 }}>{activeSubject.title}</h1>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
              {getGroupedTopics(activeSubjectData).length > 0 ? getGroupedTopics(activeSubjectData).map(topic => (
                <div key={topic.name}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: currentFlow === 'prelims' ? '#fbbf24' : '#3b82f6' }}>
                    <Layers size={18} />
                    <h2 style={{ fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>{topic.name}</h2>
                    <div style={{ flex: 1, height: '1px', background: currentFlow === 'prelims' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(59, 130, 246, 0.2)' }}></div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {topic.items.map(issue => {
                      return (
                        <div key={issue.id} style={{ marginBottom: '24px' }}>
                          {/* Parent Card */}
                          <Link href={`/issues/${issue.slug}?flow=${currentFlow}`} style={{ textDecoration: 'none' }}>
                            <div style={{ 
                              background: 'rgba(15, 23, 42, 0.5)', 
                              backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)',
                              borderRadius: '20px', padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              cursor: 'pointer'
                            }} className="hub-item-hover">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ 
                                  width: '40px', 
                                  height: '40px', 
                                  borderRadius: '12px', 
                                  background: currentFlow === 'prelims' ? 'rgba(251, 191, 36, 0.05)' : 'rgba(59, 130, 246, 0.05)', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center', 
                                  color: currentFlow === 'prelims' ? '#fbbf24' : '#3b82f6', 
                                  fontSize: '0.9rem', 
                                  fontWeight: 900, 
                                  border: `1px solid ${currentFlow === 'prelims' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(59, 130, 246, 0.1)'}` 
                                }}>
                                  {issue.orderIndex}
                                </div>
                                <div>
                                  <h4 style={{ color: 'white', fontSize: '1.15rem', fontWeight: 700, marginBottom: '4px' }}>{issue.title}</h4>
                                  <span style={{ color: '#475569', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Strategic Node</span>
                                </div>
                              </div>
                              <ChevronRight size={18} color="#475569" />
                            </div>
                          </Link>

                          {/* Persistent Subnode Branch */}
                          {issue.subNodes?.length > 0 && (
                            <div style={{ 
                              marginLeft: '52px', marginTop: '12px', paddingLeft: '24px', borderLeft: `1px solid ${currentFlow === 'prelims' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`,
                              display: 'flex', flexDirection: 'column', gap: '8px'
                            }}>
                               {issue.subNodes.map((sub) => (
                                 <Link key={sub.id} href={`/issues/${issue.slug}?flow=${currentFlow}#${sub.id}`} style={{ textDecoration: 'none' }}>
                                   <div style={{ 
                                     padding: '10px 16px', background: 'rgba(15, 23, 42, 0.3)', border: '1px solid rgba(255,255,255,0.03)', 
                                     borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', transition: '0.2s'
                                   }} className="sub-node-capsule">
                                     <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: currentFlow === 'prelims' ? '#fbbf24' : '#3b82f6', boxShadow: `0 0 10px ${currentFlow === 'prelims' ? '#fbbf24' : '#3b82f6'}` }}></div>
                                     <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>{sub.title}</div>
                                     <Sparkles size={12} style={{ marginLeft: 'auto', opacity: 0.3, color: currentFlow === 'prelims' ? '#fbbf24' : '#3b82f6' }} />
                                   </div>
                                 </Link>
                               ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )) : (
                <div style={{ background: 'rgba(15, 23, 42, 0.3)', padding: '100px', textAlign: 'center', color: '#64748b', borderRadius: '32px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                   <BookOpen size={48} style={{ marginBottom: '24px', opacity: 0.3 }} />
                   <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>No neural nodes detected in this sector yet.</div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', marginBottom: '20px' }}>Strategic Intelligence Hub</h2>
            <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '540px', lineHeight: 1.7 }}>Select a sector from the command console to access the neural-synthesized syllabus graph.</p>
          </div>
        )}
      </main>

      {/* Intelligence Side-Car (Right Column) */}
      <aside className="hub-sidecar" style={{ display: 'none' }}></aside>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hub-item-hover:hover { 
          background: rgba(30, 41, 59, 0.6) !important; 
          border-color: rgba(59, 130, 246, 0.4) !important;
        }
        .hub-item-hover:hover .chevron-icon { color: #3b82f6 !important; }
        @keyframes shimmer { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
        .skeleton-shimmer { background: rgba(255,255,255,0.05); border-radius: 8px; animation: shimmer 2s infinite ease-in-out; }

        @media (max-width: 1280px) {
          .hub-sidebar { width: 280px !important; }
          .hub-main { margin-left: 280px !important; padding: 40px !important; }
        }

        @media (max-width: 768px) {
          .hub-sidebar { display: none !important; }
          .hub-main { margin-left: 0 !important; padding: 32px 16px !important; }
          .hub-main h1 { font-size: 2.5rem !important; }
        }
        
        @keyframes traySlideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function StrategicHub() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', color: 'white' }}>
        <RefreshCw className="animate-spin" size={24} style={{ color: '#3b82f6' }} />
      </div>
    }>
      <StrategicHubContent />
    </Suspense>
  );
}

'use client';

import { useState, useEffect } from 'react';
import SubjectChat from '@/components/content-portal/SubjectChat';
import { Book, Target, Landmark, Mountain, Globe2, Leaf, Atom, GraduationCap, Shield, HeartPulse, Scale, Newspaper, Settings, ChevronLeft, LayoutGrid, Plus } from 'lucide-react';
import './portal-rag.css';

const GS_GROUPS = [
  {
    id: 'GS1',
    title: 'General Studies I',
    subtitle: 'Heritage, Culture, Geography & Society',
    accent: '#3b82f6',
    subjects: [
      { id: 'HISTORY', name: 'History', icon: Book },
      { id: 'GEOGRAPHY', name: 'Geography', icon: Mountain },
      { id: 'SOCIETY', name: 'Indian Society', icon: Globe2 },
    ]
  },
  {
    id: 'GS2',
    title: 'General Studies II',
    subtitle: 'Governance, Constitution, Polity & IR',
    accent: '#8b5cf6',
    subjects: [
      { id: 'POLITY', name: 'Polity & Gov', icon: Landmark },
      { id: 'IR', name: 'International Relations', icon: Globe2 },
      { id: 'GOVERNANCE', name: 'Governance', icon: Shield },
      { id: 'SOCIAL_JUSTICE', name: 'Social Justice', icon: Scale },
    ]
  },
  {
    id: 'GS3',
    title: 'General Studies III',
    subtitle: 'Economy, Env, Security & Science',
    accent: '#f59e0b',
    subjects: [
      { id: 'ECONOMY', name: 'Indian Economy', icon: Target },
      { id: 'ENVIRONMENT', name: 'Environment', icon: Leaf },
      { id: 'DISASTER_MGMT', name: 'Disaster Management', icon: Shield },
      { id: 'SECURITY', name: 'Internal Security', icon: Shield },
      { id: 'SCIENCE', name: 'Science & Tech', icon: Atom },
    ]
  },
  {
    id: 'GS4',
    title: 'General Studies IV',
    subtitle: 'Ethics, Integrity & Aptitude',
    accent: '#ec4899',
    subjects: [
      { id: 'ETHICS', name: 'Ethics & Integrity', icon: HeartPulse },
    ]
  },
  {
    id: 'OTHER',
    title: 'Thematic Hub',
    subtitle: 'Essay & Current Affairs',
    accent: '#10b981',
    subjects: [
      { id: 'ESSAY', name: 'Essay', icon: Book },
      { id: 'CURRENT_AFFAIRS', name: 'Current Affairs', icon: Newspaper },
    ]
  }
];

export default function ContentPortal() {
  const [view, setView] = useState('GRID'); // GRID | CHAT
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeSubject, setActiveSubject] = useState(null);
  const [activeSubjectName, setActiveSubjectName] = useState('');
  const [examMode, setExamMode] = useState('MAINS'); 
  const [optionals, setOptionals] = useState([]);
  const [activeOptional, setActiveOptional] = useState(null);
  const [isOptionalMode, setIsOptionalMode] = useState(false);
  const [userOptionalSlug, setUserOptionalSlug] = useState(null);
  const [showOptionalSelector, setShowOptionalSelector] = useState(false);

  useEffect(() => {
    fetch('/api/optionals')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOptionals(data);
      })
      .catch(err => console.error('Error fetching optionals:', err));

    fetch('/api/user/preferences')
      .then(res => res.json())
      .then(data => {
        if (data.preferences?.selectedOptional) {
          setUserOptionalSlug(data.preferences.selectedOptional);
        }
      })
      .catch(err => console.error('Error fetching preferences:', err));
  }, []);

  const handleGroupClick = (group) => {
    setActiveGroup(group.id);
    const firstSub = group.subjects[0];
    handleSubjectClick(firstSub, group.id);
  };

  const handleSubjectClick = (sub, groupId = activeGroup) => {
    setActiveGroup(groupId);
    setActiveSubject(sub.id);
    const paperName = GS_GROUPS.find(g => g.id === groupId)?.title || '';
    setActiveSubjectName(`${sub.name} [${paperName}]`);
    setIsOptionalMode(false);
    setActiveOptional(null);
    setView('CHAT');
  };

  const handleOptionalClick = (opt) => {
    setActiveGroup('OPTIONAL');
    setActiveOptional(opt);
    setIsOptionalMode(true);
    setActiveSubject(opt.slug.toUpperCase());
    setActiveSubjectName(`${opt.name} [Optional Lab]`);
    setExamMode('MAINS'); 
    setView('CHAT');
  };

  const saveOptionalPreference = async (slug) => {
    try {
      const res = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedOptional: slug })
      });
      if (res.ok) {
        setUserOptionalSlug(slug);
        setShowOptionalSelector(false);
      }
    } catch (err) {
      console.error('Failed to save optional preference:', err);
    }
  };

  const selectedOptionalData = optionals.find(o => o.slug === userOptionalSlug);
  const activeGroupData = GS_GROUPS.find(g => g.id === activeGroup);

  if (view === 'GRID') {
    return (
      <div className="portal-dashboard">
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Mains Neural Base</h1>
            <p className="dashboard-subtitle">Select a strategic component to begin neural synthesis</p>
          </div>
        </header>

        <div className="dashboard-grid">
          
          {/* SIMPLIFIED OPTIONAL BLOCK */}
          <div className="dashboard-card optional-card">
            <div className="card-accent" style={{ background: '#10b981' }}></div>
            <div className="card-content">
              <div className="card-top">
                <div className="card-subtitle" style={{ color: '#10b981' }}>Deep Academic Research</div>
                <h2 className="card-title">Optional Lab</h2>
              </div>
              
              <div className="card-body">
                {userOptionalSlug && selectedOptionalData ? (
                  <div className="optional-active-state">
                    <div className="selected-optional-name">{selectedOptionalData.name}</div>
                    <button 
                      onClick={() => handleOptionalClick(selectedOptionalData)}
                      className="card-enter-btn-ui"
                      style={{ background: '#10b981', color: 'black', fontWeight: 900 }}
                    >
                      Enter Lab
                    </button>
                    <button 
                      className="change-optional-link"
                      onClick={() => setShowOptionalSelector(true)}
                    >
                      Change Subject
                    </button>
                  </div>
                ) : (
                  <div className="optional-selection-list">
                    <div className="selection-label">Initialize Subject Lab:</div>
                    <div className="opt-list-grid">
                      {optionals.length > 0 ? optionals.map(opt => (
                        <button 
                          key={opt.id} 
                          className="opt-list-item"
                          onClick={() => saveOptionalPreference(opt.slug)}
                        >
                          {opt.name}
                        </button>
                      )) : <div className="loading-dots">Loading options...</div>}
                    </div>
                  </div>
                )}

                {showOptionalSelector && (
                   <div className="dashboard-mini-overlay">
                     <div className="overlay-header">
                       <span>Select Optional</span>
                       <button onClick={() => setShowOptionalSelector(false)}>✕</button>
                     </div>
                     <div className="opt-list-grid">
                        {optionals.map(opt => (
                          <button 
                            key={opt.id} 
                            className="opt-list-item"
                            onClick={() => saveOptionalPreference(opt.slug)}
                          >
                            {opt.name}
                          </button>
                        ))}
                     </div>
                   </div>
                )}
              </div>
            </div>
          </div>

          {/* GS BLOCKS */}
          {GS_GROUPS.map((group) => (
            <div key={group.id} className="dashboard-card clickable-card" onClick={() => handleGroupClick(group)}>
              <div className="card-accent" style={{ background: group.accent }}></div>
              <div className="card-content">
                <div className="card-subtitle" style={{ color: group.accent }}>{group.subtitle}</div>
                <h2 className="card-title">{group.title}</h2>
                
                <div className="card-subjects-list">
                  {group.subjects.map(sub => (
                    <div key={sub.id} className="dashboard-subject-chip">
                      <sub.icon size={12} />
                      <span>{sub.name}</span>
                    </div>
                  ))}
                </div>
                <div className="card-footer-hint">Open Navigator</div>
              </div>
            </div>
          ))}

        </div>
      </div>
    );
  }

  // CHAT VIEW
  return (
    <div className="portal-layout">
      <div className="portal-sidebar">
        <div className="sidebar-top-nav">
          <button onClick={() => setView('GRID')} className="back-to-dashboard">
            <LayoutGrid size={16} />
            <span>Dashboard</span>
          </button>
          <div className="sidebar-current-mode">{examMode}</div>
        </div>

        <div className="portal-subjects">
           {isOptionalMode ? (
             <div className="portal-group-container">
                <div className="portal-section-label">Optional Context</div>
                <button className="portal-subject-btn active">
                  <div className="portal-subject-icon" style={{ background: '#10b981', color: 'black' }}>
                    <GraduationCap size={14} />
                  </div>
                  <span className="portal-subject-name">{activeOptional?.name} Lab</span>
                </button>
             </div>
           ) : activeGroupData && (
             <div className="portal-group-container">
                <div className="portal-section-label">{activeGroupData.title}</div>
                {activeGroupData.subjects.map((sub) => {
                  const Icon = sub.icon;
                  const isActive = activeSubject === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => handleSubjectClick(sub)}
                      className={`portal-subject-btn ${isActive ? 'active' : ''}`}
                    >
                      <div className="portal-subject-icon">
                        <Icon size={14} />
                      </div>
                      <span className="portal-subject-name">{sub.name}</span>
                    </button>
                  );
                })}
             </div>
           )}

           <div className="portal-group-container" style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
             <div className="sidebar-quick-grid">
                {GS_GROUPS.map(g => (
                  <button 
                    key={g.id}
                    onClick={() => handleGroupClick(g)}
                    className={`sidebar-mini-btn ${activeGroup === g.id ? 'active' : ''}`}
                  >
                    {g.id}
                  </button>
                ))}
                {userOptionalSlug && (
                  <button 
                    onClick={() => handleOptionalClick(selectedOptionalData)}
                    className={`sidebar-mini-btn ${isOptionalMode ? 'active' : ''}`}
                    style={{ color: '#10b981' }}
                  >
                    OPT
                  </button>
                )}
             </div>
           </div>
        </div>
      </div>

      <div className="portal-main">
        <SubjectChat 
          subjectId={activeSubject} 
          displayName={activeSubjectName}
          examType={examMode} 
          optionalSlug={activeOptional?.slug}
        />
      </div>
    </div>
  );
}

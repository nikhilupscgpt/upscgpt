'use client';

import { useState } from 'react';
import SubjectChat from '@/components/content-portal/SubjectChat';
import { Book, Target, Landmark, Mountain, Globe2, Leaf, Atom } from 'lucide-react';
import './portal-rag.css';

const SUBJECTS = [
  { id: 'POLITY', name: 'Polity & Gov', icon: Landmark },
  { id: 'HISTORY', name: 'History', icon: Book },
  { id: 'GEOGRAPHY', name: 'Geography', icon: Mountain },
  { id: 'ECONOMY', name: 'Economy', icon: Target },
  { id: 'ENVIRONMENT', name: 'Environment', icon: Leaf },
  { id: 'SCIENCE', name: 'Science & Tech', icon: Atom },
  { id: 'CURRENT_AFFAIRS', name: 'Current Affairs', icon: Globe2 },
];

export default function ContentPortal() {
  const [activeSubject, setActiveSubject] = useState(SUBJECTS[0].id);
  const [examMode, setExamMode] = useState('PRELIMS'); // PRELIMS | MAINS

  return (
    <div className="portal-layout">
      
      {/* LEFT SIDEBAR - Subjects */}
      <div className="portal-sidebar">
        <div className="portal-header">
          <h1 className="portal-title">Content Node</h1>
          <p className="portal-subtitle">Neural Knowledge Base</p>
        </div>

        {/* Exam Toggle */}
        <div className="portal-exam-toggle">
          <button 
            onClick={() => setExamMode('PRELIMS')}
            className={`portal-exam-btn ${examMode === 'PRELIMS' ? 'active' : ''}`}
          >
            Prelims
          </button>
          <button 
            onClick={() => setExamMode('MAINS')}
            className={`portal-exam-btn ${examMode === 'MAINS' ? 'active' : ''}`}
          >
            Mains
          </button>
        </div>

        {/* Subject Nav */}
        <div className="portal-subjects">
          {SUBJECTS.map((sub) => {
            const Icon = sub.icon;
            const isActive = activeSubject === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => setActiveSubject(sub.id)}
                className={`portal-subject-btn ${isActive ? 'active' : ''}`}
              >
                <div className="portal-subject-icon">
                  <Icon size={16} />
                </div>
                <span className="portal-subject-name">{sub.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="portal-main">
        <SubjectChat 
          subject={activeSubject} 
          examType={examMode} 
        />
      </div>

    </div>
  );
}

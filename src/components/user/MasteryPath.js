"use client";

import { useState } from 'react';
import { BookOpen, Newspaper, GraduationCap, CheckCircle2, Circle, Trophy, ChevronRight } from 'lucide-react';
import { updateMasteryStep } from '@/app/actions/user-activity';
import QuizInterface from './QuizInterface';
import toast from 'react-hot-toast';

export default function MasteryPath({ issueId, progress = {}, testPackId }) {
  const [showQuiz, setShowQuiz] = useState(false);

  const steps = [
    { key: 'readSummary', label: 'PHASE 1: CONCEPT MASTERY', icon: BookOpen, desc: 'Read the comprehensive strategic briefing and thesis.' },
    { key: 'viewedNews', label: 'PHASE 2: CONTEXTUAL INTELLIGENCE', icon: Newspaper, desc: 'Analyze chronological thread of news and editorials.' },
    { key: 'solvedPYQs', label: 'PHASE 3: EXAM GROUNDING', icon: GraduationCap, desc: 'Master related Past Year Questions (PYQs).' },
    { key: 'solvedMCQs', label: 'PHASE 4: KNOWLEDGE VALIDATION', icon: Trophy, desc: 'Validate mastery with conceptual MCQs.' }
  ];

  const handleToggle = async (key, currentVal) => {
    if (key === 'solvedMCQs' && testPackId && !currentVal) {
      setShowQuiz(true);
      return;
    }
    
    try {
      const res = await updateMasteryStep(issueId, key, !currentVal);
      if (res.success) {
        toast.success("Progress Updated");
      }
    } catch (err) {
      toast.error("Failed to update mastery path");
    }
  };

  const completedCount = steps.filter(s => progress[s.key]).length;
  const percentage = (completedCount / steps.length) * 100;

  return (
    <div className="mastery-lab">
      {showQuiz && (
        <QuizInterface 
          testPackId={testPackId} 
          onClose={() => setShowQuiz(false)} 
          onComplete={() => {
            setShowQuiz(false);
            window.location.reload(); 
          }}
        />
      )}
      <div className="lab-header">
        <div className="title-row">
          <h3><CheckCircle2 size={18} className="lab-icon" /> NEURAL MASTERY LAB</h3>
          <span className="percent-badge">{Math.round(percentage)}% COMPLETE</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${percentage}%` }} />
        </div>
      </div>

      <div className="steps-container">
        {steps.map((step, idx) => {
          const isDone = progress[step.key];
          const Icon = step.icon;
          const isMCQPhase = step.key === 'solvedMCQs';
          
          return (
            <div 
              key={step.key} 
              className={`step-card ${isDone ? 'done' : ''}`}
              onClick={() => handleToggle(step.key, isDone)}
            >
              <div className="step-left">
                <div className={`icon-circle ${isDone ? 'done' : ''}`}>
                  <Icon size={20} />
                </div>
                <div className="step-info">
                  <span className="step-label">{step.label}</span>
                  <div className="step-desc-row">
                    <p className="step-desc">{step.desc}</p>
                    {isMCQPhase && testPackId && !isDone && (
                      <button className="launch-btn" onClick={(e) => { e.stopPropagation(); setShowQuiz(true); }}>
                        LAUNCH VALIDATION <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="step-right">
                {isDone ? <CheckCircle2 size={24} className="check-icon" /> : <Circle size={24} className="circle-icon" />}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .mastery-lab {
          background: rgba(16, 185, 129, 0.03);
          border: 1px solid rgba(16, 185, 129, 0.1);
          border-radius: 24px;
          padding: 2rem;
          margin: 2rem 0;
        }
        .lab-header { margin-bottom: 2rem; }
        .title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .title-row h3 { font-size: 0.9rem; font-weight: 900; letter-spacing: 1px; color: #10b981; display: flex; align-items: center; gap: 8px; }
        .percent-badge { font-size: 0.65rem; font-weight: 900; background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 4px 10px; border-radius: 100px; }
        
        .progress-track { height: 6px; background: rgba(16, 185, 129, 0.05); border-radius: 100px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #10b981, #34d399); transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); }

        .steps-container { display: flex; flex-direction: column; gap: 1rem; }
        .step-card {
          display: flex; justify-content: space-between; align-items: center;
          padding: 1.25rem 1.5rem; background: var(--bg-input);
          border: 1px solid var(--border-color); border-radius: 18px;
          cursor: pointer; transition: all 0.3s ease;
        }
        .step-card:hover { background: var(--bg-hover); border-color: rgba(16, 185, 129, 0.3); transform: translateX(8px); }
        .step-card.done { border-color: rgba(16, 185, 129, 0.2); background: rgba(16, 185, 129, 0.02); }

        .step-left { display: flex; align-items: center; gap: 1.5rem; }
        .icon-circle { 
          width: 48px; height: 48px; border-radius: 14px; 
          background: var(--bg-primary); color: var(--text-muted);
          display: flex; align-items: center; justify-content: center;
          transition: all 0.3s ease;
        }
        .icon-circle.done { background: rgba(16, 185, 129, 0.15); color: #10b981; }

        .step-info { display: flex; flex-direction: column; gap: 4px; }
        .step-label { font-size: 0.6rem; font-weight: 900; color: var(--text-muted); letter-spacing: 1px; }
        .step-desc { font-size: 0.85rem; color: var(--text-secondary); }
        .step-desc-row { display: flex; flex-direction: column; }

        .launch-btn {
          margin-top: 8px; background: #10b981; color: #020617; border: none;
          padding: 6px 12px; border-radius: 6px; font-size: 0.65rem; font-weight: 900;
          display: flex; align-items: center; gap: 4px; cursor: pointer; transition: all 0.2s;
          width: fit-content;
        }
        .launch-btn:hover { background: #34d399; transform: translateY(-1px); }

        .check-icon { color: #10b981; }
        .circle-icon { color: var(--border-hover); }

        @media (max-width: 600px) {
          .mastery-lab { padding: 1.25rem; }
          .step-left { gap: 1rem; }
          .icon-circle { width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0; }
          .step-desc { font-size: 0.75rem; }
        }
      `}</style>
    </div>
  );
}

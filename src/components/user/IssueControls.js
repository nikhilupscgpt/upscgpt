"use client";

import { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCircle2, Circle, Edit3, Save, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { toggleIssueFollow, updateIssueProgress, saveUserNote } from '@/app/actions/user-activity';
import toast from 'react-hot-toast';

export default function IssueControls({ issueId, initialData = {} }) {
  const [followed, setFollowed] = useState(initialData.followed || false);
  const [status, setStatus] = useState(initialData.status || 'UNSTARTED');
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showNoteArea, setShowNoteArea] = useState(false);

  const handleToggleFollow = async () => {
    try {
      const res = await toggleIssueFollow(issueId);
      if (res.success) {
        setFollowed(res.followed);
        toast.success(res.followed ? "Following for updates" : "Unfollowed");
      }
    } catch (err) {
      toast.error("Login required to follow issues");
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await updateIssueProgress(issueId, newStatus);
      if (res.success) {
        setStatus(newStatus);
        toast.success(`Marked as ${newStatus.replace('_', ' ')}`);
      }
    } catch (err) {
      toast.error("Failed to update progress");
    }
  };

  const handleSaveNote = async () => {
    if (!note.trim()) return;
    setIsSaving(true);
    try {
      const res = await saveUserNote(issueId, note);
      if (res.success) {
        toast.success("Note saved");
        setNote('');
        setShowNoteArea(false);
      }
    } catch (err) {
      toast.error("Failed to save note");
    } finally {
      setIsSaving(false);
    }
  };

  const btnStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 18px',
    borderRadius: '10px',
    fontSize: '0.7rem',
    fontWeight: 900,
    letterSpacing: '0.5px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.03)',
    color: '#94a3b8',
    textTransform: 'uppercase'
  };

  const followBtnStyle = {
    ...btnStyle,
    background: followed ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.03)',
    color: followed ? '#fbbf24' : '#94a3b8',
    borderColor: followed ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255,255,255,0.08)',
    boxShadow: followed ? '0 0 15px rgba(245, 158, 11, 0.1)' : 'none'
  };

  const statusBtnStyle = (isActive, color) => ({
    ...btnStyle,
    background: isActive ? `${color}20` : 'rgba(255,255,255,0.03)',
    color: isActive ? color : '#64748b',
    borderColor: isActive ? `${color}50` : 'rgba(255,255,255,0.08)',
    boxShadow: isActive ? `0 0 20px ${color}15` : 'none',
    opacity: isActive ? 1 : 0.7
  });

  return (
    <div className="controls-card">
      <div className="controls-grid">
        
        {/* FOLLOW TOGGLE */}
        <button onClick={handleToggleFollow} style={followBtnStyle} className="follow-btn">
          {followed ? <BellOff size={14} /> : <Bell size={14} />}
          <span>{followed ? 'FOLLOWING' : 'FOLLOW UPDATES'}</span>
        </button>

        <div className="desktop-divider" />

        {/* PROGRESS STATUS GROUP */}
        <div className="status-group">
          <button 
            onClick={() => handleStatusChange('READING')} 
            style={statusBtnStyle(status === 'READING', '#3b82f6')}
          >
            {status === 'READING' ? <Clock size={14} /> : <Circle size={14} />}
            <span>READING</span>
          </button>
          <button 
            onClick={() => handleStatusChange('MASTERED')} 
            style={statusBtnStyle(status === 'MASTERED', '#10b981')}
          >
            {status === 'MASTERED' ? <CheckCircle2 size={14} /> : <Circle size={14} />}
            <span>MASTERED</span>
          </button>
          <button 
            onClick={() => handleStatusChange('REVISION_NEEDED')} 
            style={statusBtnStyle(status === 'REVISION_NEEDED', '#ef4444')}
          >
            {status === 'REVISION_NEEDED' ? <AlertCircle size={14} /> : <Circle size={14} />}
            <span>REVISION</span>
          </button>
        </div>

        <div className="desktop-divider" />

        {/* NOTE TOGGLE */}
        <button onClick={() => setShowNoteArea(!showNoteArea)} style={btnStyle} className="note-btn">
          <Edit3 size={14} />
          <span>ADD NOTE</span>
        </button>
      </div>

      {showNoteArea && (
        <div className="note-area">
          <textarea 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add your strategic insights or memory triggers..."
          />
          <div className="note-actions">
            <button onClick={() => setShowNoteArea(false)} className="cancel-btn">CANCEL</button>
            <button onClick={handleSaveNote} disabled={isSaving} className="save-btn">
              <Save size={14} /> {isSaving ? 'SAVING...' : 'SAVE NOTE'}
            </button>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .controls-card {
          display: flex; flex-direction: column; gap: 1.5rem; margin-top: 1rem;
          padding: 1.5rem; background: rgba(255,255,255,0.02);
          border-radius: 16px; border: 1px solid rgba(255,255,255,0.05);
        }
        .controls-grid { display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; }
        .status-group { 
          display: grid; 
          grid-template-columns: repeat(3, 1fr); 
          gap: 0.5rem; 
          width: 100%;
        }
        .desktop-divider { height: 24px; width: 1px; background: rgba(255,255,255,0.1); }
        
        .note-area { display: flex; flex-direction: column; gap: 1rem; animation: fadeIn 0.3s ease; margin-top: 1rem; }
        .note-area textarea {
          width: 100%; min-height: 120px; padding: 14px; border-radius: 14px;
          background: rgba(0,0,0,0.3); color: white; border: 1px solid rgba(255,255,255,0.1);
          font-size: 0.9rem; outline: none; font-family: inherit; resize: vertical;
        }
        .note-actions { display: flex; justify-content: flex-end; gap: 1rem; align-items: center; }
        
        .cancel-btn { background: transparent; border: none; color: #64748b; font-size: 0.7rem; font-weight: 900; cursor: pointer; padding: 10px; }
        .save-btn { 
          display: flex; align-items: center; gap: 8px; background: #3b82f6; color: white; 
          border: none; padding: 10px 20px; border-radius: 12px; font-size: 0.7rem; font-weight: 900; cursor: pointer;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        button { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        button:hover { filter: brightness(1.2); transform: translateY(-2px); }
        button:active { transform: translateY(0); }

        @media (max-width: 768px) {
          .controls-card { padding: 1.25rem; gap: 1.25rem; }
          .controls-grid { gap: 1rem; flex-direction: column; width: 100%; }
          .status-group { order: 2; }
          .follow-btn { order: 1; width: 100%; justify-content: center; }
          .note-btn { order: 3; width: 100%; justify-content: center; }
          .desktop-divider { display: none; }
          
          .status-group button { 
            flex-direction: column; 
            padding: 12px 6px; 
            font-size: 0.6rem; 
            gap: 6px; 
            justify-content: center;
          }
          .status-group button span { font-size: 0.55rem; }
        }
      `}</style>
    </div>
  );
}

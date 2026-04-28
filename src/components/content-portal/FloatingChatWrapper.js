'use client';

import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import SubjectChat from './SubjectChat';

export default function FloatingChatWrapper({ subjectId, displayName, examType }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="floating-chat-container">
      {isOpen && (
        <div className="floating-chat-panel">
          <button 
            onClick={() => setIsOpen(false)}
            style={{ 
              position: 'absolute', 
              top: '18px', 
              right: '20px', 
              zIndex: 10,
              background: 'rgba(255,255,255,0.05)', 
              border: 'none', 
              color: '#94a3b8', 
              cursor: 'pointer',
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <SubjectChat 
              subjectId={subjectId}
              displayName={displayName}
              examType={examType}
            />
          </div>
        </div>
      )}
      
      <button 
        className={`floating-chat-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Open Neural Assistant"
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </button>
    </div>
  );
}

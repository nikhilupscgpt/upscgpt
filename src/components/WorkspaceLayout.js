"use client";

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export default function WorkspaceLayout({ children, sidebarContent, themeColor = 'blue' }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Load user preference after mounting on client
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('workspace-sidebar-open');
    if (saved !== null) {
      setIsOpen(saved === 'true');
    }
  }, []);

  const toggleSidebar = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    localStorage.setItem('workspace-sidebar-open', String(nextState));
  };

  const accentColor = 
    themeColor === 'amber' ? '#fbbf24' : 
    themeColor === 'emerald' ? '#10b981' : 
    '#3b82f6';
    
  const accentGlow = 
    themeColor === 'amber' ? 'rgba(251, 191, 36, 0.15)' : 
    themeColor === 'emerald' ? 'rgba(16, 185, 129, 0.15)' : 
    'rgba(59, 130, 246, 0.15)';

  return (
    <div 
      className="workspace-layout-container"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '32px',
        position: 'relative',
        width: '100%',
      }}
    >
      {/* Main Area */}
      <div 
        className="workspace-main-panel"
        style={{
          position: 'relative',
          width: '100%',
          minWidth: 0,
        }}
      >
        {children}
        
        {/* Toggle Button (Desktop Only) */}
        {isMounted && (
          <button 
            onClick={toggleSidebar}
            className="sidebar-toggle-btn"
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            style={{
              display: 'none', // Default hidden, shown in media query or styled globally
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              top: '12px',
              right: '-16px',
              width: '32px',
              height: '32px',
              background: 'var(--bg-secondary)',
              border: `1px solid ${isOpen ? 'var(--border-color)' : accentColor}`,
              borderRadius: '50%',
              color: isOpen ? 'var(--text-secondary)' : accentColor,
              cursor: 'pointer',
              zIndex: 50,
              boxShadow: isOpen ? 'none' : `0 0 10px ${accentGlow}`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {isOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* Sidebar Area */}
      <div 
        className={`workspace-sidebar-panel ${isOpen ? 'visible' : 'hidden'}`}
        style={{
          width: '100%',
          minWidth: 0,
          overflow: 'hidden',
          transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {sidebarContent}
        </div>
      </div>

      {/* Inline media queries to handle desktop layout grids & responsive overrides */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 1200px) {
          .workspace-layout-container {
            grid-template-columns: ${isOpen ? '1fr 360px' : '1fr 0px'} !important;
            gap: ${isOpen ? '32px' : '0px'} !important;
            transition: grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1), gap 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          }
          
          .sidebar-toggle-btn {
            display: flex !important;
          }
          
          .sidebar-toggle-btn:hover {
            color: var(--text-primary) !important;
            background: var(--bg-hover) !important;
            transform: scale(1.05) !important;
          }
          
          .workspace-sidebar-panel.hidden {
            opacity: 0 !important;
            transform: translateX(20px) !important;
            pointer-events: none !important;
            height: 0 !important;
          }
          
          .workspace-sidebar-panel.visible {
            opacity: 1 !important;
            transform: translateX(0) !important;
            height: auto !important;
          }
        }
      `}} />
    </div>
  );
}

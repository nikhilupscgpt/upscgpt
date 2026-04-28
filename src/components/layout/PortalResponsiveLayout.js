'use client';

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function PortalResponsiveLayout({ children, sidebar }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="portal-layout-container">
      {/* Sidebar Wrapper */}
      <div className={`portal-sidebar-el ${isMobileOpen ? 'mobile-open' : ''}`}>
        {sidebar}
      </div>

      {/* Main Content Wrapper */}
      <div className="portal-main-el" onClick={() => setIsMobileOpen(false)}>
        {children}
      </div>

      {/* Mobile Toggle Button */}
      <button 
        className="sidebar-toggle-btn"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle Sidebar"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <style jsx global>{`
        @media (max-width: 1024px) {
          .mobile-overlay {
            display: ${isMobileOpen ? 'block' : 'none'};
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(4px);
            z-index: 90;
          }
        }
      `}</style>
      
      {isMobileOpen && <div className="mobile-overlay" onClick={() => setIsMobileOpen(false)} />}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from 'react';

export default function ZenCard({ title, accentColor, children }) {
  const [isZen, setIsZen] = useState(false);

  const exitZen = useCallback(() => setIsZen(false), []);

  useEffect(() => {
    if (!isZen) return;

    const handleKey = (e) => {
      if (e.key === 'Escape') exitZen();
    };

    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isZen, exitZen]);

  return (
    <>
      {/* Normal card */}
      <div className={`module-card accent-${accentColor}`}>
        <button
          className="zen-btn"
          onClick={() => setIsZen(true)}
          aria-label={`Enter Zen Mode for ${title}`}
        >
          Zen Mode
        </button>
        <h3 className="module-title" style={{ color: `var(--color-${accentColor})` }}>{title}</h3>
        <div className="markdown-lite">
          {children}
        </div>
      </div>

      {/* Zen Overlay */}
      {isZen && (
        <div
          className="zen-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) exitZen(); }}
          role="dialog"
          aria-modal="true"
          aria-label={`Zen Mode: ${title}`}
        >
          <div className="zen-reader" style={{ '--zen-accent': `var(--color-${accentColor})` }}>
            {/* Header */}
            <div className="zen-header">
              <div className="zen-title-row">
                <span className="zen-section-label" style={{ color: `var(--color-${accentColor})` }}>{title}</span>
                <span className="zen-reading-badge">Focus Reading</span>
              </div>
              <button className="zen-close" onClick={exitZen} aria-label="Exit Zen Mode">
                <span>ESC</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Divider */}
            <div className="zen-divider" style={{ background: `linear-gradient(90deg, transparent, var(--color-${accentColor}), transparent)` }} />

            {/* Content */}
            <div className="zen-content markdown-lite">
              {children}
            </div>

            {/* Reading progress indicator at bottom */}
            <div className="zen-footer">
              <span className="zen-hint">Press <kbd>ESC</kbd> or click outside to exit</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

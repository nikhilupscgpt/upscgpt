'use client';

import React from 'react';

/**
 * Single quiet metadata line for PYQ cards and headers.
 * Example: UPSC CSE 2026 · Q64 · Polity › Historical Background
 */
export default function MetaLine({ parts = [], className = '' }) {
  const clean = parts
    .map((p) => (p == null ? '' : String(p).trim()))
    .filter(Boolean);

  if (clean.length === 0) return null;

  return (
    <div className={`pyq-ui-metaline ${className}`.trim()}>
      {clean.map((part, idx) => (
        <React.Fragment key={`${idx}-${part}`}>
          {idx > 0 && (
            <span className="pyq-ui-metaline-sep" aria-hidden="true">
              ·
            </span>
          )}
          <span>{part}</span>
        </React.Fragment>
      ))}
    </div>
  );
}

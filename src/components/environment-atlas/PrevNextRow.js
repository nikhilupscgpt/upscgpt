'use client';

import React from 'react';

/**
 * In-flow Previous / Next row at the end of the content column (PRD §3.7).
 * Never floats or overlaps content cards.
 */
export default function PrevNextRow({ displayIndex, totalCount, onNavigate }) {
  const safeTotal = Math.max(0, Number(totalCount) || 0);
  const safeIdx = safeTotal > 0 ? Math.min(Math.max(1, Number(displayIndex) || 1), safeTotal) : 0;

  return (
    <nav className="foot" aria-label="Species pagination">
      <button
        type="button"
        className="btn"
        onClick={() => onNavigate(-1)}
      >
        &larr; Previous
      </button>
      <span className="foot-counter">
        {safeIdx} of {safeTotal}
      </span>
      <button
        type="button"
        className="btn primary"
        onClick={() => onNavigate(1)}
      >
        Next species &rarr;
      </button>
    </nav>
  );
}

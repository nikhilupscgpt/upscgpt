'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, List } from 'lucide-react';

/**
 * Sticky Environment Atlas page bar (PRD §3.1).
 * Keeps "Quiz me" (primary accent) and "Study guide" (secondary) in the page bar,
 * and shows a "Species" drawer trigger below 1024px.
 */
export default function PageBar({
  displayIndex,
  totalCount,
  onOpenStudyGuide,
  onStartQuiz,
  onOpenDrawer,
}) {
  const safeTotal = Math.max(0, Number(totalCount) || 0);
  const safeIdx = safeTotal > 0 ? Math.min(Math.max(1, Number(displayIndex) || 1), safeTotal) : 0;
  const pct = safeTotal > 0 ? (safeIdx / safeTotal) * 100 : 0;

  return (
    <div className="env-top-bar">
      <div className="env-top-left">
        <button
          type="button"
          className="navbtn ghost env-drawer-btn"
          onClick={onOpenDrawer}
          aria-label="Open species list"
        >
          <List size={15} />
          <span>Species</span>
        </button>

        <Link href="/environment" className="navbtn ghost" style={{ textDecoration: 'none' }}>
          <ChevronLeft size={15} />
          <span>Hub</span>
        </Link>

        <span className="env-reading-label">
          Reading <b>{safeIdx}</b> of {safeTotal}
        </span>

        <div className="ptrack" aria-hidden="true">
          <i style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="env-top-actions">
        <span className="kbd-hint">
          <kbd>←</kbd> <kbd>→</kbd> to flip
        </span>
        <button
          type="button"
          className="navbtn ghost"
          onClick={onOpenStudyGuide}
        >
          Study guide
        </button>
        <button
          type="button"
          className="navbtn primary"
          onClick={onStartQuiz}
        >
          Quiz me
        </button>
      </div>
    </div>
  );
}

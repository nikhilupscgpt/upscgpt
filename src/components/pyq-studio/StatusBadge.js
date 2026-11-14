'use client';

import React from 'react';

const STATUS_LABELS = {
  ready: 'Ready',
  recorded: 'Recorded',
  incomplete: 'Needs explanation',
  needs_explanation: 'Needs explanation',
  broken: 'Broken',
  neutral: 'Draft',
};

/**
 * Semantic status pill: green (Ready/Recorded), amber (Needs explanation), red (Broken).
 */
export default function StatusBadge({ status = 'neutral', label, className = '' }) {
  const normalized = STATUS_LABELS[status] ? status : 'neutral';
  const displayLabel = label || STATUS_LABELS[normalized];

  return (
    <span className={`pyq-ui-status pyq-ui-status-${normalized} ${className}`.trim()}>
      {displayLabel}
    </span>
  );
}

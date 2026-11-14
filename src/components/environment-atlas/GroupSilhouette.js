'use client';

import React from 'react';

/**
 * Neutral SVG silhouette per taxonomic group (PRD §3.2 & §3.3).
 * Used as thumbnail/photo fallback when an image is missing or fails — never initials.
 */
export default function GroupSilhouette({ group = '', size = 22, className = '' }) {
  const g = String(group || '').toLowerCase();

  if (g.includes('bird')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className={className}
      >
        <path d="M21 6.5c-1.1.3-2.2.2-3.2-.2C16.8 4.4 14.5 3.5 12 4c-2.3.4-4.1 2.2-4.6 4.5L3 13l3.2.8L4.5 17l3.7-1.1c1.1.7 2.4 1.1 3.8 1.1 4.1 0 7.4-3.2 7.5-7.3.6-.8 1.1-1.9 1.5-3.2z" />
      </svg>
    );
  }

  if (g.includes('reptile') || g.includes('amphib')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className={className}
      >
        <path d="M5 16c-1.4 0-2.5-.9-2.5-2s1.1-2 2.5-2h3.2c1.2-2.4 3.6-4 6.3-4 2.4 0 4.5 1.3 5.5 3.2.5.9.3 2-.5 2.5-.6.4-1.4.4-2 .1-.8-.4-1.8-.3-2.5.3-.9.8-2.1 1.4-3.5 1.7L9.5 18H7l1-2H5z" />
      </svg>
    );
  }

  if (g.includes('plant') || g.includes('flora')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className={className}
      >
        <path d="M17 3C11.5 3 7 7.5 7 13c0 1.4.3 2.7.8 3.9L5 19.7 6.3 21l2.8-2.8c1.2.5 2.5.8 3.9.8 5.5 0 10-4.5 10-10V3h-6zm-4 13c-1.7 0-3-1.3-3-3 0-3.3 2.7-6 6-6h2v2c0 3.9-3.1 7-5 7z" />
      </svg>
    );
  }

  // Default / Mammals silhouette (clean deer/cat-like profile)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M18.5 5.5L17 4l-1.5 2.2c-.8-.1-1.6 0-2.4.3L10 9H6.5C4.6 9 3 10.6 3 12.5V19h2v-4h3v4h2v-4h5v4h2v-5.5l2-3.5 1.5-.5V7.5l-2-2z" />
    </svg>
  );
}

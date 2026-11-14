'use client';

import React from 'react';

/**
 * Corner logo (§2.7): upscgpt+ with upscgpt.in beneath it.
 * Top-right of the 16:9 stage, ~3.5% frame height, ~60% opacity, light/dark theme aware.
 * Uses placeholder defaults until BrandingSettings is introduced in Phase 4.
 */
export default function CornerLogo({ theme = 'light', opacity = 0.6, heightPct = 3.5 }) {
  const isDark = theme === 'dark';
  const primaryColor = isDark ? '#f8fafc' : '#0f172a';
  const accentColor = isDark ? '#38bdf8' : '#0284c7';
  const subColor = isDark ? 'rgba(248, 250, 252, 0.85)' : 'rgba(15, 23, 42, 0.78)';

  return (
    <div
      className="pq-corner-logo"
      data-corner-logo="true"
      aria-hidden="true"
      style={{
        opacity,
        ['--logo-h']: `${heightPct}%`,
      }}
    >
      <div className="pq-corner-logo-mark" style={{ color: primaryColor }}>
        <span>upscgpt</span>
        <span style={{ color: accentColor, fontWeight: 900 }}>+</span>
      </div>
      <div className="pq-corner-logo-url" style={{ color: subColor }}>
        upscgpt.in
      </div>
    </div>
  );
}

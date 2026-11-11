'use client';

import React from 'react';

export const IUCN_CATEGORIES = [
  { key: 'LC', label: 'Least Concern', color: '#60c659', text: '#ffffff' },
  { key: 'NT', label: 'Near Threatened', color: '#cce226', text: '#111827' },
  { key: 'VU', label: 'Vulnerable', color: '#f9e814', text: '#111827' },
  { key: 'EN', label: 'Endangered', color: '#fc7f3f', text: '#ffffff' },
  { key: 'CR', label: 'Critically Endangered', color: '#d81e05', text: '#ffffff' },
];

/**
 * Authentic Circular IUCN Red List Category SVG Badge
 */
export function IucnBadgeSvg({ status, size = 28 }) {
  const norm = (status || 'LC').toUpperCase();
  const meta = IUCN_CATEGORIES.find((c) => c.key === norm) || {
    key: norm,
    label: norm,
    color: '#94a3b8',
    text: '#ffffff',
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      title={`${meta.key} — ${meta.label}`}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
    >
      <circle cx="18" cy="18" r="17" fill={meta.color} />
      <circle cx="18" cy="18" r="16.5" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
      <text
        x="18"
        y="23"
        textAnchor="middle"
        fill={meta.text}
        fontSize="13"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.02em"
      >
        {meta.key}
      </text>
    </svg>
  );
}

/**
 * Official IUCN Threat Spectrum Gauge Bar
 */
export function IucnThreatGaugeSvg({ activeStatus }) {
  const currentKey = (activeStatus || 'LC').toUpperCase();
  const activeMeta = IUCN_CATEGORIES.find((c) => c.key === currentKey) || IUCN_CATEGORIES[0];

  return (
    <div className="env-iucn-svg-gauge">
      <div className="env-iucn-gauge-header">
        <span className="env-card-sublabel">IUCN Red List Conservation Status</span>
        <span className="env-iucn-status-name" style={{ color: activeMeta.color }}>
          {activeMeta.label} ({activeMeta.key})
        </span>
      </div>

      <div className="env-iucn-nodes-row">
        {/* Connecting track line */}
        <div className="env-iucn-track-line" />

        {IUCN_CATEGORIES.map((cat) => {
          const isSelected = cat.key === currentKey;

          return (
            <div
              key={cat.key}
              className={`env-iucn-gauge-node ${isSelected ? 'selected' : ''}`}
            >
              <svg
                width={isSelected ? 42 : 32}
                height={isSelected ? 42 : 32}
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  transition: 'all 0.2s ease',
                  filter: isSelected ? `drop-shadow(0 0 8px ${cat.color}88)` : 'none',
                }}
              >
                <circle
                  cx="20"
                  cy="20"
                  r={isSelected ? 18 : 17}
                  fill={isSelected ? cat.color : '#1e293b'}
                  stroke={cat.color}
                  strokeWidth={isSelected ? 3 : 2}
                  className="env-iucn-circle-shape"
                />
                <text
                  x="20"
                  y="25"
                  textAnchor="middle"
                  fill={isSelected ? cat.text : cat.color}
                  fontSize={isSelected ? 14 : 12}
                  fontWeight="800"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {cat.key}
                </text>
              </svg>
              <span
                className="env-iucn-node-text"
                style={{
                  color: isSelected ? cat.color : undefined,
                  fontWeight: isSelected ? 800 : 500,
                }}
              >
                {cat.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

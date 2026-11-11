'use client';

import React from 'react';

export const IUCN_CATEGORIES = [
  { key: 'EX', label: 'Extinct', color: '#111827', text: '#ef4444', group: 'extinct' },
  { key: 'EW', label: 'Extinct in the Wild', color: '#111827', text: '#ffffff', group: 'extinct' },
  { key: 'CR', label: 'Critically Endangered', color: '#d81e05', text: '#ffffff', group: 'threatened' },
  { key: 'EN', label: 'Endangered', color: '#fc7f3f', text: '#ffffff', group: 'threatened' },
  { key: 'VU', label: 'Vulnerable', color: '#e8c800', text: '#ffffff', group: 'threatened' },
  { key: 'NT', label: 'Near Threatened', color: '#0f766e', text: '#86efac', group: 'least_concern' },
  { key: 'LC', label: 'Least Concern', color: '#047857', text: '#ffffff', group: 'least_concern' },
];

/**
 * Authentic Circular IUCN Red List Badge (single circle)
 */
export function IucnBadgeSvg({ status, size = 26 }) {
  const norm = (status || 'LC').toUpperCase();
  const meta = IUCN_CATEGORIES.find((c) => c.key === norm) || {
    key: norm,
    label: norm,
    color: '#fc7f3f',
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
      <circle cx="18" cy="18" r="16.5" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
      <text
        x="18"
        y="23"
        textAnchor="middle"
        fill={meta.text}
        fontSize="13"
        fontWeight="800"
        fontFamily="Inter, system-ui, -apple-system, sans-serif"
        letterSpacing="0.02em"
      >
        {meta.key}
      </text>
    </svg>
  );
}

/**
 * Authentic Official IUCN Red List Category Diagram (Image 6)
 * Features:
 *   - "Extinct" header over EX and EW
 *   - "Threatened" header with curly brace spanning CR, EN, VU
 *   - "Least Concern" header over NT and LC
 *   - Dynamic highlight ring on active category
 */
export function IucnThreatGaugeSvg({ activeStatus }) {
  const currentKey = (activeStatus || 'EN').toUpperCase();

  const nodes = [
    { key: 'EX', label: 'Extinct', cx: 40, cy: 74, r: 20, fill: '#18181b', stroke: '#3f3f46', text: '#ef4444' },
    { key: 'EW', label: 'Extinct in Wild', cx: 96, cy: 74, r: 20, fill: '#18181b', stroke: '#3f3f46', text: '#ffffff' },
    { key: 'CR', label: 'Critically Endangered', cx: 194, cy: 74, r: 20, fill: '#d81e05', stroke: '#b91c1c', text: '#ffffff' },
    { key: 'EN', label: 'Endangered', cx: 250, cy: 74, r: 20, fill: '#fc7f3f', stroke: '#ea580c', text: '#ffffff' },
    { key: 'VU', label: 'Vulnerable', cx: 306, cy: 74, r: 20, fill: '#e8c800', stroke: '#ca8a04', text: '#ffffff' },
    { key: 'NT', label: 'Near Threatened', cx: 404, cy: 74, r: 20, fill: '#0f766e', stroke: '#115e59', text: '#86efac' },
    { key: 'LC', label: 'Least Concern', cx: 460, cy: 74, r: 20, fill: '#047857', stroke: '#065f46', text: '#ffffff' },
  ];

  const activeNode = nodes.find((n) => n.key === currentKey) || nodes[3];

  return (
    <div className="iucn-official-diagram">
      <svg
        viewBox="0 0 500 110"
        style={{ width: '100%', height: 'auto', display: 'block', maxWidth: 520, margin: '0 auto' }}
      >
        {/* GROUP 1: Extinct */}
        <text x="68" y="20" textAnchor="middle" fill="currentColor" fontSize="13.5" fontWeight="600" opacity="0.9">
          Extinct
        </text>
        <line x1="68" y1="26" x2="68" y2="44" stroke="currentColor" strokeWidth="1.6" opacity="0.8" />

        {/* GROUP 2: Threatened with Curly Brace */}
        <text x="250" y="20" textAnchor="middle" fill="currentColor" fontSize="14" fontWeight="700" opacity="0.95">
          Threatened
        </text>
        {/* Authentic SVG curly brace spanning CR, EN, VU */}
        <path
          d="M 174 44 Q 212 44, 238 34 Q 248 30, 250 27 Q 252 30, 262 34 Q 288 44, 326 44"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* GROUP 3: Least Concern */}
        <text x="432" y="20" textAnchor="middle" fill="currentColor" fontSize="13.5" fontWeight="600" opacity="0.9">
          Least Concern
        </text>
        <line x1="432" y1="26" x2="432" y2="44" stroke="currentColor" strokeWidth="1.6" opacity="0.8" />

        {/* CIRCLES */}
        {nodes.map((n) => {
          const isSelected = n.key === currentKey;
          return (
            <g key={n.key} style={{ cursor: 'default' }}>
              {isSelected && (
                <>
                  {/* Outer selection ring */}
                  <circle
                    cx={n.cx}
                    cy={n.cy}
                    r={n.r + 6}
                    fill="none"
                    stroke={n.fill}
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                  />
                  <circle
                    cx={n.cx}
                    cy={n.cy}
                    r={n.r + 3}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="2"
                  />
                </>
              )}
              {/* Main Badge */}
              <circle
                cx={n.cx}
                cy={n.cy}
                r={n.r}
                fill={n.fill}
                stroke={n.stroke}
                strokeWidth={isSelected ? '2' : '1'}
                opacity={isSelected ? 1 : 0.72}
              />
              <text
                x={n.cx}
                y={n.cy + 5}
                textAnchor="middle"
                fill={n.text}
                fontSize={isSelected ? '12.5' : '11.5'}
                fontWeight="800"
                fontFamily="Inter, system-ui, sans-serif"
                letterSpacing="0.03em"
              >
                {n.key}
              </text>
            </g>
          );
        })}

        {/* Active status indicator label underneath */}
        <text
          x={activeNode.cx}
          y="105"
          textAnchor="middle"
          fill="var(--accent)"
          fontSize="11"
          fontWeight="700"
        >
          ▲ {activeNode.label}
        </text>
      </svg>
    </div>
  );
}

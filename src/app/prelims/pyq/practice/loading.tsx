import React from 'react';
import OmrSparkLoader from '@/components/loader/OmrSparkLoader';

export default function PracticeLoading() {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
      }}
      role="status"
      aria-label="Loading drill"
    >
      <div
        style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-card, rgba(13, 21, 45, 0.7))',
          border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
          borderRadius: '20px',
          padding: '24px 32px',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.35)',
        }}
      >
        <OmrSparkLoader size="inline" tone="amber" />
        <div style={{ display: 'grid', gap: '4px', textAlign: 'left' }}>
          <b
            style={{
              fontFamily: 'Poppins, system-ui, sans-serif',
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--text-primary, #ffffff)',
            }}
          >
            Daily 10-Question Drill
          </b>
          <span style={{ fontSize: '12.5px', color: 'var(--text-muted, #8b97b8)' }}>
            Picking 10 questions · 12 min
          </span>
        </div>
      </div>
    </div>
  );
}

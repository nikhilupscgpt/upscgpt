'use client';

import React from 'react';

export interface QuestionCardSkeletonProps {
  count?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function QuestionCardSkeleton({
  count = 1,
  className = '',
  style,
}: QuestionCardSkeletonProps) {
  const cards = Array.from({ length: Math.max(1, count) });

  return (
    <div
      className={`question-card-skeletons-wrap ${className}`}
      style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', ...style }}
      aria-hidden="true"
    >
      <style>{`
        .qcard-skel-box {
          background: var(--bg-card, rgba(13, 21, 45, 0.7));
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
          border-radius: 16px;
          padding: 20px;
          display: grid;
          gap: 12px;
          position: relative;
          overflow: hidden;
        }
        [data-theme='light'] .qcard-skel-box {
          background: var(--bg-card, #ffffff);
          border-color: var(--border-color, #e2e8f0);
        }
        .qmeta-skel {
          display: flex;
          gap: 8px;
          margin-bottom: 2px;
        }
        .chip-skel {
          font: 600 10px/1 'JetBrains Mono', ui-monospace, Menlo, monospace;
          letter-spacing: 0.08em;
          padding: 5px 8px;
          border-radius: 6px;
          background: var(--panel-2, var(--bg-secondary, #111a33));
          color: var(--muted, var(--text-muted, #8b97b8));
        }
        [data-theme='light'] .chip-skel {
          background: #eef2fa;
          color: #56627f;
        }
        .bar-skel {
          height: 10px;
          border-radius: 5px;
          background: linear-gradient(
            90deg,
            var(--panel-2, var(--bg-secondary, #111a33)) 0%,
            var(--line, var(--border-color, #1e2a4a)) 40%,
            var(--panel-2, var(--bg-secondary, #111a33)) 80%
          );
          background-size: 250% 100%;
          animation: skel-shim 1.6s linear infinite;
        }
        [data-theme='light'] .bar-skel {
          background: linear-gradient(90deg, #eef2fa 0%, #d6ddec 40%, #eef2fa 80%);
          background-size: 250% 100%;
        }
        .opt-skel {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 2px;
        }
        .bub-skel {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 1.5px solid var(--muted, var(--text-muted, #8b97b8));
          display: grid;
          place-items: center;
          font: 700 9px 'JetBrains Mono', ui-monospace, monospace;
          color: var(--muted, var(--text-muted, #8b97b8));
          position: relative;
          flex: none;
          box-sizing: border-box;
        }
        [data-theme='light'] .bub-skel {
          border-color: #94a3b8;
          color: #64748b;
        }
        .bub-skel::after {
          content: "";
          position: absolute;
          inset: 2px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--blue-a, #60a5fa), var(--blue-b, #38bdf8));
          transform: scale(0);
          animation: skel-mark 2.4s ease-in-out infinite;
          animation-delay: var(--d, 0s);
        }
        .opt-skel .bar-skel {
          flex: 1;
        }
        @keyframes skel-shim {
          to { background-position: -150% 0; }
        }
        @keyframes skel-mark {
          0%, 8% { transform: scale(0); }
          18%, 70% { transform: scale(1); }
          82%, 100% { transform: scale(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .bar-skel, .bub-skel::after {
            animation: none !important;
          }
          .bub-skel::after {
            transform: scale(0) !important;
          }
        }
      `}</style>

      {cards.map((_, idx) => (
        <div key={idx} className="qcard-skel-box">
          <div className="qmeta-skel">
            <span className="chip-skel">UPSC PRELIMS</span>
            <span className="chip-skel">SOLVED PYQ</span>
          </div>
          <div className="bar-skel" style={{ width: '92%' }} />
          <div className="bar-skel" style={{ width: '68%' }} />

          <div className="opt-skel">
            <span className="bub-skel" style={{ ['--d' as any]: '0s' }}>
              a
            </span>
            <div className="bar-skel" style={{ maxWidth: '70%' }} />
          </div>
          <div className="opt-skel">
            <span className="bub-skel" style={{ ['--d' as any]: '0.6s' }}>
              b
            </span>
            <div className="bar-skel" style={{ maxWidth: '55%' }} />
          </div>
          <div className="opt-skel">
            <span className="bub-skel" style={{ ['--d' as any]: '1.2s' }}>
              c
            </span>
            <div className="bar-skel" style={{ maxWidth: '62%' }} />
          </div>
          <div className="opt-skel">
            <span className="bub-skel" style={{ ['--d' as any]: '1.8s' }}>
              d
            </span>
            <div className="bar-skel" style={{ maxWidth: '48%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

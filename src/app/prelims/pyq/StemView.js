'use client';

import React from 'react';
import { parseStem, isPromptText } from '@/lib/pyqStemParser';

export { parseStem, isPromptText };

/** Renders a question stem: intro line, statements in tinted boxes, tables, closing question. */
export default function StemView({ stem, size = 'md', qNo, interactiveElimination = true }) {
  const blocks = React.useMemo(() => parseStem(stem), [stem]);
  const firstP = blocks.findIndex(b => b.type === 'p');
  const [eliminated, setEliminated] = React.useState({});

  React.useEffect(() => {
    setEliminated({});
  }, [stem, qNo]);

  const toggleEliminate = (stmtId) => {
    if (!interactiveElimination) return;
    setEliminated(prev => ({ ...prev, [stmtId]: !prev[stmtId] }));
  };

  const hasEliminated = Object.values(eliminated).some(Boolean);

  return (
    <div className={`pq-stem pq-stem-${size}`}>
      {blocks.map((b, idx) => {
        if (b.type === 'stmts') {
          return (
            <div className="pq-stmts" key={idx}>
              {interactiveElimination && hasEliminated && (
                <div className="pq-stmt-elim-active-bar">
                  <span className="pq-stmt-elim-active-text">Statement crossed out</span>
                  <button
                    type="button"
                    className="pq-stmt-elim-reset"
                    onClick={() => setEliminated({})}
                  >
                    ↺ Reset all statements
                  </button>
                </div>
              )}
              {b.items.map((s, k) => {
                const stmtId = `${idx}-${k}`;
                const isElim = Boolean(eliminated[stmtId]);
                return (
                  <div
                    className={`pq-stmt ${isElim ? 'is-eliminated' : ''} ${interactiveElimination ? 'is-interactive' : ''}`}
                    key={k}
                    onClick={() => toggleEliminate(stmtId)}
                    role={interactiveElimination ? 'button' : undefined}
                    tabIndex={interactiveElimination ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (interactiveElimination && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        toggleEliminate(stmtId);
                      }
                    }}
                    title={interactiveElimination ? (isElim ? 'Tap to restore statement' : 'Tap to cross out statement') : undefined}
                  >
                    <span className="pq-stmt-key">{s.key}</span>
                    {s.text.includes(' : ') ? (
                      (() => {
                        const [left, ...rest] = s.text.split(' : ');
                        return (
                          <span className="pq-stmt-text pq-stmt-pair">
                            <strong className="pq-pair-term">{left}</strong>
                            <span className="pq-pair-sep"> : </span>
                            <span className="pq-pair-val">{rest.join(' : ')}</span>
                          </span>
                        );
                      })()
                    ) : (
                      <span className="pq-stmt-text">{s.text}</span>
                    )}
                    {interactiveElimination && (
                      <span className="pq-stmt-strike-pill" aria-hidden="true" title="Cross out / Restore">
                        {isElim ? '↺' : '✕'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        }
        if (b.type === 'table') {
          return (
            <div className="pq-table-wrap" key={idx} tabIndex={0} role="region" aria-label="Question data table">
              <table className="pq-table">
                <thead>
                  <tr>{b.head.map((h, k) => <th key={k}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {b.rows.map((r, k) => (
                    <tr key={k}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        
        const isAsk = b.isPrompt || (idx !== firstP && idx > 0);
        return (
          <p key={idx} className={isAsk ? 'pq-stem-ask' : 'pq-stem-lead'}>
            {idx === firstP && qNo ? (
              <strong className="pq-stem-qno">{qNo}. </strong>
            ) : null}
            {b.text}
          </p>
        );
      })}
    </div>
  );
}

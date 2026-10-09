'use client';

import React from 'react';

const STATEMENT_RE = /^(Statement[\s-]*(?:I{1,3}|IV|[1-4])|I{1,3}|IV|V|VI|[1-6]|[A-D])\s*[.:)]\s*(.*)$/i;
const PROMPT_RE = /\s+((?:Which\s+(?:one\s+of\s+the|of\s+the|pairs?|statements?|of\s+these)|How\s+many\s+of\s+the|Select\s+the\s+correct).*)$/i;

function parseStem(stem) {
  let raw = String(stem || '').trim();

  // Pre-normalization:
  // 1. Split inline Statement-I: / Statement-II:
  raw = raw.replace(/([.:])\s*(Statement[\s-]*(?:I{1,3}|IV|[1-4])\s*[.:])/gi, '$1\n$2');
  // 2. Detach closing question prompts if stuck on the same line
  raw = raw.replace(PROMPT_RE, '\n$1');

  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Table: 2+ consecutive lines with " | " separators
    if (line.includes(' | ')) {
      const rows = [];
      while (i < lines.length && lines[i].includes(' | ')) {
        rows.push(lines[i].split(' | ').map(c => c.trim()));
        i++;
      }
      if (rows.length >= 2) {
        blocks.push({ type: 'table', head: rows[0], rows: rows.slice(1) });
        continue;
      }
      blocks.push({ type: 'p', text: rows[0].join(' | ') });
      continue;
    }

    const m = line.match(STATEMENT_RE);
    if (m && m[2]) {
      const items = [];
      while (i < lines.length) {
        const mm = lines[i].match(STATEMENT_RE);
        if (!mm || !mm[2] || lines[i].includes(' | ')) break;
        let key = mm[1].replace(/^Statement[\s-]*/i, '');
        items.push({ key: key.toUpperCase(), text: mm[2] });
        i++;
      }
      blocks.push({ type: 'stmts', items });
      continue;
    }

    blocks.push({ type: 'p', text: line });
    i++;
  }
  return blocks;
}

/** Renders a question stem: intro line, statements in tinted boxes, tables, closing question. */
export default function StemView({ stem, size = 'md' }) {
  const blocks = React.useMemo(() => parseStem(stem), [stem]);
  const firstP = blocks.findIndex(b => b.type === 'p');

  return (
    <div className={`pq-stem pq-stem-${size}`}>
      {blocks.map((b, idx) => {
        if (b.type === 'stmts') {
          return (
            <div className="pq-stmts" key={idx}>
              {b.items.map((s, k) => (
                <div className="pq-stmt" key={k}>
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
                </div>
              ))}
            </div>
          );
        }
        if (b.type === 'table') {
          return (
            <div className="pq-table-wrap" key={idx}>
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
        return (
          <p key={idx} className={idx === firstP ? 'pq-stem-lead' : 'pq-stem-ask'}>
            {b.text}
          </p>
        );
      })}
    </div>
  );
}

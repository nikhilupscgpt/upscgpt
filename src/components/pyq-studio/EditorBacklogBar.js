'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, Table, Tags } from 'lucide-react';
import PageHeader from './PageHeader';

/**
 * Admin-only PYQ Editor top bar:
 * - PageHeader breadcrumb + "Next incomplete" button
 * - Collapsible Backlog Table (exam x year x subject)
 * - Bulk Theme / Metadata Tagger for untagged questions in a topic
 */
export default function EditorBacklogBar({ onBulkTagged }) {
  const [cells, setCells] = useState([]);
  const [nextIncompleteId, setNextIncompleteId] = useState(null);
  const [backlogOpen, setBacklogOpen] = useState(false);
  const [taggerOpen, setTaggerOpen] = useState(false);

  const [untaggedTopic, setUntaggedTopic] = useState('');
  const [bulkTheme, setBulkTheme] = useState('');
  const [bulkDifficulty, setBulkDifficulty] = useState('');
  const [bulkExamCode, setBulkExamCode] = useState('');
  const [tagging, setTagging] = useState(false);
  const [tagMsg, setTagMsg] = useState('');

  const loadBacklog = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/pyq/backlog');
      if (!res.ok) return;
      const data = await res.json();
      setCells(data.cells || []);
      setNextIncompleteId(data.nextIncompleteId || null);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadBacklog();
  }, [loadBacklog]);

  const handleBulkTag = async (e) => {
    e.preventDefault();
    if (!untaggedTopic.trim()) return;
    setTagging(true);
    setTagMsg('');
    try {
      const res = await fetch('/api/admin/pyq/bulk-tag', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          untaggedTopic: untaggedTopic.trim(),
          srcTheme: bulkTheme.trim() || undefined,
          difficulty: bulkDifficulty || undefined,
          examCode: bulkExamCode || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTagMsg(`Updated ${data.updated} questions.`);
        loadBacklog();
        onBulkTagged?.();
      } else {
        setTagMsg(data.error || 'Failed to update');
      }
    } finally {
      setTagging(false);
    }
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <PageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'PYQ Studio', href: '/admin/studio/pyq' },
          { label: 'PYQ Editor' },
        ]}
        secondaryActions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="pyq-ui-secondary-btn"
              onClick={() => setBacklogOpen((v) => !v)}
              aria-expanded={backlogOpen}
            >
              <Table size={14} />
              <span>Backlog ({cells.length})</span>
            </button>
            <button
              type="button"
              className="pyq-ui-secondary-btn"
              onClick={() => setTaggerOpen((v) => !v)}
              aria-expanded={taggerOpen}
            >
              <Tags size={14} />
              <span>Theme Tagger</span>
            </button>
          </div>
        }
        primaryAction={
          nextIncompleteId ? (
            <Link href={`/admin/pyq/${encodeURIComponent(nextIncompleteId)}`} className="pyq-ui-primary-btn">
              <span>Next incomplete</span>
              <ArrowRight size={14} />
            </Link>
          ) : null
        }
      />

      {backlogOpen && (
        <section
          aria-label="PYQ Backlog Matrix"
          style={{
            marginBottom: 16,
            padding: 14,
            borderRadius: 12,
            border: '1px solid rgba(148,163,184,0.2)',
            background: '#0f172a',
            maxHeight: 320,
            overflowY: 'auto',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#94a3b8', borderBottom: '1px solid rgba(148,163,184,0.16)' }}>
                <th style={{ padding: '6px 8px' }}>Exam</th>
                <th style={{ padding: '6px 8px' }}>Year</th>
                <th style={{ padding: '6px 8px' }}>Subject</th>
                <th style={{ padding: '6px 8px' }}>Total</th>
                <th style={{ padding: '6px 8px', color: '#34d399' }}>Ready</th>
                <th style={{ padding: '6px 8px', color: '#fbbf24' }}>Needs Expl</th>
                <th style={{ padding: '6px 8px', color: '#f87171' }}>Broken</th>
                <th style={{ padding: '6px 8px' }}>Untagged Theme</th>
              </tr>
            </thead>
            <tbody>
              {cells.map((c, idx) => (
                <tr key={`${c.exam}-${c.year}-${c.subject}-${idx}`} style={{ borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
                  <td style={{ padding: '6px 8px' }}>{c.exam}</td>
                  <td style={{ padding: '6px 8px' }}>{c.year ?? '—'}</td>
                  <td style={{ padding: '6px 8px' }}>{c.subject}</td>
                  <td style={{ padding: '6px 8px' }}>{c.total}</td>
                  <td style={{ padding: '6px 8px', color: '#34d399' }}>{c.ready}</td>
                  <td style={{ padding: '6px 8px', color: '#fbbf24' }}>{c.needsExplanation}</td>
                  <td style={{ padding: '6px 8px', color: '#f87171' }}>{c.broken}</td>
                  <td style={{ padding: '6px 8px', color: '#94a3b8' }}>{c.untaggedTheme}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {taggerOpen && (
        <form
          onSubmit={handleBulkTag}
          style={{
            marginBottom: 16,
            padding: 14,
            borderRadius: 12,
            border: '1px solid rgba(148,163,184,0.2)',
            background: '#0f172a',
            display: 'flex',
            alignItems: 'flex-end',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div className="pyq-ui-filter-field">
            <label htmlFor="tagger-topic" className="pyq-ui-filter-label">
              Topic (tags its untagged questions)
            </label>
            <input
              id="tagger-topic"
              type="text"
              className="pyq-ui-filter-input"
              placeholder="e.g. Fundamental Rights"
              value={untaggedTopic}
              onChange={(e) => setUntaggedTopic(e.target.value)}
              required
            />
          </div>
          <div className="pyq-ui-filter-field">
            <label htmlFor="tagger-theme" className="pyq-ui-filter-label">
              Set Theme
            </label>
            <input
              id="tagger-theme"
              type="text"
              className="pyq-ui-filter-input"
              placeholder="e.g. Writ Jurisdiction"
              value={bulkTheme}
              onChange={(e) => setBulkTheme(e.target.value)}
            />
          </div>
          <div className="pyq-ui-filter-field">
            <label htmlFor="tagger-difficulty" className="pyq-ui-filter-label">
              Difficulty
            </label>
            <select
              id="tagger-difficulty"
              className="pyq-ui-filter-select"
              value={bulkDifficulty}
              onChange={(e) => setBulkDifficulty(e.target.value)}
            >
              <option value="">Leave unchanged</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="pyq-ui-filter-field">
            <label htmlFor="tagger-exam" className="pyq-ui-filter-label">
              Exam Code
            </label>
            <select
              id="tagger-exam"
              className="pyq-ui-filter-select"
              value={bulkExamCode}
              onChange={(e) => setBulkExamCode(e.target.value)}
            >
              <option value="">Leave unchanged</option>
              <option value="UPSC_CSE_PRE">UPSC_CSE_PRE</option>
              <option value="CDS_I">CDS_I</option>
              <option value="CDS_II">CDS_II</option>
            </select>
          </div>
          <button type="submit" disabled={tagging} className="pyq-ui-primary-btn">
            {tagging ? 'Applying...' : 'Apply Bulk Tag'}
          </button>
          {tagMsg && <span style={{ fontSize: 12.5, color: '#38bdf8' }}>{tagMsg}</span>}
        </form>
      )}
    </div>
  );
}

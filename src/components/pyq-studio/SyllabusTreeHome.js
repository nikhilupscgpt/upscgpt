'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import PageHeader from './PageHeader';
import StatusBadge from './StatusBadge';

const EXAM_OPTIONS = [
  { value: 'UPSC_CSE_PRE', label: 'UPSC CSE' },
  { value: 'CDS', label: 'CDS' },
  { value: 'ALL', label: 'All' },
];

const PROGRESS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'not_started', label: 'Not started' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'recorded', label: 'Recorded' },
];

function getProgressState(node) {
  if (!node.total || node.recordedCount === 0) return 'not_started';
  if (node.recordedCount >= node.total) return 'recorded';
  return 'in_progress';
}

function formatNodeStatus(node) {
  if (node.recordedCount === 0) return 'Not started';
  if (node.recordedCount >= node.total) {
    if (node.lastRecordedAt) {
      const d = new Date(node.lastRecordedAt);
      const formatted = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      return `Recorded ${formatted}`;
    }
    return 'Recorded';
  }
  if (node.partsDone > 0) return `Part ${node.partsDone} done`;
  return `${node.recordedPct}% recorded`;
}

export default function SyllabusTreeHome({
  initialTree,
  initialPrefs,
  initialSubject = '',
  initialTopic = '',
  userRole = 'FACULTY',
}) {
  const [tree, setTree] = useState(initialTree);
  const [exam, setExam] = useState(initialTree?.exam || initialPrefs?.defaultExam || 'UPSC_CSE_PRE');
  const [progressFilter, setProgressFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHits, setSearchHits] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loadingTree, setLoadingTree] = useState(false);
  const gridRef = useRef(null);

  const selectedSubject = useMemo(() => {
    if (!initialSubject || !tree?.subjects) return null;
    return tree.subjects.find((s) => s.name === initialSubject) || null;
  }, [tree, initialSubject]);

  const selectedTopic = useMemo(() => {
    if (!selectedSubject || !initialTopic) return null;
    return selectedSubject.topics.find((t) => t.name === initialTopic) || null;
  }, [selectedSubject, initialTopic]);

  const handleExamChange = async (nextExam) => {
    setExam(nextExam);
    setLoadingTree(true);
    try {
      await fetch('/api/admin/pyq/prefs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defaultExam: nextExam }),
      });
      const res = await fetch(`/api/admin/pyq/tree?exam=${encodeURIComponent(nextExam)}`);
      if (res.ok) {
        const data = await res.json();
        setTree(data);
      }
    } finally {
      setLoadingTree(false);
    }
  };

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchHits([]);
      return undefined;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/admin/pyq/search-sections?q=${encodeURIComponent(q)}&exam=${encodeURIComponent(exam)}`,
        );
        if (res.ok) {
          const data = await res.json();
          setSearchHits(data.hits || []);
        }
      } catch {
        // ignore transient search error
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [searchQuery, exam]);

  const rawItems = useMemo(() => {
    if (selectedSubject && selectedTopic && selectedTopic.themes.length > 0) {
      return selectedTopic.themes.map((th) => ({
        ...th,
        level: 'theme',
        href: `/admin/studio/pyq?view=list&subject=${encodeURIComponent(selectedSubject.name)}&topic=${encodeURIComponent(selectedTopic.name)}&search=${encodeURIComponent(th.name)}`,
      }));
    }
    if (selectedSubject) {
      return selectedSubject.topics.map((top) => ({
        ...top,
        level: 'topic',
        href:
          top.themes.length > 0
            ? `/admin/studio/pyq?subject=${encodeURIComponent(selectedSubject.name)}&topic=${encodeURIComponent(top.name)}`
            : `/admin/studio/pyq?view=list&subject=${encodeURIComponent(selectedSubject.name)}&topic=${encodeURIComponent(top.name)}`,
      }));
    }
    return (tree?.subjects || []).map((sub) => ({
      ...sub,
      level: 'subject',
      href: `/admin/studio/pyq?subject=${encodeURIComponent(sub.name)}`,
    }));
  }, [tree, selectedSubject, selectedTopic]);

  const items = useMemo(() => {
    if (progressFilter === 'all') return rawItems;
    return rawItems.filter((item) => getProgressState(item) === progressFilter);
  }, [rawItems, progressFilter]);

  const breadcrumbs = [{ label: 'Studio', href: '/admin/studio' }];
  if (!selectedSubject) {
    breadcrumbs.push({ label: 'PYQ Studio' });
  } else if (!selectedTopic) {
    breadcrumbs.push({ label: 'PYQ Studio', href: '/admin/studio/pyq' });
    breadcrumbs.push({ label: selectedSubject.name });
  } else {
    breadcrumbs.push({ label: 'PYQ Studio', href: '/admin/studio/pyq' });
    breadcrumbs.push({
      label: selectedSubject.name,
      href: `/admin/studio/pyq?subject=${encodeURIComponent(selectedSubject.name)}`,
    });
    breadcrumbs.push({ label: selectedTopic.name });
  }

  const handleGridKeyDown = (e) => {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
    const links = Array.from(gridRef.current?.querySelectorAll('a.pyq-tree-box') || []);
    const idx = links.indexOf(document.activeElement);
    if (idx === -1) return;
    e.preventDefault();
    const cols = Math.max(1, Math.floor((gridRef.current?.clientWidth || 900) / 274));
    let next = idx;
    if (e.key === 'ArrowRight') next = Math.min(links.length - 1, idx + 1);
    if (e.key === 'ArrowLeft') next = Math.max(0, idx - 1);
    if (e.key === 'ArrowDown') next = Math.min(links.length - 1, idx + cols);
    if (e.key === 'ArrowUp') next = Math.max(0, idx - cols);
    links[next]?.focus();
  };

  const skipLinkHref = selectedSubject && selectedTopic
    ? `/admin/studio/pyq?view=list&subject=${encodeURIComponent(selectedSubject.name)}&topic=${encodeURIComponent(selectedTopic.name)}`
    : selectedSubject
    ? `/admin/studio/pyq?view=list&subject=${encodeURIComponent(selectedSubject.name)}`
    : '/admin/studio/pyq?view=list';

  const skipLinkLabel = selectedSubject && selectedTopic
    ? `All questions in ${selectedTopic.name}`
    : selectedSubject
    ? `All questions in ${selectedSubject.name}`
    : 'All questions';

  return (
    <div className="pq-pyq-studio-root">
      <PageHeader
        breadcrumbs={breadcrumbs}
        secondaryActions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label htmlFor="tree-exam-select" className="pyq-ui-filter-label" style={{ margin: 0 }}>
              Exam
            </label>
            <select
              id="tree-exam-select"
              className="pyq-ui-filter-select"
              value={exam}
              onChange={(e) => handleExamChange(e.target.value)}
            >
              {EXAM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {userRole === 'ADMIN' && (
              <Link href="/admin/pyq" target="_blank" className="pyq-ui-secondary-btn">
                PYQ Editor
              </Link>
            )}
          </div>
        }
        primaryAction={
          <Link href={skipLinkHref} className="pyq-ui-primary-btn">
            <span>{skipLinkLabel}</span>
            <ArrowRight size={14} />
          </Link>
        }
      />

      {userRole === 'ADMIN' && !selectedSubject && tree?.totals && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            flexWrap: 'wrap',
            fontSize: 12.5,
            color: '#94a3b8',
            marginBottom: 14,
          }}
          aria-label="Content health summary"
        >
          <span style={{ fontWeight: 600, color: '#cbd5e1' }}>Content health:</span>
          <Link href="/admin/studio/pyq?view=list&status=HAS_EXPL" style={{ color: '#34d399', textDecoration: 'none' }}>
            {tree.totals.readyCount} Ready
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/admin/studio/pyq?view=list&status=MISSING_EXPL" style={{ color: '#fbbf24', textDecoration: 'none' }}>
            {tree.totals.needsExplanationCount} Needs explanation
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/admin/studio/pyq?view=list&status=MISSING_ANSWER" style={{ color: '#f87171', textDecoration: 'none' }}>
            {tree.totals.brokenCount} Broken
          </Link>
        </div>
      )}

      {initialPrefs?.lastSectionPath && !selectedSubject && (
        <Link href={initialPrefs.lastSectionPath} className="pyq-tree-continue">
          <div>
            <div style={{ fontSize: 12, color: '#38bdf8', fontWeight: 600 }}>Continue</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{initialPrefs.lastSectionPath}</div>
          </div>
          <ArrowRight size={16} />
        </Link>
      )}

      <div className="pyq-tree-controls">
        <div className="pyq-tree-search-wrap">
          <label htmlFor="tree-topic-search" className="pyq-ui-filter-label" style={{ display: 'block', marginBottom: 4 }}>
            Search a topic
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="tree-topic-search"
              type="search"
              className="pyq-ui-filter-input"
              style={{ width: '100%', paddingLeft: 32 }}
              placeholder="Jump to topic (e.g. Fundamental Rights)..."
              value={searchQuery}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 160)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
            />
            <Search
              size={15}
              style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8', pointerEvents: 'none' }}
            />
          </div>
          {searchOpen && searchHits.length > 0 && (
            <div className="pyq-tree-search-results" role="listbox" aria-label="Matching topics">
              {searchHits.map((hit, idx) => (
                <Link key={`${hit.href}-${idx}`} href={hit.href} className="pyq-ui-menu-item">
                  <span>{hit.label}</span>
                  <span style={{ color: '#94a3b8', fontSize: 12 }}>{hit.count}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="pyq-tree-tabs" role="group" aria-label="Progress filter">
          {PROGRESS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`pyq-tree-tab ${progressFilter === opt.value ? 'is-active' : ''}`}
              onClick={() => setProgressFilter(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loadingTree ? (
        <div style={{ padding: '48px 0', textAlign: 'center', color: '#94a3b8' }}>
          Loading syllabus tree...
        </div>
      ) : items.length === 0 ? (
        <div style={{ padding: '48px 0', textAlign: 'center', color: '#94a3b8' }}>
          No sections match the current filter.
        </div>
      ) : (
        <div
          ref={gridRef}
          className="pyq-tree-grid"
          onKeyDown={handleGridKeyDown}
        >
          {items.map((item) => {
            const state = getProgressState(item);
            const badgeStatus =
              item.brokenCount > 0
                ? 'broken'
                : state === 'recorded'
                ? 'recorded'
                : item.needsExplanationCount > 0
                ? 'incomplete'
                : 'ready';
            return (
              <Link key={item.name} href={item.href} className="pyq-tree-box">
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <h2 className="pyq-tree-box-title">{item.name}</h2>
                    {item.brokenCount > 0 && <StatusBadge status="broken" label={`${item.brokenCount} broken`} />}
                  </div>
                  <div className="pyq-tree-box-count">
                    <strong>{item.total}</strong> questions
                  </div>
                </div>

                <div>
                  <div className="pyq-tree-bar" aria-hidden="true">
                    <div
                      className="pyq-tree-bar-fill"
                      style={{
                        width: `${item.recordedPct}%`,
                        background: badgeStatus === 'broken' ? '#ef4444' : '#10b981',
                      }}
                    />
                  </div>
                  <div className="pyq-tree-box-meta">
                    <span>
                      {item.level === 'subject'
                        ? `${item.recordedPct}% recorded`
                        : formatNodeStatus(item)}
                    </span>
                    {item.needsExplanationCount > 0 && (
                      <span style={{ color: '#fbbf24' }}>
                        {item.needsExplanationCount} need explanation
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

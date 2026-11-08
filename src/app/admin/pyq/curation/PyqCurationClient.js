'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  RefreshCw,
  Link2,
  XCircle,
  CheckCircle,
  CheckSquare,
  Square,
  Star,
  ExternalLink,
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import './curation.css';

const SUBJECT_LIST = [
  'ALL',
  'Indian Polity',
  'Economy',
  'Geography',
  'Environment',
  'Sci-Tech',
  'Modern History',
  'Ancient & Medieval',
  'Art & Culture',
];

export default function PyqCurationClient({ session }) {
  const [clusters, setClusters] = useState([]);
  const [stats, setStats] = useState({
    totalFound: 0,
    unreviewedCount: 0,
    verifiedCount: 0,
    dismissedCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [statusTab, setStatusTab] = useState('unreviewed'); // 'unreviewed', 'verified', 'dismissed', 'all'
  const [searchFilter, setSearchFilter] = useState('');

  // Per-cluster interactive state
  const [clusterSelections, setClusterSelections] = useState({});
  const [clusterAnchors, setClusterAnchors] = useState({});
  const [clusterTakeaways, setClusterTakeaways] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [clusterAlerts, setClusterAlerts] = useState({});
  const [expandedOptions, setExpandedOptions] = useState({});

  const fetchClusters = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        subject: selectedSubject,
        status: statusTab,
        limit: '60',
      });
      const res = await fetch(`/api/admin/pyq/clusters?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to load clusters');
      }

      setClusters(data.clusters || []);
      setStats(data.stats || {});

      // Initialize selections & anchors for each cluster
      const initialSelections = {};
      const initialAnchors = {};
      const initialTakeaways = {};

      (data.clusters || []).forEach((c) => {
        initialSelections[c.id] = new Set(c.questions.map((q) => q.id));
        const anchorQ = c.questions.find((q) => q.isAnchor) || c.questions[0];
        initialAnchors[c.id] = anchorQ ? anchorQ.id : null;
        initialTakeaways[c.id] = c.defaultTakeaway || '';
      });

      setClusterSelections(initialSelections);
      setClusterAnchors(initialAnchors);
      setClusterTakeaways(initialTakeaways);
    } catch (err) {
      console.error('Error fetching candidate clusters:', err);
      setError(err.message || 'Failed to load candidate clusters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClusters();
  }, [selectedSubject, statusTab]);

  // Toggle question checkbox inside a cluster
  const toggleQuestionSelection = (clusterId, questionId) => {
    setClusterSelections((prev) => {
      const currentSet = new Set(prev[clusterId] || []);
      if (currentSet.has(questionId)) {
        currentSet.delete(questionId);
      } else {
        currentSet.add(questionId);
      }
      return { ...prev, [clusterId]: currentSet };
    });
  };

  // Select all in cluster
  const selectAllInCluster = (clusterId, allQuestionIds) => {
    setClusterSelections((prev) => ({
      ...prev,
      [clusterId]: new Set(allQuestionIds),
    }));
  };

  // Deselect all in cluster
  const deselectAllInCluster = (clusterId) => {
    setClusterSelections((prev) => ({
      ...prev,
      [clusterId]: new Set(),
    }));
  };

  // Set anchor question
  const setAnchorQuestion = (clusterId, questionId) => {
    setClusterAnchors((prev) => ({
      ...prev,
      [clusterId]: questionId,
    }));
    // Ensure anchor is also selected
    setClusterSelections((prev) => {
      const currentSet = new Set(prev[clusterId] || []);
      currentSet.add(questionId);
      return { ...prev, [clusterId]: currentSet };
    });
  };

  // Merge selected questions into a verified Similar PYQ Family
  const handleMergeCluster = async (cluster) => {
    const selectedIds = Array.from(clusterSelections[cluster.id] || []);
    if (selectedIds.length < 2) {
      alert('Please check at least 2 questions to club into a Similar PYQ Family.');
      return;
    }

    const anchorId = clusterAnchors[cluster.id] || selectedIds[0];
    const keyTakeaway = clusterTakeaways[cluster.id] || cluster.defaultTakeaway;

    setActionLoading((prev) => ({ ...prev, [cluster.id]: 'merge' }));
    setClusterAlerts((prev) => ({ ...prev, [cluster.id]: null }));

    try {
      const res = await fetch('/api/admin/pyq/clusters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'merge',
          anchorId,
          selectedIds,
          keyTakeaway,
          theme: cluster.theme,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to merge questions');
      }

      setClusterAlerts((prev) => ({
        ...prev,
        [cluster.id]: {
          type: 'success',
          text: `Linked ${data.count || selectedIds.length} questions into Similar Family!`,
        },
      }));

      // Update cluster status in state
      setClusters((prev) =>
        prev.map((c) =>
          c.id === cluster.id ? { ...c, status: 'verified', isMerged: true } : c
        )
      );

      // Refresh stats counters
      setStats((prev) => ({
        ...prev,
        unreviewedCount: Math.max(0, prev.unreviewedCount - 1),
        verifiedCount: (prev.verifiedCount || 0) + 1,
      }));
    } catch (err) {
      console.error('Error merging cluster:', err);
      setClusterAlerts((prev) => ({
        ...prev,
        [cluster.id]: {
          type: 'error',
          text: err.message || 'Merge failed',
        },
      }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [cluster.id]: null }));
    }
  };

  // Reject / Dismiss a candidate cluster
  const handleRejectCluster = async (cluster) => {
    if (!confirm(`Are you sure you want to dismiss this cluster? It will be marked as false-positive.`)) {
      return;
    }

    setActionLoading((prev) => ({ ...prev, [cluster.id]: 'reject' }));
    try {
      const res = await fetch('/api/admin/pyq/clusters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          clusterId: cluster.id,
          questionIds: cluster.questions.map((q) => q.id),
          reason: 'Curator rejected candidate match',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reject cluster');
      }

      // Remove cluster from active unreviewed list
      setClusters((prev) => prev.filter((c) => c.id !== cluster.id));
      setStats((prev) => ({
        ...prev,
        unreviewedCount: Math.max(0, prev.unreviewedCount - 1),
        dismissedCount: (prev.dismissedCount || 0) + 1,
      }));
    } catch (err) {
      console.error('Error rejecting cluster:', err);
      alert(err.message || 'Failed to dismiss cluster');
    } finally {
      setActionLoading((prev) => ({ ...prev, [cluster.id]: null }));
    }
  };

  // Export current clusters to JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ clusters, stats }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `upsc_similar_pyq_clusters_${selectedSubject.toLowerCase().replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Client-side search filter
  const filteredClusters = useMemo(() => {
    if (!searchFilter.trim()) return clusters;
    const term = searchFilter.toLowerCase().trim();
    return clusters.filter(
      (c) =>
        c.theme.toLowerCase().includes(term) ||
        c.subject.toLowerCase().includes(term) ||
        (c.sharedConcepts || []).some((tag) => tag.toLowerCase().includes(term)) ||
        c.questions.some(
          (q) =>
            q.stem.toLowerCase().includes(term) ||
            String(q.examYear).includes(term) ||
            String(q.questionNo).includes(term)
        )
    );
  }, [clusters, searchFilter]);

  return (
    <div className="pyq-curation-container">
      {/* HEADER BAR */}
      <header className="curation-header">
        <div className="curation-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Link
              href="/admin/pyq"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#38bdf8',
                fontSize: '0.86rem',
                fontWeight: 700,
                textDecoration: 'none',
                background: 'rgba(56, 189, 248, 0.1)',
                padding: '4px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(56, 189, 248, 0.25)',
              }}
            >
              <ArrowLeft size={14} />
              <span>Back to PYQ Manager</span>
            </Link>
            <span style={{ color: '#475569', fontSize: '0.8rem' }}>•</span>
            <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>
              Deterministic Concept Clustering Engine (2011–2026)
            </span>
          </div>

          <h1>Similar PYQ Candidate Clustering &amp; Clubbing Desk</h1>
          <p>
            Review automated cross-year concept clusters generated from UPSC Prelims stems and options.
            Select the questions belonging to the same conceptual lineage, designate the anchor, and merge into verified families.
          </p>
        </div>

        {/* STATS STRIP & ACTIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
          <div className="curation-stats-strip">
            <div className="stat-pill">
              <span className="stat-label">Candidate Clusters</span>
              <span className="stat-value">{stats.totalFound || clusters.length}</span>
            </div>
            <div className="stat-pill">
              <span className="stat-label">Pending Review</span>
              <span className="stat-value" style={{ color: '#38bdf8' }}>
                {stats.unreviewedCount || 0}
              </span>
            </div>
            <div className="stat-pill">
              <span className="stat-label">Verified Families</span>
              <span className="stat-value" style={{ color: '#10b981' }}>
                {stats.verifiedCount || 0}
              </span>
            </div>
            <div className="stat-pill">
              <span className="stat-label">Dismissed</span>
              <span className="stat-value" style={{ color: '#94a3b8' }}>
                {stats.dismissedCount || 0}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={fetchClusters}
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#e2e8f0',
                padding: '7px 14px',
                borderRadius: '10px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} className={loading ? 'spin-animation' : ''} />
              <span>Refresh Queue</span>
            </button>

            <button
              onClick={handleExportJson}
              disabled={clusters.length === 0}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                padding: '7px 14px',
                borderRadius: '10px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Download size={14} />
              <span>Export JSON</span>
            </button>
          </div>
        </div>
      </header>

      {/* FILTER & STATUS BAR */}
      <section className="curation-controls">
        {/* SUBJECT PILLS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Filter by Subject
            </span>

            {/* In-memory search input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(2, 6, 23, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '4px 10px',
              width: '260px'
            }}>
              <Search size={14} style={{ color: '#64748b' }} />
              <input
                type="text"
                placeholder="Search cluster theme or concept..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  width: '100%'
                }}
              />
            </div>
          </div>

          <div className="curation-subject-pills">
            {SUBJECT_LIST.map((subj) => (
              <button
                key={subj}
                className={`curation-pill ${selectedSubject === subj ? 'active' : ''}`}
                onClick={() => setSelectedSubject(subj)}
              >
                {subj}
              </button>
            ))}
          </div>
        </div>

        {/* STATUS TABS */}
        <div className="curation-status-tabs">
          <button
            className={`curation-tab ${statusTab === 'unreviewed' ? 'active' : ''}`}
            onClick={() => setStatusTab('unreviewed')}
          >
            <span>⏳ Pending Review</span>
            <span style={{
              background: statusTab === 'unreviewed' ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)',
              color: statusTab === 'unreviewed' ? '#030712' : '#94a3b8',
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '1px 6px',
              borderRadius: '999px',
            }}>
              {stats.unreviewedCount || 0}
            </span>
          </button>

          <button
            className={`curation-tab ${statusTab === 'verified' ? 'active' : ''}`}
            onClick={() => setStatusTab('verified')}
          >
            <span>✅ Verified Families</span>
            <span style={{
              background: statusTab === 'verified' ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
              color: statusTab === 'verified' ? '#030712' : '#94a3b8',
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '1px 6px',
              borderRadius: '999px',
            }}>
              {stats.verifiedCount || 0}
            </span>
          </button>

          <button
            className={`curation-tab ${statusTab === 'dismissed' ? 'active' : ''}`}
            onClick={() => setStatusTab('dismissed')}
          >
            <span>🚫 Dismissed</span>
            <span style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '1px 6px',
              borderRadius: '999px',
            }}>
              {stats.dismissedCount || 0}
            </span>
          </button>

          <button
            className={`curation-tab ${statusTab === 'all' ? 'active' : ''}`}
            onClick={() => setStatusTab('all')}
          >
            <span>🌐 All</span>
          </button>
        </div>
      </section>

      {/* ERROR ALERT */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1.5px solid #ef4444',
          borderRadius: '14px',
          padding: '16px 20px',
          marginBottom: '24px',
          color: '#fca5a5',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <AlertCircle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#ffffff', display: 'block' }}>Could not load clusters</strong>
            <span style={{ fontSize: '0.88rem' }}>{error}</span>
          </div>
        </div>
      )}

      {/* LOADING SPINNER */}
      {loading && (
        <div style={{
          padding: '80px 20px',
          textAlign: 'center',
          background: 'rgba(11, 16, 30, 0.5)',
          borderRadius: '20px',
          border: '1px dashed rgba(255, 255, 255, 0.1)',
          margin: '30px 0'
        }}>
          <RefreshCw size={32} className="spin-animation" style={{ color: '#38bdf8', marginBottom: '16px' }} />
          <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: '#f1f5f9' }}>
            Analyzing Cross-Year UPSC Token Overlaps...
          </h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
            Querying IDF token frequency index across published UPSC Prelims questions.
          </p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && filteredClusters.length === 0 && (
        <div style={{
          padding: '70px 20px',
          textAlign: 'center',
          background: 'rgba(11, 16, 30, 0.5)',
          borderRadius: '20px',
          border: '1px dashed rgba(255, 255, 255, 0.1)',
          margin: '30px 0'
        }}>
          <CheckCircle size={36} style={{ color: '#10b981', marginBottom: '14px' }} />
          <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', color: '#f1f5f9' }}>
            All Candidate Clusters Curated!
          </h3>
          <p style={{ margin: '0 0 20px 0', color: '#94a3b8', fontSize: '0.9rem', maxWidth: '480px', marginInline: 'auto' }}>
            There are no pending similar PYQ candidate clusters matching the current subject and status filter.
          </p>
          <button
            onClick={() => { setSelectedSubject('ALL'); setStatusTab('all'); }}
            style={{
              background: '#38bdf8',
              color: '#030712',
              fontWeight: 800,
              fontSize: '0.86rem',
              padding: '8px 18px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Show All Clusters
          </button>
        </div>
      )}

      {/* CLUSTERS FEED */}
      {!loading && filteredClusters.length > 0 && (
        <div className="clusters-feed">
          {filteredClusters.map((cluster, cIndex) => {
            const selectedSet = clusterSelections[cluster.id] || new Set();
            const currentAnchorId = clusterAnchors[cluster.id];
            const currentTakeaway = clusterTakeaways[cluster.id] || cluster.defaultTakeaway;
            const isActionBusy = !!actionLoading[cluster.id];
            const alertInfo = clusterAlerts[cluster.id];
            const allSelected = cluster.questions.every((q) => selectedSet.has(q.id));
            const selectedCount = selectedSet.size;

            return (
              <article key={cluster.id} className="cluster-card">
                {/* CLUSTER HEADER */}
                <header className="cluster-header">
                  <div className="cluster-title-wrap">
                    <span style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 800 }}>
                      #{cIndex + 1}
                    </span>
                    <h2 className="cluster-theme-title">{cluster.theme}</h2>
                    <span className="confidence-tag">
                      🎯 {cluster.confidence}% Match Confidence
                    </span>
                    {cluster.isMerged && (
                      <span style={{
                        background: 'rgba(16, 185, 129, 0.2)',
                        border: '1px solid #10b981',
                        color: '#10b981',
                        fontSize: '0.72rem',
                        fontWeight: 900,
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        ✓ VERIFIED FAMILY
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                      Years Spanned: <strong style={{ color: '#ffffff' }}>{cluster.years.join(', ')}</strong>
                    </span>

                    <div style={{ display: 'flex', gap: '6px', borderLeft: '1px solid rgba(255, 255, 255, 0.1)', paddingLeft: '10px' }}>
                      <button
                        type="button"
                        onClick={() =>
                          allSelected
                            ? deselectAllInCluster(cluster.id)
                            : selectAllInCluster(cluster.id, cluster.questions.map((q) => q.id))
                        }
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#cbd5e1',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {allSelected ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                  </div>
                </header>

                {/* SHARED CONCEPT CHIPS */}
                <div className="concept-tags-bar">
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, alignSelf: 'center', marginRight: '4px' }}>
                    SHARED CONCEPTS:
                  </span>
                  {cluster.sharedConcepts.map((concept, i) => (
                    <span key={i} className="concept-chip">
                      #{concept}
                    </span>
                  ))}
                  <span style={{ marginLeft: 'auto', fontSize: '0.74rem', color: '#94a3b8' }}>
                    Subject: <strong style={{ color: '#e2e8f0' }}>{cluster.subject}</strong>
                  </span>
                </div>

                {/* QUESTIONS LIST WITH CHECKBOXES */}
                <div className="cluster-questions-list">
                  {cluster.questions.map((q) => {
                    const isSelected = selectedSet.has(q.id);
                    const isAnchor = currentAnchorId === q.id;
                    const showOptions = !!expandedOptions[q.id];

                    return (
                      <div
                        key={q.id}
                        className={`question-row-card ${isSelected ? 'selected' : ''} ${isAnchor ? 'anchor' : ''}`}
                      >
                        {/* CHECKBOX */}
                        <input
                          type="checkbox"
                          className="question-select-checkbox"
                          checked={isSelected}
                          onChange={() => toggleQuestionSelection(cluster.id, q.id)}
                          title="Select / Unselect to include in Similar Family"
                        />

                        {/* QUESTION CONTENT */}
                        <div className="question-body">
                          {/* META ROW */}
                          <div className="question-meta-row">
                            <span className="year-badge">
                              {q.examName} {q.examYear}
                            </span>
                            <span className="qno-badge">
                              Q#{q.questionNo}
                            </span>
                            {q.topicName && (
                              <span style={{
                                background: 'rgba(56, 189, 248, 0.1)',
                                color: '#38bdf8',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '6px',
                              }}>
                                {q.topicName}
                              </span>
                            )}
                            {q.isVerified && (
                              <span style={{
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: '#10b981',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                padding: '2px 6px',
                                borderRadius: '4px',
                              }}>
                                ✓ Already Verified
                              </span>
                            )}

                            {/* ANCHOR SELECTOR BUTTON */}
                            <button
                              type="button"
                              className={`anchor-btn ${isAnchor ? 'active' : ''}`}
                              onClick={() => setAnchorQuestion(cluster.id, q.id)}
                              title={isAnchor ? "Primary Anchor Question for this conceptual cluster" : "Set as primary Anchor Question"}
                            >
                              <Star size={11} fill={isAnchor ? "#020617" : "none"} style={{ display: 'inline', marginRight: '4px' }} />
                              {isAnchor ? "Primary Anchor" : "Make Anchor"}
                            </button>

                            {/* Open in Visual Editor */}
                            <Link
                              href={`/admin/pyq/${q.id}`}
                              target="_blank"
                              style={{
                                color: '#94a3b8',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontSize: '0.72rem',
                                textDecoration: 'none',
                                marginLeft: '8px',
                              }}
                              title="Open in Visual Editor (New Tab)"
                            >
                              <span>Editor</span>
                              <ExternalLink size={11} />
                            </Link>
                          </div>

                          {/* STEM */}
                          <p className="question-stem">{q.stem}</p>

                          {/* OPTIONS EXPANDER */}
                          {Array.isArray(q.options) && q.options.length > 0 && (
                            <div>
                              <button
                                type="button"
                                onClick={() => setExpandedOptions((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#64748b',
                                  fontSize: '0.76rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: 0,
                                }}
                              >
                                {showOptions ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                <span>{showOptions ? 'Hide Options & Correct Answer' : `View ${q.options.length} Options (Answer: ${q.correctLabel?.toUpperCase() || 'N/A'})`}</span>
                              </button>

                              {showOptions && (
                                <div style={{
                                  marginTop: '8px',
                                  background: 'rgba(2, 6, 23, 0.6)',
                                  borderRadius: '8px',
                                  padding: '10px 12px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '6px',
                                  border: '1px solid rgba(255, 255, 255, 0.05)'
                                }}>
                                  {q.options.map((opt, oIdx) => {
                                    const isCorrect = q.correctLabel && opt.label?.toLowerCase() === q.correctLabel.toLowerCase();
                                    return (
                                      <div
                                        key={oIdx}
                                        style={{
                                          fontSize: '0.82rem',
                                          color: isCorrect ? '#34d399' : '#cbd5e1',
                                          fontWeight: isCorrect ? 700 : 500,
                                          display: 'flex',
                                          gap: '8px',
                                        }}
                                      >
                                        <span style={{
                                          width: '18px',
                                          height: '18px',
                                          borderRadius: '4px',
                                          background: isCorrect ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                                          color: isCorrect ? '#34d399' : '#94a3b8',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          fontSize: '0.72rem',
                                          flexShrink: 0
                                        }}>
                                          {opt.label?.toUpperCase()}
                                        </span>
                                        <span>{opt.text}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* CLUSTER FOOTER & ACTIONS */}
                <footer className="cluster-footer">
                  {/* EDITABLE KEY TAKEAWAY NOTE */}
                  <div className="takeaway-input-wrap">
                    <label className="takeaway-label">
                      Conceptual Linkage Note (Cross-Year Pattern Decoder)
                    </label>
                    <input
                      type="text"
                      className="takeaway-input"
                      value={currentTakeaway}
                      onChange={(e) =>
                        setClusterTakeaways((prev) => ({
                          ...prev,
                          [cluster.id]: e.target.value,
                        }))
                      }
                      placeholder="e.g. Recurrent testing pattern: Fifth vs Sixth Schedule tribal councils across 2022-2026."
                    />
                  </div>

                  {/* SUCCESS / ERROR ALERTS */}
                  {alertInfo && (
                    <div style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      background: alertInfo.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: alertInfo.type === 'success' ? '#34d399' : '#fca5a5',
                      border: `1px solid ${alertInfo.type === 'success' ? '#10b981' : '#ef4444'}`
                    }}>
                      {alertInfo.text}
                    </div>
                  )}

                  {/* ACTION BUTTONS */}
                  <div className="cluster-action-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.84rem', color: '#94a3b8' }}>
                        Selected: <strong style={{ color: selectedCount >= 2 ? '#38bdf8' : '#f87171' }}>{selectedCount}</strong> of {cluster.questions.length} questions
                      </span>
                      {selectedCount < 2 && (
                        <span style={{ fontSize: '0.76rem', color: '#f87171' }}>
                          (Select at least 2 questions to merge)
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      {/* REJECT / DISMISS BUTTON */}
                      <button
                        type="button"
                        className="btn-reject"
                        disabled={isActionBusy}
                        onClick={() => handleRejectCluster(cluster)}
                      >
                        <XCircle size={15} />
                        <span>Reject / Dismiss</span>
                      </button>

                      {/* MERGE BUTTON */}
                      <button
                        type="button"
                        className="btn-merge"
                        disabled={isActionBusy || selectedCount < 2}
                        onClick={() => handleMergeCluster(cluster)}
                      >
                        <Link2 size={16} />
                        <span>
                          {isActionBusy === 'merge' ? 'Merging Family...' : `Club & Merge ${selectedCount} Selected Questions`}
                        </span>
                      </button>
                    </div>
                  </div>
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Layers,
  MapPin,
  CheckCircle2,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Filter,
  Calendar,
  Search,
  RefreshCw,
  Star,
  Archive,
  ChevronRight,
  ExternalLink,
  AlertCircle,
  FolderSync,
} from 'lucide-react';

export default function PinCurationClient() {
  const [activeTab, setActiveTab] = useState('clusters'); // 'clusters' | 'weekly' | 'master'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Overview metrics
  const [metrics, setMetrics] = useState({
    total: 0,
    masterCount: 0,
    dailyCount: 0,
    archivedCount: 0,
    uncuratedCount: 0,
    candidateClustersCount: 0,
  });

  // Clusters state
  const [clusters, setClusters] = useState([]);
  const [clusterTitles, setClusterTitles] = useState({});
  const [actionLoading, setActionLoading] = useState({});

  // Clearing & backlog state
  const [filterMode, setFilterMode] = useState('uncurated'); // 'uncurated' | '7' | '30' | '90' | '365' | 'all'
  const [weeklyPins, setWeeklyPins] = useState([]);
  const [selectedPinIds, setSelectedPinIds] = useState(new Set());
  const [weeklySearch, setWeeklySearch] = useState('');

  // Master Deck state
  const [masterPins, setMasterPins] = useState([]);
  const [masterSearch, setMasterSearch] = useState('');

  const showFeedback = (msg, type = 'success') => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 4500);
  };

  const loadAllData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [statusRes, clustersRes, weeklyRes, masterRes] = await Promise.all([
        fetch('/api/admin/pin/curate?mode=status'),
        fetch('/api/admin/pin/curate?mode=clusters'),
        fetch(`/api/admin/pin/curate?mode=weekly&filter=${filterMode}`),
        fetch('/api/mapping/pin?tier=MASTER&resolvePyqs=false'),
      ]);

      if (statusRes.ok) {
        const s = await statusRes.json();
        setMetrics({
          total: s.total,
          masterCount: s.masterCount,
          dailyCount: s.dailyCount,
          archivedCount: s.archivedCount,
          uncuratedCount: s.uncuratedCount,
          candidateClustersCount: s.candidateClustersCount,
        });
      }

      if (clustersRes.ok) {
        const c = await clustersRes.json();
        setClusters(c.clusters || []);
        // Pre-fill default titles
        const titles = {};
        (c.clusters || []).forEach((cl) => {
          titles[cl.clusterId] = cl.primaryPin.place;
        });
        setClusterTitles(titles);
      }

      if (weeklyRes.ok) {
        const w = await weeklyRes.json();
        setWeeklyPins(w.pins || []);
      }

      if (masterRes.ok) {
        const m = await masterRes.json();
        setMasterPins(m.pins || []);
      }
    } catch (err) {
      console.error('Failed to load curation data:', err);
      showFeedback('Error loading curation data: ' + err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterMode]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Handle merging a cluster
  const handleMergeCluster = async (cluster) => {
    const clusterId = cluster.clusterId;
    const title = clusterTitles[clusterId] || cluster.primaryPin.place;
    const childIds = cluster.members.slice(1).map((m) => m.id);

    setActionLoading((prev) => ({ ...prev, [clusterId]: true }));
    try {
      const res = await fetch('/api/admin/pin/curate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'merge',
          parentId: cluster.primaryPin.id,
          childIds,
          newPlaceTitle: title,
          mergeNotes: `Merged via Web Curation Hub on ${new Date().toISOString().split('T')[0]}`,
        }),
      });

      if (!res.ok) throw new Error('Merge request failed');
      const data = await res.json();

      showFeedback(`✔ Successfully merged ${data.mergedChildrenCount} pins into Master Anchor "${title}"!`);
      // Remove from clusters list locally
      setClusters((prev) => prev.filter((c) => c.clusterId !== clusterId));
      setMetrics((prev) => ({
        ...prev,
        candidateClustersCount: Math.max(0, prev.candidateClustersCount - 1),
        masterCount: prev.masterCount + 1,
        archivedCount: prev.archivedCount + childIds.length,
        dailyCount: Math.max(0, prev.dailyCount - childIds.length - 1),
      }));
    } catch (err) {
      showFeedback('Failed to merge: ' + err.message, 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [clusterId]: false }));
    }
  };

  // Handle keeping cluster pins separate
  const handleKeepSeparate = async (cluster) => {
    const clusterId = cluster.clusterId;
    const pinIds = cluster.members.map((m) => m.id);

    setActionLoading((prev) => ({ ...prev, [clusterId]: true }));
    try {
      const res = await fetch('/api/admin/pin/curate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_tier',
          pinIds,
          tier: 'daily',
        }),
      });

      if (!res.ok) throw new Error('Update failed');
      showFeedback('Marked pins as separate and reviewed.');
      setClusters((prev) => prev.filter((c) => c.clusterId !== clusterId));
      setMetrics((prev) => ({
        ...prev,
        candidateClustersCount: Math.max(0, prev.candidateClustersCount - 1),
      }));
    } catch (err) {
      showFeedback('Failed: ' + err.message, 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [clusterId]: false }));
    }
  };

  // Handle individual pin tier change
  const handleSetTier = async (pinId, newTier) => {
    try {
      const res = await fetch('/api/admin/pin/curate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_tier',
          pinIds: [pinId],
          tier: newTier,
        }),
      });
      if (!res.ok) throw new Error('Failed to update tier');

      // Update locally
      setWeeklyPins((prev) =>
        prev.map((p) => (p.id === pinId ? { ...p, tier: newTier, isCurated: true } : p))
      );
      showFeedback(`Updated pin tier to ${newTier.toUpperCase()}`);
      loadAllData();
    } catch (err) {
      showFeedback(err.message, 'error');
    }
  };

  // Handle batch tier update
  const handleBatchTier = async (tier) => {
    const ids = Array.from(selectedPinIds);
    if (ids.length === 0) return;

    try {
      const res = await fetch('/api/admin/pin/curate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_tier',
          pinIds: ids,
          tier,
        }),
      });
      if (!res.ok) throw new Error('Batch update failed');

      showFeedback(`Updated ${ids.length} pins to ${tier.toUpperCase()}`);
      setSelectedPinIds(new Set());
      loadAllData();
    } catch (err) {
      showFeedback(err.message, 'error');
    }
  };

  const toggleSelectAllWeekly = () => {
    if (selectedPinIds.size === weeklyPins.length) {
      setSelectedPinIds(new Set());
    } else {
      setSelectedPinIds(new Set(weeklyPins.map((p) => p.id)));
    }
  };

  const toggleSelectPin = (id) => {
    setSelectedPinIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#090d16', color: '#f8fafc', padding: '24px 28px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Header */}
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>✨</span>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#f8fafc' }}>
              Atlas Mapping Curation Hub
            </h1>
            <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              EDITORIAL CONTROL
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#94a3b8' }}>
            Logical clustering, parent-anchor merging, and weekly pruning to maintain a clean ~180-pin Prelims revision deck.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={loadAllData}
            disabled={refreshing}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <Link
            href="/admin/pin"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#38bdf8', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
          >
            <FolderSync size={14} />
            PIN Ingestion Console
          </Link>
          <Link
            href="/atlas"
            target="_blank"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: '#0284c7', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
          >
            <ExternalLink size={14} />
            Open Student Atlas
          </Link>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div style={{ maxWidth: 1280, margin: '0 auto 20px', padding: '12px 18px', borderRadius: 8, background: feedback.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)', border: feedback.type === 'error' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)', color: feedback.type === 'error' ? '#fca5a5' : '#86efac', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          {feedback.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          {feedback.msg}
        </div>
      )}

      {/* Metrics Row */}
      <div style={{ maxWidth: 1280, margin: '0 auto 24px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
        <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 18px' }}>
          <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <MapPin size={14} color="#38bdf8" />
            Total Places in News
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 8, color: '#f8fafc' }}>
            {metrics.total}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
            In database registry
          </div>
        </div>

        <div style={{ background: '#0f172a', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 12, padding: '16px 18px' }}>
          <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Star size={14} color="#f59e0b" />
            Master Prelims Core
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 8, color: '#fbbf24' }}>
            {metrics.masterCount}
          </div>
          <div style={{ fontSize: 11, color: '#fde68a', marginTop: 4 }}>
            Permanent revision anchors (Target: ~180)
          </div>
        </div>

        <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 18px' }}>
          <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={14} color="#a855f7" />
            Active Daily Logs
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 8, color: '#e2e8f0' }}>
            {metrics.dailyCount}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
            Individual date pins
          </div>
        </div>

        <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 18px' }}>
          <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Archive size={14} color="#64748b" />
            Pruned / Merged
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 8, color: '#94a3b8' }}>
            {metrics.archivedCount}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
            Hidden from main map
          </div>
        </div>

        <div style={{ background: '#0f172a', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 12, padding: '16px 18px' }}>
          <div style={{ fontSize: 12, color: '#f87171', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Layers size={14} color="#f87171" />
            Merge Candidates
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 8, color: '#fca5a5' }}>
            {metrics.candidateClustersCount}
          </div>
          <div style={{ fontSize: 11, color: '#f87171', marginTop: 4 }}>
            Clusters needing review
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ maxWidth: 1280, margin: '0 auto 20px', display: 'flex', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 12 }}>
        <button
          onClick={() => setActiveTab('clusters')}
          style={{
            padding: '10px 18px',
            borderRadius: 8,
            border: activeTab === 'clusters' ? '1px solid #38bdf8' : '1px solid transparent',
            background: activeTab === 'clusters' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            color: activeTab === 'clusters' ? '#38bdf8' : '#94a3b8',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Layers size={16} />
          Smart Merge Queue ({clusters.length})
        </button>

        <button
          onClick={() => setActiveTab('weekly')}
          style={{
            padding: '10px 18px',
            borderRadius: 8,
            border: activeTab === 'weekly' ? '1px solid #38bdf8' : '1px solid transparent',
            background: activeTab === 'weekly' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            color: activeTab === 'weekly' ? '#38bdf8' : '#94a3b8',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Calendar size={16} />
          Weekly Clearing &amp; Elevation
        </button>

        <button
          onClick={() => setActiveTab('master')}
          style={{
            padding: '10px 18px',
            borderRadius: 8,
            border: activeTab === 'master' ? '1px solid #f59e0b' : '1px solid transparent',
            background: activeTab === 'master' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
            color: activeTab === 'master' ? '#f59e0b' : '#94a3b8',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Star size={16} />
          Master Prelims Deck ({metrics.masterCount})
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* TAB 1: SMART MERGE QUEUE */}
        {activeTab === 'clusters' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                  Candidate Spatial &amp; Corridor Clusters
                </h2>
                <p style={{ fontSize: 12.5, color: '#94a3b8', margin: '4px 0 0' }}>
                  The engine detected these entries occurring within 75 km or along the same geographic corridor. Review and merge into single Master Anchors.
                </p>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
                Analyzing spatial clusters across database...
              </div>
            ) : clusters.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', background: '#0f172a', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                <CheckCircle2 size={36} color="#22c55e" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ margin: 0, fontSize: 16, color: '#f8fafc' }}>All Clusters Resolved!</h3>
                <p style={{ margin: '6px 0 0', fontSize: 13, color: '#94a3b8' }}>
                  No candidate duplicates or overlapping pins currently detected. All active pins are spatially distinct.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {clusters.map((cluster, cIdx) => {
                  const primary = cluster.primaryPin;
                  const children = cluster.members.slice(1);
                  const isProcessing = actionLoading[cluster.clusterId];

                  return (
                    <div
                      key={cluster.clusterId}
                      style={{
                        background: '#0f172a',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 12,
                        padding: 20,
                        opacity: isProcessing ? 0.6 : 1,
                      }}
                    >
                      {/* Cluster Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 12, marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 12, fontWeight: 800, background: '#1e293b', padding: '3px 8px', borderRadius: 6, color: '#cbd5e1' }}>
                            Cluster #{cIdx + 1}
                          </span>
                          <span style={{ fontSize: 12, color: '#38bdf8', fontWeight: 600 }}>
                            {children.length + 1} overlapping places detected
                          </span>
                        </div>
                        <span style={{ fontSize: 11.5, color: '#94a3b8' }}>
                          Primary Anchor ID: {primary.pinId}
                        </span>
                      </div>

                      {/* Primary Anchor Card */}
                      <div style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 11, fontWeight: 800, background: '#0284c7', color: '#fff', padding: '2px 6px', borderRadius: 4 }}>
                                PRIMARY ANCHOR
                              </span>
                              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#f8fafc' }}>
                                {primary.place}
                              </h3>
                              <span style={{ fontSize: 12, color: '#94a3b8' }}>
                                ({primary.date})
                              </span>
                            </div>
                            <div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 4 }}>
                              📍 {primary.locatedIn?.placeLine || 'Coordinates: ' + (primary.lat ?? 'N/A') + ', ' + (primary.lng ?? 'N/A')}
                            </div>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 4, color: '#94a3b8' }}>
                            {primary.subject}
                          </span>
                        </div>

                        {/* News Hook */}
                        <div style={{ marginTop: 8, fontSize: 12.5, color: '#94a3b8', lineHeight: 1.5, borderLeft: '2px solid #0284c7', paddingLeft: 10 }}>
                          <strong style={{ color: '#e2e8f0' }}>Why in News: </strong>
                          {primary.newsTriggers?.[0]?.newsHook || 'No hook available'}
                        </div>
                      </div>

                      {/* Children / Candidates */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginLeft: 20, marginBottom: 16 }}>
                        {children.map((child, idx) => (
                          <div
                            key={child.id}
                            style={{
                              background: 'rgba(255,255,255,0.02)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              borderRadius: 8,
                              padding: '12px 14px',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(248, 113, 113, 0.2)', color: '#f87171', padding: '2px 6px', borderRadius: 4 }}>
                                  CANDIDATE #{idx + 1}
                                </span>
                                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>
                                  {child.place}
                                </h4>
                                <span style={{ fontSize: 11.5, color: '#64748b' }}>({child.date})</span>
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: 4 }}>
                                {child.matchReason}
                              </span>
                            </div>
                            <div style={{ marginTop: 6, fontSize: 12, color: '#94a3b8', paddingLeft: 8 }}>
                              <strong>Hook: </strong>
                              {child.newsTriggers?.[0]?.newsHook || 'No hook'}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Merge Action Form */}
                      <div style={{ background: '#1e293b', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>
                            MASTER ANCHOR TITLE AFTER MERGE:
                          </label>
                          <input
                            type="text"
                            value={clusterTitles[cluster.clusterId] || ''}
                            onChange={(e) =>
                              setClusterTitles((prev) => ({
                                ...prev,
                                [cluster.clusterId]: e.target.value,
                              }))
                            }
                            style={{
                              width: '100%',
                              padding: '7px 10px',
                              borderRadius: 6,
                              background: '#0f172a',
                              border: '1px solid rgba(255,255,255,0.15)',
                              color: '#fff',
                              fontSize: 13,
                              fontWeight: 600,
                            }}
                            placeholder="e.g. Upper Brahmaputra Petroleum Corridor (Burhi Dihing)"
                          />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
                          <button
                            onClick={() => handleMergeCluster(cluster)}
                            disabled={isProcessing}
                            style={{
                              padding: '8px 16px',
                              borderRadius: 6,
                              background: '#0284c7',
                              border: 'none',
                              color: '#fff',
                              fontSize: 13,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            <Sparkles size={14} />
                            Merge into Master Anchor
                          </button>

                          <button
                            onClick={() => handleKeepSeparate(cluster)}
                            disabled={isProcessing}
                            style={{
                              padding: '8px 14px',
                              borderRadius: 6,
                              background: 'transparent',
                              border: '1px solid rgba(255,255,255,0.15)',
                              color: '#cbd5e1',
                              fontSize: 12.5,
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Keep Separate
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CLEARING, ELEVATION & HISTORICAL BACKLOG */}
        {activeTab === 'weekly' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                  Clearing, Elevation &amp; Historical Backlog
                </h2>
                <p style={{ fontSize: 12.5, color: '#94a3b8', margin: '4px 0 0' }}>
                  Review current and historical entries. Curate the uncurated backlog, elevate to <strong>Master Prelims Deck</strong> (⭐), or archive.
                </p>
              </div>

              {/* Timeframe & Backlog Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0f172a', padding: 4, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap' }}>
                {[
                  { id: 'uncurated', label: `⏳ Uncurated Backlog (${metrics.uncuratedCount})`, highlight: true },
                  { id: '7', label: 'Past 7 Days' },
                  { id: '30', label: 'Past 30 Days' },
                  { id: '90', label: 'Past 90 Days' },
                  { id: '365', label: 'Past 1 Year' },
                  { id: 'all', label: `All Database (${metrics.total})` },
                ].map((tf) => {
                  const isActive = filterMode === tf.id;
                  const isHighlight = tf.highlight && metrics.uncuratedCount > 0;
                  return (
                    <button
                      key={tf.id}
                      onClick={() => setFilterMode(tf.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: isHighlight && !isActive
                          ? '1px dashed #f59e0b'
                          : 'none',
                        background: isActive
                          ? isHighlight
                            ? '#f59e0b'
                            : '#0284c7'
                          : isHighlight
                          ? 'rgba(245, 158, 11, 0.1)'
                          : 'transparent',
                        color: isActive
                          ? isHighlight
                            ? '#000'
                            : '#fff'
                          : isHighlight
                          ? '#fbbf24'
                          : '#94a3b8',
                        fontSize: 12,
                        fontWeight: isActive || isHighlight ? 700 : 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {tf.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Batch Action Bar + Search */}
            <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="checkbox"
                  checked={selectedPinIds.size === weeklyPins.length && weeklyPins.length > 0}
                  onChange={toggleSelectAllWeekly}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 600 }}>
                  {selectedPinIds.size} of {weeklyPins.length} selected
                </span>
              </div>

              {/* In-batch Search */}
              <div style={{ position: 'relative', width: 280 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  value={weeklySearch}
                  onChange={(e) => setWeeklySearch(e.target.value)}
                  placeholder="Filter places, states, hooks..."
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 30px',
                    borderRadius: 6,
                    background: '#090d16',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#fff',
                    fontSize: 12,
                  }}
                />
              </div>

              {selectedPinIds.size > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => handleBatchTier('master')}
                    style={{ padding: '6px 12px', borderRadius: 6, background: 'rgba(245, 158, 11, 0.2)', border: '1px solid #f59e0b', color: '#fbbf24', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Star size={13} />
                    Elevate to Master Core
                  </button>
                  <button
                    onClick={() => handleBatchTier('daily')}
                    style={{ padding: '6px 12px', borderRadius: 6, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Keep as Daily Log
                  </button>
                  <button
                    onClick={() => handleBatchTier('archived')}
                    style={{ padding: '6px 12px', borderRadius: 6, background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Trash2 size={13} />
                    Archive from Map
                  </button>
                </div>
              )}
            </div>

            {/* Weekly Pin List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {weeklyPins.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
                  No entries found for this filter.
                </div>
              ) : (
                weeklyPins
                  .filter((p) => {
                    if (!weeklySearch.trim()) return true;
                    const q = weeklySearch.toLowerCase();
                    return (
                      (p.place || '').toLowerCase().includes(q) ||
                      (p.locatedIn?.placeLine || '').toLowerCase().includes(q) ||
                      (p.locatedIn?.stateOrProvince || '').toLowerCase().includes(q) ||
                      (p.newsTriggers?.[0]?.newsHook || '').toLowerCase().includes(q)
                    );
                  })
                  .map((pin) => {
                  const isSelected = selectedPinIds.has(pin.id);
                  const isMaster = pin.tier === 'master';
                  const isArchived = pin.tier === 'archived';

                  return (
                    <div
                      key={pin.id}
                      style={{
                        background: '#0f172a',
                        border: isMaster
                          ? '1px solid rgba(245, 158, 11, 0.4)'
                          : isArchived
                          ? '1px solid rgba(255,255,255,0.04)'
                          : '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 8,
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 16,
                        opacity: isArchived ? 0.5 : 1,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectPin(pin.id)}
                          style={{ cursor: 'pointer' }}
                        />

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#f8fafc' }}>
                              {pin.place}
                            </h4>
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>({pin.date})</span>
                            {isMaster && (
                              <span style={{ fontSize: 10, fontWeight: 800, background: '#f59e0b', color: '#000', padding: '1px 6px', borderRadius: 4 }}>
                                ⭐ MASTER
                              </span>
                            )}
                            {isArchived && (
                              <span style={{ fontSize: 10, fontWeight: 700, background: '#334155', color: '#94a3b8', padding: '1px 6px', borderRadius: 4 }}>
                                ARCHIVED
                              </span>
                            )}
                          </div>

                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                            {pin.locatedIn?.placeLine || 'India'}
                          </div>

                          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                            {pin.newsTriggers?.[0]?.newsHook?.slice(0, 110) || 'No hook'}...
                          </div>
                        </div>
                      </div>

                      {/* Tier Toggle Switch */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button
                          onClick={() => handleSetTier(pin.id, 'master')}
                          style={{
                            padding: '6px 10px',
                            borderRadius: 6,
                            border: 'none',
                            background: isMaster ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                            color: isMaster ? '#000' : '#cbd5e1',
                            fontSize: 11.5,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          ⭐ Master
                        </button>

                        <button
                          onClick={() => handleSetTier(pin.id, 'daily')}
                          style={{
                            padding: '6px 10px',
                            borderRadius: 6,
                            border: 'none',
                            background: !isMaster && !isArchived ? '#0284c7' : 'rgba(255,255,255,0.05)',
                            color: !isMaster && !isArchived ? '#fff' : '#cbd5e1',
                            fontSize: 11.5,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          📅 Daily
                        </button>

                        <button
                          onClick={() => handleSetTier(pin.id, 'archived')}
                          style={{
                            padding: '6px 10px',
                            borderRadius: 6,
                            border: 'none',
                            background: isArchived ? '#ef4444' : 'rgba(255,255,255,0.05)',
                            color: isArchived ? '#fff' : '#cbd5e1',
                            fontSize: 11.5,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          📦 Prune
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 3: MASTER PRELIMS DECK */}
        {activeTab === 'master' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#f59e0b' }}>
                  ⭐ Master Prelims Deck ({masterPins.length} Anchors)
                </h2>
                <p style={{ fontSize: 12.5, color: '#94a3b8', margin: '4px 0 0' }}>
                  These are the permanent high-yield pins visible to students revising for Prelims. Capped at ~180 to guarantee optimal retention.
                </p>
              </div>

              {/* Search */}
              <div style={{ position: 'relative', width: 300 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  value={masterSearch}
                  onChange={(e) => setMasterSearch(e.target.value)}
                  placeholder="Search master anchors..."
                  style={{
                    width: '100%',
                    padding: '7px 10px 7px 32px',
                    borderRadius: 6,
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff',
                    fontSize: 12.5,
                  }}
                />
              </div>
            </div>

            {/* Master Grid */}
            {masterPins.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', background: '#0f172a', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                <Star size={36} color="#f59e0b" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ margin: 0, fontSize: 16, color: '#f8fafc' }}>No Master Anchors Elevated Yet</h3>
                <p style={{ margin: '6px 0 0', fontSize: 13, color: '#94a3b8' }}>
                  Merge candidate clusters in Tab 1 or elevate entries in Tab 2 to populate your Master Prelims Deck.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                {masterPins
                  .filter((p) =>
                    masterSearch
                      ? p.place.toLowerCase().includes(masterSearch.toLowerCase()) ||
                        (p.locatedIn?.placeLine || '').toLowerCase().includes(masterSearch.toLowerCase())
                      : true
                  )
                  .map((pin) => (
                    <div
                      key={pin.id}
                      style={{
                        background: '#0f172a',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        borderRadius: 10,
                        padding: 16,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Star size={14} color="#f59e0b" />
                            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#f8fafc' }}>
                              {pin.place}
                            </h4>
                          </div>
                          <div style={{ fontSize: 12, color: '#38bdf8', marginTop: 4 }}>
                            {pin.locatedIn?.placeLine || 'N/A'}
                          </div>
                        </div>

                        <button
                          onClick={() => handleSetTier(pin.id, 'daily')}
                          title="Demote to daily log"
                          style={{
                            padding: '4px 8px',
                            borderRadius: 4,
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#94a3b8',
                            fontSize: 11,
                            cursor: 'pointer',
                          }}
                        >
                          Demote
                        </button>
                      </div>

                      <div style={{ marginTop: 10, fontSize: 12, color: '#cbd5e1', lineHeight: 1.4 }}>
                        <strong>Hook: </strong>
                        {pin.newsTriggers?.[0]?.newsHook || 'No hook'}
                      </div>

                      {Array.isArray(pin.staticFacts) && pin.staticFacts.length > 0 && (
                        <div style={{ marginTop: 8, fontSize: 11.5, color: '#94a3b8' }}>
                          <strong>Anchor: </strong>
                          {pin.staticFacts[0]}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

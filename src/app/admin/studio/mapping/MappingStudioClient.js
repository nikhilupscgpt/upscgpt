'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Compass,
  Search,
  CheckSquare,
  Square,
  Play,
  RotateCcw,
  Image as ImageIcon,
  ChevronRight,
  ExternalLink,
  Layers,
  X,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ArrowLeft,
  MapPin,
  Globe,
  Radio,
  Filter,
} from 'lucide-react';
import './mapping-studio.css';

const MAPPING_CATEGORIES = [
  { value: 'ALL', label: 'All Mapping Categories' },
  { value: 'rivers', label: 'Rivers, Lakes & Glaciers' },
  { value: 'hills', label: 'Mountains, Hills & Passes' },
  { value: 'protected', label: 'National Parks & Sanctuaries' },
  { value: 'ramsar', label: 'Ramsar Wetlands' },
  { value: 'ports', label: 'Ports, Straits & Corridors' },
  { value: 'minerals', label: 'Minerals & Industrial Belts' },
  { value: 'world physical', label: 'World Physical (Seas, Deserts, Plateaus)' },
  { value: 'places in news', label: 'Places in News (Geopolitical)' },
];

const PILLAR_TABS = [
  { id: 'ALL', label: 'All Mapping', countKey: 'allCount' },
  { id: 'INDIA_STATIC', label: 'India Static', countKey: 'indiaStaticCount' },
  { id: 'WORLD_STATIC', label: 'World Static', countKey: 'worldStaticCount' },
  { id: 'PIN', label: 'Places in News (PIN)', countKey: 'pinCount' },
  { id: 'IR', label: 'IR & Organizations', countKey: 'irCount' },
  { id: 'PYQ', label: 'Mapping PYQs', countKey: 'pyqCount' },
];

export default function MappingStudioClient() {
  // 4-Pillar + PYQ Filters (aligned with /mapping user flow)
  const [search, setSearch] = useState('');
  const [pillar, setPillar] = useState('ALL'); // ALL | INDIA_STATIC | WORLD_STATIC | PIN | IR | PYQ
  const [tier, setTier] = useState('ALL'); // ALL | master | daily
  const [category, setCategory] = useState('ALL');
  const [subject, setSubject] = useState('ALL');
  const [year, setYear] = useState('ALL');
  const [limit, setLimit] = useState(50);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [taxonomy, setTaxonomy] = useState({ subjects: [], mapCategories: [] });

  const activeFilterCount =
    (pillar !== 'ALL' ? 1 : 0) +
    (tier !== 'ALL' ? 1 : 0) +
    (category !== 'ALL' ? 1 : 0) +
    (subject !== 'ALL' ? 1 : 0) +
    (year !== 'ALL' ? 1 : 0);

  // Data
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({
    allCount: 0,
    indiaStaticCount: 0,
    worldStaticCount: 0,
    staticCount: 0,
    pinCount: 0,
    masterPinCount: 0,
    dailyPinCount: 0,
    irCount: 0,
    orgCount: 0,
    pyqCount: 0,
  });
  const [loading, setLoading] = useState(true);

  // Selection & Custom Attachment state
  const [selectedIds, setSelectedIds] = useState([]);
  const [customAttachments, setCustomAttachments] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('pq_studio_attachments');
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {};
  });

  // Modal for attaching map / diagram
  const [activeAttachItem, setActiveAttachItem] = useState(null);
  const [attachUrl, setAttachUrl] = useState('');
  const [attachCaption, setAttachCaption] = useState('');

  // -------------------------------------------------------------
  // Data Fetching
  // -------------------------------------------------------------
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (pillar !== 'ALL') params.set('pillar', pillar);
      if (tier !== 'ALL') params.set('tier', tier);
      if (category !== 'ALL') params.set('category', category);
      if (subject !== 'ALL') params.set('subject', subject);
      if (year !== 'ALL') params.set('year', year);
      if (search.trim()) params.set('search', search.trim());
      params.set('limit', String(limit));

      const res = await fetch(`/api/admin/studio/mapping?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch mapping items');
      const data = await res.json();

      setItems(data.items || []);
      setTotal(data.total || 0);
      if (data.stats) setStats(data.stats);
      if (data.taxonomy) setTaxonomy(data.taxonomy);
    } catch (err) {
      console.error('[Mapping Studio] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [pillar, tier, category, subject, year, search, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sync custom attachments to sessionStorage for the Presenter to pick up
  const handleSaveAttachment = () => {
    if (!activeAttachItem) return;
    const updated = {
      ...customAttachments,
      [activeAttachItem.id]: {
        imageUrl: attachUrl.trim(),
        imageCaption: attachCaption.trim() || `${activeAttachItem.place || activeAttachItem.title} Spatial Map`,
      },
    };
    setCustomAttachments(updated);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('pq_studio_attachments', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    setActiveAttachItem(null);
  };

  const handleRemoveAttachment = (id) => {
    const updated = { ...customAttachments };
    delete updated[id];
    setCustomAttachments(updated);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('pq_studio_attachments', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
  };

  const openAttachModal = (item) => {
    const existing = customAttachments[item.id] || {};
    setAttachUrl(existing.imageUrl || item.imageUrl || '');
    setAttachCaption(existing.imageCaption || item.imageCaption || '');
    setActiveAttachItem(item);
  };

  // Selection Handlers
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAllVisible = () => {
    const visibleIds = items.map((i) => i.id);
    setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  // Launch Presenter URL Builder
  const getLaunchUrl = (ids = selectedIds) => {
    return `/admin/studio/present?mode=mapping&mappingIds=${ids.join(',')}`;
  };

  const handleLaunchBroadcast = (ids = selectedIds) => {
    if (ids.length === 0) return;
    window.open(getLaunchUrl(ids), '_blank');
  };

  return (
    <div className="pq-map-studio-root">
      {/* Top Header */}
      <header className="pq-map-studio-head">
        <div className="pq-map-head-left">
          <div className="pq-map-badge-icon">
            <Compass size={28} />
          </div>
          <div>
            <h1 className="pq-map-studio-title">Mapping Lecture Studio</h1>
            <p className="pq-map-studio-sub">
              Broadcast-ready spatial decks covering Static Atlas, Places in News (PIN), and Mapping PYQs with XP-Pen boundary tracing.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            href="/admin/studio"
            style={{
              padding: '10px 16px',
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#cbd5e1',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <ArrowLeft size={16} />
            <span>Studio Hub</span>
          </Link>
        </div>
      </header>

      {/* 2-Column Layout: Left Filter Sidebar + Right Main Content */}
      <div className="pq-map-workspace-layout">
        {sidebarOpen && (
          <aside className="pq-map-sidebar">
            <div className="pq-map-sidebar-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Filter size={18} color="#34d399" />
                <span style={{ fontSize: 15, fontWeight: 800, color: '#f8fafc' }}>Filters</span>
                {activeFilterCount > 0 && (
                  <span style={{ background: '#34d399', color: '#022c22', fontSize: 11.5, fontWeight: 900, padding: '2px 7px', borderRadius: 999 }}>
                    {activeFilterCount}
                  </span>
                )}
              </div>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setPillar('ALL');
                    setTier('ALL');
                    setCategory('ALL');
                    setSubject('ALL');
                    setYear('ALL');
                  }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.12)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 8,
                    padding: '4px 10px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Reset All
                </button>
              )}
            </div>

            <div className="pq-map-filter-grid">
              {/* 4-Pillar User Flow Filter */}
              <div className="pq-map-filter-group">
                <label className="pq-map-filter-label">Mapping Pillar</label>
                <select
                  value={pillar}
                  onChange={(e) => setPillar(e.target.value)}
                  className="pq-map-select"
                >
                  {PILLAR_TABS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label} ({stats[t.countKey] ?? 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* PIN Tier Filter */}
              <div className="pq-map-filter-group">
                <label className="pq-map-filter-label">PIN Tier</label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value)}
                  className="pq-map-select"
                >
                  <option value="ALL">All Tiers</option>
                  <option value="master">Master Atlas ({stats.masterPinCount ?? 0})</option>
                  <option value="daily">Daily PIN ({stats.dailyPinCount ?? 0})</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="pq-map-filter-group">
                <label className="pq-map-filter-label">Syllabus Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="pq-map-select"
                >
                  {(taxonomy.mapCategories?.length > 0
                    ? [{ value: 'ALL', label: 'All Mapping Categories' }, ...taxonomy.mapCategories.map((c) => ({ value: c, label: c }))]
                    : MAPPING_CATEGORIES
                  ).map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Filter (for Question PYQs) */}
              <div className="pq-map-filter-group">
                <label className="pq-map-filter-label">PYQ Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="pq-map-select"
                >
                  <option value="ALL">All Subjects</option>
                  {(taxonomy.subjects?.length > 0
                    ? taxonomy.subjects
                    : ['Geography', 'Environment', 'Art & Culture', 'Ancient History', 'Medieval History', 'Modern History', 'Agriculture']
                  ).map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Filter */}
              <div className="pq-map-filter-group">
                <label className="pq-map-filter-label">Exam / Target Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="pq-map-select"
                >
                  <option value="ALL">All Years</option>
                  {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018].map((y) => (
                    <option key={y} value={String(y)}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* Page Limit */}
              <div className="pq-map-filter-group">
                <label className="pq-map-filter-label">Display Limit</label>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="pq-map-select"
                >
                  <option value={25}>25 Items</option>
                  <option value={50}>50 Items</option>
                  <option value={100}>100 Items</option>
                </select>
              </div>
            </div>
          </aside>
        )}

        <main className="pq-map-main">
          {/* 4-Pillar Quick Switcher Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            {PILLAR_TABS.map((tab) => {
              const isActive = pillar === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPillar(tab.id)}
                  style={{
                    padding: '7px 13px',
                    borderRadius: 999,
                    border: isActive ? '1px solid #34d399' : '1px solid rgba(148, 163, 184, 0.25)',
                    background: isActive ? 'rgba(16, 185, 129, 0.16)' : 'rgba(15, 23, 42, 0.6)',
                    color: isActive ? '#34d399' : '#cbd5e1',
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {tab.label} ({stats[tab.countKey] ?? 0})
                </button>
              );
            })}
          </div>
          <div className="pq-map-top-search-bar">
            <button
              type="button"
              onClick={() => setSidebarOpen(prev => !prev)}
              className="pq-map-btn-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 14px' }}
              title="Toggle Filter Sidebar"
            >
              <Filter size={16} color="#34d399" />
              <span>{sidebarOpen ? 'Hide Filters' : 'Filters'}</span>
            </button>

            <div className="pq-map-search-box">
              <Search size={18} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search by place name, tributary, national park, coordinates, border, or news hook..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pq-map-search-input"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

      {/* Bulk Action & Queue Control Bar */}
      <div className="pq-map-action-bar">
        <div className="pq-map-action-left">
          <button
            type="button"
            onClick={selectAllVisible}
            className="pq-map-btn-outline"
          >
            <CheckSquare size={14} />
            <span>Select Visible ({items.length})</span>
          </button>

          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={clearSelection}
              className="pq-map-btn-clear"
            >
              <Square size={14} />
              <span>Clear Selection ({selectedIds.length})</span>
            </button>
          )}

          <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, marginLeft: 8 }}>
            Showing {items.length} of {total} locations
          </span>
        </div>

        <div>
          <button
            type="button"
            onClick={() => handleLaunchBroadcast()}
            disabled={selectedIds.length === 0}
            className="pq-map-launch-btn"
          >
            <Play size={16} fill="currentColor" />
            <span>Launch Mapping Broadcast Studio ({selectedIds.length})</span>
          </button>
        </div>
      </div>

      {/* Cards List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Loading spatial features...</div>
          <div style={{ fontSize: 13 }}>Fetching static atlas nodes, places in news, and PYQs</div>
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No mapping nodes found</div>
          <div style={{ fontSize: 13 }}>Try broadening your search query or reset the category filters.</div>
        </div>
      ) : (
        <div className="pq-map-cards-list">
          {items.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            const hasAttachment = Boolean(customAttachments[item.id]?.imageUrl || item.imageUrl);
            const isIndia = (item.regionScope || '').toLowerCase() === 'india';

            return (
              <div
                key={item.id}
                className={`pq-map-card ${isSelected ? 'is-selected' : ''}`}
              >
                {/* Card Header & Badges */}
                <div className="pq-map-card-head">
                  <div className="pq-map-card-meta">
                    <button
                      type="button"
                      onClick={() => toggleSelect(item.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        color: isSelected ? '#34d399' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                    </button>

                    <span className={`pq-badge ${isIndia ? 'pq-badge-scope-india' : 'pq-badge-scope-world'}`}>
                      {item.regionScope || 'India'}
                    </span>

                    <span className={`pq-badge pq-badge-source-${(item.sourceType || 'static').toLowerCase()}`}>
                      {item.pillar === 'INDIA_STATIC'
                        ? 'India Static'
                        : item.pillar === 'WORLD_STATIC'
                        ? 'World Static'
                        : item.pillar === 'PIN'
                        ? item.isMaster
                          ? 'PIN · Master'
                          : 'PIN · Daily'
                        : item.sourceType === 'ORG'
                        ? 'IR Organisation'
                        : item.pillar === 'IR'
                        ? 'IR Mapping'
                        : 'Mapping PYQ'}
                    </span>

                    {Array.isArray(item.resolvedPYQs) && item.resolvedPYQs.length > 0 && (
                      <span className="pq-badge pq-badge-category">
                        {item.resolvedPYQs.length} Linked PYQ{item.resolvedPYQs.length > 1 ? 's' : ''}
                      </span>
                    )}

                    {Array.isArray(item.category) && item.category[0] && (
                      <span className="pq-badge pq-badge-category">
                        {item.category[0]}
                      </span>
                    )}
                  </div>

                  {item.coordinates && (
                    <div className="pq-map-coord-pill">
                      <Globe size={13} />
                      <span>{Number(item.coordinates.lat).toFixed(2)}° N, {Number(item.coordinates.lng).toFixed(2)}° E</span>
                    </div>
                  )}
                </div>

                {/* Card Title & Location Subtitle */}
                <div>
                  <h3 className="pq-map-place-title">
                    <MapPin size={20} color="#34d399" />
                    <span>{item.place || item.title}</span>
                  </h3>
                  <div className="pq-map-location-sub">
                    <span>{item.locationText || item.placeType || 'Geographical feature'}</span>
                    {Array.isArray(item.aliases) && item.aliases.length > 0 && (
                      <span style={{ color: '#64748b' }}>
                        · Also known as / tributaries: {item.aliases.slice(0, 4).join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Facts or News Hook Preview */}
                {(item.staticFacts?.length > 0 || item.newsHook || item.stem) && (
                  <div className="pq-map-facts-preview">
                    {item.stem && (
                      <div>
                        <strong>Stem:</strong> {item.stem.substring(0, 220)}...
                      </div>
                    )}
                    {item.newsHook && (
                      <div style={{ color: '#f87171' }}>
                        <strong>Contemporary Context:</strong> {item.newsHook}
                      </div>
                    )}
                    {Array.isArray(item.staticFacts) && item.staticFacts.length > 0 && (
                      <div>
                        <strong>Key Physical Facts:</strong> {item.staticFacts[0]}
                      </div>
                    )}
                  </div>
                )}

                {/* Card Footer Actions */}
                <div className="pq-map-card-foot">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => openAttachModal(item)}
                      className={`pq-map-attach-btn ${hasAttachment ? 'has-attachment' : ''}`}
                    >
                      <ImageIcon size={14} />
                      <span>{hasAttachment ? 'Map Slide Attached ✓' : 'Attach Map Slide / Diagram'}</span>
                    </button>

                    {hasAttachment && customAttachments[item.id] && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(item.id)}
                        style={{ background: 'transparent', border: 'none', color: '#f87171', fontSize: 12, cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                      type="button"
                      onClick={() => handleLaunchBroadcast([item.id])}
                      className="pq-map-present-solo-btn"
                      title="Open this location in 1080p Broadcast Presenter"
                    >
                      <Play size={13} fill="currentColor" />
                      <span>Present Solo</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </main>
      </div>

      {/* Floating Deck Dock at Bottom of Screen */}
      {selectedIds.length > 0 && (
        <aside className="pq-map-floating-dock" aria-label="Selected locations queue">
          <div className="pq-map-floating-info">
            <div className="pq-map-floating-count">{selectedIds.length}</div>
            <span>Locations queued for recording</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={clearSelection}
              className="pq-map-btn-clear"
              style={{ padding: '8px 14px' }}
            >
              Clear
            </button>

            <button
              type="button"
              onClick={() => handleLaunchBroadcast()}
              className="pq-map-launch-btn"
              style={{ padding: '10px 20px', fontSize: 14 }}
            >
              <Play size={15} fill="currentColor" />
              <span>Launch Mapping Studio Deck</span>
            </button>
          </div>
        </aside>
      )}

      {/* Map Ingestion / Attachment Modal */}
      {activeAttachItem && (
        <div className="pq-map-modal-overlay" onClick={() => setActiveAttachItem(null)}>
          <div className="pq-map-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pq-map-modal-head">
              <h3 className="pq-map-modal-title">
                Attach Map Slide: {activeAttachItem.place || activeAttachItem.title}
              </h3>
              <button
                type="button"
                onClick={() => setActiveAttachItem(null)}
                className="pq-map-modal-close"
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: 13.5, color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
              Attach a high-resolution satellite image, topographic map, or geopolitical diagram for this location. It will automatically render as Stage 2 in your 1080p recording deck.
            </p>

            <div className="pq-map-modal-field">
              <label className="pq-map-modal-label">Image or Diagram URL</label>
              <input
                type="text"
                placeholder="https://... or /maps/ganga-basin.png"
                value={attachUrl}
                onChange={(e) => setAttachUrl(e.target.value)}
                className="pq-map-modal-input"
              />
            </div>

            <div className="pq-map-modal-field">
              <label className="pq-map-modal-label">Slide Caption</label>
              <input
                type="text"
                placeholder="e.g. Ganga River Basin &amp; Left-Bank Tributaries"
                value={attachCaption}
                onChange={(e) => setAttachCaption(e.target.value)}
                className="pq-map-modal-input"
              />
            </div>

            {attachUrl && (
              <div className="pq-map-modal-preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={attachUrl}
                  alt="Preview"
                  style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 200, objectFit: 'contain' }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            )}

            <div className="pq-map-modal-actions">
              <button
                type="button"
                onClick={() => setActiveAttachItem(null)}
                className="pq-map-btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAttachment}
                disabled={!attachUrl.trim()}
                className="pq-map-launch-btn"
                style={{ padding: '8px 18px', fontSize: 13.5 }}
              >
                Save Attachment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
